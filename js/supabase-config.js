// ==============================================================================
// CONFIGURACIÓN DE SUPABASE
// IMPORTANTE: Cambia estas credenciales por las de tu proyecto en Supabase.
// ==============================================================================

const SUPABASE_URL = 'https://TU_PROYECTO.supabase.co';
const SUPABASE_ANON_KEY = 'TU_ANON_KEY_AQUI';

// Inicialización del cliente de Supabase (disponible globalmente)
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);