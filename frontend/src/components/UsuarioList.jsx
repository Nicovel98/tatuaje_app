import { useState } from "react";
import api from "../services/api";
import UsuarioModal from "./UsuarioModal";

export default function UsuarioList({ usuarios, onUsuarioActualizado, usuarioActivo }) {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  const abrirModalCrear = () => {
    setUsuarioSeleccionado(null);
    setModalAbierto(true);
  };

  const abrirModalEditar = (u) => {
    setUsuarioSeleccionado(u);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setUsuarioSeleccionado(null);
  };

  const handleEliminar = async (id_usuario, nombre) => {
    if (!window.confirm(`¿Seguro que deseas dar de baja (inactivar) al colaborador ${nombre}?`)) {
      return;
    }

    try {
      await api.delete(`/usuarios/${id_usuario}`, {
        data: { usuario_modificador: usuarioActivo?.nombre || "ADMIN" },
      });
      setExito(`Colaborador ${nombre} inactivado con éxito.`);
      setError("");
      if (onUsuarioActualizado) onUsuarioActualizado();
    } catch (err) {
      setError(err.response?.data?.error || "Error al eliminar el colaborador.");
      setExito("");
    }
  };

  return (
    <div className="card-table" style={{ width: "100%" }}>
      <div className="view-header">
        <div>
          <h3 style={{ margin: 0, color: "var(--accent-color)" }}>Equipo de Trabajo y Colaboradores</h3>
          <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "var(--text-muted)" }}>
            Total de colaboradores activos: {usuarios?.length || 0}
          </p>
        </div>
        <button className="btn-crear-action" onClick={abrirModalCrear}>
          <span>+</span> Nuevo Colaborador
        </button>
      </div>

      {exito && <p className="exito" style={{ color: "#2ecc71", marginBottom: "12px" }}>{exito}</p>}
      {error && <p className="error" style={{ marginBottom: "12px" }}>{error}</p>}

      <table>
        <thead>
          <tr>
            <th style={{ width: "120px" }}>Identificación</th>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Creado Por</th>
            <th style={{ textAlign: "center", width: "140px" }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios && usuarios.length > 0 ? (
            usuarios.map((u) => (
              <tr key={u.id_usuario}>
                <td>
                  <strong style={{ color: "var(--accent-color)" }}>
                    {u.identificacion || `#${u.id_usuario}`}
                  </strong>
                </td>
                <td><strong>{u.nombre}</strong></td>
                <td>{u.correo}</td>
                <td>
                  <span className={`tag-rol tag-${u.rol?.toLowerCase()}`}>
                    {u.rol}
                  </span>
                </td>
                <td>
                  <span className={`badge ${u.estado === "ACTIVO" ? "badge-activo" : "badge-inactivo"}`}>
                    {u.estado}
                  </span>
                </td>
                <td style={{ color: "var(--text-muted)", fontSize: "12px" }}>
                  {u.usuario_creacion || "SISTEMA"}
                </td>
                <td style={{ textAlign: "center" }}>
                  <div style={{ display: "inline-flex", gap: "6px", alignItems: "center" }}>
                    <button
                      className="btn-edit-sm"
                      onClick={() => abrirModalEditar(u)}
                      title="Editar usuario"
                    >
                      <span>✎</span> Editar
                    </button>
                    {u.id_usuario !== usuarioActivo?.id_usuario && (
                      <button
                        className="btn-danger-sm"
                        onClick={() => handleEliminar(u.id_usuario, u.nombre)}
                        title="Inactivar usuario"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>
                No hay colaboradores registrados.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modal Popup para Creación y Edición */}
      <UsuarioModal
        isOpen={modalAbierto}
        onClose={cerrarModal}
        usuarioEditar={usuarioSeleccionado}
        usuarioActivo={usuarioActivo}
        onGuardado={onUsuarioActualizado}
      />
    </div>
  );
}
