// Variables globales
let tablaInteractiva = null;
let tablaResultadoSQL = null;
let tablaActual = 'pedidos';
let datosCache = {};

// 1. Configuración de columnas para las tablas conocidas (se conserva tu diseño)
const configuracionColumnas = {
    // Tabla de PEDIDOS (principal)
    pedidos: [
        {title: "ID", field: "id", width: 80, headerSort: false, formatter: "rownum"},
        {title: "Lote", field: "nro_lote", width: 130, headerFilter: "input"},
        {title: "Cliente", field: "cliente_nombre", editor: "input", headerFilter: "input"},
        {title: "Mascota", field: "mascota_nombre", editor: "input", headerFilter: "input"},
        {title: "Peso (kg)", field: "peso", editor: "number", width: 90},
        {title: "Sabor", field: "sabor", editor: "list", editorParams: {values: ["Carne", "Pollo", "Mixta", "Personalizada"]}, width: 120},
        {title: "Entrega", field: "fecha_entrega", editor: "date", width: 110},
        {title: "Diaria (g)", field: "porcion_diaria", width: 90},
        {title: "Semanal (kg)", field: "porcion_semanal", width: 100},
        {title: "Mensual (kg)", field: "porcion_mensual", width: 100},
        {title: "Estado", field: "estado", editor: "list", editorParams: {values: ["Pendiente", "En Curso", "Completado"]}, formatter: "lookup", formatterParams: {
            "Pendiente": "⏳ Pendiente",
            "En Curso": "🔄 En Curso",
            "Completado": "✅ Completado"
        }, width: 130},
        {title: "Pago", field: "metodo_pago", width: 120},
        {title: "Creado", field: "creado_en", width: 150, formatter: "datetime", formatterParams: {outputFormat: "DD/MM/YYYY HH:MM"}}
    ],
    
    // Tabla de MASCOTAS
    mascotas: [
        {title: "ID", field: "id", width: 80, headerSort: false, formatter: "rownum"},
        {title: "Nombre", field: "mascota_nombre", editor: "input", headerFilter: "input"},
        {title: "Propietario", field: "propietario_nombre", editor: "input", headerFilter: "input"},
        {title: "Edad", field: "edad", editor: "number", width: 70},
        {title: "Peso (kg)", field: "peso", editor: "number", width: 90},
        {title: "Sexo", field: "sexo", editor: "list", editorParams: {values: ["Macho", "Hembra"]}, width: 90},
        {title: "Raza", field: "raza", editor: "input", headerFilter: "input"},
        {title: "Actividad", field: "actividad_fisica", editor: "list", editorParams: {values: ["Alta", "Media", "Baja"]}, width: 100},
        {title: "Condiciones", field: "condiciones_medicas", editor: "input"},
        {title: "Picky", field: "picky_eater", editor: "tickCross", formatter: "tickCross", width: 80},
        {title: "Alergias", field: "alergias", editor: "input"},
        {title: "Sabor Pref.", field: "sabor_preferido", editor: "list", editorParams: {values: ["Carne", "Pollo", "Mixta", "Personalizada"]}, width: 110}
    ],
    
    // Tabla de CLIENTES (basado en usuarios)
    clientes: [
        {title: "ID", field: "id", width: 80, headerSort: false, formatter: "rownum"},
        {title: "Nombre", field: "nombre_completo", editor: "input", headerFilter: "input"},
        {title: "Email", field: "correo", editor: "input", headerFilter: "input"},
        {title: "Teléfono", field: "telefono", editor: "input"},
        {title: "Rol", field: "rol", editor: "list", editorParams: {values: ["cliente", "admin", "operador"]}, width: 110},
        {title: "Activo", field: "activo", editor: "tickCross", formatter: "tickCross", width: 90},
        {title: "Creado", field: "creado_en", width: 150, formatter: "datetime", formatterParams: {outputFormat: "DD/MM/YYYY"}}
    ],
    
    // Tabla de RECETAS
    recetas: [
        {title: "ID", field: "id", width: 80, headerSort: false, formatter: "rownum"},
        {title: "Nombre", field: "nombre", editor: "input", headerFilter: "input"},
        {title: "Ingredientes", field: "ingredientes", editor: "input"},
        {title: "% Carne", field: "proporcion_carne", editor: "number", width: 90},
        {title: "% Vegetales", field: "proporcion_vegetales", editor: "number", width: 100},
        {title: "% Cereales", field: "proporcion_cereales", editor: "number", width: 100},
        {title: "Calorías/g", field: "calorias_por_gramo", editor: "number", width: 100},
        {title: "Activa", field: "activo", editor: "tickCross", formatter: "tickCross", width: 80}
    ]
};

