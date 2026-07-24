// ═══════════════════════════════════════════════════════════════════
//  EVENTS — Bindeo de eventos del DOM tras cada render
//  Todas las vistas se redibujan desde cero, por lo que después de
//  cada render() hay que re-atacar listeners a los elementos recién
//  creados. Esta función centraliza ese trabajo.
// ═══════════════════════════════════════════════════════════════════

function bindEvents() {
    bindAuthForm();
    bindTabs();
    bindStatusFilters();
    bindOrderForm();
    bindPetForm();
    bindPrecioForm();
    bindExpandableRows();
    bindAdminSearch();
    bindReporteFilters();
    bindSwitches();
}

/* ---------- Auth ---------- */
function bindAuthForm() {
    const authForm = document.getElementById('auth-form');
    if (!authForm) return;

    let isLogin = true;
    const toggle = document.getElementById('auth-toggle-link');
    const extra = document.getElementById('auth-extra-fields');
    const extra2 = document.getElementById('auth-extra-fields-2');
    const title = document.getElementById('auth-title');
    const sub = document.getElementById('auth-subtitle');
    const btn = document.getElementById('auth-btn');

    function setMode(login) {
        isLogin = login;
        if (login) {
            title.textContent = '🔑 Iniciar Sesión';
            sub.textContent = 'Accede a tu cuenta para hacer pedidos';
            btn.textContent = '✅ Entrar';
            extra.innerHTML = '';
            extra2.innerHTML = '';
            toggle.textContent = '¿No tienes cuenta? Regístrate';
        } else {
            title.textContent = '📝 Crear Cuenta';
            sub.textContent = 'Regístrate para ordenar comida natural para tu mascota';
            btn.textContent = '✅ Registrarse';
            extra.innerHTML = `<div class="form-group"><label>✏️ Nombre Completo *</label><input name="nombre" class="form-control" placeholder="Tu nombre" required></div>`;
            extra2.innerHTML = `<div class="form-group"><label>📞 Teléfono *</label><input name="telefono" class="form-control" placeholder="+58 412 1234567" required></div><div class="form-group"><label>📍 Dirección</label><textarea name="direccion" class="form-control" rows="2" placeholder="Dirección de entrega"></textarea></div>`;
            toggle.textContent = '¿Ya tienes cuenta? Inicia sesión';
        }
    }

    if (toggle) toggle.addEventListener('click', () => setMode(!isLogin));

    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(authForm);
        const email = fd.get('email');
        const password = fd.get('password');

        if (isLogin) {
            await login(email, password);
        } else {
            const nombre = fd.get('nombre');
            const telefono = fd.get('telefono');
            const direccion = fd.get('direccion');
            await register(nombre, email, password, telefono, direccion);
        }
    });
}

/* ---------- Tabs de navegación ---------- */
function bindTabs() {
    document.querySelectorAll('[data-tab]').forEach(el => {
        el.addEventListener('click', () => {
            state.tab = el.dataset.tab;
            state.showPetForm = false;
            state.showPrecioForm = false;
            state.expandedId = null;
            state.expandedDay = null;
            state.statusFilter = 'todos';
            render();
            if (state.view === 'admin' && state.tab === 'reportes') {
                loadReporte().then(() => render());
            }
        });
    });
}

/* ---------- Filtros por estado (admin ventas) ---------- */
function bindStatusFilters() {
    document.querySelectorAll('[data-status]').forEach(el => {
        el.addEventListener('click', () => {
            state.statusFilter = el.dataset.status;
            render();
        });
    });
}

/* ---------- Formulario de pedido + cálculo automático de precio ---------- */
function bindOrderForm() {
    const saborSelect = document.getElementById('sabor-select');
    const periodoSelect = document.getElementById('periodo-select');
    const gramosInput = document.getElementById('gramos-input');
    const montoTotal = document.getElementById('monto-total');
    const precioCalculado = document.getElementById('precio-calculado');

    async function actualizarPrecio() {
        const sabor = saborSelect?.value;
        const periodo = periodoSelect?.value;
        const gramos = parseInt(gramosInput?.value) || 0;

        if (sabor && periodo && gramos > 0) {
            const precio = await calcularPrecio(sabor, periodo, gramos);
            if (montoTotal) {
                montoTotal.value = precio.toFixed(2);
            }
            if (precioCalculado) {
                precioCalculado.textContent = `✅ Calculado: $${precio.toFixed(2)}`;
                precioCalculado.style.color = 'var(--emerald-600)';
            }
        } else {
            if (precioCalculado) {
                precioCalculado.textContent = '🤖 Selecciona sabor, porción y gramos';
                precioCalculado.style.color = 'var(--gray-500)';
            }
        }
    }

    if (saborSelect) saborSelect.addEventListener('change', actualizarPrecio);
    if (periodoSelect) periodoSelect.addEventListener('change', actualizarPrecio);
    if (gramosInput) gramosInput.addEventListener('input', actualizarPrecio);

    const orderForm = document.getElementById('order-form');
    if (orderForm) {
        orderForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const fd = new FormData(orderForm);
            const obj = Object.fromEntries(fd);
            await placeOrder(obj);
        });
    }
}

