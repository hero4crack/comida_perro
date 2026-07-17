// ═══════════════════════════════════════════════════════════════════
//  UI UTILITIES
// ═══════════════════════════════════════════════════════════════════

function toast(msg, type = 'success') {
    const el = document.createElement('div');
    el.className = 'toast toast-' + type;
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
}

function esc(s) {
    if (s == null) return '';
    const d = document.createElement('div');
    d.textContent = String(s);
    return d.innerHTML;
}

function icon(name, cls = '') { 
    return `<span class="${cls}">${IC[name]}</span>`; 
}

function formatCurrency(amount) {
    return '$' + Number(amount).toFixed(2);
}

function renderLoading() {
    return '<div class="loading"><div class="spinner"></div></div>';
}

function renderEmptyState(message, iconName = 'paw') {
    return `
        <div class="empty-state">
            ${icon(iconName)}
            <p>${message}</p>
        </div>`;
}

function bindTabs() {
    document.querySelectorAll('[data-tab]').forEach(el => {
        el.addEventListener('click', () => {
            state.tab = el.dataset.tab;
            state.showPetForm = false;
            render();
            if (state.view === 'admin' && state.tab === 'reportes') loadReporte();
        });
    });
}

function bindExpandableRows() {
    document.querySelectorAll('[data-expand]').forEach(el => {
        el.addEventListener('click', () => {
            state.expandedId = state.expandedId === el.dataset.expand ? null : el.dataset.expand;
            render();
        });
    });
    
    document.querySelectorAll('[data-expand-day]').forEach(el => {
        el.addEventListener('click', () => {
            state.expandedDay = state.expandedDay === el.dataset.expandDay ? null : el.dataset.expandDay;
            render();
        });
    });
}