// ═══════════════════════════════════════════════════════════════════
//  ADMIN VIEW — Vista del administrador (ventas, reportes, precios)
// ═══════════════════════════════════════════════════════════════════

/**
 * Shell del admin con header + tabs + footer.
 */
function renderAdmin() {
    return `
    <div class="app">
        <div class="header">
            <div class="header-logo">
                <div class="icon">🐾</div>
                <div><h1>AnimalPet Admin</h1><p><span class="admin-badge">🛡️ Administrador</span></p></div>
            </div>
            <div style="display:flex;gap:10px;align-items:center;">
                <a href="admin_db/index.html" class="btn btn-outline btn-sm" style="text-decoration:none;">🗄️ Admin DB</a>
                <button class="btn btn-ghost btn-sm" onclick="logout()">🚪 Salir</button>
            </div>
        </div>
        <div class="main">
            <div class="tabs">
                <button class="tab ${state.tab==='ventas'?'active':''}" data-tab="ventas">🛒 Ventas</button>
                <button class="tab ${state.tab==='reportes'?'active':''}" data-tab="reportes">📊 Reportes</button>
                <button class="tab ${state.tab==='precios'?'active':''}" data-tab="precios">💰 Precios</button>
            </div>
            <div id="tab-content">${state.tab === 'ventas' ? renderAdminVentas() : state.tab === 'reportes' ? renderAdminReportes() : renderAdminPrecios()}</div>
        </div>
        <div class="footer"><p>🛡️ AnimalPet Admin — Panel de Administración</p></div>
    </div>`;
}

/**
 * Tab Ventas: listado de todos los pedidos con filtros + stats.
 */
