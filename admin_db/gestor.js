// ═══════════════════════════════════════════════════════════════════
//  GESTOR DE BASE DE DATOS - SIN AUTENTICACIÓN
// ═══════════════════════════════════════════════════════════════════

let tablaInteractiva = null;
let tablaResultadoSQL = null;
let tablaActual = 'pedidos';
let datosCache = {};

// Configuración de columnas para las tablas conocidas
const configuracionColumnas = {
    pedidos: [
        {title: "#", field: "id", width: 70, headerSort: false, formatter: "rownum"},
        {title: "Lote", field: "nro_lote", width: 130, headerFilter: "input"},
        {title: "Cliente ID", field: "cliente_id", width: 100, headerFilter: "input"},
        {title: "Mascota ID", field: "mascota_id", width: 100, headerFilter: "input"},
        {title: "Sabor", field: "sabor", editor: "list", editorParams: {values: ["Carne", "Pollo", "Mixta", "Personalizada"]}, width: 120},
        {title: "Porción", field: "periodo_porcion", editor: "list", editorParams: {values: ["Diaria", "Semanal", "Mensual"]}, width: 100},
        {title: "Gramos", field: "cantidad_gramos", editor: "number", width: 90},
        {title: "Entrega", field: "fecha_entrega", editor: "date", width: 120},
        {title: "Pago", field: "metodo_pago", editor: "list", editorParams: {values: ["Efectivo", "Transferencia", "Tarjeta"]}, width: 130},
        {title: "Monto $", field: "monto_total", editor: "number", formatter: "money", formatterParams: {decimal: ",", thousand: ".", symbol: "$"}, width: 120},
        {title: "Creado", field: "created_at", width: 150, formatter: "datetime", formatterParams: {outputFormat: "DD/MM/YYYY HH:mm"}}
    ],
    
    mascotas: [
        {title: "#", field: "id", width: 70, headerSort: false, formatter: "rownum"},
        {title: "Cliente ID", field: "cliente_id", width: 100, headerFilter: "input"},
        {title: "Nombre", field: "nombre", editor: "input", headerFilter: "input"},
        {title: "Tipo", field: "tipo", editor: "list", editorParams: {values: ["Perro", "Gato"]}, width: 80},
        {title: "Edad (años)", field: "edad_anios", editor: "number", width: 90},
        {title: "Edad (meses)", field: "edad_meses", editor: "number", width: 90},
        {title: "Peso (kg)", field: "peso_kg", editor: "number", width: 90},
        {title: "Sexo", field: "sexo", editor: "list", editorParams: {values: ["Macho", "Hembra"]}, width: 90},
        {title: "Raza", field: "raza", editor: "input", headerFilter: "input"},
        {title: "Actividad", field: "actividad_fisica", editor: "list", editorParams: {values: ["Alta", "Media", "Baja"]}, width: 100},
        {title: "Condiciones", field: "condicion_medica", editor: "input"},
        {title: "Picky", field: "picky_eater", editor: "tickCross", formatter: "tickCross", width: 80},
        {title: "Alergias", field: "alergias", editor: "input"},
        {title: "Creado", field: "created_at", width: 150, formatter: "datetime", formatterParams: {outputFormat: "DD/MM/YYYY HH:mm"}}
    ],
    
    clientes: [
        {title: "#", field: "id", width: 70, headerSort: false, formatter: "rownum"},
        {title: "Nombre", field: "nombre_propietario", editor: "input", headerFilter: "input"},
        {title: "Email", field: "email", editor: "input", headerFilter: "input"},
        {title: "Teléfono", field: "telefono", editor: "input"},
        {title: "Dirección", field: "direccion", editor: "input"},
        {title: "Rol", field: "rol", editor: "list", editorParams: {values: ["cliente", "admin"]}, width: 100},
        {title: "Creado", field: "created_at", width: 150, formatter: "datetime", formatterParams: {outputFormat: "DD/MM/YYYY HH:mm"}}
    ],
    
    profiles: [
        {title: "#", field: "id", width: 70, headerSort: false, formatter: "rownum"},
        {title: "Email", field: "email", editor: "input", headerFilter: "input"},
        {title: "Rol", field: "role", editor: "list", editorParams: {values: ["user", "admin"]}, formatter: "lookup", formatterParams: {
            "user": "👤 User",
            "admin": "👑 Admin"
        }, width: 120}
    ]
};

// Inicialización
document.addEventListener("DOMContentLoaded", async () => {
    console.log('🔄 Inicializando Admin DB...');
    
    await inicializarPestañasDinamicas();
    await cambiarTabla('pedidos');
    actualizarEstadisticas();
    
    console.log('✅ Admin DB listo');
});

