import { useState } from "react";
import axios from "axios";

export default function ClienteForm({ onClienteCreado }) {
  const [formData, setFormData] = useState({
    id_cliente: "",
    nombre: "",
    telefono: "",
    correo: "",
  });
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.id_cliente ||
      !formData.nombre ||
      !formData.telefono ||
      !formData.correo
    ) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/clientes", formData);
      setExito("Cliente registrado con exito!");
      setError("");
      setFormData({ id_cliente: "", nombre: "", telefono: "", correo: "" });
      cargarSiguienteId();
      if (onClienteCreado) onClienteCreado();
    } catch (err) {
      setExito("");
      setError(
        err.response?.data?.error ||
          "Error al registrar el cliente en el sistema.",
      );
    }
  };

  return (
    <div className="card-form">
      <h3>Registrar Cliente</h3>
      {error && <p className="error">{error}</p>}
      {exito && (
        <p className="exito" style={{ color: "#2ecc71", fontWeight: "bold" }}>
          {exito}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <input
          type="number"
          placeholder="Cedula / ID Cliente"
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
          placeholder="Telefono de Contacto"
          value={formData.telefono}
          onChange={(e) =>
            setFormData({ ...formData, telefono: e.target.value })
          }
        />
        <input
          type="email"
          placeholder="Correo Electronico"
          value={formData.correo}
          onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
        />
        <button type="submit">Guardar Cliente</button>
      </form>
    </div>
  );
}