function renderAdminVentas() {
    const filtered = state.allPedidos.filter(r => {
        if (!state.search) return true;
        const q = state.search.toLowerCase();
        return (r.cliente?.nombre_propietario||'').toLowerCase().includes(q) ||
               (r.mascota?.nombre||'').toLowerCase().includes(q) ||
               (r.nro_lote||'').toLowerCase().includes(q);
    });

    const statusFiltered = state.statusFilter === 'todos' ? filtered :
        filtered.filter(r => (r.estado || ESTADOS.PENDIENTE) === state.statusFilter);

    const totalPedidos = filtered.length;
    const pendientes = filtered.filter(r => (r.estado || ESTADOS.PENDIENTE) === ESTADOS.PENDIENTE).length;
    const enProceso = filtered.filter(r => r.estado === ESTADOS.PROCESO).length;
    const completados = filtered.filter(r => r.estado === ESTADOS.COMPLETADO).length;

    const totalCompletados = filtered
        .filter(r => r.estado === ESTADOS.COMPLETADO)
        .reduce((sum, r) => sum + Number(r.monto_total), 0);

    let html = `
    <div class="card">
        <div class="card-header">
            <div style="display:flex;align-items:center;gap:0.75rem">
                <div style="width:36px;height:36px;border-radius:8px;background:var(--emerald-100);display:flex;align-items:center;justify-content:center;font-size:18px;">🛒</div>
                <div><h2>Todas las Ventas</h2><p>${statusFiltered.length} registros (${totalPedidos} total)</p></div>
            </div>
            <div style="display:flex;gap:0.5rem;flex-wrap:wrap;align-items:center;">
                <input type="text" class="search-input" id="admin-search" placeholder="🔍 Buscar..." value="${esc(state.search)}">
            </div>
        </div>
        <div class="card-body">
            <div class="stats-row">
                <div class="stat-item total"><div class="stat-value">$${totalCompletados.toFixed(2)}</div><div class="stat-label">💰 Total (Completados)</div></div>
                <div class="stat-item pending"><div class="stat-value">${pendientes}</div><div class="stat-label">⏳ Pendientes</div></div>
                <div class="stat-item progress"><div class="stat-value">${enProceso}</div><div class="stat-label">🔄 En Proceso</div></div>
                <div class="stat-item completed"><div class="stat-value">${completados}</div><div class="stat-label">✅ Completados</div></div>
            </div>

            <div class="filter-status" style="margin-bottom:1rem;">
                <button class="btn btn-sm ${state.statusFilter === 'todos' ? 'active' : 'btn-outline'}" data-status="todos">📋 Todos</button>
                <button class="btn btn-sm ${state.statusFilter === 'pendiente' ? 'active' : 'btn-outline'}" data-status="pendiente">⏳ Pendientes</button>
                <button class="btn btn-sm ${state.statusFilter === 'en proceso' ? 'active' : 'btn-outline'}" data-status="en proceso">🔄 En Proceso</button>
                <button class="btn btn-sm ${state.statusFilter === 'completado' ? 'active' : 'btn-outline'}" data-status="completado">✅ Completados</button>
            </div>`;

    if (statusFiltered.length === 0) {
        html += `<div class="empty-state"><p>${state.search ? '🔍 Sin resultados' : '📦 No hay ventas registradas'}</p></div>`;
    } else {
        statusFiltered.forEach(r => {
            const estado = r.estado || ESTADOS.PENDIENTE;
            const isOpen = state.expandedId === r.id;
            const isCompleted = estado === ESTADOS.COMPLETADO;

            html += `<div class="sale-row" style="${isCompleted ? 'border-left:4px solid var(--emerald-500);' : ''}">
                <div class="sale-row-header" data-expand="${r.id}">
                    <span class="lote">🔢 ${esc(r.nro_lote)}</span>
                    <span class="propietario">${esc(r.cliente?.nombre_propietario||'')}</span>
                    <span style="color:var(--gray-400)">/</span>
                    <span>${esc(r.mascota?.nombre||'')}</span>
                    <span class="badge ${SABOR_COLOR[r.sabor]||''}">🍖 ${r.sabor}</span>
                    <span class="badge ${ESTADO_BADGE[estado] || 'badge-default'}">${ESTADO_ICON[estado] || '📌'} ${estado.charAt(0).toUpperCase() + estado.slice(1)}</span>
                    <span class="monto ${!isCompleted ? 'monto-pending' : ''}">💰 $${Number(r.monto_total).toFixed(2)}</span>
                    <div class="status-actions">
                        ${estado === ESTADOS.PENDIENTE ? `<button class="btn btn-warning btn-sm" onclick="event.stopPropagation();updateOrderStatus('${r.id}','${ESTADOS.PROCESO}')">🔄 Procesar</button>` : ''}
                        ${estado === ESTADOS.PROCESO ? `<button class="btn btn-success btn-sm" onclick="event.stopPropagation();updateOrderStatus('${r.id}','${ESTADOS.COMPLETADO}')">✅ Completar</button>` : ''}
                        ${estado === ESTADOS.COMPLETADO ? `<span style="font-size:0.7rem;color:var(--green-700)">✅ Completado</span>` : ''}
                    </div>
                    <button class="btn btn-danger btn-sm" onclick="event.stopPropagation();event.preventDefault();deleteRegistro('${r.id}')">🗑️</button>
                    <span style="font-size:0.7rem;color:var(--gray-400)">${isOpen?'▲':'▼'}</span>
                </div>
                <div class="sale-row-detail ${isOpen?'open':''}">
                    <div class="detail-grid">
                        <div><h4>👤 Propietario</h4><p><strong>${esc(r.cliente?.nombre_propietario||'')}</strong></p>
                            ${r.cliente?.telefono ? `<p>📞 ${esc(r.cliente.telefono)}</p>` : ''}
                            ${r.cliente?.email ? `<p>📧 ${esc(r.cliente.email)}</p>` : ''}
                            ${r.cliente?.direccion ? `<p>📍 ${esc(r.cliente.direccion)}</p>` : ''}</div>
                        <div><h4>🐕 Mascota</h4><p><strong>${esc(r.mascota?.nombre||'')} (${r.mascota?.tipo||''})</strong></p>
                            <p>⚖️ Peso: ${r.mascota?.peso_kg}kg · 🏃 Actividad: ${r.mascota?.actividad_fisica||''}</p>
                            ${r.mascota?.picky_eater ? `<p>😋 Picky eater</p>` : ''}
                            ${r.mascota?.condicion_medica ? `<p>🏥 ${esc(r.mascota.condicion_medica)}</p>` : ''}</div>
                        <div><h4>📦 Pedido</h4>
                            <p>🍖 Sabor: ${r.sabor} · ${r.periodo_porcion} (${r.cantidad_gramos}g)</p>
                            <p>💳 Pago: ${r.metodo_pago}</p>
                            <p>📅 Entrega: ${r.fecha_entrega}</p>
                            <p>📌 Estado: <span class="badge ${ESTADO_BADGE[estado] || 'badge-default'}">${ESTADO_ICON[estado] || '📌'} ${estado.charAt(0).toUpperCase() + estado.slice(1)}</span></p>
                            <div class="monto-big">💰 $${Number(r.monto_total).toFixed(2)} ${!isCompleted ? '(Pendiente)' : ''}</div>
                        </div>
                    </div>
                </div>
            </div>`;
        });
    }
    html += `</div></div>`;
    return html;
}

/**
 * Tab Reportes: ventas por día (solo completados) con filtros de fecha.
 */
