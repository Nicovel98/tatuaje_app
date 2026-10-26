import { useState, useEffect } from "react";
import axios from "axios";

export default function TarifaForm({ onTarifaCreada }) {
  const [formData, setFormData] = useState({
    id_tarifa: "",
    tipo_trabajo: "",
    valor_hora: "",
    tatuador_nombre: "",
  });
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [siguienteId, setSiguienteId] = useState(null);

  const cargarSiguienteId = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/tarifas/siguiente-id");
      setSiguienteId(res.data.siguiente);
    } catch (err) {
      console.error("Error cargando siguiente ID", err);
    }
  };

  useEffect(() => {
    cargarSiguienteId();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.id_tarifa || !formData.tipo_trabajo || !formData.valor_hora) {
      setError("ID, tipo de trabajo y valor por hora son obligatorios.");
      return;
    }
    if (parseFloat(formData.valor_hora) <= 0) {
      setError("El valor por hora debe ser mayor a cero.");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/tarifas", formData);
      setExito("Tarifa guardada con exito.");
      setError("");
      cargarSiguienteId();
      setFormData({ id_tarifa: "", tipo_trabajo: "", valor_hora: "", tatuador_nombre: "" });
      onTarifaCreada();
    } catch (err) {
      setExito("");
      setError(err.response?.data?.error || "Error al guardar la tarifa.");
    }
  };

  return (
    <div className="card-form">
      <h3>Configurar Tarifa</h3>
      {error && <p className="error">{error}</p>}
      {exito && (
        <p className="exito" style={{ color: "#2ecc71", fontWeight: "bold" }}>{exito}</p>
      )}
      <form onSubmit={handleSubmit}>
        <div style={{ position: "relative" }}>
          <input type="number" placeholder="Codigo Tarifa / ID" value={formData.id_tarifa}
            onChange={(e) => setFormData({ ...formData, id_tarifa: e.target.value })} />
          {siguienteId && !formData.id_tarifa && (
            <button
              type="button"
              onClick={() => setFormData({ ...formData, id_tarifa: String(siguienteId) })}
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
        <input type="text" placeholder="Tipo de Trabajo (Ej: Blackwork)" value={formData.tipo_trabajo}
          onChange={(e) => setFormData({ ...formData, tipo_trabajo: e.target.value })} />
        <input type="number" placeholder="Valor por Hora ($)" value={formData.valor_hora}
          onChange={(e) => setFormData({ ...formData, valor_hora: e.target.value })} />
        <input type="text" placeholder="Tatuador asignado (nombre)" value={formData.tatuador_nombre}
          onChange={(e) => setFormData({ ...formData, tatuador_nombre: e.target.value })} />
        <button type="submit">Guardar Tarifa</button>
      </form>
    </div>
  );
}
