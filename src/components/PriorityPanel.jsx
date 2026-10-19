import { useState } from "react";

import MinHeap from "../structures/MinHeap.js";

import {
  countActiveRatings,
} from "../constants/atc.js";

function PriorityPanel({ controllers }) {
  const [topK, setTopK] = useState(5);
  const [viewMode, setViewMode] = useState("ascending");

  // Crear un montículo con los controladores actuales.
  const heap = new MinHeap();

  controllers.forEach((controller) => {
    heap.insert(controller);
  });

  // Extraer los elementos en orden ascendente.
  const ascendingControllers = [];

  while (!heap.isEmpty()) {
    ascendingControllers.push(heap.extractMin());
  }

  // Obtener los K controladores con más habilitaciones.
  const topControllers = MinHeap.topK(
    controllers,
    Number(topK)
  );

  const displayedControllers =
    viewMode === "ascending"
      ? ascendingControllers
      : topControllers;

  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>🏆 Clasificación de controladores - MinHeap</h2>

        <p>
          Clasifica controladores según la cantidad de
          habilitaciones vigentes utilizando una estructura
          de datos MinHeap.
        </p>
      </div>

      {/* ESTADÍSTICAS */}

      <div className="ratings-detail">
        <h3>Estadísticas</h3>

        <p>
          <strong>Total de controladores:</strong>{" "}
          {controllers.length}
        </p>

        <p>
          <strong>Menor cantidad de habilitaciones:</strong>{" "}
          {ascendingControllers.length > 0
            ? countActiveRatings(ascendingControllers[0])
            : 0}
        </p>

        <p>
          <strong>Mayor cantidad de habilitaciones:</strong>{" "}
          {ascendingControllers.length > 0
            ? countActiveRatings(
                ascendingControllers[
                  ascendingControllers.length - 1
                ]
              )
            : 0}
        </p>
      </div>

      {/* SELECCIÓN DEL TIPO DE CLASIFICACIÓN */}

      <div className="controller-form">
        <div className="form-group">
          <label htmlFor="heapViewMode">
            Tipo de clasificación
          </label>

          <select
            id="heapViewMode"
            value={viewMode}
            onChange={(event) =>
              setViewMode(event.target.value)
            }
          >
            <option value="ascending">
              Menor a mayor número de habilitaciones
            </option>

            <option value="top">
              Top K - Mayor número de habilitaciones
            </option>
          </select>
        </div>

        {viewMode === "top" && (
          <div className="form-group">
            <label htmlFor="heapTopK">
              Cantidad de controladores (K)
            </label>

            <input
              id="heapTopK"
              type="number"
              min="1"
              max={Math.max(1, controllers.length)}
              value={topK}
              onChange={(event) =>
                setTopK(event.target.value)
              }
            />
          </div>
        )}
      </div>

      {/* RESULTADOS */}

      <div className="ratings-detail">
        <h3>
          {viewMode === "ascending"
            ? "Clasificación ascendente"
            : `Top ${topK} controladores`}
        </h3>

        {displayedControllers.length === 0 ? (
          <div className="empty-state">
            No hay controladores para clasificar.
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="controllers-table">
              <thead>
                <tr>
                  <th>Posición</th>
                  <th>Siglas</th>
                  <th>Nombre completo</th>
                  <th>Habilitaciones vigentes</th>
                </tr>
              </thead>

              <tbody>
                {displayedControllers.map(
                  (controller, index) => (
                    <tr key={controller.initials}>
                      <td>{index + 1}</td>

                      <td>
                        <span className="initials-badge">
                          {controller.initials}
                        </span>
                      </td>

                      <td>{controller.name}</td>

                      <td>
                        <span className="status-badge status-active">
                          {countActiveRatings(controller)}
                        </span>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* EXPLICACIÓN ACADÉMICA */}

      <div className="ratings-detail">
        <h3>Información de la estructura MinHeap</h3>

        <p>
          <strong>Tipo:</strong> Montículo mínimo
          implementado mediante un arreglo.
        </p>

        <p>
          <strong>Criterio:</strong> Cantidad de
          habilitaciones vigentes.
        </p>

        <p>
          <strong>Insertar elemento:</strong> O(log n).
        </p>

        <p>
          <strong>Consultar mínimo:</strong> O(1).
        </p>

        <p>
          <strong>Extraer mínimo:</strong> O(log n).
        </p>

        <p>
          <strong>Aplicación:</strong> Clasificación de
          controladores según sus habilitaciones.
        </p>
      </div>
    </section>
  );
}

export default PriorityPanel;