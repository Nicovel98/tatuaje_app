import { useState } from "react";
import Toast from "./Toast";
import axios from "axios";
import ClienteHistorialModal from "./ClienteHistorialModal";

export default function ClienteList({ clientes, onClienteActualizado }) {
  const [editando, setEditando] = useState(null);
  const [editData, setEditData] = useState({});
  const [clienteHistorial, setClienteHistorial] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [toast, setToast] = useState(null);

  const iniciarEdicion = (c) => {
    // Reset any previous toast
    setToast(null);
    setEditando(c.id_cliente);
    setEditData({ nombre: c.nombre, telefono: c.telefono, correo: c.correo });
  };

  const guardarEdicion = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/clientes/${id}`, editData);
      setEditando(null);
      if (onClienteActualizado) onClienteActualizado();
      setToast({ message: 'Cliente actualizado exitosamente', type: 'success' });
    } catch (err) {
      setToast({ message: err.response?.data?.error || 'Error al actualizar', type: 'error' });
    }
  };

  const filtrados = clientes.filter((c) => {
    const q = busqueda.toLowerCase();
    return (
      c.nombre.toLowerCase().includes(q) ||
      c.telefono.toLowerCase().includes(q) ||
      c.correo.toLowerCase().includes(q)
    );
  });

  const getIniciales = (nombre) => {
    if (!nombre) return "CL";
    const partes = nombre.trim().split(" ");
    if (partes.length >= 2) return (partes[0][0] + partes[1][0]).toUpperCase();
    return partes[0].slice(0, 2).toUpperCase();
  };

  return (
    <div className="card-list" style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "16px" }}>Directorio de Clientes</h3>
          <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--text-muted)" }}>
            {clientes.length} clientes registrados
          </p>
        </div>
      </div>

      <input
        type="text"
        placeholder="Buscar cliente por nombre, teléfono o correo..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        style={{
          width: "100%",
          padding: "10px 14px",
          marginBottom: "14px",
          borderRadius: "8px",
          border: "1px solid var(--border-color)",
          background: "var(--bg-input)",
          color: "var(--text-main)",
          fontSize: "13px",
          boxSizing: "border-box",
        }}
      />

      {filtrados.length === 0 ? (
        <div style={{ textAlign: "center", padding: "30px 10px", color: "var(--text-muted)" }}>
          <p style={{ margin: 0, fontSize: "14px" }}>
            {clientes.length === 0 ? "No hay clientes registrados aún." : "No se encontraron clientes coincidentes."}
          </p>
        </div>
      ) : (
        <div style={{ maxHeight: "450px", overflowY: "auto", paddingRight: "4px" }}>
          <ul style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {filtrados.map((c) => (
              <li key={c.id_cliente} style={{
                background: "var(--bg-main)",
                border: "1px solid var(--border-color)",
                borderRadius: "10px",
                padding: "14px 16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                transition: "all 0.2s ease",
              }}>
                {editando === c.id_cliente ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
                    <input
                      type="text"
                      placeholder="Nombre Completo"
                      value={editData.nombre}
                      style={{ padding: "8px 12px", fontSize: "13px" }}
                      onChange={(e) => setEditData({ ...editData, nombre: e.target.value })}
                    />
                    <input
                      type="text"
                      placeholder="Teléfono"
                      value={editData.telefono}
                      style={{ padding: "8px 12px", fontSize: "13px" }}
                      onChange={(e) => setEditData({ ...editData, telefono: e.target.value })}
                    />
                    <input
                      type="email"
                      placeholder="Correo Electrónico"
                      value={editData.correo}
                      style={{ padding: "8px 12px", fontSize: "13px" }}
                      onChange={(e) => setEditData({ ...editData, correo: e.target.value })}
                    />
                    <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                      <button
                        onClick={() => guardarEdicion(c.id_cliente)}
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
                        Guardar Cambios
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
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          background: "linear-gradient(135deg, rgba(244, 208, 63, 0.2), rgba(244, 208, 63, 0.05))",
                          color: "var(--accent-color)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "700",
                          fontSize: "13px",
                          border: "1px solid rgba(244, 208, 63, 0.3)",
                          flexShrink: 0,
                        }}
                      >
                        {getIniciales(c.nombre)}
                      </div>
                      <div>
                        <div style={{ fontWeight: "700", fontSize: "14px", color: "var(--text-main)" }}>{c.nombre}</div>
                        <div style={{ color: "var(--text-muted)", fontSize: "12px", marginTop: "2px" }}>
                          📞 {c.telefono} &nbsp;|&nbsp; ✉️ {c.correo}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <button
                        onClick={() => setClienteHistorial(c)}
                        title="Consultar Historial de Pagos y Saldo"
                        style={{
                          background: "rgba(244, 208, 63, 0.1)",
                          border: "1px solid var(--accent-color)",
                          borderRadius: "6px",
                          padding: "6px 12px",
                          cursor: "pointer",
                          fontSize: "12px",
                          color: "var(--accent-color)",
                          fontWeight: "700",
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        💳 Historial Pagos
                      </button>
                      <button
                        onClick={() => iniciarEdicion(c)}
                        title="Editar cliente"
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
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {clienteHistorial && (
        <ClienteHistorialModal
          cliente={clienteHistorial}
          onClose={() => setClienteHistorial(null)}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
