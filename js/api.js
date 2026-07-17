// ═══════════════════════════════════════════════════════════════════
//  API CALLS
// ═══════════════════════════════════════════════════════════════════

// ─── Cliente API ───
async function loadClienteData() {
    const uid = state.user.id;
    const [mRes, pRes] = await Promise.all([
        sbAdmin.from('mascotas').select('*').eq('cliente_id', uid).order('created_at', { ascending: false }),
        sbAdmin.from('pedidos').select('*, mascota:mascotas(id,nombre,tipo,raza,peso_kg)').eq('cliente_id', uid).order('created_at', { ascending: false }),
    ]);
    state.mascotas = mRes.data || [];
    state.pedidos = pRes.data || [];
    render();
}

async function savePet(form) {
    const { error } = await sbAdmin.from('mascotas').insert([{
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
        picky_eater: form.picky_eater || false,
        alergias: form.alergias || null,
    }]);
    if (error) return toast(error.message, 'error');
    toast('Mascota registrada');
    state.showPetForm = false;
    loadClienteData();
}

async function deletePet(id) {
    const { error } = await sbAdmin.from('mascotas').delete().eq('id', id);
    if (error) return toast(error.message, 'error');
    toast('Mascota eliminada');
    loadClienteData();
}

async function placeOrder(form) {
    const { error } = await sbAdmin.from('pedidos').insert([{
        cliente_id: state.user.id,
        mascota_id: form.mascota_id,
        sabor: form.sabor,
        periodo_porcion: form.periodo_porcion,
        cantidad_gramos: parseInt(form.cantidad_gramos) || 0,
        metodo_pago: form.metodo_pago,
        fecha_entrega: form.fecha_entrega,
        nro_lote: form.nro_lote,
        monto_total: parseFloat(form.monto_total) || 0,
    }]);
    if (error) return toast(error.message, 'error');
    toast('Pedido realizado');
    state.tab = 'historial';
    loadClienteData();
}

// ─── Admin API ───
async function loadAdminData() {
    const { data } = await sbAdmin.from('pedidos').select(`
        *, 
        cliente:clientes(id,nombre_propietario,email,telefono,direccion),
        mascota:mascotas(id,nombre,tipo,raza,peso_kg,actividad_fisica,picky_eater,condicion_medica,alergias)
    `).order('created_at', { ascending: false });
    state.allPedidos = data || [];
    render();
}

async function loadReporte() {
    let q = sbAdmin.from('pedidos').select(`
        *, 
        cliente:clientes(id,nombre_propietario,email,telefono),
        mascota:mascotas(id,nombre,tipo,raza)
    `).order('fecha_entrega', { ascending: true });
    
    if (state.desde) q = q.gte('fecha_entrega', state.desde);
    if (state.hasta) q = q.lte('fecha_entrega', state.hasta);
    
    const { data } = await q;
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
    render();
}

async function deleteRegistro(id) {
    if (!confirm('¿Eliminar este registro?')) return;
    
    const { data: ped } = await sbAdmin.from('pedidos')
        .select('mascota_id,cliente_id')
        .eq('id', id)
        .single();
        
    if (ped) {
        await sbAdmin.from('pedidos').delete().eq('id', id);
        await sbAdmin.from('mascotas').delete().eq('id', ped.mascota_id);
        
        const { data: other } = await sbAdmin.from('mascotas')
            .select('id')
            .eq('cliente_id', ped.cliente_id);
            
        if (!other || other.length === 0) {
            await sbAdmin.from('clientes').delete().eq('id', ped.cliente_id);
        }
    }
    
    toast('Eliminado');
    loadAdminData();
}