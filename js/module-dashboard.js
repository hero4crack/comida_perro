// ==============================================================================
// MÓDULO 3: DASHBOARD Y ESTADÍSTICAS
// Desarrollador asignado: [Nombre Dev 2 / Dev 1]
// ==============================================================================

window.addEventListener('loadDashboardView', initDashboardModule);

async function initDashboardModule() {
    await cargarReporteDiario();
    await cargarUltimosPedidos();
}

async function cargarReporteDiario() {
    const hoy = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD

    // Llamamos a la Vista que creamos en SQL
    const { data, error } = await supabase
        .from('reporte_ventas_diarias')
        .select('*')
        .eq('fecha', hoy)
        .single(); // Solo una fila por día

    if (error && error.code !== 'PGRST116') { // PGRST116 = No se encontraron filas
        return console.error(error);
    }

    if (data) {
        document.getElementById('dash-ventas').textContent = `S/ ${parseFloat(data.ventas_totales).toFixed(2)}`;
        document.getElementById('dash-pedidos').textContent = data.total_pedidos;
        
        // Parsear el JSONB del top sabores
        const topSabores = data.top_sabores;
        if (topSabores && topSabores.length > 0) {
            document.getElementById('dash-top-sabor').textContent = topSabores[0].sabor;
        } else {
            document.getElementById('dash-top-sabor').textContent = 'Sin datos';
        }
    } else {
        document.getElementById('dash-ventas').textContent = 'S/ 0.00';
        document.getElementById('dash-pedidos').textContent = '0';
        document.getElementById('dash-top-sabor').textContent = '-';
    }
}

async function cargarUltimosPedidos() {
    const { data, error } = await supabase
        .from('pedidos')
        .select(`
            fecha_entrega, 
            monto_total, 
            nro_lote, 
            sabor,
            mascotas ( nombre, clientes ( nombre_propietario ) )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) return console.error(error);

    const tbody = document.getElementById('dash-tabla-pedidos');
    tbody.innerHTML = '';

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="px-6 py-4 text-center text-gray-500">No hay pedidos registrados.</td></tr>';
        return;
    }

    data.forEach(p => {
        tbody.innerHTML += `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm">${p.fecha_entrega}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">${p.mascotas.clientes.nombre_propietario}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">${p.mascotas.nombre}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm"><span class="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">${p.sabor}</span></td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">S/ ${parseFloat(p.monto_total).toFixed(2)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-xs text-gray-500">${p.nro_lote}</td>
            </tr>
        `;
    });
}