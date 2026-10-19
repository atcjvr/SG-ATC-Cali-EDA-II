import { supabase } from "../lib/supabase.js";

// Buscar el identificador del controlador en PostgreSQL
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

// Guardar una certificación de inglés OACI
export async function saveEnglishToDB({
  initials,
  level,
  evaluationDate,
  expirationDate,
}) {
  const controllerId = await getControllerId(initials);

  const certification = {
    controller_id: controllerId,
    level: Number(level),
    evaluation_date: evaluationDate,
    expiration_date: expirationDate || null,
  };

  // Consultar si ya existe una certificación
  const { data: existing, error: searchError } = await supabase
    .from("english_certifications")
    .select("id")
    .eq("controller_id", controllerId)
    .maybeSingle();

  if (searchError) {
    throw new Error(
      `Error al consultar certificación: ${searchError.message}`
    );
  }

  if (existing) {
    // Actualizar certificación existente
    const { data, error } = await supabase
      .from("english_certifications")
      .update(certification)
      .eq("id", existing.id)
      .eq("controller_id", controllerId)
      .select()
      .single();

    if (error) {
      throw new Error(
        `Error al actualizar certificación: ${error.message}`
      );
    }

    return data;
  }

  // Registrar nueva certificación
  const { data, error } = await supabase
    .from("english_certifications")
    .insert(certification)
    .select()
    .single();

  if (error) {
    throw new Error(
      `Error al registrar certificación: ${error.message}`
    );
  }

  return data;
}

// Recuperar la certificación de un controlador
export async function getEnglishFromDB(initials) {
  const controllerId = await getControllerId(initials);

  const { data, error } = await supabase
    .from("english_certifications")
    .select("level, evaluation_date, expiration_date")
    .eq("controller_id", controllerId)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Error al recuperar certificación: ${error.message}`
    );
  }

  return data;
}