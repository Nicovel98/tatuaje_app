import { useState, useEffect } from "react";
import api from "../services/api";
import Modal from "./Modal";

export default function ClienteEstadoCuentaModal({ isOpen, onClose, cliente }) {
  const [estadoCuenta, setEstadoCuenta] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen || !cliente) return;
    const cargar = async () => {
      setCargando(true);
      setError("");
      try {
        const res = await api.get(`/clientes/${cliente.id_cliente}/estado-cuenta`);
        setEstadoCuenta(res.data);
      } catch (err) {
        setError(err.response?.data?.error || "Error al obtener estado de cuenta.");
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [isOpen, cliente]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Historial de Pagos y Saldo: ${cliente?.nombre || ""}`}
      subtitle={`Identificación: #${cliente?.id_cliente || ""} | Tel: ${cliente?.telefono || ""}`}
      maxWidth="650px"
    >
      {cargando && <p style={{ color: "var(--text-muted)" }}>Cargando estado de cuenta...</p>}
      {error && <p className="error">{error}</p>}

      {estadoCuenta && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Tarjetas de Resumen */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
            <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-color)", textAlign: "center" }}>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>Total Contratado</div>
              <div style={{ fontSize: "18px", fontWeight: "bold", color: "var(--text-main)", marginTop: "4px" }}>
                ${Number(estadoCuenta.total_contratado).toLocaleString("es-CO")}
              </div>
            </div>

            <div style={{ background: "rgba(46, 204, 113, 0.08)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(46, 204, 113, 0.2)", textAlign: "center" }}>
              <div style={{ fontSize: "11px", color: "#2ecc71", textTransform: "uppercase" }}>Total Pagado</div>
              <div style={{ fontSize: "18px", fontWeight: "bold", color: "#2ecc71", marginTop: "4px" }}>
                ${Number(estadoCuenta.total_pagado).toLocaleString("es-CO")}
              </div>
            </div>

            <div style={{ background: estadoCuenta.saldo_pendiente > 0 ? "rgba(231, 76, 60, 0.08)" : "rgba(52, 152, 219, 0.08)", padding: "12px", borderRadius: "8px", border: estadoCuenta.saldo_pendiente > 0 ? "1px solid rgba(231, 76, 60, 0.2)" : "1px solid rgba(52, 152, 219, 0.2)", textAlign: "center" }}>
              <div style={{ fontSize: "11px", color: estadoCuenta.saldo_pendiente > 0 ? "#e74c3c" : "#3498db", textTransform: "uppercase" }}>Saldo Pendiente</div>
              <div style={{ fontSize: "18px", fontWeight: "bold", color: estadoCuenta.saldo_pendiente > 0 ? "#e74c3c" : "#3498db", marginTop: "4px" }}>
                ${Number(estadoCuenta.saldo_pendiente).toLocaleString("es-CO")}
              </div>
            </div>
          </div>

          {/* Banner de Estado */}
          {estadoCuenta.esta_al_dia ? (
            <div style={{ background: "rgba(46, 204, 113, 0.15)", color: "#2ecc71", padding: "10px 14px", borderRadius: "6px", fontWeight: "600", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>✓</span> El cliente está al día con sus pagos (sin deudas).
            </div>
          ) : (
            <div style={{ background: "rgba(243, 156, 18, 0.15)", color: "#f39c12", padding: "10px 14px", borderRadius: "6px", fontWeight: "600", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>⚠</span> El cliente presenta un saldo pendiente de ${Number(estadoCuenta.saldo_pendiente).toLocaleString("es-CO")}.
            </div>
          )}

          {/* Desglose de Movimientos */}
          <div>
            <h4 style={{ margin: "10px 0 8px 0", fontSize: "14px", color: "var(--accent-color)" }}>
              Detalle de Movimientos y Abonos
            </h4>
            {(!estadoCuenta.movimientos || estadoCuenta.movimientos.length === 0) ? (
              <p style={{ color: "var(--text-muted)", fontSize: "12px" }}>No registra movimientos de pago aún.</p>
            ) : (
              <table style={{ width: "100%", fontSize: "12px" }}>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Concepto</th>
                    <th>Tipo</th>
                    <th style={{ textAlign: "right" }}>Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {estadoCuenta.movimientos.map((m, idx) => (
                    <tr key={idx}>
                      <td>{m.fecha}</td>
                      <td>{m.concepto}</td>
                      <td>
                        <span style={{
                          padding: "2px 6px",
                          borderRadius: "4px",
                          fontSize: "10px",
                          background: m.tipo === "ANTICIPO" ? "rgba(244, 208, 63, 0.15)" : "rgba(46, 204, 113, 0.15)",
                          color: m.tipo === "ANTICIPO" ? "var(--accent-color)" : "#2ecc71",
                          fontWeight: "bold",
                        }}>
                          {m.tipo}
                        </span>
                      </td>
                      <td style={{ textAlign: "right", fontWeight: "bold" }}>
                        ${Number(m.monto).toLocaleString("es-CO")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px" }}>
            <button type="button" onClick={onClose} className="btn-cancel">
              Cerrar
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
