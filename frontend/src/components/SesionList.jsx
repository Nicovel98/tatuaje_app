import { useState } from "react";
import api from "../services/api";
import SesionModal from "./SesionModal";

export default function SesionList({
  sesiones = [],
  tatuajes = [],
  clientes = [],
  usuarios = [],
  tarifas = [],
  usuarioActivo,
  onSesionActualizada,
}) {
  const [busqueda, setBusqueda] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [sesionSeleccionada, setSesionSeleccionada] = useState(null);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  const filtradas = (sesiones || []).filter((s) => {
    const texto = busqueda.toLowerCase();
    const nombreCliente = s.cliente?.nombre || s.Cliente?.nombre || s.cliente_nombre || "";
    const disenoTatuaje = s.tatuaje?.diseno || s.Tatuaje?.diseno || s.tatuaje_diseno || "";
    const nombreTatuador = s.tatuador?.nombre || s.Usuario?.nombre || s.usuario_nombre || "";
    return (
      String(s.id_sesion).includes(texto) ||
      String(s.fecha).includes(texto) ||
      nombreCliente.toLowerCase().includes(texto) ||
      disenoTatuaje.toLowerCase().includes(texto) ||
      nombreTatuador.toLowerCase().includes(texto)
    );
  });

  const abrirModalCrear = () => {
    setSesionSeleccionada(null);
    setModalAbierto(true);
  };

  const abrirModalEditar = (s) => {
    setSesionSeleccionada(s);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setSesionSeleccionada(null);
  };

  const handleEliminar = async (id_sesion) => {
    if (!window.confirm(`¿Seguro que deseas cancelar la sesión #${id_sesion}?`)) {
      return;
    }
    try {
      await api.delete(`/sesiones/${id_sesion}`, {
        data: { usuario_modificador: usuarioActivo?.nombre || "ADMIN" },
      });
      setExito(`Sesión #${id_sesion} eliminada.`);
      setError("");
      if (onSesionActualizada) onSesionActualizada();
    } catch (err) {
      setError(err.response?.data?.error || "Error al eliminar la sesión.");
      setExito("");
    }
  };

  return (
    <div className="card-table" style={{ width: "100%" }}>
      <div className="view-header">
        <div>
          <h3 style={{ margin: 0, color: "var(--accent-color)" }}>Registro de Sesiones de Tatuaje</h3>
          <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "var(--text-muted)" }}>
            Total de sesiones programadas / realizadas: {sesiones?.length || 0}
          </p>
        </div>
        <button className="btn-crear-action" onClick={abrirModalCrear}>
          <span>+</span> Agendar Sesión
        </button>
      </div>

      {exito && <p className="exito" style={{ color: "#2ecc71", marginBottom: "12px" }}>{exito}</p>}
      {error && <p className="error" style={{ marginBottom: "12px" }}>{error}</p>}

      <input
        type="text"
        placeholder="Buscar sesión por cliente, diseño, tatuador o fecha..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        style={{
          width: "100%",
          padding: "10px 14px",
          marginBottom: "16px",
          borderRadius: "8px",
          border: "1px solid var(--border-color)",
          background: "var(--bg-input)",
          color: "var(--text-main)",
          fontSize: "13px",
          boxSizing: "border-box",
        }}
      />

      {filtradas.length === 0 ? (
        <div style={{ textAlign: "center", padding: "30px 20px", color: "var(--text-muted)" }}>
          {(!sesiones || sesiones.length === 0)
            ? "No hay sesiones agendadas en el sistema."
            : "No se encontraron sesiones con ese criterio de búsqueda."}
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th style={{ width: "80px" }}>Sesión</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Diseño / Tatuaje</th>
              <th>Tatuador</th>
              <th>Horas</th>
              <th>Valor Liquidado</th>
              <th>Anticipo</th>
              <th>Tipo</th>
              <th style={{ textAlign: "center", width: "130px" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtradas.map((s) => {
              const clienteNombre = s.cliente?.nombre || s.Cliente?.nombre || s.cliente_nombre || `Cliente #${s.cliente_id}`;
              const disenoNombre = s.tatuaje?.diseno || s.Tatuaje?.diseno || s.tatuaje_diseno || `Tatuaje #${s.tatuaje_id}`;
              const tatuadorNombre = s.tatuador?.nombre || s.Usuario?.nombre || s.usuario_nombre || `Staff #${s.usuario_id}`;

              return (
                <tr key={s.id_sesion}>
                  <td>
                    <strong style={{ color: "var(--accent-color)" }}>#{s.id_sesion}</strong>
                  </td>
                  <td>{s.fecha}</td>
                  <td>
                    <strong>{clienteNombre}</strong>
                  </td>
                  <td>{disenoNombre}</td>
                  <td>{tatuadorNombre}</td>
                  <td>{s.duracion_horas}h</td>
                  <td>
                    <strong>${Number(s.valor).toLocaleString("es-CO")}</strong>
                  </td>
                  <td>
                    {Number(s.anticipo) > 0 ? (
                      <span style={{ color: "var(--accent-color)", fontWeight: "600" }}>
                        ${Number(s.anticipo).toLocaleString("es-CO")}
                      </span>
                    ) : (
                      <span style={{ color: "var(--text-muted)" }}>$0</span>
                    )}
                  </td>
                  <td>
                    {s.es_retoque === "S" ? (
                      <span className="badge" style={{ background: "rgba(52, 152, 219, 0.2)", color: "#3498db" }}>
                        Retoque
                      </span>
                    ) : (
                      <span className="badge" style={{ background: "rgba(46, 204, 113, 0.15)", color: "#2ecc71" }}>
                        Normal
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <div style={{ display: "inline-flex", gap: "6px", alignItems: "center" }}>
                      <button
                        className="btn-edit-sm"
                        onClick={() => abrirModalEditar(s)}
                        title="Editar sesión"
                      >
                        <span>✎</span> Editar
                      </button>
                      <button
                        className="btn-danger-sm"
                        onClick={() => handleEliminar(s.id_sesion)}
                        title="Cancelar sesión"
                      >
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {/* Modal Popup para Creación y Edición */}
      <SesionModal
        isOpen={modalAbierto}
        onClose={cerrarModal}
        sesionEditar={sesionSeleccionada}
        tatuajes={tatuajes}
        clientes={clientes}
        usuarios={usuarios}
        tarifas={tarifas}
        usuarioActivo={usuarioActivo}
        onSesionGuardada={onSesionActualizada}
      />
    </div>
  );
}
