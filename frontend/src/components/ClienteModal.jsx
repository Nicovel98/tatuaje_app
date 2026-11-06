import { useState, useEffect } from "react";
import api from "../services/api";
import Modal from "./Modal";

export default function ClienteModal({
  isOpen,
  onClose,
  clienteEditar,
  usuarioActivo,
  onGuardado,
}) {
  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    correo: "",
  });
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (clienteEditar) {
      setFormData({
        nombre: clienteEditar.nombre || "",
        telefono: clienteEditar.telefono || "",
        correo: clienteEditar.correo || "",
      });
    } else {
      setFormData({
        nombre: "",
        telefono: "",
        correo: "",
      });
    }
    setError("");
  }, [clienteEditar, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const nombreTrim = (formData.nombre || "").trim();
    const telTrim = (formData.telefono || "").trim();
    const correoTrim = (formData.correo || "").trim();

    if (!nombreTrim || !telTrim || !correoTrim) {
      setError("El nombre, teléfono y correo son obligatorios y no pueden consistir solo en espacios.");
      return;
    }

    setCargando(true);
    try {
      if (clienteEditar) {
        // Modo Edición
        await api.put(`/clientes/${clienteEditar.id_cliente}`, {
          nombre: nombreTrim,
          telefono: telTrim,
          correo: correoTrim,
          usuario_modificador: usuarioActivo?.nombre || "ADMIN",
        });
      } else {
        // Modo Creación
        await api.post("/clientes", {
          nombre: nombreTrim,
          telefono: telTrim,
          correo: correoTrim,
          usuario_creacion: usuarioActivo?.nombre || "ADMIN",
        });
      }

      if (onGuardado) onGuardado();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Error al procesar la solicitud del cliente.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={clienteEditar ? "Editar Información del Cliente" : "Registrar Nuevo Cliente"}
      subtitle={
        clienteEditar
          ? `Modificando registro de Cliente #${clienteEditar.id_cliente}`
          : "Ingrese los datos de contacto del cliente para su registro."
      }
      maxWidth="500px"
    >
      {error && <p className="error" style={{ marginBottom: "14px" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        {clienteEditar && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Cliente:</span>
            <span style={{
              fontSize: "12px",
              fontWeight: "700",
              color: "var(--accent-color)",
              background: "rgba(244, 208, 63, 0.12)",
              padding: "2px 8px",
              borderRadius: "4px",
            }}>
              #{clienteEditar.id_cliente}
            </span>
          </div>
        )}

        <div>
          <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
            Nombre Completo
          </label>
          <input
            type="text"
            placeholder="ej. Laura Gómez"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            required
          />
        </div>

        <div>
          <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
            Teléfono de Contacto
          </label>
          <input
            type="text"
            placeholder="ej. 3104567890"
            value={formData.telefono}
            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
            required
          />
        </div>

        <div>
          <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
            Correo Electrónico
          </label>
          <input
            type="email"
            placeholder="ej. laura@mail.com"
            value={formData.correo}
            onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
            required
          />
        </div>

        <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
          <button type="submit" disabled={cargando} style={{ flex: 1 }}>
            {cargando ? "Guardando..." : clienteEditar ? "Guardar Cambios" : "Guardar Cliente"}
          </button>
          <button type="button" onClick={onClose} className="btn-cancel" style={{ flex: 1 }}>
            Cancelar
          </button>
        </div>
      </form>
    </Modal>
  );
}
