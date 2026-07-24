// ═══════════════════════════════════════════════════════════════════
//  AUTH VIEW — Renderiza la pantalla de login / registro
// ═══════════════════════════════════════════════════════════════════

function renderAuth() {
    return `
    <div class="auth-page">
        <!-- Botón volver a la landing -->
        <a href="index.html" class="auth-back-link">← Volver al inicio</a>

        <div style="margin-bottom:2rem;text-align:center">
            <div style="display:inline-flex;align-items:center;gap:0.75rem">
                <div style="width:56px;height:56px;border-radius:16px;background:linear-gradient(135deg,var(--emerald-500),var(--emerald-700));display:flex;align-items:center;justify-content:center;font-size:28px;">🐾</div>
                <div style="text-align:left"><h1 style="font-size:1.5rem;font-weight:700">AnimalPet</h1><p style="font-size:0.8rem;color:var(--gray-500)">Comida Natural para Perros y Gatos</p></div>
            </div>
        </div>
        <div class="auth-card">
            <div class="card-header">
                <h2 id="auth-title">🔑 Iniciar Sesión</h2>
                <p id="auth-subtitle">Accede a tu cuenta para hacer pedidos</p>
            </div>
            <div class="card-body">
                <form id="auth-form">
                    <div id="auth-extra-fields"></div>
                    <div class="form-group"><label>📧 Email *</label><input type="email" name="email" class="form-control" placeholder="correo@ejemplo.com" required></div>
                    <div class="form-group"><label>🔒 Contraseña *</label><input type="password" name="password" class="form-control" placeholder="Mínimo 6 caracteres" required minlength="6"></div>
                    <div id="auth-extra-fields-2"></div>
                    <button type="submit" class="btn btn-primary" style="width:100%;margin-top:0.5rem" id="auth-btn">✅ Entrar</button>
                </form>
                <p class="auth-toggle"><a id="auth-toggle-link">¿No tienes cuenta? Regístrate</a></p>
            </div>
        </div>
    </div>`;
}
