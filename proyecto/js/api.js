import { sb, sbAdmin, state, ESTADOS } from './config.js';
import { toast, showLoading } from './utils.js';
import { render } from './render.js';

// ═══════════════════════════════════════════════════════════════════
//  AUTENTICACIÓN
// ═══════════════════════════════════════════════════════════════════
export async function getUserRole(userId, email) {
    try {
        const { data: profile, error } = await sbAdmin
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (profile) return profile.role;

        const { error: insertError } = await sbAdmin
            .from('profiles')
            .insert([{ id: userId, email: email, role: 'user' }]);

        if (insertError) return email.includes('admin') ? 'admin' : 'user';
        return 'user';
    } catch (err) {
        return email.includes('admin') ? 'admin' : 'user';
    }
}

export async function initAuth() {
    try {
        const { data: { session } } = await sb.auth.getSession();
        if (session) {
            state.user = session.user;
            const role = await getUserRole(session.user.id, session.user.email);
            state.role = role;
            state.view = role === 'admin' ? 'admin' : 'cliente';
            
            if (state.role === 'admin') {
                state.tab = 'ventas';
                await loadAdminData();
                state.preciosConfig = await loadPreciosConfig();
            } else {
                state.tab = 'pedir';
                await loadClienteData();
            }
        }
    } catch (err) {
        console.error('Error verificando sesión:', err);
    }
    render();
}

sb.auth.onAuthStateChange(async (event, session) => {
    if (session) {
        state.user = session.user;
        const role = await getUserRole(session.user.id, session.user.email);
        state.role = role;
        state.view = role === 'admin' ? 'admin' : 'cliente';
        
        if (state.role === 'admin') {
            state.tab = 'ventas';
            await loadAdminData();
            state.preciosConfig = await loadPreciosConfig();
        } else {
            state.tab = 'pedir';
            await loadClienteData();
        }
    } else {
        state.user = null;
        state.role = null;
        state.view = 'auth';
        state.tab = 'pedir';
        state.mascotas = [];
        state.pedidos = [];
        state.preciosConfig = [];
        }
    render();
});

export async function login(email, password) {
    showLoading(true);
    try {
        const { data, error } = await sb.auth.signInWithPassword({ email, password });
        if (error) {
            toast(error.message, 'error');
            showLoading(false);
            return false;
        }
        state.user = data.user;
        const clienteOk = await ensureClienteExists();
        if (!clienteOk) {
            toast('Error al configurar tu perfil. Intenta de nuevo.', 'error');
            showLoading(false);
            return false;
        }
        const role = await getUserRole(state.user.id, state.user.email);
        state.role = role;
        if (state.role === 'admin') {
            state.view = 'admin'; state.tab = 'ventas';
            await loadAdminData(); state.preciosConfig = await loadPreciosConfig();
        } else {
            state.view = 'cliente'; state.tab = 'pedir';
            await loadClienteData();
        }
        render();
        toast(`👋 ¡Bienvenido ${state.user.user_metadata?.nombre || state.user.email}!`, 'success');
        showLoading(false);
        return true;
    } catch (err) {
        toast('Error al iniciar sesión: ' + err.message, 'error');
        showLoading(false);
        return false;
    }
}

