// ═══════════════════════════════════════════════════════════════════
//  CONSTANTES DE DOMINIO
//  Estados de pedido, mapeo de badges/iconos y colores de sabores.
// ═══════════════════════════════════════════════════════════════════

// Estados posibles de un pedido
const ESTADOS = {
    PENDIENTE: 'pendiente',
    PROCESO: 'en proceso',
    COMPLETADO: 'completado'
};

// Mapeo estado -> clase CSS del badge
const ESTADO_BADGE = {
    'pendiente': 'badge-pending',
    'en proceso': 'badge-progress',
    'completado': 'badge-completed'
};

// Mapeo estado -> emoji icono
const ESTADO_ICON = {
    'pendiente': '⏳',
    'en proceso': '🔄',
    'completado': '✅'
};

// Mapeo sabor -> clase CSS del badge
const SABOR_COLOR = {
    'Carne': 'badge-red',
    'Pollo': 'badge-yellow',
    'Mixta': 'badge-orange',
    'Personalizada': 'badge-purple'
};
