import { useState } from "react";
import axios from "axios";
import TatuajeModal from "./TatuajeModal";

export default function TatuajeList({ tatuajes, onTatuajeActualizado, usuarioActivo }) {
  const [busqueda, setBusqueda] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [tatuajeSeleccionado, setTatuajeSeleccionado] = useState(null);

  const filtrados = (tatuajes || []).filter((t) => {
    const texto = busqueda.toLowerCase();
    return (
      (t.diseno || "").toLowerCase().includes(texto) ||
      (t.zona_cuerpo || "").toLowerCase().includes(texto) ||
      (t.estado || "").toLowerCase().includes(texto) ||
      String(t.id_tatuaje).includes(texto)
    );
  });

  const abrirModalCrear = () => {
    setTatuajeSeleccionado(null);
    setModalAbierto(true);
  };

  const abrirModalEditar = (t) => {
    setTatuajeSeleccionado(t);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setTatuajeSeleccionado(null);
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      await axios.put(`http://localhost:5000/api/tatuajes/${id}/estado`, {
        estado: nuevoEstado,
        usuario_modificador: usuarioActivo?.nombre || "ADMIN",
      });
      if (onTatuajeActualizado) onTatuajeActualizado();
    } catch (err) {
      alert("Error al actualizar estado: " + (err.response?.data?.error || err.message));
    }
  };

  // Siguiente ID sugerido
  const ids = (tatuajes || []).map((t) => Number(t.id_tatuaje)).filter((id) => !isNaN(id));
  const maxId = ids.length > 0 ? Math.max(...ids) : 200;
  const siguienteIdSugerido = String(maxId + 1);

  return (
    <div className="card-list" style={{ width: "100%", display: "flex", flexDirection: "column" }}>
      <div className="view-header">
        <div>
          <h3 style={{ margin: 0, color: "var(--accent-color)" }}>Catálogo de Diseños y Tatuajes</h3>
          <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "var(--text-muted)" }}>
            Total de proyectos registrados: {tatuajes?.length || 0}
          </p>
        </div>
        <button className="btn-crear-action" onClick={abrirModalCrear}>
          <span>+</span> Nuevo Tatuaje
        </button>
      </div>

      <input
        type="text"
        placeholder="Buscar por diseño, zona, estado o ID..."
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

      {filtrados.length === 0 ? (
        <div style={{ textAlign: "center", padding: "30px 20px", color: "var(--text-muted)" }}>
          {(!tatuajes || tatuajes.length === 0)
            ? "No hay tatuajes registrados en el catálogo."
            : "Sin resultados para el criterio de búsqueda."}
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: "auto", paddingRight: "4px" }}>
          <div className="grid-tatuajes">
            {filtrados.map((t) => (
              <div key={t.id_tatuaje} className="tatuaje-item">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <h4 style={{ margin: 0, fontSize: "15px" }}>{t.diseno}</h4>
                  <span style={{
                    fontSize: "11px",
                    color: "var(--accent-color)",
                    fontWeight: "700",
                    background: "rgba(244, 208, 63, 0.12)",
                    padding: "3px 8px",
                    borderRadius: "4px",
                    border: "1px solid rgba(244, 208, 63, 0.25)",
                  }}>
                    ID: {t.id_tatuaje}
                  </span>
                </div>

                <div style={{ fontSize: "13px", display: "flex", flexDirection: "column", gap: "4px", color: "var(--text-muted)" }}>
                  <p style={{ margin: 0 }}>
                    <strong style={{ color: "var(--text-main)" }}>Zona:</strong> {t.zona_cuerpo}
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong style={{ color: "var(--text-main)" }}>Horas:</strong> {t.horas_estimadas}h
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong style={{ color: "var(--text-main)" }}>Valor Total:</strong> ${Number(t.valor_estimado).toLocaleString("es-CO")}
                  </p>
                  {Number(t.anticipo) > 0 && (
                    <p style={{ margin: 0 }}>
                      <strong style={{ color: "var(--text-main)" }}>Anticipo:</strong> ${Number(t.anticipo).toLocaleString("es-CO")}
                    </p>
                  )}
                </div>

                <div style={{ marginTop: "14px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", borderTop: "1px solid var(--border-color)", paddingTop: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span className={`badge ${t.estado}`}>{t.estado}</span>
                    <select
                      value={t.estado}
                      onChange={(e) => cambiarEstado(t.id_tatuaje, e.target.value)}
                      style={{ fontSize: "11px", padding: "4px 6px" }}
                      title="Cambio rápido de estado"
                    >
                      <option value="PENDIENTE">PENDIENTE</option>
                      <option value="EN_PROGRESO">EN_PROGRESO</option>
                      <option value="FINALIZADO">FINALIZADO</option>
                      <option value="CANCELADO">CANCELADO</option>
                    </select>
                  </div>

                  <button
                    className="btn-edit-sm"
                    onClick={() => abrirModalEditar(t)}
                    title="Editar diseño completo"
                  >
                    <span>&#9998;</span> Editar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Popup para Creación y Edición */}
      <TatuajeModal
        isOpen={modalAbierto}
        onClose={cerrarModal}
        tatuajeEditar={tatuajeSeleccionado}
        usuarioActivo={usuarioActivo}
        onGuardado={onTatuajeActualizado}
      />
    </div>
  );
}
