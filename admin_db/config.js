// ═══════════════════════════════════════════════════════════════════
//  CONFIGURACIÓN SUPABASE - SERVICE ROLE (ACCESO TOTAL)
//  ⚠️ SOLO USO PERSONAL - NO COMPARTIR
// ═══════════════════════════════════════════════════════════════════

const supabaseUrlAdmin = "https://sshbuqfjiokfzagsfmce.supabase.co";
const supabaseKeyAdmin = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzaGJ1cWZqaW9rZnphZ3NmbWNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDIyNTk3NSwiZXhwIjoyMDk5ODAxOTc1fQ.X3ZoxEXJZi2IE9zDkxnrXzauJTNEPXl3K6msXq0t5_s";

// Crear cliente de Supabase con permisos de administrador (service_role)
const supabaseAdminPanel = supabase.createClient(supabaseUrlAdmin, supabaseKeyAdmin, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

console.log('🔐 Admin DB conectado a Supabase (service_role)');
console.log('📡 URL:', supabaseUrlAdmin);
console.log('⚡ Acceso directo sin autenticación');