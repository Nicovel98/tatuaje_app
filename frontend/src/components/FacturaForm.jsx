import { useState, useEffect } from "react";
import axios from "axios";

export default function FacturaForm({ tatuajes, usuarioActivo, onFacturaGenerada }) {
  const [tatuajeId, setTatuajeId] = useState("");
  const [numFactura, setNumFactura] = useState("");
  const [resumen, setResumen] = useState(null);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [facturaEmitida, setFacturaEmitida] = useState(null);
  const [facturasRegistradas, setFacturasRegistradas] = useState([]);
  const [soloRetoque, setSoloRetoque] = useState(false);
  const [busquedaFactura, setBusquedaFactura] = useState("");

  const [siguienteNum, setSiguienteNum] = useState(null);

  useEffect(() => {
    cargarFacturas();
    cargarSiguienteNumero();
  }, []);

  const cargarSiguienteNumero = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/facturas/siguiente-numero");
      setSiguienteNum(res.data.siguiente);
    } catch (err) {
      console.error("Error cargando siguiente numero", err);
    }
  };

  const cargarFacturas = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/facturas");
      setFacturasRegistradas(res.data);
    } catch (err) {
      console.error("Error cargando facturas", err);
    }
  };

  const consultarSesiones = async (id, retoque = false) => {
    setTatuajeId(id);
    if (!id) {
      setResumen(null);
      return;
    }
    try {
      const param = retoque ? "?solo_retoques=1" : "";
      const res = await axios.get(
        `http://localhost:5000/api/facturacion/resumen/${id}${param}`,
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

  const toggleSoloRetoque = () => {
    const nuevoValor = !soloRetoque;
    setSoloRetoque(nuevoValor);
    if (tatuajeId) {
      consultarSesiones(tatuajeId, nuevoValor);
    }
  };

  const handleGenerarFactura = async (e) => {
    e.preventDefault();
    if (!numFactura || !tatuajeId || !resumen) {
      setError("Por favor completa todos los campos.");
      return;
    }

    const anticipoDeducido = parseFloat(resumen.anticipo_guardado);
    const totalFinal = parseFloat(resumen.total_calculado) - anticipoDeducido;
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
        cliente: tatuajeSeleccionado?.nombre_cliente || "Cliente",
        subtotal: resumen.total_calculado,
        anticipo: anticipoDeducido,
        total_sesiones: resumen.total_sesiones,
        sesiones: resumen.sesiones_detalladas,
        tatuador: usuarioActivo?.nombre || "Tatuador",
        tatuador_id: usuarioActivo?.id_usuario || "",
      });

      setExito(`Factura #${numFactura} emitida exitosamente.`);
      setError("");
      setResumen(null);
      setNumFactura("");

      cargarFacturas();
      cargarSiguienteNumero();
      if (onFacturaGenerada) onFacturaGenerada();
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Error al procesar la factura.",
      );
    }
  };

  const generarCUFE = (num) => {
    const chars = "0123456789abcdef";
    let cufe = "";
    for (let i = 0; i < 40; i++) cufe += chars[Math.floor(Math.random() * 16)];
    return cufe;
  };

  return (
    <div className="card-form">
      <h3 className="no-print">Facturacion Electronica</h3>
      {error && <p className="error">{error}</p>}
      {exito && (
        <p className="exito" style={{ color: "#2ecc71", fontWeight: "bold" }}>
          {exito}
        </p>
      )}

      {/* Lista de facturas registradas */}
      {facturasRegistradas.length > 0 && (
        <div className="no-print" style={{
          marginBottom: "20px",
          padding: "12px",
          background: "var(--bg-main)",
          borderRadius: "8px",
          border: "1px solid var(--border-color)",
        }}>
          <strong style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>
            Facturas Registradas
          </strong>
          <input
            type="text"
            placeholder="Buscar por numero, cliente o diseno..."
            value={busquedaFactura}
            onChange={(e) => setBusquedaFactura(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              marginTop: "8px",
              marginBottom: "8px",
              borderRadius: "6px",
              border: "1px solid var(--border-color)",
              background: "var(--bg-input)",
              color: "var(--text-main)",
              fontSize: "12px",
              boxSizing: "border-box",
            }}
          />
          <div style={{ maxHeight: "140px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "6px" }}>
            {facturasRegistradas.filter((f) => {
              const q = busquedaFactura.toLowerCase();
              return !q || String(f.num_factura).includes(q) || f.nombre_cliente.toLowerCase().includes(q) || f.diseno.toLowerCase().includes(q);
            }).map((f) => (
              <div
                key={f.num_factura}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 10px",
                  background: "var(--bg-card)",
                  borderRadius: "6px",
                  fontSize: "13px",
                }}
              >
                <div>
                  <strong style={{ color: "var(--accent-color)" }}>#{f.num_factura}</strong>
                  {" — "}
                  <span>{f.nombre_cliente}</span>
                  <span style={{ color: "var(--text-muted)", marginLeft: "6px" }}>
                    ({f.diseno})
                  </span>
                </div>
                <span style={{ fontWeight: "bold", color: "var(--color-success)" }}>
                  ${parseFloat(f.total).toLocaleString("es-CO")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleGenerarFactura} className="no-print">
        <div style={{ position: "relative" }}>
          <input
            type="number"
            placeholder="Numero de Factura"
            value={numFactura}
            onChange={(e) => setNumFactura(e.target.value)}
          />
          {siguienteNum && !numFactura && (
            <button
              type="button"
              onClick={() => setNumFactura(String(siguienteNum))}
              style={{
                position: "absolute",
                right: "8px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "rgba(244, 208, 63, 0.15)",
                color: "var(--accent-color)",
                border: "1px solid var(--accent-color)",
                borderRadius: "6px",
                padding: "4px 10px",
                fontSize: "11px",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              Siguiente: #{siguienteNum}
            </button>
          )}
        </div>

        <select
          value={tatuajeId}
          onChange={(e) => { setSoloRetoque(false); consultarSesiones(e.target.value, false); }}
        >
          <option value="">-- Selecciona el Tatuaje a Liquidar --</option>
          {tatuajes.map((t) => (
            <option key={t.id_tatuaje} value={t.id_tatuaje}>
              {t.diseno} — {t.nombre_cliente} (ID: {t.id_tatuaje})
            </option>
          ))}
        </select>

        {tatuajeId && (
          <button
            type="button"
            onClick={toggleSoloRetoque}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: soloRetoque ? "2px solid var(--color-warning)" : "1px solid var(--border-color)",
              background: soloRetoque ? "rgba(243, 156, 18, 0.15)" : "var(--bg-input)",
              color: soloRetoque ? "var(--color-warning)" : "var(--text-muted)",
              cursor: "pointer",
              fontWeight: "700",
              fontSize: "12px",
              textTransform: "uppercase",
              transition: "all 0.2s ease",
            }}
          >
            {soloRetoque ? "SOLO RETOQUE — Facturando unicamente retoques" : "Paga Solo Retoque"}
          </button>
        )}

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
            <h4>Deduccion de Valores</h4>
            <p>
              <strong>N de Sesiones Nuevas:</strong> {resumen.total_sesiones}
            </p>
            <p>
              <strong>Subtotal de Horas:</strong> $
              {parseFloat(resumen.total_calculado).toLocaleString("es-CO")}
            </p>
            <p style={{ color: "#ff6b6b" }}>
              <strong>Anticipo Registrado:</strong> -$
              {parseFloat(resumen.anticipo_guardado).toLocaleString("es-CO")}
            </p>
            <hr style={{ borderColor: "#444" }} />
            <p style={{ fontSize: "18px", color: "#f4d03f" }}>
              <strong>Neto a Cobrar:</strong> $
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
          Confirmar y Emitir Factura Electronica
        </button>
      </form>

      {facturaEmitida && (
        <div style={{ marginTop: "15px" }} className="no-print">
          <button
            onClick={() => window.print()}
            style={{ background: "#2ecc71", color: "#fff", width: "100%", padding: "12px", borderRadius: "8px", border: "none", fontWeight: "700", cursor: "pointer" }}
          >
            Descargar Factura Electronica PDF
          </button>
        </div>
      )}

      {/* FACTURA ELECTRONICA COLOMBIANA - FORMATO IMPRIMIBLE */}
      {facturaEmitida && (
        <div className="print-only factura-electronica">
          <div className="fe-header">
            <div className="fe-empresa">
              <h2>ART INK TATTOO STUDIO</h2>
              <p>NIT: 901.234.567-8</p>
              <p>Regimen Responsable de IVA</p>
              <p>Resolucion DIAN No. 18764005678901</p>
              <p>Fecha Res: 2024-01-15 | Vigencia: 2026-01-15</p>
              <p>Rango autorizado: FE-001 a FE-5000</p>
              <p>Actividad Economica: 9609 - Otras actividades de servicios personales n.c.p.</p>
              <p>Direccion: Calle 10 #5-32, Local 201</p>
              <p>Tel: +57 300 123 4567</p>
            </div>
            <div className="fe-numero">
              <h3>FACTURA ELECTRONICA DE VENTA</h3>
              <p className="fe-num-grande">No. FE-{String(facturaEmitida.num_factura).padStart(4, "0")}</p>
              <p>Fecha de Expedicion: {facturaEmitida.fecha_emision}</p>
              <p>Fecha de Vencimiento: {facturaEmitida.fecha_emision}</p>
              <p>Forma de Pago: Contado</p>
              <p>Medio de Pago: Efectivo</p>
            </div>
          </div>

          <div className="fe-partes">
            <div className="fe-parte">
              <h4>DATOS DEL PRESTADOR DEL SERVICIO (TATUADOR)</h4>
              <p><strong>Nombre:</strong> {facturaEmitida.tatuador}</p>
              <p><strong>CC/NIT:</strong> {facturaEmitida.tatuador_id}</p>
              <p><strong>Responsabilidad:</strong> Prestador de servicios</p>
            </div>
            <div className="fe-parte">
              <h4>DATOS DEL ADQUIRIENTE (CLIENTE)</h4>
              <p><strong>Nombre:</strong> {facturaEmitida.cliente}</p>
              <p><strong>Tipo Doc:</strong> Cedula de Ciudadania</p>
              <p><strong>Diseno solicitado:</strong> {facturaEmitida.diseno}</p>
            </div>
          </div>

          <table className="fe-tabla">
            <thead>
              <tr>
                <th>No.</th>
                <th>Descripcion del Servicio</th>
                <th>Horas</th>
                <th>Vlr. Unitario</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {facturaEmitida.sesiones.map((s, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>Sesion de tatuaje — {s.tipo_trabajo} ({s.fecha?.split("T")[0] || s.fecha})</td>
                  <td>{s.duracion_horas}h</td>
                  <td>${(parseFloat(s.valor) / parseFloat(s.duracion_horas)).toLocaleString("es-CO", { minimumFractionDigits: 0 })}</td>
                  <td>${parseFloat(s.valor).toLocaleString("es-CO")}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="fe-totales">
            <div className="fe-total-fila">
              <span>Subtotal Servicios:</span>
              <span>${parseFloat(facturaEmitida.subtotal).toLocaleString("es-CO")}</span>
            </div>
            <div className="fe-total-fila">
              <span>Anticipo Aplicado:</span>
              <span>-${parseFloat(facturaEmitida.anticipo).toLocaleString("es-CO")}</span>
            </div>
            <div className="fe-total-fila">
              <span>Base Gravable (IVA 0% - Servicio Personal):</span>
              <span>${parseFloat(facturaEmitida.total).toLocaleString("es-CO")}</span>
            </div>
            <div className="fe-total-fila">
              <span>IVA (0%):</span>
              <span>$0</span>
            </div>
            <div className="fe-total-fila fe-total-final">
              <span>TOTAL A PAGAR:</span>
              <span>${parseFloat(facturaEmitida.total).toLocaleString("es-CO")}</span>
            </div>
          </div>

          <div className="fe-cufe">
            <p><strong>CUFE:</strong> {generarCUFE(facturaEmitida.num_factura)}</p>
            <p style={{ fontSize: "9px", marginTop: "4px" }}>Codigo Unico de Facturacion Electronica - Validacion ante DIAN</p>
          </div>

          <div className="fe-footer">
            <p>Documento generado por computador - Factura Electronica de Venta</p>
            <p>Resolucion de Facturacion DIAN vigente</p>
            <p>ART INK TATTOO STUDIO — Donde el arte cobra vida</p>
          </div>
        </div>
      )}
    </div>
  );
}
