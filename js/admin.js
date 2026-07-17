// ═══════════════════════════════════════════════════════════════════
//  ADMIN INTERFACE
// ═══════════════════════════════════════════════════════════════════

function renderAdmin() {
    return `
    <div class="app">
        <div class="header">
            <div class="header-logo">
                <div class="icon">${icon('paw')}</div>
                <div>
                    <h1>Gandolas Admin</h1>
                    <p>${icon('shield','btn-icon')} Panel de Administración</p>
                </div>
            </div>
            <button class="btn btn-ghost btn-sm" onclick="logout()">
                ${icon('logout','btn-icon')} Salir
            </button>
        </div>
        <div class="main">
            <div class="tabs">
                <button class="tab ${state.tab==='ventas'?'active':''}" data-tab="ventas">
                    ${icon('bag','btn-icon')} Ventas
                </button>
                <button class="tab ${state.tab==='reportes'?'active':''}" data-tab="reportes">
                    ${icon('chart','btn-icon')} Reportes
                </button>
            </div>
            <div id="tab-content">
                ${state.tab === 'ventas' ? renderAdminVentas() : renderAdminReportes()}
            </div>
        </div>
        <div class="footer">
            <p>Gandolas Admin — Panel de Administración</p>
        </div>
    </div>`;
}

function renderAdminVentas() {
    const filtered = state.allPedidos.filter(r => {
        if (!state.search) return true;
        const q = state.search.toLowerCase();
        return (r.cliente?.nombre_propietario||'').toLowerCase().includes(q) || 
               (r.mascota?.nombre||'').toLowerCase().includes(q) || 
               r.nro_lote.toLowerCase().includes(q);
    });
    
    let html = `
    <div class="card">
        <div class="card-header">
            <div style="display:flex;align-items:center;gap:0.75rem">
                <div style="width:36px;height:36px;border-radius:8px;background:var(--emerald-100);display:flex;align-items:center;justify-content:center">
                    ${icon('bag')}
                </div>
                <div>
                    <h2>Todas las Ventas</h2>
                    <p>${filtered.length} registros</p>
                </div>
            </div>
            <input type="text" class="search-input" id="admin-search" placeholder="Buscar..." value="${esc(state.search)}">
        </div>
        <div class="card-body">`;
    
    if (filtered.length === 0) {
        html += `<div class="empty-state"><p>${state.search ? 'Sin resultados' : 'No hay ventas registradas'}</p></div>`;
    } else {
        filtered.forEach(r => {
            const isOpen = state.expandedId === r.id;
            html += `
            <div class="sale-row">
                <div class="sale-row-header" data-expand="${r.id}">
                    <span class="lote">${esc(r.nro_lote)}</span>
                    <span class="propietario">${esc(r.cliente?.nombre_propietario||'')}</span>
                    <span style="color:var(--gray-400)">/</span>
                    <span>${esc(r.mascota?.nombre||'')}</span>
                    <span class="badge ${SABOR_COLOR[r.sabor]||''}">${r.sabor}</span>
                    <span class="badge badge-default">${r.periodo_porcion}</span>
                    <span style="font-size:0.75rem;color:var(--gray-500)">${r.cantidad_gramos}g</span>
                    <span class="monto">${formatCurrency(r.monto_total)}</span>
                    <button class="btn btn-danger btn-sm" onclick="event.stopPropagation();deleteRegistro('${r.id}')">
                        ${icon('trash','btn-icon')}
                    </button>
                    <span style="font-size:0.7rem;color:var(--gray-400)">${isOpen?'▲':'▼'}</span>
                </div>
                <div class="sale-row-detail ${isOpen?'open':''}">
                    <div class="detail-grid">
                        <div>
                            <h4>Propietario</h4>
                            <p><strong>${esc(r.cliente?.nombre_propietario||'')}</strong></p>
                            ${r.cliente?.telefono ? `<p>${icon('phone','btn-icon')} ${esc(r.cliente.telefono)}</p>` : ''}
                            ${r.cliente?.email ? `<p>${esc(r.cliente.email)}</p>` : ''}
                            ${r.cliente?.direccion ? `<p>${esc(r.cliente.direccion)}</p>` : ''}
                        </div>
                        <div>
                            <h4>Mascota</h4>
                            <p><strong>${esc(r.mascota?.nombre||'')} (${r.mascota?.tipo||''})</strong></p>
                            <p>Peso: ${r.mascota?.peso_kg}kg · Actividad: ${r.mascota?.actividad_fisica||''}</p>
                            ${r.mascota?.picky_eater ? '<p style="color:var(--amber-600)">Picky Eater</p>' : ''}
                            ${r.mascota?.condicion_medica ? `<p>Condición: ${esc(r.mascota.condicion_medica)}</p>` : ''}
                            ${r.mascota?.alergias ? `<p style="color:var(--red-600)">Alergias: ${esc(r.mascota.alergias)}</p>` : ''}
                        </div>
                        <div>
                            <h4>Pedido</h4>
                            <p>Sabor: ${r.sabor} · ${r.periodo_porcion} (${r.cantidad_gramos}g)</p>
                            <p>Pago: ${r.metodo_pago}</p>
                            <p>${icon('calendar','btn-icon')} Entrega: ${r.fecha_entrega}</p>
                            <div class="monto-big">${formatCurrency(r.monto_total)}</div>
                        </div>
                    </div>
                </div>
            </div>`;
        });
    }
    
    html += `</div></div>`;
    return html;
}