// Inicializar pestañas dinámicamente
async function inicializarPestañasDinamicas() {
    try {
        const { data: tablas, error } = await supabaseAdminPanel.rpc('obtener_todas_las_tablas');
        
        if (!error && tablas && tablas.length > 0) {
            const nombresTablas = tablas.map(t => t.nombre_tabla);
            pintarBotonesPestaña(nombresTablas);
        } else {
            const tablasDefault = Object.keys(configuracionColumnas);
            pintarBotonesPestaña(tablasDefault);
        }
    } catch (err) {
        console.log('ℹ️ Usando tablas predefinidas');
        const tablasDefault = ['pedidos', 'mascotas', 'clientes', 'profiles'];
        pintarBotonesPestaña(tablasDefault);
    }
}

function pintarBotonesPestaña(listaTablas) {
    const contenedor = document.getElementById('tabs-container');
    if (!contenedor) return;

    contenedor.innerHTML = '';
    
    const iconos = {
        'pedidos': '📦',
        'mascotas': '🐕',
        'clientes': '👤',
        'profiles': '🔑',
        'recetas': '🍖'
    };

    listaTablas.forEach((nombre) => {
        const boton = document.createElement('button');
        boton.className = `tab-btn ${nombre === tablaActual ? 'active' : ''}`;
        boton.dataset.tabla = nombre;
        boton.textContent = `${iconos[nombre] || '📋'} ${nombre.charAt(0).toUpperCase() + nombre.slice(1)}`;
        boton.onclick = () => cambiarTabla(nombre);
        contenedor.appendChild(boton);
    });
}

// Cambiar de tabla
async function cambiarTabla(nombreTabla) {
    tablaActual = nombreTabla;

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tabla === nombreTabla);
    });

    try {
        let query = supabaseAdminPanel.from(nombreTabla).select('*').limit(200);
        
        const tablasConCreatedAt = ['pedidos', 'mascotas', 'clientes'];
        if (tablasConCreatedAt.includes(nombreTabla)) {
            query = query.order('created_at', { ascending: false });
        }
        
        const { data, error } = await query;

        if (error) throw error;

        datosCache[nombreTabla] = data;

        let columnas = configuracionColumnas[nombreTabla] || [];
        
        if (columnas.length === 0 && data && data.length > 0) {
            columnas = Object.keys(data[0]).map(key => ({
                title: key.replace(/_/g, ' ').toUpperCase(),
                field: key,
                editor: "input",
                headerFilter: "input"
            }));
        }

        if (tablaInteractiva) {
            tablaInteractiva.destroy();
        }

        tablaInteractiva = new Tabulator("#tabla-contenedor", {
            data: data || [],
            layout: "fitColumns",
            responsiveLayout: "hide",
            pagination: "local",
            paginationSize: 25,
            placeholder: "📭 No hay registros en esta tabla",
            columns: columnas,
            height: "500px",
            rowFormatter: function(row) {
                if (nombreTabla === 'pedidos') {
                    const estado = row.getData().estado;
                    const colores = {
                        'Pendiente': '#2a1a1a',
                        'En Curso': '#1a2a1a',
                        'Completado': '#1a2a2a'
                    };
                    row.getElement().style.backgroundColor = colores[estado] || '';
                }
                
                if (nombreTabla === 'profiles') {
                    const role = row.getData().role;
                    if (role === 'admin') {
                        row.getElement().style.backgroundColor = '#1a1a2e';
                        row.getElement().style.borderLeft = '3px solid #7b2ffc';
                    }
                }
            }
        });

        tablaInteractiva.on("cellEdited", async function(cell) {
            const filaDatos = cell.getRow().getData();
            const campo = cell.getField();
            const valor = cell.getValue();

            if (!filaDatos.id) {
                alert('❌ Registro sin ID');
                cell.restoreOldValue();
                return;
            }

            try {
                const { error: updateError } = await supabaseAdminPanel
                    .from(tablaActual)
                    .update({ [campo]: valor })
                    .eq('id', filaDatos.id);

                if (updateError) throw updateError;

                console.log(`✅ Actualizado: ${tablaActual}.${campo} = ${valor}`);
                mostrarToast(`✅ ${campo} actualizado correctamente`);
                
                if (tablaActual === 'pedidos') actualizarEstadisticas();
                
            } catch (err) {
                console.error("❌ Error al actualizar:", err);
                alert("Error al guardar: " + err.message);
                cell.restoreOldValue();
            }
        });

        console.log(`✅ Tabla "${nombreTabla}" cargada (${data?.length || 0} registros)`);

    } catch (err) {
        console.error("❌ Error cargando tabla:", err);
        document.getElementById('tabla-contenedor').innerHTML = 
            `<div style="color: #ff4444; padding: 20px; text-align: center; background: #1a0a0a; border-radius: 8px; border: 1px solid #ff4444;">
                <h3>❌ Error al cargar "${nombreTabla}"</h3>
                <p style="margin-top: 10px;">${err.message}</p>
            </div>`;
    }
}

