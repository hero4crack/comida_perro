// ═══════════════════════════════════════════════════════════════════
//  APP INITIALIZATION & ROUTING
// ═══════════════════════════════════════════════════════════════════

function render() {
    const app = document.getElementById('app');
    
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
            app.innerHTML = renderLoading();
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

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initAuth();
});