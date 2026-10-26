import { useState, useEffect } from "react";
import axios from "axios";

export default function ReportesView() {
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [comisiones, setComisiones] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [error, setError] = useState("");
  const [facturaDetalle, setFacturaDetalle] = useState(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [busquedaHist, setBusquedaHist] = useState("");

  useEffect(() => {
    let estaActivo = true;

    const inicializarHistorial = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/reportes/historial-facturas",
        );
        if (estaActivo) setHistorial(res.data);
      } catch (err) {
        console.error("Error al cargar historial:", err);
      }
    };

    inicializarHistorial();
    return () => { estaActivo = false; };
  }, []);

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

  const verFactura = async (numFactura) => {
    setCargandoDetalle(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/facturas/${numFactura}/detalle`);
      setFacturaDetalle(res.data);
    } catch (err) {
      alert(err.response?.data?.error || "Error al cargar factura");
    }
    setCargandoDetalle(false);
  };

  const generarCUFE = () => {
    const chars = "0123456789abcdef";
    let cufe = "";
    for (let i = 0; i < 40; i++) cufe += chars[Math.floor(Math.random() * 16)];
    return cufe;
  };

  return (
    <div
      className="fade-in animate-view"
      style={{ display: "flex", flexDirection: "column", gap: "30px" }}
    >
      {/* SECCION 1: FILTRO DE COMISIONES */}
      <div className="card-form no-print">
        <h3>Reporte de Comisiones por Tatuador</h3>
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
                  <th>Comision Artista (50%)</th>
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

      {/* SECCION 2: HISTORIAL DE FACTURAS CON BOTON VER */}
      <div className="card-list no-print">
        <h3>Historial de Facturas Emitidas</h3>
        {historial.length === 0 ? (
          <p>No se registran movimientos contables.</p>
        ) : (
          <>
            <input
              type="text"
              placeholder="Buscar por numero, cliente o diseno..."
              value={busquedaHist}
              onChange={(e) => setBusquedaHist(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                marginBottom: "10px",
                borderRadius: "6px",
                border: "1px solid var(--border-color)",
                background: "var(--bg-input)",
                color: "var(--text-main)",
                fontSize: "12px",
                boxSizing: "border-box",
              }}
            />
          <div style={{ maxHeight: "220px", overflowY: "auto" }}>
            <ul>
              {historial.filter((h) => {
                const q = busquedaHist.toLowerCase();
                return !q || String(h.num_factura).includes(q) || h.nombre_cliente.toLowerCase().includes(q) || h.diseno.toLowerCase().includes(q);
              }).map((h) => (
                <li
                  key={h.num_factura}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
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
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span
                      style={{
                        fontWeight: "bold",
                        color: "var(--color-success)",
                        fontSize: "16px",
                      }}
                    >
                      ${parseFloat(h.total).toLocaleString("es-CO")}
                    </span>
                    <button
                      onClick={() => verFactura(h.num_factura)}
                      disabled={cargandoDetalle}
                      style={{
                        padding: "6px 14px",
                        fontSize: "12px",
                        fontWeight: "700",
                        background: "rgba(52, 152, 218, 0.15)",
                        color: "var(--color-info)",
                        border: "1px solid var(--color-info)",
                        borderRadius: "6px",
                        cursor: "pointer",
                        textTransform: "uppercase",
                      }}
                    >
                      Ver
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          </>
        )}
      </div>

      {/* SECCION 3: VISOR DE FACTURA ELECTRONICA */}
      {facturaDetalle && (
        <div className="card-form" style={{ position: "relative" }}>
          <button
            className="no-print"
            onClick={() => setFacturaDetalle(null)}
            style={{
              position: "absolute",
              top: "15px",
              right: "15px",
              background: "rgba(231, 76, 60, 0.15)",
              color: "var(--color-danger)",
              border: "1px solid var(--color-danger)",
              borderRadius: "6px",
              padding: "5px 12px",
              cursor: "pointer",
              fontWeight: "700",
              fontSize: "12px",
            }}
          >
            Cerrar
          </button>

          <h3 style={{ color: "var(--accent-color)" }}>
            Factura Electronica No. FE-{String(facturaDetalle.num_factura).padStart(4, "0")}
          </h3>

          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
            margin: "15px 0",
            fontSize: "13px",
          }}>
            <div style={{ padding: "12px", background: "var(--bg-main)", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
              <strong style={{ color: "var(--accent-color)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px" }}>
                Prestador del Servicio
              </strong>
              <p style={{ margin: "8px 0 0" }}>ART INK TATTOO STUDIO</p>
              <p style={{ color: "var(--text-muted)", margin: "2px 0" }}>NIT: 901.234.567-8</p>
            </div>
            <div style={{ padding: "12px", background: "var(--bg-main)", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
              <strong style={{ color: "var(--accent-color)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px" }}>
                Adquiriente
              </strong>
              <p style={{ margin: "8px 0 0" }}>{facturaDetalle.nombre_cliente}</p>
              <p style={{ color: "var(--text-muted)", margin: "2px 0" }}>CC: {facturaDetalle.id_cliente}</p>
              <p style={{ color: "var(--text-muted)", margin: "2px 0" }}>{facturaDetalle.correo_cliente}</p>
            </div>
          </div>

          <div style={{ fontSize: "13px", margin: "10px 0", color: "var(--text-muted)" }}>
            <p><strong>Fecha Emision:</strong> {facturaDetalle.fecha_emision.split("T")[0]}</p>
            <p><strong>Diseno:</strong> {facturaDetalle.diseno} — {facturaDetalle.zona_cuerpo}</p>
          </div>

          {facturaDetalle.detalles && facturaDetalle.detalles.length > 0 && (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "13px",
                textAlign: "left",
                margin: "15px 0",
              }}
            >
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border-color)", color: "var(--accent-color)" }}>
                  <th style={{ padding: "8px" }}>Servicio</th>
                  <th>Tatuador</th>
                  <th>Fecha</th>
                  <th>Horas</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {facturaDetalle.detalles.map((d, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--border-color)" }}>
                    <td style={{ padding: "8px" }}>
                      {d.tipo_trabajo}
                      {d.es_retoque === "S" && (
                        <span style={{ color: "var(--color-warning)", marginLeft: "6px", fontSize: "11px" }}>
                          (Retoque)
                        </span>
                      )}
                    </td>
                    <td>{d.nombre_tatuador}</td>
                    <td>{d.fecha?.split("T")[0]}</td>
                    <td>{d.horas_facturadas}h</td>
                    <td style={{ fontWeight: "bold" }}>${parseFloat(d.subtotal).toLocaleString("es-CO")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div style={{
            padding: "15px",
            background: "var(--bg-main)",
            borderRadius: "8px",
            border: "1px solid var(--border-color)",
            fontSize: "14px",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
              <span>Valor Estimado:</span>
              <span>${parseFloat(facturaDetalle.valor_estimado).toLocaleString("es-CO")}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", color: "var(--color-danger)" }}>
              <span>Anticipo Aplicado:</span>
              <span>-${parseFloat(facturaDetalle.anticipo).toLocaleString("es-CO")}</span>
            </div>
            <hr style={{ borderColor: "var(--border-color)", margin: "8px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: "18px", fontWeight: "bold", color: "var(--accent-color)" }}>
              <span>TOTAL FACTURADO:</span>
              <span>${parseFloat(facturaDetalle.total).toLocaleString("es-CO")}</span>
            </div>
          </div>

          <button
            className="no-print"
            onClick={() => window.print()}
            style={{
              marginTop: "15px",
              background: "#2ecc71",
              color: "#fff",
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "none",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            Imprimir Factura
          </button>
        </div>
      )}
    </div>
  );
}
