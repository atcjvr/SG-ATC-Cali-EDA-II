import { supabase } from "../lib/supabase.js";

// Obtener el controlador de PostgreSQL a partir de sus siglas
async function getControllerId(initials) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Debes iniciar sesión.");
  }

  const { data, error } = await supabase
    .from("controllers")
    .select("id")
    .eq("initials", initials.trim().toUpperCase())
    .eq("owner_id", user.id)
    .single();

  if (error || !data) {
    throw new Error(
      "No se encontró el controlador en PostgreSQL."
    );
  }

  return data.id;
}

// Registrar o actualizar una habilitación
export async function saveRatingToDB({
  initials,
  code,
  status,
}) {
  const controllerId = await getControllerId(initials);

  const { data: existing, error: searchError } = await supabase
    .from("ratings")
    .select("id")
    .eq("controller_id", controllerId)
    .eq("code", code)
    .maybeSingle();

  if (searchError) {
    throw new Error(
      `Error al consultar habilitación: ${searchError.message}`
    );
  }

  if (existing) {
    // Actualizar habilitación existente
    const { data, error } = await supabase
      .from("ratings")
      .update({ status })
      .eq("id", existing.id)
      .eq("controller_id", controllerId)
      .select()
      .single();

    if (error) {
      throw new Error(
        `Error al actualizar habilitación: ${error.message}`
      );
    }

    return data;
  }

  // Registrar una habilitación nueva
  const { data, error } = await supabase
    .from("ratings")
    .insert({
      controller_id: controllerId,
      code,
      status,
    })
    .select()
    .single();

  if (error) {
    throw new Error(
      `Error al registrar habilitación: ${error.message}`
    );
  }

  return data;
}

// Recuperar las habilitaciones de un controlador
export async function getRatingsFromDB(initials) {
  const controllerId = await getControllerId(initials);

  const { data, error } = await supabase
    .from("ratings")
    .select("code, status")
    .eq("controller_id", controllerId);

  if (error) {
    throw new Error(
      `Error al recuperar habilitaciones: ${error.message}`
    );
  }

  return data ?? [];
}