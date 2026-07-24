# 🐾 AnimalPet — Versión Modularizada

Comida natural para perros y gatos. Aplicación web SPA construida con
**HTML + CSS + JavaScript (scripts clásicos modulares)** y **Supabase**
como backend.

Este proyecto es el resultado de modularizar un archivo `index.html`
monolítico de ~108 KB en una estructura funcional de múltiples archivos
CSS y JavaScript, manteniendo 100 % del comportamiento original.

> ✅ **Funciona con doble clic** (`file://`) — NO requiere servidor HTTP.
> ✅ **Estructura modular** — cada persona del equipo trabaja en sus
>    propios archivos sin tocar los demás.

---

## 🚀 Cómo ejecutar

### Opción 1 — Doble clic (la más fácil)

Abre `index.html` con doble clic. Se abre en el navegador con
`file://`. Funciona directamente porque los scripts se cargan como
**scripts clásicos** (no ES modules) en orden topológico.

### Opción 2 — Servidor HTTP (opcional, para desarrollo)

```bash
cd animalpet
python3 -m http.server 8000
# Abre http://localhost:8000
```

---

## 📁 Estructura del proyecto

```
animalpet/
├── index.html                  # Carga CSS + 14 scripts en orden topológico
│
├── css/                        # Hojas de estilo modulares
│   ├── variables.css           # Colores y radios (sistema de diseño)
│   ├── base.css                # Reset y estilos base globales
│   ├── layout.css              # Header, main, footer, tabs
│   ├── components.css          # Botones, cards, badges, sale-row, etc.
│   ├── forms.css               # Formularios y switches
│   ├── auth.css                # Pantalla de login / registro
│   ├── admin.css               # Panel de administración
│   ├── feedback.css            # Toasts y spinners
│   └── responsive.css          # Media queries
│
└── js/                         # JavaScript modular (scripts clásicos)
    ├── main.js                 # Punto de entrada: setupAuthListener + initAuth
    ├── app.js                  # render() + exposición global en window
    ├── events.js               # bindEvents() tras cada render
    │
    ├── config/
    │   ├── supabase.js         # Inicializa clientes sb (anon) y sbAdmin (service)
    │   └── constants.js        # ESTADOS, ESTADO_BADGE, ESTADO_ICON, SABOR_COLOR
    │
    ├── state/
    │   └── state.js            # Objeto global `state` (vista, tab, datos…)
    │
    ├── utils/
    │   └── helpers.js          # esc(), toast(), showLoading()
    │
    ├── services/               # Lógica de negocio / acceso a Supabase
    │   ├── authService.js      # login, register, logout, initAuth, ensureClienteExists
    │   ├── dataService.js      # loadClienteData, loadAdminData, loadReporte
    │   ├── preciosService.js   # CRUD de config_precios + calcularPrecio (RPC)
    │   └── operacionesService.js # savePet, deletePet, placeOrder, updateOrderStatus, deleteRegistro
    │
    └── views/                  # Funciones de renderizado (devuelven HTML string)
        ├── authView.js         # renderAuth()
        ├── clienteView.js      # renderCliente + renderPedidoForm + renderMascotas + renderHistorial
        └── adminView.js        # renderAdmin + renderAdminVentas + renderAdminReportes + renderAdminPrecios
```

---

## 🧩 Arquitectura

### ¿Por qué scripts clásicos y no ES modules?

Los **ES modules** (`import`/`export`) NO funcionan con `file://` por
políticas CORS del navegador. Por eso esta versión usa **scripts
clásicos** (sin `import` ni `export`) cargados en orden topológico vía
`<script src="...">`. Esto permite:

- ✅ Abrir el proyecto con doble clic (`file://`).
- ✅ Mantener la estructura modular: cada archivo es independiente.
- ✅ Sin paso de build — lo que escribes en el archivo es lo que se
     ejecuta.
- ✅ Cada persona del equipo puede trabajar en sus propios archivos
     sin pisar a nadie.

### Orden de carga de los scripts

`index.html` carga los scripts en este orden topológico (cada archivo
depende de los anteriores):

