// ==========================================
// SG-ATC CALI
// TRIE - BUSCADOR DE CONTROLADORES
// Estructura de Datos y Algoritmos II
// ==========================================

class TrieNode {
  constructor() {
    this.children = new Map();
    this.controllers = new Map();
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  // Normalizar texto para búsquedas
  normalize(text) {
    return String(text ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toUpperCase();
  }

  // Insertar una palabra asociada a un controlador
  insertWord(word, controller) {
    const normalized = this.normalize(word);

    if (!normalized) return;

    let node = this.root;

    for (const character of normalized) {
      if (!node.children.has(character)) {
        node.children.set(character, new TrieNode());
      }

      node = node.children.get(character);
    }

    node.controllers.set(controller.initials, controller);
  }

  // Registrar controlador por siglas y nombre
  insert(controller) {
    if (!controller?.initials || !controller?.name) {
      throw new Error(
        "El controlador debe tener siglas y nombre."
      );
    }

    this.insertWord(controller.initials, controller);
    this.insertWord(controller.name, controller);
  }

  // Buscar el nodo correspondiente a un prefijo
  findNode(prefix) {
    const normalized = this.normalize(prefix);

    let node = this.root;

    for (const character of normalized) {
      if (!node.children.has(character)) {
        return null;
      }

      node = node.children.get(character);
    }

    return node;
  }

  // Buscar controladores por prefijo
  searchPrefix(prefix) {
    const normalized = this.normalize(prefix);

    if (!normalized) return [];

    const startNode = this.findNode(normalized);

    if (!startNode) return [];

    const results = new Map();

    const traverse = (node) => {
      for (const [initials, controller] of node.controllers) {
        results.set(initials, controller);
      }

      for (const child of node.children.values()) {
        traverse(child);
      }
    };

    traverse(startNode);

    return [...results.values()].sort((a, b) =>
      a.initials.localeCompare(b.initials)
    );
  }

  // Buscar controlador por siglas exactas
  searchExact(initials) {
    const normalized = this.normalize(initials);
    const node = this.findNode(normalized);

    if (!node) return null;

    return node.controllers.get(normalized) ?? null;
  }

  // Reconstruir el índice cuando cambian los datos
  rebuild(controllers) {
    this.root = new TrieNode();

    for (const controller of controllers) {
      this.insert(controller);
    }
  }

  // Limpiar el Trie
  clear() {
    this.root = new TrieNode();
  }
}

export default Trie;