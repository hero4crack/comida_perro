// ═══════════════════════════════════════════════════════════════════
//  CLIENTE VIEW — Vista del cliente (pedir, mascotas, historial)
// ═══════════════════════════════════════════════════════════════════

/**
 * Shell del cliente con header + tabs + footer.
 */
function renderCliente() {
    const name = state.user?.user_metadata?.nombre || state.user?.email || 'Usuario';
    const activeTab = state.tab;
    return `
    <div class="app">
        <div class="header">
            <div class="header-logo">
                <div class="icon">🐾</div>
                <div><h1>AnimalPet</h1><p>Hola, ${esc(name)} <span class="badge badge-blue" style="font-size:0.65rem;margin-left:4px;">👤 Cliente</span></p></div>
            </div>
            <button class="btn btn-ghost btn-sm" onclick="logout()">🚪 Salir</button>
        </div>
        <div class="main">
            <div class="tabs">
                <button class="tab ${activeTab==='pedir'?'active':''}" data-tab="pedir">🛒 Hacer Pedido</button>
                <button class="tab ${activeTab==='mascotas'?'active':''}" data-tab="mascotas">🐾 Mis Mascotas</button>
                <button class="tab ${activeTab==='historial'?'active':''}" data-tab="historial">📦 Mis Pedidos</button>
            </div>
            <div id="tab-content">${renderClienteTab()}</div>
        </div>
        <div class="footer"><p>❤️ AnimalPet — Comida Natural para Perros y Gatos ❤️</p></div>
    </div>`;
}

/**
 * Despachador de pestañas del cliente.
 */
function renderClienteTab() {
    if (state.tab === 'pedir') return renderPedidoForm();
    if (state.tab === 'mascotas') return renderMascotas();
    if (state.tab === 'historial') return renderHistorial();
    return '';
}

/**
 * Formulario de nuevo pedido con cálculo automático de precio.
 */
function renderPedidoForm() {
    if (state.mascotas.length === 0) return `
        <div class="card"><div class="card-body">
            <div class="empty-state"><div class="icon-big">🐕</div><h3>Primero registra tu mascota</h3>
            <p style="margin-bottom:1rem">Necesitas al menos una mascota para hacer un pedido</p>
            <button class="btn btn-outline" onclick="state.tab='mascotas';render()">🐾 Ir a Mis Mascotas</button></div>
        </div></div>`;

    const petOpts = state.mascotas.map(m => `<option value="${m.id}">${m.nombre} (${m.tipo} - ${m.raza||'Sin raza'} - ${m.peso_kg}kg)</option>`).join('');

    return `
    <div class="card">
        <div class="card-header"><h2>🛒 Nuevo Pedido</h2><p>Selecciona tu mascota y elige la comida</p></div>
        <div class="card-body">
            <form id="order-form">
                <div class="form-group"><label>🐕 Mascota *</label><select name="mascota_id" class="form-control" required><option value="">Selecciona tu mascota</option>${petOpts}</select></div>
                <div class="form-row form-row-3">
                    <div class="form-group"><label>🍖 Sabor *</label>
                        <select name="sabor" class="form-control" id="sabor-select" required>
                            <option value="">Seleccionar</option>
                            <option>Carne</option>
                            <option>Pollo</option>
                            <option>Mixta</option>
                            <option>Personalizada</option>
                        </select>
                    </div>
                    <div class="form-group"><label>📦 Porción *</label>
                        <select name="periodo_porcion" class="form-control" id="periodo-select" required>
                            <option value="">Seleccionar</option>
                            <option>Diaria</option>
                            <option>Semanal</option>
                            <option>Mensual</option>
                        </select>
                    </div>
                    <div class="form-group"><label>⚖️ Gramos *</label>
                        <input type="number" name="cantidad_gramos" class="form-control" id="gramos-input" min="1" placeholder="Ej: 500" required>
                    </div>
                </div>
                <div class="form-row form-row-3">
                    <div class="form-group"><label>💳 Pago *</label>
                        <select name="metodo_pago" class="form-control" required>
                            <option value="">Seleccionar</option>
                            <option>Efectivo</option>
                            <option>Transferencia</option>
                            <option>Tarjeta</option>
                            <option>Pago Móvil</option>
                            <option>Divisas</option>
                        </select>
                    </div>
                    <div class="form-group"><label>📅 Entrega *</label>
                        <input type="date" name="fecha_entrega" class="form-control" required>
                    </div>
                    <div class="form-group"><label>🔢 Nro. Lote *</label>
                        <input name="nro_lote" class="form-control" placeholder="Ej: LOT-001" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>💰 Monto Total ($) *</label>
                    <div style="display:flex;gap:0.5rem;align-items:center;flex-wrap:wrap">
                        <input type="number" step="0.01" name="monto_total" id="monto-total" class="form-control" style="max-width:200px" min="0" placeholder="0.00" required>
                        <span id="precio-calculado" style="font-size:0.8rem;color:var(--gray-500)">🤖 Cálculo automático</span>
                    </div>
                </div>
                <div class="form-group" style="background:var(--gray-50);padding:0.5rem 1rem;border-radius:var(--radius);font-size:0.85rem;color:var(--gray-500)">
                    ⏳ El pedido se creará con estado <strong>Pendiente</strong>
                </div>
                <button type="submit" class="btn btn-primary">✅ Realizar Pedido</button>
            </form>
        </div>
    </div>`;
}

