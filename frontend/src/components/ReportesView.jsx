import { useState, useEffect } from "react";
import axios from "axios";

export default function ReportesView() {
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [comisiones, setComisiones] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [error, setError] = useState("");

  // Sincronización limpia controlada para evitar renderizados en cascada
  useEffect(() => {
    let estaActivo = true;

    const inicializarHistorialAuditoria = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/reportes/historial-facturas",
        );

        // Solo alteramos el estado si el componente sigue montado en el dashboard
        if (estaActivo) {
          setHistorial(res.data);
        }
      } catch (err) {
        console.error("Error al cargar la auditoría de caja inicial:", err);
      }
    };

    inicializarHistorialAuditoria();

    // Función de limpieza para desactivar la reactividad en desmontajes rápidos
    return () => {
      estaActivo = false;
    };
  }, []); // El arreglo vacío garantiza que solo se ejecute una vez al ingresar al módulo

  const handleConsultarReporte = async (e) => {
    e.preventDefault();
    if (!fechaInicio || !fechaFin) {
      setError("Diligencie el rango completo de fechas.");
      return;
    }
    try {
      const res = await axios.get(
        `http://localhost:5000/api/reportes/comisiones?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`,
      );
      setComisiones(res.data);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "No se registran cobros en ese periodo de tiempo.",
      );
      setComisiones([]);
    }
  };

  return (
    <div
      className="fade-in animate-view"
      style={{ display: "flex", flexDirection: "column", gap: "30px" }}
    >
      {/* SECCIÓN 1: FILTRO DE COMISIONES (HU-09) */}
      <div className="card-form">
        <h3>Reporte de Cierre de Caja & Comisiones por Tatuador (HU-09)</h3>
        {error && <p className="error">{error}</p>}

        <form
          onSubmit={handleConsultarReporte}
          style={{
            flexDirection: "row",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            style={{ width: "auto" }}
          />
          <span style={{ color: "var(--text-muted)" }}>hasta</span>
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            style={{ width: "auto" }}
          />
          <button type="submit" style={{ marginTop: 0 }}>
            Generar Reporte
          </button>
        </form>

        <div style={{ marginTop: "20px" }}>
          {comisiones.length === 0 ? (
            <p style={{ color: "var(--text-muted)" }}>
              No se registran consultas en este rango.
            </p>
          ) : (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: "10px",
                fontSize: "14px",
                textAlign: "left",
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: "2px solid var(--border-color)",
                    color: "var(--accent-color)",
                  }}
                >
                  <th style={{ padding: "10px" }}>Tatuador</th>
                  <th>Servicios</th>
                  <th>Bruto Total</th>
                  <th>Comisión Artista (50%)</th>
                  <th>Utilidad Estudio</th>
                </tr>
              </thead>
              <tbody>
                {comisiones.map((c) => (
                  <tr
                    key={c.id_usuario}
                    style={{ borderBottom: "1px solid var(--border-color)" }}
                  >
                    <td style={{ padding: "10px", fontWeight: "bold" }}>
                      {c.nombre_tatuador}
                    </td>
                    <td>{c.facturas_emitidas}</td>
                    <td>
                      ${parseFloat(c.bruto_trabajado).toLocaleString("es-CO")}
                    </td>
                    <td style={{ color: "var(--color-success)" }}>
                      ${parseFloat(c.comision_tatuador).toLocaleString("es-CO")}
                    </td>
                    <td style={{ color: "var(--color-info)" }}>
                      ${parseFloat(c.ganancia_estudio).toLocaleString("es-CO")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* SECCIÓN 2: AUDITORÍA DE FACTURAS EMITIDAS (HU-08) */}
      <div className="card-list">
        <h3>Historial Completo de Pagos e Ingresos Recibidos (HU-08)</h3>
        {historial.length === 0 ? (
          <p>No se registran movimientos contables.</p>
        ) : (
          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            <ul>
              {historial.map((h) => (
                <li
                  key={h.num_factura}
                  style={{ justifyContent: "space-between" }}
                >
                  <div>
                    <strong>Factura #{h.num_factura}</strong> —{" "}
                    <span style={{ color: "var(--accent-color)" }}>
                      {h.diseno}
                    </span>
                    <br />
                    <small style={{ color: "var(--text-muted)" }}>
                      Cliente: {h.nombre_cliente} | Fecha:{" "}
                      {h.fecha_emision.split("T")[0]}
                    </small>
                  </div>
                  <span
                    style={{
                      fontWeight: "bold",
                      color: "var(--color-success)",
                      fontSize: "16px",
                    }}
                  >
                    ${parseFloat(h.total).toLocaleString("es-CO")}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