function renderAdminReportes() {
    let html = `
    <div class="summary-grid">
        <div class="summary-card"><div class="icon" style="background:var(--green-100)">💰</div><div><div class="label">Total Ventas</div><div class="value">$${state.resumen.total_general.toFixed(2)}</div></div></div>
        <div class="summary-card"><div class="icon" style="background:var(--blue-100)">📦</div><div><div class="label">Total Pedidos</div><div class="value">${state.resumen.total_pedidos}</div></div></div>
        <div class="summary-card"><div class="icon" style="background:var(--purple-100)">📅</div><div><div class="label">Días con Ventas</div><div class="value">${state.resumen.total_dias}</div></div></div>
        <div class="summary-card"><div class="icon" style="background:var(--amber-100)">✅</div><div><div class="label">Solo Completados</div><div class="value" style="font-size:0.8rem">Pedidos finalizados</div></div></div>
    </div>
    <div class="card">
        <div class="card-header">
            <div style="display:flex;align-items:center;gap:0.75rem">
                <div style="width:36px;height:36px;border-radius:8px;background:var(--indigo-100);display:flex;align-items:center;justify-content:center;font-size:18px;">📊</div>
                <h2>Ventas por Día (Solo completados)</h2>
            </div>
        </div>
        <div class="card-body">
            <div class="filter-row">
                <div class="form-group" style="margin:0"><label>📅 Desde</label><input type="date" class="form-control" id="filtro-desde" value="${state.desde}" style="width:160px"></div>
                <div class="form-group" style="margin:0"><label>📅 Hasta</label><input type="date" class="form-control" id="filtro-hasta" value="${state.hasta}" style="width:160px"></div>
                <button class="btn btn-outline btn-sm" id="btn-filtrar">📊 Filtrar</button>
                ${(state.desde||state.hasta) ? `<button class="btn btn-ghost btn-sm" id="btn-limpiar-filtro">✖️ Limpiar</button>` : ''}
            </div>
            <p style="font-size:0.8rem;color:var(--gray-400);margin-bottom:1rem;">
                ⚠️ Solo se contabilizan pedidos con estado <strong>"Completado"</strong>
            </p>`;

    if (state.reporte.length === 0) {
        html += `<div class="empty-state"><p>${(state.desde||state.hasta) ? '📅 Sin datos para el período' : '📅 Selecciona un rango de fechas y haz clic en Filtrar'}</p></div>`;
    } else {
        state.reporte.forEach(d => {
            const isOpen = state.expandedDay === d.fecha;
            html += `<div class="day-card">
                <div class="day-card-header" data-expand-day="${d.fecha}">
                    <span class="fecha">📅 ${d.fecha}</span>
                    <span style="width:1px;height:40px;background:var(--gray-200)"></span>
                    <span class="ventas">💰 $${d.total_ventas.toFixed(2)}</span>
                    <span class="pedidos-count">📦 ${d.cantidad_pedidos} pedidos</span>
                    <span style="margin-left:auto;font-size:0.8rem;color:var(--gray-400)">${isOpen?'▲':'▼'}</span>
                </div>
                <div class="day-card-detail ${isOpen?'open':''}">
                    <div class="table-wrap"><table>
                        <thead><tr><th>🔢 Lote</th><th>👤 Propietario</th><th>🐕 Mascota</th><th>🍖 Sabor</th><th>💰 Monto</th></tr></thead>
                        <tbody>${d.pedidos.map(p => `<tr>
                            <td>${esc(p.nro_lote)}</td>
                            <td>${esc(p.cliente?.nombre_propietario||'-')}</td>
                            <td>${esc(p.mascota?.nombre||'-')}</td>
                            <td><span class="badge ${SABOR_COLOR[p.sabor]||''}">${p.sabor}</span></td>
                            <td style="text-align:right;font-weight:600">$${Number(p.monto_total).toFixed(2)}</td>
                        </tr>`).join('')}</tbody>
                    </table></div>
                </div>
            </div>`;
        });
    }
    html += `</div></div>`;
    return html;
}

/**
 * Tab Precios: listado + modal de alta de configuración de precios.
 */
