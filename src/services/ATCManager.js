// ==========================================
// SG-ATC CALI
// ADMINISTRADOR CENTRAL DE CONTROLADORES
// Estructura de Datos y Algoritmos II
// ==========================================

import LinkedList from "../structures/LinkedList.js";
import Queue from "../structures/Queue.js";
import Trie from "../structures/Trie.js";
import MinHeap from "../structures/MinHeap.js";
import Graph from "../structures/Graph.js";

import {
  createController,
  createRating,
  ALL_RATINGS,
  RATING_STATUS,
  countLicenseRatings,
  countActiveRatings,
} from "../constants/atc.js";

class ATCManager {
  constructor() {
    this.controllers = new LinkedList();
    this.requests = new Queue();
    this.trie = new Trie();
    this.graph = new Graph();

    this.syncStructures();
  }

  // ========================================
  // SINCRONIZAR ESTRUCTURAS
  // ========================================

  syncStructures() {
    const controllers = this.controllers.toArray();

    this.trie.rebuild(controllers);
    this.graph.rebuild(controllers);
  }

  // ========================================
  // REGISTRAR CONTROLADOR
  // ========================================

  addController({ initials, name }) {
    if (!initials?.trim() || !name?.trim()) {
      throw new Error(
        "Debe ingresar las siglas y el nombre del controlador."
      );
    }

    const normalizedInitials = initials.trim().toUpperCase();

    if (!/^[A-Z]{3}$/.test(normalizedInitials)) {
      throw new Error(
        "Las siglas del controlador deben contener exactamente tres letras."
      );
    }

    const controller = createController({
      initials: normalizedInitials,
      name,
    });

    this.controllers.append(controller);
    this.syncStructures();

    return controller;
  }

  // ========================================
  // CONSULTAR CONTROLADORES
  // ========================================

  getControllers() {
    return this.controllers.toArray();
  }

  getController(initials) {
    if (!initials) return null;

    return this.controllers.findByInitials(initials);
  }

  // ========================================
  // MODIFICAR NOMBRE DEL CONTROLADOR
  // ========================================

  updateController(initials, changes) {
    const controller = this.getController(initials);

    if (!controller) {
      throw new Error("El controlador no existe.");
    }

    if (
      changes.name !== undefined &&
      !String(changes.name).trim()
    ) {
      throw new Error("El nombre no puede estar vacío.");
    }

    const updated = this.controllers.update(initials, {
      name:
        changes.name !== undefined
          ? String(changes.name).trim()
          : controller.name,
    });

    this.syncStructures();

    return updated;
  }

  // ========================================
  // ELIMINAR CONTROLADOR
  // ========================================

  removeController(initials) {
    const removed = this.controllers.remove(initials);

    if (!removed) {
      throw new Error("El controlador no existe.");
    }

    this.syncStructures();

    return removed;
  }

  // ========================================
  // REGISTRAR ADICIÓN O HABILITACIÓN
  // ========================================

  addRating(initials, code, status = RATING_STATUS.ACTIVE) {
    const controller = this.getController(initials);

    if (!controller) {
      throw new Error("El controlador no existe.");
    }

    const normalizedCode = String(code).trim().toUpperCase();

    if (!ALL_RATINGS.some((rating) => rating.code === normalizedCode)) {
      throw new Error("La habilitación seleccionada no existe.");
    }

    if (
      !Object.values(RATING_STATUS).includes(status)
    ) {
      throw new Error("El estado de habilitación no es válido.");
    }

    if (
      controller.ratings.some(
        (rating) => rating.code === normalizedCode
      )
    ) {
      throw new Error(
        `El controlador ya tiene registrada la habilitación ${normalizedCode}.`
      );
    }

    const rating = createRating({
      code: normalizedCode,
      status,
    });

    controller.ratings.push(rating);

    this.syncStructures();

    return rating;
  }

  // ========================================
  // ACTUALIZAR ESTADO DE HABILITACIÓN
  // ========================================

