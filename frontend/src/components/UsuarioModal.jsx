import { useState, useEffect } from "react";
import api from "../services/api";
import Modal from "./Modal";

export default function UsuarioModal({
  isOpen,
  onClose,
  usuarioEditar,
  usuarioActivo,
  onGuardado,
}) {
  const [formData, setFormData] = useState({
    identificacion: "",
    nombre: "",
    correo: "",
    clave: "",
    rol: "TATUADOR",
    estado: "ACTIVO",
  });
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (usuarioEditar) {
      setFormData({
        identificacion: usuarioEditar.identificacion || "",
        nombre: usuarioEditar.nombre || "",
        correo: usuarioEditar.correo || "",
        clave: "", // Vacía para no sobreescribir salvo que escriba una nueva
        rol: usuarioEditar.rol || "TATUADOR",
        estado: usuarioEditar.estado || "ACTIVO",
      });
    } else {
      setFormData({
        identificacion: "",
        nombre: "",
        correo: "",
        clave: "",
        rol: "TATUADOR",
        estado: "ACTIVO",
      });
    }
    setError("");
  }, [usuarioEditar, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.nombre || !formData.correo || !formData.rol) {
      setError("Todos los campos obligatorios deben ser completados.");
      return;
    }

    if (!usuarioEditar && !formData.clave) {
      setError("La contraseña de acceso es requerida al registrar un nuevo usuario.");
      return;
    }

    setCargando(true);
    try {
      if (usuarioEditar) {
        const payload = {
          identificacion: formData.identificacion,
          nombre: formData.nombre,
          correo: formData.correo,
          rol: formData.rol,
          estado: formData.estado,
          usuario_modificador: usuarioActivo?.nombre || "ADMIN",
        };
        if (formData.clave && formData.clave.trim() !== "") {
          payload.clave = formData.clave;
        }

        await api.put(`/usuarios/${usuarioEditar.id_usuario}`, payload);
      } else {
        await api.post("/usuarios", {
          identificacion: formData.identificacion,
          nombre: formData.nombre,
          correo: formData.correo,
          clave: formData.clave,
          rol: formData.rol,
          usuario_creacion: usuarioActivo?.nombre || "ADMIN",
        });
      }

      if (onGuardado) onGuardado();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Error al procesar el usuario.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={usuarioEditar ? "Editar Colaborador / Usuario" : "Registrar Nuevo Colaborador"}
      subtitle={
        usuarioEditar
          ? `Modificando perfil de Colaborador #${usuarioEditar.id_usuario} (${usuarioEditar.nombre})`
          : "Ingrese los datos para registrar al colaborador."
      }
      maxWidth="520px"
    >
      {error && <p className="error" style={{ marginBottom: "14px" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
            Número de Identificación (C.C. / DNI)
          </label>
          <input
            type="text"
            placeholder="ej. 1020304050"
            value={formData.identificacion}
            onChange={(e) => setFormData({ ...formData, identificacion: e.target.value })}
          />
        </div>

        <div>
          <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
            Nombre Completo
          </label>
          <input
            type="text"
            placeholder="ej. Laura Artista"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            required
          />
        </div>

        <div>
          <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
            Correo Electrónico (Login)
          </label>
          <input
            type="email"
            placeholder="ej. laura@estudio.com"
            value={formData.correo}
            onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
            required
          />
        </div>

        <div>
          <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
            {usuarioEditar ? "Nueva Contraseña (Opcional si no deseas cambiarla)" : "Contraseña de Acceso"}
          </label>
          <input
            type="password"
            placeholder={usuarioEditar ? "Dejar en blanco para mantener la actual" : "Ingresa una contraseña segura"}
            value={formData.clave}
            onChange={(e) => setFormData({ ...formData, clave: e.target.value })}
            required={!usuarioEditar}
          />
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
              Rol en el Sistema
            </label>
            <select
              value={formData.rol}
              onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
            >
              <option value="TATUADOR">TATUADOR</option>
              <option value="ADMINISTRADOR">ADMINISTRADOR</option>
            </select>
          </div>

          {usuarioEditar && (
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                Estado de la Cuenta
              </label>
              <select
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
              >
                <option value="ACTIVO">ACTIVO</option>
                <option value="INACTIVO">INACTIVO</option>
              </select>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={cargando}>
            Cancelar
          </button>
          <button type="submit" className="btn-primary" disabled={cargando}>
            {cargando ? "Guardando..." : usuarioEditar ? "Guardar Cambios" : "Crear Colaborador"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
