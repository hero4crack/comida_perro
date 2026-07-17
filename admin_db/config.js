// Configuración de Supabase con clave service_role (Superusuario)
// ⚠️ ESTA CLAVE SOLO DEBE USARSE EN EL PANEL DE ADMINISTRACIÓN

const supabaseUrlAdmin = "https://sshbuqfjiokfzagsfmce.supabase.co"; // 🚀 URL CORREGIDA (Era sshbuq, no sshbq)
const supabaseKeyAdmin = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzaGJ1cWZqaW9rZnphZ3NmbWNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDIyNTk3NSwiZXhwIjoyMDk5ODAxOTc1fQ.X3ZoxEXJZi2IE9zDkxnrXzauJTNEPXl3K6msXq0t5_s";

// Clave pública (para autenticación de usuarios)
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzaGJ1cWZqaW9rZnphZ3NmbWNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyMjU5NzUsImV4cCI6MjA5OTgwMTk3NX0._-oy1JfxiVouSSIztv1UO_ufBNPg8h-LCDnDb3WW1l0";

// Crear cliente de Supabase con permisos de administrador
const supabaseAdminPanel = supabase.createClient(supabaseUrlAdmin, supabaseKeyAdmin);

// Cliente público para autenticación normal
const supabasePublic = supabase.createClient(supabaseUrlAdmin, supabaseAnonKey);

// Verificar conexión
console.log('🔐 Panel Admin conectado a Supabase');
console.log('📡 URL:', supabaseUrlAdmin);