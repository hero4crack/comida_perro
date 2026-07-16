// ==============================================================================
// APP.JS - ENRUTADOR PRINCIPAL
// Maneja la navegación entre vistas (SPA) y dispara eventos de inicialización
// ==============================================================================

document.addEventListener('DOMContentLoaded', () => {
    const views = document.querySelectorAll('.module-view');
    const navLinks = document.querySelectorAll('.nav-link');

    // Función para cambiar de vista
    function navigateTo(hash) {
        views.forEach(view => view.classList.add('hidden'));
        navLinks.forEach(link => {
            link.classList.remove('text-brand-orange', 'bg-orange-50', 'text-brand-green', 'bg-green-50', 'font-bold');
        });

        const targetView = document.getElementById(`view-${hash}`);
        if (targetView) {
            targetView.classList.remove('hidden');
        }

        // Resaltar link activo
        const activeLink = document.querySelector(`a[href="#${hash}"]`);
        if (activeLink) {
            if(hash === 'dashboard') activeLink.classList.add('text-brand-green', 'bg-green-50', 'font-bold');
            else activeLink.classList.add('text-brand-orange', 'bg-orange-50', 'font-bold');
        }

        // Disparar eventos de carga para cada módulo (Escuchados por los otros archivos)
        if (hash === 'registro') window.dispatchEvent(new Event('loadRegistroView'));
        if (hash === 'pedidos') window.dispatchEvent(new Event('loadPedidosView'));
        if (hash === 'dashboard') window.dispatchEvent(new Event('loadDashboardView'));
    }

    // Escuchar clicks en el menú
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const hash = link.getAttribute('href').substring(1);
            window.location.hash = hash;
        });
    });

    // Escuchar cambios en la URL (Botón de volver del navegador)
    window.addEventListener('hashchange', () => {
        navigateTo(window.location.hash.substring(1));
    });

    // Cargar vista inicial
    if (!window.location.hash) window.location.hash = 'registro';
    else navigateTo(window.location.hash.substring(1));
});

// Utilidad global para mostrar notificaciones
function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `fixed bottom-5 right-5 ${isError ? 'bg-red-500' : 'bg-brand-green'} text-white px-6 py-3 rounded-lg shadow-lg transform translate-y-0 opacity-100 transition-all duration-300 z-50`;
    
    setTimeout(() => {
        toast.className = `fixed bottom-5 right-5 bg-brand-green text-white px-6 py-3 rounded-lg shadow-lg transform translate-y-20 opacity-0 transition-all duration-300 z-50`;
    }, 3000);
}