function renderAdminReportes() {
    let html = `
    <div class="summary-grid">
        <div class="summary-card">
            <div class="icon" style="background:var(--green-100)">${icon('dollar')}</div>
            <div>
                <div class="label">Total Ventas</div>
                <div class="value">${formatCurrency(state.resumen.total_general)}</div>
            </div>
        </div>
        <div class="summary-card">
            <div class="icon" style="background:var(--blue-100)">${icon('package')}</div>
            <div>
                <div class="label">Total Pedidos</div>
                <div class="value">${state.resumen.total_pedidos}</div>
            </div>
        </div>
        <div class="summary-card">
            <div class="icon" style="background:var(--purple-100)">${icon('calendar')}</div>
            <div>
                <div class="label">Días con Ventas</div>
                <div class="value">${state.resumen.total_dias}</div>
            </div>
        </div>
    </div>
    <div class="card">
        <div class="card-header">
            <div style="display:flex;align-items:center;gap:0.75rem">
                <div style="width:36px;height:36px;border-radius:8px;background:var(--indigo-100);display:flex;align-items:center;justify-content:center">
                    ${icon('chart')}
                </div>
                <h2>Ventas por Día</h2>
            </div>
        </div>
        <div class="card-body">
            <div class="filter-row">
                <div class="form-group" style="margin:0">
                    <label>Desde</label>
                    <input type="date" class="form-control" id="filtro-desde" value="${state.desde}" style="width:160px">
                </div>
                <div class="form-group" style="margin:0">
                    <label>Hasta</label>
                    <input type="date" class="form-control" id="filtro-hasta" value="${state.hasta}" style="width:160px">
                </div>
                <button class="btn btn-outline btn-sm" id="btn-filtrar">
                    ${icon('chart','btn-icon')} Filtrar
                </button>
                ${(state.desde||state.hasta) ? 
                    `<button class="btn btn-ghost btn-sm" id="btn-limpiar-filtro">${icon('x','btn-icon')}</button>` : ''}
            </div>`;
    
    if (state.reporte.length === 0) {
        html += `<div class="empty-state"><p>No hay datos para el período</p></div>`;
    } else {
        state.reporte.forEach(d => {
            const isOpen = state.expandedDay === d.fecha;
            html += `
            <div class="day-card">
                <div class="day-card-header" data-expand-day="${d.fecha}">
                    <span class="fecha">${d.fecha}</span>
                    <span style="width:1px;height:40px;background:var(--gray-200)"></span>
                    <span class="ventas">${formatCurrency(d.total_ventas)}</span>
                    <span class="pedidos-count">${d.cantidad_pedidos} pedidos</span>
                    <span style="margin-left:auto;font-size:0.8rem;color:var(--gray-400)">${isOpen?'▲':'▼'}</span>
                </div>
                <div class="day-card-detail ${isOpen?'open':''}">
                    <div class="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Lote</th><th>Propietario</th><th>Mascota</th>
                                    <th>Sabor</th><th>Porción</th><th class="text-right">Monto</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${d.pedidos.map(p => `
                                <tr>
                                    <td style="font-family:monospace;font-size:0.7rem">${esc(p.nro_lote)}</td>
                                    <td>${esc(p.cliente?.nombre_propietario||'-')}</td>
                                    <td>${esc(p.mascota?.nombre||'-')}</td>
                                    <td><span class="badge ${SABOR_COLOR[p.sabor]||''}">${p.sabor}</span></td>
                                    <td>${p.periodo_porcion} (${p.cantidad_gramos}g)</td>
                                    <td style="text-align:right;font-weight:600">${formatCurrency(p.monto_total)}</td>
                                </tr>`).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>`;
        });
    }
    
    html += `</div></div>`;
    return html;
}

function bindAdminEvents() {
    // Admin search
    const searchInput = document.getElementById('admin-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            state.search = e.target.value;
            render();
            const newInput = document.getElementById('admin-search');
            if (newInput) { 
                newInput.focus(); 
                newInput.selectionStart = newInput.selectionEnd = newInput.value.length; 
            }
        });
    }

    // Report filters
    const desde = document.getElementById('filtro-desde');
    const hasta = document.getElementById('filtro-hasta');
    const filtrar = document.getElementById('btn-filtrar');
    const limpiar = document.getElementById('btn-limpiar-filtro');
    
    if (desde) desde.addEventListener('change', (e) => { state.desde = e.target.value; });
    if (hasta) hasta.addEventListener('change', (e) => { state.hasta = e.target.value; });
    if (filtrar) filtrar.addEventListener('click', loadReporte);
    if (limpiar) limpiar.addEventListener('click', () => { 
        state.desde = ''; 
        state.hasta = ''; 
        loadReporte(); 
    });
}

// Componentes compartidos
function renderHeader(name) {
    return `
    <div class="header">
        <div class="header-logo">
            <div class="icon">${icon('paw')}</div>
            <div>
                <h1>Gandolas</h1>
                <p>Hola, ${esc(name)}</p>
            </div>
        </div>
        <button class="btn btn-ghost btn-sm" onclick="logout()">
            ${icon('logout','btn-icon')} Salir
        </button>
    </div>`;
}

function renderFooter() {
    return `
    <div class="footer">
        <p>Gandolas — Comida Natural para Perros y Gatos</p>
    </div>`;
}