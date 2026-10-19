// ==========================================
// SG-ATC CALI
// Catálogo de adiciones y habilitaciones
// Estructura de Datos y Algoritmos II
// ==========================================

// ADICIONES DE LICENCIA CTA

export const LICENSE_RATINGS = [
  {
    code: "AD",
    name: "Control de Aeródromo",
    type: "LICENCIA",
  },
  {
    code: "APP",
    name: "Control de Aproximación por Procedimientos",
    type: "LICENCIA",
  },
  {
    code: "ACC",
    name: "Control de Área por Procedimientos",
    type: "LICENCIA",
  },
  {
    code: "APPS",
    name: "Control de Aproximación por Vigilancia",
    type: "LICENCIA",
  },
  {
    code: "ACCS",
    name: "Control de Área por Vigilancia",
    type: "LICENCIA",
  },
];

// HABILITACIÓN ADICIONAL

export const ADDITIONAL_RATINGS = [
  {
    code: "SUP",
    name: "Supervisor de Control de Tránsito Aéreo",
    type: "HABILITACION",
  },
];

// CATÁLOGO COMPLETO

export const ALL_RATINGS = [
  ...LICENSE_RATINGS,
  ...ADDITIONAL_RATINGS,
];

// ESTADOS DE HABILITACIÓN

export const RATING_STATUS = {
  ACTIVE: "VIGENTE",
  INACTIVE: "NO_VIGENTE",
  TRAINING: "ENTRENAMIENTO",
};

// NIVELES DE INGLÉS OACI

export const ICAO_LEVELS = [1, 2, 3, 4, 5, 6];

// DATOS INICIALES DE UN CONTROLADOR

export const createController = ({
  initials,
  name,
}) => ({
  id: crypto.randomUUID(),
  initials: initials.trim().toUpperCase(),
  name: name.trim(),

  ratings: [],

  english: {
    level: null,
    expirationDate: null,
  },

  recurrentCourse: {
    completionDate: null,
    expirationDate: null,
  },

  active: true,
});

// CREAR REGISTRO DE HABILITACIÓN

export const createRating = ({
  code,
  status = RATING_STATUS.ACTIVE,
}) => {
  const rating = ALL_RATINGS.find(
    (item) => item.code === code
  );

  if (!rating) {
    throw new Error(
      `La habilitación ${code} no existe.`
    );
  }

  return {
    code: rating.code,
    name: rating.name,
    type: rating.type,
    status,
  };
};

// CONTAR ADICIONES DE LICENCIA

export const countLicenseRatings = (controller) =>
  controller.ratings.filter(
    (rating) => rating.type === "LICENCIA"
  ).length;

// CONTAR HABILITACIONES VIGENTES

export const countActiveRatings = (controller) =>
  controller.ratings.filter(
    (rating) =>
      rating.status === RATING_STATUS.ACTIVE
  ).length;