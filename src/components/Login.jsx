// ==========================================
// SG-ATC CALI
// INICIO DE SESIÓN
// Supabase Authentication
// ==========================================

import { useState } from "react";
import { supabase } from "../lib/supabase.js";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (loginError) {
        throw loginError;
      }

      if (!data.session) {
        throw new Error(
          "No se pudo iniciar la sesión."
        );
      }

      onLogin(data.session);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#020617",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          padding: "36px",
          backgroundColor: "#0f172a",
          border: "1px solid #334155",
          borderRadius: "16px",
          color: "#e2e8f0",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            color: "#38bdf8",
            marginBottom: "8px",
          }}
        >
          SG-ATC CALI
        </h1>

        <p
          style={{
            textAlign: "center",
            marginBottom: "30px",
            color: "#94a3b8",
          }}
        >
          Sistema de Gestión de Controladores
          de Tránsito Aéreo
        </p>

        <h2
          style={{
            marginBottom: "20px",
            fontSize: "20px",
          }}
        >
          Inicio de sesión
        </h2>

        <form onSubmit={handleLogin}>
          <div
            className="form-group"
            style={{ marginBottom: "18px" }}
          >
            <label htmlFor="loginEmail">
              Correo electrónico
            </label>

            <input
              id="loginEmail"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="correo@ejemplo.com"
              autoComplete="username"
              required
            />
          </div>

          <div
            className="form-group"
            style={{ marginBottom: "24px" }}
          >
            <label htmlFor="loginPassword">
              Contraseña
            </label>

            <input
              id="loginPassword"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Ingresa tu contraseña"
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <div
              className="message message-error"
              role="alert"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: "100%" }}
          >
            {loading
              ? "Iniciando sesión..."
              : "Ingresar al sistema"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
