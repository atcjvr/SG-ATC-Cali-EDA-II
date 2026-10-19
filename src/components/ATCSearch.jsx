import { useState } from "react";

function ATCSearch({ manager, controllers }) {
  const [searchText, setSearchText] = useState("");
  const [selectedInitials, setSelectedInitials] = useState("");

  // Buscar utilizando la estructura Trie.
  const results = searchText.trim()
    ? manager.searchControllers(searchText)
    : [];

  // Consultar la ficha integral del controlador.
  const controllerExists = controllers.some(
    (controller) => controller.initials === selectedInitials
  );

  const summary =
    selectedInitials && controllerExists
      ? manager.getControllerSummary(selectedInitials)
      : null;

  const handleSearchChange = (event) => {
    setSearchText(event.target.value);
    setSelectedInitials("");
  };

  const handleSelectController = (initials) => {
    setSelectedInitials(initials);
  };

  const formatStatus = (status) => {
    return String(status ?? "SIN REGISTRO").replaceAll("_", " ");
  };

  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>🔎 Buscador de controladores ATC</h2>

        <p>
          Busca controladores por sus siglas o por el inicio de su
          nombre utilizando una estructura de datos Trie.
        </p>
      </div>

      {/* CAMPO DE BÚSQUEDA */}

      <div className="form-group">
        <label htmlFor="atcSearch">
          Buscar controlador
        </label>

        <input
          id="atcSearch"
          type="text"
          placeholder="Ej. JVR, JV o JORGE"
          value={searchText}
          onChange={handleSearchChange}
        />
      </div>

      {/* RESULTADOS */}

      {searchText.trim() && (
        <div className="ratings-detail">
          <h3>Resultados de búsqueda</h3>

          {results.length === 0 ? (
            <div className="empty-state">
              No se encontraron controladores.
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="controllers-table">
                <thead>
                  <tr>
                    <th>Siglas</th>
                    <th>Nombre completo</th>
                    <th>Acción</th>
                  </tr>
                </thead>

                <tbody>
                  {results.map((controller) => (
                    <tr key={controller.initials}>
                      <td>
                        <span className="initials-badge">
                          {controller.initials}
                        </span>
                      </td>

                      <td>{controller.name}</td>

                      <td>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() =>
                            handleSelectController(controller.initials)
                          }
                        >
                          Ver ficha
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* FICHA INTEGRAL */}

      {summary && (
        <div className="ratings-detail">
          <h3>
            📋 Ficha integral: {summary.initials}
          </h3>

          <p>
            <strong>Nombre:</strong> {summary.name}
          </p>

          {/* CONDICIÓN OPERATIVA */}

          <h3>Condición operativa</h3>

          <p>
            <span
              className={`status-badge ${
                summary.operationalStatus.operational
                  ? "status-active"
                  : "status-inactive"
              }`}
            >
              {summary.operationalStatus.status}
            </span>
          </p>

          {!summary.operationalStatus.operational && (
            <p>
              <strong>Observaciones:</strong>{" "}
              {summary.operationalStatus.reasons.join(" | ")}
            </p>
          )}

          {/* LICENCIAS Y HABILITACIONES */}

          <h3>Licencias y habilitaciones</h3>

          {summary.ratings.length === 0 ? (
            <div className="empty-state">
              Sin habilitaciones registradas.
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="controllers-table">
                <thead>
                  <tr>
                    <th>Adición / habilitación</th>
                    <th>Tipo</th>
                    <th>Estado</th>
                  </tr>
                </thead>

                <tbody>
                  {summary.ratings.map((rating) => (
                    <tr key={rating.code}>
                      <td>{rating.code}</td>

                      <td>
                        {rating.type === "LICENCIA"
                          ? "Adición de licencia"
                          : "Habilitación"}
                      </td>

                      <td>
                        <span
                          className={`status-badge ${
                            rating.status === "VIGENTE"
                              ? "status-active"
                              : "status-inactive"
                          }`}
                        >
                          {formatStatus(rating.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* INGLÉS OACI */}

          <h3>Inglés OACI</h3>

          <p>
            <strong>Nivel:</strong>{" "}
            {summary.english?.level ?? "Sin registro"}
          </p>

          <p>
            <strong>Fecha de evaluación:</strong>{" "}
            {summary.english?.evaluationDate ?? "—"}
          </p>

          <p>
            <strong>Vencimiento:</strong>{" "}
            {summary.english?.level === 6
              ? "Indefinido"
              : summary.english?.expirationDate ?? "—"}
          </p>

          <p>
            <strong>Estado:</strong>{" "}
            {formatStatus(summary.englishStatus.status)}
          </p>

          {/* CERMED */}

          <h3>Certificado médico aeronáutico</h3>

          <p>
            <strong>Fecha de expedición:</strong>{" "}
            {summary.medicalCertificate?.issueDate ?? "—"}
          </p>

          <p>
            <strong>Vencimiento:</strong>{" "}
            {summary.medicalCertificate?.expirationDate ?? "—"}
          </p>

          <p>
            <strong>Estado:</strong>{" "}
            {formatStatus(summary.medicalStatus.status)}
          </p>

          {/* RECURRENTES */}

          <h3>Cursos recurrentes</h3>

          {summary.recurrentStatuses.length === 0 ? (
            <div className="empty-state">
              Sin adiciones de licencia para consultar recurrentes.
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="controllers-table">
                <thead>
                  <tr>
                    <th>Adición</th>
                    <th>Estado</th>
                    <th>Último curso</th>
                    <th>Vencimiento</th>
                  </tr>
                </thead>

                <tbody>
                  {summary.recurrentStatuses.map((course) => (
                    <tr key={course.ratingCode}>
                      <td>{course.ratingCode}</td>

                      <td>
                        <span
                          className={`status-badge ${
                            course.valid
                              ? "status-active"
                              : "status-inactive"
                          }`}
                        >
                          {formatStatus(course.status)}
                        </span>
                      </td>

                      <td>{course.completionDate ?? "—"}</td>

                      <td>{course.expirationDate ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* OTRAS CAPACITACIONES */}

          <h3>Otras capacitaciones</h3>

          {summary.trainings.length === 0 ? (
            <div className="empty-state">
              Sin capacitaciones registradas.
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
                  {summary.trainings.map((training) => (
                    <tr key={training.id}>
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
      )}
    </section>
  );
}

export default ATCSearch;