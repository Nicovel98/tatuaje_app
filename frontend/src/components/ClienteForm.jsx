import { useState } from "react";
import axios from "axios";

export default function ClienteForm({ onClienteCreado }) {
  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    correo: "",
  });
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [guardando, setGuardando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nombre.trim()) {
      setError("El nombre del cliente es obligatorio.");
      return;
    }
    if (!formData.telefono.trim()) {
      setError("El teléfono de contacto es obligatorio.");
      return;
    }
    if (!formData.correo.trim()) {
      setError("El correo electrónico es obligatorio.");
      return;
    }

    setGuardando(true);
    try {
      await axios.post("http://localhost:5000/api/clientes", {
        nombre: formData.nombre.trim(),
        telefono: formData.telefono.trim(),
        correo: formData.correo.trim(),
      });
      setExito("Cliente registrado con éxito en el sistema.");
      setError("");
      setFormData({ nombre: "", telefono: "", correo: "" });
      if (onClienteCreado) onClienteCreado();
    } catch (err) {
      setExito("");
      setError(
        err.response?.data?.error ||
          "Error al registrar el cliente en el sistema.",
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="card-form">
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
        <div style={{
          width: "36px", height: "36px", borderRadius: "8px",
          background: "rgba(244, 208, 63, 0.12)", color: "var(--accent-color)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: "bold"
        }}>
          👤
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: "16px" }}>Nuevo Cliente</h3>
          <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--text-muted)" }}>
            Registra los datos de contacto del cliente
          </p>
        </div>
      </div>

      {error && <p className="error">{error}</p>}
      {exito && (
        <p className="exito" style={{ color: "#2ecc71", fontWeight: "bold" }}>
          {exito}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="nombre" style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", marginBottom: "4px", display: "block" }}>
            Nombre Completo *
          </label>
          <input
            id="nombre"
            type="text"
            placeholder="Ej: Laura Gómez"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label htmlFor="cliente-telefono" style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", marginBottom: "4px", display: "block" }}>
            Teléfono de Contacto / WhatsApp *
          </label>
          <input
            id="cliente-telefono"
            type="text"
            placeholder="Ej: 3104567890"
            value={formData.telefono}
            onChange={(e) =>
              setFormData({ ...formData, telefono: e.target.value })
            }
          />
        </div>

        <div className="form-group">
          <label htmlFor="cliente-correo" style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", marginBottom: "4px", display: "block" }}>
            Correo Electrónico *
          </label>
          <input
            id="cliente-correo"
            type="email"
            placeholder="Ej: laura@correo.com"
            value={formData.correo}
            onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
          />
        </div>

        <button type="submit" disabled={guardando} style={{ marginTop: "6px" }}>
          {guardando ? "Registrando..." : "Guardar Cliente"}
        </button>
      </form>
    </div>
  );
}
