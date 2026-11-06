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
  usuarioActivo,
  onSesionGuardada,
}) {
  const [modoTatuaje, setModoTatuaje] = useState("existente"); // "existente" | "nuevo"
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  // Datos de la sesión
  const [formData, setFormData] = useState({
    tatuaje_id: "",
    cliente_id: "",
    usuario_id: usuarioActivo?.id_usuario || "",
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
    if (sesionEditar) {
      setModoTatuaje("existente");
      setFormData({
        tatuaje_id: sesionEditar.tatuaje_id || "",
        cliente_id: sesionEditar.cliente_id || "",
        usuario_id: sesionEditar.usuario_id || usuarioActivo?.id_usuario || "",
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

    if (anticipoNum > valorNum) {
      setError("El anticipo no puede ser mayor al valor de la sesión.");
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

      // Crear o Actualizar Sesión
      if (sesionEditar) {
        await api.put(`/sesiones/${sesionEditar.id_sesion}`, {
          tatuaje_id: parseInt(finalTatuajeId),
          cliente_id: parseInt(formData.cliente_id),
          usuario_id: parseInt(formData.usuario_id),
          fecha: formData.fecha,
          duracion_horas: parseFloat(formData.duracion_horas),
          es_retoque: formData.es_retoque,
          valor: valorNum,
          anticipo: anticipoNum,
          ultima_sesion: formData.ultima_sesion,
          usuario_modificador: usuarioActivo?.nombre || "ADMIN",
        });
      } else {
        await api.post("/sesiones", {
          tatuaje_id: parseInt(finalTatuajeId),
          cliente_id: parseInt(formData.cliente_id),
          usuario_id: parseInt(formData.usuario_id),
          fecha: formData.fecha,
          duracion_horas: parseFloat(formData.duracion_horas),
          es_retoque: formData.es_retoque,
          valor: valorNum,
          anticipo: anticipoNum,
          ultima_sesion: formData.ultima_sesion,
          usuario_creacion: usuarioActivo?.nombre || "ADMIN",
        });
      }

      if (onSesionGuardada) onSesionGuardada();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Error al procesar la sesión.");
    } finally {
      setCargando(false);
    }
  };

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
      maxWidth="620px"
    >
      {error && <p className="error" style={{ marginBottom: "14px" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        {sesionEditar ? (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Sesión:</span>
            <span style={{
              fontSize: "12px",
              fontWeight: "700",
              color: "var(--accent-color)",
              background: "rgba(244, 208, 63, 0.12)",
              padding: "2px 8px",
              borderRadius: "4px",
            }}>
              #{sesionEditar.id_sesion}
            </span>
          </div>
        ) : null}

        <div style={{ display: "flex", gap: "10px" }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: "11px", color: "var(--text-muted)" }}>Fecha de la Cita</label>
            <input
              type="date"
              value={formData.fecha}
              onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
              required
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: "11px", color: "var(--text-muted)" }}>Cliente</label>
            <select
              value={formData.cliente_id}
              onChange={(e) => setFormData({ ...formData, cliente_id: e.target.value })}
              required
            >
              <option value="">-- Selecciona el cliente --</option>
              {(clientes || []).map((c) => (
                <option key={c.id_cliente} value={c.id_cliente}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label style={{ fontSize: "11px", color: "var(--text-muted)" }}>Tatuador Responsable</label>
          <select
            value={formData.usuario_id}
            onChange={(e) => setFormData({ ...formData, usuario_id: e.target.value })}
            required
          >
            <option value="">-- Selecciona el tatuador --</option>
            {(usuarios || []).map((u) => (
              <option key={u.id_usuario} value={u.id_usuario}>
                {u.nombre} ({u.rol})
              </option>
            ))}
          </select>
        </div>

        {/* SECCIÓN DINÁMICA DE TATUAJE */}
        <div style={{ marginTop: "6px" }}>
          <label style={{ fontSize: "12px", color: "var(--accent-color)", fontWeight: "700", display: "block", marginBottom: "6px" }}>
            Diseño de Tatuaje a Realizar
          </label>

          {!sesionEditar && (
            <div className="dual-mode-selector">
              <button
                type="button"
                className={`dual-mode-option ${modoTatuaje === "existente" ? "active" : ""}`}
                onClick={() => setModoTatuaje("existente")}
              >
                🔗 Enlazar Tatuaje Existente
              </button>
              <button
                type="button"
                className={`dual-mode-option ${modoTatuaje === "nuevo" ? "active" : ""}`}
                onClick={() => setModoTatuaje("nuevo")}
              >
                ✨ Crear Nuevo Tatuaje Ahora
              </button>
            </div>
          )}

          {modoTatuaje === "existente" ? (
            <div>
              <select
                value={formData.tatuaje_id}
                onChange={(e) => {
                  const tId = e.target.value;
                  const tSel = (tatuajes || []).find((t) => t.id_tatuaje === parseInt(tId));
                  setFormData({
                    ...formData,
                    tatuaje_id: tId,
                    valor: tSel ? String(tSel.valor_estimado) : formData.valor,
                  });
                }}
                required
              >
                <option value="">-- Selecciona el diseño del catálogo --</option>
                {(tatuajes || []).map((t) => (
                  <option key={t.id_tatuaje} value={t.id_tatuaje}>
                    {t.diseno} ({t.zona_cuerpo}) - ${Number(t.valor_estimado).toLocaleString("es-CO")}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="embedded-subform">
              <h4>Datos del Nuevo Tatuaje</h4>
              <div>
                <label style={{ fontSize: "10px", color: "var(--text-muted)" }}>Nombre del Diseño</label>
                <input
                  type="text"
                  placeholder="ej. Katana Floral Neo Tradicional"
                  value={nuevoTatuaje.diseno}
                  onChange={(e) => setNuevoTatuaje({ ...nuevoTatuaje, diseno: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "10px", color: "var(--text-muted)" }}>Zona del Cuerpo</label>
                  <select
                    value={nuevoTatuaje.zona_cuerpo}
                    onChange={(e) => setNuevoTatuaje({ ...nuevoTatuaje, zona_cuerpo: e.target.value })}
                    required
                  >
                    {ZONAS_CUERPO.map((z) => (
                      <option key={z} value={z}>{z}</option>
                    ))}
                  </select>
                </div>
                {nuevoTatuaje.zona_cuerpo === "Otro" && (
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: "10px", color: "var(--text-muted)" }}>Especificar Zona</label>
                    <input
                      type="text"
                      placeholder="Zona"
                      value={nuevoTatuaje.zona_otra}
                      onChange={(e) => setNuevoTatuaje({ ...nuevoTatuaje, zona_otra: e.target.value })}
                      required
                    />
                  </div>
                )}
                <div style={{ width: "110px" }}>
                  <label style={{ fontSize: "10px", color: "var(--text-muted)" }}>Horas Est.</label>
                  <input
                    type="number"
                    step="0.5"
                    value={nuevoTatuaje.horas_estimadas}
                    onChange={(e) => setNuevoTatuaje({ ...nuevoTatuaje, horas_estimadas: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ marginTop: "8px" }}>
                <label style={{ fontSize: "10px", color: "var(--text-muted)" }}>Valor Estimado ($)</label>
                <input
                  type="number"
                  placeholder="Costo total estimado"
                  value={nuevoTatuaje.valor_estimado}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNuevoTatuaje({ ...nuevoTatuaje, valor_estimado: val });
                    if (!formData.valor || formData.valor === nuevoTatuaje.valor_estimado) {
                      setFormData((prev) => ({ ...prev, valor: val }));
                    }
                  }}
                  required
                />
              </div>
            </div>
          )}
        </div>

        {/* Datos adicionales de la sesión */}
        <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: "11px", color: "var(--text-muted)" }}>Duración (Horas)</label>
            <input
              type="number"
              step="0.5"
              placeholder="Horas"
              value={formData.duracion_horas}
              onChange={(e) => setFormData({ ...formData, duracion_horas: e.target.value })}
              required
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: "11px", color: "var(--text-muted)" }}>Valor Sesión ($)</label>
            <input
              type="number"
              placeholder="Monto"
              value={formData.valor}
              onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
              required
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: "11px", color: "var(--text-muted)" }}>Anticipo / Abono ($)</label>
            <input
              type="number"
              placeholder="0"
              value={formData.anticipo}
              onChange={(e) => setFormData({ ...formData, anticipo: e.target.value })}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: "11px", color: "var(--text-muted)" }}>¿Es retoque?</label>
            <select
              value={formData.es_retoque}
              onChange={(e) => setFormData({ ...formData, es_retoque: e.target.value })}
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

        <div className="modal-footer">
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
