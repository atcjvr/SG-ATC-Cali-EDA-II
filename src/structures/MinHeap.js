// ==========================================
// SG-ATC CALI
// MIN HEAP - CLASIFICACIÓN DE CONTROLADORES
// Estructura de Datos y Algoritmos II
// ==========================================

import {
  countActiveRatings,
} from "../constants/atc.js";

class MinHeap {
  constructor() {
    this.heap = [];
  }

  // ========================================
  // COMPARAR CONTROLADORES
  // ========================================

  compare(a, b) {
    const scoreA = countActiveRatings(a);
    const scoreB = countActiveRatings(b);

    if (scoreA !== scoreB) {
      return scoreA - scoreB;
    }

    // En caso de empate, prioridad al orden
    // alfabético de las siglas.
    return b.initials.localeCompare(a.initials);
  }

  // ========================================
  // INTERCAMBIAR ELEMENTOS
  // ========================================

  swap(i, j) {
    [this.heap[i], this.heap[j]] = [
      this.heap[j],
      this.heap[i],
    ];
  }

  // ========================================
  // INSERTAR CONTROLADOR
  // ========================================

  insert(controller) {
    if (!controller?.initials) {
      throw new Error(
        "El controlador debe tener siglas."
      );
    }

    this.heap.push(controller);

    this.heapifyUp(this.heap.length - 1);
  }

  // ========================================
  // REORGANIZAR HACIA ARRIBA
  // ========================================

  heapifyUp(index) {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);

      if (
        this.compare(
          this.heap[index],
          this.heap[parent]
        ) >= 0
      ) {
        break;
      }

      this.swap(index, parent);
      index = parent;
    }
  }

  // ========================================
  // REORGANIZAR HACIA ABAJO
  // ========================================

  heapifyDown(index) {
    const length = this.heap.length;

    while (true) {
      let smallest = index;

      const left = 2 * index + 1;
      const right = 2 * index + 2;

      if (
        left < length &&
        this.compare(
          this.heap[left],
          this.heap[smallest]
        ) < 0
      ) {
        smallest = left;
      }

      if (
        right < length &&
        this.compare(
          this.heap[right],
          this.heap[smallest]
        ) < 0
      ) {
        smallest = right;
      }

      if (smallest === index) {
        break;
      }

      this.swap(index, smallest);
      index = smallest;
    }
  }

  // ========================================
  // CONSULTAR ELEMENTO MÍNIMO
  // ========================================

  peek() {
    return this.heap[0] ?? null;
  }

  // ========================================
  // EXTRAER ELEMENTO MÍNIMO
  // ========================================

  extractMin() {
    if (this.isEmpty()) {
      return null;
    }

    if (this.heap.length === 1) {
      return this.heap.pop();
    }

    const min = this.heap[0];

    this.heap[0] = this.heap.pop();

    this.heapifyDown(0);

    return min;
  }

  // ========================================
  // OBTENER TOP K
  // ========================================

  static topK(controllers, k) {
    if (!Number.isInteger(k) || k <= 0) {
      return [];
    }

    const heap = new MinHeap();

    for (const controller of controllers) {
      if (heap.size() < k) {
        heap.insert(controller);
      } else if (
        heap.compare(controller, heap.peek()) > 0
      ) {
        heap.extractMin();
        heap.insert(controller);
      }
    }

    // El resultado final se muestra de mayor
    // a menor cantidad de habilitaciones.
    return heap.heap.sort(
      (a, b) => heap.compare(b, a)
    );
  }

  // ========================================
  // CANTIDAD DE ELEMENTOS
  // ========================================

  size() {
    return this.heap.length;
  }

  // ========================================
  // VERIFICAR SI ESTÁ VACÍO
  // ========================================

  isEmpty() {
    return this.heap.length === 0;
  }

  // ========================================
  // LIMPIAR HEAP
  // ========================================

  clear() {
    this.heap = [];
  }
}

export default MinHeap;