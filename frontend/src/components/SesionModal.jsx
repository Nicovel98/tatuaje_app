import { useState, useEffect } from "react";
import api from "../services/api";
import Modal from "./Modal";
import { ZONAS_CUERPO } from "./TatuajeModal";

export default function SesionModal({
  isOpen,
  onClose,
  sesionEditar,
  tatuajes = [],
  clientes = [],
  usuarios = [],
  tarifas = [],
  usuarioActivo,
  onSesionGuardada,
}) {
  const [modoTatuaje, setModoTatuaje] = useState("existente"); // "existente" | "nuevo"
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [alertaAnticipo, setAlertaAnticipo] = useState(false);
  const [confirmadoAnticipoMayor, setConfirmadoAnticipoMayor] = useState(false);

  // Datos de la sesión
  const [formData, setFormData] = useState({
    tatuaje_id: "",
    cliente_id: "",
    usuario_id: usuarioActivo?.id_usuario || "",
    tarifa_id: "",
    fecha: new Date().toISOString().split("T")[0],
    duracion_horas: "2.0",
    es_retoque: "N",
    valor: "",
    anticipo: "0",
    ultima_sesion: false,
  });

  // Datos para creación integrada de nuevo tatuaje
  const [nuevoTatuaje, setNuevoTatuaje] = useState({
    diseno: "",
    zona_cuerpo: "Antebrazo",
    zona_otra: "",
    horas_estimadas: "2.0",
    valor_estimado: "",
  });

  useEffect(() => {
    setAlertaAnticipo(false);
    setConfirmadoAnticipoMayor(false);

    if (sesionEditar) {
      setModoTatuaje("existente");
      setFormData({
        tatuaje_id: sesionEditar.tatuaje_id || "",
        cliente_id: sesionEditar.cliente_id || "",
        usuario_id: sesionEditar.usuario_id || usuarioActivo?.id_usuario || "",
        tarifa_id: sesionEditar.tarifa_id || "",
        fecha: sesionEditar.fecha ? String(sesionEditar.fecha).split("T")[0] : new Date().toISOString().split("T")[0],
        duracion_horas: String(sesionEditar.duracion_horas || "2.0"),
        es_retoque: sesionEditar.es_retoque || "N",
        valor: String(sesionEditar.valor || ""),
        anticipo: String(sesionEditar.anticipo || "0"),
        ultima_sesion: false,
      });
    } else {
      setModoTatuaje("existente");
      setFormData({
        tatuaje_id: "",
        cliente_id: "",
        usuario_id: usuarioActivo?.id_usuario || "",
        tarifa_id: "",
        fecha: new Date().toISOString().split("T")[0],
        duracion_horas: "2.0",
        es_retoque: "N",
        valor: "",
        anticipo: "0",
        ultima_sesion: false,
      });

      setNuevoTatuaje({
        diseno: "",
        zona_cuerpo: "Antebrazo",
        zona_otra: "",
        horas_estimadas: "2.0",
        valor_estimado: "",
      });
    }
    setError("");
  }, [sesionEditar, isOpen, usuarioActivo]);

  const handleTarifaSelect = (tarifaId) => {
    const tar = tarifas.find((t) => String(t.id_tarifa) === String(tarifaId));
    if (tar) {
      const horas = parseFloat(formData.duracion_horas || 1);
      const valHora = parseFloat(tar.valor_hora || 0);
      setFormData((prev) => ({
        ...prev,
        tarifa_id: tarifaId,
        valor: String(Math.round(horas * valHora)),
      }));
    } else {
      setFormData((prev) => ({ ...prev, tarifa_id: tarifaId }));
    }
  };

  const handleRetoqueChange = (esRetoque) => {
    const tat = tatuajes.find((t) => String(t.id_tatuaje) === String(formData.tatuaje_id));
    if (esRetoque === "S" && tat?.fecha_finalizacion) {
      const fRet = new Date(formData.fecha);
      const fFin = new Date(tat.fecha_finalizacion);
      const diff = Math.floor((fRet - fFin) / (1000 * 60 * 60 * 24));
      if (diff <= 30) {
        setFormData((prev) => ({
          ...prev,
          es_retoque: "S",
          valor: "0",
          anticipo: "0",
        }));
        return;
      }
    }
    setFormData((prev) => ({ ...prev, es_retoque: esRetoque }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.cliente_id || !formData.usuario_id || !formData.fecha || formData.valor === "") {
      setError("Todos los campos principales de la sesión son obligatorios.");
      return;
    }

    const valorNum = parseFloat(formData.valor || 0);
    const anticipoNum = parseFloat(formData.anticipo || 0);

    if (anticipoNum < 0) {
      setError("El anticipo no puede ser negativo.");
      return;
    }

    // Regla CP-14: Anticipo mayor al valor estimado
    // Pide confirmación o corrección al usuario
    if (anticipoNum > valorNum && !confirmadoAnticipoMayor) {
      setAlertaAnticipo(true);
      return;
    }

    setCargando(true);
    try {
      let finalTatuajeId = formData.tatuaje_id;

      if (!sesionEditar && modoTatuaje === "nuevo") {
        const zonaFinal = nuevoTatuaje.zona_cuerpo === "Otro" ? nuevoTatuaje.zona_otra : nuevoTatuaje.zona_cuerpo;
        if (!nuevoTatuaje.diseno || !zonaFinal || nuevoTatuaje.valor_estimado === "") {
          setError("Completa todos los campos obligatorios del nuevo tatuaje.");
          setCargando(false);
          return;
        }

        const resTat = await api.post("/tatuajes", {
          diseno: nuevoTatuaje.diseno,
          zona_cuerpo: zonaFinal,
          estado: "EN_PROGRESO",
          horas_estimadas: parseFloat(nuevoTatuaje.horas_estimadas || 1),
          valor_estimado: parseFloat(nuevoTatuaje.valor_estimado),
          usuario_creacion: usuarioActivo?.nombre || "ADMIN",
        });

        finalTatuajeId = resTat.data.tatuaje.id_tatuaje;
      } else {
        if (!finalTatuajeId) {
          setError("Debes seleccionar un tatuaje existente para la sesión.");
          setCargando(false);
          return;
        }
      }

      const payload = {
        tatuaje_id: parseInt(finalTatuajeId),
        cliente_id: parseInt(formData.cliente_id),
        usuario_id: parseInt(formData.usuario_id),
        tarifa_id: formData.tarifa_id ? parseInt(formData.tarifa_id) : null,
        fecha: formData.fecha,
        duracion_horas: parseFloat(formData.duracion_horas),
        es_retoque: formData.es_retoque,
        valor: valorNum,
        anticipo: anticipoNum,
        ultima_sesion: formData.ultima_sesion,
      };

      if (sesionEditar) {
        payload.usuario_modificador = usuarioActivo?.nombre || "ADMIN";
        await api.put(`/sesiones/${sesionEditar.id_sesion}`, payload);
      } else {
        payload.usuario_creacion = usuarioActivo?.nombre || "ADMIN";
        await api.post("/sesiones", payload);
      }

      if (onSesionGuardada) onSesionGuardada();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Error al procesar la sesión.");
    } finally {
      setCargando(false);
    }
  };

  const tatSeleccionado = tatuajes.find((t) => String(t.id_tatuaje) === String(formData.tatuaje_id));
  const esRetoqueGratuito = formData.es_retoque === "S" && tatSeleccionado?.fecha_finalizacion && (
    Math.floor((new Date(formData.fecha) - new Date(tatSeleccionado.fecha_finalizacion)) / (1000 * 60 * 60 * 24)) <= 30
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={sesionEditar ? "Editar Sesión Agendada" : "Agendar Nueva Sesión de Tatuaje"}
      subtitle={
        sesionEditar
          ? `Modificando detalles de la sesión #${sesionEditar.id_sesion}`
          : "Asigna cliente, tatuador y vincula un diseño existente o crea uno nuevo en el acto."
      }
      maxWidth="680px"
    >
      {error && <p className="error" style={{ marginBottom: "14px" }}>{error}</p>}

      {/* Alerta de confirmación para anticipo mayor al valor (CP-14) */}
      {alertaAnticipo && (
        <div style={{
          background: "rgba(231, 76, 60, 0.15)",
          border: "1px solid #e74c3c",
          borderRadius: "8px",
          padding: "12px 16px",
          marginBottom: "16px",
        }}>
          <p style={{ margin: "0 0 10px 0", color: "#e74c3c", fontWeight: "bold", fontSize: "13px" }}>
            ⚠ Alerta de Validación: El anticipo ingresado (${parseFloat(formData.anticipo || 0).toLocaleString("es-CO")})
            es superior al valor total estimado (${parseFloat(formData.valor || 0).toLocaleString("es-CO")}).
          </p>
          <p style={{ margin: "0 0 12px 0", fontSize: "12px", color: "var(--text-main)" }}>
            ¿Deseas confirmar este valor de anticipo o prefieres corregirlo?
          </p>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="button"
              onClick={() => {
                setConfirmadoAnticipoMayor(true);
                setAlertaAnticipo(false);
              }}
              style={{
                background: "#e74c3c",
                color: "#fff",
                border: "none",
                padding: "6px 14px",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "12px",
              }}
            >
              Confirmar Anticipo
            </button>
            <button
              type="button"
              onClick={() => setAlertaAnticipo(false)}
              className="btn-cancel"
              style={{ padding: "6px 14px", fontSize: "12px" }}
            >
              Corregir Valor
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {!sesionEditar && (
          <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
            <button
              type="button"
              className={`view-tab-btn ${modoTatuaje === "existente" ? "active" : ""}`}
              onClick={() => setModoTatuaje("existente")}
              style={{ flex: 1, padding: "8px" }}
            >
              Vincular a Tatuaje Existente
            </button>
            <button
              type="button"
              className={`view-tab-btn ${modoTatuaje === "nuevo" ? "active" : ""}`}
              onClick={() => setModoTatuaje("nuevo")}
              style={{ flex: 1, padding: "8px" }}
            >
              Crear Nuevo Tatuaje Aquí
            </button>
          </div>
        )}

        {/* MODO 1: EXISTENTE */}
        {modoTatuaje === "existente" && (
          <div style={{ marginBottom: "14px" }}>
            <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
              Seleccionar Tatuaje en Curso / Registrado
            </label>
            <select
              value={formData.tatuaje_id}
              onChange={(e) => setFormData({ ...formData, tatuaje_id: e.target.value })}
              required
            >
              <option value="">-- Seleccionar Tatuaje --</option>
              {tatuajes.map((t) => (
                <option key={t.id_tatuaje} value={t.id_tatuaje}>
                  #{t.id_tatuaje} — {t.diseno} ({t.zona_cuerpo}) [{t.estado}]
                </option>
              ))}
            </select>
          </div>
        )}

        {/* MODO 2: NUEVO TATUAJE */}
        {modoTatuaje === "nuevo" && !sesionEditar && (
          <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "14px", borderRadius: "8px", border: "1px dashed var(--border-color)", marginBottom: "16px" }}>
            <h4 style={{ margin: "0 0 10px 0", color: "var(--accent-color)", fontSize: "13px" }}>
              Datos del Nuevo Diseño de Tatuaje
            </h4>
            <div style={{ display: "flex", gap: "10px", marginBottom: "8px" }}>
              <input
                type="text"
                placeholder="Nombre del Diseño (ej. Dragón espalda)"
                value={nuevoTatuaje.diseno}
                onChange={(e) => setNuevoTatuaje({ ...nuevoTatuaje, diseno: e.target.value })}
                style={{ flex: 2 }}
                required
              />
              <select
                value={nuevoTatuaje.zona_cuerpo}
                onChange={(e) => setNuevoTatuaje({ ...nuevoTatuaje, zona_cuerpo: e.target.value })}
                style={{ flex: 1 }}
              >
                {ZONAS_CUERPO.map((z) => (
                  <option key={z} value={z}>{z}</option>
                ))}
              </select>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <input
                type="number"
                step="0.5"
                placeholder="Horas estimadas"
                value={nuevoTatuaje.horas_estimadas}
                onChange={(e) => setNuevoTatuaje({ ...nuevoTatuaje, horas_estimadas: e.target.value })}
                style={{ flex: 1 }}
              />
              <input
                type="number"
                placeholder="Valor Total Estimado ($)"
                value={nuevoTatuaje.valor_estimado}
                onChange={(e) => {
                  setNuevoTatuaje({ ...nuevoTatuaje, valor_estimado: e.target.value });
                  if (!formData.valor) setFormData({ ...formData, valor: e.target.value });
                }}
                style={{ flex: 1 }}
                required
              />
            </div>
          </div>
        )}

        {/* Cliente y Tatuador */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: "11px", color: "var(--text-muted)" }}>Cliente</label>
            <select
              value={formData.cliente_id}
              onChange={(e) => setFormData({ ...formData, cliente_id: e.target.value })}
              required
            >
              <option value="">-- Seleccionar Cliente --</option>
              {clientes.map((c) => (
                <option key={c.id_cliente} value={c.id_cliente}>
                  {c.nombre} (Tel: {c.telefono})
                </option>
              ))}
            </select>
          </div>

          <div style={{ flex: 1 }}>
            <label style={{ fontSize: "11px", color: "var(--text-muted)" }}>Tatuador Responsable</label>
            <select
              value={formData.usuario_id}
              onChange={(e) => setFormData({ ...formData, usuario_id: e.target.value })}
              required
            >
              <option value="">-- Asignar Tatuador --</option>
              {usuarios.map((u) => (
                <option key={u.id_usuario} value={u.id_usuario}>
                  {u.nombre} ({u.rol})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Fecha, Duración y Tarifa */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: "11px", color: "var(--text-muted)" }}>Fecha de Sesión</label>
            <input
              type="date"
              value={formData.fecha}
              onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
              required
            />
          </div>

          <div style={{ flex: 1 }}>
            <label style={{ fontSize: "11px", color: "var(--text-muted)" }}>Duración (Horas)</label>
            <input
              type="number"
              step="0.5"
              placeholder="Horas (ej. 2.5)"
              value={formData.duracion_horas}
              onChange={(e) => {
                const horas = e.target.value;
                setFormData((prev) => {
                  const updated = { ...prev, duracion_horas: horas };
                  if (prev.tarifa_id) {
                    const tar = tarifas.find((t) => String(t.id_tarifa) === String(prev.tarifa_id));
                    if (tar) updated.valor = String(Math.round(parseFloat(horas || 0) * parseFloat(tar.valor_hora || 0)));
                  }
                  return updated;
                });
              }}
              required
            />
          </div>

          <div style={{ flex: 1 }}>
            <label style={{ fontSize: "11px", color: "var(--text-muted)" }}>Tarifa por Tipo (HU-04)</label>
            <select
              value={formData.tarifa_id}
              onChange={(e) => handleTarifaSelect(e.target.value)}
            >
              <option value="">-- Sin tarifa fija --</option>
              {tarifas.map((t) => (
                <option key={t.id_tarifa} value={t.id_tarifa}>
                  {t.tipo_trabajo} (${parseFloat(t.valor_hora).toLocaleString("es-CO")}/h)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Valor y Anticipo */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: "11px", color: "var(--text-muted)" }}>Valor Sesión ($)</label>
            <input
              type="number"
              placeholder="Monto"
              value={formData.valor}
              onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
              required
              disabled={esRetoqueGratuito}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: "11px", color: "var(--text-muted)" }}>Anticipo / Abono ($)</label>
            <input
              type="number"
              placeholder="0"
              value={formData.anticipo}
              onChange={(e) => {
                setFormData({ ...formData, anticipo: e.target.value });
                setAlertaAnticipo(false);
                setConfirmadoAnticipoMayor(false);
              }}
              disabled={esRetoqueGratuito}
            />
          </div>
        </div>

        {/* Retoque y Finalización */}
        <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: "11px", color: "var(--text-muted)" }}>¿Es retoque?</label>
            <select
              value={formData.es_retoque}
              onChange={(e) => handleRetoqueChange(e.target.value)}
            >
              <option value="N">No (Sesión Normal)</option>
              <option value="S">Sí (Retoque / Ajuste)</option>
            </select>
          </div>
          <div style={{ flex: 1, display: "flex", alignItems: "center", paddingTop: "15px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "12px" }}>
              <input
                type="checkbox"
                checked={formData.ultima_sesion}
                onChange={(e) => setFormData({ ...formData, ultima_sesion: e.target.checked })}
              />
              ¿Es última sesión (Finaliza tatuaje)?
            </label>
          </div>
        </div>

        {/* Mensaje de Garantía de Retoque */}
        {esRetoqueGratuito && (
          <div style={{
            background: "rgba(46, 204, 113, 0.15)",
            color: "#2ecc71",
            padding: "8px 12px",
            borderRadius: "6px",
            fontSize: "12px",
            marginTop: "10px",
            fontWeight: "bold",
          }}>
            ✓ Retoque dentro de los 30 días de garantía (Gratuito: $0).
          </div>
        )}

        <div className="modal-footer" style={{ marginTop: "20px" }}>
          <button type="button" className="btn-secondary" onClick={onClose} disabled={cargando}>
            Cancelar
          </button>
          <button type="submit" className="btn-primary" disabled={cargando}>
            {cargando
              ? "Procesando..."
              : sesionEditar
              ? "Guardar Cambios"
              : modoTatuaje === "nuevo"
              ? "Crear Tatuaje y Agendar Sesión"
              : "Registrar Sesión"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
