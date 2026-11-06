import { useState, useEffect } from "react";
import api from "../services/api";
import Modal from "./Modal";

export const ZONAS_CUERPO = [
  "Antebrazo",
  "Brazo completo",
  "Hombro",
  "Espalda",
  "Pecho",
  "Costillas",
  "Cuello",
  "Muneca",
  "Mano",
  "Dedos",
  "Pantorrilla",
  "Muslo",
  "Tobillo",
  "Pie",
  "Cadera",
  "Nuca",
  "Otro",
];

export default function TatuajeModal({
  isOpen,
  onClose,
  tatuajeEditar,
  usuarioActivo,
  onGuardado,
}) {
  const [formData, setFormData] = useState({
    diseno: "",
    zona_cuerpo: "",
    zona_otra: "",
    estado: "PENDIENTE",
    horas_estimadas: "2.0",
    valor_estimado: "",
  });
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (tatuajeEditar) {
      const esOtra = !ZONAS_CUERPO.slice(0, -1).includes(tatuajeEditar.zona_cuerpo);
      setFormData({
        diseno: tatuajeEditar.diseno || "",
        zona_cuerpo: esOtra ? "Otro" : (tatuajeEditar.zona_cuerpo || ""),
        zona_otra: esOtra ? (tatuajeEditar.zona_cuerpo || "") : "",
        estado: tatuajeEditar.estado || "PENDIENTE",
        horas_estimadas: String(tatuajeEditar.horas_estimadas || "2.0"),
        valor_estimado: String(tatuajeEditar.valor_estimado || ""),
      });
    } else {
      setFormData({
        diseno: "",
        zona_cuerpo: "",
        zona_otra: "",
        estado: "PENDIENTE",
        horas_estimadas: "2.0",
        valor_estimado: "",
      });
    }
    setError("");
  }, [tatuajeEditar, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const zonaFinal = formData.zona_cuerpo === "Otro" ? formData.zona_otra : formData.zona_cuerpo;

    if (!formData.diseno || !zonaFinal || formData.valor_estimado === "") {
      setError("Por favor completa los campos obligatorios.");
      return;
    }

    setCargando(true);
    try {
      if (tatuajeEditar) {
        await api.put(`/tatuajes/${tatuajeEditar.id_tatuaje}`, {
          diseno: formData.diseno,
          zona_cuerpo: zonaFinal,
          estado: formData.estado,
          horas_estimadas: parseFloat(formData.horas_estimadas || 1),
          valor_estimado: parseFloat(formData.valor_estimado),
          usuario_modificador: usuarioActivo?.nombre || "ADMIN",
        });
      } else {
        await api.post("/tatuajes", {
          diseno: formData.diseno,
          zona_cuerpo: zonaFinal,
          estado: formData.estado,
          horas_estimadas: parseFloat(formData.horas_estimadas || 1),
          valor_estimado: parseFloat(formData.valor_estimado),
          usuario_creacion: usuarioActivo?.nombre || "ADMIN",
        });
      }

      if (onGuardado) onGuardado();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Error al procesar el diseño de tatuaje.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={tatuajeEditar ? "Editar Diseño de Tatuaje" : "Nuevo Diseño de Tatuaje"}
      subtitle={
        tatuajeEditar
          ? `Modificando especificaciones del diseño #${tatuajeEditar.id_tatuaje}`
          : "Ficha técnica y especificaciones del diseño."
      }
      maxWidth="550px"
    >
      {error && <p className="error" style={{ marginBottom: "14px" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        {tatuajeEditar && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Diseño:</span>
            <span style={{
              fontSize: "12px",
              fontWeight: "700",
              color: "var(--accent-color)",
              background: "rgba(244, 208, 63, 0.12)",
              padding: "2px 8px",
              borderRadius: "4px",
            }}>
              #{tatuajeEditar.id_tatuaje}
            </span>
          </div>
        )}

        <div>
          <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
            Nombre del Diseño / Concepto
          </label>
          <input
            type="text"
            placeholder="ej. Dragón Oriental Neo Tradicional"
            value={formData.diseno}
            onChange={(e) => setFormData({ ...formData, diseno: e.target.value })}
            required
          />
        </div>

        <div>
          <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
            Zona del Cuerpo
          </label>
          <select
            value={formData.zona_cuerpo}
            onChange={(e) => setFormData({ ...formData, zona_cuerpo: e.target.value })}
            required
          >
            <option value="">-- Selecciona la zona del cuerpo --</option>
            {ZONAS_CUERPO.map((z) => (
              <option key={z} value={z}>{z}</option>
            ))}
          </select>
        </div>

        {formData.zona_cuerpo === "Otro" && (
          <div>
            <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
              Especificar Zona
            </label>
            <input
              type="text"
              placeholder="Indica la zona exacta"
              value={formData.zona_otra}
              onChange={(e) => setFormData({ ...formData, zona_otra: e.target.value })}
              required
            />
          </div>
        )}

        <div style={{ display: "flex", gap: "10px" }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
              Horas Estimadas
            </label>
            <input
              type="number"
              step="0.5"
              placeholder="ej. 3.0"
              value={formData.horas_estimadas}
              onChange={(e) => setFormData({ ...formData, horas_estimadas: e.target.value })}
              required
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
              Valor Total Estimado ($)
            </label>
            <input
              type="number"
              placeholder="Costo total"
              value={formData.valor_estimado}
              onChange={(e) => setFormData({ ...formData, valor_estimado: e.target.value })}
              required
            />
          </div>
        </div>

        <div>
          <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
            Estado del Proyecto
          </label>
          <select
            value={formData.estado}
            onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
          >
            <option value="PENDIENTE">PENDIENTE</option>
            <option value="EN_PROGRESO">EN PROGRESO</option>
            <option value="FINALIZADO">FINALIZADO</option>
            <option value="CANCELADO">CANCELADO</option>
          </select>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={cargando}>
            Cancelar
          </button>
          <button type="submit" className="btn-primary" disabled={cargando}>
            {cargando ? "Guardando..." : tatuajeEditar ? "Guardar Cambios" : "Guardar Tatuaje"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
