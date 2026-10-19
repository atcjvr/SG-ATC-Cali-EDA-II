// ==========================================
// SG-ATC CALI
// CONEXIÓN CON SUPABASE
// Estructura de Datos y Algoritmos II
// ==========================================

import { createClient } from "@supabase/supabase-js";

// Obtener configuración desde .env.local

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Verificar que exista la configuración

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Faltan las variables de entorno de Supabase."
  );
}

// Crear cliente de conexión

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);
