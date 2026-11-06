import { useState } from "react";
import axios from "axios";

export default function TarifaList({ tarifas, onTarifaActualizada }) {
  const [editando, setEditando] = useState(null);
  const [editData, setEditData] = useState({});

  const iniciarEdicion = (t) => {
    setEditando(t.id_tarifa);
    setEditData({ tipo_trabajo: t.tipo_trabajo, valor_hora: t.valor_hora, tatuador_nombre: t.tatuador_nombre || "" });
  };

  const guardarEdicion = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/tarifas/${id}`, editData);
      setEditando(null);
      if (onTarifaActualizada) onTarifaActualizada();
    } catch (err) {
      alert(err.response?.data?.error || "Error al actualizar");
    }
  };

  return (
    <div className="card-list">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "16px" }}>Catálogo de Tarifas y Especialidades</h3>
          <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--text-muted)" }}>
            {tarifas.length} tarifas configuradas
          </p>
        </div>
      </div>

      {tarifas.length === 0 ? (
        <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "20px 0" }}>
          No hay tarifas configuradas en el catálogo.
        </p>
      ) : (
        <ul style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {tarifas.map((t) => (
            <li
              key={t.id_tarifa}
              style={{
                background: "var(--bg-main)",
                border: "1px solid var(--border-color)",
                borderRadius: "10px",
                padding: "14px 16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {editando === t.id_tarifa ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
                  <input
                    type="text"
                    value={editData.tipo_trabajo}
                    style={{ padding: "8px 12px", fontSize: "13px" }}
                    onChange={(e) => setEditData({ ...editData, tipo_trabajo: e.target.value })}
                  />
                  <input
                    type="number"
                    value={editData.valor_hora}
                    placeholder="Valor/hora"
                    style={{ padding: "8px 12px", fontSize: "13px" }}
                    onChange={(e) => setEditData({ ...editData, valor_hora: e.target.value })}
                  />
                  <input
                    type="text"
                    value={editData.tatuador_nombre}
                    placeholder="Tatuador asignado"
                    style={{ padding: "8px 12px", fontSize: "13px" }}
                    onChange={(e) => setEditData({ ...editData, tatuador_nombre: e.target.value })}
                  />
                  <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                    <button
                      onClick={() => guardarEdicion(t.id_tarifa)}
                      style={{
                        padding: "6px 14px",
                        fontSize: "12px",
                        background: "var(--color-success)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: "700",
                      }}
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => setEditando(null)}
                      style={{
                        padding: "6px 14px",
                        fontSize: "12px",
                        background: "transparent",
                        color: "var(--text-muted)",
                        border: "1px solid var(--border-color)",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: "600",
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "8px",
                        background: "rgba(244, 208, 63, 0.12)",
                        color: "var(--accent-color)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "15px",
                        fontWeight: "bold",
                        flexShrink: 0,
                      }}
                    >
                      ⚡
                    </div>
                    <div>
                      <div style={{ fontWeight: "700", fontSize: "14px", color: "var(--text-main)" }}>
                        {t.tipo_trabajo}
                      </div>
                      <div style={{ color: "var(--text-muted)", fontSize: "12px", marginTop: "2px" }}>
                        <span style={{ color: "var(--color-success)", fontWeight: "600" }}>
                          ${parseFloat(t.valor_hora).toLocaleString("es-CO")}
                        </span>{" "}
                        / hora
                        {t.tatuador_nombre && (
                          <span style={{ marginLeft: "8px", color: "var(--text-muted)" }}>
                            • Artista: <strong style={{ color: "var(--text-main)" }}>{t.tatuador_nombre}</strong>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => iniciarEdicion(t)}
                    title="Editar tarifa"
                    style={{
                      background: "var(--bg-input)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "6px",
                      padding: "6px 10px",
                      cursor: "pointer",
                      fontSize: "13px",
                      color: "var(--text-muted)",
                      flexShrink: 0,
                    }}
                  >
                    ✎
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
