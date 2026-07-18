import { state } from './config.js';
import { renderAuth, renderCliente, renderAdmin } from './views.js';
import { bindEvents } from './events.js';

export function render() {
    const app = document.getElementById('app');
    if (!app) return;
    
    if (state.loading) {
        app.innerHTML = `
            <div class="loading-container">
                <div class="spinner"></div>
                <p style="margin-top:1rem;color:#6b7280;">Cargando...</p>
            </div>
        `;
        return;
    }
    
    if (state.view === 'auth') app.innerHTML = renderAuth();
    else if (state.view === 'cliente') app.innerHTML = renderCliente();
    else if (state.view === 'admin') app.innerHTML = renderAdmin();
    
    bindEvents();
}