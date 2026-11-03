import { useState } from "react";
import axios from "axios";

export default function LoginForm({ onLoginExitoso }) {
  const [modo, setModo] = useState("login"); // 'login' o 'registro'
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");

  // Estado para registro de nuevo usuario
  const [registroData, setRegistroData] = useState({
    id_usuario: "",
    nombre: "",
    correo: "",
    clave: "",
    rol: "TATUADOR",
  });

  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setExito("");

    if (!correo || !clave) {
      setError("Por favor diligencie todos los campos.");
      return;
    }

    try {
      setCargando(true);
      const respuesta = await axios.post("http://localhost:5000/api/login", {
        correo,
        clave,
      });
      setError("");
      onLoginExitoso(respuesta.data.usuario);
    } catch (err) {
      setError(err.response?.data?.error || "Credenciales incorrectas");
    } finally {
      setCargando(false);
    }
  };

  const handleRegistro = async (e) => {
    e.preventDefault();
    setError("");
    setExito("");

    if (
      !registroData.id_usuario ||
      !registroData.nombre ||
      !registroData.correo ||
      !registroData.clave
    ) {
      setError("Por favor completa todos los campos para el registro.");
      return;
    }

    try {
      setCargando(true);
      // 1. Crear el usuario en la BD mediante el endpoint POST /api/usuarios
      await axios.post("http://localhost:5000/api/usuarios", {
        ...registroData,
        id_usuario: parseInt(registroData.id_usuario),
        usuario_creacion: "AUTOREGISTRO",
      });

      // 2. Intentar loguear automáticamente con las nuevas credenciales
      const loginRes = await axios.post("http://localhost:5000/api/login", {
        correo: registroData.correo,
        clave: registroData.clave,
      });

      setExito("¡Cuenta creada exitosamente! Ingresando...");
      setTimeout(() => {
        onLoginExitoso(loginRes.data.usuario);
      }, 700);
    } catch (err) {
      setError(
        err.response?.data?.error || "Error al crear la cuenta de usuario."
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-card" style={{ maxWidth: modo === "registro" ? "440px" : "380px" }}>
      {/* Selector de Modo (Tabs) */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid var(--border-color)",
          marginBottom: "20px",
          gap: "10px",
        }}
      >
        <button
          type="button"
          onClick={() => {
            setModo("login");
            setError("");
            setExito("");
          }}
          style={{
            flex: 1,
            background: "none",
            border: "none",
            borderBottom: modo === "login" ? "2px solid var(--accent-color)" : "2px solid transparent",
            color: modo === "login" ? "var(--accent-color)" : "var(--text-muted)",
            fontWeight: modo === "login" ? "700" : "400",
            padding: "10px 0",
            cursor: "pointer",
            fontSize: "14px",
            borderRadius: 0,
          }}
        >
          Iniciar Sesión
        </button>
        <button
          type="button"
          onClick={() => {
            setModo("registro");
            setError("");
            setExito("");
          }}
          style={{
            flex: 1,
            background: "none",
            border: "none",
            borderBottom: modo === "registro" ? "2px solid var(--accent-color)" : "2px solid transparent",
            color: modo === "registro" ? "var(--accent-color)" : "var(--text-muted)",
            fontWeight: modo === "registro" ? "700" : "400",
            padding: "10px 0",
            cursor: "pointer",
            fontSize: "14px",
            borderRadius: 0,
          }}
        >
          Crear Cuenta
        </button>
      </div>

      <h2 style={{ fontSize: "1.3rem", marginBottom: "20px" }}>
        {modo === "login" ? "Estudio de Tatuajes — Ingreso" : "Registro de Nuevo Usuario"}
      </h2>

      {error && <p className="error">{error}</p>}
      {exito && <p className="exito" style={{ color: "#2ecc71", textAlign: "center", marginBottom: "12px" }}>{exito}</p>}

      {modo === "login" ? (
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Correo electrónico"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            required
          />
          <button type="submit" disabled={cargando}>
            {cargando ? "Ingresando..." : "Ingresar"}
          </button>

          <p style={{ textAlign: "center", marginTop: "18px", fontSize: "13px", color: "var(--text-muted)" }}>
            ¿No tienes cuenta?{" "}
            <span
              onClick={() => {
                setModo("registro");
                setError("");
                setExito("");
              }}
              style={{ color: "var(--accent-color)", cursor: "pointer", fontWeight: "600" }}
            >
              Regístrate aquí
            </span>
          </p>

          <div style={{ marginTop: "16px", padding: "10px", background: "rgba(255,255,255,0.02)", borderRadius: "6px", fontSize: "11px", color: "var(--text-muted)", textAlign: "center" }}>
            Credenciales demo: <strong>admin@estudio.com</strong> / <strong>admin123</strong>
          </div>
        </form>
      ) : (
        <form onSubmit={handleRegistro}>
          <input
            type="number"
            placeholder="ID Usuario / Cédula (ej. 102)"
            value={registroData.id_usuario}
            onChange={(e) =>
              setRegistroData({ ...registroData, id_usuario: e.target.value })
            }
            required
          />
          <input
            type="text"
            placeholder="Nombre completo"
            value={registroData.nombre}
            onChange={(e) =>
              setRegistroData({ ...registroData, nombre: e.target.value })
            }
            required
          />
          <input
            type="email"
            placeholder="Correo electrónico"
            value={registroData.correo}
            onChange={(e) =>
              setRegistroData({ ...registroData, correo: e.target.value })
            }
            required
          />
          <input
            type="password"
            placeholder="Contraseña de acceso"
            value={registroData.clave}
            onChange={(e) =>
              setRegistroData({ ...registroData, clave: e.target.value })
            }
            required
          />

          <label style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
            Rol en el Estudio
          </label>
          <select
            value={registroData.rol}
            onChange={(e) =>
              setRegistroData({ ...registroData, rol: e.target.value })
            }
          >
            <option value="TATUADOR">TATUADOR (Artista)</option>
            <option value="ADMINISTRADOR">ADMINISTRADOR</option>
          </select>

          <button type="submit" disabled={cargando} style={{ marginTop: "10px" }}>
            {cargando ? "Registrando..." : "Crear Cuenta e Ingresar"}
          </button>

          <p style={{ textAlign: "center", marginTop: "18px", fontSize: "13px", color: "var(--text-muted)" }}>
            ¿Ya tienes cuenta?{" "}
            <span
              onClick={() => {
                setModo("login");
                setError("");
                setExito("");
              }}
              style={{ color: "var(--accent-color)", cursor: "pointer", fontWeight: "600" }}
            >
              Inicia sesión
            </span>
          </p>
        </form>
      )}
    </div>
  );
}
