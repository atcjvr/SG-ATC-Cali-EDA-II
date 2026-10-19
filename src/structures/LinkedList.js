// ==========================================
// SG-ATC CALI
// LISTA ENLAZADA DE CONTROLADORES
// Estructura de Datos y Algoritmos II
// ==========================================

// NODO DE LA LISTA
class Node {
  constructor(data) {
    this.data = data;
    this.next = null;
  }
}

// LISTA ENLAZADA
class LinkedList {
  constructor() {
    this.head = null;
    this.length = 0;
  }

  // ========================================
  // AGREGAR CONTROLADOR
  // ========================================

  append(controller) {
    if (!controller?.initials) {
      throw new Error(
        "El controlador debe tener siglas."
      );
    }

    const initials = controller.initials
      .trim()
      .toUpperCase();

    // Evitar controladores duplicados
    if (this.findByInitials(initials)) {
      throw new Error(
        `El controlador ${initials} ya existe.`
      );
    }

    const newNode = new Node({
      ...controller,
      initials,
    });

    if (!this.head) {
      this.head = newNode;
    } else {
      let current = this.head;

      while (current.next) {
        current = current.next;
      }

      current.next = newNode;
    }

    this.length++;

    return newNode.data;
  }

  // ========================================
  // BUSCAR POR SIGLAS
  // ========================================

  findByInitials(initials) {
    const search = initials.trim().toUpperCase();

    let current = this.head;

    while (current) {
      if (current.data.initials === search) {
        return current.data;
      }

      current = current.next;
    }

    return null;
  }

  // ========================================
  // ACTUALIZAR CONTROLADOR
  // ========================================

  update(initials, changes) {
    const controller = this.findByInitials(initials);

    if (!controller) {
      return null;
    }

    // Las siglas y el ID no se modifican aquí
    const {
      initials: ignoredInitials,
      id: ignoredId,
      ...allowedChanges
    } = changes;

    Object.assign(controller, allowedChanges);

    return controller;
  }

  // ========================================
  // ELIMINAR CONTROLADOR
  // ========================================

  remove(initials) {
    const search = initials.trim().toUpperCase();

    if (!this.head) {
      return null;
    }

    // Eliminar el primer nodo
    if (this.head.data.initials === search) {
      const removed = this.head.data;

      this.head = this.head.next;
      this.length--;

      return removed;
    }

    let current = this.head;

    while (current.next) {
      if (current.next.data.initials === search) {
        const removed = current.next.data;

        current.next = current.next.next;
        this.length--;

        return removed;
      }

      current = current.next;
    }

    return null;
  }

  // ========================================
  // OBTENER TODOS LOS CONTROLADORES
  // ========================================

  toArray() {
    const controllers = [];

    let current = this.head;

    while (current) {
      controllers.push(current.data);
      current = current.next;
    }

    return controllers;
  }

  // ========================================
  // FILTRAR CONTROLADORES
  // ========================================

  filter(callback) {
    const results = [];

    let current = this.head;

    while (current) {
      if (callback(current.data)) {
        results.push(current.data);
      }

      current = current.next;
    }

    return results;
  }

  // ========================================
  // CANTIDAD DE CONTROLADORES
  // ========================================

  size() {
    return this.length;
  }

  // ========================================
  // VERIFICAR SI ESTÁ VACÍA
  // ========================================

  isEmpty() {
    return this.length === 0;
  }

  // ========================================
  // LIMPIAR LISTA
  // ========================================

  clear() {
    this.head = null;
    this.length = 0;
  }
}

export default LinkedList;