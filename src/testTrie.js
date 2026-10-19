import Trie from "./structures/Trie.js";
import { createController } from "./constants/atc.js";

const trie = new Trie();

const controllers = [
  createController({
    initials: "JVR",
    name: "Jorge Velasquez",
  }),
  createController({
    initials: "ABC",
    name: "Andres Benitez",
  }),
  createController({
    initials: "DEF",
    name: "Daniel Fernandez",
  }),
  createController({
    initials: "JPM",
    name: "Juan Pablo Martinez",
  }),
  createController({
    initials: "JCR",
    name: "Juan Carlos Ramirez",
  }),
];

controllers.forEach((controller) => {
  trie.insert(controller);
});

console.log("\n=== CONTROLADORES REGISTRADOS ===");

console.table(
  controllers.map(({ initials, name }) => ({
    initials,
    name,
  }))
);

console.log("\n=== BUSCAR POR SIGLAS: JV ===");

console.log(
  trie.searchPrefix("JV").map((atc) => atc.initials)
);

console.log("\n=== BUSCAR POR NOMBRE: JUAN ===");

console.log(
  trie.searchPrefix("Juan").map((atc) => ({
    initials: atc.initials,
    name: atc.name,
  }))
);

console.log("\n=== BÚSQUEDA EXACTA: ABC ===");

console.log(trie.searchExact("ABC")?.name);

console.log("\n=== PREFIJO INEXISTENTE ===");

console.log(trie.searchPrefix("XYZ"));

console.log("\n=== RECONSTRUIR ÍNDICE ===");

// Simular eliminación de un controlador
const updatedControllers = controllers.filter(
  (controller) => controller.initials !== "JVR"
);

trie.rebuild(updatedControllers);

console.log(
  "Buscar JV después de eliminar JVR:",
  trie.searchPrefix("JV")
);