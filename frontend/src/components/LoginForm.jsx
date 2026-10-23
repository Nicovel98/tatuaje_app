import { useState } from "react";
import axios from "axios";

export default function LoginForm({ onLoginExitoso }) {
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!correo || !clave) {
      setError("Por favor diligencie todos los campos.");
      return;
    }

    try {
      const respuesta = await axios.post("http://localhost:5000/api/login", {
        correo,
        clave,
      });
      setError("");
      // Pasamos los datos del usuario logueado (id, nombre, rol) al componente App
      onLoginExitoso(respuesta.data.usuario);
    } catch (err) {
      setError(err.response?.data?.error || "Credenciales incorrectas");
    }
  };

  return (
    <div className="login-card">
      <h2>Estudio de Tatuajes — Ingreso</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={clave}
          onChange={(e) => setClave(e.target.value)}
        />
        <button type="submit">Ingresar</button>
      </form>
    </div>
  );
}
