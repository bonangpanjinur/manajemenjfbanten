<?php

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Enqueue scripts and styles for the React Dashboard
 */
function umroh_manager_enqueue_scripts($hook) {
    // Hanya load di halaman plugin umroh manager
    if (strpos($hook, 'umroh-manager') === false && strpos($hook, 'umroh_manager') === false) {
        return;
    }

    $script_path = plugin_dir_path( __DIR__ ) . 'build/index.js';
    $script_url = plugin_dir_url( __DIR__ ) . 'build/index.js';
    $style_path = plugin_dir_path( __DIR__ ) . 'build/index.css';
    $style_url = plugin_dir_url( __DIR__ ) . 'build/index.css';

    if ( file_exists( $script_path ) ) {
        $asset_file = include( plugin_dir_path( __DIR__ ) . 'build/index.asset.php');
        
        // Enqueue Script utama
        wp_enqueue_script(
            'umroh-manager-app',
            $script_url,
            $asset_file['dependencies'],
            $asset_file['version'],
            true
        );

        // BAGIAN PENTING: Mengirim data dan URL Plugin ke Javascript
        // 'pluginUrl' sangat krusial untuk Lazy Loading di Webpack
        wp_localize_script( 'umroh-manager-app', 'umrohManagerSettings', array(
            'root' => esc_url_raw( rest_url() ),
            'nonce' => wp_create_nonce( 'wp_rest' ),
            'pluginUrl' => plugin_dir_url( __DIR__ ), 
            'assetsUrl' => plugin_dir_url( __DIR__ ) . 'assets/',
            'currentUser' => wp_get_current_user(),
            'siteName' => get_bloginfo( 'name' ),
            'siteUrl' => get_site_url(),
            'dateFormat' => get_option( 'date_format' ),
            'timeFormat' => get_option( 'time_format' )
        ) );

        // Enqueue Style utama
        wp_enqueue_style(
            'umroh-manager-style',
            $style_url,
            array( 'wp-components' ),
            $asset_file['version']
        );
        
        // Enqueue Font/Style tambahan jika diperlukan (misal Roboto atau Tailwind utilities standar)
        // wp_enqueue_style('umroh-manager-fonts', 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap', array(), null);
    }
}
add_action( 'admin_enqueue_scripts', 'umroh_manager_enqueue_scripts' );

/**
 * Render the div container for React App
 */
function umroh_manager_render_dashboard() {
    echo '<div id="umroh-manager-app"></div>';
}