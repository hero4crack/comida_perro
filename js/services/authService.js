// ═══════════════════════════════════════════════════════════════════
//  AUTH SERVICE — Autenticación con Supabase
//  Maneja login, registro, logout, sesión y rol del usuario.
// ═══════════════════════════════════════════════════════════════════

/**
 * Obtiene el rol de un usuario desde la tabla `profiles`.
 * Si no existe, lo crea con rol 'user'.
 * Fallback: si el email contiene "admin", asume rol admin.
 */
async function getUserRole(userId, email) {
    console.log('🔍 Consultando rol para:', email);

    try {
        const { data: profile, error } = await sbAdmin
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (profile) {
            console.log('✅ Perfil encontrado:', profile.role);
            return profile.role;
        }

        console.log('📝 Creando perfil nuevo con rol user...');
        const { error: insertError } = await sbAdmin
            .from('profiles')
            .insert([{
                id: userId,
                email: email,
                role: 'user'
            }]);

        if (insertError) {
            console.error('❌ Error creando perfil:', insertError);
            return email.includes('admin') ? 'admin' : 'user';
        }

        console.log('✅ Perfil creado con rol user');
        return 'user';

    } catch (err) {
        console.error('❌ Error en getUserRole:', err);
        return email.includes('admin') ? 'admin' : 'user';
    }
}

/**
 * Carga los datos correspondientes al rol del usuario (admin o cliente)
 * y actualiza la vista/tab activa.
 */
async function loadUserDataForRole() {
    if (state.role === 'admin') {
        state.tab = 'ventas';
        await loadAdminData();
        state.preciosConfig = await loadPreciosConfig();
    } else {
        state.tab = 'pedir';
        await loadClienteData();
    }
}

/**
 * Verifica sesión existente al cargar la página.
 */
async function initAuth() {
    console.log('🔍 Verificando sesión...');
    try {
        const { data: { session } } = await sb.auth.getSession();

        if (session) {
            state.user = session.user;
            const role = await getUserRole(session.user.id, session.user.email);
            state.role = role;
            state.view = role === 'admin' ? 'admin' : 'cliente';

            await loadUserDataForRole();

            console.log('👤 Usuario:', session.user.email, '| Rol:', state.role);
        }
    } catch (err) {
        console.error('❌ Error verificando sesión:', err);
    }

    render();
}

/**
 * Suscribe la app a cambios de estado de auth (login/logout en otra pestaña, etc.)
 * Debe llamarse una sola vez al iniciar.
 */
function setupAuthListener() {
    sb.auth.onAuthStateChange(async (event, session) => {
        console.log('🔄 Cambio de estado auth:', event);

        if (session) {
            state.user = session.user;
            const role = await getUserRole(session.user.id, session.user.email);
            state.role = role;
            state.view = role === 'admin' ? 'admin' : 'cliente';

            await loadUserDataForRole();

            console.log('👤 Sesión iniciada:', session.user.email, '| Rol:', state.role);
        } else {
            state.user = null;
            state.role = null;
            state.view = 'auth';
            state.tab = 'pedir';
            state.mascotas = [];
            state.pedidos = [];
            state.preciosConfig = [];
            console.log('👋 Sesión cerrada');
        }

        render();
    });
}

/**
 * Inicia sesión con email + password.
 * @returns {Promise<boolean>} true si el login fue exitoso
 */
async function login(email, password) {
    showLoading(true);

    try {
        const { data, error } = await sb.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            console.error('❌ Error login:', error.message);
            toast(error.message, 'error');
            showLoading(false);
            return false;
        }

        console.log('✅ Login exitoso');

        if (!data.user) {
            console.error('❌ No se recibió usuario después del login');
            toast('Error al obtener datos del usuario', 'error');
            showLoading(false);
            return false;
        }

        state.user = data.user;
        console.log('👤 Usuario logueado:', state.user.email);

        const clienteOk = await ensureClienteExists();
        if (!clienteOk) {
            console.error('❌ Error al asegurar la existencia del cliente');
            toast('Error al configurar tu perfil. Intenta de nuevo.', 'error');
            showLoading(false);
            return false;
        }

        const role = await getUserRole(state.user.id, state.user.email);
        state.role = role;
        console.log('👤 Rol:', state.role);

        await loadUserDataForRole();

        render();

        const nombre = state.user.user_metadata?.nombre || state.user.email;
        toast(`👋 ¡Bienvenido ${nombre}!`, 'success');

        showLoading(false);
        return true;

    } catch (err) {
        console.error('❌ Error inesperado en login:', err);
        toast('Error al iniciar sesión: ' + err.message, 'error');
        showLoading(false);
        return false;
    }
}