function renderAdminPrecios() {
    const precios = state.preciosConfig || [];

    let html = `
    <div class="card">
        <div class="card-header">
            <div style="display:flex;align-items:center;gap:0.75rem">
                <div style="width:36px;height:36px;border-radius:8px;background:var(--amber-100);display:flex;align-items:center;justify-content:center;font-size:18px;">💰</div>
                <div><h2>Configuración de Precios</h2>
                <p style="font-size:0.75rem;color:var(--gray-500)">Define los precios base por sabor, porción y gramos</p></div>
            </div>
            <button class="btn btn-primary btn-sm" id="btn-add-precio">➕ Agregar Precio</button>
        </div>
        <div class="card-body">
            <div style="overflow-x:auto;margin-bottom:1rem">
                <table>
                    <thead>
                        <tr>
                            <th>🍖 Sabor</th>
                            <th>📦 Porción</th>
                            <th>⚖️ Gramos (min)</th>
                            <th>⚖️ Gramos (max)</th>
                            <th>💵 Precio x Gramo</th>
                            <th>💰 Precio Base</th>
                            <th>🔧 Acciones</th>
                        </tr>
                    </thead>
                    <tbody>`;

    if (precios.length === 0) {
        html += `<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--gray-400)">No hay configuraciones de precio. Agrega una.</td></tr>`;
    } else {
        precios.forEach(p => {
            html += `
                <tr>
                    <td><span class="badge ${SABOR_COLOR[p.sabor] || 'badge-default'}">${p.sabor}</span></td>
                    <td><span class="badge badge-default">${p.periodo_porcion}</span></td>
                    <td>${p.gramos_min}</td>
                    <td>${p.gramos_max}</td>
                    <td><strong>$${Number(p.precio_por_gramo).toFixed(2)}</strong></td>
                    <td><strong>$${Number(p.precio_base).toFixed(2)}</strong></td>
                    <td>
                        <button class="btn btn-danger btn-sm" onclick="deletePrecioConfig('${p.id}')">🗑️</button>
                    </td>
                </tr>
            `;
        });
    }

    html += `
                    </tbody>
                </table>
            </div>

            <div style="background:var(--gray-50);padding:1rem;border-radius:var(--radius);margin-top:1rem">
                <p style="font-size:0.8rem;color:var(--gray-600)">
                    <strong>📌 Cálculo:</strong> Precio = (Gramos × Precio x Gramo) + Precio Base
                </p>
                <p style="font-size:0.75rem;color:var(--gray-500);margin-top:0.25rem">
                    El precio se calculará automáticamente al seleccionar sabor, porción y gramos en el formulario de pedido.
                </p>
            </div>
        </div>
    </div>`;

    if (state.showPrecioForm) {
        html += renderPrecioForm();
    }

    return html;
}

/**
 * Modal de alta de configuración de precio.
 */
function renderPrecioForm() {
    return `
    <div id="precio-modal" style="position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:100;padding:1rem">
        <div style="background:var(--white);border-radius:0.75rem;width:100%;max-width:500px;max-height:90vh;overflow-y:auto;padding:1.5rem">
            <h2 style="font-size:1.1rem;font-weight:600;margin-bottom:1rem">💰 Agregar Configuración de Precio</h2>
            <form id="precio-form">
                <div class="form-row form-row-2">
                    <div class="form-group">
                        <label>🍖 Sabor *</label>
                        <select name="sabor" class="form-control" required>
                            <option value="">Seleccionar</option>
                            <option>Carne</option>
                            <option>Pollo</option>
                            <option>Mixta</option>
                            <option>Personalizada</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>📦 Porción *</label>
                        <select name="periodo_porcion" class="form-control" required>
                            <option value="">Seleccionar</option>
                            <option>Diaria</option>
                            <option>Semanal</option>
                            <option>Mensual</option>
                        </select>
                    </div>
                </div>
                <div class="form-row form-row-2">
                    <div class="form-group">
                        <label>⚖️ Gramos Mínimo *</label>
                        <input type="number" name="gramos_min" class="form-control" min="1" required placeholder="1">
                    </div>
                    <div class="form-group">
                        <label>⚖️ Gramos Máximo *</label>
                        <input type="number" name="gramos_max" class="form-control" min="1" required placeholder="500">
                    </div>
                </div>
                <div class="form-row form-row-2">
                    <div class="form-group">
                        <label>💵 Precio por Gramo ($) *</label>
                        <input type="number" name="precio_por_gramo" class="form-control" step="0.01" min="0" required placeholder="0.05">
                    </div>
                    <div class="form-group">
                        <label>💰 Precio Base ($)</label>
                        <input type="number" name="precio_base" class="form-control" step="0.01" min="0" placeholder="0.00" value="0">
                    </div>
                </div>
                <div style="background:var(--gray-50);padding:0.5rem 1rem;border-radius:var(--radius);font-size:0.8rem;color:var(--gray-500);margin-bottom:1rem">
                    💡 <strong>Ejemplo:</strong> Si el precio x gramo es $0.05 y el precio base es $0,
                    para 500g el precio sería: 500 × 0.05 = $25.00
                </div>
                <div style="display:flex;gap:0.5rem;justify-content:flex-end;margin-top:1rem">
                    <button type="button" class="btn btn-outline" id="btn-cancel-precio">✖️ Cancelar</button>
                    <button type="submit" class="btn btn-primary">✅ Guardar</button>
                </div>
            </form>
        </div>
    </div>`;
}