// 1.1. NUEVO: Crear pestañas de navegación dinámicamente
async function inicializarPestañasDinamicas() {
    const contenedorTabs = document.querySelector('.tabs');
    if (!contenedorTabs) return;

    try {
        // Llamamos a la función de Postgres para que nos de las tablas reales de la DB
        const { data: tablas, error } = await supabaseAdminPanel.rpc('obtener_todas_las_tablas');

        if (error) {
            console.error("❌ Error obteniendo la lista de tablas:", error);
            // Fallback: usar las tablas que tenemos en nuestra configuración local si falla la llamada RPC
            pintarBotonesPestaña(Object.keys(configuracionColumnas));
            return;
        }

        // Extraer los nombres y pintar
        const nombresTablas = tablas.map(t => t.nombre_tabla);
        pintarBotonesPestaña(nombresTablas);

    } catch (err) {
        console.error("❌ Falló la inicialización dinámica de pestañas:", err);
        pintarBotonesPestaña(Object.keys(configuracionColumnas));
    }
}

// Auxiliar para inyectar los botones de las pestañas en el HTML
function pintarBotonesPestaña(listaTablas) {
    const contenedorTabs = document.querySelector('.tabs');
    if (!contenedorTabs) return;

    contenedorTabs.innerHTML = ''; // Vaciar estáticos

    listaTablas.forEach((nombre, index) => {
        const boton = document.createElement('button');
        boton.className = `tab-btn ${nombre === tablaActual ? 'active' : ''}`;
        boton.textContent = nombre.charAt(0).toUpperCase() + nombre.slice(1);
        boton.onclick = () => cambiarTabla(nombre, boton);
        contenedorTabs.appendChild(boton);
    });
}

