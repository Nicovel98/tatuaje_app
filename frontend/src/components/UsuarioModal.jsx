import { useState, useEffect } from "react";
import axios from "axios";
import Modal from "./Modal";

export default function UsuarioModal({
  isOpen,
  onClose,
  usuarioEditar,
  usuarioActivo,
  onGuardado,
}) {
  const [formData, setFormData] = useState({
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
        nombre: usuarioEditar.nombre || "",
        correo: usuarioEditar.correo || "",
        clave: "", // Vacía para no sobreescribir salvo que escriba una nueva
        rol: usuarioEditar.rol || "TATUADOR",
        estado: usuarioEditar.estado || "ACTIVO",
      });
    } else {
      setFormData({
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
          nombre: formData.nombre,
          correo: formData.correo,
          rol: formData.rol,
          estado: formData.estado,
          usuario_modificador: usuarioActivo?.nombre || "ADMIN",
        };
        if (formData.clave && formData.clave.trim() !== "") {
          payload.clave = formData.clave;
        }

        await axios.put(`http://localhost:5000/api/usuarios/${usuarioEditar.id_usuario}`, payload);
      } else {
        // ID autoincremental en base de datos
        await axios.post("http://localhost:5000/api/usuarios", {
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
          : "Ingrese los datos del miembro del staff. El identificador será generado automáticamente por el sistema."
      }
      maxWidth="520px"
    >
      {error && <p className="error" style={{ marginBottom: "14px" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        {usuarioEditar && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>ID Colaborador:</span>
            <span style={{
              fontSize: "12px",
              fontWeight: "700",
              color: "var(--accent-color)",
              background: "rgba(244, 208, 63, 0.12)",
              padding: "2px 8px",
              borderRadius: "4px",
            }}>
              #{usuarioEditar.id_usuario} (Autoincremental)
            </span>
          </div>
        )}

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
            {usuarioEditar ? "Nueva Contraseña (dejar en blanco para mantener la actual)" : "Contraseña de Acceso"}
          </label>
          <input
            type="password"
            placeholder={usuarioEditar ? "••••••••" : "Contraseña segura"}
            value={formData.clave}
            onChange={(e) => setFormData({ ...formData, clave: e.target.value })}
            required={!usuarioEditar}
          />
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
              Rol en el Estudio
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
                Estado
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
            {cargando ? "Guardando..." : usuarioEditar ? "Guardar Cambios" : "Dar de Alta"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
