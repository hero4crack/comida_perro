// ==============================================================================
// CONFIGURACIÓN DE SUPABASE
// IMPORTANTE: Cambia estas credenciales por las de tu proyecto en Supabase.
// ==============================================================================

const SUPABASE_URL = 'https://sshbuqfjokfzagsfmce.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_w_Ci3nkQoz12PQXoCaB6ZQ_KRCHtips';

// Inicialización del cliente de Supabase (disponible globalmente)
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);