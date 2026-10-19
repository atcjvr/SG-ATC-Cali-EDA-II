import { useState } from "react";
import { saveRatingToDB } from "../services/RatingService.js";

const RATINGS = [
  { code: "AD", name: "Control de Aeródromo" },
  { code: "APP", name: "Aproximación por Procedimientos" },
  { code: "ACC", name: "Área por Procedimientos" },
  { code: "APPS", name: "Aproximación por Vigilancia" },
  { code: "ACCS", name: "Área por Vigilancia" },
  { code: "SUP", name: "Supervisor" },
];

const STATUSES = [
  { value: "VIGENTE", label: "Vigente" },
  { value: "NO_VIGENTE", label: "No vigente" },
  { value: "ENTRENAMIENTO", label: "Entrenamiento" },
];

function getStatusClass(status) {
  if (status === "VIGENTE") return "status-active";
  if (status === "NO_VIGENTE") return "status-inactive";
  return "status-training";
}

function RatingsPanel({ manager, controllers, refreshData }) {
  const [selectedController, setSelectedController] = useState("");
  const [selectedRating, setSelectedRating] = useState("AD");
  const [selectedStatus, setSelectedStatus] = useState("VIGENTE");
  const [message, setMessage] = useState(null);

  const currentController = controllers.find(
    (controller) => controller.initials === selectedController
  );

  const handleSave = async (event) => {
  event.preventDefault();

  try {
    // 1. Validar que exista un controlador seleccionado
    if (!selectedController) {
      throw new Error("Debes seleccionar un controlador.");
    }

    // 2. Consultar el controlador en la lista enlazada
    const controller = manager.getController(selectedController);

    if (!controller) {
      throw new Error("No se encontró el controlador seleccionado.");
    }

    // 3. Comprobar si la habilitación ya existe
    const existingRating = controller.ratings.find(
      (rating) => rating.code === selectedRating
    );

    // 4. Guardar o actualizar primero en PostgreSQL
    await saveRatingToDB({
      initials: selectedController,
      code: selectedRating,
      status: selectedStatus,
    });

    // 5. Actualizar nuestras estructuras de datos
    if (existingRating) {
      manager.updateRating(
        selectedController,
        selectedRating,
        selectedStatus
      );
    } else {
      manager.addRating(
        selectedController,
        selectedRating,
        selectedStatus
      );
    }

    // 6. Actualizar la interfaz
    refreshData();

    // 7. Mostrar confirmación
    setMessage({
      type: "success",
      text: `Habilitación ${selectedRating} ${
        existingRating ? "actualizada" : "registrada"
      } correctamente en PostgreSQL para ${selectedController}.`,
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
        <h2>🛫 Gestión de licencias y habilitaciones</h2>
        <p>
          Registra las adiciones de licencia y administra
          individualmente el estado de cada habilitación.
        </p>
      </div>

      <form className="rating-form" onSubmit={handleSave}>
        <div className="form-group">
          <label htmlFor="controllerSelect">Controlador ATC</label>

          <select
            id="controllerSelect"
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
          <label htmlFor="ratingSelect">
            Adición o habilitación
          </label>

          <select
            id="ratingSelect"
            value={selectedRating}
            onChange={(event) =>
              setSelectedRating(event.target.value)
            }
          >
            {RATINGS.map((rating) => (
              <option key={rating.code} value={rating.code}>
                {rating.code} - {rating.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="statusSelect">
            Estado de habilitación
          </label>

          <select
            id="statusSelect"
            value={selectedStatus}
            onChange={(event) =>
              setSelectedStatus(event.target.value)
            }
          >
            {STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        <button className="btn btn-primary" type="submit">
          💾 Guardar habilitación
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

      {currentController && (
        <div className="ratings-detail">
          <h3>
            Habilitaciones de {currentController.initials}
          </h3>

          {currentController.ratings.length === 0 ? (
            <div className="empty-state">
              Este controlador todavía no tiene
              habilitaciones registradas.
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="controllers-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Descripción</th>
                    <th>Tipo</th>
                    <th>Estado</th>
                  </tr>
                </thead>

                <tbody>
                  {currentController.ratings.map((rating) => {
                    const definition = RATINGS.find(
                      (item) => item.code === rating.code
                    );

                    return (
                      <tr key={rating.code}>
                        <td>
                          <span className="initials-badge">
                            {rating.code}
                          </span>
                        </td>

                        <td>
                          {definition?.name || rating.code}
                        </td>

                        <td>
                          {rating.type === "LICENCIA"
                            ? "Adición de licencia"
                            : "Habilitación"}
                        </td>

                        <td>
                          <span
                            className={`status-badge ${getStatusClass(
                              rating.status
                            )}`}
                          >
                            {rating.status.replaceAll("_", " ")}
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
      )}
    </section>
  );
}

export default RatingsPanel;