import { useState } from "react";
import { Tooltip } from "./Tooltip";
import axios from "axios";

export default function TarifaForm({ onTarifaCreada }) {
  const [formData, setFormData] = useState({
    tipo_trabajo: "",
    valor_hora: "",
    tatuador_nombre: "",
  });
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [guardando, setGuardando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.tipo_trabajo.trim()) {
      setError("El nombre o estilo del tipo de trabajo es obligatorio.");
      return;
    }
    if (!formData.valor_hora || isNaN(formData.valor_hora) || parseFloat(formData.valor_hora) <= 0) {
      setError("El valor por hora debe ser un número mayor a cero.");
      return;
    }

    setGuardando(true);
    try {
      await axios.post("http://localhost:5000/api/tarifas", {
        tipo_trabajo: formData.tipo_trabajo.trim(),
        valor_hora: parseFloat(formData.valor_hora),
        tatuador_nombre: formData.tatuador_nombre.trim() || null,
      });
      setExito("Tarifa configurada y guardada con éxito.");
      setError("");
      setFormData({ tipo_trabajo: "", valor_hora: "", tatuador_nombre: "" });
      onTarifaCreada();
    } catch (err) {
      setExito("");
      setError(err.response?.data?.error || "Error al guardar la tarifa.");
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
          🏷️
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: "16px" }}>Nueva Tarifa por Estilo</h3>
          <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--text-muted)" }}>
            Configura precios por hora según la especialidad
          </p>
        </div>
      </div>

      {error && <p className="error">{error}</p>}
      {exito && (
        <p className="exito" style={{ color: "#2ecc71", fontWeight: "bold" }}>{exito}</p>
      )}

      <form onSubmit={handleSubmit}>
        <div>
                    <label htmlFor="tipo_trabajo" style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", marginBottom: "4px", display: "block" }}>
            <Tooltip text="Nombre del estilo o tipo de trabajo (ej. Blackwork, Realismo)">Estilo / Tipo de Trabajo *</Tooltip>
          </label>
          <input
            id="tipo_trabajo"
            type="text"
            placeholder="Ej: Blackwork, Línea Fina, Realismo, Color"
            value={formData.tipo_trabajo}
            onChange={(e) => setFormData({ ...formData, tipo_trabajo: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="valor_hora" style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", marginBottom: "4px", display: "block" }}>
            {/* Tooltip for Valor Hora */}
            <Tooltip text="Valor por hora en pesos colombianos (COP)">Valor por Hora ($ COP) *</Tooltip>
          </label>
          <input
            id="valor_hora"
            type="number"
            step="1000"
            placeholder="Ej: 150000"
            value={formData.valor_hora}
            onChange={(e) => setFormData({ ...formData, valor_hora: e.target.value })}
          />
        </div>

        <div>
          <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", marginBottom: "4px", display: "block" }}>
            Tatuador / Artista Asignado (Opcional)
          </label>
          <input
            type="text"
            placeholder="Ej: Carlos Ruiz"
            value={formData.tatuador_nombre}
            onChange={(e) => setFormData({ ...formData, tatuador_nombre: e.target.value })}
          />
        </div>

        <button type="submit" disabled={guardando} style={{ marginTop: "6px" }}>
          {guardando ? "Guardando..." : "Guardar Tarifa"}
        </button>
      </form>
    </div>
  );
}
