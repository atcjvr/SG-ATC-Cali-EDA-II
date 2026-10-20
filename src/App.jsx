import { useEffect, useState } from "react";

import ATCSearch from "./components/ATCSearch.jsx";

import ATCManager from "./services/ATCManager.js";

import RatingsPanel from "./components/RatingsPanel.jsx";

import EnglishPanel from "./components/EnglishPanel.jsx";

import MedicalPanel from "./components/MedicalPanel.jsx";

import TrainingPanel from "./components/TrainingPanel.jsx";

import RecurrentPanel from "./components/RecurrentPanel.jsx";

import RequestsPanel from "./components/RequestsPanel.jsx";

import GraphPanel from "./components/GraphPanel.jsx";

import PriorityPanel from "./components/PriorityPanel.jsx";

import Login from "./components/Login.jsx";

import { supabase } from "./lib/supabase.js";

import { getControllersFromDB, saveControllerToDB, } from "./services/ControllerService.js";

import { getRatingsFromDB } from "./services/RatingService.js";

import { getEnglishFromDB } from "./services/EnglishService.js";

import { getMedicalFromDB } from "./services/MedicalService.js";

import { getRecurrentFromDB } from "./services/RecurrentService.js";

import { getTrainingsFromDB } from "./services/TrainingService.js";

import { getPendingRequestsFromDB } from "./services/RequestService.js";

import "./App.css";

