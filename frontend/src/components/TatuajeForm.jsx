import { useState } from "react";
import axios from "axios";
import { ZONAS_CUERPO } from "./TatuajeModal";

export default function TatuajeForm({ onTatuajeCreado, usuarioActivo }) {
  const [formData, setFormData] = useState({
    diseno: "",
    zona_cuerpo: "",
    zona_otra: "",
    estado: "PENDIENTE",
    horas_estimadas: "2.0",
    valor_estimado: "",
    anticipo: "0",
  });
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setExito("");

    const zonaFinal = formData.zona_cuerpo === "Otro" ? formData.zona_otra : formData.zona_cuerpo;

    if (!formData.diseno || !zonaFinal || !formData.valor_estimado) {
      setError("Por favor completa los campos obligatorios.");
      return;
    }

    if (parseFloat(formData.anticipo || 0) > parseFloat(formData.valor_estimado || 0)) {
      setError("El anticipo no puede superar el valor estimado del tatuaje.");
      return;
    }

    try {
      const datosEnviar = {
        diseno: formData.diseno,
        zona_cuerpo: zonaFinal,
        estado: formData.estado,
        horas_estimadas: parseFloat(formData.horas_estimadas || 1),
        valor_estimado: parseFloat(formData.valor_estimado),
        anticipo: parseFloat(formData.anticipo || 0),
        usuario_creacion: usuarioActivo?.nombre || "ADMIN",
      };

      await axios.post("http://localhost:5000/api/tatuajes", datosEnviar);
      setExito("¡Diseño de tatuaje registrado con éxito!");
      setFormData({
        diseno: "",
        zona_cuerpo: "",
        zona_otra: "",
        estado: "PENDIENTE",
        horas_estimadas: "2.0",
        valor_estimado: "",
        anticipo: "0",
      });
      if (onTatuajeCreado) onTatuajeCreado();
    } catch (err) {
      setError(err.response?.data?.error || "Error al registrar el diseño.");
    }
  };

  return (
    <div className="card-form">
      <h3>Nuevo Diseño de Tatuaje</h3>
      {error && <p className="error">{error}</p>}
      {exito && <p className="exito" style={{ color: "#2ecc71" }}>{exito}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nombre del diseño (ej. Tigre Japonés)"
          value={formData.diseno}
          onChange={(e) => setFormData({ ...formData, diseno: e.target.value })}
          required
        />

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

        {formData.zona_cuerpo === "Otro" && (
          <input
            type="text"
            placeholder="Especifica la zona del cuerpo"
            value={formData.zona_otra}
            onChange={(e) => setFormData({ ...formData, zona_otra: e.target.value })}
            required
          />
        )}

        <div style={{ display: "flex", gap: "10px" }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: "11px", color: "var(--text-muted)" }}>Horas Estimadas</label>
            <input
              type="number"
              step="0.5"
              placeholder="Horas"
              value={formData.horas_estimadas}
              onChange={(e) => setFormData({ ...formData, horas_estimadas: e.target.value })}
              required
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: "11px", color: "var(--text-muted)" }}>Valor Estimado ($)</label>
            <input
              type="number"
              placeholder="Costo total estimado"
              value={formData.valor_estimado}
              onChange={(e) => setFormData({ ...formData, valor_estimado: e.target.value })}
              required
            />
          </div>
        </div>

        <label style={{ fontSize: "11px", color: "var(--text-muted)" }}>Anticipo Inicial ($)</label>
        <input
          type="number"
          placeholder="Anticipo (abono)"
          value={formData.anticipo}
          onChange={(e) => setFormData({ ...formData, anticipo: e.target.value })}
        />

        <select
          value={formData.estado}
          onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
        >
          <option value="PENDIENTE">PENDIENTE</option>
          <option value="EN_PROGRESO">EN PROGRESO</option>
          <option value="FINALIZADO">FINALIZADO</option>
          <option value="CANCELADO">CANCELADO</option>
        </select>

        <button type="submit">Guardar Tatuaje</button>
      </form>
    </div>
  );
}
