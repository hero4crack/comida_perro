// ═══════════════════════════════════════════════════════════════════
//  AUTHENTICATION
// ═══════════════════════════════════════════════════════════════════

async function initAuth() {
    const { data: { session } } = await sb.auth.getSession();
    
    if (session) {
        handleSession(session);
    }
    
    sb.auth.onAuthStateChange((event, session) => {
        if (session) {
            handleSession(session);
        } else {
            state.user = null;
            state.role = null;
            state.view = 'auth';
            state.tab = 'pedir';
            render();
        }
    });
    
    if (!session) render();
}

function handleSession(session) {
    state.user = session.user;
    state.role = session.user.user_metadata?.role;
    state.view = state.role === 'admin' ? 'admin' : 'cliente';
    
    if (state.role === 'admin') state.tab = 'ventas';
    
    render();
    
    if (state.role === 'cliente') loadClienteData();
    if (state.role === 'admin') loadAdminData();
}

async function login(email, password) {
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) return toast(error.message, 'error');
}

async function register(nombre, email, password, telefono, direccion) {
    // 1. Crear usuario en Supabase Auth via Admin API
    const { data: authUser, error: authErr } = await sbAdmin.auth.admin.createUser({
        email, 
        password, 
        email_confirm: true,
        user_metadata: { role: 'cliente', nombre }
    });
    
    if (authErr) return toast(authErr.message, 'error');

    // 2. Crear registro en tabla clientes
    const { error: dbErr } = await sbAdmin.from('clientes').insert([{
        id: authUser.user.id,
        nombre_propietario: nombre,
        email, 
        telefono,
        direccion: direccion || null,
    }]);
    
    if (dbErr) {
        await sbAdmin.auth.admin.deleteUser(authUser.user.id);
        return toast(dbErr.message, 'error');
    }

    // 3. Auto login
    const { error: loginErr } = await sb.auth.signInWithPassword({ email, password });
    if (loginErr) return toast(loginErr.message, 'error');
}

async function logout() {
    await sb.auth.signOut();
}

// ─── Render Auth Page ───
function renderAuth() {
    return `
    <div class="auth-page">
        <div style="margin-bottom:2rem;text-align:center">
            <div style="display:inline-flex;align-items:center;gap:0.75rem">
                <div style="width:56px;height:56px;border-radius:16px;background:linear-gradient(135deg,var(--emerald-500),var(--emerald-700));display:flex;align-items:center;justify-content:center">
                    ${icon('paw')}
                </div>
                <div style="text-align:left">
                    <h1 style="font-size:1.5rem;font-weight:700">Gandolas</h1>
                    <p style="font-size:0.8rem;color:var(--gray-500)">Comida Natural para Perros y Gatos</p>
                </div>
            </div>
        </div>
        <div class="auth-card">
            <div class="card-header">
                <h2 id="auth-title">Iniciar Sesión</h2>
                <p id="auth-subtitle">Accede a tu cuenta para hacer pedidos</p>
            </div>
            <div class="card-body">
                <form id="auth-form">
                    <div id="auth-extra-fields"></div>
                    <div class="form-group">
                        <label>Email *</label>
                        <input type="email" name="email" class="form-control" placeholder="correo@ejemplo.com" required>
                    </div>
                    <div class="form-group">
                        <label>Contraseña *</label>
                        <input type="password" name="password" class="form-control" placeholder="Mínimo 6 caracteres" required minlength="6">
                    </div>
                    <div id="auth-extra-fields-2"></div>
                    <button type="submit" class="btn btn-primary" style="width:100%;margin-top:0.5rem" id="auth-btn">Entrar</button>
                </form>
                <p class="auth-toggle">
                    <a id="auth-toggle-link">¿No tienes cuenta? Regístrate</a>
                </p>
            </div>
        </div>
    </div>`;
}

function bindAuthEvents() {
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
            title.textContent = 'Iniciar Sesión';
            sub.textContent = 'Accede a tu cuenta para hacer pedidos';
            btn.textContent = 'Entrar';
            extra.innerHTML = '';
            extra2.innerHTML = '';
            toggle.textContent = '¿No tienes cuenta? Regístrate';
        } else {
            title.textContent = 'Crear Cuenta';
            sub.textContent = 'Regístrate para ordenar comida natural para tu mascota';
            btn.textContent = 'Registrarse';
            extra.innerHTML = `<div class="form-group"><label>Nombre Completo *</label><input name="nombre" class="form-control" placeholder="Tu nombre" required></div>`;
            extra2.innerHTML = `
                <div class="form-group"><label>Teléfono *</label><input name="telefono" class="form-control" placeholder="+58 412 1234567" required></div>
                <div class="form-group"><label>Dirección</label><textarea name="direccion" class="form-control" rows="2" placeholder="Dirección de entrega"></textarea></div>`;
            toggle.textContent = '¿Ya tienes cuenta? Inicia sesión';
        }
    }
    
    toggle.addEventListener('click', () => setMode(!isLogin));

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