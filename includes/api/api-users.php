<?php
// File: includes/api/api-users.php
// Mengelola login, auto-login, dan CRUD pengguna headless.
// CATATAN: File ini sepertinya tidak digunakan oleh aplikasi React,
// karena React app menggunakan autentikasi cookie WP.
// Namun, perbaikan permission tetap dilakukan.

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

add_action('rest_api_init', 'umh_register_user_api_routes');

function umh_register_user_api_routes() {
    $namespace = 'umh/v1';

    // (Publik) Endpoint untuk login form kustom (Owner/Karyawan)
    register_rest_route($namespace, '/users/login', [
        'methods' => WP_REST_Server::CREATABLE,
        'callback' => 'umh_login_user',
        'permission_callback' => '__return_true', // Publik
    ]);

    // (Aman) Endpoint untuk auto-login Super Admin
    register_rest_route($namespace, '/auth/wp-login', [
        'methods' => WP_REST_Server::CREATABLE,
        'callback' => 'umh_handle_wp_admin_login',
        // Hanya Super Admin (yang login via cookie WP) yang bisa memanggil ini
        'permission_callback' => function () {
            // --- PERBAIKAN: Menggunakan fungsi umh_get_current_user_context ---
            $context = umh_get_current_user_context();
            return $context['role'] === 'administrator';
            // --- AKHIR PERBAIKAN ---
        },
    ]);

    // (Aman) Endpoint untuk verifikasi token (GET /me)
    register_rest_route($namespace, '/users/me', [
        'methods' => WP_REST_Server::READABLE,
        'callback' => 'umh_get_current_user_by_token',
        // --- PERBAIKAN (Kategori 1): Bungkus panggilan dalam anonymous function ---
        'permission_callback' => function($request) { 
            return umh_check_api_permission($request, []); // Cukup terautentikasi
        },
        // --- AKHIR PERBAIKAN ---
    ]);

    // (Aman) CRUD untuk mengelola pengguna headless
    register_rest_route($namespace, '/users', [
        [
            'methods' => WP_REST_Server::READABLE,
            'callback' => 'umh_get_all_users',
            // --- PERBAIKAN (Kategori 1): Bungkus panggilan dalam anonymous function ---
            'permission_callback' => function($request) { 
                return umh_check_api_permission($request, ['owner', 'admin_staff', 'hr_staff']); 
            },
            // --- AKHIR PERBAIKAN ---
        ],
        [
            'methods' => WP_REST_Server::CREATABLE,
            'callback' => 'umh_create_user',
            // --- PERBAIKAN (Kategori 1): Bungkus panggilan dalam anonymous function ---
            'permission_callback' => function($request) { 
                return umh_check_api_permission($request, ['owner', 'admin_staff', 'hr_staff']); 
            },
            // --- AKHIR PERBAIKAN ---
        ],
    ]);

    register_rest_route($namespace, '/users/(?P<id>\d+)', [
        [
            'methods' => WP_REST_Server::READABLE,
            'callback' => 'umh_get_user_by_id',
            // --- PERBAIKAN (Kategori 1): Bungkus panggilan dalam anonymous function ---
            'permission_callback' => function($request) { 
                return umh_check_api_permission($request, ['owner', 'admin_staff', 'hr_staff']); 
            },
            // --- AKHIR PERBAIKAN ---
        ],
        [
            'methods' => WP_REST_Server::EDITABLE,
            'callback' => 'umh_update_user',
            // --- PERBAIKAN (Kategori 1): Bungkus panggilan dalam anonymous function ---
            'permission_callback' => function($request) { 
                return umh_check_api_permission($request, ['owner', 'admin_staff', 'hr_staff']); 
            },
            // --- AKHIR PERBAIKAN ---
        ],
        [
            'methods' => WP_REST_Server::DELETABLE,
            'callback' => 'umh_delete_user',
            // --- PERBAIKAN (Kategori 1): Bungkus panggilan dalam anonymous function ---
            'permission_callback' => function($request) { 
                return umh_check_api_permission($request, ['owner']); 
            },
            // --- AKHIR PERBAIKAN ---
        ],
    ]);
}

