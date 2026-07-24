// ═══════════════════════════════════════════════════════════════════
//  ESTADO GLOBAL DE LA APLICACIÓN
//  Objeto único de estado que todas las vistas y servicios mutan/leen.
//  Se expone en window.state para que los handlers inline (onclick)
//  del HTML renderizado puedan seguir funcionando.
// ═══════════════════════════════════════════════════════════════════

const state = {
    user: null,
    role: null,
    view: 'cliente',       // app.html siempre la sobreescribe via initAuth()
    authMode: 'login',     // 'login' | 'register' (usado por login.html)
    tab: 'pedir',          // pestaña activa dentro de la vista actual
    mascotas: [],
    pedidos: [],
    allPedidos: [],
    reporte: [],
    resumen: { total_general: 0, total_pedidos: 0, total_dias: 0 },
    search: '',
    desde: '',
    hasta: '',
    showPetForm: false,
    expandedId: null,
    expandedDay: null,
    loading: false,
    statusFilter: 'todos',
    preciosConfig: [],
    showPrecioForm: false
};

// Exponer en window para que el HTML inline (onclick="state.tab=...") funcione
window.state = state;