/**
 * Listado de mascotas del cliente + modal de alta.
 */
function renderMascotas() {
    let html = `<div class="card"><div class="card-header"><div><h2>🐾 Mis Mascotas</h2><p>${state.mascotas.length} registrada${state.mascotas.length!==1?'s':''}</p></div><button class="btn btn-primary btn-sm" id="btn-add-pet">➕ Agregar</button></div><div class="card-body">`;

    if (state.mascotas.length === 0) {
        html += `<div class="empty-state"><div class="icon-big">🐕</div><h3>No tienes mascotas registradas</h3><p>Agrega una mascota para comenzar</p></div>`;
    } else {
        state.mascotas.forEach(m => {
            const tipoIcono = m.tipo === 'Perro' ? '🐕' : '🐈';
            html += `<div class="pet-card">
                <div class="pet-info">
                    <div class="pet-icon">${tipoIcono}</div>
                    <div>
                        <div class="pet-name">${esc(m.nombre)}</div>
                        <div class="pet-meta">${m.tipo} · ${m.raza||'Sin raza'} · ${m.peso_kg}kg · ${m.sexo} · ${m.edad_anios}a ${m.edad_meses}m</div>
                        ${m.condicion_medica ? `<div class="pet-meta" style="color:var(--red-600)">⚠️ Condición: ${esc(m.condicion_medica)}</div>` : ''}
                        ${m.picky_eater ? `<div class="pet-meta" style="color:var(--amber-600)">😋 Picky eater</div>` : ''}
                    </div>
                </div>
                <button class="btn btn-danger btn-sm" onclick="deletePet('${m.id}')">🗑️</button>
            </div>`;
        });
    }
    html += `</div></div>`;

    if (state.showPetForm) {
        html += renderPetForm();
    }
    return html;
}

/**
 * Modal de alta de mascota.
 */
