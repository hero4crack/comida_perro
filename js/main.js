// ═══════════════════════════════════════════════════════════════════
//  MAIN — Punto de entrada de la aplicación
//  - Carga el listener de cambios de auth (login/logout en otras
//    pestañas, refresh de token, etc.)
//  - Verifica si ya existe una sesión activa y carga los datos del
//    usuario (admin o cliente) en consecuencia.
// ═══════════════════════════════════════════════════════════════════

console.log('🚀 Iniciando aplicación AnimalPet...');

// Suscribirse a cambios de auth (login/logout, refresh, etc.)
setupAuthListener();

// Verificar sesión existente al cargar la página
initAuth();
