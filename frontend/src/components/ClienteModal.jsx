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

    if (!formData.nombre || !formData.telefono || !formData.correo) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    setCargando(true);
    try {
      if (clienteEditar) {
        // Modo Edición
        await api.put(`/clientes/${clienteEditar.id_cliente}`, {
          nombre: formData.nombre,
          telefono: formData.telefono,
          correo: formData.correo,
          usuario_modificador: usuarioActivo?.nombre || "ADMIN",
        });
      } else {
        // Modo Creación
        await api.post("/clientes", {
          nombre: formData.nombre,
          telefono: formData.telefono,
          correo: formData.correo,
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
            placeholder="ej. Juan Pérez"
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
            placeholder="ej. 3001234567"
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
            placeholder="ej. juan@gmail.com"
            value={formData.correo}
            onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
            required
          />
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={cargando}>
            Cancelar
          </button>
          <button type="submit" className="btn-primary" disabled={cargando}>
            {cargando ? "Guardando..." : clienteEditar ? "Guardar Cambios" : "Crear Cliente"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
