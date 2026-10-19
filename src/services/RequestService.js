import { supabase } from "../lib/supabase.js";

// Obtener el usuario autenticado.
async function getAuthenticatedUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  if (!user) throw new Error("Debes iniciar sesión.");

  return user;
}

// Obtener el identificador del controlador.
async function getControllerId(initials) {
  const user = await getAuthenticatedUser();

  const { data, error } = await supabase
    .from("controllers")
    .select("id")
    .eq("initials", initials)
    .eq("owner_id", user.id)
    .single();

  if (error) throw error;

  return data.id;
}

// ==========================================
// GUARDAR SOLICITUD
// ==========================================

export async function saveRequestToDB({
  initials,
  type,
  description,
}) {
  const controllerId = await getControllerId(initials);

  const { data, error } = await supabase
    .from("requests")
    .insert({
      controller_id: controllerId,
      request_type: type,
      description: description.trim(),
    })
    .select("id, request_type, description, created_at, status")
    .single();

  if (error) throw error;

  return {
    id: data.id,
    initials,
    type: data.request_type,
    description: data.description,
    createdAt: data.created_at,
    status: data.status,
  };
}

// ==========================================
// RECUPERAR SOLICITUDES PENDIENTES
// ==========================================

export async function getPendingRequestsFromDB() {
  const user = await getAuthenticatedUser();

  const { data: controllers, error: controllersError } =
    await supabase
      .from("controllers")
      .select("id, initials")
      .eq("owner_id", user.id);

  if (controllersError) throw controllersError;

  if (!controllers.length) return [];

  const initialsById = new Map(
    controllers.map((controller) => [
      String(controller.id),
      controller.initials,
    ])
  );

  const { data, error } = await supabase
    .from("requests")
    .select(
      "id, controller_id, request_type, description, created_at, status"
    )
    .in(
      "controller_id",
      controllers.map((controller) => controller.id)
    )
    .eq("status", "PENDIENTE")
    .order("created_at", { ascending: true })
    .order("id", { ascending: true });

  if (error) throw error;

  return data.map((request) => ({
    id: request.id,
    initials: initialsById.get(String(request.controller_id)),
    type: request.request_type,
    description: request.description,
    createdAt: request.created_at,
    status: request.status,
  }));
}

// ==========================================
// ATENDER SOLICITUD
// ==========================================

export async function attendRequestInDB(requestId) {
  const { data, error } = await supabase
    .from("requests")
    .update({
      status: "ATENDIDA",
      attended_at: new Date().toISOString(),
    })
    .eq("id", requestId)
    .eq("status", "PENDIENTE")
    .select("id")
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    throw new Error(
      "La solicitud ya fue atendida o no está disponible."
    );
  }

  return data;
}