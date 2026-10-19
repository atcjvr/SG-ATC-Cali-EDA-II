import { supabase } from "../lib/supabase.js";

// Buscar el ID del controlador autenticado.
async function getControllerId(initials) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) throw authError;

  if (!user) {
    throw new Error("Debes iniciar sesión.");
  }

  const { data: controller, error: controllerError } =
    await supabase
      .from("controllers")
      .select("id")
      .eq("initials", initials)
      .eq("owner_id", user.id)
      .single();

  if (controllerError) throw controllerError;

  return controller.id;
}

// ==========================================
// GUARDAR CAPACITACIÓN EN POSTGRESQL
// ==========================================

export async function saveTrainingToDB({
  initials,
  courseName,
  completionDate,
  observations,
}) {
  const controllerId = await getControllerId(initials);

  const { data, error } = await supabase
    .from("trainings")
    .insert({
      controller_id: controllerId,
      course_name: courseName.trim(),
      completion_date: completionDate,
      observations: observations?.trim() || null,
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

// ==========================================
// RECUPERAR CAPACITACIONES DE POSTGRESQL
// ==========================================

export async function getTrainingsFromDB(initials) {
  const controllerId = await getControllerId(initials);

  const { data, error } = await supabase
    .from("trainings")
    .select(`
      id,
      course_name,
      completion_date,
      observations
    `)
    .eq("controller_id", controllerId)
    .order("completion_date", { ascending: false })
    .order("id", { ascending: false });

  if (error) throw error;

  return data.map((training) => ({
    id: training.id,
    courseName: training.course_name,
    completionDate: training.completion_date,
    observations: training.observations || "",
  }));
}
