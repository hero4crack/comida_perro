// ═══════════════════════════════════════════════════════════════════
//  OPERACIONES SERVICE — Mutaciones de mascotas y pedidos
//  savePet, deletePet, placeOrder, updateOrderStatus, deleteRegistro.
// ═══════════════════════════════════════════════════════════════════

/**
 * Crea una nueva mascota para el cliente actual.
 * @param {Object} form  datos del formulario
 */
async function savePet(form) {
    showLoading(true);

    try {
        const clienteOk = await ensureClienteExists();
        if (!clienteOk) {
            toast('Error al verificar el cliente. Intenta de nuevo.', 'error');
            showLoading(false);
            return;
        }

        const { data: cliente, error: clienteCheck } = await sbAdmin
            .from('clientes')
            .select('id')
            .eq('id', state.user.id)
            .maybeSingle();

        if (!cliente) {
            console.error('❌ Cliente no encontrado');
            toast('Error: Cliente no encontrado. Por favor, cierra sesión y vuelve a iniciar.', 'error');
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
            alergias: form.alergias || null,
        };

        console.log('🐾 Creando mascota para cliente:', state.user.id);
        console.log('📋 Datos:', mascotaData);

        const { data: result, error } = await sbAdmin
            .from('mascotas')
            .insert([mascotaData])
            .select();

        if (error) {
            console.error('❌ Error creando mascota:', error);
            toast('Error al registrar mascota: ' + error.message, 'error');
            showLoading(false);
            return;
        }

        console.log('✅ Mascota registrada:', result);
        toast('✅ Mascota registrada exitosamente');

        state.showPetForm = false;
        await loadClienteData();
        render();

        showLoading(false);

    } catch (err) {
        console.error('❌ Error en savePet:', err);
        toast('Error al guardar: ' + err.message, 'error');
        showLoading(false);
    }
}

/**
 * Elimina una mascota (y sus pedidos asociados vía RPC).
 * @param {string} id
 */
async function deletePet(id) {
    if (!confirm('⚠️ ¿Eliminar esta mascota y todos sus pedidos asociados?')) {
        return;
    }

    showLoading(true);
    console.log('🗑️ Eliminando mascota:', id);

    try {
        const { data, error } = await sbAdmin.rpc('eliminar_mascota_completa', {
            p_mascota_id: id
        });

        if (error) {
            console.error('❌ Error eliminando mascota:', error);
            toast('Error al eliminar: ' + error.message, 'error');
            showLoading(false);
            return;
        }

        console.log('✅ Mascota eliminada:', data);

        await loadClienteData();

        if (state.view === 'admin') {
            await loadAdminData();
        }

        render();
        toast(`✅ Mascota "${data?.nombre || ''}" eliminada correctamente`, 'success');

        showLoading(false);

    } catch (err) {
        console.error('❌ Error en deletePet:', err);
        toast('Error al eliminar: ' + err.message, 'error');
        showLoading(false);
    }
}

/**
 * Crea un nuevo pedido en estado 'pendiente'.
 * @param {Object} form  datos del formulario de pedido
 */
async function placeOrder(form) {
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

        console.log('📝 Creando pedido:', pedidoData);

        const { data, error } = await sbAdmin
            .from('pedidos')
            .insert([pedidoData])
            .select();

        if (error) {
            console.error('❌ Error creando pedido:', error);
            toast(error.message, 'error');
            showLoading(false);
            return;
        }

        console.log('✅ Pedido creado:', data);
        toast('✅ Pedido realizado exitosamente (Estado: Pendiente)');
        state.tab = 'historial';
        await loadClienteData();
        render();

        showLoading(false);

    } catch (err) {
        console.error('❌ Error en placeOrder:', err);
        toast('Error al realizar pedido: ' + err.message, 'error');
        showLoading(false);
    }
}

/**
 * Actualiza el estado de un pedido usando el RPC `actualizar_estado_pedido`.
 */
async function updateOrderStatus(orderId, nuevoEstado) {
    showLoading(true);

    try {
        console.log(`📝 Intentando actualizar pedido ${orderId} a estado: ${nuevoEstado}`);

        const { data, error } = await sbAdmin.rpc('actualizar_estado_pedido', {
            p_pedido_id: orderId,
            p_nuevo_estado: nuevoEstado
        });

        if (error) {
            console.error('❌ Error actualizando estado:', error);
            toast('Error al actualizar estado: ' + error.message, 'error');
            showLoading(false);
            return;
        }

        console.log('✅ Estado actualizado:', data);

        await loadAdminData();

        if (state.tab === 'reportes') {
            await loadReporte();
        }

        const estadoLabel = nuevoEstado === ESTADOS.PENDIENTE ? 'Pendiente' :
                           nuevoEstado === ESTADOS.PROCESO ? 'En Proceso' : 'Completado';

        toast(`✅ Estado actualizado a: ${estadoLabel}`, 'success');
        render();

        showLoading(false);

    } catch (err) {
        console.error('❌ Error en updateOrderStatus:', err);
        toast('Error al actualizar estado: ' + err.message, 'error');
        showLoading(false);
    }
}

/**
 * Elimina un pedido (junto con sus dependencias vía RPC).
 */
async function deleteRegistro(id) {
    const confirmar = confirm('⚠️ ¿Eliminar este pedido permanentemente?\n\nEsta acción no se puede deshacer.');

    if (!confirmar) {
        return;
    }

    showLoading(true);
    console.log('🗑️ Eliminando pedido:', id);

    try {
        const { data, error } = await sbAdmin.rpc('eliminar_pedido_completo', {
            p_pedido_id: id
        });

        if (error) {
            console.error('❌ Error eliminando pedido:', error);
            toast('Error al eliminar: ' + error.message, 'error');
            showLoading(false);
            return;
        }

        console.log('✅ Pedido eliminado:', data);

        await loadAdminData();

        if (state.tab === 'reportes') {
            await loadReporte();
        }

        render();
        toast(`✅ Pedido eliminado correctamente`, 'success');

        showLoading(false);

    } catch (err) {
        console.error('❌ Error en deleteRegistro:', err);
        toast('Error al eliminar: ' + err.message, 'error');
        showLoading(false);
    }
}
