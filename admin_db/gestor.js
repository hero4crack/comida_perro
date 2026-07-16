// ==============================================================================
// GESTOR DE DATOS - LÓGICA DE INTERFAZ (ADAPTADA A NATURALPET)
// ==============================================================================

let tablaInteractiva; 
let tablaResultadoSQL;
let tablaActual = 'clientes';

// 1. Esquema de columnas mapeado directamente de la base de datos de mascotas
const configuracionColumnas = {
    clientes: [
        {title: "ID Cliente", field: "id", width: 150, headerSort: false},
        {title: "Nombre Dueño", field: "nombre_propietario", editor: "input", headerFilter: "input"},
        {title: "Correo Electrónico", field: "email", editor: "input"},
        {title: "Teléfono", field: "telefono", editor: "input"},
        {title: "Dirección", field: "direccion", editor: "input"},
        {title: "Fecha Registro", field: "created_at", width: 180, editor: false}
    ],
    mascotas: [
        {title: "ID Mascota", field: "id", width: 120, headerSort: false},
        {title: "Cliente ID", field: "cliente_id", editor: "input", width: 120},
        {title: "Nombre", field: "nombre", editor: "input", headerFilter: "input"},
        {title: "Tipo", field: "tipo", editor: "list", editorParams: {values: ["Perro", "Gato"]}, width: 90},
        {title: "Raza", field: "raza", editor: "input"},
        {title: "Edad (Años)", field: "edad_anios", editor: "number", width: 110},
        {title: "Edad (Meses)", field: "edad_meses", editor: "number", width: 110},
        {title: "Peso (Kg)", field: "peso_kg", editor: "number", width: 100},
        {title: "Sexo", field: "sexo", editor: "list", editorParams: {values: ["Macho", "Hembra"]}, width: 100},
        {title: "Actividad Física", field: "actividad_fisica", editor: "list", editorParams: {values: ["Alta", "Media", "Baja"]}, width: 130},
        {title: "Picky Eater?", field: "picky_eater", editor: "tickCross", formatter: "tickCross", width: 110},
        {title: "Alergias", field: "alergias", editor: "input"},
        {title: "Condición Médica", field: "condicion_medica", editor: "input"}
    ],
    pedidos: [
        {title: "ID Pedido", field: "id", width: 120, headerSort: false},
        {title: "Cliente ID", field: "cliente_id", width: 120},
        {title: "Mascota ID", field: "mascota_id", width: 120},
        {title: "Sabor", field: "sabor", editor: "list", editorParams: {values: ["Carne", "Pollo", "Mixta", "Personalizada"]}, width: 120},
        {title: "Porción", field: "periodo_porcion", editor: "list", editorParams: {values: ["Diaria", "Semanal", "Mensual"]}, width: 110},
        {title: "Cantidad (g)", field: "cantidad_gramos", editor: "number", width: 120},
        {title: "Método Pago", field: "metodo_pago", editor: "list", editorParams: {values: ["Efectivo", "Transferencia", "Tarjeta", "Yape", "Plin"]}, width: 120},
        {title: "Monto Total", field: "monto_total", editor: "number", width: 110},
        {title: "Lote Nro", field: "nro_lote", editor: "input", width: 110},
        {title: "Fecha Entrega", field: "fecha_entrega", editor: "date", width: 130}
    ],
    reporte_ventas_diarias: [
        {title: "Fecha", field: "fecha", width: 130},
        {title: "Total Pedidos", field: "total_pedidos", width: 130},
        {title: "Ventas Totales ($)", field: "ventas_totales", width: 150},
        {title: "Top 3 Sabores (JSON)", field: "top_sabores", formatter: "textarea"}
    ]
};

