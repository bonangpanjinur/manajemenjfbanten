<?php
// Lokasi: includes/api/api-packages.php

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

// --- PERBAIKAN (Kategori 2, Poin 3): Buat Controller Kustom untuk Packages ---
/**
 * Custom controller for Packages to handle complex relations
 * (Hotels and Flights) during create/update.
 */
class UMH_Packages_Controller extends UMH_CRUD_Controller {

    /**
     * Create a new package and handle its relations.
     */
    public function create_item($request) {
        $data = $request->get_params();

        // Ambil data relasi
        $hotel_ids = isset($data['hotel_ids']) ? (array) $data['hotel_ids'] : array();
        $flight_ids = isset($data['flight_ids']) ? (array) $data['flight_ids'] : array();

        // Hapus data relasi dari $data utama agar tidak error saat disimpan
        unset($data['hotel_ids'], $data['flight_ids']);
        
        // Buat request baru tanpa data relasi
        $new_request = $request;
        $new_request->set_body(wp_json_encode($data));

        // Panggil metode create_item dari parent
        $response = parent::create_item($new_request);

        if (!is_wp_error($response) && ($response->get_status() === 201 || $response->get_status() === 200)) {
            $response_data = $response->get_data();
            $new_id = $response_data['id'];

            // Simpan relasi
            $this->_umh_update_package_hotels($new_id, $hotel_ids);
            $this->_umh_update_package_flights($new_id, $flight_ids);

            // Ambil data lengkap yang baru (termasuk relasi)
            $get_request = new WP_REST_Request('GET');
            $get_request->set_url_params(array('id' => $new_id));
            return $this->get_item($get_request);
        }

        return $response; // Return error or original response if create failed
    }

    /**
     * Update an existing package and handle its relations.
     */
    public function update_item($request) {
        $id = intval($request['id']);
        $data = $request->get_params();

        // Ambil data relasi
        $hotel_ids = isset($data['hotel_ids']) ? (array) $data['hotel_ids'] : array();
        $flight_ids = isset($data['flight_ids']) ? (array) $data['flight_ids'] : array();

        // Hapus data relasi dari $data utama
        unset($data['hotel_ids'], $data['flight_ids']);

        // Buat request baru tanpa data relasi
        $new_request = $request;
        $new_request->set_body(wp_json_encode($data));
        
        // Panggil metode update_item dari parent
        $response = parent::update_item($new_request);

        if (!is_wp_error($response) && $response->get_status() === 200) {
            // Simpan relasi
            $this->_umh_update_package_hotels($id, $hotel_ids);
            $this->_umh_update_package_flights($id, $flight_ids);

            // Ambil data lengkap yang baru (termasuk relasi)
            $get_request = new WP_REST_Request('GET');
            $get_request->set_url_params(array('id' => $id));
            return $this->get_item($get_request);
        }

        return $response; // Return error or original response if update failed
    }

    /**
     * Get a single item, override to include relations.
     */
    public function get_item($request) {
        $response = parent::get_item($request);

        if (!is_wp_error($response) && $response->get_status() === 200) {
            $data = $response->get_data();
            // $data adalah array, bukan objek
            if (is_array($data) && isset($data['id'])) {
                $id = intval($data['id']);
                global $wpdb;

                // Ambil data hotel bookings
                $hotel_table = $wpdb->prefix . 'umh_hotel_bookings';
                $data['hotel_bookings'] = $wpdb->get_results(
                    $wpdb->prepare("SELECT * FROM $hotel_table WHERE package_id = %d", $id)
                );

                // Ambil data flight bookings
                $flight_table = $wpdb->prefix . 'umh_flight_bookings';
                $data['flight_bookings'] = $wpdb->get_results(
                    $wpdb->prepare("SELECT * FROM $flight_table WHERE package_id = %d", $id)
                );

                $response->set_data($data);
            }
        }

        return $response;
    }

    /**
     * Get items, override to include relations.
     */
    public function get_items($request) {
        $response = parent::get_items($request);

        if (!is_wp_error($response) && $response->get_status() === 200) {
            $data = $response->get_data();
            
            if (is_array($data) && !empty($data)) {
                global $wpdb;
                $hotel_table = $wpdb->prefix . 'umh_hotel_bookings';
                $flight_table = $wpdb->prefix . 'umh_flight_bookings';

                foreach ($data as $key => $item) {
                    // Pastikan item adalah array/objek dengan properti 'id'
                    $item_array = (array) $item;
                    if (isset($item_array['id'])) {
                        $package_id = intval($item_array['id']);
                        
                        // Ambil data hotel bookings
                        $hotel_bookings = $wpdb->get_results(
                            $wpdb->prepare("SELECT * FROM $hotel_table WHERE package_id = %d", $package_id)
                        );

                        // Ambil data flight bookings
                        $flight_bookings = $wpdb->get_results(
                            $wpdb->prepare("SELECT * FROM $flight_table WHERE package_id = %d", $package_id)
                        );
                        
                        // Tambahkan ke hasil
                        if (is_object($data[$key])) {
                            $data[$key]->hotel_bookings = $hotel_bookings;
                            $data[$key]->flight_bookings = $flight_bookings;
                        } elseif (is_array($data[$key])) {
                            $data[$key]['hotel_bookings'] = $hotel_bookings;
                            $data[$key]['flight_bookings'] = $flight_bookings;
                        }
                    }
                }
                $response->set_data($data);
            }
        }

        return $response;
    }
}
// --- AKHIR PERBAIKAN ---


