/**
 * Konstanta Role User
 * Sesuai permintaan: Owner, Karyawan, Cabang, Agen, Jemaah
 */
export const ROLES = {
  OWNER: 'owner',           // Akses Penuh
  STAFF: 'karyawan',        // Akses Operasional (Manifest, Jamaah, Inventory)
  BRANCH: 'cabang',         // Akses Manajemen Cabang (Keuangan Cabang, User Cabang)
  AGENT: 'agen',            // Akses Input Jamaah & Cek Komisi
  JAMAAH: 'jemaah'          // Akses Lihat Status & Pembayaran Pribadi
};

/**
 * Mapping Permission (Siapa boleh akses fitur apa)
 */
export const PERMISSIONS = {
  [ROLES.OWNER]: ['all'],
  [ROLES.STAFF]: ['dashboard', 'jamaah', 'manifest', 'inventory', 'rooming', 'attendance'],
  [ROLES.BRANCH]: ['dashboard', 'jamaah', 'finance_branch', 'users_branch', 'manifest'],
  [ROLES.AGENT]: ['dashboard_agent', 'jamaah_input', 'commission_view'],
  [ROLES.JAMAAH]: ['portal_view', 'payment_history']
};

/**
 * Helper untuk mengecek akses
 */
export const hasAccess = (userRole, requiredRole) => {
  if (!userRole) return false;
  if (userRole === ROLES.OWNER) return true; // Owner bypass semua
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(userRole);
  }
  return userRole === requiredRole;
};