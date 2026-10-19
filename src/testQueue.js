import Queue from "./structures/Queue.js";

// ==========================================
// CREAR COLA
// ==========================================

const requests = new Queue();

// ==========================================
// REGISTRAR SOLICITUDES
// ==========================================

requests.enqueue({
  initials: "JVR",
  type: "INGLES",
  description: "Actualizar certificado OACI nivel 4",
});

requests.enqueue({
  initials: "ABC",
  type: "CURSO_RECURRENTE",
  description: "Registrar nuevo curso recurrente",
});

requests.enqueue({
  initials: "DEF",
  type: "HABILITACION",
  description: "Actualizar estado de ACCS",
});

// ==========================================
// MOSTRAR COLA
// ==========================================

console.log("\n=== SOLICITUDES PENDIENTES ===");

console.table(
  requests.toArray().map((request) => ({
    initials: request.initials,
    type: request.type,
    status: request.status,
  }))
);

// ==========================================
// CONSULTAR PRIMERA SOLICITUD
// ==========================================

console.log("\n=== PRIMERA SOLICITUD ===");

console.log(requests.peek().initials);

// ==========================================
// ATENDER SOLICITUD
// ==========================================

console.log("\n=== ATENDER SOLICITUD ===");

const attended = requests.dequeue();

console.log({
  initials: attended.initials,
  type: attended.type,
  status: attended.status,
});

// ==========================================
// MOSTRAR COLA RESTANTE
// ==========================================

console.log("\n=== COLA RESTANTE ===");

console.log(
  requests.toArray().map(
    (request) => request.initials
  )
);

// ==========================================
// TOTAL PENDIENTES
// ==========================================

console.log("\n=== TOTAL PENDIENTES ===");

console.log(requests.size());

// ==========================================
// ATENDER TODAS LAS SOLICITUDES
// ==========================================

console.log("\n=== ATENDER RESTANTES ===");

while (!requests.isEmpty()) {
  const request = requests.dequeue();

  console.log(
    `${request.initials} - ${request.status}`
  );
}

// ==========================================
// VERIFICAR COLA VACÍA
// ==========================================

console.log("\n=== COLA VACÍA ===");

console.log(requests.isEmpty());