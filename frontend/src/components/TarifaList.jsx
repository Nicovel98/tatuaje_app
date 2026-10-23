export default function TarifaList({ tarifas }) {
  return (
    <div className="card-list">
      <h3>Catálogo de Tarifas</h3>
      {tarifas.length === 0 ? (
        <p>No hay tarifas configuradas.</p>
      ) : (
        <ul>
          {tarifas.map((t) => (
            <li key={t.id_tarifa}>
              <strong>{t.tipo_trabajo}</strong>: \$
              {parseFloat(t.valor_hora).toLocaleString("es-CO")}/hora
              <small style={{ color: "#888", marginLeft: "10px" }}>
                (ID: {t.id_tarifa})
              </small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
