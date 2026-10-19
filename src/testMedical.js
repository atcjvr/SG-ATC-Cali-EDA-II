import ATCManager from "./services/ATCManager.js";

const manager = new ATCManager();

manager.addController({
  initials: "JVR",
  name: "Jorge Luis Velásquez Reina",
});

console.log("\n=== PRUEBA 1: CERMED SIN REGISTRAR ===");

console.log(
  manager.getMedicalCertificateStatus("JVR")
);

console.log("\n=== PRUEBA 2: CERMED VIGENTE ===");

console.log(
  manager.updateMedicalCertificate("JVR", "2026-10-15")
);

console.log(
  manager.getMedicalCertificateStatus("JVR")
);

console.log("\n=== PRUEBA 3: CERMED VENCIDO ===");

console.log(
  manager.updateMedicalCertificate("JVR", "2024-01-01")
);

console.log(
  manager.getMedicalCertificateStatus("JVR")
);

console.log("\n=== PRUEBA 4: RENOVACIÓN DEL CERMED ===");

console.log(
  manager.updateMedicalCertificate("JVR", "2026-10-17")
);

console.log(
  manager.getMedicalCertificateStatus("JVR")
);

console.log("\n=== PRUEBA 5: FECHA INVÁLIDA ===");

try {
  manager.updateMedicalCertificate("JVR", "2026-02-30");
} catch (error) {
  console.log("Error controlado:", error.message);
}

console.log("\n=== PRUEBA 6: CONSULTAR DATOS DEL ATC ===");

console.log(
  manager.getController("JVR").medicalCertificate
);