// 2. Función para cambiar de tabla
async function cambiarTabla(nombreTabla, boton) {
    if (!puedeEditarPanel()) {
        alert('⚠️ Solo el administrador autenticado puede ver y editar este panel.');
        return;
    }

    tablaActual = nombreTabla;

    // Actualizar pestañas
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    if (boton) {
        boton.classList.add('active');
    } else {
        // Si se llamó sin botón (ej. al inicio), buscar y activar el botón correcto
        const botones = document.querySelectorAll('.tab-btn');
        botones.forEach(btn => {
            if (btn.textContent.toLowerCase() === nombreTabla.toLowerCase()) {
                btn.classList.add('active');
            }
        });
    }

    try {
        // Obtener datos de la tabla
        const { data, error } = await supabaseAdminPanel.from(nombreTabla).select('*');
        
        if (error) {
            console.error("❌ Error cargando tabla:", error);
            alert("Error al conectar con la tabla: " + error.message);
            return;
        }

        // Guardar en caché
        datosCache[nombreTabla] = data;

        // Obtener columnas configuradas
        let columnas = configuracionColumnas[nombreTabla] || [];
        
        if (columnas.length === 0 && data && data.length > 0) {
            // Si no hay configuración preestablecida (¡Es una tabla nueva!), crear columnas dinámicas automáticamente
            columnas = Object.keys(data[0]).map(key => ({
                title: key.replace(/_/g, ' ').toUpperCase(),
                field: key,
                editor: "input",
                headerFilter: "input" // Les agregamos filtro de cabecera por defecto para mantener el estándar
            }));
        }

        // Destruir tabla anterior si existe
        if (tablaInteractiva) {
            tablaInteractiva.destroy();
            tablaInteractiva = null;
        }

        // Crear nueva tabla
        tablaInteractiva = new Tabulator("#tabla-contenedor", {
            data: data || [],
            layout: "fitColumns",
            responsiveLayout: "hide",
            pagination: "local",
            paginationSize: 20,
            placeholder: "📭 No hay registros en esta tabla",
            columns: columnas,
            height: "500px",
            rowFormatter: function(row) {
                // Colorear filas según estado en pedidos
                if (nombreTabla === 'pedidos') {
                    const estado = row.getData().estado;
                    if (estado === 'Pendiente') {
                        row.getElement().style.backgroundColor = '#2a1a1a';
                    } else if (estado === 'En Curso') {
                        row.getElement().style.backgroundColor = '#1a2a1a';
                    } else if (estado === 'Completado') {
                        row.getElement().style.backgroundColor = '#1a2a2a';
                    }
                }
            }
        });

        // Evento de auto-guardado al editar
        tablaInteractiva.on("cellEdited", async function(cell) {
            const filaDatos = cell.getRow().getData();
            const columnaModificada = cell.getField();
            const nuevoValor = cell.getValue();

            // Verificar que tenga ID
            if (!filaDatos.id) {
                alert('❌ No se puede editar: el registro no tiene ID');
                cell.restoreOldValue();
                return;
            }

            try {
                const { error: updateError } = await supabaseAdminPanel
                    .from(tablaActual)
                    .update({ [columnaModificada]: nuevoValor })
                    .eq('id', filaDatos.id);

                if (updateError) {
                    console.error("❌ Error al actualizar:", updateError);
                    alert("No se pudo guardar el cambio: " + updateError.message);
                    cell.restoreOldValue();
                } else {
                    console.log(`✅ Actualizado [${tablaActual}] ID: ${filaDatos.id} - ${columnaModificada}: ${nuevoValor}`);
                    // Actualizar estadísticas si es pedidos
                    if (tablaActual === 'pedidos') {
                        actualizarEstadisticas();
                    }
                }
            } catch (err) {
                console.error("❌ Error:", err);
                alert("Error al guardar: " + err.message);
                cell.restoreOldValue();
            }
        });

        // Actualizar estadísticas
        if (nombreTabla === 'pedidos') {
            actualizarEstadisticas();
        }

        console.log(`✅ Tabla "${nombreTabla}" cargada con ${data?.length || 0} registros`);

    } catch (err) {
        console.error("❌ Error cargando tabla:", err);
        alert("Error al cargar la tabla: " + err.message);
    }
}

// 3. Función para actualizar estadísticas
async function actualizarEstadisticas() {
    try {
        const { data, error } = await supabaseAdminPanel
            .from('pedidos')
            .select('estado');
        
        if (error) throw error;

        const pendientes = data.filter(p => p.estado === 'Pendiente').length;
        const enCurso = data.filter(p => p.estado === 'En Curso').length;
        const completados = data.filter(p => p.estado === 'Completado').length;

        const statPendientes = document.getElementById('stat-pendientes');
        const statCurso = document.getElementById('stat-curso');
        const statCompletados = document.getElementById('stat-completados');
        const statTotal = document.getElementById('stat-total');
        
        if (statPendientes) statPendientes.querySelector('.stat-number').textContent = pendientes;
        if (statCurso) statCurso.querySelector('.stat-number').textContent = enCurso;
        if (statCompletados) statCompletados.querySelector('.stat-number').textContent = completados;
        if (statTotal) statTotal.querySelector('.stat-number').textContent = data.length;

    } catch (err) {
        console.error("❌ Error actualizando estadísticas:", err);
    }
}

