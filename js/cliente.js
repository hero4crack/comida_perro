// ═══════════════════════════════════════════════════════════════════
//  CLIENTE INTERFACE
// ═══════════════════════════════════════════════════════════════════

function renderCliente() {
    const name = state.user?.user_metadata?.nombre || state.user?.email || 'Usuario';
    const activeTab = state.tab;
    
    return `
    <div class="app">
        ${renderHeader(name)}
        <div class="main">
            <div class="tabs">
                <button class="tab ${activeTab==='pedir'?'active':''}" data-tab="pedir">
                    ${icon('bag','btn-icon')} Hacer Pedido
                </button>
                <button class="tab ${activeTab==='mascotas'?'active':''}" data-tab="mascotas">
                    ${icon('paw','btn-icon')} Mis Mascotas
                </button>
                <button class="tab ${activeTab==='historial'?'active':''}" data-tab="historial">
                    ${icon('package','btn-icon')} Mis Pedidos
                </button>
            </div>
            <div id="tab-content">${renderClienteTab()}</div>
        </div>
        ${renderFooter()}
    </div>`;
}

function renderClienteTab() {
    if (state.tab === 'pedir') return renderPedidoForm();
    if (state.tab === 'mascotas') return renderMascotas();
    if (state.tab === 'historial') return renderHistorial();
    return '';
}

function renderPedidoForm() {
    if (state.mascotas.length === 0) {
        return `
        <div class="card">
            <div class="card-body">
                <div class="empty-state">
                    ${icon('paw')}
                    <h3>Primero registra tu mascota</h3>
                    <p style="margin-bottom:1rem">Necesitas al menos una mascota para hacer un pedido</p>
                    <button class="btn btn-outline" onclick="state.tab='mascotas';render()">Ir a Mis Mascotas</button>
                </div>
            </div>
        </div>`;
    }

    const petOpts = state.mascotas.map(m => 
        `<option value="${m.id}">${m.nombre} (${m.tipo} - ${m.raza||'Sin raza'} - ${m.peso_kg}kg)</option>`
    ).join('');
    
    return `
    <div class="card">
        <div class="card-header">
            <h2>${icon('bag','btn-icon')} Nuevo Pedido</h2>
            <p>Selecciona tu mascota y elige la comida</p>
        </div>
        <div class="card-body">
            <form id="order-form">
                <div class="form-group">
                    <label>Mascota *</label>
                    <select name="mascota_id" class="form-control" required>
                        <option value="">Selecciona tu mascota</option>
                        ${petOpts}
                    </select>
                </div>
                <div class="form-row form-row-3">
                    <div class="form-group">
                        <label>Sabor *</label>
                        <select name="sabor" class="form-control">
                            <option>Carne</option><option>Pollo</option>
                            <option>Mixta</option><option>Personalizada</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Porción *</label>
                        <select name="periodo_porcion" class="form-control">
                            <option>Diaria</option><option>Semanal</option><option>Mensual</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Gramos *</label>
                        <input type="number" name="cantidad_gramos" class="form-control" min="1" placeholder="Ej: 500" required>
                    </div>
                </div>
                <div class="form-row form-row-3">
                    <div class="form-group">
                        <label>Pago *</label>
                        <select name="metodo_pago" class="form-control" required>
                            <option value="">Seleccionar</option>
                            <option>Efectivo</option><option>Transferencia</option><option>Tarjeta</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Entrega *</label>
                        <input type="date" name="fecha_entrega" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label>Nro. Lote *</label>
                        <input name="nro_lote" class="form-control" placeholder="Ej: LOT-001" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>Monto Total ($) *</label>
                    <input type="number" step="0.01" name="monto_total" class="form-control" style="max-width:200px" min="0" placeholder="0.00" required>
                </div>
                <button type="submit" class="btn btn-primary">Realizar Pedido</button>
            </form>
        </div>
    </div>`;
}

