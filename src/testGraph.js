// ==========================================
// SG-ATC CALI
// PRUEBA DEL GRAFO
// ==========================================

import Graph from "./structures/Graph.js";

import {
  createController,
  createRating,
  RATING_STATUS,
} from "./constants/atc.js";

// ==========================================
// CREAR CONTROLADORES
// ==========================================

const jvr = createController({
  initials: "JVR",
  name: "Controlador JVR",
});

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

const abc = createController({
  initials: "ABC",
  name: "Controlador ABC",
});

abc.ratings = [
  createRating({ code: "AD" }),
  createRating({ code: "APP" }),
];

const def = createController({
  initials: "DEF",
  name: "Controlador DEF",
});

def.ratings = [
  createRating({ code: "AD" }),
  createRating({ code: "ACCS" }),
  createRating({ code: "SUP" }),
];

// ==========================================
// CONSTRUIR GRAFO
// ==========================================

const graph = new Graph();

graph.rebuild([jvr, abc, def]);

// ==========================================
// MOSTRAR NODOS Y CONEXIONES
// ==========================================

console.log("\n=== TOTAL DE NODOS ===");
console.log(graph.nodeCount());

console.log("\n=== TOTAL DE CONEXIONES ===");
console.log(graph.edgeCount());

// ==========================================
// HABILITACIONES DE JVR
// ==========================================

console.log("\n=== HABILITACIONES JVR ===");

console.table(
  graph.getControllerRatings("JVR").map(
    ({ code, type, status }) => ({
      code,
      type,
      status,
    })
  )
);

// ==========================================
// CONTROLADORES CON AD VIGENTE
// ==========================================

console.log("\n=== CONTROLADORES CON AD VIGENTE ===");

console.log(
  graph
    .getControllersByRating("AD")
    .map((controller) => controller.initials)
);

// ==========================================
// CONTROLADORES CON ACCS VIGENTE
// ==========================================

console.log("\n=== CONTROLADORES CON ACCS VIGENTE ===");

console.log(
  graph
    .getControllersByRating("ACCS")
    .map((controller) => controller.initials)
);

// ==========================================
// CAMBIAR ESTADO ACCS DE JVR
// ==========================================

console.log("\n=== ACTUALIZAR ACCS DE JVR ===");

graph.updateEdge(
  "JVR",
  "ACCS",
  RATING_STATUS.ACTIVE
);

console.log(
  graph
    .getControllersByRating("ACCS")
    .map((controller) => controller.initials)
);

// ==========================================
// ELIMINAR CONTROLADOR ABC
// ==========================================

console.log("\n=== ELIMINAR ABC ===");

graph.removeController("ABC");

console.log(
  "Nodos restantes:",
  graph.nodeCount()
);

console.log(
  "Conexiones restantes:",
  graph.edgeCount()
);

// ==========================================
// DATOS PARA VISUALIZACIÓN
// ==========================================

console.log("\n=== VISUALIZACIÓN ===");

const visualization = graph.toVisualization();

console.log(
  "Nodos:",
  visualization.nodes.length
);

console.log(
  "Conexiones:",
  visualization.edges.length
);