import { useState } from "react";
import { saveMedicalToDB } from "../services/MedicalService.js";

function MedicalPanel({ manager, controllers, refreshData }) {
  const [selectedController, setSelectedController] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [message, setMessage] = useState(null);

  const getMedicalLabel = (status) => {
    if (status.valid) return "VIGENTE";
    if (status.status === "VENCIDO") return "VENCIDO";
    return "SIN CERTIFICADO";
  };

  const handleSave = async (event) => {
  event.preventDefault();

  try {
    // 1. Validar el controlador seleccionado
    if (!selectedController) {
      throw new Error("Debes seleccionar un controlador.");
    }

    if (!issueDate) {
      throw new Error("Debes ingresar la fecha de expedición.");
    }

    // 2. Consultar el controlador en ATCManager
    const controller = manager.getController(selectedController);

    if (!controller) {
      throw new Error("No se encontró el controlador seleccionado.");
    }

    // 3. Guardar una copia del certificado anterior
    const previousMedical = controller.medicalCertificate
      ? { ...controller.medicalCertificate }
      : null;

    // 4. Calcular el vencimiento mediante ATCManager
    manager.updateMedicalCertificate(
      selectedController,
      issueDate
    );

    const updatedController = manager.getController(
      selectedController
    );

    const expirationDate =
      updatedController.medicalCertificate?.expirationDate;

    // 5. Guardar el certificado en PostgreSQL
    try {
      await saveMedicalToDB({
        initials: selectedController,
        issueDate,
        expirationDate,
      });
    } catch (dbError) {
      // Restaurar el certificado anterior si falla PostgreSQL
      if (previousMedical) {
        manager.updateMedicalCertificate(
          selectedController,
          previousMedical.issueDate
        );
      } else {
        updatedController.medicalCertificate = null;
      }

      manager.syncStructures();
      refreshData();

      throw dbError;
    }

    // 6. Consultar el estado actualizado
    const status = manager.getMedicalCertificateStatus(
      selectedController
    );

    // 7. Actualizar la interfaz
    refreshData();

    // 8. Mostrar confirmación
    setMessage({
      type: "success",
      text:
        `CERMED registrado en PostgreSQL para ${selectedController}. ` +
        `Vencimiento: ${expirationDate ?? "No disponible"}. ` +
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
        <h2>🩺 Certificado médico aeronáutico (CERMED)</h2>

        <p>
          Registra la fecha de expedición del certificado médico.
          El sistema calcula automáticamente su vencimiento anual.
        </p>
      </div>

      <form className="controller-form" onSubmit={handleSave}>
        <div className="form-group">
          <label htmlFor="medicalController">
            Controlador ATC
          </label>

          <select
            id="medicalController"
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
          <label htmlFor="medicalIssueDate">
            Fecha de expedición
          </label>

          <input
            id="medicalIssueDate"
            type="date"
            value={issueDate}
            onChange={(event) =>
              setIssueDate(event.target.value)
            }
            required
          />
        </div>

        <button className="btn btn-primary" type="submit">
          💾 Guardar CERMED
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
        <h3>Certificados médicos registrados</h3>

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
                  <th>Expedición</th>
                  <th>Vencimiento</th>
                  <th>Estado</th>
                </tr>
              </thead>

              <tbody>
                {controllers.map((controller) => {
                  const medical = controller.medicalCertificate;

                  const status =
                    manager.getMedicalCertificateStatus(
                      controller.initials
                    );

                  return (
                    <tr key={controller.initials}>
                      <td>
                        <span className="initials-badge">
                          {controller.initials}
                        </span>
                      </td>

                      <td>
                        {medical?.issueDate ?? "—"}
                      </td>

                      <td>
                        {medical?.expirationDate ?? "—"}
                      </td>

                      <td>
                        <span
                          className={`status-badge ${
                            status.valid
                              ? "status-active"
                              : "status-inactive"
                          }`}
                        >
                          {getMedicalLabel(status)}
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

export default MedicalPanel;