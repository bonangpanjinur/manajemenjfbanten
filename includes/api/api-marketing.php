<?php
// File: includes/api/api-marketing.php
// Menggunakan CRUD Controller untuk mengelola Leads dan Kampanye.

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

// --- 1. Controller untuk KAMPANYE (Endpoint: /marketing/campaigns) ---

$campaigns_schema = [
    'name'       => ['type' => 'string', 'required' => true, 'sanitize_callback' => 'sanitize_text_field'],
    'type'       => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_text_field'],
    'start_date' => ['type' => 'string', 'format' => 'date', 'required' => false],
    'end_date'   => ['type' => 'string', 'format' => 'date', 'required' => false],
    'budget'     => ['type' => 'number', 'required' => false],
    'status'     => ['type' => 'string', 'required' => false, 'default' => 'planned', 'enum' => ['planned', 'active', 'completed']],
];

$marketing_permissions = [
    'get_items'    => ['owner', 'marketing_staff', 'admin_staff'],
    'get_item'     => ['owner', 'marketing_staff', 'admin_staff'],
    'create_item'  => ['owner', 'marketing_staff'],
    'update_item'  => ['owner', 'marketing_staff'],
    'delete_item'  => ['owner'],
];

new UMH_CRUD_Controller('marketing/campaigns', 'umh_marketing_campaigns', $campaigns_schema, $marketing_permissions);


// --- 2. Controller untuk LEADS (Endpoint: /marketing/leads) ---

$leads_schema = [
    'campaign_id'         => ['type' => 'integer', 'required' => false, 'sanitize_callback' => 'absint'],
    'full_name'           => ['type' => 'string', 'required' => true, 'sanitize_callback' => 'sanitize_text_field'],
    'email'               => ['type' => 'string', 'format' => 'email', 'required' => false, 'sanitize_callback' => 'sanitize_email'],
    'phone'               => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_text_field'],
    'source'              => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_text_field'],
    'status'              => ['type' => 'string', 'required' => false, 'default' => 'new', 'enum' => ['new', 'contacted', 'qualified', 'unqualified', 'converted']],
    'assigned_to_user_id' => ['type' => 'integer', 'required' => false, 'sanitize_callback' => 'absint'],
];

// Izinnya sama dengan kampanye
new UMH_CRUD_Controller('marketing/leads', 'umh_leads', $leads_schema, $marketing_permissions);