```
1. config/supabase.js       → credenciales + clientes Supabase
2. config/constants.js      → ESTADOS, badges, iconos, colores
3. state/state.js           → estado global (window.state)
4. utils/helpers.js         → esc, toast, showLoading
5. services/dataService.js  → carga de datos (cliente, admin, reporte)
6. services/preciosService.js → CRUD de precios + cálculo
7. services/operacionesService.js → savePet, deletePet, placeOrder, etc.
8. services/authService.js  → login, register, logout, initAuth
9. views/authView.js        → pantalla de login/registro
10. views/clienteView.js    → vista del cliente (pedir, mascotas, historial)
11. views/adminView.js      → vista del admin (ventas, reportes, precios)
12. events.js               → bindEvents() tras cada render
13. app.js                  → render() + expone funciones en window
14. main.js                 → punto de entrada (initAuth)
```

### Flujo de renderizado

```
main.js
  └─ setupAuthListener()      ← suscribe a cambios de auth (otras pestañas, etc.)
  └─ initAuth()               ← verifica sesión existente al cargar
       └─ loadUserDataForRole()
            ├─ admin  → loadAdminData() + loadPreciosConfig()
            └─ user   → loadClienteData()
       └─ render()             ← dibuja según state.view
            ├─ renderAuth()    / renderCliente() / renderAdmin()
            └─ bindEvents()    ← re-ataca listeners tras cada render
```

### Estado global

Toda la app lee y muta un único objeto `state` desde `js/state/state.js`.
Se expone en `window.state` para que los handlers inline del HTML
renderizado (p. ej. `onclick="state.tab='mascotas';render()"`) sigan
funcionando.

### Exposición global en `window`

Los scripts clásicos tienen scope compartido, pero los handlers inline
del HTML (`onclick="logout()"`, etc.) requieren que las funciones
estén en `window`. Las **function declarations** al top level
automáticamente van a `window`. `js/app.js` además expone explícitamente
las funciones críticas:

```js
window.render             = render;
window.logout             = logout;
window.deletePet          = deletePet;
window.updateOrderStatus  = updateOrderStatus;
window.deleteRegistro     = deleteRegistro;
window.deletePrecioConfig = deletePrecioConfig;
```

---

## 👥 Cómo trabajar en equipo

Cada archivo tiene responsabilidades claras. Sugerencia de reparto:

| Persona | Archivos que toca                              |
|---------|------------------------------------------------|
| Dev A   | `js/views/*`, `js/app.js`, `js/events.js` (UI) |
| Dev B   | `js/services/*`, `js/config/*` (backend logic) |
| Dev C   | `css/*` (estilos)                              |

**Reglas para no romper nada:**
1. Si añades una función nueva que se usa desde otro archivo,
   declárala con `function foo() { ... }` (NO `const foo = () => ...`)
   para que vaya automáticamente a `window`.
2. Si añades un archivo nuevo, añádelo a `index.html` en la posición
   correcta del orden topológico.
3. Si introduces una dependencia circular, asegúrate de que las
   referencias cruzadas se usen **en tiempo de ejecución** (dentro de
   funciones), no en tiempo de carga.

---

## 🔧 Dependencias externas

- **Supabase JS SDK v2** (vía CDN en `index.html`)
- Backend Supabase con estas tablas / RPCs:
  - `profiles`, `clientes`, `mascotas`, `pedidos`, `config_precios`
  - RPCs: `calcular_precio_pedido`, `actualizar_estado_pedido`,
    `eliminar_mascota_completa`, `eliminar_pedido_completo`

---

## ✅ Diferencias respecto al `index.html` original

| Aspecto              | Original            | Modularizado                            |
|----------------------|---------------------|-----------------------------------------|
| Archivos             | 1 (`index.html`)    | 1 HTML + 9 CSS + 14 JS = **24 archivos** |
| CSS                  | Inline en `<style>` | 9 hojas modulares enlazadas             |
| JavaScript           | Inline en `<script>`| 14 scripts clásicos modulares           |
| Lógica de negocio    | Mezclada con UI     | Separada en `services/`                 |
| Vistas               | Funciones globales  | Módulos en `views/`                     |
| Estado               | Variable global     | Módulo dedicado `state/state.js`        |
| Funcionalidad        | —                   | **Idéntica** (mismos logs, mismos flujos)|
| Abrir con doble clic | ✅ Sí               | ✅ Sí                                    |