/* ---------- Formulario de nueva mascota ---------- */
function bindPetForm() {
    const petForm = document.getElementById('pet-form');
    if (petForm) {
        petForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const fd = new FormData(petForm);
            const obj = Object.fromEntries(fd);
            const switchEl = document.getElementById('picky-switch');
            obj.picky_eater = switchEl?.classList.contains('active') ? 'true' : 'false';
            await savePet(obj);
        });
    }

    const addPetBtn = document.getElementById('btn-add-pet');
    if (addPetBtn) addPetBtn.addEventListener('click', () => {
        state.showPetForm = true;
        render();
    });

    const cancelPetBtn = document.getElementById('btn-cancel-pet');
    if (cancelPetBtn) cancelPetBtn.addEventListener('click', () => {
        state.showPetForm = false;
        render();
    });
}

/* ---------- Formulario de configuración de precio ---------- */
function bindPrecioForm() {
    const addPrecioBtn = document.getElementById('btn-add-precio');
    if (addPrecioBtn) addPrecioBtn.addEventListener('click', () => {
        state.showPrecioForm = true;
        render();
    });

    const cancelPrecioBtn = document.getElementById('btn-cancel-precio');
    if (cancelPrecioBtn) cancelPrecioBtn.addEventListener('click', () => {
        state.showPrecioForm = false;
        render();
    });

    const precioForm = document.getElementById('precio-form');
    if (precioForm) {
        precioForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const fd = new FormData(precioForm);
            const obj = Object.fromEntries(fd);
            obj.precio_por_gramo = parseFloat(obj.precio_por_gramo) || 0;
            obj.precio_base = parseFloat(obj.precio_base) || 0;
            obj.gramos_min = parseInt(obj.gramos_min) || 0;
            obj.gramos_max = parseInt(obj.gramos_max) || 0;
            await savePrecioConfig(obj);
        });
    }
}

/* ---------- Filas expandibles (pedido admin + día de reporte) ---------- */
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

/* ---------- Buscador de admin (ventas) ---------- */
function bindAdminSearch() {
    const searchInput = document.getElementById('admin-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            state.search = e.target.value;
            render();
        });
    }
}

/* ---------- Filtros de fecha del reporte ---------- */
function bindReporteFilters() {
    const btnFiltrar = document.getElementById('btn-filtrar');
    if (btnFiltrar) {
        btnFiltrar.addEventListener('click', () => {
            const desde = document.getElementById('filtro-desde');
            const hasta = document.getElementById('filtro-hasta');
            state.desde = desde ? desde.value : '';
            state.hasta = hasta ? hasta.value : '';
            loadReporte().then(() => render());
        });
    }

    const btnLimpiar = document.getElementById('btn-limpiar-filtro');
    if (btnLimpiar) {
        btnLimpiar.addEventListener('click', () => {
            state.desde = '';
            state.hasta = '';
            state.reporte = [];
            state.resumen = { total_general: 0, total_pedidos: 0, total_dias: 0 };
            render();
        });
    }

    const desde = document.getElementById('filtro-desde');
    const hasta = document.getElementById('filtro-hasta');
    if (desde) desde.addEventListener('change', (e) => { state.desde = e.target.value; });
    if (hasta) hasta.addEventListener('change', (e) => { state.hasta = e.target.value; });
}

/* ---------- Switches (picky eater) ---------- */
function bindSwitches() {
    document.querySelectorAll('.switch').forEach(el => {
        if (!el.id || el.id !== 'picky-switch') return;
        if (el._listener) return;
        el._listener = true;
        el.addEventListener('click', function(e) {
            this.classList.toggle('active');
            const hidden = this.parentElement.querySelector('input[type="hidden"]');
            if (hidden) hidden.value = this.classList.contains('active') ? 'true' : 'false';
            e.stopPropagation();
        });
    });
}
