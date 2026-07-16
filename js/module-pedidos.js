// ==============================================================================
// MÓDULO 2: CONFIGURACIÓN DE PEDIDOS Y CÁLCULOS
// Desarrollador asignado: [Nombre Dev 2]
// ==============================================================================

let mascotasCache = []; // Cache local para no llamar a la DB en cada cambio

window.addEventListener('loadPedidosView', initPedidosModule);

async function initPedidosModule() {
    await cargarMascotas();
    setupCalculoAutomatico();
    document.getElementById('form-pedido').addEventListener('submit', handlePedidoSubmit);
    generarLote(); // Auto-generar lote
}

async function cargarMascotas() {
    const { data, error } = await supabase
        .from('mascotas')
        .select('id, nombre, tipo, peso_kg, clientes(nombre_propietario)'); // Join implícito de Supabase

    if (error) return console.error(error);
    
    mascotasCache = data;
    const select = document.getElementById('ped-mascota-id');
    select.innerHTML = '<option value="">Seleccione una mascota...</option>';
    
    data.forEach(m => {
        select.innerHTML += `<option value="${m.id}" data-peso="${m.peso_kg}">${m.nombre} (${m.tipo}) - Dueño: ${m.clientes.nombre_propietario}</option>`;
    });
}

function setupCalculoAutomatico() {
    const selectMascota = document.getElementById('ped-mascota-id');
    const selectPeriodo = document.getElementById('ped-periodo');
    const inputCantidad = document.getElementById('ped-cantidad');

    const calcular = () => {
        const seleccionada = selectMascota.options[selectMascota.selectedIndex];
        if (!seleccionada || !seleccionada.value) return;

        const peso = parseFloat(seleccionada.dataset.peso);
        const porcionDiaria = peso * 0.03; // 3% del peso corporal
        let totalGramos = porcionDiaria * 1000; // Convertir kg a gramos

        if (selectPeriodo.value === 'Semanal') totalGramos *= 7;
        if (selectPeriodo.value === 'Mensual') totalGramos *= 30;

        inputCantidad.value = totalGramos.toFixed(0);
    };

    selectMascota.addEventListener('change', calcular);
    selectPeriodo.addEventListener('change', calcular);
}

function generarLote() {
    const now = new Date();
    const lote = `LOT-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    document.getElementById('ped-lote').value = lote;
}

async function handlePedidoSubmit(e) {
    e.preventDefault();
    
    const mascotaSeleccionada = mascotasCache.find(m => m.id === document.getElementById('ped-mascota-id').value);
    
    const pedidoData = {
        cliente_id: mascotaSeleccionada.clientes.id, // Extraído de la relación
        mascota_id: mascotaSeleccionada.id,
        sabor: document.getElementById('ped-sabor').value,
        periodo_porcion: document.getElementById('ped-periodo').value,
        cantidad_gramos: parseFloat(document.getElementById('ped-cantidad').value),
        metodo_pago: document.getElementById('ped-pago').value,
        fecha_entrega: document.getElementById('ped-fecha').value,
        nro_lote: document.getElementById('ped-lote').value,
        monto_total: parseFloat(document.getElementById('ped-monto').value)
    };

    const { error } = await supabase.from('pedidos').insert([pedidoData]);

    if (error) return showToast('Error al crear pedido: ' + error.message, true);

    showToast('¡Pedido registrado exitosamente!');
    e.target.reset();
    generarLote();
}