function renderPetForm() {
    return `
    <div id="pet-modal" style="position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:100;padding:1rem">
        <div style="background:var(--white);border-radius:0.75rem;width:100%;max-width:480px;max-height:90vh;overflow-y:auto;padding:1.5rem">
            <h2 style="font-size:1.1rem;font-weight:600;margin-bottom:1rem">➕ Nueva Mascota</h2>
            <form id="pet-form">
                <div class="form-row form-row-2">
                    <div class="form-group"><label>✏️ Nombre *</label><input name="nombre" class="form-control" required></div>
                    <div class="form-group"><label>🐕 Tipo *</label><select name="tipo" class="form-control"><option>Perro</option><option>Gato</option></select></div>
                </div>
                <div class="form-row form-row-3">
                    <div class="form-group"><label>📅 Años</label><input type="number" name="edad_anios" class="form-control" min="0" value="0"></div>
                    <div class="form-group"><label>📅 Meses</label><input type="number" name="edad_meses" class="form-control" min="0" max="11" value="0"></div>
                    <div class="form-group"><label>⚖️ Peso (kg) *</label><input type="number" name="peso_kg" class="form-control" step="0.1" min="0.1" required></div>
                </div>
                <div class="form-row form-row-2">
                    <div class="form-group"><label>⚤ Sexo *</label><select name="sexo" class="form-control"><option>Macho</option><option>Hembra</option></select></div>
                    <div class="form-group"><label>🔬 Raza</label><input name="raza" class="form-control" placeholder="Ej: Labrador"></div>
                </div>
                <div class="form-group"><label>🏃 Actividad Física *</label><select name="actividad_fisica" class="form-control"><option>Alta</option><option>Media</option><option>Baja</option></select></div>
                <div class="form-group"><label>🏥 Condición Médica</label><textarea name="condicion_medica" class="form-control" rows="2"></textarea></div>
                <div class="switch-row" style="margin-bottom:0.75rem">
                    <div><label>😋 Picky Eater</label><small>¿Es exigente con la comida?</small></div>
                    <button type="button" class="switch" id="picky-switch" onclick="this.classList.toggle('active')"></button>
                    <input type="hidden" name="picky_eater" value="false">
                </div>
                <div class="form-group"><label>🤧 Alergias</label><textarea name="alergias" class="form-control" rows="2"></textarea></div>
                <div style="display:flex;gap:0.5rem;justify-content:flex-end;margin-top:1rem">
                    <button type="button" class="btn btn-outline" id="btn-cancel-pet">✖️ Cancelar</button>
                    <button type="submit" class="btn btn-primary">✅ Guardar</button>
                </div>
            </form>
        </div>
    </div>`;
}

/**
 * Historial de pedidos del cliente.
 */
function renderHistorial() {
    let html = `<div class="card"><div class="card-header"><div><h2>📦 Historial de Pedidos</h2><p>${state.pedidos.length} pedido${state.pedidos.length!==1?'s':''}</p></div></div><div class="card-body">`;

    if (state.pedidos.length === 0) {
        html += `<div class="empty-state"><div class="icon-big">📦</div><h3>No tienes pedidos aún</h3><p>Realiza tu primer pedido en la pestaña "Hacer Pedido"</p></div>`;
    } else {
        state.pedidos.forEach(p => {
            const estado = p.estado || ESTADOS.PENDIENTE;
            html += `<div class="sale-row">
                <div class="sale-row-header">
                    <span class="lote">🔢 ${esc(p.nro_lote)}</span>
                    <span class="propietario">${esc(p.mascota?.nombre||'-')}</span>
                    <span class="badge ${SABOR_COLOR[p.sabor]||''}">🍖 ${p.sabor}</span>
                    <span class="badge ${ESTADO_BADGE[estado] || 'badge-default'}">${ESTADO_ICON[estado] || '📌'} ${estado.charAt(0).toUpperCase() + estado.slice(1)}</span>
                    <span style="font-size:0.75rem;color:var(--gray-500)">⚖️ ${p.cantidad_gramos}g</span>
                    <span style="font-size:0.75rem;color:var(--gray-500)">💳 ${p.metodo_pago}</span>
                    <span style="font-size:0.75rem;color:var(--gray-500)">📅 Entrega: ${p.fecha_entrega}</span>
                    <span class="monto ${estado !== ESTADOS.COMPLETADO ? 'monto-pending' : ''}">💰 $${Number(p.monto_total).toFixed(2)} ${estado !== ESTADOS.COMPLETADO ? '(Pendiente)' : ''}</span>
                </div>
            </div>`;
        });
    }
    html += `</div></div>`;
    return html;
}
