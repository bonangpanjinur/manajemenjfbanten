<?php
// File: includes/api/api-hr.php
// Menggunakan CRUD Controller untuk mengelola HR (Profil, Absensi, Gaji).

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

// --- 1. Controller untuk PROFIL KARYAWAN (Endpoint: /hr/profiles) ---

$profiles_schema = [
    'user_id'           => ['type' => 'integer', 'required' => true, 'sanitize_callback' => 'absint'],
    'position'          => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_text_field'],
    'department'        => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_text_field'],
    'join_date'         => ['type' => 'string', 'format' => 'date', 'required' => false],
    'salary'            => ['type' => 'number', 'required' => false],
    'bank_account_info' => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_textarea_field'],
    'status'            => ['type' => 'string', 'required' => false, 'enum' => ['active', 'on_leave', 'terminated']],
];

$hr_permissions = [
    'get_items'    => ['owner', 'hr_staff'],
    'get_item'     => ['owner', 'hr_staff'],
    'create_item'  => ['owner', 'hr_staff'],
    'update_item'  => ['owner', 'hr_staff'],
    'delete_item'  => ['owner'],
];

new UMH_CRUD_Controller('hr/profiles', 'umh_employee_profiles', $profiles_schema, $hr_permissions);


// --- 2. Controller untuk ABSENSI (Endpoint: /hr/attendance) ---

$attendance_schema = [
    'user_id'         => ['type' => 'integer', 'required' => true, 'sanitize_callback' => 'absint'],
    'check_in'        => ['type' => 'string', 'format' => 'date-time', 'required' => false],
    'check_out'       => ['type' => 'string', 'format' => 'date-time', 'required' => false],
    'attendance_date' => ['type' => 'string', 'format' => 'date', 'required' => true],
    'status'          => ['type' => 'string', 'required' => false, 'enum' => ['present', 'absent', 'late', 'leave']],
    'notes'           => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_textarea_field'],
];

$attendance_permissions = [
    // Semua staf bisa melihat absensi
    'get_items'    => ['owner', 'hr_staff', 'admin_staff', 'finance_staff', 'marketing_staff'],
    'get_item'     => ['owner', 'hr_staff', 'admin_staff', 'finance_staff', 'marketing_staff'],
    // Hanya HR yang bisa menambah/mengubah
    'create_item'  => ['owner', 'hr_staff'],
    'update_item'  => ['owner', 'hr_staff'],
    'delete_item'  => ['owner', 'hr_staff'],
];

new UMH_CRUD_Controller('hr/attendance', 'umh_attendance', $attendance_schema, $attendance_permissions);


// --- 3. Controller untuk GAJI (Endpoint: /hr/payrolls) ---

$payroll_schema = [
    'user_id'          => ['type' => 'integer', 'required' => true, 'sanitize_callback' => 'absint'],
    'pay_period_start' => ['type' => 'string', 'format' => 'date', 'required' => true],
    'pay_period_end'   => ['type' => 'string', 'format' => 'date', 'required' => true],
    'base_salary'      => ['type' => 'number', 'required' => false],
    'bonus'            => ['type' => 'number', 'required' => false],
    'deductions'       => ['type' => 'number', 'required' => false],
    'net_pay'          => ['type' => 'number', 'required' => true],
    'pay_date'         => ['type' => 'string', 'format' => 'date', 'required' => false],
    'status'           => ['type' => 'string', 'required' => false, 'enum' => ['pending', 'paid', 'failed']],
];

$payroll_permissions = [
    'get_items'    => ['owner', 'finance_staff', 'hr_staff'],
    'get_item'     => ['owner', 'finance_staff', 'hr_staff'],
    'create_item'  => ['owner', 'finance_staff'],
    'update_item'  => ['owner', 'finance_staff'],
    'delete_item'  => ['owner', 'finance_staff'],
];

new UMH_CRUD_Controller('hr/payrolls', 'umh_payrolls', $payroll_schema, $payroll_permissions);