/**
 * Register package API routes.
 *
 * @param string $namespace The API namespace.
 */
function umh_register_packages_api_routes($namespace) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'umh_packages';
    $item_name = 'package'; // 'package'

    // Define permissions
    $permissions = array(
        'get_items' => ['owner', 'admin_staff', 'finance_staff', 'marketing_staff', 'hr_staff'],
        'create_item' => ['owner', 'admin_staff'],
        'get_item' => ['owner', 'admin_staff', 'finance_staff', 'marketing_staff', 'hr_staff'],
        'update_item' => ['owner', 'admin_staff'],
        'delete_item' => ['owner', 'admin_staff'],
    );

    // --- PERBAIKAN (Kategori 2, Poin 3): Gunakan Controller Kustom ---
    // Buat instance CRUD controller kustom
    $crud_controller = new UMH_Packages_Controller($table_name, $item_name, $permissions);
    // --- AKHIR PERBAIKAN ---

    // Register routes
    register_rest_route($namespace, "/{$item_name}s", array(
        array(
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => array($crud_controller, 'get_items'),
            // --- PERBAIKAN (Kategori 1): Menggunakan anonymous function ---
            'permission_callback' => function ($request) use ($permissions) {
                return umh_check_api_permission($request, $permissions['get_items']);
            },
            // --- AKHIR PERBAIKAN ---
        ),
        array(
            'methods'             => WP_REST_Server::CREATABLE,
            'callback'            => array($crud_controller, 'create_item'),
            // --- PERBAIKAN (Kategori 1): Menggunakan anonymous function ---
            'permission_callback' => function ($request) use ($permissions) {
                return umh_check_api_permission($request, $permissions['create_item']);
            },
            // --- AKHIR PERBAIKAN ---
            'args' => $crud_controller->get_endpoint_args_for_item_schema(WP_REST_Server::CREATABLE),
        ),
    ));

    register_rest_route($namespace, "/{$item_name}s/(?P<id>\d+)", array(
        array(
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => array($crud_controller, 'get_item'),
            // --- PERBAIKAN (Kategori 1): Menggunakan anonymous function ---
            'permission_callback' => function ($request) use ($permissions) {
                return umh_check_api_permission($request, $permissions['get_item']);
            },
            // --- AKHIR PERBAIKAN ---
        ),
        array(
            'methods'             => WP_REST_Server::EDITABLE, // Bisa 'POST' atau 'PUT'
            'callback'            => array($crud_controller, 'update_item'),
            // --- PERBAIKAN (Kategori 1): Menggunakan anonymous function ---
            'permission_callback' => function ($request) use ($permissions) {
                return umh_check_api_permission($request, $permissions['update_item']);
            },
            // --- AKHIR PERBAIKAN ---
            'args' => $crud_controller->get_endpoint_args_for_item_schema(WP_REST_Server::EDITABLE),
        ),
        array(
            'methods'             => WP_REST_Server::DELETABLE,
            'callback'            => array($crud_controller, 'delete_item'),
            // --- PERBAIKAN (Kategori 1): Menggunakan anonymous function ---
            'permission_callback' => function ($request) use ($permissions) {
                return umh_check_api_permission($request, $permissions['delete_item']);
            },
            // --- AKHIR PERBAIKAN ---
        ),
    ));
}

// Hook registration
add_action('rest_api_init', function () {
    umh_register_packages_api_routes('umh/v1');
});


// --- PERBAIKAN (Kategori 2, Poin 3): Helper functions ---
/**
 * Helper function to update package-hotel relations.
 * Deletes old relations and inserts new ones.
 */
function _umh_update_package_hotels($package_id, $hotel_ids) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'umh_hotel_bookings';
    $package_id = intval($package_id);

    // 1. Delete old relations for this package
    $wpdb->delete($table_name, array('package_id' => $package_id), array('%d'));

    // 2. Insert new relations
    if (!empty($hotel_ids)) {
        foreach ($hotel_ids as $hotel_id) {
            $wpdb->insert(
                $table_name,
                array(
                    'package_id' => $package_id,
                    'hotel_id'   => intval($hotel_id)
                ),
                array('%d', '%d')
            );
        }
    }
}

/**
 * Helper function to update package-flight relations.
 * Deletes old relations and inserts new ones.
 */
function _umh_update_package_flights($package_id, $flight_ids) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'umh_flight_bookings';
    $package_id = intval($package_id);

    // 1. Delete old relations for this package
    $wpdb->delete($table_name, array('package_id' => $package_id), array('%d'));

    // 2. Insert new relations
    if (!empty($flight_ids)) {
        foreach ($flight_ids as $flight_id) {
            $wpdb->insert(
                $table_name,
                array(
                    'package_id' => $package_id,
                    'flight_id'  => intval($flight_id)
                ),
                array('%d', '%d')
            );
        }
    }
}
// --- PERBAIKAN (Kategori 4): Menghapus kurung kurawal } ekstra di akhir file ---