// Actualizar estadísticas
async function actualizarEstadisticas() {
    try {
        const { data, error } = await supabaseAdminPanel
            .from('pedidos')
            .select('estado');
        
        if (error) return;

        const stats = {
            pendientes: data.filter(p => p.estado === 'Pendiente').length,
            enCurso: data.filter(p => p.estado === 'En Curso').length,
            completados: data.filter(p => p.estado === 'Completado').length,
            total: data.length
        };

        const statPendientes = document.getElementById('stat-pendientes');
        const statCurso = document.getElementById('stat-curso');
        const statCompletados = document.getElementById('stat-completados');
        const statTotal = document.getElementById('stat-total');
        
        if (statPendientes) statPendientes.querySelector('.stat-number').textContent = stats.pendientes;
        if (statCurso) statCurso.querySelector('.stat-number').textContent = stats.enCurso;
        if (statCompletados) statCompletados.querySelector('.stat-number').textContent = stats.completados;
        if (statTotal) statTotal.querySelector('.stat-number').textContent = stats.total;

    } catch (err) {
        console.error("❌ Error actualizando estadísticas:", err);
    }
}

// Ejecutar SQL - CORREGIDO
async function ejecutarSQL() {
    const query = document.getElementById("sql-query").value.trim();
    const errorBox = document.getElementById("sql-error");
    const resultadoDiv = document.getElementById("tabla-sql-resultado");

    errorBox.style.display = "none";
    resultadoDiv.innerHTML = '<span style="color: #aaa;">⏳ Ejecutando...</span>';

    if (!query) {
        resultadoDiv.innerHTML = '<span style="color: #ffaa00;">⚠️ Escribe una consulta SQL</span>';
        return;
    }

    try {
        const queryLower = query.toLowerCase().trim();
        
        if (queryLower.startsWith('select')) {
            const match = queryLower.match(/from\s+([a-zA-Z0-9_]+)/);
            if (match) {
                const tabla = match[1];
                let consulta = supabaseAdminPanel.from(tabla).select('*').limit(100);
                
                const tablasConCreatedAt = ['pedidos', 'mascotas', 'clientes'];
                if (tablasConCreatedAt.includes(tabla)) {
                    consulta = consulta.order('created_at', { ascending: false });
                }
                
                const { data, error } = await consulta;

                if (error) throw error;

                if (data && data.length > 0) {
                    if (tablaResultadoSQL) tablaResultadoSQL.destroy();
                    
                    const columnas = Object.keys(data[0]).map(key => ({
                        title: key.replace(/_/g, ' ').toUpperCase(),
                        field: key,
                        headerSort: true
                    }));

                    tablaResultadoSQL = new Tabulator("#tabla-sql-resultado", {
                        data: data,
                        layout: "fitColumns",
                        pagination: "local",
                        paginationSize: 10,
                        columns: columnas,
                        height: "300px"
                    });
                } else {
                    resultadoDiv.innerHTML = '<div style="color: #ffaa00; padding: 10px; background: #2a2a00; border-radius:4px;">✅ Consulta ejecutada. Sin resultados.</div>';
                }
            } else {
                resultadoDiv.innerHTML = '<div style="color: #ff6600; padding: 10px; background: #2a1a00; border-radius:4px;">⚠️ No se pudo identificar la tabla en la consulta.</div>';
            }
        } 
        else if (queryLower.startsWith('insert')) {
            const match = queryLower.match(/insert\s+into\s+([a-zA-Z0-9_]+)\s*\(([^)]+)\)\s*values\s*\(([^)]+)\)/i);
            if (match) {
                const tabla = match[1];
                const columnas = match[2].split(',').map(c => c.trim());
                const valores = match[3].split(',').map(v => v.trim().replace(/^['"]|['"]$/g, ''));
                
                const objeto = {};
                columnas.forEach((col, i) => {
                    let valor = valores[i] || null;
                    if (valor && valor.toLowerCase() === 'null') valor = null;
                    if (valor && !isNaN(valor) && valor !== '') valor = Number(valor);
                    objeto[col] = valor;
                });
                
                const { data, error } = await supabaseAdminPanel.from(tabla).insert([objeto]).select();
                
                if (error) throw error;
                
                resultadoDiv.innerHTML = `<div style="color: #00ff66; padding: 10px; background: #001500; border-radius:4px; border: 1px solid #00ff66;">
                    ✅ INSERT ejecutado exitosamente en "${tabla}".<br>
                    ${data ? '📊 Registro creado: ' + JSON.stringify(data[0]).substring(0, 200) : ''}
                </div>`;
                
                setTimeout(() => cambiarTabla(tablaActual), 1000);
            } else {
                resultadoDiv.innerHTML = '<div style="color: #ff6600; padding: 10px; background: #2a1a00; border-radius:4px;">⚠️ Formato INSERT no reconocido.</div>';
            }
        }
        else if (queryLower.startsWith('update')) {
            const match = queryLower.match(/update\s+([a-zA-Z0-9_]+)\s+set\s+(.+?)\s+where\s+(.+)/i);
            if (match) {
                const tabla = match[1];
                const setClause = match[2];
                const whereClause = match[3];
                
                const sets = setClause.split(',').map(s => {
                    const [col, val] = s.split('=').map(p => p.trim());
                    let valor = val.replace(/^['"]|['"]$/g, '');
                    if (valor.toLowerCase() === 'null') valor = null;
                    return { col, valor };
                });
                
                const whereMatch = whereClause.match(/([a-zA-Z0-9_]+)\s*=\s*['"]?([^'"]+)['"]?/);
                
                if (whereMatch) {
                    const whereCol = whereMatch[1];
                    const whereVal = whereMatch[2];
                    
                    const updateObj = {};
                    sets.forEach(s => { updateObj[s.col] = s.valor; });
                    
                    const { data, error } = await supabaseAdminPanel
                        .from(tabla)
                        .update(updateObj)
                        .eq(whereCol, whereVal)
                        .select();
                    
                    if (error) throw error;
                    
                    resultadoDiv.innerHTML = `<div style="color: #00ff66; padding: 10px; background: #001500; border-radius:4px; border: 1px solid #00ff66;">
                        ✅ UPDATE ejecutado exitosamente en "${tabla}".<br>
                        ${data ? '📊 Registros actualizados: ' + data.length : ''}
                    </div>`;
                    
                    setTimeout(() => cambiarTabla(tablaActual), 1000);
                } else {
                    resultadoDiv.innerHTML = '<div style="color: #ff6600; padding: 10px; background: #2a1a00; border-radius:4px;">⚠️ Cláusula WHERE no reconocida.</div>';
                }
            } else {
                resultadoDiv.innerHTML = '<div style="color: #ff6600; padding: 10px; background: #2a1a00; border-radius:4px;">⚠️ Formato UPDATE no reconocido.</div>';
            }
        }
        else if (queryLower.startsWith('delete')) {
            const match = queryLower.match(/delete\s+from\s+([a-zA-Z0-9_]+)\s+where\s+(.+)/i);
            if (match) {
                if (!confirm('⚠️ ¿Confirmas eliminar estos registros? Esta acción no se puede deshacer.')) return;
                
                const tabla = match[1];
                const whereClause = match[2];
                const whereMatch = whereClause.match(/([a-zA-Z0-9_]+)\s*=\s*['"]?([^'"]+)['"]?/);
                
                if (whereMatch) {
                    const whereCol = whereMatch[1];
                    const whereVal = whereMatch[2];
                    
                    const { error } = await supabaseAdminPanel
                        .from(tabla)
                        .delete()
                        .eq(whereCol, whereVal);
                    
                    if (error) throw error;
                    
                    resultadoDiv.innerHTML = `<div style="color: #00ff66; padding: 10px; background: #001500; border-radius:4px; border: 1px solid #00ff66;">
                        ✅ DELETE ejecutado exitosamente en "${tabla}".
                    </div>`;
                    
                    setTimeout(() => cambiarTabla(tablaActual), 1000);
                } else {
                    resultadoDiv.innerHTML = '<div style="color: #ff6600; padding: 10px; background: #2a1a00; border-radius:4px;">⚠️ Cláusula WHERE no reconocida.</div>';
                }
            } else {
                resultadoDiv.innerHTML = '<div style="color: #ff6600; padding: 10px; background: #2a1a00; border-radius:4px;">⚠️ Formato DELETE no reconocido. Usa: DELETE FROM tabla WHERE campo = valor</div>';
            }
        }
        else {
            resultadoDiv.innerHTML = '<div style="color: #ff6600; padding: 10px; background: #2a1a00; border-radius:4px;">⚠️ Solo SELECT, INSERT, UPDATE, DELETE</div>';
        }
    } catch (err) {
        console.error("❌ Error SQL:", err);
        errorBox.innerText = "❌ Error: " + err.message;
        errorBox.style.display = "block";
        resultadoDiv.innerHTML = '';
    }
}

function limpiarSQL() {
    document.getElementById("sql-query").value = '';
    document.getElementById("tabla-sql-resultado").innerHTML = '';
    document.getElementById("sql-error").style.display = 'none';
    if (tablaResultadoSQL) {
        tablaResultadoSQL.destroy();
        tablaResultadoSQL = null;
    }
}

function insertarEjemploSQL() {
    const ejemplos = {
        pedidos: `INSERT INTO pedidos (nro_lote, cliente_id, mascota_id, sabor, periodo_porcion, cantidad_gramos, metodo_pago, fecha_entrega, monto_total)
VALUES ('LOT-001', 'ID_DEL_CLIENTE', 'ID_DE_LA_MASCOTA', 'Carne', 'Semanal', 500, 'Efectivo', '2024-12-25', 25.00);`,
        
        mascotas: `INSERT INTO mascotas (cliente_id, nombre, tipo, edad_anios, edad_meses, peso_kg, sexo, raza, actividad_fisica)
VALUES ('ID_DEL_CLIENTE', 'Rocky', 'Perro', 3, 6, 15.5, 'Macho', 'Labrador', 'Alta');`,
        
        clientes: `INSERT INTO clientes (id, nombre_propietario, email, telefono, direccion)
VALUES (gen_random_uuid(), 'Maria Garcia', 'maria@email.com', '+58 412 1234567', 'Calle Principal #123');`,
        
        profiles: `UPDATE profiles SET role = 'admin' WHERE email = 'correo@ejemplo.com';`
    };
    
    const ejemplo = ejemplos[tablaActual] || `SELECT * FROM ${tablaActual} LIMIT 10;`;
    document.getElementById("sql-query").value = ejemplo;
}

// Crear registro rápido
async function crearRegistroRapido(tabla) {
    const datosPorDefecto = {
        pedidos: {
            nro_lote: 'LOT-' + Date.now().toString(36).toUpperCase(),
            sabor: 'Carne',
            periodo_porcion: 'Semanal',
            cantidad_gramos: 500,
            metodo_pago: 'Efectivo',
            fecha_entrega: new Date().toISOString().split('T')[0],
            monto_total: 25.00
        },
        mascotas: {
            nombre: 'Nueva Mascota',
            tipo: 'Perro',
            edad_anios: 1,
            edad_meses: 0,
            peso_kg: 10,
            sexo: 'Macho',
            actividad_fisica: 'Media'
        },
        clientes: {
            nombre_propietario: 'Nuevo Cliente',
            email: 'cliente@email.com',
            telefono: '+58 412 0000000',
            rol: 'cliente'
        },
        profiles: {
            role: 'user'
        }
    };

    const datos = datosPorDefecto[tabla];
    if (!datos) {
        alert('Tabla no soportada para creación rápida. Usa la consola SQL.');
        return;
    }

    try {
        const { data, error } = await supabaseAdminPanel
            .from(tabla)
            .insert([datos])
            .select();

        if (error) throw error;

        mostrarToast(`✅ Registro creado en "${tabla}"`);
        cambiarTabla(tabla);
    } catch (err) {
        alert('❌ Error: ' + err.message);
    }
}

// Exportar tabla a CSV
function exportarTablaActual() {
    if (tablaInteractiva) {
        tablaInteractiva.download("csv", `${tablaActual}-${new Date().toISOString().split('T')[0]}.csv`);
    } else {
        alert('⚠️ No hay tabla cargada para exportar');
    }
}

// Toast personalizado
function mostrarToast(mensaje) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #00ff66;
        color: #000;
        padding: 12px 20px;
        border-radius: 8px;
        font-weight: bold;
        z-index: 9999;
        animation: fadeIn 0.3s;
        box-shadow: 0 4px 15px rgba(0,255,102,0.3);
    `;
    toast.textContent = mensaje;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}

// Exponer funciones globales
window.cambiarTabla = cambiarTabla;
window.ejecutarSQL = ejecutarSQL;
window.limpiarSQL = limpiarSQL;
window.insertarEjemploSQL = insertarEjemploSQL;
window.crearRegistroRapido = crearRegistroRapido;
window.exportarTablaActual = exportarTablaActual;
window.actualizarEstadisticas = actualizarEstadisticas;

console.log('✅ Gestor Admin DB cargado');