import { useState, useEffect } from "react";
import axios from "axios";

const ZONAS_CUERPO = [
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
];

export default function TatuajeForm({ clientes, tarifas, onTatuajeCreado }) {
  const [formData, setFormData] = useState({
    id_tatuaje: "",
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
  const [siguienteId, setSiguienteId] = useState(null);

  const cargarSiguienteId = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/tatuajes/siguiente-id");
      setSiguienteId(res.data.siguiente);
    } catch (err) {
      console.error("Error cargando siguiente ID", err);
    }
  };

  useEffect(() => {
    cargarSiguienteId();
  }, []);

  const calcularValorEstimado = (horas, tarifaId) => {
    if (!horas || !tarifaId) return "";
    const tarifa = tarifas.find((t) => t.id_tarifa === parseInt(tarifaId));
    if (!tarifa) return "";
    return (parseFloat(horas) * parseFloat(tarifa.valor_hora)).toString();
  };

  const valorEstimado = calcularValorEstimado(formData.horas_estimadas, formData.TARIFA_id_tarifa);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const zonaFinal = formData.zona_cuerpo === "Otro" ? formData.zona_otra : formData.zona_cuerpo;

    if (parseFloat(formData.anticipo || 0) > parseFloat(valorEstimado || 0)) {
      setError("El anticipo no puede superar el valor estimado del tatuaje.");
      return;
    }

    try {
      const datosEnviar = {
        id_tatuaje: formData.id_tatuaje,
        diseno: formData.diseno,
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
      setExito("Tatuaje agendado con exito!");
      setError("");
      cargarSiguienteId();
      setFormData({
        id_tatuaje: "",
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
    }
  };

  return (
    <div className="card-form">
      <h3>Registrar Tatuaje y Cita</h3>
      {error && <p className="error">{error}</p>}
      {exito && (
        <p className="exito" style={{ color: "#2ecc71", fontWeight: "bold" }}>
          {exito}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ position: "relative" }}>
          <input
            type="number"
            placeholder="ID Tatuaje"
            value={formData.id_tatuaje}
            onChange={(e) => setFormData({ ...formData, id_tatuaje: e.target.value })}
          />
          {siguienteId && !formData.id_tatuaje && (
            <button
              type="button"
              onClick={() => setFormData({ ...formData, id_tatuaje: String(siguienteId) })}
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
              Siguiente: #{siguienteId}
            </button>
          )}
        </div>
        <input
          type="text"
          placeholder="Diseno (ej: Dragon Oriental)"
          value={formData.diseno}
          onChange={(e) => setFormData({ ...formData, diseno: e.target.value })}
        />

        <select
          value={formData.zona_cuerpo}
          onChange={(e) => setFormData({ ...formData, zona_cuerpo: e.target.value })}
        >
          <option value="">-- Zona del Cuerpo --</option>
          {ZONAS_CUERPO.map((z) => (
            <option key={z} value={z}>{z}</option>
          ))}
          <option value="Otro">Otro</option>
        </select>

        {formData.zona_cuerpo === "Otro" && (
          <input
            type="text"
            placeholder="Especifica la zona"
            value={formData.zona_otra}
            onChange={(e) => setFormData({ ...formData, zona_otra: e.target.value })}
          />
        )}

        <input
          type="number"
          step="0.1"
          placeholder="Horas Estimadas Totales"
          value={formData.horas_estimadas}
          onChange={(e) => setFormData({ ...formData, horas_estimadas: e.target.value })}
        />

        <select
          value={formData.TARIFA_id_tarifa}
          onChange={(e) => setFormData({ ...formData, TARIFA_id_tarifa: e.target.value })}
        >
          <option value="">-- Tipo de Trabajo / Tarifa --</option>
          {tarifas.map((t) => (
            <option key={t.id_tarifa} value={t.id_tarifa}>
              {t.tipo_trabajo} (${parseFloat(t.valor_hora).toLocaleString("es-CO")}/h)
              {t.tatuador_nombre ? ` — ${t.tatuador_nombre}` : ""}
            </option>
          ))}
        </select>

        {valorEstimado && (
          <div style={{
            padding: "10px 14px",
            background: "var(--bg-main)",
            borderRadius: "8px",
            border: "1px solid var(--border-color)",
            fontSize: "14px",
          }}>
            <strong>Valor Estimado:</strong> ${parseFloat(valorEstimado).toLocaleString("es-CO")}
          </div>
        )}

        <input
          type="number"
          placeholder="Registrar Anticipo de Cita ($)"
          value={formData.anticipo}
          onChange={(e) => setFormData({ ...formData, anticipo: e.target.value })}
        />

        <select
          value={formData.CLIENTE_id_cliente}
          onChange={(e) => setFormData({ ...formData, CLIENTE_id_cliente: e.target.value })}
        >
          <option value="">-- Selecciona el Cliente --</option>
          {clientes.map((c) => (
            <option key={c.id_cliente} value={c.id_cliente}>
              {c.nombre} (CC: {c.id_cliente})
            </option>
          ))}
        </select>

        <button type="submit">Agendar Tatuaje</button>
      </form>
    </div>
  );
}
