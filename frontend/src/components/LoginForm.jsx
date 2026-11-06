import { useState } from "react";
import axios from "axios";

export default function LoginForm({ onLoginExitoso }) {
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mostrarClave, setMostrarClave] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!correo || !clave) {
      setError("Por favor diligencie todos los campos.");
      return;
    }

    setCargando(true);
    setError("");
    try {
      const respuesta = await axios.post("http://localhost:5000/api/login", {
        correo,
        clave,
      });
      onLoginExitoso(respuesta.data.usuario);
    } catch (err) {
      setError(err.response?.data?.error || "Credenciales incorrectas");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-card">
      <div style={{ textAlign: "center", marginBottom: "28px" }}>
        <svg width="48" height="48" viewBox="0 0 100 100" style={{ display: "block", margin: "0 auto 12px" }}>
          <circle cx="50" cy="50" r="48" fill="none" stroke="var(--accent-color)" strokeWidth="1.5"/>
          <g transform="translate(50,50)" fill="none" stroke="var(--accent-color)" strokeWidth="1.2" strokeLinecap="round">
            <ellipse rx="12" ry="18" transform="rotate(0)" opacity="0.9"/>
            <ellipse rx="12" ry="18" transform="rotate(60)" opacity="0.9"/>
            <ellipse rx="12" ry="18" transform="rotate(120)" opacity="0.9"/>
            <ellipse rx="12" ry="18" transform="rotate(180)" opacity="0.9"/>
            <ellipse rx="12" ry="18" transform="rotate(240)" opacity="0.9"/>
            <circle r="5" fill="var(--accent-color)" stroke="none" opacity="0.8"/>
          </g>
        </svg>
        <h2 style={{ margin: 0, fontSize: "1.5rem", color: "var(--accent-color)", letterSpacing: "2px" }}>ART INK</h2>
        <p style={{ margin: "4px 0 0", fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1.5px" }}>
          Tattoo Studio — Acceso
        </p>
      </div>

      {error && (
        <p
          role="alert"
          style={{
            color: "var(--color-danger)",
            background: "rgba(231, 76, 60, 0.1)",
            border: "1px solid rgba(231, 76, 60, 0.3)",
            borderRadius: "6px",
            padding: "10px 14px",
            fontSize: "13px",
            marginBottom: "16px",
          }}
        >
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label
            htmlFor="login-correo"
            style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", marginBottom: "4px", display: "block" }}
          >
            Correo Electrónico
          </label>
          <input
            id="login-correo"
            type="email"
            placeholder="usuario@estudio.com"
            value={correo}
            autoComplete="email"
            onChange={(e) => setCorreo(e.target.value)}
          />
        </div>

        <div className="form-group" style={{ position: "relative" }}>
          <label
            htmlFor="login-clave"
            style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", marginBottom: "4px", display: "block" }}
          >
            Contraseña
          </label>
          <div style={{ position: "relative" }}>
            <input
              id="login-clave"
              type={mostrarClave ? "text" : "password"}
              placeholder="••••••••"
              value={clave}
              autoComplete="current-password"
              onChange={(e) => setClave(e.target.value)}
              style={{ paddingRight: "44px" }}
            />
            <button
              type="button"
              onClick={() => setMostrarClave(!mostrarClave)}
              aria-label={mostrarClave ? "Ocultar contraseña" : "Mostrar contraseña"}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--text-muted)",
                fontSize: "16px",
                padding: "0",
                lineHeight: 1,
              }}
            >
              {mostrarClave ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={cargando}
          style={{ marginTop: "8px", width: "100%", opacity: cargando ? 0.7 : 1 }}
        >
          {cargando ? "Verificando..." : "Ingresar al Sistema"}
        </button>
      </form>
    </div>
  );
}
