// ==========================================
// SG-ATC CALI
// GRAFO DE CONTROLADORES Y HABILITACIONES
// Estructura de Datos y Algoritmos II
// ==========================================

import {
  ALL_RATINGS,
  RATING_STATUS,
} from "../constants/atc.js";

class Graph {
  constructor() {
    this.nodes = new Map();
    this.adjList = new Map();
  }

  // ========================================
  // AGREGAR NODO
  // ========================================

  addNode(id, data) {
    if (!id) {
      throw new Error("El nodo debe tener un ID.");
    }

    if (!this.nodes.has(id)) {
      this.nodes.set(id, data);
      this.adjList.set(id, new Map());
    }

    return this.nodes.get(id);
  }

  // ========================================
  // AGREGAR CONTROLADOR
  // ========================================

  addController(controller) {
    if (!controller?.initials) {
      throw new Error(
        "El controlador debe tener siglas."
      );
    }

    const id = `ATC:${controller.initials}`;

    this.addNode(id, {
      id,
      type: "CONTROLLER",
      initials: controller.initials,
      name: controller.name,
    });

    return id;
  }

  // ========================================
  // AGREGAR HABILITACIÓN
  // ========================================

  addRating(code) {
    const rating = ALL_RATINGS.find(
      (item) => item.code === code
    );

    if (!rating) {
      throw new Error(
        `La habilitación ${code} no existe.`
      );
    }

    const id = `RATING:${code}`;

    this.addNode(id, {
      id,
      type: "RATING",
      code: rating.code,
      name: rating.name,
      ratingType: rating.type,
    });

    return id;
  }

  // ========================================
  // CONECTAR CONTROLADOR Y HABILITACIÓN
  // ========================================

  addEdge(initials, code, status) {
    const controllerId = `ATC:${initials}`;
    const ratingId = `RATING:${code}`;

    if (
      !this.nodes.has(controllerId) ||
      !this.nodes.has(ratingId)
    ) {
      throw new Error(
        "El controlador o la habilitación no existe."
      );
    }

    if (!Object.values(RATING_STATUS).includes(status)) {
      throw new Error(
        "El estado de habilitación no es válido."
      );
    }

    const edge = {
      status,
    };

    // Grafo no dirigido
    this.adjList.get(controllerId).set(ratingId, edge);
    this.adjList.get(ratingId).set(controllerId, edge);
  }

  // ========================================
  // CONSULTAR HABILITACIONES DE UN ATC
  // ========================================

  getControllerRatings(initials) {
    const controllerId = `ATC:${initials}`;

    if (!this.adjList.has(controllerId)) {
      return [];
    }

    const results = [];

    for (const [ratingId, edge] of this.adjList.get(
      controllerId
    )) {
      const rating = this.nodes.get(ratingId);

      results.push({
        code: rating.code,
        name: rating.name,
        type: rating.ratingType,
        status: edge.status,
      });
    }

    return results;
  }

  // ========================================
  // CONSULTAR CONTROLADORES POR HABILITACIÓN
  // ========================================

  getControllersByRating(
    code,
    status = RATING_STATUS.ACTIVE
  ) {
    const ratingId = `RATING:${code}`;

    if (!this.adjList.has(ratingId)) {
      return [];
    }

    const results = [];

    for (const [controllerId, edge] of this.adjList.get(
      ratingId
    )) {
      if (edge.status !== status) {
        continue;
      }

      const controller = this.nodes.get(controllerId);

      results.push({
        initials: controller.initials,
        name: controller.name,
        status: edge.status,
      });
    }

    return results.sort((a, b) =>
      a.initials.localeCompare(b.initials)
    );
  }

  // ========================================
  // ACTUALIZAR ESTADO DE HABILITACIÓN
  // ========================================

  updateEdge(initials, code, status) {
    const controllerId = `ATC:${initials}`;
    const ratingId = `RATING:${code}`;

    if (!Object.values(RATING_STATUS).includes(status)) {
      throw new Error("Estado no válido.");
    }

    const edge = this.adjList
      .get(controllerId)
      ?.get(ratingId);

    if (!edge) {
      return false;
    }

    edge.status = status;

    return true;
  }

  // ========================================
  // ELIMINAR CONTROLADOR
  // ========================================

  removeController(initials) {
    const controllerId = `ATC:${initials}`;

    if (!this.nodes.has(controllerId)) {
      return false;
    }

    for (const neighborId of this.adjList.get(
      controllerId
    ).keys()) {
      this.adjList.get(neighborId).delete(controllerId);
    }

    this.adjList.delete(controllerId);
    this.nodes.delete(controllerId);

    return true;
  }

  // ========================================
  // OBTENER NODOS Y CONEXIONES PARA REACT FLOW
  // ========================================

  toVisualization() {
    const nodes = [...this.nodes.values()];

    const edges = [];

    for (const [source, neighbors] of this.adjList) {
      if (!source.startsWith("ATC:")) {
        continue;
      }

      for (const [target, edge] of neighbors) {
        edges.push({
          id: `${source}-${target}`,
          source,
          target,
          status: edge.status,
        });
      }
    }

    return { nodes, edges };
  }

  // ========================================
  // RECONSTRUIR GRAFO DESDE CONTROLADORES
  // ========================================

  rebuild(controllers) {
    this.nodes.clear();
    this.adjList.clear();

    // Registrar todas las habilitaciones
    for (const rating of ALL_RATINGS) {
      this.addRating(rating.code);
    }

    // Registrar controladores y conexiones
    for (const controller of controllers) {
      this.addController(controller);

      for (const rating of controller.ratings) {
        this.addEdge(
          controller.initials,
          rating.code,
          rating.status
        );
      }
    }
  }

  // ========================================
  // TOTAL DE NODOS
  // ========================================

  nodeCount() {
    return this.nodes.size;
  }

  // ========================================
  // TOTAL DE CONEXIONES
  // ========================================

  edgeCount() {
    let count = 0;

    for (const neighbors of this.adjList.values()) {
      count += neighbors.size;
    }

    // Cada conexión se almacena dos veces
    return count / 2;
  }
}

export default Graph;