  updateRating(initials, code, status) {
    const controller = this.getController(initials);

    if (!controller) {
      throw new Error("El controlador no existe.");
    }

    if (!Object.values(RATING_STATUS).includes(status)) {
      throw new Error("Estado de habilitación no válido.");
    }

    const rating = controller.ratings.find(
      (item) => item.code === String(code).trim().toUpperCase()
    );

    if (!rating) {
      throw new Error(
        "El controlador no tiene registrada esa habilitación."
      );
    }

    // Solo cambia el estado operativo.
    // La adición de licencia permanece registrada.
    rating.status = status;

    this.syncStructures();

    return rating;
  }

  // ========================================
  // CERTIFICACIÓN DE INGLÉS OACI
  // ========================================

    // ========================================
  // CERTIFICACIÓN DE INGLÉS OACI
  // ========================================

  updateEnglish(initials, level, evaluationDate) {
    const controller = this.getController(initials);

    if (!controller) {
      throw new Error("El controlador no existe.");
    }

    const numericLevel = Number(level);

    if (
      !Number.isInteger(numericLevel) ||
      numericLevel < 1 ||
      numericLevel > 6
    ) {
      throw new Error(
        "El nivel OACI debe ser un número entero entre 1 y 6."
      );
    }

    if (!this.isValidDate(evaluationDate)) {
      throw new Error(
        "Debe ingresar una fecha de evaluación válida."
      );
    }

    const validityYears = {
      4: 3,
      5: 5,
      6: null,
    };

    let expirationDate = null;

    if (numericLevel === 4 || numericLevel === 5) {
      const date = new Date(`${evaluationDate}T00:00:00Z`);

      const years = validityYears[numericLevel];

      const targetYear = date.getUTCFullYear() + years;
      const month = date.getUTCMonth();
      const day = date.getUTCDate();

      // Controlar fechas como el 29 de febrero.
      const lastDay = new Date(
        Date.UTC(targetYear, month + 1, 0)
      ).getUTCDate();

      const expiration = new Date(
        Date.UTC(targetYear, month, Math.min(day, lastDay))
      );

      expirationDate = expiration.toISOString().slice(0, 10);
    }

    controller.english = {
      level: numericLevel,
      evaluationDate,
      expirationDate,
    };

    return controller.english;
  }

  // ========================================
  // CONSULTAR ESTADO DEL INGLÉS OACI
  // ========================================

  getEnglishStatus(initials) {
    const controller = this.getController(initials);

    if (!controller) {
      throw new Error("El controlador no existe.");
    }

    const english = controller.english;

    if (!english || !english.level) {
      return {
        status: "SIN_REGISTRO",
        certified: false,
        message: "No tiene certificación de inglés registrada.",
      };
    }

    if (english.level < 4) {
      return {
        status: "NIVEL_INSUFICIENTE",
        certified: false,
        message: "No cumple el nivel mínimo OACI 4.",
      };
    }

    if (english.level === 6) {
      return {
        status: "VIGENTE",
        certified: true,
        message: "Nivel OACI 6 - Vigencia indefinida.",
      };
    }

    const today = new Date().toISOString().slice(0, 10);

    if (
      !english.expirationDate ||
      english.expirationDate < today
    ) {
      return {
        status: "VENCIDO",
        certified: false,
        message: "La certificación de inglés está vencida.",
      };
    }

    return {
      status: "VIGENTE",
      certified: true,
      message: `Nivel OACI ${english.level} vigente hasta ${english.expirationDate}.`,
    };
  }

    // ========================================
  // CERTIFICADO MÉDICO AERONÁUTICO - CERMED
  // ========================================

  updateMedicalCertificate(initials, issueDate) {
    const controller = this.getController(initials);

    if (!controller) {
      throw new Error("El controlador no existe.");
    }

    if (!this.isValidDate(issueDate)) {
      throw new Error(
        "Debe ingresar una fecha de expedición válida para el CERMED."
      );
    }

    const date = new Date(`${issueDate}T00:00:00Z`);

    const targetYear = date.getUTCFullYear() + 1;
    const month = date.getUTCMonth();
    const day = date.getUTCDate();

    // Controlar fechas como el 29 de febrero.
    const lastDay = new Date(
      Date.UTC(targetYear, month + 1, 0)
    ).getUTCDate();

    const expiration = new Date(
      Date.UTC(targetYear, month, Math.min(day, lastDay))
    );

    const expirationDate = expiration.toISOString().slice(0, 10);

    controller.medicalCertificate = {
      issueDate,
      expirationDate,
    };

    return controller.medicalCertificate;
  }
    // ========================================
  // CONSULTAR ESTADO DEL CERMED
  // ========================================

