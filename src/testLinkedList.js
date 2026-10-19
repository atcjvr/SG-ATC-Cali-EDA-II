import LinkedList from "./structures/LinkedList.js";

import {
  createController,
  createRating,
  countLicenseRatings,
  countActiveRatings,
  RATING_STATUS,
} from "./constants/atc.js";

// ==========================================
// CREAR LISTA ENLAZADA
// ==========================================

const controllers = new LinkedList();

// ==========================================
// REGISTRAR CONTROLADORES
// ==========================================

const jvr = createController({
  initials: "JVR",
  name: "Controlador de prueba JVR",
});

const abc = createController({
  initials: "ABC",
  name: "Controlador de prueba ABC",
});

const def = createController({
  initials: "DEF",
  name: "Controlador de prueba DEF",
});

// ==========================================
// ASIGNAR HABILITACIONES A JVR
// ==========================================

jvr.ratings = [
  createRating({ code: "AD" }),
  createRating({ code: "APP" }),
  createRating({ code: "ACC" }),
  createRating({ code: "APPS" }),
  createRating({
    code: "ACCS",
    status: RATING_STATUS.INACTIVE,
  }),
  createRating({ code: "SUP" }),
];

// ==========================================
// INSERTAR EN LA LISTA
// ==========================================

controllers.append(jvr);
controllers.append(abc);
controllers.append(def);

console.log("\n=== CONTROLADORES REGISTRADOS ===");

console.log(
  controllers.toArray().map((atc) => ({
    initials: atc.initials,
    name: atc.name,
  }))
);

// ==========================================
// BUSCAR CONTROLADOR
// ==========================================

console.log("\n=== BUSCAR JVR ===");

console.log(
  controllers.findByInitials("JVR")?.name
);

// ==========================================
// CONTAR HABILITACIONES
// ==========================================

console.log("\n=== HABILITACIONES JVR ===");

console.log(
  "Adiciones de licencia:",
  countLicenseRatings(jvr)
);

console.log(
  "Habilitaciones vigentes:",
  countActiveRatings(jvr)
);

// ==========================================
// ACTUALIZAR CONTROLADOR
// ==========================================

controllers.update("ABC", {
  name: "Controlador ABC actualizado",
});

console.log("\n=== ACTUALIZAR ABC ===");

console.log(
  controllers.findByInitials("ABC")?.name
);

// ==========================================
// ELIMINAR CONTROLADOR
// ==========================================

controllers.remove("DEF");

console.log("\n=== ELIMINAR DEF ===");

console.log(
  controllers.toArray().map(
    (atc) => atc.initials
  )
);

// ==========================================
// TOTAL
// ==========================================

console.log("\n=== TOTAL CONTROLADORES ===");

console.log(controllers.size());