import { useState } from "react";
import { Tooltip } from "./Tooltip";
import axios from "axios";

const ZONAS_CUERPO = [
  "Antebrazo",
  "Brazo completo",
  "Hombro",
  "Espalda",
  "Pecho",
  "Costillas",
  "Cuello",
  "Muñeca",
  "Mano",
  "Dedos",
  "Pantorrilla",
  "Muslo",
  "Tobillo",
  "Pie",
  "Cadera",
  "Nuca",
];

export default function TatuajeForm({ clientes, tarifas, onTatuajeCreado }) {
  const [formData, setFormData] = useState({
    diseno: "",
    zona_cuerpo: "",
    zona_otra: "",
    estado: "PENDIENTE",
    horas_estimadas: "",
    TARIFA_id_tarifa: "",
    anticipo: "",
    fecha_finalizacion: "",
    CLIENTE_id_cliente: "",
  });
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [guardando, setGuardando] = useState(false);

  const calcularValorEstimado = (horas, tarifaId) => {
    if (!horas || !tarifaId) return "";
    const tarifa = tarifas.find((t) => t.id_tarifa === parseInt(tarifaId));
    if (!tarifa) return "";
    return (parseFloat(horas) * parseFloat(tarifa.valor_hora)).toString();
  };

  const valorEstimado = calcularValorEstimado(formData.horas_estimadas, formData.TARIFA_id_tarifa);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.diseno.trim()) {
      setError("Indique el nombre o concepto del diseño.");
      return;
    }
    if (!formData.zona_cuerpo) {
      setError("Seleccione la zona del cuerpo para el tatuaje.");
      return;
    }
    if (!formData.horas_estimadas || parseFloat(formData.horas_estimadas) <= 0) {
      setError("Ingrese una estimación de horas válida.");
      return;
    }
    if (!formData.CLIENTE_id_cliente) {
      setError("Seleccione el cliente asociado al tatuaje.");
      return;
    }

    const zonaFinal = formData.zona_cuerpo === "Otro" ? formData.zona_otra : formData.zona_cuerpo;

    if (parseFloat(formData.anticipo || 0) > parseFloat(valorEstimado || 0)) {
      setError("El anticipo no puede superar el valor estimado del tatuaje.");
      return;
    }

    setGuardando(true);
    try {
      const datosEnviar = {
        diseno: formData.diseno.trim(),
        zona_cuerpo: zonaFinal,
        estado: formData.estado,
        horas_estimadas: formData.horas_estimadas,
        valor_estimado: valorEstimado || "0",
        anticipo: formData.anticipo || "0",
        fecha_finalizacion: formData.fecha_finalizacion || null,
        CLIENTE_id_cliente: formData.CLIENTE_id_cliente,
        TARIFA_id_tarifa: formData.TARIFA_id_tarifa || null,
      };

      await axios.post("http://localhost:5000/api/tatuajes", datosEnviar);
      setExito("Tatuaje agendado con éxito!");
      setError("");
      setFormData({
        diseno: "",
        zona_cuerpo: "",
        zona_otra: "",
        estado: "PENDIENTE",
        horas_estimadas: "",
        TARIFA_id_tarifa: "",
        anticipo: "",
        fecha_finalizacion: "",
        CLIENTE_id_cliente: "",
      });
      onTatuajeCreado();
    } catch (err) {
      setExito("");
      setError(err.response?.data?.error || "Error al registrar el tatuaje");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="card-form">
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
        <div style={{
          width: "36px", height: "36px", borderRadius: "8px",
          background: "rgba(244, 208, 63, 0.12)", color: "var(--accent-color)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px"
        }}>
          🎨
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: "16px" }}>Agendar Nuevo Tatuaje</h3>
          <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--text-muted)" }}>
            Diseño, cotización y cita con anticipo
          </p>
        </div>
      </div>

      {error && <p className="error">{error}</p>}
      {exito && (
        <p className="exito" style={{ color: "#2ecc71", fontWeight: "bold" }}>
          {exito}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <div>
                    <label htmlFor="horas_estimadas" style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", marginBottom: "4px", display: "block" }}>
            <Tooltip text="Horas estimadas para completar el tatuaje">Horas Estimadas *</Tooltip>
          </label>
          <input
            id="horas_estimadas"
            type="number"
            step="0.1"
            min="0.1"
            placeholder="Ej: 5"
            value={formData.horas_estimadas}
            onChange={(e) => setFormData({ ...formData, horas_estimadas: e.target.value })}
          />
          <select
            value={formData.CLIENTE_id_cliente}
            onChange={(e) => setFormData({ ...formData, CLIENTE_id_cliente: e.target.value })}
          >
            <option value="">-- Selecciona el Cliente --</option>
            {clientes.map((c) => (
              <option key={c.id_cliente} value={c.id_cliente}>
                {c.nombre} (Tel: {c.telefono})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", marginBottom: "4px", display: "block" }}>
            {/* Tooltip for Horas Estimadas */}
            <Tooltip text="Horas estimadas para completar el tatuaje">Horas Estimadas *</Tooltip>
            Concepto del Diseño *
          </label>
          <input
            type="text"
            placeholder="Ej: Dragón Oriental Espalda Completa"
            value={formData.diseno}
            onChange={(e) => setFormData({ ...formData, diseno: e.target.value })}
          />
        </div>

        <div>
          <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", marginBottom: "4px", display: "block" }}>
            {/* Tooltip for Horas Estimadas */}
            <Tooltip text="Horas estimadas para completar el tatuaje">Horas Estimadas *</Tooltip>
            Zona del Cuerpo *
          </label>
          <select
            value={formData.zona_cuerpo}
            onChange={(e) => setFormData({ ...formData, zona_cuerpo: e.target.value })}
          >
            <option value="">-- Selecciona la Zona del Cuerpo --</option>
            {ZONAS_CUERPO.map((z) => (
              <option key={z} value={z}>{z}</option>
            ))}
            <option value="Otro">Otra ubicación personalizada</option>
          </select>
        </div>

        {formData.zona_cuerpo === "Otro" && (
          <input
            type="text"
            placeholder="Especifica la ubicación anatómica"
            value={formData.zona_otra}
            onChange={(e) => setFormData({ ...formData, zona_otra: e.target.value })}
          />
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", marginBottom: "4px", display: "block" }}>
            {/* Tooltip for Horas Estimadas */}
            <Tooltip text="Horas estimadas para completar el tatuaje">Horas Estimadas *</Tooltip>
              Horas Estimadas *
            </label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              placeholder="Ej: 3.5"
              value={formData.horas_estimadas}
              onChange={(e) => setFormData({ ...formData, horas_estimadas: e.target.value })}
            />
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", marginBottom: "4px", display: "block" }}>
            {/* Tooltip for Horas Estimadas */}
            <Tooltip text="Horas estimadas para completar el tatuaje">Horas Estimadas *</Tooltip>
              Tipo de Trabajo / Tarifa
            </label>
            <select
              value={formData.TARIFA_id_tarifa}
              onChange={(e) => setFormData({ ...formData, TARIFA_id_tarifa: e.target.value })}
            >
              <option value="">-- Tarifa Estándar --</option>
              {tarifas.map((t) => (
                <option key={t.id_tarifa} value={t.id_tarifa}>
                  {t.tipo_trabajo} (${parseFloat(t.valor_hora).toLocaleString("es-CO")}/h)
                  {t.tatuador_nombre ? ` — ${t.tatuador_nombre}` : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        {valorEstimado && (
          <div style={{
            padding: "10px 14px",
            background: "rgba(244, 208, 63, 0.08)",
            borderRadius: "8px",
            border: "1px solid rgba(244, 208, 63, 0.25)",
            fontSize: "13px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
            <span style={{ color: "var(--text-muted)" }}>Presupuesto Estimado:</span>
            <strong style={{ color: "var(--accent-color)", fontSize: "15px" }}>
              ${parseFloat(valorEstimado).toLocaleString("es-CO")}
            </strong>
          </div>
        )}

        <div>
          <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", marginBottom: "4px", display: "block" }}>
            {/* Tooltip for Horas Estimadas */}
            <Tooltip text="Horas estimadas para completar el tatuaje">Horas Estimadas *</Tooltip>
            Anticipo de Agendamiento ($ COP)
          </label>
          <input
            type="number"
            step="1000"
            placeholder="Ej: 100000"
            value={formData.anticipo}
            onChange={(e) => setFormData({ ...formData, anticipo: e.target.value })}
          />
        </div>

        <button type="submit" disabled={guardando} style={{ marginTop: "6px" }}>
          {guardando ? "Agendando..." : "Confirmar y Agendar Cita"}
        </button>
      </form>
    </div>
  );
}
