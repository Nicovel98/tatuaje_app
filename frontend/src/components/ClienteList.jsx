import { useState } from "react";
import axios from "axios";

export default function ClienteList({ clientes, onClienteActualizado }) {
  const [editando, setEditando] = useState(null);
  const [editData, setEditData] = useState({});

  const iniciarEdicion = (c) => {
    setEditando(c.id_cliente);
    setEditData({ nombre: c.nombre, telefono: c.telefono, correo: c.correo });
  };

  const guardarEdicion = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/clientes/${id}`, editData);
      setEditando(null);
      if (onClienteActualizado) onClienteActualizado();
    } catch (err) {
      alert(err.response?.data?.error || "Error al actualizar");
    }
  };

  return (
    <div className="card-list">
      <h3>Clientes Registrados</h3>
      {clientes.length === 0 ? (
        <p>No hay clientes registrados.</p>
      ) : (
        <ul>
          {clientes.map((c) => (
            <li key={c.id_cliente} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              {editando === c.id_cliente ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
                  <input type="text" value={editData.nombre} style={{ padding: "6px 10px", fontSize: "13px" }}
                    onChange={(e) => setEditData({ ...editData, nombre: e.target.value })} />
                  <input type="text" value={editData.telefono} style={{ padding: "6px 10px", fontSize: "13px" }}
                    onChange={(e) => setEditData({ ...editData, telefono: e.target.value })} />
                  <input type="email" value={editData.correo} style={{ padding: "6px 10px", fontSize: "13px" }}
                    onChange={(e) => setEditData({ ...editData, correo: e.target.value })} />
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button onClick={() => guardarEdicion(c.id_cliente)}
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
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div>
                      <strong>CC:</strong> {c.id_cliente} | <strong>{c.nombre}</strong>
                    </div>
                    <small style={{ color: "var(--text-muted)" }}>
                      Tel: {c.telefono} | {c.correo}
                    </small>
                  </div>
                  <button
                    onClick={() => iniciarEdicion(c)}
                    title="Editar cliente"
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