/**
 * [PERBAIKAN] Callback untuk login kustom (form login React).
 * Sekarang menggunakan Email, bukan Username.
 */
function umh_login_user(WP_REST_Request $request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'umh_users';
    
    $params = $request->get_json_params();
    $email = sanitize_email($params['email'] ?? '');
    $password = $params['password'] ?? '';

    if (empty($email) || empty($password)) {
        return new WP_Error('invalid_credentials', 'Email dan password tidak boleh kosong.', ['status' => 400]);
    }

    // Cari berdasarkan email
    $user = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_name WHERE email = %s", $email));

    if (!$user) {
        return new WP_Error('invalid_email', 'Email tidak ditemukan.', ['status' => 403]);
    }

    // Verifikasi password
    if (password_verify($password, $user->password_hash)) {
        // Buat token
        $token = bin2hex(random_bytes(32));
        $expires = new DateTime('+24 hours');
        
        // Simpan token ke database
        $wpdb->update(
            $table_name,
            [
                'auth_token' => $token,
                'token_expires' => $expires->format('Y-m-d H:i:s')
            ],
            ['id' => $user->id],
            ['%s', '%s'],
            ['%d']
        );

        // Kirim token dan data user (tanpa hash password)
        $user_data = [
            'id' => $user->id,
            'email' => $user->email,
            'full_name' => $user->full_name,
            'role' => $user->role,
        ];

        return new WP_REST_Response(['token' => $token, 'user' => $user_data], 200);
    } else {
        return new WP_Error('invalid_password', 'Password salah.', ['status' => 403]);
    }
}

/**
 * [PERBAIKAN BESAR] Callback untuk auto-login Super Admin (WP Login = App Login).
 */
function umh_handle_wp_admin_login(WP_REST_Request $request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'umh_users';

    // Kita sudah tahu user ini adalah admin karena 'permission_callback'
    $wp_user = wp_get_current_user();
    
    if (!$wp_user || $wp_user->ID === 0) {
        return new WP_Error('not_logged_in', 'User WP tidak terdeteksi.', ['status' => 401]);
    }

    // 1. Coba cari user di tabel umh_users berdasarkan wp_user_id
    $user = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_name WHERE wp_user_id = %d", $wp_user->ID));

    if (!$user) {
        // 2. Jika tidak ada, coba cari berdasarkan email (untuk migrasi)
        $user = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_name WHERE email = %s", $wp_user->user_email));

        if (!$user) {
            // 3. Jika tidak ada sama sekali, buat user baru di tabel umh_users
            $wpdb->insert(
                $table_name,
                [
                    'wp_user_id' => $wp_user->ID,
                    'email' => $wp_user->user_email,
                    'full_name' => $wp_user->display_name,
                    'role' => 'administrator', // PERBAIKAN: Gunakan role 'administrator'
                    'password_hash' => '', // Tidak perlu password, auth via WP
                    'status' => 'active',
                    'created_at' => current_time('mysql'),
                    'updated_at' => current_time('mysql'),
                ],
                ['%d', '%s', '%s', '%s', '%s', '%s', '%s', '%s']
            );
            $user_id = $wpdb->insert_id;
            // Ambil data user yang baru dibuat
            $user = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_name WHERE id = %d", $user_id));
        
        } else {
            // 4. Jika user email-nya ada, update datanya (tautkan wp_user_id dan set role)
            $wpdb->update(
                $table_name,
                [
                    'wp_user_id' => $wp_user->ID,
                    'role' => 'administrator', // PERBAIKAN: Gunakan role 'administrator'
                    'full_name' => $wp_user->display_name, // Update nama juga
                ],
                ['id' => $user->id]
            );
            $user->role = 'administrator'; // Update objek lokal
            $user->full_name = $wp_user->display_name;
            $user->wp_user_id = $wp_user->ID;
        }
    }

    // 5. Buat token baru
    $token = bin2hex(random_bytes(32));
    $expires = new DateTime('+24 hours');

    // 6. Simpan token ke database
    $wpdb->update(
        $table_name,
        [
            'auth_token' => $token,
            'token_expires' => $expires->format('Y-m-d H:i:s')
        ],
        ['id' => $user->id],
        ['%s', '%s'],
        ['%d']
    );

    // 7. Kirim token dan data user (tanpa hash password)
    $user_data = [
        'id' => $user->id,
        'email' => $user->email,
        'full_name' => $user->full_name,
        'role' => $user->role,
    ];

    return new WP_REST_Response(['token' => $token, 'user' => $user_data], 200);
}

