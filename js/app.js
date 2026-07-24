// ═══════════════════════════════════════════════════════════════════
//  APP — Orquestador central
//  - render(): decide qué vista dibujar según state.view
//  - Expone en `window` las funciones que el HTML inline (onclick)
//    necesita para que sigan funcionando con ES modules.
// ═══════════════════════════════════════════════════════════════════

// Servicios que el HTML inline llama vía onclick="..."

/**
 * Render principal. Redibuja el contenido de #app según la vista activa.
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

    if (state.view === 'auth')        app.innerHTML = renderAuth();
    else if (state.view === 'cliente') app.innerHTML = renderCliente();
    else if (state.view === 'admin')   app.innerHTML = renderAdmin();

    bindEvents();
}

/* ──────────────────────────────────────────────────────────────────
   EXPOSICIÓN GLOBAL EN `window`
   El HTML generado por las vistas incluye llamadas inline como:
     onclick="logout()"
     onclick="state.tab='mascotas';render()"
     onclick="deletePet('${m.id}')"
     onclick="updateOrderStatus('${r.id}','${ESTADOS.PROCESO}')"
     onclick="deleteRegistro('${r.id}')"
     onclick="deletePrecioConfig('${p.id}')"
   Como los ES modules tienen scope privado, exponemos aquí todas las
   funciones y el objeto `state` para que esos handlers sigan funcionando
   sin tener que reescribir todas las plantillas.
   ────────────────────────────────────────────────────────────────── */
window.render = render;
window.logout = logout;
window.deletePet = deletePet;
window.updateOrderStatus = updateOrderStatus;
window.deleteRegistro = deleteRegistro;
window.deletePrecioConfig = deletePrecioConfig;
