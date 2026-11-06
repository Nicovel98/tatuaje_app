import { useState, useEffect } from "react";
import axios from "axios";

export default function UsuarioForm({ onUsuarioCreado }) {
  const [formData, setFormData] = useState({
    id_usuario: "",
    nombre: "",
    correo: "",
    clave: "",
    rol: "TATUADOR",
  });
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [siguienteId, setSiguienteId] = useState(null);

  const cargarSiguienteId = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/usuarios/siguiente-id");
      setSiguienteId(res.data.siguiente);
    } catch (err) {
      console.error("Error cargando siguiente ID de usuario", err);
    }
  };

  useEffect(() => {
    let cancel = false;
    const fetchSiguiente = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/usuarios/siguiente-id");
        if (!cancel) setSiguienteId(res.data.siguiente);
      } catch (err) {
        console.error("Error cargando siguiente ID de usuario", err);
      }
    };
    fetchSiguiente();
    return () => { cancel = true; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.id_usuario) {
      setError("El ID o documento del colaborador es obligatorio.");
      return;
    }
    if (!formData.nombre.trim()) {
      setError("El nombre completo es obligatorio.");
      return;
    }
    if (!formData.correo.trim()) {
      setError("El correo electrónico es obligatorio.");
      return;
    }

    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexCorreo.test(formData.correo.trim())) {
      setError("El formato del correo electrónico no es válido.");
      return;
    }

    if (!formData.clave.trim()) {
      setError("La contraseña de acceso es obligatoria.");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/usuarios", {
        id_usuario: formData.id_usuario,
        nombre: formData.nombre.trim(),
        correo: formData.correo.trim(),
        clave: formData.clave.trim(),
        rol: formData.rol,
      });
      setMensaje("¡Colaborador registrado con éxito en el personal activo!");
      setError("");
      setFormData({
        id_usuario: "",
        nombre: "",
        correo: "",
        clave: "",
        rol: "TATUADOR",
      });
      cargarSiguienteId();
      if (onUsuarioCreado) onUsuarioCreado();
    } catch (err) {
      setMensaje("");
      setError(
        err.response?.data?.error || "Error al registrar el colaborador",
      );
    }
  };

  return (
    <div className="card-form">
      <h3>Registrar Nuevo Tatuador / Staff (HU-11)</h3>
      {mensaje && (
        <p className="exito" style={{ color: "#2ecc71", fontWeight: "bold" }}>
          {mensaje}
        </p>
      )}
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ position: "relative" }}>
          <input
            type="number"
            placeholder="ID Usuario / Cédula"
            value={formData.id_usuario}
            onChange={(e) =>
              setFormData({ ...formData, id_usuario: e.target.value })
            }
          />
          {siguienteId && !formData.id_usuario && (
            <button
              type="button"
              onClick={() => setFormData({ ...formData, id_usuario: String(siguienteId) })}
              style={{
                position: "absolute",
                right: "8px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "rgba(244, 208, 63, 0.15)",
                color: "var(--accent-color)",
                border: "1px solid var(--accent-color)",
                borderRadius: "6px",
                padding: "4px 10px",
                fontSize: "11px",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              Siguiente: #{siguienteId}
            </button>
          )}
        </div>
        <input
          type="text"
          placeholder="Nombre completo"
          value={formData.nombre}
          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
        />
        <input
          type="text"
          placeholder="Correo electrónico"
          value={formData.correo}
          onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
        />
        <input
          type="password"
          placeholder="Contraseña de acceso inicial"
          value={formData.clave}
          onChange={(e) => setFormData({ ...formData, clave: e.target.value })}
        />

        <select
          value={formData.rol}
          onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
        >
          <option value="TATUADOR">TATUADOR</option>
          <option value="ADMINISTRADOR">ADMINISTRADOR</option>
        </select>

        <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: "4px 0" }}>
          Nota: Se añade a la lista de personal activo con credenciales seguras.
        </p>

        <button type="submit">Dar de Alta Colaborador</button>
      </form>
    </div>
  );
}
