import { useState, useEffect } from "react";
import api from "../services/api";

export default function FacturaForm({ usuarioActivo }) {
  const [sesiones, setSesiones] = useState([]);
  const [facturas, setFacturas] = useState([]);
  const [sesionSeleccionadaObj, setSesionSeleccionadaObj] = useState(null);
  const [formData, setFormData] = useState({
    sesion_id: "",
    fecha_emision: new Date().toISOString().split("T")[0],
    horas_facturadas: "0",
    valor_unitario: "0",
    subtotal: "0",
    total: "0",
    tipo_pago: "",
    monto_pagado: "",
  });

  const [pagoModal, setPagoModal] = useState(null);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  const cargarDatos = async () => {
    try {
      const [resS, resF] = await Promise.all([
        api.get("/sesiones"),
        api.get("/facturas"),
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
      setSesionSeleccionadaObj(null);
      setFormData({
        ...formData,
        sesion_id: "",
        horas_facturadas: "0",
        valor_unitario: "0",
        subtotal: "0",
        total: "0",
        monto_pagado: "0",
      });
      return;
    }

    setSesionSeleccionadaObj(ses);
    const horas = parseFloat(ses.duracion_horas || 1);
    const totalVal = parseFloat(ses.valor || 0);
    const anticipoVal = parseFloat(ses.anticipo || 0);
    const saldoPendiente = Math.max(0, totalVal - anticipoVal);
    const unitario = horas > 0 ? (totalVal / horas).toFixed(2) : totalVal;

    setFormData({
      ...formData,
      sesion_id: sId,
      horas_facturadas: String(horas),
      valor_unitario: String(unitario),
      subtotal: String(totalVal),
      total: String(saldoPendiente),
      monto_pagado: String(saldoPendiente),
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
        monto_pagado: formData.tipo_pago ? parseFloat(formData.monto_pagado || formData.total) : 0.0,
        usuario_creacion: usuarioActivo?.nombre || "ADMIN",
      };

      await api.post("/facturas", payload);
      setExito("¡Factura emitida exitosamente!");
      setSesionSeleccionadaObj(null);
      setFormData({
        sesion_id: "",
        fecha_emision: new Date().toISOString().split("T")[0],
        horas_facturadas: "0",
        valor_unitario: "0",
        subtotal: "0",
        total: "0",
        tipo_pago: "",
        monto_pagado: "",
      });
      cargarDatos();
    } catch (err) {
      setError(err.response?.data?.error || "Error al emitir factura.");
    }
  };

  const handleRegistrarPago = async (e) => {
    e.preventDefault();
    if (!pagoModal) return;

    try {
      await api.put(`/facturas/${pagoModal.id_factura}/pago`, {
        tipo_pago: pagoModal.tipo_pago,
        monto_pagado: parseFloat(pagoModal.monto_pagado),
        usuario_modificador: usuarioActivo?.nombre || "ADMIN",
      });
      setPagoModal(null);
      cargarDatos();
    } catch (err) {
      alert(err.response?.data?.error || "Error al registrar pago.");
    }
  };

  const handleEliminarFactura = async (id) => {
    if (!window.confirm(`¿Seguro que deseas anular la factura #${id}?`)) return;
    try {
      await api.delete(`/facturas/${id}`, {
        data: { usuario_modificador: usuarioActivo?.nombre || "ADMIN" },
      });
      cargarDatos();
    } catch (err) {
      alert(err.response?.data?.error || "Error al anular factura.");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
      {/* Formulario de Emisión */}
      <div className="card-form">
        <h3>Emitir Comprobante / Factura</h3>
        <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "12px" }}>
          Emisión de comprobantes y control de pagos asociados a cada sesión.
        </p>
        {error && <p className="error">{error}</p>}
        {exito && <p className="exito" style={{ color: "#2ecc71" }}>{exito}</p>}

        <form onSubmit={handleEmitirFactura}>
          <div style={{ marginBottom: "10px" }}>
            <label style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
              Fecha de Emisión
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
            {sesiones.map((s) => {
              const cli = s.cliente?.nombre || s.Cliente?.nombre || "Cliente";
              const tat = s.tatuaje?.diseno || s.Tatuaje?.diseno || "Diseño";
              const tieneAnticipo = Number(s.anticipo) > 0;
              return (
                <option key={s.id_sesion} value={s.id_sesion}>
                  Sesión #{s.id_sesion} | {cli} | {tat} | Valor: ${Number(s.valor).toLocaleString("es-CO")}
                  {tieneAnticipo ? ` (Anticipo: $${Number(s.anticipo).toLocaleString("es-CO")})` : ""}
                </option>
              );
            })}
          </select>

          {sesionSeleccionadaObj && Number(sesionSeleccionadaObj.anticipo) > 0 && (
            <div style={{
              background: "rgba(244, 208, 63, 0.08)",
              border: "1px solid rgba(244, 208, 63, 0.2)",
              padding: "10px 14px",
              borderRadius: "6px",
              marginBottom: "12px",
              fontSize: "12px",
              display: "flex",
              justifyContent: "space-between",
            }}>
              <span>Valor Sesión: <strong>${Number(sesionSeleccionadaObj.valor).toLocaleString("es-CO")}</strong></span>
              <span>Anticipo Abonado: <strong style={{ color: "var(--accent-color)" }}>-${Number(sesionSeleccionadaObj.anticipo).toLocaleString("es-CO")}</strong></span>
              <span>Saldo a Pagar: <strong style={{ color: "#2ecc71" }}>${Math.max(0, Number(sesionSeleccionadaObj.valor) - Number(sesionSeleccionadaObj.anticipo)).toLocaleString("es-CO")}</strong></span>
            </div>
          )}

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
                  const anticipo = sesionSeleccionadaObj ? parseFloat(sesionSeleccionadaObj.anticipo || 0) : 0;
                  const saldo = Math.max(0, sub - anticipo);
                  setFormData({
                    ...formData,
                    horas_facturadas: h,
                    subtotal: String(sub),
                    total: String(saldo),
                    monto_pagado: String(saldo),
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
                  const anticipo = sesionSeleccionadaObj ? parseFloat(sesionSeleccionadaObj.anticipo || 0) : 0;
                  const saldo = Math.max(0, sub - anticipo);
                  setFormData({
                    ...formData,
                    valor_unitario: u,
                    subtotal: String(sub),
                    total: String(saldo),
                    monto_pagado: String(saldo),
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
                    <button
                      className="btn-danger-sm"
                      style={{ marginLeft: "5px" }}
                      onClick={() => handleEliminarFactura(f.id_factura)}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: "15px" }}>
                  No hay facturas emitidas aún.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal para Registro de Pago Posterior */}
      {pagoModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: "400px" }}>
            <h4>Registrar Pago - Factura #{pagoModal.id_factura}</h4>
            <form onSubmit={handleRegistrarPago}>
              <div style={{ marginBottom: "10px" }}>
                <label style={{ fontSize: "11px", color: "var(--text-muted)" }}>Método de Pago</label>
                <select
                  value={pagoModal.tipo_pago}
                  onChange={(e) => setPagoModal({ ...pagoModal, tipo_pago: e.target.value })}
                  required
                >
                  <option value="EFECTIVO">Efectivo</option>
                  <option value="TRANSFERENCIA">Transferencia</option>
                  <option value="TARJETA">Tarjeta</option>
                </select>
              </div>

              <div style={{ marginBottom: "10px" }}>
                <label style={{ fontSize: "11px", color: "var(--text-muted)" }}>Monto a Pagar ($)</label>
                <input
                  type="number"
                  value={pagoModal.monto_pagado}
                  onChange={(e) => setPagoModal({ ...pagoModal, monto_pagado: e.target.value })}
                  required
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setPagoModal(null)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Confirmar Pago
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
