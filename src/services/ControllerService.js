// ==========================================
// SG-ATC CALI
// SERVICIO DE CONTROLADORES
// Persistencia con Supabase PostgreSQL
// ==========================================

import { supabase } from "../lib/supabase.js";

// ==========================================
// CONSULTAR CONTROLADORES
// ==========================================

export async function getControllersFromDB() {
  const { data, error } = await supabase
    .from("controllers")
    .select("initials, name")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(
      `Error al consultar controladores: ${error.message}`
    );
  }

  return data ?? [];
}

// ==========================================
// REGISTRAR CONTROLADOR
// ==========================================

export async function saveControllerToDB({
  initials,
  name,
}) {
  const normalizedInitials = initials.trim().toUpperCase();
  const normalizedName = name.trim();

  if (!/^[A-Z]{3}$/.test(normalizedInitials)) {
    throw new Error(
      "Las siglas deben contener exactamente tres letras."
    );
  }

  if (!normalizedName) {
    throw new Error(
      "Debe ingresar el nombre del controlador."
    );
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error(
      "Debe iniciar sesión para registrar controladores."
    );
  }

  const { data, error } = await supabase
    .from("controllers")
    .insert({
      initials: normalizedInitials,
      name: normalizedName,
      owner_id: user.id,
    })
    .select("initials, name")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error(
        "Ya existe un controlador con esas siglas."
      );
    }

    throw new Error(
      `Error al guardar controlador: ${error.message}`
    );
  }

  return data;
}

// ==========================================
// ELIMINAR CONTROLADOR
// ==========================================

export async function deleteControllerFromDB(initials) {
  const { error } = await supabase
    .from("controllers")
    .delete()
    .eq("initials", initials.trim().toUpperCase());

  if (error) {
    throw new Error(
      `Error al eliminar controlador: ${error.message}`
    );
  }

  return true;
}