function Dashboard() {

  const [manager] = useState(() => new ATCManager());

  const [controllers, setControllers] = useState(() => [...manager.getControllers()]);

  const [statistics, setStatistics] = useState(() => ({ ...manager.getStatistics() }));

  const [initials, setInitials] = useState("");

  const [name, setName] = useState("");

  const [message, setMessage] = useState(null);

  const refreshData = () => {

    setControllers([...manager.getControllers()]);

    setStatistics({ ...manager.getStatistics() });

  };
  useEffect(() => {
  let active = true;

  const loadControllers = async () => {
    try {
      const data = await getControllersFromDB();

      if (!active) return;

      for (const controller of data) {

  // 1. Comprobar si el controlador ya existe
  const exists = manager
    .getControllers()
    .some(
      (item) => item.initials === controller.initials
    );

  // 2. Recuperar el controlador en la lista enlazada
  if (!exists) {
    manager.addController({
      initials: controller.initials,
      name: controller.name,
    });
  }

  // 3. Consultar sus habilitaciones en PostgreSQL
  const ratings = await getRatingsFromDB(controller.initials);

  if (!active) return;

  // 4. Recuperar las habilitaciones en ATCManager
  for (const rating of ratings) {

    const currentController = manager.getController(
      controller.initials
    );

    const existingRating = currentController.ratings.find(
      (item) => item.code === rating.code
    );

    if (existingRating) {
      manager.updateRating(
        controller.initials,
        rating.code,
        rating.status
      );
    } else {
      manager.addRating(
        controller.initials,
        rating.code,
        rating.status
      );
    }
  }

 
  // ==========================================
// RECUPERAR CERTIFICACIÓN DE INGLÉS OACI
// ==========================================

const english = await getEnglishFromDB(
  controller.initials
);

if (!active) return;

if (english) {
  manager.updateEnglish(
    controller.initials,
    Number(english.level),
    english.evaluation_date
  );
}

// ==========================================
// RECUPERAR CERTIFICADO MÉDICO
// ==========================================

const medical = await getMedicalFromDB(
  controller.initials
);

if (!active) return;

if (medical) {
  manager.updateMedicalCertificate(
    controller.initials,
    medical.issue_date
  );
}
// ==========================================
// RECUPERAR CURSOS RECURRENTES DESDE SUPABASE
// ==========================================

const recurrentCourses = await getRecurrentFromDB(
  controller.initials
);

if (!active) return;

const currentController = manager.getController(
  controller.initials
);

// Recuperar el historial sin duplicar registros.
for (const course of recurrentCourses) {
  const exists = (
    currentController.recurrentCourses ?? []
  ).some((item) => item.id === course.id);

  if (!exists) {
    if (!Array.isArray(currentController.recurrentCourses)) {
      currentController.recurrentCourses = [];
    }

    currentController.recurrentCourses.push({
      id: course.id,
      ratingCode: course.ratingCode,
      completionDate: course.completionDate,
      expirationDate: course.expirationDate,
    });
  }
}
// ==========================================
// RECUPERAR CAPACITACIONES DESDE SUPABASE
// ==========================================

const trainings = await getTrainingsFromDB(
  controller.initials
);

if (!active) return;

const currentATC = manager.getController(
  controller.initials
);

// Recuperar el historial sin duplicar registros.
for (const training of trainings) {
  const exists = (
    currentATC.trainings ?? []
  ).some((item) => item.id === training.id);

  if (!exists) {
    if (!Array.isArray(currentATC.trainings)) {
      currentATC.trainings = [];
    }

    currentATC.trainings.push({
      id: training.id,
      courseName: training.courseName,
      completionDate: training.completionDate,
      observations: training.observations,
    });
  }
}
}
 // ==========================================
// RECUPERAR COLA FIFO DESDE POSTGRESQL
// ==========================================
// Mostrar los controladores aunque falle la recuperación FIFO.
if (active) {
  refreshData();
}
const pendingRequests = await getPendingRequestsFromDB();

if (!active) return;

// Reconstruir la cola respetando el orden de llegada.
const existingRequestIds = new Set(
  manager.getPendingRequests().map((request) => request.id)
);

for (const request of pendingRequests) {
  if (existingRequestIds.has(request.id)) {
    continue;
  }

  const controllerExists = manager
    .getControllers()
    .some((controller) => controller.initials === request.initials);

  if (!controllerExists) {
    console.warn(
      `Solicitud ${request.id}: el ATC ${request.initials} no está cargado.`
    );
    continue;
  }

  manager.addRequest(request);
  existingRequestIds.add(request.id);
}


      refreshData();
    } catch (error) {
      if (active) {
        setMessage({
          type: "error",
          text: `Error al cargar controladores: ${error.message}`,
        });
      }
    }
  };

  loadControllers();

  return () => {
    active = false;
  };
}, [manager]);

  const handleRegister = async (event) => {
  event.preventDefault();

  try {
    // 1. Normalizar los datos
    const normalizedInitials = initials.trim().toUpperCase();
    const normalizedName = name.trim();

    // 2. Validar los datos
    if (!/^[A-Z]{3}$/.test(normalizedInitials)) {
      throw new Error(
        "Las siglas deben contener exactamente tres letras."
      );
    }

    if (!normalizedName) {
      throw new Error(
        "Debe ingresar el nombre del controlador."
      );
    }

    // 3. Comprobar que no exista en la lista enlazada
    const exists = manager
      .getControllers()
      .some((controller) => controller.initials === normalizedInitials);

    if (exists) {
      throw new Error(
        "Ya existe un controlador con esas siglas."
      );
    }

    // 4. Guardar primero en PostgreSQL
    await saveControllerToDB({
      initials: normalizedInitials,
      name: normalizedName,
    });

    // 5. Agregar a nuestra lista enlazada
    manager.addController({
      initials: normalizedInitials,
      name: normalizedName,
    });

    // 6. Actualizar estadísticas e interfaz
    refreshData();

    // 7. Limpiar formulario
    setInitials("");
    setName("");

    setMessage({
      type: "success",
      text: "Controlador registrado correctamente en PostgreSQL.",
    });

  } catch (error) {
    setMessage({
      type: "error",
      text: error.message,
    });
  }
};
  const handleDelete = (controllerInitials) => {

    if (!window.confirm(`¿Deseas eliminar al controlador ${controllerInitials}?`)) return;

    try {

      manager.removeController(controllerInitials);

      refreshData();

      setMessage({

        type: "success",

        text: `Controlador ${controllerInitials} eliminado correctamente.`,

      });

    } catch (error) {

      setMessage({ type: "error", text: error.message });

    }

  };

  const operationalStatuses = controllers.map((controller) =>

    manager.getOperationalStatus(controller.initials)

  );

  const operationalCount = operationalStatuses.filter((status) => status.operational).length;

  const noopCount = operationalStatuses.length - operationalCount;

  return (

    <div className="app-container">

      <header className="app-header">

        <p className="app-eyebrow">ESTRUCTURA DE DATOS Y ALGORITMOS II</p>

        <h1>SG-ATC Cali</h1>

        <p className="app-subtitle">Sistema de Gestión de Controladores de Tránsito Aéreo</p>

        <p className="app-description">

          Administración de personal, licencias, habilitaciones y certificaciones.

        </p>

      </header>

      <section className="stats-grid">

        <div className="stat-card">

          <span className="stat-icon">👨‍✈️</span>

          <strong>{statistics.totalControllers}</strong>

          <span>Controladores registrados</span>

        </div>

        <div className="stat-card">

          <span className="stat-icon">📋</span>

          <strong>{statistics.totalLicenseRatings}</strong>

          <span>Adiciones de licencia</span>

        </div>

        <div className="stat-card">

          <span className="stat-icon">✅</span>

          <strong>{statistics.activeRatings}</strong>

          <span>Habilitaciones vigentes</span>

        </div>

        <div className="stat-card">

          <span className="stat-icon">📨</span>

          <strong>{statistics.pendingRequests}</strong>

          <span>Solicitudes pendientes</span>

        </div>

        <div className="stat-card">

          <span className="stat-icon">🟢</span>

          <strong>{operationalCount}</strong>

          <span>Controladores operativos</span>

        </div>

        <div className="stat-card">

          <span className="stat-icon">🔴</span>

          <strong>{noopCount}</strong>

          <span>Controladores NOOP</span>

        </div>

      </section>

      <section className="panel">

        <div className="panel-heading">

          <h2>➕ Registrar controlador</h2>

          <p>

            Agrega un controlador de tránsito aéreo utilizando sus tres siglas y su nombre completo.

          </p>

        </div>

        <form className="controller-form" onSubmit={handleRegister}>

          <div className="form-group">

            <label htmlFor="initials">Siglas del controlador</label>

            <input

              id="initials"

              type="text"

              placeholder="Ej. JVR"

              maxLength={3}

              value={initials}

              onChange={(event) => setInitials(event.target.value.toUpperCase())}

              required

            />

          </div>

          <div className="form-group">

            <label htmlFor="name">Nombre completo</label>

            <input

              id="name"

              type="text"

              placeholder="Ej. Jorge Luis Velásquez Reina"

              value={name}

              onChange={(event) => setName(event.target.value)}

              required

            />

          </div>

          <button className="btn btn-success" type="submit">+ Registrar controlador</button>

        </form>

        {message && (

          <div className={`message message-${message.type}`} role="status">

            {message.text}

          </div>

        )}

      </section>

      <RatingsPanel manager={manager} controllers={controllers} refreshData={refreshData} />

      <RecurrentPanel manager={manager} controllers={controllers}refreshData={refreshData}/>

      <ATCSearch manager={manager}controllers={controllers}/>

      <RequestsPanel manager={manager}controllers={controllers}refreshData={refreshData}/>

      <GraphPanel manager={manager}controllers={controllers}/>

      <PriorityPanel controllers={controllers} />

      <EnglishPanel manager={manager} controllers={controllers} refreshData={refreshData} />

      <MedicalPanel manager={manager} controllers={controllers} refreshData={refreshData} />

      <TrainingPanel manager={manager} controllers={controllers} refreshData={refreshData} />

      <section className="panel">

        <div className="panel-heading">

          <h2>🛫 Condición operativa del personal ATC</h2>

          <p>

            Consulta automáticamente qué controladores están operativos y cuáles presentan restricciones.

          </p>

        </div>

        {controllers.length === 0 ? (

          <div className="empty-state">No hay controladores registrados.</div>

        ) : (

          <div className="table-wrapper">

            <table className="controllers-table">

              <thead>

                <tr>

                  <th>ATC</th>

                  <th>Nombre</th>

                  <th>Condición</th>

                  <th>Habilitaciones operativas</th>

                  <th>Observaciones</th>

                </tr>

              </thead>

              <tbody>

                {operationalStatuses.map((operational) => (

                  <tr key={operational.initials}>

                    <td><span className="initials-badge">{operational.initials}</span></td>

                    <td>{operational.name}</td>

                    <td>

                      <span className={`status-badge ${operational.operational ? "status-active" : "status-inactive"}`}>

                        {operational.status}

                      </span>

                    </td>

                    <td>

                      {operational.activeRatings.length > 0

                        ? operational.activeRatings.join(", ")

                        : "Ninguna"}

                    </td>

                    <td>

                      {operational.operational

                        ? "Cumple los requisitos operativos."

                        : operational.reasons.join(" | ")}

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </section>

      <section className="panel">

        <div className="panel-heading">

          <h2>📋 Personal ATC registrado</h2>

          <p>Consulta los controladores registrados en SG-ATC Cali.</p>

        </div>

        {controllers.length === 0 ? (

          <div className="empty-state">No hay controladores registrados.</div>

        ) : (

          <div className="table-wrapper">

            <table className="controllers-table">

              <thead>

                <tr>

                  <th>Siglas</th>

                  <th>Nombre completo</th>

                  <th>Adiciones</th>

                  <th>Vigentes</th>

                  <th>Condición operativa</th>

                  <th>Acciones</th>

                </tr>

              </thead>

              <tbody>

                {controllers.map((controller) => {

                  const operational = manager.getOperationalStatus(controller.initials);

                  const licenseRatings = controller.ratings.filter(

                    (rating) => rating.type === "LICENCIA"

                  ).length;

                  const activeRatings = controller.ratings.filter(

                    (rating) => rating.status === "VIGENTE"

                  ).length;

                  return (

                    <tr key={controller.initials}>

                      <td><span className="initials-badge">{controller.initials}</span></td>

                      <td>{controller.name}</td>

                      <td>{licenseRatings}</td>

                      <td>{activeRatings}</td>

                      <td>

                        <span className={`status-badge ${operational.operational ? "status-active" : "status-inactive"}`}>

                          {operational.status}

                        </span>

                      </td>

                      <td>

                        <button

                          className="btn btn-danger"

                          type="button"

                          onClick={() => handleDelete(controller.initials)}

                        >

                          Eliminar

                        </button>

                      </td>

                    </tr>

                  );

                })}

              </tbody>

            </table>

          </div>

        )}

      </section>

      <footer className="app-footer">

        SG-ATC Cali · Proyecto Final · Estructura de Datos y Algoritmos II

      </footer>

    </div>

  );

}

// Autenticación centralizada: la interfaz solo se monta tras verificar permisos.
function App() {
  const [authSession, setAuthSession] = useState(undefined);
  const [authorizedSession, setAuthorizedSession] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    let mounted = true;
    // El listener también recibe la sesión inicial; no duplicamos getSession().
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        if (mounted) setAuthSession(nextSession);
      }
    );
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function authorize() {
      setAuthorizedSession(null);
      setCheckingSession(true);
      setAuthError("");

      if (authSession === undefined) return;
      if (!authSession) {
        setCheckingSession(false);
        return;
      }

      try {
        const userId = authSession.user.id;
        const [admin, demo] = await Promise.all([
          supabase.from("app_admins").select("user_id").eq("user_id", userId).maybeSingle(),
          supabase.from("app_demo_users").select("user_id").eq("user_id", userId).maybeSingle(),
        ]);
        if (cancelled) return;
        if (admin.error) throw admin.error;
        if (demo.error) throw demo.error;
        if (!admin.data && !demo.data) {
          setAuthError("Este usuario no tiene acceso autorizado.");
          return;
        }
        setAuthorizedSession(authSession);
      } catch (error) {
        if (!cancelled) setAuthError(`No se pudo verificar el acceso: ${error.message}`);
      } finally {
        if (!cancelled) setCheckingSession(false);
      }
    }

    authorize();
    return () => { cancelled = true; };
  }, [authSession]);

  async function handleLogout() {
    setAuthorizedSession(null);
    setCheckingSession(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      setAuthError(`No se pudo cerrar la sesión: ${error.message}`);
      setCheckingSession(false);
    }
  }

  if (checkingSession) {
    return <div className="app-container">Verificando sesión...</div>;
  }

  if (!authorizedSession) {
    return (
      <>
        <Login onLogin={setAuthSession} />
        {authError && <p role="alert" style={{ color: "#f87171", textAlign: "center" }}>{authError}</p>}
        {authSession && (
          <div style={{ textAlign: "center" }}>
            <button type="button" className="btn btn-danger" onClick={handleLogout}>
              Salir de esta cuenta
            </button>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 16, padding: "12px 24px", background: "#0f172a", color: "#e2e8f0" }}>
        <span>{authorizedSession.user.email}</span>
        <button type="button" className="btn btn-danger" onClick={handleLogout}>Cerrar sesión</button>
      </div>
      <Dashboard key={authorizedSession.user.id} />
    </>
  );
}

export default App;
