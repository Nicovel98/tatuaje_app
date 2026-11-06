import { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function ClienteHistorialModal({ cliente, onClose }) {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const modalRef = useRef(null);
  const cerrarBtnRef = useRef(null);

  const [nuevoPago, setNuevoPago] = useState({
    id_pago: "",
    fecha: new Date().toISOString().split("T")[0],
    valor: "",
    tipo: "EFECTIVO",
    num_factura: "",
  });
  const [siguientePagoId, setSiguientePagoId] = useState(null);

  const cargarEstadoCuenta = async () => {
    setCargando(true);
    try {
      const [resEstado, resSig] = await Promise.all([
        axios.get(`http://localhost:5000/api/clientes/${cliente.id_cliente}/estado-cuenta`),
        axios.get("http://localhost:5000/api/pagos/siguiente-id"),
      ]);
      setDatos(resEstado.data);
      setSiguientePagoId(resSig.data.siguiente);
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Error al cargar estado de cuenta del cliente.");
    }
    setCargando(false);
  };

  useEffect(() => {
    if (!cliente) return;
    let cancel = false;
    const fetchEstado = async () => {
      setCargando(true);
      try {
        const [resEstado, resSig] = await Promise.all([
          axios.get(`http://localhost:5000/api/clientes/${cliente.id_cliente}/estado-cuenta`),
          axios.get("http://localhost:5000/api/pagos/siguiente-id"),
        ]);
        if (!cancel) {
          setDatos(resEstado.data);
          setSiguientePagoId(resSig.data.siguiente);
          setError("");
        }
      } catch (err) {
        if (!cancel) {
          setError(err.response?.data?.error || "Error al cargar estado de cuenta del cliente.");
        }
      } finally {
        if (!cancel) setCargando(false);
      }
    };
    fetchEstado();
    return () => { cancel = true; };
  }, [cliente]);

  // ── Trampa de foco: enfocar modal al abrir, cerrar con Escape ──
  useEffect(() => {
    cerrarBtnRef.current?.focus();
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      // Trampa de Tab dentro del modal
      if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last.focus(); }
        } else {
          if (document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleRegistrarPago = async (e) => {
    e.preventDefault();
    if (!nuevoPago.id_pago || !nuevoPago.fecha || !nuevoPago.valor || !nuevoPago.num_factura) {
      setError("Complete todos los campos del abono.");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/pagos", {
        ...nuevoPago,
        id_pago: parseInt(nuevoPago.id_pago),
        valor: parseFloat(nuevoPago.valor),
        num_factura: parseInt(nuevoPago.num_factura),
      });

      setExito("Abono / Pago registrado exitosamente.");
      setError("");
      setNuevoPago({
        id_pago: "",
        fecha: new Date().toISOString().split("T")[0],
        valor: "",
        tipo: "EFECTIVO",
        num_factura: "",
      });
      cargarEstadoCuenta();
    } catch (err) {
      setError(err.response?.data?.error || "Error al procesar el pago.");
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Historial de pagos: ${cliente.nombre}`}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(4px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        padding: "20px",
      }}
    >
      <div
        ref={modalRef}
        className="fade-in"
        style={{
          background: "var(--bg-card)",
          borderRadius: "12px",
          border: "1px solid var(--border-color)",
          maxWidth: "800px",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "24px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
          color: "var(--text-main)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "20px", color: "var(--accent-color)" }}>
              Perfil y Estado de Pagos (HU-08)
            </h3>
            <p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: "14px" }}>
              Cliente: <strong>{cliente.nombre}</strong> (CC: {cliente.id_cliente}) | Tel: {cliente.telefono}
            </p>
          </div>
          <button
            ref={cerrarBtnRef}
            onClick={onClose}
            aria-label="Cerrar historial"
            style={{
              background: "transparent",
              border: "1px solid var(--border-color)",
              color: "var(--text-muted)",
              borderRadius: "6px",
              padding: "6px 12px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "700",
            }}
          >
            ✕ Cerrar
          </button>
        </div>

        {error && <p className="error" style={{ marginBottom: "12px" }}>{error}</p>}
        {exito && <p className="exito" style={{ color: "#2ecc71", fontWeight: "bold", marginBottom: "12px" }}>{exito}</p>}

        {cargando ? (
          <p style={{ textAlign: "center", padding: "20px" }}>Cargando información financiera...</p>
        ) : datos ? (
          <>
            {/* Tarjetas de Resumen Financiero */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "12px",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  background: "var(--bg-main)",
                  padding: "14px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-color)",
                }}
              >
                <small style={{ color: "var(--text-muted)", textTransform: "uppercase", fontSize: "11px" }}>Total Facturado</small>
                <p style={{ fontSize: "18px", fontWeight: "bold", margin: "4px 0 0", color: "var(--text-main)" }}>
                  ${datos.totales.total_facturado.toLocaleString("es-CO")}
                </p>
              </div>

              <div
                style={{
                  background: "var(--bg-main)",
                  padding: "14px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-color)",
                }}
              >
                <small style={{ color: "var(--text-muted)", textTransform: "uppercase", fontSize: "11px" }}>Total Pagado</small>
                <p style={{ fontSize: "18px", fontWeight: "bold", margin: "4px 0 0", color: "var(--color-success)" }}>
                  ${datos.totales.total_pagado.toLocaleString("es-CO")}
                </p>
              </div>

              <div
                style={{
                  background: "var(--bg-main)",
                  padding: "14px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-color)",
                }}
              >
                <small style={{ color: "var(--text-muted)", textTransform: "uppercase", fontSize: "11px" }}>Saldo Pendiente</small>
                <p
                  style={{
                    fontSize: "18px",
                    fontWeight: "bold",
                    margin: "4px 0 0",
                    color: datos.totales.saldo_pendiente > 0 ? "var(--color-danger)" : "var(--color-success)",
                  }}
                >
                  ${datos.totales.saldo_pendiente.toLocaleString("es-CO")}
                </p>
              </div>

              <div
                style={{
                  background: "var(--bg-main)",
                  padding: "14px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-color)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <small style={{ color: "var(--text-muted)", textTransform: "uppercase", fontSize: "11px" }}>Estado de Cuenta</small>
                {datos.totales.al_dia ? (
                  <span
                    style={{
                      background: "rgba(46, 204, 113, 0.2)",
                      color: "#2ecc71",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontWeight: "700",
                      fontSize: "12px",
                      marginTop: "6px",
                    }}
                  >
                    ✓ Al día (Sin deudas)
                  </span>
                ) : (
                  <span
                    style={{
                      background: "rgba(231, 76, 60, 0.2)",
                      color: "#e74c3c",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontWeight: "700",
                      fontSize: "12px",
                      marginTop: "6px",
                    }}
                  >
                    ⚠ Deuda pendiente
                  </span>
                )}
              </div>
            </div>

            {/* Listado de Movimientos Cronológicos */}
            <h4 style={{ marginBottom: "8px", color: "var(--accent-color)" }}>Historial de Movimientos</h4>
            {datos.movimientos.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>No se registran facturas ni abonos para este cliente.</p>
            ) : (
              <div style={{ maxHeight: "200px", overflowY: "auto", marginBottom: "20px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border-color)", color: "var(--text-muted)" }}>
                      <th style={{ padding: "6px 8px" }}>Fecha</th>
                      <th style={{ padding: "6px 8px" }}>Concepto</th>
                      <th style={{ padding: "6px 8px" }}>Tipo</th>
                      <th style={{ padding: "6px 8px", textAlign: "right" }}>Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {datos.movimientos.map((m, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <td style={{ padding: "6px 8px" }}>{m.fecha?.split("T")[0] || m.fecha}</td>
                        <td style={{ padding: "6px 8px" }}>{m.concepto}</td>
                        <td style={{ padding: "6px 8px" }}>
                          <span
                            style={{
                              fontSize: "10px",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              fontWeight: "700",
                              background:
                                m.tipo === "FACTURA"
                                  ? "rgba(52, 152, 218, 0.15)"
                                  : m.tipo === "ANTICIPO"
                                  ? "rgba(244, 208, 63, 0.15)"
                                  : "rgba(46, 204, 113, 0.15)",
                              color:
                                m.tipo === "FACTURA"
                                  ? "var(--color-info)"
                                  : m.tipo === "ANTICIPO"
                                  ? "var(--accent-color)"
                                  : "var(--color-success)",
                            }}
                          >
                            {m.tipo}
                          </span>
                        </td>
                        <td
                          style={{
                            padding: "6px 8px",
                            textAlign: "right",
                            fontWeight: "bold",
                            color: m.tipo === "FACTURA" ? "var(--text-main)" : "var(--color-success)",
                          }}
                        >
                          ${m.valor.toLocaleString("es-CO")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Formulario para Registrar Abono a Facturas Pendientes */}
            {datos.facturas.some((f) => f.saldo_pendiente > 0) && (
              <div
                style={{
                  background: "var(--bg-main)",
                  padding: "16px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-color)",
                }}
              >
                <h4 style={{ margin: "0 0 10px", color: "var(--accent-color)" }}>Registrar Nuevo Abono / Pago</h4>
                <form onSubmit={handleRegistrarPago} style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                  <div style={{ position: "relative", flex: 1, minWidth: "140px" }}>
                    <input
                      type="number"
                      placeholder="ID Pago / Comprobante"
                      value={nuevoPago.id_pago}
                      onChange={(e) => setNuevoPago({ ...nuevoPago, id_pago: e.target.value })}
                      style={{ width: "100%", padding: "8px 10px", fontSize: "12px", boxSizing: "border-box" }}
                    />
                    {siguientePagoId && !nuevoPago.id_pago && (
                      <button
                        type="button"
                        onClick={() => setNuevoPago({ ...nuevoPago, id_pago: String(siguientePagoId) })}
                        style={{
                          position: "absolute",
                          right: "6px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "rgba(244, 208, 63, 0.15)",
                          color: "var(--accent-color)",
                          border: "1px solid var(--accent-color)",
                          borderRadius: "4px",
                          padding: "2px 6px",
                          fontSize: "10px",
                          fontWeight: "700",
                          cursor: "pointer",
                        }}
                      >
                        #{siguientePagoId}
                      </button>
                    )}
                  </div>

                  <select
                    value={nuevoPago.num_factura}
                    onChange={(e) => {
                      const fac = datos.facturas.find((f) => f.num_factura === parseInt(e.target.value));
                      setNuevoPago({
                        ...nuevoPago,
                        num_factura: e.target.value,
                        valor: fac ? String(fac.saldo_pendiente) : nuevoPago.valor,
                      });
                    }}
                    style={{ flex: 2, minWidth: "220px", padding: "8px 10px", fontSize: "12px" }}
                  >
                    <option value="">-- Seleccionar Factura con Saldo Pendiente --</option>
                    {datos.facturas
                      .filter((f) => f.saldo_pendiente > 0)
                      .map((f) => (
                        <option key={f.num_factura} value={f.num_factura}>
                          Factura #{f.num_factura} ({f.diseno}) — Debe: ${f.saldo_pendiente.toLocaleString("es-CO")}
                        </option>
                      ))}
                  </select>

                  <input
                    type="number"
                    step="1000"
                    placeholder="Monto a abonar ($)"
                    value={nuevoPago.valor}
                    onChange={(e) => setNuevoPago({ ...nuevoPago, valor: e.target.value })}
                    style={{ flex: 1, minWidth: "140px", padding: "8px 10px", fontSize: "12px" }}
                  />

                  <select
                    value={nuevoPago.tipo}
                    onChange={(e) => setNuevoPago({ ...nuevoPago, tipo: e.target.value })}
                    style={{ flex: 1, minWidth: "120px", padding: "8px 10px", fontSize: "12px" }}
                  >
                    <option value="EFECTIVO">Efectivo</option>
                    <option value="TRANSFERENCIA">Transferencia</option>
                    <option value="TARJETA">Tarjeta</option>
                  </select>

                  <button
                    type="submit"
                    style={{
                      background: "var(--color-success)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      padding: "8px 16px",
                      fontWeight: "700",
                      fontSize: "12px",
                      cursor: "pointer",
                      marginTop: 0,
                    }}
                  >
                    Guardar Abono
                  </button>
                </form>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
