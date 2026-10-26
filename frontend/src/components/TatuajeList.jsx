import { useState } from "react";

export default function TatuajeList({ tatuajes }) {
  const [busqueda, setBusqueda] = useState("");

  const filtrados = tatuajes.filter((t) => {
    const texto = busqueda.toLowerCase();
    return (
      t.diseno.toLowerCase().includes(texto) ||
      t.nombre_cliente.toLowerCase().includes(texto) ||
      t.zona_cuerpo.toLowerCase().includes(texto) ||
      t.estado.toLowerCase().includes(texto) ||
      String(t.id_tatuaje).includes(texto)
    );
  });

  return (
    <div className="card-list" style={{ display: "flex", flexDirection: "column" }}>
      <h3>Lista de Tatuajes</h3>
      <input
        type="text"
        placeholder="Buscar por diseno, cliente, zona, estado o ID..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        style={{
          width: "100%",
          padding: "10px 14px",
          marginBottom: "12px",
          borderRadius: "8px",
          border: "1px solid var(--border-color)",
          background: "var(--bg-input)",
          color: "var(--text-main)",
          fontSize: "13px",
          boxSizing: "border-box",
        }}
      />
      {filtrados.length === 0 ? (
        <p style={{ color: "var(--text-muted)", textAlign: "center" }}>
          {tatuajes.length === 0 ? "No hay tatuajes registrados." : "Sin resultados."}
        </p>
      ) : (
        <div style={{ flex: 1, overflowY: "auto", paddingRight: "4px", minHeight: 0 }}>
          <div className="grid-tatuajes">
            {filtrados.map((t) => (
              <div key={t.id_tatuaje} className="tatuaje-item">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <h4 style={{ margin: 0 }}>{t.diseno}</h4>
                  <span style={{
                    fontSize: "11px",
                    color: "var(--accent-color)",
                    fontWeight: "700",
                    background: "rgba(244, 208, 63, 0.1)",
                    padding: "2px 8px",
                    borderRadius: "4px",
                  }}>
                    ID: {t.id_tatuaje}
                  </span>
                </div>
                <p><strong>Cliente:</strong> {t.nombre_cliente}</p>
                <p><strong>Ubicacion:</strong> {t.zona_cuerpo}</p>
                <p>
                  <strong>Estado:</strong>{" "}
                  <span className={`badge ${t.estado}`}>{t.estado}</span>
                </p>
                {t.tipo_trabajo && (
                  <p>
                    <strong>Tarifa:</strong>{" "}
                    <span style={{ color: "var(--accent-color)" }}>{t.tipo_trabajo}</span>
                    {" — "}${parseFloat(t.valor_hora).toLocaleString("es-CO")}/h
                  </p>
                )}
                {t.tatuador_nombre && (
                  <p><strong>Tatuador:</strong> {t.tatuador_nombre}</p>
                )}

                <p><strong>Horas estimadas:</strong> {parseFloat(t.horas_estimadas)}h</p>
                {parseFloat(t.anticipo) > 0 && (
                  <p><strong>Anticipo:</strong> ${parseFloat(t.anticipo).toLocaleString("es-CO")}</p>
                )}
                {t.sesiones_ids && (
                  <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    <strong>Sesiones:</strong> {t.sesiones_ids}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
