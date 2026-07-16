// ==============================================================================
// MÓDULO 1: REGISTRO DE CLIENTES Y MASCOTAS
// Desarrollador asignado: [Nombre Dev 1]
// ==============================================================================

window.addEventListener('loadRegistroView', initRegistroModule);

function initRegistroModule() {
    const form = document.getElementById('form-cliente-mascota');
    if (!form) return;

    // Limpiar formulario al entrar a la vista
    form.reset();

    form.addEventListener('submit', handleRegistroSubmit);
}

async function handleRegistroSubmit(e) {
    e.preventDefault();
    
    // 1. Insertar Cliente
    const clienteData = {
        nombre_propietario: document.getElementById('cli-nombre').value,
        email: document.getElementById('cli-email').value || null,
        telefono: document.getElementById('cli-telefono').value
    };

    const { data: cliente, error: errorCli } = await supabase
        .from('clientes')
        .insert([clienteData])
        .select()
        .single();

    if (errorCli) return showToast('Error al registrar cliente: ' + errorCli.message, true);

    // 2. Insertar Mascota vinculada al cliente
    const mascotaData = {
        cliente_id: cliente.id,
        nombre: document.getElementById('mas-nombre').value,
        tipo: document.getElementById('mas-tipo').value,
        peso_kg: parseFloat(document.getElementById('mas-peso').value),
        sexo: document.getElementById('mas-sexo').value,
        edad_anios: parseInt(document.getElementById('mas-anios').value) || 0,
        edad_meses: parseInt(document.getElementById('mas-meses').value) || 0,
        raza: document.getElementById('mas-raza').value || null,
        actividad_fisica: document.getElementById('mas-actividad').value,
        alergias: document.getElementById('mas-alergias').value || null,
        condicion_medica: document.getElementById('mas-condicion').value || null,
        picky_eater: document.getElementById('mas-picky').checked
    };

    const { error: errorMas } = await supabase
        .from('mascotas')
        .insert([mascotaData]);

    if (errorMas) return showToast('Error al registrar mascota: ' + errorMas.message, true);

    showToast('¡Propietario y Mascota registrados con éxito!');
    e.target.reset();
}