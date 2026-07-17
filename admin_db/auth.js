// Variables globales
let usuarioActual = null;
let esAdmin = false;

// Función para verificar si el usuario está autenticado y es admin
async function verificarAccesoAdmin() {
    try {
        // Obtener sesión actual usando el cliente admin
        const { data: { session }, error } = await supabaseAdminPanel.auth.getSession();
        
        if (error || !session) {
            console.warn('⚠️ No hay sesión activa');
            mostrarAccesoDenegado();
            return false;
        }

        usuarioActual = session.user;
        
        // Verificar si es admin (por email o por rol en la tabla usuarios)
        const email = usuarioActual.email;
        esAdmin = email.includes('admin') || email.endsWith('@admin.com');
        
        // Si no es admin por email, verificar en la tabla usuarios
        if (!esAdmin) {
            try {
                const { data, error } = await supabaseAdminPanel
                    .from('usuarios')
                    .select('rol')
                    .eq('correo', email)
                    .single();
                
                if (!error && data && data.rol === 'admin') {
                    esAdmin = true;
                }
            } catch (err) {
                // La tabla usuarios podría no existir aún
                console.log('📋 Tabla usuarios no encontrada, solo verificando email');
            }
        }

        if (!esAdmin) {
            mostrarAccesoDenegado();
            return false;
        }

        // Mostrar usuario actual
        const usuarioSpan = document.getElementById('usuario-actual');
        if (usuarioSpan) {
            usuarioSpan.textContent = `👋 ${email}`;
        }
        
        const alertDiv = document.getElementById('acceso-admin');
        if (alertDiv) {
            alertDiv.style.display = 'none';
        }
        
        console.log('✅ Acceso admin concedido a:', email);
        return true;

    } catch (error) {
        console.error('❌ Error verificando acceso:', error);
        mostrarAccesoDenegado();
        return false;
    }
}

function mostrarAccesoDenegado() {
    const alertDiv = document.getElementById('acceso-admin');
    if (alertDiv) {
        alertDiv.style.display = 'block';
        alertDiv.textContent = '⚠️ Solo el usuario administrador autenticado puede editar o ejecutar consultas en este panel.';
    }
    
    // Ocultar elementos si no es admin
    const tabs = document.querySelector('.tabs');
    const tabla = document.getElementById('tabla-contenedor');
    const sql = document.querySelector('.sql-console');
    const stats = document.querySelector('.stats-container');
    
    if (tabs) tabs.style.display = 'none';
    if (tabla) tabla.style.display = 'none';
    if (sql) sql.style.display = 'none';
    if (stats) stats.style.display = 'none';
}

function prepararAccesoPanel() {
    return verificarAccesoAdmin();
}

function puedeEditarPanel() {
    return esAdmin;
}

// Cerrar sesión
async function cerrarSesion() {
    const { error } = await supabaseAdminPanel.auth.signOut();
    if (error) {
        console.error('Error cerrando sesión:', error);
        alert('Error al cerrar sesión: ' + error.message);
        return;
    }
    // Recargar página
    window.location.reload();
}

// Función para login (si no hay sesión)
async function iniciarSesionAdmin(email, password) {
    try {
        const { data, error } = await supabaseAdminPanel.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) throw error;
        
        console.log('✅ Sesión iniciada:', data.user.email);
        window.location.reload();
        return data;
        
    } catch (error) {
        console.error('❌ Error al iniciar sesión:', error);
        alert('Error al iniciar sesión: ' + error.message);
        throw error;
    }
}

// Exponer funciones globalmente
window.cerrarSesion = cerrarSesion;
window.iniciarSesionAdmin = iniciarSesionAdmin;
window.prepararAccesoPanel = prepararAccesoPanel;
window.puedeEditarPanel = puedeEditarPanel;