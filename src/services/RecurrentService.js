import { supabase } from "../lib/supabase.js";

// Buscar el controlador autenticado y su habilitación.
async function getControllerAndRating(initials, ratingCode) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) throw authError;
  if (!user) throw new Error("Debes iniciar sesión.");

  const { data: controller, error: controllerError } = await supabase
    .from("controllers")
    .select("id")
    .eq("initials", initials)
    .eq("owner_id", user.id)
    .single();

  if (controllerError) throw controllerError;

  const { data: rating, error: ratingError } = await supabase
    .from("ratings")
    .select("id")
    .eq("controller_id", controller.id)
    .eq("code", ratingCode)
    .single();

  if (ratingError) throw ratingError;

  return {
    controllerId: controller.id,
    ratingId: rating.id,
  };
}

// Guardar un curso recurrente.
export async function saveRecurrentToDB({
  initials,
  ratingCode,
  completionDate,
  expirationDate,
}) {
  const { controllerId, ratingId } =
    await getControllerAndRating(initials, ratingCode);

  const { data, error } = await supabase
    .from("recurrent_courses")
    .insert({
      controller_id: controllerId,
      rating_id: ratingId,
      completion_date: completionDate,
      expiration_date: expirationDate,
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

// Recuperar el historial de cursos recurrentes.
export async function getRecurrentFromDB(initials) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) throw authError;
  if (!user) throw new Error("Debes iniciar sesión.");

  const { data: controller, error: controllerError } = await supabase
    .from("controllers")
    .select("id")
    .eq("initials", initials)
    .eq("owner_id", user.id)
    .single();

  if (controllerError) throw controllerError;

  const { data, error } = await supabase
    .from("recurrent_courses")
    .select(`
      id,
      completion_date,
      expiration_date,
      ratings!inner (
        code
      )
    `)
    .eq("controller_id", controller.id)
    .order("completion_date", { ascending: false });

  if (error) throw error;

  return data.map((course) => ({
    id: course.id,
    ratingCode: course.ratings.code,
    completionDate: course.completion_date,
    expirationDate: course.expiration_date,
  }));
}