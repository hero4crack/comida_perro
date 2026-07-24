// ═══════════════════════════════════════════════════════════════════
//  DATA SERVICE — Carga de datos desde Supabase
//  Funciones de lectura para cliente (mascotas + pedidos propios),
//  admin (todos los pedidos) y reporte (ventas por día).
// ═══════════════════════════════════════════════════════════════════

/**
 * Carga las mascotas y pedidos del cliente actual.
 */
async function loadClienteData() {
    if (!state.user) {
        console.log('⚠️ No hay usuario, no se cargan datos');
        return;
    }

    const uid = state.user.id;
    console.log('📊 Cargando datos del cliente:', uid);

    try {
        const { data: mascotas, error: mErr } = await sbAdmin
            .from('mascotas')
            .select('*')
            .eq('cliente_id', uid)
            .order('created_at', { ascending: false });

        if (mErr) {
            console.error('❌ Error cargando mascotas:', mErr);
            state.mascotas = [];
        } else {
            state.mascotas = mascotas || [];
        }

        const { data: pedidos, error: pErr } = await sbAdmin
            .from('pedidos')
            .select('*, mascota:mascotas(id,nombre,tipo,raza,peso_kg)')
            .eq('cliente_id', uid)
            .order('created_at', { ascending: false });

        if (pErr) {
            console.error('❌ Error cargando pedidos:', pErr);
            state.pedidos = [];
        } else {
            state.pedidos = pedidos || [];
        }

        console.log(`📊 Datos cargados: ${state.mascotas.length} mascotas, ${state.pedidos.length} pedidos`);

    } catch (err) {
        console.error('❌ Error cargando datos:', err);
        state.mascotas = [];
        state.pedidos = [];
    }
}

/**
 * Carga TODOS los pedidos (vista admin) con cliente + mascota.
 */
async function loadAdminData() {
    console.log('📊 Cargando datos del admin...');
    try {
        const { data, error } = await sbAdmin
            .from('pedidos')
            .select(`
                *,
                cliente:clientes(id,nombre_propietario,email,telefono,direccion),
                mascota:mascotas(id,nombre,tipo,raza,peso_kg,actividad_fisica,picky_eater,condicion_medica,alergias)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('❌ Error cargando pedidos admin:', error);
            state.allPedidos = [];
        } else {
            state.allPedidos = data || [];
            state.allPedidos.forEach(p => {
                if (!p.estado) {
                    p.estado = ESTADOS.PENDIENTE;
                }
            });
        }

        console.log(`📊 ${state.allPedidos.length} pedidos cargados`);
    } catch (err) {
        console.error('❌ Error en loadAdminData:', err);
        state.allPedidos = [];
    }
}

/**
 * Carga el reporte de ventas agrupado por día (solo pedidos completados).
 * Respeta state.desde / state.hasta como filtros de fecha.
 */
async function loadReporte() {
    try {
        let q = sbAdmin
            .from('pedidos')
            .select(`
                *,
                cliente:clientes(id,nombre_propietario,email,telefono),
                mascota:mascotas(id,nombre,tipo,raza)
            `)
            .eq('estado', ESTADOS.COMPLETADO)
            .order('fecha_entrega', { ascending: true });

        if (state.desde) q = q.gte('fecha_entrega', state.desde);
        if (state.hasta) q = q.lte('fecha_entrega', state.hasta);

        const { data, error } = await q;

        if (error) {
            console.error('❌ Error cargando reporte:', error);
            state.reporte = [];
            state.resumen = { total_general: 0, total_pedidos: 0, total_dias: 0 };
            return;
        }

        const pedidos = data || [];
        const dias = {};

        pedidos.forEach(p => {
            if (!dias[p.fecha_entrega]) {
                dias[p.fecha_entrega] = {
                    fecha: p.fecha_entrega,
                    total_ventas: 0,
                    cantidad_pedidos: 0,
                    pedidos: []
                };
            }
            dias[p.fecha_entrega].total_ventas += Number(p.monto_total);
            dias[p.fecha_entrega].cantidad_pedidos++;
            dias[p.fecha_entrega].pedidos.push(p);
        });

        state.reporte = Object.values(dias).sort((a, b) => a.fecha.localeCompare(b.fecha));
        state.resumen = {
            total_general: state.reporte.reduce((s, d) => s + d.total_ventas, 0),
            total_pedidos: state.reporte.reduce((s, d) => s + d.cantidad_pedidos, 0),
            total_dias: state.reporte.length,
        };

        console.log(`📊 Reporte: ${state.reporte.length} días, ${state.resumen.total_pedidos} pedidos`);
    } catch (err) {
        console.error('❌ Error en loadReporte:', err);
        state.reporte = [];
        state.resumen = { total_general: 0, total_pedidos: 0, total_dias: 0 };
    }
}
