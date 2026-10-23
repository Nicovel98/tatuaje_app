import { useState } from "react";
import axios from "axios";

export default function FacturaForm({ tatuajes, onFacturaGenerada }) {
  const [tatuajeId, setTatuajeId] = useState("");
  const [numFactura, setNumFactura] = useState("");
  const [resumen, setResumen] = useState(null);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [facturaEmitida, setFacturaEmitida] = useState(null);

  const consultarSesiones = async (id) => {
    setTatuajeId(id);
    if (!id) {
      setResumen(null);
      return;
    }
    try {
      const res = await axios.get(
        `http://localhost:5000/api/facturacion/resumen/${id}`,
      );
      setResumen(res.data);
      setError("");
    } catch (err) {
      setResumen(null);
      setError(
        err.response?.data?.error || "Error al consultar cobros acumulados.",
      );
    }
  };

  const handleGenerarFactura = async (e) => {
    e.preventDefault();
    if (!numFactura || !tatuajeId || !resumen) {
      setError("Por favor completa todos los campos.");
      return;
    }

    // HU-06: El anticipo se resta de manera AUTOMÁTICA basándose en lo extraído de MySQL
    const anticipoDeducido = parseFloat(resumen.anticipo_guardado);
    const totalFinal = parseFloat(resumen.total_calculado) - anticipoDeducido;

    // Si el neto da negativo (porque el abono cubrió más de lo trabajado en esta sesión), el neto a pagar pasa a ser 0
    const totalPagarSeguro = totalFinal < 0 ? 0 : totalFinal;

    try {
      const datosFactura = {
        num_factura: parseInt(numFactura),
        fecha_emision: new Date().toISOString().split("T")[0],
        total: totalPagarSeguro,
        TATUAJE_id_tatuaje: parseInt(tatuajeId),
        sesiones_facturar: resumen.sesiones_detalladas,
      };

      await axios.post("http://localhost:5000/api/facturas", datosFactura);

      const tatuajeSeleccionado = tatuajes.find(
        (t) => t.id_tatuaje === parseInt(tatuajeId),
      );
      setFacturaEmitida({
        ...datosFactura,
        diseno: resumen.diseno,
        cliente: tatuajeSeleccionado?.nombre_cliente || "Cliente Registrado",
        subtotal: resumen.total_calculado,
        anticipo: anticipoDeducido,
        total_sesiones: resumen.total_sesiones,
      });

      setExito(`Factura #${numFactura} emitida de forma automática.`);
      setError("");
      setResumen(null);
      setNumFactura("");

      // ✅ CORRECCIÓN: Usamos la función heredada para notificar al componente padre
      if (onFacturaGenerada) onFacturaGenerada();
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Error al procesar la factura transaccional.",
      );
    }
  };

  return (
    <div className="card-form">
      <h3>Generar Factura de Servicio (HU-06)</h3>
      {error && <p className="error">{error}</p>}
      {exito && (
        <p className="exito" style={{ color: "#2ecc71", fontWeight: "bold" }}>
          {exito}
        </p>
      )}

      <form onSubmit={handleGenerarFactura} className="no-print">
        <input
          type="number"
          placeholder="Número de Factura"
          value={numFactura}
          onChange={(e) => setNumFactura(e.target.value)}
        />

        <select
          value={tatuajeId}
          onChange={(e) => consultarSesiones(e.target.value)}
        >
          <option value="">-- Selecciona el Tatuaje a Liquidar --</option>
          {tatuajes.map((t) => (
            <option key={t.id_tatuaje} value={t.id_tatuaje}>
              {t.diseno} (ID: {t.id_tatuaje})
            </option>
          ))}
        </select>

        {resumen && (
          <div
            style={{
              margin: "15px 0",
              padding: "15px",
              background: "#1e1e24",
              borderRadius: "4px",
              borderLeft: "5px solid #2ecc71",
            }}
          >
            <h4>Deducción de Valores (Cuentas Claras)</h4>
            <p>
              <strong>N° de Sesiones Nuevas:</strong> {resumen.total_sesiones}
            </p>
            <p>
              <strong>Subtotal de Horas:</strong> \$
              {parseFloat(resumen.total_calculado).toLocaleString("es-CO")}
            </p>
            <p style={{ color: "#ff6b6b" }}>
              <strong>Anticipo Guardado en BD (HU-05):</strong> -\$
              {parseFloat(resumen.anticipo_guardado).toLocaleString("es-CO")}
            </p>
            <hr style={{ borderColor: "#444" }} />
            <p style={{ fontSize: "18px", color: "#f4d03f" }}>
              <strong>Neto a Cobrar:</strong> \$
              {(parseFloat(resumen.total_calculado) -
                parseFloat(resumen.anticipo_guardado) <
              0
                ? 0
                : parseFloat(resumen.total_calculado) -
                  parseFloat(resumen.anticipo_guardado)
              ).toLocaleString("es-CO")}
            </p>
          </div>
        )}

        <button type="submit" disabled={!resumen}>
          Confirmar y Emitir Factura
        </button>
      </form>

      {facturaEmitida && (
        <div style={{ marginTop: "15px" }} className="no-print">
          <button
            onClick={() => window.print()}
            style={{ background: "#2ecc71", color: "#fff", width: "100%" }}
          >
            🖨️ Descargar Recibo PDF / Factura #{facturaEmitida.num_factura}
          </button>
        </div>
      )}

      {/* TICKET IMPRIMIBLE 3FN */}
      {facturaEmitida && (
        <div className="print-only ticket-factura">
          <div className="ticket-header">
            <h2>ART INK TATTOO STUDIO</h2>
            <p>Nit: 123456789-0</p>
            <p>Tel: +57 300 123 4567</p>
          </div>
          <hr />
          <div className="ticket-body">
            <p>
              <strong>Factura N°:</strong> {facturaEmitida.num_factura}
            </p>
            <p>
              <strong>Fecha Emisión:</strong> {facturaEmitida.fecha_emision}
            </p>
            <p>
              <strong>Cliente:</strong> {facturaEmitida.cliente}
            </p>
            <p>
              <strong>Diseño:</strong> {facturaEmitida.diseno}
            </p>
            <p>
              <strong>Sesiones Facturadas:</strong>{" "}
              {facturaEmitida.total_sesiones}
            </p>
            <hr />
            <div className="ticket-totales">
              <p>
                Subtotal Horas:{" "}
                <span>
                  \$
                  {parseFloat(facturaEmitida.subtotal).toLocaleString("es-CO")}
                </span>
              </p>
              <p>
                Anticipo Deducido (HU-05):{" "}
                <span>
                  -\$
                  {parseFloat(facturaEmitida.anticipo).toLocaleString("es-CO")}
                </span>
              </p>
              <h3>
                TOTAL NETO:{" "}
                <span>
                  \${parseFloat(facturaEmitida.total).toLocaleString("es-CO")}
                </span>
              </h3>
            </div>
          </div>
          <hr />
          <div className="ticket-footer">
            <p>¡Gracias por confiar en nuestro arte!</p>
          </div>
        </div>
      )}
    </div>
  );
}
