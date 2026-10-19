// ==========================================
// SG-ATC CALI
// COLA DE SOLICITUDES - FIFO
// Estructura de Datos y Algoritmos II
// ==========================================

class Queue {
  constructor() {
    this.items = [];
    this.frontIndex = 0;
  }
// ========================================
// AGREGAR SOLICITUD
// ========================================

enqueue(request) {
  if (!request || typeof request !== "object") {
    throw new Error("La solicitud no es válida.");
  }

  if (!request.initials || !request.type) {
    throw new Error(
      "La solicitud debe incluir siglas y tipo."
    );
  }

  const newRequest = {
    // Conservar el ID generado por PostgreSQL.
    id: request.id ?? crypto.randomUUID(),

    initials: request.initials.trim().toUpperCase(),

    type: request.type,

    description: request.description || "",

    // Conservar la fecha original de llegada.
    createdAt: request.createdAt ?? new Date().toISOString(),

    status: request.status ?? "PENDIENTE",
  };

  this.items.push(newRequest);

  return newRequest;
}

  // ========================================
  // ATENDER PRIMERA SOLICITUD
  // ========================================

  dequeue() {
    if (this.isEmpty()) {
      return null;
    }

    const request = this.items[this.frontIndex];

    this.frontIndex++;

    // Compactar el arreglo cuando sea necesario
    if (
      this.frontIndex > 50 &&
      this.frontIndex * 2 >= this.items.length
    ) {
      this.items = this.items.slice(this.frontIndex);
      this.frontIndex = 0;
    }

    return {
      ...request,
      status: "ATENDIDA",
      attendedAt: new Date().toISOString(),
    };
  }

  // ========================================
  // CONSULTAR PRIMERA SOLICITUD
  // ========================================

  peek() {
    if (this.isEmpty()) {
      return null;
    }

    return this.items[this.frontIndex];
  }

  // ========================================
  // OBTENER SOLICITUDES PENDIENTES
  // ========================================

  toArray() {
    return this.items.slice(this.frontIndex);
  }

  // ========================================
  // CANTIDAD DE SOLICITUDES
  // ========================================

  size() {
    return this.items.length - this.frontIndex;
  }

  // ========================================
  // VERIFICAR SI ESTÁ VACÍA
  // ========================================

  isEmpty() {
    return this.size() === 0;
  }

  // ========================================
  // LIMPIAR COLA
  // ========================================

  clear() {
    this.items = [];
    this.frontIndex = 0;
  }
}

export default Queue;