  getMedicalCertificateStatus(initials) {
    const controller = this.getController(initials);

    if (!controller) {
      throw new Error("El controlador no existe.");
    }

    const medical = controller.medicalCertificate;

    if (!medical || !medical.issueDate) {
      return {
        status: "SIN_REGISTRO",
        valid: false,
        message: "El ATC no tiene CERMED registrado.",
      };
    }

    const today = new Date().toISOString().slice(0, 10);

    if (
      !medical.expirationDate ||
      medical.expirationDate < today
    ) {
      return {
        status: "VENCIDO",
        valid: false,
        message: "El certificado médico está vencido.",
      };
    }

    return {
      status: "VIGENTE",
      valid: true,
      message: `CERMED vigente hasta ${medical.expirationDate}.`,
    };
  }
    // ========================================
  // CONDICIÓN OPERATIVA DEL ATC
  // ========================================

  getOperationalStatus(initials) {
    const controller = this.getController(initials);

    if (!controller) {
      throw new Error("El controlador no existe.");
    }

    const reasons = [];

    // 1. Identificar habilitaciones vigentes.
    // SUP no es una adición de licencia.

    const activeRatings = controller.ratings.filter(
      (rating) =>
        rating.status === RATING_STATUS.ACTIVE &&
        rating.code !== "SUP"
    );

    if (activeRatings.length === 0) {
      reasons.push(
        "El ATC no tiene habilitaciones operativas vigentes."
      );
    }

    // 2. Evaluar recurrentes individualmente.

    const recurrentStatuses = activeRatings.map(
      (rating) =>
        this.getRecurrentCourseStatus(
          initials,
          rating.code
        )
    );

    const eligibleRatings = recurrentStatuses
      .filter((status) => status.valid)
      .map((status) => status.ratingCode);

    if (
      activeRatings.length > 0 &&
      eligibleRatings.length === 0
    ) {
      reasons.push(
        "El ATC no tiene cursos recurrentes vigentes para sus habilitaciones activas."
      );
    }

    // 3. Inglés OACI.

    const englishStatus = this.getEnglishStatus(initials);

    if (!englishStatus.certified) {
      reasons.push(englishStatus.message);
    }

    // 4. Certificado médico.

    const medicalStatus =
      this.getMedicalCertificateStatus(initials);

    if (!medicalStatus.valid) {
      reasons.push(medicalStatus.message);
    }

    // 5. Determinar condición operativa.

    const isOperational = reasons.length === 0;

    return {
      initials: controller.initials,
      name: controller.name,

      status: isOperational ? "OPERATIVO" : "NOOP",

      operational: isOperational,

      // Habilitaciones activas registradas.
      activeRatings: activeRatings.map(
        (rating) => rating.code
      ),

      // Habilitaciones con recurrente vigente.
      eligibleRatings,

      recurrentStatuses,

      englishStatus: englishStatus.status,

      medicalStatus: medicalStatus.status,

      reasons,
    };
  }
    // ========================================
  // CURSOS RECURRENTES POR ADICIÓN
  // ========================================

  addRecurrentCourse(initials, ratingCode, completionDate) {
    const controller = this.getController(initials);

    if (!controller) {
      throw new Error("El controlador no existe.");
    }

    const code = String(ratingCode).trim().toUpperCase();

    const validCodes = ["AD", "APP", "ACC", "APPS", "ACCS"];

    if (!validCodes.includes(code)) {
      throw new Error(
        "El recurrente debe corresponder a una adición de licencia válida."
      );
    }

    const rating = controller.ratings.find(
      (item) => item.code === code
    );

    if (!rating) {
      throw new Error(
        `El controlador no tiene registrada la adición ${code}.`
      );
    }

    if (!this.isValidDate(completionDate)) {
      throw new Error(
        "Debe ingresar una fecha válida para el curso recurrente."
      );
    }

    const expirationDate = this.addYearsToDate(
      completionDate,
      4
    );

    if (!Array.isArray(controller.recurrentCourses)) {
      controller.recurrentCourses = [];
    }

    const course = {
      id: this.generateRecordId(),
      ratingCode: code,
      completionDate,
      expirationDate,
    };

    controller.recurrentCourses.push(course);

    return course;
  }

