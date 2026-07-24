// ═══════════════════════════════════════════════════════════════════
//  LANDING VIEW — Página de inicio pública de AnimalPet
//  Es la PRIMERA pantalla que ve el usuario al abrir la app.
//  Los botones "Iniciar Sesión" / "Crear Mi Plan" navegan a la vista
//  de autenticación (state.view = 'auth') en el modo correspondiente.
// ═══════════════════════════════════════════════════════════════════

function renderLanding() {
    return `
    <div class="landing-page">

        <!-- Barra superior -->
        <div class="landing-top-bar">
            <span>💛 Dona 1 plato aquí y nosotros igualamos tu donación</span>
        </div>

        <!-- Navbar -->
        <header class="landing-navbar">
            <a href="#" class="landing-brand" onclick="event.preventDefault()">
                <div class="landing-brand-logo">🐾</div>
                <div>
                    <div class="landing-brand-name">AnimalPet</div>
                    <div class="landing-brand-tagline">Comida Natural para Perros y Gatos</div>
                </div>
            </a>

            <ul class="landing-nav-links">
                <li><a href="#recetas">Recetas</a></li>
                <li><a href="#faq">FAQ</a></li>
                <li><a href="#por-que">Por qué natural</a></li>
                <li><a href="#como">Cómo funciona</a></li>
            </ul>

            <div class="landing-nav-right">
                <button class="landing-btn landing-btn-outline" onclick="goToAuth('login')">👤 Iniciar Sesión</button>
                <button class="landing-btn landing-btn-primary" onclick="goToAuth('register')">Crear Mi Plan</button>
            </div>
        </header>

        <!-- Hero -->
        <section class="landing-hero">
            <div>
                <span class="landing-hero-eyebrow">🌿 100% Natural · Veterinariamente aprobado</span>
                <h1 class="landing-hero-title">Comida de verdad,<br><span class="accent">vida de verdad</span></h1>
                <p class="landing-hero-subtitle">Arma el plan de alimentación hecho a la medida para tu peludo en un minuto. Cocinado con ingredientes de calidad humana, entregado en tu puerta.</p>

                <div class="landing-hero-buttons">
                    <button class="landing-btn landing-btn-primary" onclick="goToAuth('register')">Comenzar Ahora ➔</button>
                    <button class="landing-btn landing-btn-outline" onclick="goToAuth('login')">¿Ya tienes cuenta? Inicia sesión</button>
                </div>

                <div class="landing-hero-trust">
                    <span>🐾 <strong>+7.9k</strong> peludos felices y sanitos ya hicieron el cambio</span>
                </div>
            </div>

            <div class="landing-hero-image">
                <img src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=900" alt="Mascota comiendo feliz">
            </div>
        </section>

        <!-- Tarjetas de color -->
        <section class="landing-color-section" id="por-que">
            <div class="landing-color-section-header">
                <h2>Tú no debes ser el único comiendo saludable</h2>
                <p>ellos también lo merecen</p>
            </div>

            <div class="landing-cards-grid-3">
                <div class="landing-card-feature landing-card-light">
                    <span class="icon">🥘</span>
                    <h3>Cocinado con amor</h3>
                    <p>100% natural y balanceado para tu peludo, lo cocinamos previamente para eliminar los riesgos de bacterias de alimentos crudos.</p>
                </div>
                <div class="landing-card-feature landing-card-white">
                    <span class="icon">🩺</span>
                    <h3>Formulado por Veterinarios</h3>
                    <p>Nuestras recetas están 100% formuladas y aprobadas por veterinarios expertos en alimentación canina y felina.</p>
                </div>
                <div class="landing-card-feature landing-card-emerald">
                    <span class="icon">💚</span>
                    <h3>Ingredientes de Calidad Humana</h3>
                    <p>¡Lo que se cocina con amor, sabe mejor! Utilizamos proteínas seleccionadas y el toque secreto: hacer cada porción con cariño.</p>
                </div>
            </div>
        </section>

        <!-- Pasos -->
        <section class="landing-steps-section" id="como">
            <h2>¿Cómo funciona?</h2>
            <p>En 3 simples pasos, tu peludo empezará a disfrutar de comida fresca.</p>

            <div class="landing-steps-grid">
                <div class="landing-step-card">
                    <div class="landing-step-number">01</div>
                    <h3>¡Preséntanos a tu peludo!</h3>
                    <p>Queremos conocerlo de patitas a cabeza. Así armamos un plan adaptado a sus necesidades.</p>
                </div>
                <div class="landing-step-card">
                    <div class="landing-step-number">02</div>
                    <h3>Cocinamos con amor 💛</h3>
                    <p>Cocinamos con alimentos de calidad humana: seguros, naturales y la proteína es el ingrediente N° 1.</p>
                </div>
                <div class="landing-step-card">
                    <div class="landing-step-number">03</div>
                    <h3>¡Recibe en tu puerta!</h3>
                    <p>Te entregamos la comida fresca con la frecuencia que escojas. Cancela cuando quieras.</p>
                </div>
            </div>
        </section>

        <!-- Píldoras de beneficios -->
        <section class="landing-pills-section">
            <h2>Está comprobado que la comida natural reduce la posibilidad de:</h2>
            <div class="landing-pills-container">
                <span class="landing-pill-tag">🔥 Inflamación</span>
                <span class="landing-pill-tag">🤧 Alergias</span>
                <span class="landing-pill-tag">💔 Enfermedades crónicas</span>
                <span class="landing-pill-tag">⏳ Deterioro por edad</span>
            </div>
        </section>

        <!-- Recetas -->
        <section class="landing-recipes-section" id="recetas">
            <h2>Nuestras Recetas</h2>
            <p>Cada receta está elaborada con ingredientes frescos de calidad humana.</p>

            <div class="landing-filter-tabs">
                <button class="landing-tab-btn active">Todos</button>
                <button class="landing-tab-btn">🐕 Perros</button>
                <button class="landing-tab-btn">🐱 Gatos</button>
            </div>

            <div class="landing-recipe-display">
                <div style="display: flex; flex-direction: column; gap: 1rem;">
                    <div class="landing-recipe-sidebar-card active">
                        <h3>🥩 Res</h3>
                        <p>Rica en hierro para peludos activos que necesitan energía extra.</p>
                    </div>
                    <div class="landing-recipe-sidebar-card">
                        <h3>🍗 Pollo</h3>
                        <p>Receta ligera y digestible para estómagos sensibles.</p>
                    </div>
                </div>

                <div class="landing-recipe-main-card">
                    <h2>🥩 Receta de Res</h2>
                    <p>Ideal para mantener la masa muscular y vitalidad alta.</p>

                    <h4>🐕 Para Perros:</h4>
                    <div class="landing-ingredient-tags">
                        <span class="landing-ing-tag">Carne de res</span>
                        <span class="landing-ing-tag">Vísceras de res</span>
                        <span class="landing-ing-tag">Batata</span>
                        <span class="landing-ing-tag">Espinaca</span>
                        <span class="landing-ing-tag">Zanahoria</span>
                        <span class="landing-ing-tag">Aceite de oliva</span>
                    </div>
                    <button class="landing-btn landing-btn-primary" style="margin-bottom:1.25rem" onclick="goToAuth('register')">Probar para Perro</button>

                    <h4>🐱 Para Gatos:</h4>
                    <div class="landing-ingredient-tags">
                        <span class="landing-ing-tag">Carne de res</span>
                        <span class="landing-ing-tag">Vísceras</span>
                        <span class="landing-ing-tag">Huevo</span>
                        <span class="landing-ing-tag">Aceite de salmón</span>
                    </div>
                    <button class="landing-btn landing-btn-outline" onclick="goToAuth('register')">Probar para Gato</button>
                </div>
            </div>
        </section>

        <!-- FAQ -->
        <section class="landing-faq-section" id="faq">
            <h2>Preguntas Frecuentes</h2>
            <p>¿Tienes dudas? Aquí encontrarás las respuestas más comunes.</p>

            <div class="landing-faq-item">
                <div class="landing-faq-header" onclick="toggleFaq(this)">
                    ¿Cómo se calcula la porción de mi mascota? <span class="chevron">∨</span>
                </div>
                <div class="landing-faq-body">
                    Calculamos las calorías necesarias analizando la edad, peso actual, nivel de actividad física y metas de peso de tu peludo.
                </div>
            </div>

            <div class="landing-faq-item">
                <div class="landing-faq-header" onclick="toggleFaq(this)">
                    ¿Puedo cambiar o cancelar mi suscripción? <span class="chevron">∨</span>
                </div>
                <div class="landing-faq-body">
                    ¡Sí, 100%! Puedes pausar, modificar las recetas o cancelar tu plan en cualquier momento desde tu panel de usuario sin penalizaciones.
                </div>
            </div>

            <div class="landing-faq-item">
                <div class="landing-faq-header" onclick="toggleFaq(this)">
                    ¿Cómo se mantiene fresca la comida? <span class="chevron">∨</span>
                </div>
                <div class="landing-faq-body">
                    Cocinamos la comida, la dividimos en sus porciones diarias y la congelamos inmediatamente antes de enviártela a domicilio.
                </div>
            </div>
        </section>

        <!-- CTA final -->
        <section class="landing-cta">
            <h2>Empieza hoy el cambio de tu peludo</h2>
            <p>Únete a miles de familias que ya disfrutan de comida natural en casa.</p>
            <button class="landing-btn landing-btn-primary" onclick="goToAuth('register')">Crear Mi Plan Ahora ➔</button>
        </section>

        <!-- Footer -->
        <footer class="landing-footer">
            <div class="brand">🐾 AnimalPet</div>
            <div>Comida Natural para Perros y Gatos · Hecho con 💚</div>
        </footer>

    </div>`;
}

/* ──────────────────────────────────────────────────────────────────
   NAVEGACIÓN: landing → login.html
   `mode` es 'login' | 'register'. Se pasa como query param para que
   login.html abra directamente el formulario correcto.
   ────────────────────────────────────────────────────────────────── */
function goToAuth(mode) {
    const target = mode === 'register' ? 'login.html?mode=register' : 'login.html';
    window.location.href = target;
}

/* ──────────────────────────────────────────────────────────────────
   ACORDEÓN FAQ — abre solo uno a la vez
   ────────────────────────────────────────────────────────────────── */
function toggleFaq(element) {
    const item = element.parentElement;
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.landing-faq-item').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
}