function renderMascotas() {
    let html = `
    <div class="card">
        <div class="card-header">
            <div>
                <h2>Mis Mascotas</h2>
                <p>${state.mascotas.length} registrada${state.mascotas.length!==1?'s':''}</p>
            </div>
            <button class="btn btn-primary btn-sm" id="btn-add-pet">
                ${icon('plus','btn-icon')} Agregar
            </button>
        </div>
        <div class="card-body">`;
    
    if (state.mascotas.length === 0) {
        html += `<p style="text-align:center;padding:2.5rem;color:var(--gray-400)">No tienes mascotas registradas</p>`;
    } else {
        state.mascotas.forEach(m => {
            html += `
            <div class="pet-card">
                <div class="pet-info">
                    <div class="pet-icon">${icon('dog')}</div>
                    <div>
                        <div class="pet-name">${esc(m.nombre)}</div>
                        <div class="pet-meta">
                            ${m.tipo} · ${m.raza||'Sin raza'} · ${m.peso_kg}kg · ${m.sexo} · ${m.edad_anios}a ${m.edad_meses}m
                        </div>
                        <div style="display:flex;gap:4px;margin-top:4px">
                            <span class="badge ${ACTIVIDAD_VARIANT[m.actividad_fisica]}">${m.actividad_fisica}</span>
                            ${m.picky_eater ? '<span class="badge badge-amber">Picky Eater</span>' : ''}
                        </div>
                        ${m.condicion_medica ? `<div class="pet-meta" style="color:var(--red-600)">Condición: ${esc(m.condicion_medica)}</div>` : ''}
                        ${m.alergias ? `<div class="pet-meta" style="color:var(--orange-800)">Alergias: ${esc(m.alergias)}</div>` : ''}
                    </div>
                </div>
                <button class="btn btn-danger btn-sm" onclick="deletePet('${m.id}')">${icon('trash','btn-icon')}</button>
            </div>`;
        });
    }
    
    html += `</div></div>`;

    if (state.showPetForm) {
        html += `
        <div id="pet-modal" style="position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:100;padding:1rem">
            <div style="background:var(--white);border-radius:0.75rem;width:100%;max-width:480px;max-height:90vh;overflow-y:auto;padding:1.5rem">
                <h2 style="font-size:1.1rem;font-weight:600;margin-bottom:1rem">Nueva Mascota</h2>
                <form id="pet-form">
                    <div class="form-row form-row-2">
                        <div class="form-group">
                            <label>Nombre *</label>
                            <input name="nombre" class="form-control" required placeholder="Nombre">
                        </div>
                        <div class="form-group">
                            <label>Tipo *</label>
                            <select name="tipo" class="form-control">
                                <option>Perro</option><option>Gato</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row form-row-3">
                        <div class="form-group">
                            <label>Años</label>
                            <input type="number" name="edad_anios" class="form-control" min="0" value="0">
                        </div>
                        <div class="form-group">
                            <label>Meses</label>
                            <input type="number" name="edad_meses" class="form-control" min="0" max="11" value="0">
                        </div>
                        <div class="form-group">
                            <label>Peso (kg) *</label>
                            <input type="number" name="peso_kg" class="form-control" step="0.1" min="0.1" required>
                        </div>
                    </div>
                    <div class="form-row form-row-2">
                        <div class="form-group">
                            <label>Sexo *</label>
                            <select name="sexo" class="form-control">
                                <option>Macho</option><option>Hembra</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Raza</label>
                            <input name="raza" class="form-control" placeholder="Ej: Labrador">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Actividad Física *</label>
                        <select name="actividad_fisica" class="form-control">
                            <option>Alta</option><option>Media</option><option>Baja</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Condición Médica</label>
                        <textarea name="condicion_medica" class="form-control" rows="2"></textarea>
                    </div>
                    <div class="switch-row" style="margin-bottom:0.75rem">
                        <div>
                            <label>Picky Eater</label>
                            <small>¿Es exigente con la comida?</small>
                        </div>
                        <button type="button" class="switch" id="picky-switch" onclick="this.classList.toggle('active')"></button>
                        <input type="hidden" name="picky_eater" value="false">
                    </div>
                    <div class="form-group">
                        <label>Alergias</label>
                        <textarea name="alergias" class="form-control" rows="2"></textarea>
                    </div>
                    <div style="display:flex;gap:0.5rem;justify-content:flex-end;margin-top:1rem">
                        <button type="button" class="btn btn-outline" id="btn-cancel-pet">Cancelar</button>
                        <button type="submit" class="btn btn-primary">Guardar</button>
                    </div>
                </form>
            </div>
        </div>`;
    }
    
    return html;
}

function renderHistorial() {
    let html = `
    <div class="card">
        <div class="card-header">
            <div>
                <h2>Historial de Pedidos</h2>
                <p>${state.pedidos.length} pedido${state.pedidos.length!==1?'s':''}</p>
            </div>
        </div>
        <div class="card-body">`;
    
    if (state.pedidos.length === 0) {
        html += `<p style="text-align:center;padding:2.5rem;color:var(--gray-400)">No tienes pedidos aún</p>`;
    } else {
        state.pedidos.forEach(p => {
            html += `
            <div class="sale-row">
                <div class="sale-row-header">
                    <span class="lote">${esc(p.nro_lote)}</span>
                    <span class="propietario">${esc(p.mascota?.nombre||'-')}</span>
                    <span class="badge ${SABOR_COLOR[p.sabor]||''}">${p.sabor}</span>
                    <span class="badge badge-default">${p.periodo_porcion}</span>
                    <span style="font-size:0.75rem;color:var(--gray-500)">${p.cantidad_gramos}g</span>
                    <span style="font-size:0.75rem;color:var(--gray-500)">${p.metodo_pago}</span>
                    <span style="font-size:0.75rem;color:var(--gray-500)">Entrega: ${p.fecha_entrega}</span>
                    <span class="monto">${formatCurrency(p.monto_total)}</span>
                </div>
            </div>`;
        });
    }
    
    html += `</div></div>`;
    return html;
}

function bindClienteEvents() {
    // Order form
    const orderForm = document.getElementById('order-form');
    if (orderForm) {
        orderForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const fd = new FormData(orderForm);
            await placeOrder(Object.fromEntries(fd));
        });
    }

    // Pet form
    const petForm = document.getElementById('pet-form');
    if (petForm) {
        petForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const fd = new FormData(petForm);
            const obj = Object.fromEntries(fd);
            obj.picky_eater = document.getElementById('picky-switch')?.classList.contains('active') ? 'true' : 'false';
            await savePet(obj);
        });
    }
    
    const addPetBtn = document.getElementById('btn-add-pet');
    if (addPetBtn) {
        addPetBtn.addEventListener('click', () => { 
            state.showPetForm = true; 
            render(); 
        });
    }
    
    const cancelPetBtn = document.getElementById('btn-cancel-pet');
    if (cancelPetBtn) {
        cancelPetBtn.addEventListener('click', () => { 
            state.showPetForm = false; 
            render(); 
        });
    }
}