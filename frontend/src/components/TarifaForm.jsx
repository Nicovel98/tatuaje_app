import { useState } from "react";
import axios from "axios";

export default function TarifaForm({ onTarifaCreada }) {
  const [formData, setFormData] = useState({
    id_tarifa: "",
    tipo_trabajo: "",
    valor_hora: "",
  });
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.id_tarifa || !formData.tipo_trabajo || !formData.valor_hora) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    if (parseFloat(formData.valor_hora) <= 0) {
      setError("El valor por hora debe ser mayor a cero.");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/tarifas", formData);
      setExito("Tarifa guardada con éxito.");
      setError("");
      setFormData({ id_tarifa: "", tipo_trabajo: "", valor_hora: "" });
      onTarifaCreada();
    } catch (err) {
      setExito("");
      setError(
        err.response?.data?.error ||
          "Error al guardar la tarifa. Asegúrate de que el ID o Tipo no estén duplicados.",
      );
    }
  };

  return (
    <div className="card-form">
      <h3>Configurar Tarifa (HU-04)</h3>
      {error && <p className="error">{error}</p>}
      {exito && (
        <p className="exito" style={{ color: "#2ecc71", fontWeight: "bold" }}>
          {exito}
        </p>
      )}
      <form onSubmit={handleSubmit}>
        <input
          type="number"
          placeholder="Código Tarifa / ID"
          value={formData.id_tarifa}
          onChange={(e) =>
            setFormData({ ...formData, id_tarifa: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Tipo de Trabajo (Ej: Blackwork)"
          value={formData.tipo_trabajo}
          onChange={(e) =>
            setFormData({ ...formData, tipo_trabajo: e.target.value })
          }
        />
        <input
          type="number"
          placeholder="Valor por Hora ($)"
          value={formData.valor_hora}
          onChange={(e) =>
            setFormData({ ...formData, valor_hora: e.target.value })
          }
        />
        <button type="submit">Guardar Tarifa</button>
      </form>
    </div>
  );
}
