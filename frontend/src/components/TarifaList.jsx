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
      <h3>Catalogo de Tarifas</h3>
      {tarifas.length === 0 ? (
        <p>No hay tarifas configuradas.</p>
      ) : (
        <ul>
          {tarifas.map((t) => (
            <li key={t.id_tarifa} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              {editando === t.id_tarifa ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
                  <input type="text" value={editData.tipo_trabajo} style={{ padding: "6px 10px", fontSize: "13px" }}
                    onChange={(e) => setEditData({ ...editData, tipo_trabajo: e.target.value })} />
                  <input type="number" value={editData.valor_hora} placeholder="Valor/hora" style={{ padding: "6px 10px", fontSize: "13px" }}
                    onChange={(e) => setEditData({ ...editData, valor_hora: e.target.value })} />
                  <input type="text" value={editData.tatuador_nombre} placeholder="Tatuador asignado" style={{ padding: "6px 10px", fontSize: "13px" }}
                    onChange={(e) => setEditData({ ...editData, tatuador_nombre: e.target.value })} />
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button onClick={() => guardarEdicion(t.id_tarifa)}
                      style={{ padding: "5px 12px", fontSize: "11px", background: "var(--color-success)", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "700" }}>
                      Guardar
                    </button>
                    <button onClick={() => setEditando(null)}
                      style={{ padding: "5px 12px", fontSize: "11px", background: "var(--color-danger)", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "700" }}>
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <strong>{t.tipo_trabajo}</strong>: ${parseFloat(t.valor_hora).toLocaleString("es-CO")}/hora
                    {t.tatuador_nombre && (
                      <span style={{ color: "var(--accent-color)", marginLeft: "8px", fontSize: "12px" }}>
                        — {t.tatuador_nombre}
                      </span>
                    )}
                    <small style={{ color: "#888", marginLeft: "10px" }}>(ID: {t.id_tarifa})</small>
                  </div>
                  <button
                    onClick={() => iniciarEdicion(t)}
                    title="Editar tarifa"
                    style={{
                      background: "transparent",
                      border: "1px solid var(--border-color)",
                      borderRadius: "6px",
                      padding: "6px 10px",
                      cursor: "pointer",
                      fontSize: "14px",
                      color: "var(--text-muted)",
                      flexShrink: 0,
                    }}
                  >
                    &#9998;
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
