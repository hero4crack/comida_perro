export const SUPABASE_URL = 'https://sshbuqfjiokfzagsfmce.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzaGJ1cWZqaW9rZnphZ3NmbWNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyMjU5NzUsImV4cCI6MjA5OTgwMTk3NX0._-oy1JfxiVouSSIztv1UO_ufBNPg8h-LCDnDb3WW1l0';
export const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzaGJ1cWZqaW9rZnphZ3NmbWNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDIyNTk3NSwiZXhwIjoyMDk5ODAxOTc1fQ.X3ZoxEXJZi2IE9zDkxnrXzauJTNEPXl3K6msXq0t5_s';

// Inicializar clientes Supabase
const supabaseClient = window.supabase;

if (!supabaseClient) {
    console.error("❌ Error: La librería de Supabase no cargó. Revisa tu conexión a internet o desactiva el bloqueador de anuncios.");
}

export const sb = supabaseClient ? supabaseClient.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : {};
export const sbAdmin = supabaseClient ? supabaseClient.createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY) : {};

export const state = {
    user: null, role: null, view: 'auth', tab: 'pedir', mascotas: [], pedidos: [], allPedidos: [], reporte: [], resumen: { total_general: 0, total_pedidos: 0, total_dias: 0 }, search: '', desde: '', hasta: '', showPetForm: false, expandedId: null, expandedDay: null, loading: false, statusFilter: 'todos', preciosConfig: [], showPrecioForm: false
};

export const ESTADOS = { PENDIENTE: 'pendiente', PROCESO: 'en proceso', COMPLETADO: 'completado' };
export const ESTADO_BADGE = { 'pendiente': 'badge-pending', 'en proceso': 'badge-progress', 'completado': 'badge-completed' };
export const ESTADO_ICON = { 'pendiente': '⏳', 'en proceso': '🔄', 'completado': '✅' };
export const SABOR_COLOR = { 'Carne': 'badge-red', 'Pollo': 'badge-yellow', 'Mixta': 'badge-orange', 'Personalizada': 'badge-purple' };