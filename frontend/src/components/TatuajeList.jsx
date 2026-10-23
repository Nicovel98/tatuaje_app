export default function TatuajeList({ tatuajes }) {
  return (
    <div className="card-list">
      <h3>Lista de Tatuajes</h3>
      {tatuajes.length === 0 ? (
        <p>No hay tatuajes registrados.</p>
      ) : (
        <div className="grid-tatuajes">
          {tatuajes.map((t) => (
            <div key={t.id_tatuaje} className="tatuaje-item">
              <h4>{t.diseno}</h4>
              <p>
                <strong>Ubicación:</strong> {t.zona_cuerpo}
              </p>
              <p>
                <strong>Estado:</strong>{" "}
                <span className={`badge ${t.estado}`}>{t.estado}</span>
              </p>
              <p>
                <strong>Precio:</strong> \${t.valor_estimado}
              </p>
              <p>
                <strong>Cliente:</strong> {t.nombre_cliente}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
