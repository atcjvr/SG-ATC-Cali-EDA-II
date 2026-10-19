import ATCManager from "./services/ATCManager.js";

const manager = new ATCManager();

console.log("\n=== PRUEBAS NUEVOS MÓDULOS ===\n");

// Registrar controlador.
manager.addController({
  initials: "JVR",
  name: "Jorge Luis Velásquez Reina",
});

// Registrar dos adiciones.
manager.addRating("JVR", "AD", "VIGENTE");
manager.addRating("JVR", "APP", "VIGENTE");

// Inglés OACI.
manager.updateEnglish("JVR", 4, "2026-10-15");

// CERMED.
manager.updateMedicalCertificate(
  "JVR",
  "2026-10-15"
);

// Estado inicial.
console.log(
  "1. Sin recurrentes:",
  manager.getOperationalStatus("JVR").status
);

// Recurrente AD vigente.
manager.addRecurrentCourse(
  "JVR",
  "AD",
  "2026-10-15"
);

// Recurrente APP vencido.
manager.addRecurrentCourse(
  "JVR",
  "APP",
  "2020-05-10"
);

console.log(
  "2. Estado recurrente AD:",
  manager.getRecurrentCourseStatus("JVR", "AD")
);

console.log(
  "3. Estado recurrente APP:",
  manager.getRecurrentCourseStatus("JVR", "APP")
);

console.log(
  "4. Condición con AD vigente:",
  manager.getOperationalStatus("JVR").status
);

// Otras capacitaciones.
manager.addTraining(
  "JVR",
  "Sistema de Gestión de Seguridad Operacional SMS",
  "2026-09-10",
  "Curso de actualización"
);

manager.addTraining(
  "JVR",
  "Investigación de Accidentes e Incidentes",
  "2025-06-20",
  "Capacitación presencial"
);

console.log(
  "5. Otras capacitaciones:",
  manager.getTrainings("JVR")
);

// Cambiar AD a NO_VIGENTE.
manager.updateRating(
  "JVR",
  "AD",
  "NO_VIGENTE"
);

console.log(
  "6. Sin adición elegible:",
  manager.getOperationalStatus("JVR").status
);

// Consultar ficha completa.
console.log(
  "7. Ficha integral:",
  manager.getControllerSummary("JVR")
);

console.log("\n=== FIN DE PRUEBAS ===\n");