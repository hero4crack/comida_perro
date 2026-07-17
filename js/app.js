// ═══════════════════════════════════════════════════════════════════
//  APP INITIALIZATION & ROUTING
// ═══════════════════════════════════════════════════════════════════

function render() {
    const app = document.getElementById('app');
    
    if (!app) {
        console.error('❌ Elemento #app no encontrado');
        return;
    }
    
    switch(state.view) {
        case 'auth':
            app.innerHTML = renderAuth();
            break;
        case 'cliente':
            app.innerHTML = renderCliente();
            break;
        case 'admin':
            app.innerHTML = renderAdmin();
            break;
        default:
            // Mostrar loading mientras se determina el estado
            app.innerHTML = `
                <div class="auth-page">
                    <div style="text-align:center">
                        <div style="display:inline-flex;align-items:center;gap:0.75rem;margin-bottom:2rem">
                            <div style="width:56px;height:56px;border-radius:16px;background:linear-gradient(135deg,var(--emerald-500),var(--emerald-700));display:flex;align-items:center;justify-content:center">
                                <svg width="22" height="22" viewBox="0 0 24 24" stroke="white" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.722 3.656 1 1.261-2 2.172-2.5 4-.29 2.662 2.003 5.074 4.5 6 .713.247 1.5.188 2.156-.112A8.01 8.01 0 0 0 15.5 10c.636-1.6 1.594-2.882 2.5-4 .7-.846 1.23-1.84 1.5-3 .321-1.486-.592-2.866-1.843-4.015A7.96 7.96 0 0 0 15 1.5c-1.472 0-2.845.522-4 1.672z"/>
                                </svg>
                            </div>
                            <div style="text-align:left">
                                <h1 style="font-size:1.5rem;font-weight:700;color:#111827">Gandolas</h1>
                                <p style="font-size:0.8rem;color:#6b7280">Comida Natural para Perros y Gatos</p>
                            </div>
                        </div>
                        <div class="spinner"></div>
                        <p style="margin-top:1rem;color:#6b7280;font-size:0.875rem">Cargando...</p>
                    </div>
                </div>`;
    }
    
    bindEvents();
}

function bindEvents() {
    // Auth events
    bindAuthEvents();
    
    // Navigation
    bindTabs();
    
    // Expandable rows
    bindExpandableRows();
    
    // View-specific events
    if (state.view === 'cliente') {
        bindClienteEvents();
    } else if (state.view === 'admin') {
        bindAdminEvents();
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Iniciando aplicación Gandolas...');
    initAuth();
});

// Manejar cambios de hash para navegación (opcional)
window.addEventListener('hashchange', () => {
    const hash = window.location.hash;
    if (hash === '#admin-db') {
        window.location.href = 'admin_db/index.html';
    }
});

console.log('✅ App.js cargado');