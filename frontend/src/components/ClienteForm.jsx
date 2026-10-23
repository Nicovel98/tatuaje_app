import { useState } from "react";
import axios from "axios";

export default function ClienteForm({ onClienteCreado }) {
  const [formData, setFormData] = useState({
    id_cliente: "",
    nombre: "",
    telefono: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.id_cliente || !formData.nombre || !formData.telefono) {
      setError("Todos los campos son obligatorios");
      return;
    }
    try {
      await axios.post("http://localhost:5000/api/clientes", formData);
      onClienteCreado(); // Recargar la lista de clientes
      setFormData({ id_cliente: "", nombre: "", telefono: "" }); // Limpiar formulario
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Error al registrar cliente");
    }
  };

  return (
    <div className="card-form">
      <h3>Registrar Cliente</h3>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="number"
          placeholder="Cédula / ID Cliente"
          value={formData.id_cliente}
          onChange={(e) =>
            setFormData({ ...formData, id_cliente: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Nombre Completo"
          value={formData.nombre}
          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
        />
        <input
          type="text"
          placeholder="Teléfono"
          value={formData.telefono}
          onChange={(e) =>
            setFormData({ ...formData, telefono: e.target.value })
          }
        />
        <button type="submit">Guardar Cliente</button>
      </form>
    </div>
  );
}
