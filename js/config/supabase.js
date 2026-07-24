// ═══════════════════════════════════════════════════════════════════
//  CONFIGURACIÓN SUPABASE
//  Centraliza las credenciales y la inicialización de los clientes
//  Supabase (anon + service role).
// ═══════════════════════════════════════════════════════════════════

const SUPABASE_URL = 'https://sshbuqfjiokfzagsfmce.supabase.co';

const SUPABASE_ANON_KEY =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
    'eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzaGJ1cWZqaW9rZnphZ3NmbWNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyMjU5NzUsImV4cCI6MjA5OTgwMTk3NX0.' +
    '_-oy1JfxiVouSSIztv1UO_ufBNPg8h-LCDnDb3WW1l0';

const SUPABASE_SERVICE_KEY =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
    'eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzaGJ1cWZqaW9rZnphZ3NmbWNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDIyNTk3NSwiZXhwIjoyMDk5ODAxOTc1fQ.' +
    'X3ZoxEXJZi2IE9zDkxnrXzauJTNEPXl3K6msXq0t5_s';

console.log('🔌 Conectando a Supabase...');

// Cliente con clave anon (reseta RLS, usado para auth del usuario actual)
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Cliente con service role (omite RLS, usado para operaciones administrativas
// como leer/escribir perfiles, clientes, mascotas, pedidos, precios, etc.)
const sbAdmin = window.supabase.createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

console.log('✅ Clientes Supabase creados');
