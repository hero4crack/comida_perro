// ═══════════════════════════════════════════════════════════════════
//  PRECIOS SERVICE — Configuración y cálculo de precios
//  CRUD sobre la tabla `config_precios` + invocación del RPC
//  `calcular_precio_pedido` en Supabase.
// ═══════════════════════════════════════════════════════════════════

/**
 * Carga todas las configuraciones de precio ordenadas.
 */
async function loadPreciosConfig() {
    try {
        const { data, error } = await sbAdmin
            .from('config_precios')
            .select('*')
            .order('sabor')
            .order('periodo_porcion')
            .order('gramos_min');

        if (error) {
            console.error('❌ Error cargando precios:', error);
            return [];
        }

        return data || [];
    } catch (err) {
        console.error('❌ Error en loadPreciosConfig:', err);
        return [];
    }
}

/**
 * Inserta o actualiza (upsert) una configuración de precio.
 * @param {Object} data { sabor, periodo_porcion, gramos_min, gramos_max, precio_por_gramo, precio_base }
 * @returns {Promise<boolean>}
 */
async function savePrecioConfig(data) {
    showLoading(true);

    try {
        const { error } = await sbAdmin
            .from('config_precios')
            .upsert([data], {
                onConflict: 'sabor,periodo_porcion,gramos_min,gramos_max',
                ignoreDuplicates: false
            });

        if (error) {
            console.error('❌ Error guardando precio:', error);
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
        console.error('❌ Error en savePrecioConfig:', err);
        toast('Error al guardar: ' + err.message, 'error');
        showLoading(false);
        return false;
    }
}

/**
 * Elimina una configuración de precio por ID.
 */
async function deletePrecioConfig(id) {
    if (!confirm('⚠️ ¿Eliminar esta configuración de precio?')) {
        return;
    }

    showLoading(true);

    try {
        const { error } = await sbAdmin
            .from('config_precios')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('❌ Error eliminando precio:', error);
            toast('Error al eliminar: ' + error.message, 'error');
            showLoading(false);
            return;
        }

        toast('✅ Configuración eliminada', 'success');
        state.preciosConfig = await loadPreciosConfig();
        render();
        showLoading(false);

    } catch (err) {
        console.error('❌ Error en deletePrecioConfig:', err);
        toast('Error al eliminar: ' + err.message, 'error');
        showLoading(false);
    }
}

/**
 * Calcula el precio de un pedido usando el RPC de Supabase.
 * @param {string} sabor
 * @param {string} periodoPorcion  'Diaria' | 'Semanal' | 'Mensual'
 * @param {number|string} cantidadGramos
 * @returns {Promise<number>}
 */
async function calcularPrecio(sabor, periodoPorcion, cantidadGramos) {
    try {
        const { data, error } = await sbAdmin.rpc('calcular_precio_pedido', {
            p_sabor: sabor,
            p_periodo_porcion: periodoPorcion,
            p_cantidad_gramos: parseInt(cantidadGramos) || 0
        });

        if (error) {
            console.error('❌ Error calculando precio:', error);
            return 0;
        }

        return data || 0;
    } catch (err) {
        console.error('❌ Error en calcularPrecio:', err);
        return 0;
    }
}