  // ========================================
  // CONSULTAR HISTORIAL DE RECURRENTES
  // ========================================

  getRecurrentCourses(initials) {
    const controller = this.getController(initials);

    if (!controller) {
      throw new Error("El controlador no existe.");
    }

    return [...(controller.recurrentCourses ?? [])];
  }

  // ========================================
  // ESTADO DEL RECURRENTE POR ADICIÓN
  // ========================================

  getRecurrentCourseStatus(initials, ratingCode) {
    const controller = this.getController(initials);

    if (!controller) {
      throw new Error("El controlador no existe.");
    }

    const code = String(ratingCode).trim().toUpperCase();

    const validCodes = ["AD", "APP", "ACC", "APPS", "ACCS"];

    if (!validCodes.includes(code)) {
      throw new Error("La adición de licencia no es válida.");
    }

    const courses = (controller.recurrentCourses ?? [])
      .filter((course) => course.ratingCode === code)
      .sort((a, b) =>
        b.completionDate.localeCompare(a.completionDate)
      );

    if (courses.length === 0) {
      return {
        ratingCode: code,
        status: "SIN_REGISTRO",
        valid: false,
        completionDate: null,
        expirationDate: null,
        message: `No tiene curso recurrente registrado para ${code}.`,
      };
    }

    const latestCourse = courses[0];

    const today = new Date().toISOString().slice(0, 10);

    const valid = latestCourse.expirationDate >= today;

    return {
      ratingCode: code,
      status: valid ? "VIGENTE" : "VENCIDO",
      valid,
      completionDate: latestCourse.completionDate,
      expirationDate: latestCourse.expirationDate,
      message: valid
        ? `Recurrente ${code} vigente hasta ${latestCourse.expirationDate}.`
        : `El recurrente de ${code} está vencido.`,
    };
  }

  // ========================================
  // OTRAS CAPACITACIONES
  // ========================================

  addTraining(
    initials,
    courseName,
    completionDate,
    observations = ""
  ) {
    const controller = this.getController(initials);

    if (!controller) {
      throw new Error("El controlador no existe.");
    }

    if (
      typeof courseName !== "string" ||
      !courseName.trim()
    ) {
      throw new Error(
        "Debe ingresar el nombre de la capacitación."
      );
    }

    if (!this.isValidDate(completionDate)) {
      throw new Error(
        "La fecha de capacitación no es válida."
      );
    }

    if (!Array.isArray(controller.trainings)) {
      controller.trainings = [];
    }

    const training = {
      id: this.generateRecordId(),
      courseName: courseName.trim(),
      completionDate,
      observations: String(observations ?? "").trim(),
    };

    controller.trainings.push(training);

    return training;
  }

  // ========================================
  // CONSULTAR OTRAS CAPACITACIONES
  // ========================================

  getTrainings(initials) {
    const controller = this.getController(initials);

    if (!controller) {
      throw new Error("El controlador no existe.");
    }

    return [...(controller.trainings ?? [])];
  }

  // ========================================
  // CALCULAR FECHA DE VENCIMIENTO
  // ========================================

  addYearsToDate(dateString, years) {
    if (!this.isValidDate(dateString)) {
      throw new Error("La fecha ingresada no es válida.");
    }

    const date = new Date(`${dateString}T00:00:00Z`);

    const targetYear = date.getUTCFullYear() + years;
    const month = date.getUTCMonth();
    const day = date.getUTCDate();

    const lastDay = new Date(
      Date.UTC(targetYear, month + 1, 0)
    ).getUTCDate();

    const expiration = new Date(
      Date.UTC(targetYear, month, Math.min(day, lastDay))
    );

    return expiration.toISOString().slice(0, 10);
  }