// 4. Función para ejecutar SQL desde la consola
async function ejecutarSQL() {
    const query = document.getElementById("sql-query").value.trim();
    const errorBox = document.getElementById("sql-error");
    const resultadoDiv = document.getElementById("tabla-sql-resultado");

    // Limpiar resultados anteriores
    errorBox.style.display = "none";
    resultadoDiv.innerHTML = '<span style="color: #aaa;">⏳ Ejecutando consulta...</span>';

    if (!query) {
        alert("⚠️ Por favor, escribe una consulta SQL primero.");
        resultadoDiv.innerHTML = "";
        return;
    }

    // Verificar que sea admin
    if (!puedeEditarPanel()) {
        alert("⚠️ Solo administradores pueden ejecutar SQL");
        return;
    }

    try {
        // Detectar tipo de consulta
        const queryLower = query.toLowerCase().trim();
        const esSelect = queryLower.startsWith('select');
        const esInsert = queryLower.startsWith('insert');
        const esUpdate = queryLower.startsWith('update');
        const esDelete = queryLower.startsWith('delete');

        // Para SELECT, usar el método normal
        if (esSelect) {
            // Extraer nombre de tabla
            const match = queryLower.match(/from\s+([a-zA-Z0-9_]+)/);
            if (match) {
                const tabla = match[1];
                // Intentar ejecutar con supabase
                const { data, error } = await supabaseAdminPanel
                    .from(tabla)
                    .select('*');
                
                if (error) throw error;

                if (data && data.length > 0) {
                    // Crear columnas dinámicas
                    const columnasDinamicas = Object.keys(data[0]).map(key => ({
                        title: key.replace(/_/g, ' ').toUpperCase(),
                        field: key,
                        headerSort: true
                    }));

                    if (tablaResultadoSQL) {
                        tablaResultadoSQL.destroy();
                        tablaResultadoSQL = null;
                    }

                    tablaResultadoSQL = new Tabulator("#tabla-sql-resultado", {
                        data: data,
                        layout: "fitColumns",
                        pagination: "local",
                        paginationSize: 10,
                        columns: columnasDinamicas,
                        height: "300px"
                    });

                    resultadoDiv.innerHTML = '';
                } else {
                    resultadoDiv.innerHTML = `<div style="color: #ffaa00; padding: 10px; background: #2a2a00; border-radius:4px;">
                        ✅ Consulta ejecutada. No hay datos para mostrar.
                    </div>`;
                }
            } else {
                resultadoDiv.innerHTML = `<div style="color: #ff6600; padding: 10px; background: #2a1a00; border-radius:4px;">
                    ⚠️ No se pudo identificar la tabla en la consulta SELECT.
                </div>`;
            }
        } 
        // Para INSERT, UPDATE, DELETE
        else if (esInsert || esUpdate || esDelete) {
            // Advertencia para operaciones peligrosas
            if (esDelete) {
                if (!confirm('⚠️ ¿Estás seguro de eliminar estos registros? Esta acción no se puede deshacer.')) {
                    return;
                }
            }

            // Intentar ejecutar la consulta directamente
            // Nota: Esto funciona mejor con la función RPC exec_sql
            const { data, error } = await supabaseAdminPanel.rpc('exec_sql', {
                query: query
            });

            if (error) throw error;

            resultadoDiv.innerHTML = `<div style="color: #00ff66; padding: 10px; background: #001500; border-radius:4px; border: 1px solid #00ff66;">
                ✅ Operación ejecutada exitosamente.<br>
                ${data ? '📊 Resultado: ' + JSON.stringify(data) : ''}
            </div>`;

            // Recargar tabla actual si afecta a pedidos
            if (queryLower.includes('pedidos')) {
                setTimeout(() => recargarTablaActual(), 1000);
            }
        } 
        else {
            resultadoDiv.innerHTML = `<div style="color: #ff6600; padding: 10px; background: #2a1a00; border-radius:4px;">
                ⚠️ Tipo de consulta no soportada. Solo SELECT, INSERT, UPDATE, DELETE.
            </div>`;
        }

    } catch (err) {
        console.error("❌ Error ejecutando SQL:", err);
        resultadoDiv.innerHTML = "";
        errorBox.innerText = "❌ Error: " + err.message;
        errorBox.style.display = "block";
    }
}