/**
 * Registra un nuevo usuario + cliente + profile.
 */
async function register(nombre, email, password, telefono, direccion) {
    showLoading(true);

    try {
        const { data, error } = await sb.auth.signUp({
            email,
            password,
            options: {
                data: {
                    nombre: nombre,
                    telefono: telefono,
                    direccion: direccion
                }
            }
        });

        if (error) {
            console.error('❌ Error registro:', error);
            toast(error.message, 'error');
            showLoading(false);
            return;
        }

        if (!data.user) {
            toast('Error: No se pudo crear el usuario', 'error');
            showLoading(false);
            return;
        }

        console.log('✅ Usuario registrado:', data.user.id);

        await new Promise(resolve => setTimeout(resolve, 1000));

        const { error: clienteError } = await sbAdmin
            .from('clientes')
            .insert([{
                id: data.user.id,
                nombre_propietario: nombre,
                email: email,
                telefono: telefono || 'No especificado',
                direccion: direccion || null,
                rol: 'cliente'
            }]);

        if (clienteError) {
            console.error('❌ Error creando cliente:', clienteError);
            toast('Usuario creado pero error al crear perfil. Contacta al administrador.', 'error');
            showLoading(false);
            return;
        }

        const { error: profileError } = await sbAdmin
            .from('profiles')
            .insert([{
                id: data.user.id,
                email: email,
                role: 'user'
            }]);

        if (profileError) {
            console.error('❌ Error creando profile:', profileError);
        }

        toast('✅ Cuenta creada exitosamente. Por favor inicia sesión.', 'success');
        showLoading(false);

        const toggle = document.getElementById('auth-toggle-link');
        if (toggle) toggle.click();

    } catch (err) {
        console.error('❌ Error en registro:', err);
        toast('Error al crear cuenta: ' + err.message, 'error');
        showLoading(false);
    }
}

/**
 * Cierra la sesión actual.
 */
async function logout() {
    console.log('👋 Cerrando sesión...');
    await sb.auth.signOut();
    state.view = 'auth';
    state.tab = 'pedir';
    state.mascotas = [];
    state.pedidos = [];
    state.preciosConfig = [];
    state.user = null;
    state.role = null;
    render();
}

/**
 * Garantiza que el usuario actual tenga un registro en `clientes`.
 * Si no existe, lo crea usando user_metadata.
 * @returns {Promise<boolean>}
 */
async function ensureClienteExists() {
    if (!state.user) {
        console.error('❌ No hay usuario en state');
        return false;
    }

    const userId = state.user.id;
    const userEmail = state.user.email;
    const userMetadata = state.user.user_metadata || {};

    console.log('🔍 Verificando cliente:', userId, userEmail);

    try {
        const { data: cliente, error } = await sbAdmin
            .from('clientes')
            .select('*')
            .eq('id', userId)
            .single();

        if (cliente) {
            console.log('✅ Cliente encontrado');
            return true;
        }

        console.log('📝 Creando nuevo cliente...');
        const { error: insertErr } = await sbAdmin
            .from('clientes')
            .insert([{
                id: userId,
                nombre_propietario: userMetadata.nombre || userEmail.split('@')[0] || 'Usuario',
                email: userEmail,
                telefono: userMetadata.telefono || 'No especificado',
                direccion: userMetadata.direccion || null,
                rol: 'cliente'
            }]);

        if (insertErr) {
            console.error('❌ Error creando cliente:', insertErr);
            return false;
        }

        console.log('✅ Cliente creado exitosamente');
        return true;

    } catch (err) {
        console.error('❌ Error en ensureClienteExists:', err);
        return false;
    }
}
