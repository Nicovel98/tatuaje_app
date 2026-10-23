export default function ClienteList({ clientes }) {
  return (
    <div className="card-list">
      <h3>Lista de Clientes</h3>
      {clientes.length === 0 ? (
        <p>No hay clientes registrados.</p>
      ) : (
        <ul>
          {clientes.map((c) => (
            <li key={c.id_cliente}>
              <strong>ID:</strong> {c.id_cliente} | <strong>Nombre:</strong>{" "}
              {c.nombre} | <strong>Tel:</strong> {c.telefono}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