// 5. Función para limpiar la consola SQL
function limpiarSQL() {
    document.getElementById("sql-query").value = '';
    document.getElementById("tabla-sql-resultado").innerHTML = '';
    document.getElementById("sql-error").style.display = 'none';
    if (tablaResultadoSQL) {
        tablaResultadoSQL.destroy();
        tablaResultadoSQL = null;
    }
}

// 6. Función para recargar tabla actual
async function recargarTablaActual() {
    if (tablaActual) {
        const botonActivo = document.querySelector(`.tab-btn.active`);
        await cambiarTabla(tablaActual, botonActivo);
    }
}

// 7. Inicialización al cargar la página
document.addEventListener("DOMContentLoaded", async () => {
    // Verificar acceso
    const acceso = await prepararAccesoPanel();
    
    if (!acceso) {
        // Mostrar formulario de login si no hay sesión
        mostrarLogin();
        return;
    }

    // Mostrar elementos
    const tabs = document.querySelector('.tabs');
    const tabla = document.getElementById('tabla-contenedor');
    const sql = document.querySelector('.sql-console');
    const stats = document.querySelector('.stats-container');
    
    if (tabs) tabs.style.display = 'flex';
    if (tabla) tabla.style.display = 'block';
    if (sql) sql.style.display = 'block';
    if (stats) stats.style.display = 'grid';

    // NUEVO: Inicializar las pestañas de forma dinámica preguntándole a Supabase
    await inicializarPestañasDinamicas();

    // Cargar primera tabla por defecto (pedidos)
    await cambiarTabla('pedidos', null);

    // Cargar estadísticas
    actualizarEstadisticas();

    console.log('✅ Panel Admin inicializado correctamente');
});

// 8. Función para mostrar login
function mostrarLogin() {
    const container = document.querySelector('.container');
    const loginHTML = `
        <div id="login-container" style="max-width: 400px; margin: 50px auto; background: #1a1a2e; padding: 30px; border-radius: 10px; border: 1px solid #2a2a4e;">
            <h2 style="color: #00d4ff; text-align: center; margin-bottom: 20px;">🔐 Acceso Admin</h2>
            <form onsubmit="handleLogin(event)" style="display: flex; flex-direction: column; gap: 15px;">
                <input type="email" id="login-email" placeholder="Email" required style="padding: 12px; border-radius: 6px; border: 1px solid #2a2a4e; background: #0a0a0a; color: white;">
                <input type="password" id="login-password" placeholder="Contraseña" required style="padding: 12px; border-radius: 6px; border: 1px solid #2a2a4e; background: #0a0a0a; color: white;">
                <button type="submit" style="padding: 12px; background: linear-gradient(135deg, #00d4ff, #7b2ffc); border: none; border-radius: 6px; color: white; font-weight: bold; cursor: pointer; font-size: 16px;">
                    Iniciar Sesión
                </button>
            </form>
            <div id="login-error" style="color: #ff4444; text-align: center; margin-top: 10px; display: none;"></div>
        </div>
    `;
    
    // Reemplazar contenido
    container.innerHTML = loginHTML;
}

// 9. Función para manejar login
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorDiv = document.getElementById('login-error');
    
    try {
        errorDiv.style.display = 'none';
        
        const { data, error } = await supabaseAdminPanel.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) throw error;
        
        // Recargar página para mostrar el panel
        window.location.reload();
        
    } catch (error) {
        errorDiv.textContent = '❌ ' + error.message;
        errorDiv.style.display = 'block';
        console.error('Error de login:', error);
    }
}

// Exponer funciones globales
window.cambiarTabla = cambiarTabla;
window.ejecutarSQL = ejecutarSQL;
window.limpiarSQL = limpiarSQL;
window.recargarTablaActual = recargarTablaActual;
window.actualizarEstadisticas = actualizarEstadisticas;
window.handleLogin = handleLogin;