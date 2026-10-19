// ==========================================
// SG-ATC CALI
// PRUEBA DE INTEGRACIÓN ATC MANAGER
// ==========================================

import ATCManager from "./services/ATCManager.js";

const manager = new ATCManager();

// ==========================================
// REGISTRAR CONTROLADORES
// ==========================================

manager.addController({
  initials: "JVR",
  name: "Controlador JVR",
});

manager.addController({
  initials: "ABC",
  name: "Controlador ABC",
});

manager.addController({
  initials: "DEF",
  name: "Controlador DEF",
});

// ==========================================
// REGISTRAR HABILITACIONES
// ==========================================

manager.addRating("JVR", "AD");
manager.addRating("JVR", "APP");
manager.addRating("JVR", "ACCS");
manager.addRating("JVR", "SUP");

manager.addRating("ABC", "AD");
manager.addRating("ABC", "APP");

manager.addRating("DEF", "AD");
manager.addRating("DEF", "ACC");
manager.addRating("DEF", "APPS");

// ==========================================
// CONSULTAR CONTROLADORES
// ==========================================

console.log("\n=== CONTROLADORES ===");

console.table(
  manager.getControllers().map((controller) => ({
    initials: controller.initials,
    name: controller.name,
    ratings: controller.ratings.length,
  }))
);

// ==========================================
// BUSCAR CON TRIE
// ==========================================

console.log("\n=== BUSCAR JV ===");

console.log(
  manager
    .searchControllers("JV")
    .map((controller) => controller.initials)
);

// ==========================================
// FILTRAR POR HABILITACIÓN
// ==========================================

console.log("\n=== CONTROLADORES CON AD VIGENTE ===");

console.log(
  manager
    .searchByRating("AD")
    .map((controller) => controller.initials)
);

// ==========================================
// CLASIFICACIÓN TOP K
// ==========================================

console.log("\n=== TOP 2 HABILITACIONES VIGENTES ===");

console.table(
  manager.getTopControllers(2).map((controller) => ({
    initials: controller.initials,
    vigentes: controller.ratings.filter(
      (rating) => rating.status === "VIGENTE"
    ).length,
  }))
);

// ==========================================
// CAMBIAR ESTADO DE HABILITACIÓN
// ==========================================

console.log("\n=== CAMBIAR ACCS DE JVR ===");

manager.updateRating("JVR", "ACCS", "NO_VIGENTE");

console.log(
  manager.getController("JVR").ratings.find(
    (rating) => rating.code === "ACCS"
  )
);

// ==========================================
// CERTIFICACIÓN DE INGLÉS
// ==========================================

console.log("\n=== INGLÉS OACI JVR ===");

console.log(
  manager.updateEnglish(
    "JVR",
    4,
    "2028-10-15"
  )
);

// ==========================================
// CURSO RECURRENTE
// ==========================================

console.log("\n=== CURSO RECURRENTE JVR ===");

console.log(
  manager.updateRecurrentCourse(
    "JVR",
    "2026-01-15",
    "2030-01-15"
  )
);

// ==========================================
// COLA DE SOLICITUDES
// ==========================================

manager.addRequest({
  initials: "ABC",
  type: "INGLES",
  description: "Actualizar certificación OACI",
});

manager.addRequest({
  initials: "DEF",
  type: "HABILITACION",
  description: "Actualizar habilitación APPS",
});

console.log("\n=== SOLICITUDES PENDIENTES ===");

console.log(
  manager.getPendingRequests().map(
    (request) => request.initials
  )
);

console.log("\n=== ATENDER PRIMERA SOLICITUD ===");

console.log(manager.attendNextRequest().initials);

// ==========================================
// ESTADÍSTICAS
// ==========================================

console.log("\n=== ESTADÍSTICAS ===");

console.log(manager.getStatistics());

// ==========================================
// GRAFO
// ==========================================

console.log("\n=== GRAFO ===");

const graph = manager.getGraphData();

console.log("Nodos:", graph.nodes.length);
console.log("Conexiones:", graph.edges.length);

// ==========================================
// ELIMINAR CONTROLADOR
// ==========================================

console.log("\n=== ELIMINAR ABC ===");

manager.removeController("ABC");

console.log(
  manager.getControllers().map(
    (controller) => controller.initials
  )
);

console.log("\n=== BUSCAR ABC DESPUÉS DE ELIMINAR ===");

console.log(manager.searchControllers("ABC"));