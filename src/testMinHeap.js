// ==========================================
// SG-ATC CALI
// PRUEBA MIN HEAP
// ==========================================

import MinHeap from "./structures/MinHeap.js";

import {
  createController,
  createRating,
  countActiveRatings,
  countLicenseRatings,
  RATING_STATUS,
} from "./constants/atc.js";

// ==========================================
// CREAR CONTROLADORES DE PRUEBA
// ==========================================

function buildController(initials, name, ratings) {
  const controller = createController({
    initials,
    name,
  });

  controller.ratings = ratings.map(
    ({ code, status }) =>
      createRating({
        code,
        status: status ?? RATING_STATUS.ACTIVE,
      })
  );

  return controller;
}

const controllers = [
  buildController("JVR", "Controlador JVR", [
    { code: "AD" },
    { code: "APP" },
    { code: "ACC" },
    { code: "APPS" },
    {
      code: "ACCS",
      status: RATING_STATUS.INACTIVE,
    },
    { code: "SUP" },
  ]),

  buildController("ABC", "Controlador ABC", [
    { code: "AD" },
    { code: "APP" },
    { code: "ACC" },
  ]),

  buildController("DEF", "Controlador DEF", [
    { code: "AD" },
    { code: "APP" },
    { code: "ACC" },
    { code: "APPS" },
    {
      code: "ACCS",
      status: RATING_STATUS.INACTIVE,
    },
  ]),

  buildController("GHI", "Controlador GHI", [
    { code: "AD" },
    { code: "APP" },
  ]),

  buildController("MNO", "Controlador MNO", [
    { code: "AD" },
    { code: "APP" },
    { code: "ACC" },
    { code: "ACCS" },
  ]),
];

// ==========================================
// MOSTRAR CONTROLADORES
// ==========================================

console.log("\n=== CONTROLADORES REGISTRADOS ===");

console.table(
  controllers.map((controller) => ({
    initials: controller.initials,
    adiciones: countLicenseRatings(controller),
    vigentes: countActiveRatings(controller),
  }))
);

// ==========================================
// OBTENER TOP 3
// ==========================================

console.log("\n=== TOP 3 HABILITACIONES VIGENTES ===");

const top3 = MinHeap.topK(controllers, 3);

console.table(
  top3.map((controller, index) => ({
    posicion: index + 1,
    initials: controller.initials,
    vigentes: countActiveRatings(controller),
  }))
);

// ==========================================
// COMPROBAR TOP K MAYOR AL TOTAL
// ==========================================

console.log("\n=== TOP 10 (SOLO EXISTEN 5) ===");

console.log(
  MinHeap.topK(controllers, 10).map(
    (controller) => controller.initials
  )
);

// ==========================================
// COMPROBAR TOP K INVÁLIDO
// ==========================================

console.log("\n=== TOP K INVÁLIDO ===");

console.log(MinHeap.topK(controllers, 0));

// ==========================================
// CAMBIAR ESTADO DE HABILITACIÓN
// ==========================================

console.log("\n=== ACTUALIZAR HABILITACIÓN JVR ===");

// Simular pérdida de habilitación SUP
const jvr = controllers.find(
  (controller) => controller.initials === "JVR"
);

const sup = jvr.ratings.find(
  (rating) => rating.code === "SUP"
);

sup.status = RATING_STATUS.INACTIVE;

console.log(
  "Habilitaciones vigentes JVR:",
  countActiveRatings(jvr)
);

console.log("\n=== NUEVO TOP 3 ===");

console.table(
  MinHeap.topK(controllers, 3).map(
    (controller, index) => ({
      posicion: index + 1,
      initials: controller.initials,
      vigentes: countActiveRatings(controller),
    })
  )
);