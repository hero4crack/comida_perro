// ═══════════════════════════════════════════════════════════════════
//  APP — Orquestador del dashboard (app.html)
//  - render(): decide qué vista dibujar (cliente | admin) según
//    state.view, que es establecido por initAuth()/setupAuthListener()
//    en authService.js
//  - Expone en `window` las funciones que el HTML inline (onclick)
//    necesita para que sigan funcionando.
// ═══════════════════════════════════════════════════════════════════

/**
 * Render principal del dashboard. Redibuja #app según la vista activa.
 * Solo se llama desde app.html. La landing y el login son HTML aparte.
 */
function render() {
    const app = document.getElementById('app');

    if (state.loading) {
        app.innerHTML = `
            <div class="loading-container">
                <div class="spinner"></div>
                <p style="margin-top:1rem;color:#6b7280;">Cargando...</p>
            </div>
        `;
        return;
    }

    if (state.view === 'cliente')      app.innerHTML = renderCliente();
    else if (state.view === 'admin')   app.innerHTML = renderAdmin();
    // 'landing' y 'auth' no se manejan aquí — son index.html y login.html

    bindEvents();
}

/* ──────────────────────────────────────────────────────────────────
   EXPOSICIÓN GLOBAL EN `window`
   El HTML generado por las vistas del dashboard incluye llamadas
   inline como:
     onclick="logout()"
     onclick="state.tab='mascotas';render()"
     onclick="deletePet('${m.id}')"
     onclick="updateOrderStatus('${r.id}','${ESTADOS.PROCESO}')"
     onclick="deleteRegistro('${r.id}')"
     onclick="deletePrecioConfig('${p.id}')"
   ────────────────────────────────────────────────────────────────── */
window.render = render;
window.logout = logout;
window.deletePet = deletePet;
window.updateOrderStatus = updateOrderStatus;
window.deleteRegistro = deleteRegistro;
window.deletePrecioConfig = deletePrecioConfig;
