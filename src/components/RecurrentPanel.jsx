import { useState } from "react";
import { saveRecurrentToDB } from "../services/RecurrentService.js";

const RATING_NAMES = {
  AD: "Control de Aeródromo",
  APP: "Aproximación por Procedimientos",
  ACC: "Área por Procedimientos",
  APPS: "Aproximación por Vigilancia",
  ACCS: "Área por Vigilancia",
};

function RecurrentPanel({ manager, controllers, refreshData }) {
  const [selectedController, setSelectedController] = useState("");
  const [selectedRating, setSelectedRating] = useState("");
  const [completionDate, setCompletionDate] = useState("");
  const [message, setMessage] = useState(null);

  const controller = controllers.find(
    (item) => item.initials === selectedController
  );

  const licenseRatings = (controller?.ratings ?? []).filter(
    (rating) => RATING_NAMES[rating.code] !== undefined
  );

  const recurrentCourses = controller
    ? manager.getRecurrentCourses(controller.initials)
    : [];

  const recurrentStatuses = licenseRatings.map((rating) => ({
    ...manager.getRecurrentCourseStatus(
      controller.initials,
      rating.code
    ),
    ratingStatus: rating.status,
  }));

  const handleSave = async (event) => {
    event.preventDefault();

    try {
      if (!controller) {
        throw new Error("Debes seleccionar un controlador.");
      }

      if (!selectedRating) {
        throw new Error("Debes seleccionar una adición de licencia.");
      }

      if (!licenseRatings.some((rating) => rating.code === selectedRating)) {
        throw new Error(
          "El controlador no tiene registrada esa adición de licencia."
        );
      }

      if (!completionDate) {
        throw new Error("Debes ingresar la fecha del curso recurrente.");
      }

     // Calcular el vencimiento del recurrente: cuatro años.
const expirationDate = manager.addYearsToDate(
  completionDate,
  4
);

// Guardar primero en PostgreSQL.
const savedCourse = await saveRecurrentToDB({
  initials: controller.initials,
  ratingCode: selectedRating,
  completionDate,
  expirationDate,
});

// Registrar el curso en nuestra estructura de datos.
const course = manager.addRecurrentCourse(
  controller.initials,
  selectedRating,
  completionDate
);

// Utilizar el identificador generado por PostgreSQL.
course.id = savedCourse.id;

// Actualizar la interfaz.
refreshData();

      setCompletionDate("");
      setMessage({
        type: "success",
        text:
          `Recurrente ${selectedRating} registrado correctamente. ` +
          `Vigente hasta ${course.expirationDate}.`,
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
        <h2>🔄 Cursos recurrentes por adición de licencia</h2>

        <p>
          Registra los cursos recurrentes de cada adición de licencia
          y consulta su vigencia individual.
        </p>
      </div>

      <form className="controller-form" onSubmit={handleSave}>
        <div className="form-group">
          <label htmlFor="recurrentController">
            Controlador ATC
          </label>

          <select
            id="recurrentController"
            value={controller ? selectedController : ""}
            onChange={(event) => {
              setSelectedController(event.target.value);
              setSelectedRating("");
              setCompletionDate("");
              setMessage(null);
            }}
            required
          >
            <option value="">Seleccionar controlador</option>

            {controllers.map((item) => (
              <option key={item.initials} value={item.initials}>
                {item.initials} - {item.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="recurrentRating">
            Adición de licencia
          </label>

          <select
            id="recurrentRating"
            value={selectedRating}
            onChange={(event) => {
              setSelectedRating(event.target.value);
              setMessage(null);
            }}
            required
          >
            <option value="">Seleccionar adición</option>

            {licenseRatings.map((rating) => (
              <option key={rating.code} value={rating.code}>
                {rating.code} - {RATING_NAMES[rating.code]}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="recurrentDate">
            Fecha de realización del curso
          </label>

          <input
            id="recurrentDate"
            type="date"
            value={completionDate}
            onChange={(event) => setCompletionDate(event.target.value)}
            required
          />
        </div>

        <button className="btn btn-primary" type="submit">
          💾 Guardar curso recurrente
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

      {controller && (
        <div className="ratings-detail">
          <h3>Estado de recurrentes de {controller.initials}</h3>

          {licenseRatings.length === 0 ? (
            <div className="empty-state">
              Este controlador no tiene adiciones de licencia registradas.
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="controllers-table">
                <thead>
                  <tr>
                    <th>Adición</th>
                    <th>Estado de habilitación</th>
                    <th>Estado del recurrente</th>
                    <th>Último curso</th>
                    <th>Vencimiento</th>
                  </tr>
                </thead>

                <tbody>
                  {recurrentStatuses.map((status) => (
                    <tr key={status.ratingCode}>
                      <td>
                        <span className="initials-badge">
                          {status.ratingCode}
                        </span>
                      </td>

                      <td>{status.ratingStatus.replaceAll("_", " ")}</td>

                      <td>
                        <span
                          className={`status-badge ${
                            status.valid
                              ? "status-active"
                              : "status-inactive"
                          }`}
                        >
                          {status.status.replaceAll("_", " ")}
                        </span>
                      </td>

                      <td>{status.completionDate || "—"}</td>
                      <td>{status.expirationDate || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <h3>Historial de cursos recurrentes</h3>

          {recurrentCourses.length === 0 ? (
            <div className="empty-state">
              No hay cursos recurrentes registrados.
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="controllers-table">
                <thead>
                  <tr>
                    <th>Adición</th>
                    <th>Fecha de realización</th>
                    <th>Fecha de vencimiento</th>
                  </tr>
                </thead>

                <tbody>
                  {[...recurrentCourses]
                    .sort((a, b) =>
                      b.completionDate.localeCompare(a.completionDate)
                    )
                    .map((course) => (
                      <tr key={course.id}>
                        <td>{course.ratingCode}</td>
                        <td>{course.completionDate}</td>
                        <td>{course.expirationDate}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default RecurrentPanel;