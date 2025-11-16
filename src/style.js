// --- STYLING (CSS-in-JS) ---
// [PERBAIKAN] Menyesuaikan status badge untuk konsistensi
export const styles = `
:root {
    --primary: #007cba;
    --primary-dark: #005a8a;
    --secondary: #f0f0f0;
    --background: #f9f9f9;
    --text: #333;
    --text-light: #777;
    --border: #e0e0e0;
    --danger: #e53e3e;
    --success: #48bb78;
    --warning: #f6ad55;
    --white: #ffffff;
    --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
body { 
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    background-color: var(--background); 
    color: var(--text); 
    margin: 0;
}
#umh-admin-app { padding: 20px; max-width: 1600px; margin: 0 auto; }
.umh-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.umh-header h1 { color: var(--primary); display: flex; align-items: center; gap: 10px; margin: 0;}
.umh-nav { display: flex; gap: 5px; }
.umh-nav-button { 
    background: var(--white); 
    color: var(--text-light); 
    border: 1px solid var(--border); 
    padding: 8px 12px; 
    border-radius: 6px; 
    cursor: pointer; 
    display: flex; 
    align-items: center; 
    gap: 6px; 
    font-weight: 500;
    transition: all 0.2s ease;
}
.umh-nav-button:hover { background-color: var(--secondary); color: var(--text); }
.umh-nav-button.active { 
    background-color: var(--primary); 
    color: var(--white); 
    border-color: var(--primary); 
}
.umh-component-container { 
    background: var(--white); 
    border-radius: 8px; 
    box-shadow: var(--shadow); 
    padding: 20px; 
    overflow: hidden;
    position: relative; /* Ditambahkan untuk loading overlay */
}
.umh-table-toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; flex-wrap: wrap; gap: 10px; }
.umh-table-toolbar h2 { margin: 0; }
.umh-button { 
    background: var(--primary); 
    color: var(--white); 
    border: none; 
    padding: 9px 15px; 
    border-radius: 6px; 
    cursor: pointer; 
    display: inline-flex; 
    align-items: center; 
    gap: 6px; 
    font-weight: 500;
    transition: background-color 0.2s ease;
}
.umh-button:hover { background: var(--primary-dark); }
.umh-button.secondary { background: var(--secondary); color: var(--text); border: 1px solid var(--border); }
.umh-button.secondary:hover { background: var(--border); }
.umh-button.danger { background: var(--danger); }
.umh-button.danger:hover { background: #c53030; }
.umh-table-wrapper { width: 100%; overflow-x: auto; }
.umh-table { width: 100%; border-collapse: collapse; }
.umh-table th, .umh-table td { 
    padding: 12px 15px; 
    border-bottom: 1px solid var(--border); 
    text-align: left; 
    white-space: nowrap; 
}
.umh-table th { background: var(--secondary); font-weight: 600; }
.umh-table tr:last-child td { border-bottom: none; }
.umh-table tr:hover { background-color: var(--background); }
.umh-table .actions { display: flex; gap: 8px; }
.action-icon { cursor: pointer; transition: color 0.2s ease; }
.action-icon:hover { color: var(--primary); }
.action-icon.danger:hover { color: var(--danger); }
.umh-modal-overlay { 
    position: fixed; 
    top: 0; left: 0; right: 0; bottom: 0; 
    background: rgba(0, 0, 0, 0.5); 
    display: flex; 
    justify-content: center; 
    padding-top: 50px;
    z-index: 1000;
    overflow-y: auto;
}
.umh-modal-content { 
    background: var(--white); 
    border-radius: 8px; 
    padding: 25px; 
    width: 90%; 
    max-width: 800px; 
    box-shadow: var(--shadow);
    animation: modal-fade-in 0.3s ease;
    margin-bottom: 50px;
    max-height: 85vh;
    display: flex;
    flex-direction: column;
}
.umh-modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.umh-modal-header h3 { margin: 0; font-size: 1.4em; }
.umh-modal-header .close-button { cursor: pointer; color: var(--text-light); }
.umh-modal-body {
    overflow-y: auto;
    padding-right: 10px; /* for scrollbar */
    margin-right: -10px;
}
.umh-modal-footer { margin-top: 20px; display: flex; justify-content: flex-end; gap: 10px; border-top: 1px solid var(--border); padding-top: 20px; }
@keyframes modal-fade-in { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.form-group { margin-bottom: 15px; }
.form-group.full-width { grid-column: 1 / -1; }
.form-group label { display: block; font-weight: 500; margin-bottom: 6px; font-size: 0.9em; }
.form-group input, .form-group select, .form-group textarea { 
    width: 100%; 
    padding: 9px 12px; 
    border: 1px solid var(--border); 
    border-radius: 6px; 
    box-sizing: border-box; 
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
    font-family: 'Inter', sans-serif;
}
.form-group input:focus, .form-group select:focus, .form-group textarea:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 2px rgba(0,124,186,0.2);
}
.form-group textarea { min-height: 100px; resize: vertical; }
.form-group.checkbox-group { display: flex; align-items: center; gap: 8px; }
.form-group.checkbox-group input { width: auto; }
.form-group.checkbox-group label { margin-bottom: 0; font-weight: normal; }
.loading-overlay, .loading-screen { 
    display: flex; 
    justify-content: center; 
    align-items: center; 
    z-index: 900;
}
.loading-overlay {
    position: absolute; 
    top: 0; left: 0; right: 0; bottom: 0; 
    background: rgba(255, 255, 255, 0.7); 
    height: 100%;
    border-radius: 8px; /* Menyesuaikan dengan container */
}
.loading-screen {
    height: 100vh;
}
.loader { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.status-badge { 
    padding: 3px 8px; 
    border-radius: 12px; 
    font-size: 0.8em; 
    font-weight: 500; 
    white-space: nowrap;
    text-transform: capitalize;
}
.status-badge.pending, .status-badge.belum, .status-badge.belum_di_kirim { background: #fffbeb; color: #b45309; }
.status-badge.approved, .status-badge.lunas, .status-badge.diterima, .status-badge.published, .status-badge.verified, .status-badge.lengkap { background: #ecfdf5; color: #067647; }
.status-badge.rejected { background: #fef2f2; color: #b91c1c; }
.status-badge.cicil, .status-badge.di_kirim { background: #eff6ff; color: #1d4ed8; }
.status-badge.draft { background: #f3f4f6; color: #4b5563; }
.dashboard-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }
.stat-card {
    background: var(--white);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 16px;
    transition: all 0.2s ease;
}
.stat-card:hover { box-shadow: var(--shadow); transform: translateY(-2px); }
.stat-card-icon {
    padding: 12px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}
.stat-card-icon.primary { background: #e0f2fe; color: #0284c7; }
.stat-card-icon.success { background: #dcfce7; color: #16a34a; }
.stat-card-icon.warning { background: #fefce8; color: #ca8a04; }
.stat-card-icon.danger { background: #fef2f2; color: #dc2626; }
.stat-card-info h3 { font-size: 1.8em; margin: 0 0 5px 0; }
.stat-card-info p { margin: 0; color: var(--text-light); }
.umh-sub-header {
    display: flex;
    gap: 15px;
    align-items: center;
    padding: 10px;
    background-color: var(--secondary);
    border-radius: 6px;
    margin-bottom: 15px;
    flex-wrap: wrap;
}
.umh-sub-header .filter-group { display: flex; align-items: center; gap: 8px; }
.umh-sub-header .filter-group label { font-weight: 500; font-size: 0.9em; }
.umh-sub-header .filter-group select, .umh-sub-header .filter-group input {
    background-color: var(--white);
    padding: 6px 10px;
    font-size: 0.9em;
    border: 1px solid var(--border);
    border-radius: 6px;
}
.umh-sub-header .filter-group input {
    padding-left: 30px; /* Ruang untuk ikon search */
}
.umh-sub-header .filter-group .search-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}
.umh-sub-header .filter-group .search-wrapper svg {
    position: absolute;
    left: 8px;
    color: var(--text-light);
}
.payment-history-list { list-style: none; padding: 0; margin: 0; }
.payment-history-list li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    border-bottom: 1px solid var(--border);
}
.payment-history-list li:last-child { border-bottom: none; }
.payment-info { display: flex; flex-direction: column; }
.payment-info strong { font-size: 1.1em; }
.payment-info span { font-size: 0.9em; color: var(--text-light); }
.payment-actions { display: flex; gap: 8px; align-items: center; }
.payment-form {
    padding: 15px;
    border: 1px solid var(--border);
    border-radius: 6px;
    margin-top: 20px;
    background: var(--background);
}
.finance-summary {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
    margin-bottom: 20px;
}
.summary-card {
    background: var(--secondary);
    border-radius: 8px;
    padding: 15px;
    border: 1px solid var(--border);
}
.summary-card h4 {
    margin: 0 0 10px 0;
    font-size: 1em;
    font-weight: 600;
    color: var(--text-light);
    display: flex;
    align-items: center;
    gap: 6px;
}
.summary-card p {
    margin: 0;
    font-size: 1.5em;
    font-weight: 700;
}
.summary-card p.debit { color: var(--danger); }
.summary-card p.kredit { color: var(--success); }
.summary-card p.saldo { color: var(--primary); }
`;