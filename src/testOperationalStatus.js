import ATCManager from "./services/ATCManager.js";

const manager = new ATCManager();

// ========================================
// REGISTRAR CONTROLADOR
// ========================================

manager.addController({
  initials: "JVR",
  name: "Jorge Luis Velásquez Reina",
});

// Registrar habilitaciones
manager.addRating("JVR", "AD", "VIGENTE");
manager.addRating("JVR", "APP", "VIGENTE");
manager.addRating("JVR", "SUP", "VIGENTE");

// ========================================
// PRUEBA 1: SIN INGLÉS NI CERMED
// ========================================

console.log("\n=== PRUEBA 1: SIN CERTIFICACIONES ===");

console.log(manager.getOperationalStatus("JVR"));

// ========================================
// PRUEBA 2: INGLÉS Y CERMED VIGENTES
// ========================================

console.log("\n=== PRUEBA 2: ATC OPERATIVO ===");

manager.updateEnglish("JVR", 4, "2026-10-15");

manager.updateMedicalCertificate(
  "JVR",
  "2026-10-15"
);

console.log(manager.getOperationalStatus("JVR"));

// ========================================
// PRUEBA 3: INGLÉS VENCIDO
// ========================================

console.log("\n=== PRUEBA 3: INGLÉS VENCIDO ===");

manager.updateEnglish("JVR", 4, "2020-01-01");

console.log(manager.getOperationalStatus("JVR"));

// ========================================
// PRUEBA 4: CERMED VENCIDO
// ========================================

console.log("\n=== PRUEBA 4: CERMED VENCIDO ===");

manager.updateEnglish("JVR", 5, "2026-10-15");

manager.updateMedicalCertificate(
  "JVR",
  "2024-01-01"
);

console.log(manager.getOperationalStatus("JVR"));

// ========================================
// PRUEBA 5: AMBOS VENCIDOS
// ========================================

console.log("\n=== PRUEBA 5: AMBOS VENCIDOS ===");

manager.updateEnglish("JVR", 4, "2020-01-01");

console.log(manager.getOperationalStatus("JVR"));

// ========================================
// PRUEBA 6: SIN HABILITACIONES OPERATIVAS
// ========================================

console.log(
  "\n=== PRUEBA 6: SIN HABILITACIONES OPERATIVAS ==="
);

manager.updateEnglish("JVR", 6, "2026-10-15");

manager.updateMedicalCertificate(
  "JVR",
  "2026-10-15"
);

manager.updateRating("JVR", "AD", "NO_VIGENTE");
manager.updateRating("JVR", "APP", "NO_VIGENTE");

console.log(manager.getOperationalStatus("JVR"));

// ========================================
// PRUEBA 7: VERIFICAR QUE NO SE ALTERARON
// LAS HABILITACIONES
// ========================================

console.log(
  "\n=== PRUEBA 7: CONSERVACIÓN DE HABILITACIONES ==="
);

console.log(manager.getController("JVR").ratings);