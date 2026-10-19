import ATCManager from "./services/ATCManager.js";

const manager = new ATCManager();

manager.addController({
  initials: "JVR",
  name: "Jorge Luis Velásquez Reina",
});

console.log("\n=== PRUEBA NIVEL OACI 4 ===");

console.log(
  manager.updateEnglish("JVR", 4, "2026-10-15")
);

console.log(manager.getEnglishStatus("JVR"));

console.log("\n=== PRUEBA NIVEL OACI 5 ===");

console.log(
  manager.updateEnglish("JVR", 5, "2026-10-15")
);

console.log(manager.getEnglishStatus("JVR"));

console.log("\n=== PRUEBA NIVEL OACI 6 ===");

console.log(
  manager.updateEnglish("JVR", 6, "2026-10-15")
);

console.log(manager.getEnglishStatus("JVR"));

console.log("\n=== PRUEBA NIVEL INSUFICIENTE ===");

console.log(
  manager.updateEnglish("JVR", 3, "2026-10-15")
);

console.log(manager.getEnglishStatus("JVR"));

console.log("\n=== PRUEBA CERTIFICACIÓN VENCIDA ===");

console.log(
  manager.updateEnglish("JVR", 4, "2020-01-01")
);

console.log(manager.getEnglishStatus("JVR"));