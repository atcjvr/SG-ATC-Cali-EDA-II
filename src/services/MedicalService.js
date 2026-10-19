import { supabase } from "../lib/supabase.js";

// Buscar el controlador en PostgreSQL mediante sus siglas
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

// Guardar o actualizar un certificado médico
export async function saveMedicalToDB({
  initials,
  issueDate,
  expirationDate,
}) {
  const controllerId = await getControllerId(initials);

  if (!issueDate || !expirationDate) {
    throw new Error(
      "El certificado médico debe tener fecha de expedición y vencimiento."
    );
  }

  const certificate = {
    controller_id: controllerId,
    issue_date: issueDate,
    expiration_date: expirationDate,
  };

  // Consultar si ya existe un certificado
  const { data: existing, error: searchError } = await supabase
    .from("medical_certificates")
    .select("id")
    .eq("controller_id", controllerId)
    .maybeSingle();

  if (searchError) {
    throw new Error(
      `Error al consultar certificado médico: ${searchError.message}`
    );
  }

  if (existing) {
    // Actualizar certificado existente
    const { data, error } = await supabase
      .from("medical_certificates")
      .update(certificate)
      .eq("id", existing.id)
      .eq("controller_id", controllerId)
      .select()
      .single();

    if (error) {
      throw new Error(
        `Error al actualizar certificado médico: ${error.message}`
      );
    }

    return data;
  }

  // Registrar un nuevo certificado médico
  const { data, error } = await supabase
    .from("medical_certificates")
    .insert(certificate)
    .select()
    .single();

  if (error) {
    throw new Error(
      `Error al registrar certificado médico: ${error.message}`
    );
  }

  return data;
}

// Recuperar el certificado médico de un controlador
export async function getMedicalFromDB(initials) {
  const controllerId = await getControllerId(initials);

  const { data, error } = await supabase
    .from("medical_certificates")
    .select("issue_date, expiration_date")
    .eq("controller_id", controllerId)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Error al recuperar certificado médico: ${error.message}`
    );
  }

  return data;
}