export async function register(nombre, email, password, telefono, direccion) {
    showLoading(true);
    try {
        const { data, error } = await sb.auth.signUp({
            email, password,
            options: { data: { nombre, telefono, direccion } }
        });
        if (error) {
            toast(error.message, 'error'); showLoading(false); return;
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        await sbAdmin.from('clientes').insert([{ 
            id: data.user.id, 
            nombre_propietario: nombre, 
            email, 
            telefono: telefono || 'No especificado', 
            direccion: direccion || null, 
            rol: 'cliente' 
        }]);
        
        await sbAdmin.from('profiles').insert([{ 
            id: data.user.id, 
            email, 
            role: 'user' 
        }]);
        
        toast('✅ Cuenta creada exitosamente. Por favor inicia sesión.', 'success');
        showLoading(false);
        const toggle = document.getElementById('auth-toggle-link');
        if (toggle) toggle.click();
    } catch (err) {
        toast('Error al crear cuenta: ' + err.message, 'error');
        showLoading(false);
    }
}

export async function logout() {
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

export async function ensureClienteExists() {
    if (!state.user) return false;
    const userId = state.user.id;
    const userEmail = state.user.email;
    const userMetadata = state.user.user_metadata || {};
    try {
        const { data: cliente, error } = await sbAdmin
            .from('clientes')
            .select('*')
            .eq('id', userId)
            .single();
        if (cliente) return true;
        
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
        if (insertErr) return false;
        return true;
    } catch (err) {
        return false;
    }
}

// ═══════════════════════════════════════════════════════════════════
//  API - CARGA DE DATOS
// ═══════════════════════════════════════════════════════════════════
export async function loadClienteData() {
    if (!state.user) return;
    const uid = state.user.id;
    try {
        const { data: mascotas, error: mErr } = await sbAdmin
            .from('mascotas')
            .select('*')
            .eq('cliente_id', uid)
            .order('created_at', { ascending: false });
        if (mErr) state.mascotas = []; 
        else state.mascotas = mascotas || [];
        
        const { data: pedidos, error: pErr } = await sbAdmin
            .from('pedidos')
            .select('*, mascota:mascotas(id,nombre,tipo,raza,peso_kg)')
            .eq('cliente_id', uid)
            .order('created_at', { ascending: false });
        if (pErr) state.pedidos = []; 
        else state.pedidos = pedidos || [];
    } catch (err) {
        state.mascotas = []; 
        state.pedidos = [];
    }
}

export async function loadAdminData() {
    try {
        const { data, error } = await sbAdmin
            .from('pedidos')
            .select(`*, cliente:clientes(id,nombre_propietario,email,telefono,direccion), mascota:mascotas(id,nombre,tipo,raza,peso_kg,actividad_fisica,picky_eater,condicion_medica,alergias)`)
            .order('created_at', { ascending: false });
        if (error) state.allPedidos = [];
        else {
            state.allPedidos = data || [];
            state.allPedidos.forEach(p => { if (!p.estado) p.estado = ESTADOS.PENDIENTE; });
        }
    } catch (err) {
        state.allPedidos = [];
    }
}

export async function loadReporte() {
    try {
        let q = sbAdmin
            .from('pedidos')
            .select(`*, cliente:clientes(id,nombre_propietario,email,telefono), mascota:mascotas(id,nombre,tipo,raza)`)
            .eq('estado', ESTADOS.COMPLETADO)
            .order('fecha_entrega', { ascending: true });
        if (state.desde) q = q.gte('fecha_entrega', state.desde);
        if (state.hasta) q = q.lte('fecha_entrega', state.hasta);
        
        const { data, error } = await q;
        if (error) { 
            state.reporte = []; 
            state.resumen = { total_general: 0, total_pedidos: 0, total_dias: 0 }; 
            return; 
        }
        
        const pedidos = data || [];
        const dias = {};
        pedidos.forEach(p => {
            if (!dias[p.fecha_entrega]) dias[p.fecha_entrega] = { fecha: p.fecha_entrega, total_ventas: 0, cantidad_pedidos: 0, pedidos: [] };
            dias[p.fecha_entrega].total_ventas += Number(p.monto_total);
            dias[p.fecha_entrega].cantidad_pedidos++;
            dias[p.fecha_entrega].pedidos.push(p);
        });
        
        state.reporte = Object.values(dias).sort((a, b) => a.fecha.localeCompare(b.fecha));
        state.resumen = {
            total_general: state.reporte.reduce((s, d) => s + d.total_ventas, 0),
            total_pedidos: state.reporte.reduce((s, d) => s + d.cantidad_pedidos, 0),
            total_dias: state.reporte.length
        };
    } catch (err) {
        state.reporte = []; 
        state.resumen = { total_general: 0, total_pedidos: 0, total_dias: 0 };
    }
}

// ═══════════════════════════════════════════════════════════════════
//  API - PRECIOS
// ═══════════════════════════════════════════════════════════════════
export async function loadPreciosConfig() {
    try {
        const { data, error } = await sbAdmin
            .from('config_precios')
            .select('*')
            .order('sabor')
            .order('periodo_porcion')
            .order('gramos_min');
        if (error) return [];
        return data || [];
    } catch (err) { 
        return []; 
    }
}

export async function savePrecioConfig(data) {
    showLoading(true);
    try {
        const { error } = await sbAdmin
            .from('config_precios')
            .upsert([data], { onConflict: 'sabor,periodo_porcion,gramos_min,gramos_max', ignoreDuplicates: false });
        if (error) { 
            toast('Error al guardar precio: ' + error.message, 'error'); 
            showLoading(false); 
            return false; 
        }
        toast('✅ Precio guardado correctamente', 'success');
        state.preciosConfig = await loadPreciosConfig();
        state.showPrecioForm = false;
        render();
        showLoading(false);
        return true;
    } catch (err) {
        toast('Error al guardar: ' + err.message, 'error');
        showLoading(false);
        return false;
    }
}

export async function deletePrecioConfig(id) {
    if (!confirm('⚠️ ¿Eliminar esta configuración de precio?')) return;
    showLoading(true);
    try {
        const { error } = await sbAdmin.from('config_precios').delete().eq('id', id);
        if (error) { 
            toast('Error al eliminar: ' + error.message, 'error'); 
            showLoading(false); 
            return; 
        }
        toast('✅ Configuración eliminada', 'success');
        state.preciosConfig = await loadPreciosConfig();
        render();
        showLoading(false);
    } catch (err) {
        toast('Error al eliminar: ' + err.message, 'error');
        showLoading(false);
    }
}

export async function calcularPrecio(sabor, periodoPorcion, cantidadGramos) {
    try {
        const { data, error } = await sbAdmin.rpc('calcular_precio_pedido', { 
            p_sabor: sabor, 
            p_periodo_porcion: periodoPorcion, 
            p_cantidad_gramos: parseInt(cantidadGramos) || 0 
        });
        if (error) return 0;
        return data || 0;
    } catch (err) { 
        return 0; 
    }
}

// ═══════════════════════════════════════════════════════════════════
//  API - OPERACIONES
// ═══════════════════════════════════════════════════════════════════
export async function savePet(form) {
    showLoading(true);
    try {
        const clienteOk = await ensureClienteExists();
        if (!clienteOk) { 
            toast('Error al verificar el cliente.', 'error'); 
            showLoading(false); 
            return; 
        }
        const { data: cliente } = await sbAdmin
            .from('clientes')
            .select('id')
            .eq('id', state.user.id)
            .maybeSingle();
            
        if (!cliente) { 
            toast('Error: Cliente no encontrado.', 'error'); 
            showLoading(false); 
            return; 
        }
        
        const mascotaData = { 
            cliente_id: state.user.id, 
            nombre: form.nombre, 
            tipo: form.tipo, 
            edad_anios: parseInt(form.edad_anios) || 0, 
            edad_meses: parseInt(form.edad_meses) || 0, 
            peso_kg: parseFloat(form.peso_kg) || 0, 
            sexo: form.sexo, 
            raza: form.raza || null, 
            actividad_fisica: form.actividad_fisica, 
            condicion_medica: form.condicion_medica || null, 
            picky_eater: form.picky_eater === 'true', 
            alergias: form.alergias || null 
        };
        
        const { data: result, error } = await sbAdmin
            .from('mascotas')
            .insert([mascotaData])
            .select();
            
        if (error) { 
            toast('Error al registrar mascota: ' + error.message, 'error'); 
            showLoading(false); 
            return; 
        }
        toast('✅ Mascota registrada exitosamente');
        state.showPetForm = false;
        await loadClienteData();
        render();
        showLoading(false);
    } catch (err) {
        toast('Error al guardar: ' + err.message, 'error');
        showLoading(false);
    }
}

export async function deletePet(id) {
    if (!confirm('⚠️ ¿Eliminar esta mascota y todos sus pedidos asociados?')) return;
    showLoading(true);
    try {
        const { data, error } = await sbAdmin.rpc('eliminar_mascota_completa', { p_mascota_id: id });
        if (error) { 
            toast('Error al eliminar: ' + error.message, 'error'); 
            showLoading(false); 
            return; 
        }
        await loadClienteData();
        if (state.view === 'admin') await loadAdminData();
        render();
        toast(`✅ Mascota eliminada correctamente`, 'success');
        showLoading(false);
    } catch (err) {
        toast('Error al eliminar: ' + err.message, 'error');
        showLoading(false);
    }
}

export async function placeOrder(form) {
    showLoading(true);
    try {
        const pedidoData = { 
            cliente_id: state.user.id, 
            mascota_id: form.mascota_id, 
            sabor: form.sabor, 
            periodo_porcion: form.periodo_porcion, 
            cantidad_gramos: parseInt(form.cantidad_gramos) || 0, 
            metodo_pago: form.metodo_pago, 
            fecha_entrega: form.fecha_entrega, 
            nro_lote: form.nro_lote, 
            monto_total: parseFloat(form.monto_total) || 0, 
            estado: 'pendiente' 
        };
        
        const { data, error } = await sbAdmin
            .from('pedidos')
            .insert([pedidoData])
            .select();
            
        if (error) { 
            toast(error.message, 'error'); 
            showLoading(false); 
            return; 
        }
        toast('✅ Pedido realizado exitosamente (Estado: Pendiente)');
        state.tab = 'historial';
        await loadClienteData();
        render();
        showLoading(false);
    } catch (err) {
        toast('Error al realizar pedido: ' + err.message, 'error');
        showLoading(false);
    }
}

export async function updateOrderStatus(orderId, nuevoEstado) {
    showLoading(true);
    try {
        const { data, error } = await sbAdmin.rpc('actualizar_estado_pedido', { 
            p_pedido_id: orderId, 
            p_nuevo_estado: nuevoEstado 
        });
        if (error) { 
            toast('Error al actualizar estado: ' + error.message, 'error'); 
            showLoading(false); 
            return; 
        }
        await loadAdminData();
        if (state.tab === 'reportes') await loadReporte();
        toast(`✅ Estado actualizado a: ${nuevoEstado === ESTADOS.PENDIENTE ? 'Pendiente' : nuevoEstado === ESTADOS.PROCESO ? 'En Proceso' : 'Completado'}`, 'success');
        render();
        showLoading(false);
    } catch (err) {
        toast('Error al actualizar estado: ' + err.message, 'error');
        showLoading(false);
    }
}

export async function deleteRegistro(id) {
    if (!confirm('⚠️ ¿Eliminar este pedido permanentemente?\n\nEsta acción no se puede deshacer.')) return;
    showLoading(true);
    try {
        const { data, error } = await sbAdmin.rpc('eliminar_pedido_completo', { p_pedido_id: id });
        if (error) { 
            toast('Error al eliminar: ' + error.message, 'error'); 
            showLoading(false); 
            return; 
        }
        await loadAdminData();
        if (state.tab === 'reportes') await loadReporte();
        render();
        toast(`✅ Pedido eliminado correctamente`, 'success');
        showLoading(false);
    } catch (err) {
        toast('Error al eliminar: ' + err.message, 'error');
        showLoading(false);
    }
}