// ═══════════════════════════════════════════════════════════════════
//  HELPERS — Utilidades DOM y de feedback visual
// ═══════════════════════════════════════════════════════════════════

/**
 * Escapa HTML para evitar inyección al interpolar strings en plantillas.
 * @param {string|null|undefined} s
 * @returns {string}
 */
function esc(s) {
    if (s == null) return '';
    const d = document.createElement('div');
    d.textContent = String(s);
    return d.innerHTML;
}

/**
 * Muestra una notificación toast temporal.
 * @param {string} msg
 * @param {'success'|'error'|'info'} [type='success']
 */
function toast(msg, type = 'success') {
    const el = document.createElement('div');
    el.className = 'toast toast-' + type;
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
}

/**
 * Activa/desactiva el indicador global de carga y re-renderiza.
 * @param {boolean} show
 */
function showLoading(show) {
    state.loading = show;
    render();
}
