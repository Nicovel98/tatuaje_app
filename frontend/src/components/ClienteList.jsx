export default function ClienteList({ clientes }) {
  return (
    <div className="card-list">
      <h3>Lista de Clientes Registrados</h3>
      {clientes.length === 0 ? (
        <p>No hay clientes registrados.</p>
      ) : (
        <ul>
          {clientes.map((c) => (
            <li
              key={c.id_cliente}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "4px",
              }}
            >
              <div>
                <strong>ID:</strong> {c.id_cliente} |{" "}
                <strong>{c.nombre}</strong>
              </div>
              <small style={{ color: "var(--text-muted)" }}>
                📞 Tel: {c.telefono} | 📧 Correo: {c.correo}
              </small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
