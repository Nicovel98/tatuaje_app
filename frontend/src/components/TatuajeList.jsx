import { useState } from "react";
import axios from "axios";

const ESTADOS = ["PENDIENTE", "PROGRAMADO", "FINALIZADO", "CANCELADO"];

const badgeStyle = {
  PENDIENTE:   { bg: "rgba(243,156,18,0.15)",  color: "var(--color-warning)" },
  PROGRAMADO:  { bg: "rgba(52,152,219,0.15)",  color: "var(--color-info)"    },
  FINALIZADO:  { bg: "rgba(46,204,113,0.15)",  color: "var(--color-success)" },
  CANCELADO:   { bg: "rgba(231,76,60,0.15)",   color: "var(--color-danger)"  },
};

export default function TatuajeList({ tatuajes, onTatuajeActualizado }) {
  const [busqueda, setBusqueda] = useState("");
  const [actualizando, setActualizando] = useState(null); // id del tatuaje en proceso

  const filtrados = tatuajes.filter((t) => {
    const texto = busqueda.toLowerCase();
    return (
      t.diseno.toLowerCase().includes(texto) ||
      t.nombre_cliente.toLowerCase().includes(texto) ||
      t.zona_cuerpo.toLowerCase().includes(texto) ||
      t.estado.toLowerCase().includes(texto)
    );
  });

  const cambiarEstado = async (id, nuevoEstado) => {
    setActualizando(id);
    try {
      await axios.put(`http://localhost:5000/api/tatuajes/${id}/estado`, {
        estado: nuevoEstado,
      });
      if (onTatuajeActualizado) onTatuajeActualizado();
    } catch (err) {
      alert(err.response?.data?.error || "Error al actualizar el estado");
    } finally {
      setActualizando(null);
    }
  };

  return (
    <div className="card-list" style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "16px" }}>Catálogo de Tatuajes en Curso</h3>
          <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--text-muted)" }}>
            {tatuajes.length} trabajos registrados
          </p>
        </div>
      </div>

      <input
        type="text"
        placeholder="Buscar por diseño, cliente, zona anatómica o estado..."
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
            {tatuajes.length === 0
              ? "No hay tatuajes registrados aún."
              : "No se encontraron resultados coincidentes."}
          </p>
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: "auto", paddingRight: "4px", minHeight: 0 }}>
          <div className="grid-tatuajes">
            {filtrados.map((t) => {
              const horasTrabajadas = parseFloat(t.horas_trabajadas_acumuladas || 0);
              const horasEstimadas = parseFloat(t.horas_estimadas);
              const pct = horasEstimadas > 0
                ? Math.min(100, Math.round((horasTrabajadas / horasEstimadas) * 100))
                : 0;
              const badge = badgeStyle[t.estado] || badgeStyle.PENDIENTE;

              return (
                <div
                  key={t.id_tatuaje}
                  className="tatuaje-item"
                  style={{
                    background: "var(--bg-main)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "10px",
                    padding: "16px",
                    transition: "all 0.2s ease",
                  }}
                >
                  {/* Cabecera: diseño + badge estado */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: "15px", color: "var(--text-main)" }}>
                        {t.diseno}
                      </h4>
                      <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--accent-color)", fontWeight: "600" }}>
                        👤 {t.nombre_cliente}
                      </p>
                    </div>
                    <span
                      style={{
                        fontSize: "11px",
                        padding: "3px 10px",
                        borderRadius: "20px",
                        background: badge.bg,
                        color: badge.color,
                        fontWeight: "700",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {t.estado}
                    </span>
                  </div>

                  {/* Detalles */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "12px", color: "var(--text-muted)", marginBottom: "12px" }}>
                    <div>
                      <span>Ubicación: </span>
                      <strong style={{ color: "var(--text-main)" }}>{t.zona_cuerpo}</strong>
                    </div>
                    {t.tipo_trabajo && (
                      <div>
                        <span>Estilo: </span>
                        <strong style={{ color: "var(--text-main)" }}>{t.tipo_trabajo}</strong>
                      </div>
                    )}
                    {t.tatuador_nombre && (
                      <div>
                        <span>Artista: </span>
                        <strong style={{ color: "var(--text-main)" }}>{t.tatuador_nombre}</strong>
                      </div>
                    )}
                    {parseFloat(t.anticipo) > 0 && (
                      <div>
                        <span>Anticipo: </span>
                        <strong style={{ color: "var(--color-success)" }}>
                          ${parseFloat(t.anticipo).toLocaleString("es-CO")}
                        </strong>
                      </div>
                    )}
                  </div>

                  {/* Barra de progreso de horas */}
                  <div style={{ marginBottom: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px" }}>
                      <span>Progreso de sesiones</span>
                      <span style={{ color: "var(--accent-color)", fontWeight: "700" }}>
                        {horasTrabajadas}h / {horasEstimadas}h ({pct}%)
                      </span>
                    </div>
                    <div
                      style={{
                        width: "100%",
                        height: "6px",
                        borderRadius: "3px",
                        background: "var(--border-color)",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${pct}%`,
                          height: "100%",
                          borderRadius: "3px",
                          background: pct >= 100
                            ? "var(--color-success)"
                            : pct >= 60
                              ? "var(--accent-color)"
                              : "var(--color-info)",
                          transition: "width 0.4s ease",
                        }}
                      />
                    </div>
                  </div>

                  {/* Selector de estado */}
                  {t.estado !== "CANCELADO" && t.estado !== "FINALIZADO" && (
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)", alignSelf: "center", whiteSpace: "nowrap" }}>
                        Cambiar estado:
                      </span>
                      {ESTADOS.filter((e) => e !== t.estado).map((estado) => {
                        const s = badgeStyle[estado];
                        return (
                          <button
                            key={estado}
                            onClick={() => cambiarEstado(t.id_tatuaje, estado)}
                            disabled={actualizando === t.id_tatuaje}
                            title={`Marcar como ${estado}`}
                            style={{
                              fontSize: "11px",
                              padding: "3px 10px",
                              borderRadius: "20px",
                              border: `1px solid ${s.color}`,
                              background: "transparent",
                              color: s.color,
                              cursor: actualizando === t.id_tatuaje ? "not-allowed" : "pointer",
                              fontWeight: "600",
                              opacity: actualizando === t.id_tatuaje ? 0.5 : 1,
                              transition: "all 0.15s ease",
                            }}
                          >
                            {estado}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Info sesiones (tatuajes finalizados o cancelados) */}
                  {(t.estado === "FINALIZADO" || t.estado === "CANCELADO") && (
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                      {t.sesiones_ids
                        ? `${t.sesiones_ids.split(",").length} sesión(es) registradas`
                        : "Sin sesiones"}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
