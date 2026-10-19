import { useState } from "react";
import { saveRequestToDB, attendRequestInDB, } from "../services/RequestService.js";

const REQUEST_TYPES = [
  "Actualización de habilitación",
  "Actualización de inglés OACI",
  "Actualización de CERMED",
  "Registro de capacitación",
  "Actualización de datos personales",
  "Otra solicitud",
];

function RequestsPanel({ manager, controllers, refreshData }) {
  const [selectedController, setSelectedController] = useState("");
  const [requestType, setRequestType] = useState(REQUEST_TYPES[0]);
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState(null);
  const [lastAttended, setLastAttended] = useState(null);

  const pendingRequests = manager.getPendingRequests();

  const handleAddRequest = async (event) => {
    event.preventDefault();

    try {
      if (!selectedController) {
        throw new Error("Debes seleccionar un controlador.");
      }

      if (!controllers.some((c) => c.initials === selectedController)) {
        throw new Error("El controlador seleccionado no existe.");
      }

      if (!description.trim()) {
        throw new Error("Debes ingresar una descripción.");
      }

      // 1. Guardar la solicitud en PostgreSQL.
const request = await saveRequestToDB({
  initials: selectedController,
  type: requestType,
  description: description.trim(),
});

// 2. Incorporarla a nuestra cola FIFO.
manager.addRequest(request);

// 3. Actualizar la interfaz.
refreshData();

      setDescription("");

      setMessage({
        type: "success",
        text: `Solicitud registrada correctamente para ${selectedController}.`,
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message,
      });
    }
  };

  const handleAttendNext = async () => {
    if (pendingRequests.length === 0) {
      setMessage({
        type: "error",
        text: "No hay solicitudes pendientes.",
      });
      return;
    }

    const confirmed = window.confirm(
      "¿Deseas atender la siguiente solicitud de la cola?"
    );

    if (!confirmed) return;

    try {
      // Consultar la primera solicitud de nuestra cola.
const nextRequest = manager.getPendingRequests()[0];

if (!nextRequest) {
  throw new Error("No hay solicitudes pendientes.");
}

// Confirmar su atención en PostgreSQL.
await attendRequestInDB(nextRequest.id);

// Retirarla de nuestra cola FIFO.
const attended = manager.attendNextRequest();

setLastAttended(attended);

refreshData();

      setMessage({
        type: "success",
        text: `Solicitud de ${attended.initials} atendida correctamente.`,
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
        <h2>📨 Gestión de solicitudes ATC</h2>

        <p>
          Registra y atiende solicitudes utilizando una estructura
          de datos Queue con funcionamiento FIFO.
        </p>
      </div>

      {/* REGISTRO DE SOLICITUDES */}

      <form
        className="controller-form"
        onSubmit={handleAddRequest}
      >
        <div className="form-group">
          <label htmlFor="requestController">
            Controlador ATC
          </label>

          <select
            id="requestController"
            value={
              controllers.some(
                (controller) =>
                  controller.initials === selectedController
              )
                ? selectedController
                : ""
            }
            onChange={(event) =>
              setSelectedController(event.target.value)
            }
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
          <label htmlFor="requestType">
            Tipo de solicitud
          </label>

          <select
            id="requestType"
            value={requestType}
            onChange={(event) =>
              setRequestType(event.target.value)
            }
          >
            {REQUEST_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="requestDescription">
            Descripción
          </label>

          <textarea
            id="requestDescription"
            placeholder="Describe brevemente la solicitud..."
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            rows={3}
            required
          />
        </div>

        <button
          className="btn btn-primary"
          type="submit"
        >
          ➕ Registrar solicitud
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

      {/* COLA DE SOLICITUDES */}

      <div className="ratings-detail">
        <h3>
          Solicitudes pendientes ({pendingRequests.length})
        </h3>

        {pendingRequests.length === 0 ? (
          <div className="empty-state">
            No hay solicitudes pendientes.
          </div>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="controllers-table">
                <thead>
                  <tr>
                    <th>Orden</th>
                    <th>ATC</th>
                    <th>Tipo de solicitud</th>
                    <th>Descripción</th>
                    <th>Fecha</th>
                  </tr>
                </thead>

                <tbody>
                  {pendingRequests.map((request, index) => (
                    <tr key={request.id ?? index}>
                      <td>{index + 1}</td>

                      <td>
                        <span className="initials-badge">
                          {request.initials}
                        </span>
                      </td>

                      <td>{request.type}</td>

                      <td>{request.description}</td>

                      <td>
                        {request.createdAt
                          ? new Date(
                              request.createdAt
                            ).toLocaleString("es-CO")
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              className="btn btn-success"
              type="button"
              onClick={handleAttendNext}
            >
              ✅ Atender siguiente solicitud
            </button>
          </>
        )}
      </div>

      {/* ÚLTIMA SOLICITUD ATENDIDA */}

      {lastAttended && (
        <div className="ratings-detail">
          <h3>Última solicitud atendida</h3>

          <p>
            <strong>Controlador:</strong>{" "}
            {lastAttended.initials}
          </p>

          <p>
            <strong>Tipo:</strong>{" "}
            {lastAttended.type}
          </p>

          <p>
            <strong>Descripción:</strong>{" "}
            {lastAttended.description}
          </p>
        </div>
      )}
    </section>
  );
}

export default RequestsPanel;