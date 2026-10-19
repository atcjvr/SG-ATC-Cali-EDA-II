import { useState } from "react";

const RATING_NAMES = {
  AD: "Control de Aeródromo",
  APP: "Aproximación por Procedimientos",
  ACC: "Área por Procedimientos",
  APPS: "Aproximación por Vigilancia",
  ACCS: "Área por Vigilancia",
  SUP: "Supervisor",
};

const RATING_CODES = Object.keys(RATING_NAMES);

const STATUS_OPTIONS = [
  { value: "VIGENTE", label: "Vigente" },
  { value: "NO_VIGENTE", label: "No vigente" },
  { value: "ENTRENAMIENTO", label: "En entrenamiento" },
];

function GraphPanel({ manager, controllers }) {
  const [selectedRating, setSelectedRating] = useState("AD");
  const [selectedStatus, setSelectedStatus] = useState("VIGENTE");

  // Consultar las relaciones directamente desde el grafo.
  const graph = manager.graph;

  const relatedControllers = graph
    ? graph.getControllersByRating(
        selectedRating,
        selectedStatus
      )
    : [];

  const totalNodes = graph ? graph.nodeCount() : 0;
  const totalEdges = graph ? graph.edgeCount() : 0;

  const visualization = graph
    ? graph.toVisualization()
    : { nodes: [], edges: [] };

  const selectedRatingId = `RATING:${selectedRating}`;

  const visibleEdges = visualization.edges.filter(
    (edge) =>
      edge.target === selectedRatingId &&
      edge.status === selectedStatus
  );

  const visibleControllerIds = new Set(
    visibleEdges.map((edge) => edge.source)
  );

  const visibleNodes = visualization.nodes.filter(
    (node) =>
      node.id === selectedRatingId ||
      visibleControllerIds.has(node.id)
  );

  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>🕸️ Grafo de controladores y habilitaciones</h2>

        <p>
          Consulta las relaciones entre controladores ATC y sus
          habilitaciones mediante una estructura Graph.
        </p>
      </div>

      {/* ESTADÍSTICAS */}

      <div className="ratings-detail">
        <h3>Estadísticas del grafo</h3>

        <p>
          <strong>Controladores registrados:</strong>{" "}
          {controllers.length}
        </p>

        <p>
          <strong>Total de nodos:</strong> {totalNodes}
        </p>

        <p>
          <strong>Total de conexiones:</strong> {totalEdges}
        </p>
      </div>

      {/* FILTROS */}

      <div className="controller-form">
        <div className="form-group">
          <label htmlFor="graphRating">
            Habilitación
          </label>

          <select
            id="graphRating"
            value={selectedRating}
            onChange={(event) =>
              setSelectedRating(event.target.value)
            }
          >
            {RATING_CODES.map((code) => (
              <option key={code} value={code}>
                {code} - {RATING_NAMES[code]}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="graphStatus">
            Estado
          </label>

          <select
            id="graphStatus"
            value={selectedStatus}
            onChange={(event) =>
              setSelectedStatus(event.target.value)
            }
          >
            {STATUS_OPTIONS.map((status) => (
              <option
                key={status.value}
                value={status.value}
              >
                {status.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* VISUALIZACIÓN DE RELACIONES */}

      <div className="ratings-detail">
        <h3>
          Relaciones de {selectedRating} —{" "}
          {selectedStatus.replaceAll("_", " ")}
        </h3>

        {relatedControllers.length === 0 ? (
          <div className="empty-state">
            No existen controladores relacionados con
            esta habilitación y estado.
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
              padding: "24px",
              border: "1px solid #334155",
              borderRadius: "12px",
              marginTop: "16px",
            }}
          >
            {/* NODO CENTRAL */}

            <div
              style={{
                padding: "16px 28px",
                borderRadius: "12px",
                backgroundColor: "#0891b2",
                color: "#ffffff",
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              {selectedRating}
              <div style={{ fontSize: "12px" }}>
                {RATING_NAMES[selectedRating]}
              </div>
            </div>

            {/* CONEXIONES */}

            <div
              style={{
                width: "2px",
                height: "28px",
                backgroundColor: "#38bdf8",
              }}
            />

            {/* NODOS DE CONTROLADORES */}

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: "12px",
              }}
            >
              {relatedControllers.map((controller) => (
                <div
                  key={controller.initials}
                  style={{
                    padding: "12px 18px",
                    border: "1px solid #38bdf8",
                    borderRadius: "10px",
                    backgroundColor: "#0f172a",
                    color: "#e2e8f0",
                    textAlign: "center",
                    minWidth: "140px",
                  }}
                >
                  <strong>{controller.initials}</strong>

                  <div
                    style={{
                      fontSize: "12px",
                      marginTop: "4px",
                    }}
                  >
                    {controller.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* TABLA DE RELACIONES */}

      <div className="ratings-detail">
        <h3>
          Controladores relacionados ({relatedControllers.length})
        </h3>

        {relatedControllers.length === 0 ? (
          <div className="empty-state">
            No hay resultados para mostrar.
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="controllers-table">
              <thead>
                <tr>
                  <th>Siglas</th>
                  <th>Nombre completo</th>
                  <th>Habilitación</th>
                  <th>Estado</th>
                </tr>
              </thead>

              <tbody>
                {relatedControllers.map((controller) => (
                  <tr key={controller.initials}>
                    <td>
                      <span className="initials-badge">
                        {controller.initials}
                      </span>
                    </td>

                    <td>{controller.name}</td>

                    <td>{selectedRating}</td>

                    <td>
                      <span
                        className={`status-badge ${
                          selectedStatus === "VIGENTE"
                            ? "status-active"
                            : "status-inactive"
                        }`}
                      >
                        {selectedStatus.replaceAll("_", " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* INFORMACIÓN ACADÉMICA */}

      <div className="ratings-detail">
        <h3>Información de la estructura Graph</h3>

        <p>
          <strong>Tipo:</strong> Grafo no dirigido.
        </p>

        <p>
          <strong>Representación:</strong> Lista de adyacencia
          utilizando Map.
        </p>

        <p>
          <strong>Vértices:</strong> Controladores y habilitaciones.
        </p>

        <p>
          <strong>Aristas:</strong> Relaciones entre controladores
          y habilitaciones, con su respectivo estado.
        </p>

        <p>
          <strong>Nodos de la consulta:</strong>{" "}
          {visibleNodes.length}
        </p>

        <p>
          <strong>Conexiones de la consulta:</strong>{" "}
          {visibleEdges.length}
        </p>
      </div>
    </section>
  );
}

export default GraphPanel;