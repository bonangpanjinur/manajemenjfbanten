// Definisi tema warna modern dan konfigurasi Role
// Warna: Emerald (Nuansa Islami/Hijau) dan Amber (Nuansa Emas/Premium)

export const THEME = {
  colors: {
    primary: "emerald", // Tailwind class prefix
    secondary: "amber",
    bg: "gray-50",
    sidebar: "white",
    text: "gray-800"
  },
  status: {
    success: "bg-emerald-100 text-emerald-800",
    warning: "bg-amber-100 text-amber-800",
    error: "bg-red-100 text-red-800",
    info: "bg-blue-100 text-blue-800",
  }
};

export const ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  STAFF: 'staff',      // Karyawan
  BRANCH: 'branch',    // Kepala Cabang
  AGENT: 'agent',      // Agen
  JAMAAH: 'jamaah'     // Jemaah
};

// Menu Configuration mapping based on roles
export const NAV_ITEMS = [
  { 
    label: "Dashboard", 
    path: "/", 
    icon: "Home", 
    roles: [ROLES.OWNER, ROLES.ADMIN, ROLES.STAFF, ROLES.BRANCH, ROLES.AGENT] 
  },
  { 
    label: "Data Master", 
    path: "/master-data", 
    icon: "Database", 
    roles: [ROLES.OWNER, ROLES.ADMIN] 
  },
  { 
    label: "Manajemen Paket", 
    path: "/packages", 
    icon: "Package", 
    roles: [ROLES.OWNER, ROLES.ADMIN, ROLES.STAFF, ROLES.BRANCH] 
  },
  { 
    label: "Data Jemaah", 
    path: "/jamaah", 
    icon: "Users", 
    roles: [ROLES.OWNER, ROLES.ADMIN, ROLES.STAFF, ROLES.BRANCH, ROLES.AGENT] 
  },
  { 
    label: "Transaksi & Keuangan", 
    path: "/finance", 
    icon: "DollarSign", 
    roles: [ROLES.OWNER, ROLES.ADMIN, ROLES.BRANCH] // Agen tidak liat keuangan pusat
  },
  { 
    label: "Manifest & Keberangkatan", 
    path: "/manifest", 
    icon: "Plane", 
    roles: [ROLES.OWNER, ROLES.ADMIN, ROLES.STAFF] 
  },
  { 
    label: "Keagenan", 
    path: "/sub-agents", 
    icon: "Briefcase", 
    roles: [ROLES.OWNER, ROLES.ADMIN, ROLES.BRANCH] 
  },
  { 
    label: "Portal Jemaah", 
    path: "/portal", 
    icon: "Smartphone", 
    roles: [ROLES.JAMAAH] // Khusus Jemaah
  },
];