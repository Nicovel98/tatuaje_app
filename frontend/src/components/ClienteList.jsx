import { useState } from "react";
import ClienteModal from "./ClienteModal";

export default function ClienteList({ clientes, onClienteActualizado, usuarioActivo }) {
  const [busqueda, setBusqueda] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  const filtrados = (clientes || []).filter((c) => {
    const texto = busqueda.toLowerCase();
    return (
      (c.nombre || "").toLowerCase().includes(texto) ||
      (c.telefono || "").toLowerCase().includes(texto) ||
      (c.correo || "").toLowerCase().includes(texto) ||
      String(c.id_cliente).includes(texto)
    );
  });

  const abrirModalCrear = () => {
    setClienteSeleccionado(null);
    setModalAbierto(true);
  };

  const abrirModalEditar = (c) => {
    setClienteSeleccionado(c);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setClienteSeleccionado(null);
  };

  return (
    <div className="card-table" style={{ width: "100%" }}>
      <div className="view-header">
        <div>
          <h3 style={{ margin: 0, color: "var(--accent-color)" }}>Directorio de Clientes</h3>
          <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "var(--text-muted)" }}>
            Total de clientes registrados: {clientes?.length || 0}
          </p>
        </div>
        <button className="btn-crear-action" onClick={abrirModalCrear}>
          <span>+</span> Nuevo Cliente
        </button>
      </div>

      <input
        type="text"
        placeholder="Buscar cliente por nombre, teléfono, correo o identificación..."
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
          {(!clientes || clientes.length === 0)
            ? "No hay clientes registrados en el sistema."
            : "No se encontraron clientes con el criterio de búsqueda."}
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th style={{ width: "120px" }}>Identificación</th>
              <th>Nombre Completo</th>
              <th>Teléfono</th>
              <th>Correo Electrónico</th>
              <th style={{ textAlign: "center", width: "100px" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((c) => (
              <tr key={c.id_cliente}>
                <td>
                  <strong style={{ color: "var(--accent-color)" }}>{c.id_cliente}</strong>
                </td>
                <td>
                  <strong>{c.nombre}</strong>
                </td>
                <td>{c.telefono}</td>
                <td>{c.correo}</td>
                <td style={{ textAlign: "center" }}>
                  <button
                    className="btn-edit-sm"
                    onClick={() => abrirModalEditar(c)}
                    title="Editar información"
                  >
                    <span>✎</span> Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal Popup para Creación y Edición */}
      <ClienteModal
        isOpen={modalAbierto}
        onClose={cerrarModal}
        clienteEditar={clienteSeleccionado}
        usuarioActivo={usuarioActivo}
        onGuardado={onClienteActualizado}
      />
    </div>
  );
}
