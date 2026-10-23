import { useState } from "react";
import axios from "axios";

export default function TatuajeForm({ clientes, onTatuajeCreado }) {
  const [formData, setFormData] = useState({
    id_tatuaje: "",
    diseno: "",
    zona_cuerpo: "",
    estado: "PENDIENTE",
    horas_estimadas: "",
    valor_estimado: "",
    anticipo: "0",
    fecha_finalizacion: "",
    CLIENTE_id_cliente: "",
  });
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Regla de validación visual HU-05 antes de enviar al servidor
    if (parseFloat(formData.anticipo) > parseFloat(formData.valor_estimado)) {
      setError(
        "Alerta: El valor del anticipo no puede superar el valor estimado del tatuaje.",
      );
      return;
    }

    try {
      // Ajustamos para mandar campos vacíos de fecha de finalización como null si está PENDIENTE
      const datosEnviar = {
        ...formData,
        fecha_finalizacion: formData.fecha_finalizacion || null,
      };

      await axios.post("http://localhost:5000/api/tatuajes", datosEnviar);
      setExito("¡Tatuaje y Anticipo (HU-05) agendados con éxito!");
      setError("");
      setFormData({
        id_tatuaje: "",
        diseno: "",
        zona_cuerpo: "",
        estado: "PENDIENTE",
        horas_estimadas: "",
        valor_estimado: "",
        anticipo: "0",
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
      <h3>Registrar Tatuaje y Cita (HU-05)</h3>
      {error && <p className="error">{error}</p>}
      {exito && (
        <p className="exito" style={{ color: "#2ecc71", fontWeight: "bold" }}>
          {exito}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <input
          type="number"
          placeholder="ID Tatuaje"
          value={formData.id_tatuaje}
          onChange={(e) =>
            setFormData({ ...formData, id_tatuaje: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Diseño (ej: Dragón Oriental)"
          value={formData.diseno}
          onChange={(e) => setFormData({ ...formData, diseno: e.target.value })}
        />
        <input
          type="text"
          placeholder="Zona del Cuerpo"
          value={formData.zona_cuerpo}
          onChange={(e) =>
            setFormData({ ...formData, zona_cuerpo: e.target.value })
          }
        />

        <input
          type="number"
          step="0.1"
          placeholder="Horas Estimadas Totales"
          value={formData.horas_estimadas}
          onChange={(e) =>
            setFormData({ ...formData, horas_estimadas: e.target.value })
          }
        />
        <input
          type="number"
          placeholder="Valor Estimado Total ($)"
          value={formData.valor_estimado}
          onChange={(e) =>
            setFormData({ ...formData, valor_estimado: e.target.value })
          }
        />

        {/* HU-05: Captura del dinero en el momento de agendar */}
        <input
          type="number"
          placeholder="Registrar Anticipo de Cita ($)"
          value={formData.anticipo}
          onChange={(e) =>
            setFormData({ ...formData, anticipo: e.target.value })
          }
        />

        <select
          value={formData.CLIENTE_id_cliente}
          onChange={(e) =>
            setFormData({ ...formData, CLIENTE_id_cliente: e.target.value })
          }
        >
          <option value="">-- Selecciona el Cliente (HU-01) --</option>
          {clientes.map((c) => (
            <option key={c.id_cliente} value={c.id_cliente}>
              {c.nombre} (ID: {c.id_cliente})
            </option>
          ))}
        </select>

        <button type="submit">Agendar Tatuaje</button>
      </form>
    </div>
  );
}