/**
 * [PERBAIKAN] Callback untuk GET /me (verifikasi token)
 * Mengambil data user berdasarkan token yang valid.
 */
function umh_get_current_user_by_token(WP_REST_Request $request) {
    // Fungsi umh_check_api_permission sudah memvalidasi token ATAU cookie WP.
    // Kita panggil umh_get_current_user_context untuk mendapatkan data user.
    // --- PERBAIKAN: Panggil umh_get_current_user_context() tanpa argumen ---
    $context = umh_get_current_user_context();
    // --- AKHIR PERBAIKAN ---

    if (is_wp_error($context) || $context['id'] === 0) {
        return new WP_Error('invalid_token', 'Token tidak valid atau sesi telah berakhir.', ['status' => 401]);
    }

    // Kirim kembali data konteks yang sudah bersih
    return new WP_REST_Response([
        'id' => $context['id'],
        'email' => $context['email'],
        'full_name' => $context['full_name'],
        'role' => $context['role'],
    ], 200);
}


// --- Callback CRUD (Diperbarui untuk skema baru) ---

function umh_get_all_users(WP_REST_Request $request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'umh_users';
    // Hanya tampilkan user headless, jangan tampilkan super admin
    $results = $wpdb->get_results("SELECT id, email, full_name, role, phone, status, created_at FROM $table_name WHERE wp_user_id IS NULL");
    return new WP_REST_Response($results, 200);
}

/**
 * [PERBAIKAN] Membuat user headless baru (Owner, Karyawan, Sopir, dll)
 */
function umh_create_user(WP_REST_Request $request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'umh_users';
    
    $params = $request->get_json_params();
    $email = sanitize_email($params['email'] ?? '');
    $full_name = sanitize_text_field($params['full_name'] ?? '');
    $role = sanitize_text_field($params['role'] ?? 'karyawan'); // Role dinamis
    $password = $params['password'] ?? '';
    $phone = sanitize_text_field($params['phone'] ?? '');

    if (empty($email) || empty($full_name) || empty($role) || empty($password)) {
        return new WP_Error('missing_params', 'Email, Nama Lengkap, Role, dan Password tidak boleh kosong.', ['status' => 400]);
    }

    // Cek jika email sudah ada
    $exists = $wpdb->get_var($wpdb->prepare("SELECT id FROM $table_name WHERE email = %s", $email));
    if ($exists) {
        return new WP_Error('email_exists', 'Email sudah terdaftar.', ['status' => 409]);
    }

    $password_hash = password_hash($password, PASSWORD_DEFAULT);

    $result = $wpdb->insert(
        $table_name,
        [
            'email' => $email,
            'full_name' => $full_name,
            'role' => $role, // Role dinamis dari input
            'password_hash' => $password_hash,
            'phone' => $phone,
            'status' => 'active',
            'created_at' => current_time('mysql'),
            'updated_at' => current_time('mysql'),
        ],
        ['%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s']
    );
    
    if ($result) {
         $new_user_id = $wpdb->insert_id;
         $new_user = $wpdb->get_row($wpdb->prepare("SELECT id, email, full_name, role, phone, status, created_at FROM $table_name WHERE id = %d", $new_user_id));
        return new WP_REST_Response($new_user, 201);
    } else {
        return new WP_Error('create_failed', 'Gagal membuat user.', ['status' => 500, 'db_error' => $wpdb->last_error]);
    }
}