// 2. Función para alternar entre tablas
async function cambiarTabla(nombreTabla, boton) {
    tablaActual = nombreTabla;

    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    if(boton) boton.classList.add('active');

    try {
        // Consultar los datos de Supabase usando el cliente global de `supabase-config.js`
        const { data, error } = await supabase.from(nombreTabla).select('*');
        
        if (error) {
            console.error("Error cargando tabla:", error);
            alert("Error al conectar con la tabla: " + error.message);
            return;
        }

        if (tablaInteractiva) tablaInteractiva.destroy();

        // Inicializar Tabulator con la configuración de la tabla seleccionada
        tablaInteractiva = new Tabulator("#tabla-contenedor", {
            data: data,
            layout: "fitColumns",
            responsiveLayout: "hide",
            pagination: "local",
            paginationSize: 15,
            placeholder: "No hay registros en esta tabla",
            columns: configuracionColumnas[nombreTabla]
        });

        // Habilitar autoguardado al editar (solo si no es la vista de Reportes que es de solo lectura)
        if (nombreTabla !== 'reporte_ventas_diarias') {
            tablaInteractiva.on("cellEdited", async function(cell) {
                let filaDatos = cell.getRow().getData();
                let columnaModificada = cell.getField();
                let nuevoValor = cell.getValue();

                const { error: updateError } = await supabase
                    .from(tablaActual)
                    .update({ [columnaModificada]: nuevoValor })
                    .eq('id', filaDatos.id);

                if (updateError) {
                    console.error("Error al actualizar Supabase:", updateError);
                    alert("No se pudo guardar el cambio en el servidor: " + updateError.message);
                    cell.restoreOldValue(); 
                } else {
                    console.log(`¡Modificado con éxito! [${tablaActual}] -> ID: ${filaDatos.id}`);
                }
            });
        }
    } catch (err) {
        console.error("Error general:", err);
    }
}

// 3. Ejecutar consultas SQL directas con PODER TOTAL en PostgreSQL (vía RPC)
async function ejecutarSQL() {
    const query = document.getElementById("sql-query").value.trim();
    const errorBox = document.getElementById("sql-error");
    const resultadoDiv = document.getElementById("tabla-sql-resultado");

    errorBox.style.display = "none";
    resultadoDiv.innerHTML = "<span style='color: #aaa;'>Ejecutando sentencia en Supabase...</span>";

    if (!query) {
        alert("Por favor, escribe una consulta SQL primero.");
        resultadoDiv.innerHTML = "";
        return;
    }

    try {
        // Llamamos a la función almacenada de Postgres que creamos con SECURITY DEFINER
        const { data, error } = await supabase.rpc('exec_sql_temp', { 
            sql_query: query 
        });

        resultadoDiv.innerHTML = "";

        // Si la base de datos o la función retornaron un error
        if (error || (data && data.error)) {
            const errorMsg = error ? error.message : data.error;
            errorBox.innerText = "Error de Sintaxis / Privilegios SQL: \n" + errorMsg;
            errorBox.style.display = "block";
            return;
        }

        // Si todo salió bien y devolvió filas (como un SELECT o INSERT...RETURNING)
        if (Array.isArray(data) && data.length > 0) {
            const columnasDinamicas = Object.keys(data[0]).map(key => {
                return { title: key.toUpperCase(), field: key, headerSort: true };
            });

            if (tablaResultadoSQL) tablaResultadoSQL.destroy();

            tablaResultadoSQL = new Tabulator("#tabla-sql-resultado", {
                data: data,
                layout: "fitColumns",
                pagination: "local",
                paginationSize: 5,
                columns: columnasDinamicas
            });
        } else {
            // Si fue un INSERT, UPDATE, DELETE o DDL (CREATE/DROP) exitoso que no devuelve filas
            resultadoDiv.innerHTML = `<div style="color: #00ff66; padding: 10px; background: #152515; border-radius:4px; font-size:14px;">
                ✓ Comando SQL ejecutado con éxito (0 filas devueltas).
            </div>`;
            
            // Recargar automáticamente la pestaña interactiva de arriba por si se alteraron datos
            const botonActivo = document.querySelector('.tab-btn.active');
            if (botonActivo) {
                cambiarTabla(tablaActual, botonActivo);
            }
        }

    } catch (err) {
        resultadoDiv.innerHTML = "";
        errorBox.innerText = "Error inesperado en la consulta: \n" + err.message;
        errorBox.style.display = "block";
    }
}

// 4. Cargar tabla por defecto al iniciar
document.addEventListener("DOMContentLoaded", () => {
    const primerBoton = document.querySelector('.tab-btn');
    if (primerBoton) {
        cambiarTabla('clientes', primerBoton);
    }
});

// Exponer funciones globalmente para el HTML
window.cambiarTabla = cambiarTabla;
window.ejecutarSQL = ejecutarSQL;