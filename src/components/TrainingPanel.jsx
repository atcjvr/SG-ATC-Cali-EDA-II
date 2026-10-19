import { useState } from "react";
import { saveTrainingToDB } from "../services/TrainingService.js";

function TrainingPanel({ manager, controllers, refreshData }) {
  const [selectedController, setSelectedController] = useState("");
  const [courseName, setCourseName] = useState("");
  const [completionDate, setCompletionDate] = useState("");
  const [observations, setObservations] = useState("");
  const [message, setMessage] = useState(null);

  const controllerExists = controllers.some(
    (controller) => controller.initials === selectedController
  );

  const trainings =
    selectedController && controllerExists
      ? manager.getTrainings(selectedController)
      : [];

  const handleSave = async (event) => {
    event.preventDefault();

    try {
      if (!selectedController) {
        throw new Error("Debes seleccionar un controlador.");
      }

      if (!courseName.trim()) {
        throw new Error("Debes ingresar el nombre de la capacitación.");
      }

      if (!completionDate) {
        throw new Error("Debes seleccionar la fecha de realización.");
      }

      // 1. Guardar primero en PostgreSQL.
const savedTraining = await saveTrainingToDB({
  initials: selectedController,
  courseName: courseName.trim(),
  completionDate,
  observations: observations.trim(),
});

// 2. Registrar en nuestra estructura de datos.
const training = manager.addTraining(
  selectedController,
  courseName.trim(),
  completionDate,
  observations.trim()
);

// 3. Conservar el identificador de PostgreSQL.
training.id = savedTraining.id;

// 4. Actualizar la interfaz.
refreshData();

      setCourseName("");
      setCompletionDate("");
      setObservations("");

      setMessage({
        type: "success",
        text: `Capacitación registrada correctamente para ${selectedController}.`,
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
        <h2>🎓 Capacitaciones del personal ATC</h2>

        <p>
          Registra las capacitaciones realizadas por cada controlador
          y consulta su historial de formación.
        </p>
      </div>

      <form className="controller-form" onSubmit={handleSave}>
        <div className="form-group">
          <label htmlFor="trainingController">
            Controlador ATC
          </label>

          <select
            id="trainingController"
            value={controllerExists ? selectedController : ""}
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
          <label htmlFor="trainingCourseName">
            Nombre de la capacitación
          </label>

          <input
            id="trainingCourseName"
            type="text"
            placeholder="Ej. Gestión de la seguridad operacional"
            value={courseName}
            onChange={(event) => setCourseName(event.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="trainingCompletionDate">
            Fecha de realización
          </label>

          <input
            id="trainingCompletionDate"
            type="date"
            value={completionDate}
            onChange={(event) => setCompletionDate(event.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="trainingObservations">
            Observaciones
          </label>

          <textarea
            id="trainingObservations"
            placeholder="Información adicional sobre la capacitación"
            value={observations}
            onChange={(event) => setObservations(event.target.value)}
            rows={3}
          />
        </div>

        <button className="btn btn-primary" type="submit">
          💾 Guardar capacitación
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
        <h3>
          Historial de capacitaciones
          {controllerExists ? ` - ${selectedController}` : ""}
        </h3>

        {!controllerExists ? (
          <div className="empty-state">
            Selecciona un controlador para consultar sus capacitaciones.
          </div>
        ) : trainings.length === 0 ? (
          <div className="empty-state">
            Este controlador todavía no tiene capacitaciones registradas.
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="controllers-table">
              <thead>
                <tr>
                  <th>Capacitación</th>
                  <th>Fecha</th>
                  <th>Observaciones</th>
                </tr>
              </thead>

              <tbody>
                {trainings.map((training, index) => (
                  <tr key={training.id ?? index}>
                    <td>{training.courseName}</td>
                    <td>{training.completionDate}</td>
                    <td>{training.observations || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export default TrainingPanel;