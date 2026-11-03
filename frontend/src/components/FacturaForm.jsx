import { useState, useEffect } from "react";
import axios from "axios";

export default function FacturaForm({ usuarioActivo, onFacturaGenerada }) {
  const [sesiones, setSesiones] = useState([]);
  const [facturas, setFacturas] = useState([]);
  const [formData, setFormData] = useState({
    id_factura: "",
    sesion_id: "",
    fecha_emision: new Date().toISOString().split("T")[0],
    horas_facturadas: "2.0",
    valor_unitario: "0",
    subtotal: "0",
    total: "0",
    tipo_pago: "",
    monto_pagado: "0",
  });

  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [pagoModal, setPagoModal] = useState(null); // Factura seleccionada para pagar

  const cargarDatos = async () => {
    try {
      const [resS, resF] = await Promise.all([
        axios.get("http://localhost:5000/api/sesiones"),
        axios.get("http://localhost:5000/api/facturas"),
      ]);
      setSesiones(resS.data);
      setFacturas(resF.data);
    } catch (err) {
      console.error("Error al cargar datos de facturación:", err);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleSeleccionarSesion = (sId) => {
    const ses = sesiones.find((s) => s.id_sesion === parseInt(sId));
    if (!ses) {
      setFormData({
        ...formData,
        sesion_id: "",
        horas_facturadas: "0",
        valor_unitario: "0",
        subtotal: "0",
        total: "0",
      });
      return;
    }

    const horas = parseFloat(ses.duracion_horas || 1);
    const totalVal = parseFloat(ses.valor || 0);
    const unitario = horas > 0 ? (totalVal / horas).toFixed(2) : totalVal;

    setFormData({
      ...formData,
      sesion_id: sId,
      horas_facturadas: String(horas),
      valor_unitario: String(unitario),
      subtotal: String(totalVal),
      total: String(totalVal),
      monto_pagado: String(totalVal),
    });
  };

  const handleEmitirFactura = async (e) => {
    e.preventDefault();
    setError("");
    setExito("");

    if (!formData.sesion_id || !formData.total) {
      setError("Por favor completa todos los campos requeridos.");
      return;
    }

    try {
      const payload = {
        sesion_id: parseInt(formData.sesion_id),
        fecha_emision: formData.fecha_emision,
        horas_facturadas: parseFloat(formData.horas_facturadas),
        valor_unitario: parseFloat(formData.valor_unitario),
        subtotal: parseFloat(formData.subtotal),
        total: parseFloat(formData.total),
        tipo_pago: formData.tipo_pago || null,
        monto_pagado: formData.tipo_pago ? parseFloat(formData.monto_pagado) : 0,
        usuario_creacion: usuarioActivo?.nombre || "ADMIN",
      };

      await axios.post("http://localhost:5000/api/facturas", payload);
      setExito("¡Factura emitida exitosamente!");
      setFormData({
        id_factura: "",
        sesion_id: "",
        fecha_emision: new Date().toISOString().split("T")[0],
        horas_facturadas: "2.0",
        valor_unitario: "0",
        subtotal: "0",
        total: "0",
        tipo_pago: "",
        monto_pagado: "0",
      });
      cargarDatos();
      if (onFacturaGenerada) onFacturaGenerada();
    } catch (err) {
      setError(err.response?.data?.error || "Error al emitir factura.");
    }
  };

  const handleRegistrarPago = async (e) => {
    e.preventDefault();
    if (!pagoModal || !pagoModal.tipo_pago) return;

    try {
      await axios.put(`http://localhost:5000/api/facturas/${pagoModal.id_factura}/pago`, {
        tipo_pago: pagoModal.tipo_pago,
        monto_pagado: parseFloat(pagoModal.monto_pagado || pagoModal.total),
        usuario_modificador: usuarioActivo?.nombre || "ADMIN",
      });
      setExito("Pago registrado exitosamente para la factura #" + pagoModal.id_factura);
      setPagoModal(null);
      cargarDatos();
    } catch (err) {
      alert("Error registrando pago: " + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Formulario de Emisión */}
      <div className="card-form">
        <h3>Emitir Nueva Factura</h3>
        <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "12px" }}>
          Unificación de detalle y pago en la factura (asociada a Sesión).
        </p>
        {error && <p className="error">{error}</p>}
        {exito && <p className="exito" style={{ color: "#2ecc71" }}>{exito}</p>}

        <form onSubmit={handleEmitirFactura}>
          <div style={{ marginBottom: "10px" }}>
            <label style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
              Fecha de Emisión (N° Factura autoincremental)
            </label>
            <input
              type="date"
              value={formData.fecha_emision}
              onChange={(e) => setFormData({ ...formData, fecha_emision: e.target.value })}
              required
            />
          </div>

          <label style={{ fontSize: "11px", color: "var(--text-muted)" }}>Seleccionar Sesión a Facturar</label>
          <select
            value={formData.sesion_id}
            onChange={(e) => handleSeleccionarSesion(e.target.value)}
            required
          >
            <option value="">-- Selecciona una sesión --</option>
            {sesiones.map((s) => (
              <option key={s.id_sesion} value={s.id_sesion}>
                Sesión #{s.id_sesion} | {s.cliente?.nombre || "Cliente"} | {s.tatuaje?.diseno || "Diseño"} | ${Number(s.valor).toLocaleString("es-CO")}
              </option>
            ))}
          </select>

          <div style={{ display: "flex", gap: "10px" }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: "11px", color: "var(--text-muted)" }}>Horas Facturadas</label>
              <input
                type="number"
                step="0.5"
                value={formData.horas_facturadas}
                onChange={(e) => {
                  const h = e.target.value;
                  const u = parseFloat(formData.valor_unitario || 0);
                  const sub = parseFloat(h || 0) * u;
                  setFormData({
                    ...formData,
                    horas_facturadas: h,
                    subtotal: String(sub),
                    total: String(sub),
                    monto_pagado: String(sub),
                  });
                }}
                required
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: "11px", color: "var(--text-muted)" }}>Valor Unitario / Hora ($)</label>
              <input
                type="number"
                value={formData.valor_unitario}
                onChange={(e) => {
                  const u = e.target.value;
                  const h = parseFloat(formData.horas_facturadas || 0);
                  const sub = h * parseFloat(u || 0);
                  setFormData({
                    ...formData,
                    valor_unitario: u,
                    subtotal: String(sub),
                    total: String(sub),
                    monto_pagado: String(sub),
                  });
                }}
                required
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: "11px", color: "var(--text-muted)" }}>Total a Pagar ($)</label>
              <input
                type="number"
                value={formData.total}
                onChange={(e) => setFormData({ ...formData, total: e.target.value, monto_pagado: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ marginTop: "12px", padding: "10px", background: "rgba(255,255,255,0.03)", borderRadius: "6px" }}>
            <label style={{ fontSize: "12px", fontWeight: "bold" }}>Registro de Pago Inmediato (Opcional):</label>
            <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
              <div style={{ flex: 1 }}>
                <select
                  value={formData.tipo_pago}
                  onChange={(e) => setFormData({ ...formData, tipo_pago: e.target.value })}
                >
                  <option value="">Pendiente de Pago (Expedida)</option>
                  <option value="EFECTIVO">Efectivo</option>
                  <option value="TRANSFERENCIA">Transferencia</option>
                  <option value="TARJETA">Tarjeta</option>
                </select>
              </div>
              {formData.tipo_pago && (
                <div style={{ flex: 1 }}>
                  <input
                    type="number"
                    placeholder="Monto pagado"
                    value={formData.monto_pagado}
                    onChange={(e) => setFormData({ ...formData, monto_pagado: e.target.value })}
                  />
                </div>
              )}
            </div>
          </div>

          <button type="submit" style={{ marginTop: "14px" }}>Emitir Factura</button>
        </form>
      </div>

      {/* Listado de Facturas */}
      <div className="card-table">
        <h3>Historial de Facturas Emitidas</h3>
        <table>
          <thead>
            <tr>
              <th># Factura</th>
              <th>Fecha</th>
              <th>Sesión</th>
              <th>Cliente / Diseño</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Método Pago</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {facturas.length > 0 ? (
              facturas.map((f) => (
                <tr key={f.id_factura}>
                  <td><strong>#{f.id_factura}</strong></td>
                  <td>{f.fecha_emision}</td>
                  <td>Sesión #{f.sesion_id}</td>
                  <td>
                    {f.sesion?.cliente?.nombre || "Cliente"} <br />
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                      {f.sesion?.tatuaje?.diseno || "Diseño"}
                    </span>
                  </td>
                  <td><strong>${Number(f.total).toLocaleString("es-CO")}</strong></td>
                  <td>
                    <span className={`badge badge-${f.estado.toLowerCase()}`}>
                      {f.estado.toUpperCase()}
                    </span>
                  </td>
                  <td>{f.tipo_pago || "Sin registrar"}</td>
                  <td>
                    {f.estado === "expedida" && (
                      <button
                        className="btn-primary-sm"
                        onClick={() =>
                          setPagoModal({
                            id_factura: f.id_factura,
                            total: f.total,
                            tipo_pago: "EFECTIVO",
                            monto_pagado: f.total,
                          })
                        }
                      >
                        Pagar
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", color: "#888" }}>
                  No hay facturas emitidas todavía.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Registrar Pago Rápido */}
      {pagoModal && (
        <div className="modal-overlay" style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000
        }}>
          <div className="card-form" style={{ width: "400px", maxWidth: "90%" }}>
            <h3>Registrar Pago Factura #{pagoModal.id_factura}</h3>
            <p>Total a liquidar: <strong>${Number(pagoModal.total).toLocaleString("es-CO")}</strong></p>
            <form onSubmit={handleRegistrarPago}>
              <label style={{ fontSize: "11px", color: "var(--text-muted)" }}>Método de Pago</label>
              <select
                value={pagoModal.tipo_pago}
                onChange={(e) => setPagoModal({ ...pagoModal, tipo_pago: e.target.value })}
                required
              >
                <option value="EFECTIVO">EFECTIVO</option>
                <option value="TRANSFERENCIA">TRANSFERENCIA</option>
                <option value="TARJETA">TARJETA</option>
              </select>
              <label style={{ fontSize: "11px", color: "var(--text-muted)" }}>Monto Pagado</label>
              <input
                type="number"
                value={pagoModal.monto_pagado}
                onChange={(e) => setPagoModal({ ...pagoModal, monto_pagado: e.target.value })}
                required
              />
              <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                <button type="submit" style={{ flex: 1 }}>Confirmar Pago</button>
                <button
                  type="button"
                  style={{ flex: 1, background: "var(--bg-card)", border: "1px solid var(--border-color)" }}
                  onClick={() => setPagoModal(null)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