  // ========================================
  // IDENTIFICADOR ÚNICO DE REGISTROS
  // ========================================

  generateRecordId() {
    if (
      globalThis.crypto &&
      typeof globalThis.crypto.randomUUID === "function"
    ) {
      return globalThis.crypto.randomUUID();
    }

    this.recordSequence = (this.recordSequence ?? 0) + 1;

    return `REG-${Date.now()}-${this.recordSequence}`;
  }

  // ========================================
  // FICHA INTEGRAL DEL CONTROLADOR
  // ========================================

  getControllerSummary(initials) {
    const controller = this.getController(initials);

    if (!controller) {
      throw new Error("El controlador no existe.");
    }

    const licenseRatings = controller.ratings.filter(
      (rating) => rating.code !== "SUP"
    );

    return {
      initials: controller.initials,
      name: controller.name,

      ratings: controller.ratings.map((rating) => ({
        ...rating,
      })),

      english: controller.english
        ? { ...controller.english }
        : null,

      englishStatus: this.getEnglishStatus(initials),

      medicalCertificate: controller.medicalCertificate
        ? { ...controller.medicalCertificate }
        : null,

      medicalStatus:
        this.getMedicalCertificateStatus(initials),

      recurrentCourses: this.getRecurrentCourses(initials),

      recurrentStatuses: licenseRatings.map((rating) =>
        this.getRecurrentCourseStatus(initials, rating.code)
      ),

      trainings: this.getTrainings(initials),

      operationalStatus: this.getOperationalStatus(initials),
    };
  }

  // ========================================
  // VALIDAR FECHAS
  // ========================================

  isValidDate(date) {
    if (
      typeof date !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(date)
    ) {
      return false;
    }

    const parsed = new Date(`${date}T00:00:00Z`);

    return (
      !Number.isNaN(parsed.getTime()) &&
      parsed.toISOString().slice(0, 10) === date
    );
  }

  // ========================================
  // BUSCADOR TRIE
  // ========================================

  searchControllers(prefix) {
    return this.trie.searchPrefix(prefix);
  }

  // ========================================
  // FILTRAR POR HABILITACIÓN
  // ========================================

  searchByRating(
    code,
    status = RATING_STATUS.ACTIVE
  ) {
    return this.graph.getControllersByRating(
      code,
      status
    );
  }

  // ========================================
  // TOP K - MIN HEAP
  // ========================================

  getTopControllers(k = 5) {
    return MinHeap.topK(this.getControllers(), k);
  }

  // ========================================
  // COLA DE SOLICITUDES
  // ========================================

  addRequest(request) {
    if (!this.getController(request?.initials)) {
      throw new Error(
        "No se puede registrar una solicitud para un ATC inexistente."
      );
    }

    return this.requests.enqueue(request);
  }

  getPendingRequests() {
    return this.requests.toArray();
  }

  attendNextRequest() {
    return this.requests.dequeue();
  }

  // ========================================
  // DATOS DEL GRAFO
  // ========================================

  getGraphData() {
    return this.graph.toVisualization();
  }

  // ========================================
  // ESTADÍSTICAS GENERALES
  // ========================================

  getStatistics() {
    const controllers = this.getControllers();

    const totalControllers = controllers.length;

    const totalLicenseRatings = controllers.reduce(
      (total, controller) =>
        total + countLicenseRatings(controller),
      0
    );

    const activeRatings = controllers.reduce(
      (total, controller) =>
        total + countActiveRatings(controller),
      0
    );

    const inactiveRatings = controllers.reduce(
      (total, controller) =>
        total +
        controller.ratings.filter(
          (rating) =>
            rating.status === RATING_STATUS.INACTIVE
        ).length,
      0
    );

    const trainingRatings = controllers.reduce(
      (total, controller) =>
        total +
        controller.ratings.filter(
          (rating) =>
            rating.status === RATING_STATUS.TRAINING
        ).length,
      0
    );

    return {
      totalControllers,
      totalLicenseRatings,
      activeRatings,
      inactiveRatings,
      trainingRatings,
      pendingRequests: this.requests.size(),
    };
  }
}

export default ATCManager;