function umh_get_user_by_id(WP_REST_Request $request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'umh_users';
    $id = (int) $request['id'];

    $user = $wpdb->get_row($wpdb->prepare("SELECT id, email, full_name, role, phone, status, created_at FROM $table_name WHERE id = %d", $id));

    if (!$user) {
        return new WP_Error('not_found', 'User tidak ditemukan.', ['status' => 404]);
    }

    return new WP_REST_Response($user, 200);
}

function umh_update_user(WP_REST_Request $request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'umh_users';
    $id = (int) $request['id'];

    $user = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_name WHERE id = %d", $id));
    if (!$user) {
        return new WP_Error('not_found', 'User tidak ditemukan.', ['status' => 404]);
    }

    // Super admin tidak boleh diedit via API ini
    if (!empty($user->wp_user_id) || $user->role === 'administrator') {
         return new WP_Error('permission_denied', 'Akun Super Admin tidak dapat diubah dari sini.', ['status' => 403]);
    }

    $params = $request->get_json_params();
    $update_data = [];
    $update_formats = [];

    if (isset($params['full_name'])) {
        $update_data['full_name'] = sanitize_text_field($params['full_name']);
        $update_formats[] = '%s';
    }
    if (isset($params['email'])) {
        $update_data['email'] = sanitize_email($params['email']);
        $update_formats[] = '%s';
    }
    if (isset($params['role'])) {
        $update_data['role'] = sanitize_text_field($params['role']);
        $update_formats[] = '%s';
    }
     if (isset($params['phone'])) {
        $update_data['phone'] = sanitize_text_field($params['phone']);
        $update_formats[] = '%s';
    }
     if (isset($params['status'])) {
        $update_data['status'] = sanitize_text_field($params['status']);
        $update_formats[] = '%s';
    }
    if (isset($params['password']) && !empty($params['password'])) {
        $update_data['password_hash'] = password_hash($params['password'], PASSWORD_DEFAULT);
        $update_formats[] = '%s';
    }

    if (empty($update_data)) {
        return new WP_Error('no_data', 'Tidak ada data untuk diupdate.', ['status' => 400]);
    }

    $update_data['updated_at'] = current_time('mysql');
    $update_formats[] = '%s';

    $wpdb->update(
        $table_name,
        $update_data,
        ['id' => $id],
        $update_formats,
        ['%d']
    );

    $updated_user = $wpdb->get_row($wpdb->prepare("SELECT id, email, full_name, role, phone, status, created_at FROM $table_name WHERE id = %d", $id));
    return new WP_REST_Response($updated_user, 200);
}

function umh_delete_user(WP_REST_Request $request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'umh_users';
    $id = (int) $request['id'];

     $user = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_name WHERE id = %d", $id));
    if (!$user) {
        return new WP_Error('not_found', 'User tidak ditemukan.', ['status' => 404]);
    }
    
    // Super admin tidak boleh dihapus via API ini
    if (!empty($user->wp_user_id) || $user->role === 'administrator') {
         return new WP_Error('permission_denied', 'Akun Super Admin tidak dapat dihapus.', ['status' => 403]);
    }

    $result = $wpdb->delete($table_name, ['id' => $id], ['%d']);

    if ($result === false) {
        return new WP_Error('delete_failed', 'Gagal menghapus user.', ['status' => 500]);
    }

    return new WP_REST_Response(['id' => $id, 'message' => 'User berhasil dihapus.'], 200);
}