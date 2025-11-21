<?php
/**
 * Admin Cleanup & Restrictions
 * Menangani pembatasan akses menu WP untuk user non-admin.
 */

if ( ! defined( 'ABSPATH' ) ) exit;

class UMH_Admin_Cleanup {

    public function __construct() {
        // 1. Hapus Menu Item untuk Non-Admin
        add_action('admin_menu', [$this, 'restrict_admin_menus'], 999);
        
        // 2. Sembunyikan Admin Bar (Bar Hitam Diatas)
        add_action('after_setup_theme', [$this, 'remove_admin_bar']);
        
        // 3. Redirect Dashboard WP ke Plugin App
        add_action('admin_init', [$this, 'redirect_dashboard']);

        // 4. CSS Tambahan untuk menyembunyikan elemen sisa (Footer WP, Update Notice)
        add_action('admin_head', [$this, 'clean_admin_ui']);
        
        // 5. Custom Login Screen (Opsional - agar login WP terlihat pro)
        add_action('login_enqueue_scripts', [$this, 'custom_login_logo']);
    }

    /**
     * Hapus semua menu WP kecuali plugin kita untuk Non-Admin
     */
    public function restrict_admin_menus() {
        // Jika user adalah Administrator, JANGAN lakukan apa-apa (biarkan menu tampil)
        if (current_user_can('administrator')) {
            return;
        }

        global $menu;
        
        // Slug menu plugin utama Anda (sesuai yang ada di umroh-manager-hybrid.php)
        // Biasanya 'umrah-manager' atau slug halaman utama plugin
        $allowed_menu_slug = 'umrah-manager'; 

        // Loop semua menu dan hapus yang bukan plugin kita
        // Kita ambil elemen menu yang mau dihapus
        $restricted_menus = [
            'index.php',                  // Dashboard
            'jetpack',                    // Jetpack
            'edit.php',                   // Posts
            'upload.php',                 // Media
            'edit.php?post_type=page',    // Pages
            'edit-comments.php',          // Comments
            'themes.php',                 // Appearance
            'plugins.php',                // Plugins
            'users.php',                  // Users
            'tools.php',                  // Tools
            'options-general.php',        // Settings
            'profile.php'                 // Profile (Opsional, mungkin mau disisakan)
        ];

        foreach ($restricted_menus as $page) {
            remove_menu_page($page);
        }

        // Hapus separator (garis pemisah menu)
        global $menu;
        if (isset($menu)) {
            foreach ($menu as $key => $item) {
                // Hapus jika bukan menu kita (Logic kasar untuk membersihkan sisa-sisa)
                if (isset($item[2]) && strpos($item[2], 'umrah-manager') === false && $item[2] != 'profile.php') {
                    // remove_menu_page($item[2]); // Hati-hati dengan ini
                }
            }
        }
    }

    /**
     * Sembunyikan Admin Bar untuk Non-Admin
     */
    public function remove_admin_bar() {
        if (!current_user_can('administrator') && !is_admin()) {
            show_admin_bar(false);
        }
        // Di dalam admin area juga sembunyikan
        if (!current_user_can('administrator') && is_admin()) {
            add_filter('show_admin_bar', '__return_false');
        }
    }

    /**
     * Redirect user login langsung ke halaman Aplikasi, bukan Dashboard WP
     */
    public function redirect_dashboard() {
        if (current_user_can('administrator')) {
            return;
        }

        global $pagenow;
        
        // Jika user mengakses index.php (Dashboard default), lempar ke halaman plugin
        if ($pagenow == 'index.php') {
            wp_redirect(admin_url('admin.php?page=umrah-manager'));
            exit;
        }
    }

    /**
     * CSS untuk menyembunyikan Footer WP & Update Notice
     */
    public function clean_admin_ui() {
        if (current_user_can('administrator')) {
            return;
        }
        ?>
        <style>
            /* Sembunyikan Footer "Thank you for creating with WordPress" */
            #wpfooter { display: none !important; }
            
            /* Sembunyikan Update Notices */
            .update-nag, .notice, .updated { display: none !important; }
            
            /* Sembunyikan tab "Help" & "Screen Options" di atas */
            #contextual-help-link-wrap, #screen-options-link-wrap { display: none !important; }
            
            /* Perbaiki tampilan agar full height tanpa admin bar */
            html.wp-toolbar { padding-top: 0 !important; }
            #wpcontent, #wpfooter { margin-left: 0px; } /* Jika mau menghilangkan sidebar WP sepenuhnya, atur ini */
            
            /* Opsional: Kustomisasi Sidebar WP agar hanya ikon */
            /* #adminmenu { margin-top: 20px; } */
        </style>
        <?php
    }

    /**
     * Ganti Logo Login WordPress dengan Logo Travel (Opsional)
     */
    public function custom_login_logo() {
        ?>
        <style type="text/css">
            /* Ganti URL background-image dengan logo perusahaan Anda */
            #login h1 a, .login h1 a {
                background-image: url(<?php echo UMH_PLUGIN_URL . 'assets/images/logo.png'; ?>); 
                height: 65px;
                width: 320px;
                background-size: contain;
                background-repeat: no-repeat;
                padding-bottom: 30px;
            }
            body.login {
                background-color: #f1f5f9; /* Ganti warna background login */
            }
        </style>
        <?php
    }
}

// Inisialisasi Class
new UMH_Admin_Cleanup();