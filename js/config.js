// ═══════════════════════════════════════════════════════════════════
//  SUPABASE CONFIG & GLOBAL STATE
// ═══════════════════════════════════════════════════════════════════

const SUPABASE_URL = 'https://sshbuqfjiokfzagsfmce.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzaGJ1cWZqaW9rZnphZ3NmbWNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyMjU5NzUsImV4cCI6MjA5OTgwMTk3NX0._-oy1JfxiVouSSIztv1UO_ufBNPg8h-LCDnDb3WW1l0';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzaGJ1cWZqaW9rZnphZ3NmbWNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDIyNTk3NSwiZXhwIjoyMDk5ODAxOTc1fQ.X3ZoxEXJZi2IE9zDkxnrXzauJTNEPXl3K6msXq0t5_s';

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const sbAdmin = window.supabase.createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Estado global
let state = {
    user: null,
    role: null,
    view: 'auth', // auth | cliente | admin
    tab: 'pedir',  // pedir | mascotas | historial | ventas | reportes
    mascotas: [],
    pedidos: [],
    allPedidos: [],
    reporte: [],
    resumen: { total_general: 0, total_pedidos: 0, total_dias: 0 },
    search: '',
    desde: '',
    hasta: '',
    loading: false,
    showPetForm: false,
    expandedId: null,
    expandedDay: null,
};

// Constantes compartidas
const SABOR_COLOR = { 
    'Carne': 'badge-red', 
    'Pollo': 'badge-yellow', 
    'Mixta': 'badge-orange', 
    'Personalizada': 'badge-purple' 
};

const ACTIVIDAD_VARIANT = { 
    'Alta': 'badge-default', 
    'Media': 'badge-default', 
    'Baja': '' 
};