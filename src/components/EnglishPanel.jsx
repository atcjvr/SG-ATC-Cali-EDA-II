import { useState } from "react";
import { saveEnglishToDB } from "../services/EnglishService.js";

function EnglishPanel({ manager, controllers, refreshData }) {
  const [selectedController, setSelectedController] = useState("");
  const [level, setLevel] = useState("4");
  const [evaluationDate, setEvaluationDate] = useState("");
  const [message, setMessage] = useState(null);

  const getEnglishLabel = (status) => {
    if (status.certified) return "CERTIFICADO";
    if (status.status === "VENCIDO") return "VENCIDO";
    return "NO CERTIFICADO";
  };

  const handleSave = async (event) => {
  event.preventDefault();

  try {
    if (!selectedController) {
      throw new Error("Debes seleccionar un controlador.");
    }

    // 1. Validar los datos antes de enviarlos a PostgreSQL
    const englishLevel = Number(level);

    if (!Number.isInteger(englishLevel) ||
        englishLevel < 1 ||
        englishLevel > 6) {
      throw new Error("El nivel OACI debe estar entre 1 y 6.");
    }

    if (!evaluationDate) {
      throw new Error("Debes ingresar la fecha de evaluación.");
    }

    // 2. Conservar el estado anterior por si falla el guardado
    const controller = manager.getController(selectedController);

    if (!controller) {
      throw new Error("No se encontró el controlador.");
    }

    const previousEnglish = controller.english
      ? { ...controller.english }
      : null;

    // 3. Utilizar ATCManager para calcular el vencimiento
    manager.updateEnglish(
      selectedController,
      englishLevel,
      evaluationDate
    );

    const updatedController = manager.getController(
      selectedController
    );

    const expirationDate =
      updatedController.english?.expirationDate || null;

    // 4. Guardar la certificación en PostgreSQL
    try {
      await saveEnglishToDB({
        initials: selectedController,
        level: englishLevel,
        evaluationDate,
        expirationDate,
      });
    } catch (dbError) {
      // Restaurar los datos anteriores si falla PostgreSQL
      if (previousEnglish) {
        manager.updateEnglish(
          selectedController,
          previousEnglish.level,
          previousEnglish.evaluationDate
        );
      } else {
        updatedController.english = null;
      }

      manager.syncStructures();
      refreshData();

      throw dbError;
    }

    // 5. Consultar el estado actualizado
    const status = manager.getEnglishStatus(selectedController);

    // 6. Actualizar la interfaz
    refreshData();

    // 7. Mostrar confirmación
    setMessage({
      type: "success",
      text:
        `Certificación OACI registrada en PostgreSQL para ${selectedController}. ` +
        (expirationDate
          ? `Vencimiento: ${expirationDate}. `
          : englishLevel === 6
            ? "Vigencia indefinida. "
            : "Sin vigencia operativa. ") +
        status.message,
    });

  } catch (error) {
    setMessage({
      type: "error",
      text: error.message,
    });
  }
};

  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>🌐 Certificación de inglés OACI</h2>
        <p>
          Registra el nivel de competencia lingüística del controlador.
          El sistema calcula automáticamente su vigencia.
        </p>
      </div>

      <form className="controller-form" onSubmit={handleSave}>
        <div className="form-group">
          <label htmlFor="englishController">Controlador ATC</label>

          <select
            id="englishController"
            value={selectedController}
            onChange={(event) => {
              setSelectedController(event.target.value);
              setMessage(null);
            }}
            required
          >
            <option value="">Seleccionar controlador</option>

            {controllers.map((controller) => (
              <option
                key={controller.initials}
                value={controller.initials}
              >
                {controller.initials} - {controller.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="englishLevel">Nivel OACI</label>

          <select
            id="englishLevel"
            value={level}
            onChange={(event) => setLevel(event.target.value)}
          >
            <option value="1">Nivel 1 - Pre-elemental</option>
            <option value="2">Nivel 2 - Elemental</option>
            <option value="3">Nivel 3 - Preoperacional</option>
            <option value="4">Nivel 4 - Operacional</option>
            <option value="5">Nivel 5 - Avanzado</option>
            <option value="6">Nivel 6 - Experto</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="englishEvaluationDate">
            Fecha de evaluación
          </label>

          <input
            id="englishEvaluationDate"
            type="date"
            value={evaluationDate}
            onChange={(event) =>
              setEvaluationDate(event.target.value)
            }
            required
          />
        </div>

        <button className="btn btn-primary" type="submit">
          💾 Guardar certificación OACI
        </button>
      </form>

      {message && (
        <div
          className={`message message-${message.type}`}
          role="status"
        >
          {message.text}
        </div>
      )}

      <div className="ratings-detail">
        <h3>Certificaciones de inglés registradas</h3>

        {controllers.length === 0 ? (
          <div className="empty-state">
            No hay controladores registrados.
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="controllers-table">
              <thead>
                <tr>
                  <th>ATC</th>
                  <th>Nivel OACI</th>
                  <th>Evaluación</th>
                  <th>Vencimiento</th>
                  <th>Estado</th>
                </tr>
              </thead>

              <tbody>
                {controllers.map((controller) => {
                  const english = controller.english;
                  const status = manager.getEnglishStatus(
                    controller.initials
                  );

                  return (
                    <tr key={controller.initials}>
                      <td>
                        <span className="initials-badge">
                          {controller.initials}
                        </span>
                      </td>

                      <td>{english?.level ?? "Sin registro"}</td>

                      <td>
                        {english?.evaluationDate ?? "—"}
                      </td>

                      <td>
                        {english?.level === 6
                          ? "Indefinida"
                          : english?.expirationDate ?? "No aplica"}
                      </td>

                      <td>
                        <span
                          className={`status-badge ${
                            status.certified
                              ? "status-active"
                              : "status-inactive"
                          }`}
                        >
                          {getEnglishLabel(status)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export default EnglishPanel;