import { useState } from 'react';
import axios from 'axios';

export default function UsuarioForm({ onUsuarioCreado }) {
  const [formData, setFormData] = useState({ id_usuario: '', nombre: '', correo: '', clave: '', rol: 'TATUADOR' });
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/usuarios', formData);
      setMensaje('¡Colaborador registrado con éxito!');
      setError('');
      setFormData({ id_usuario: '', nombre: '', correo: '', clave: '', rol: 'TATUADOR' });
      if (onUsuarioCreado) onUsuarioCreado();
    } catch (err) {
      setMensaje('');
      setError(err.response?.data?.error || 'Error al registrar el colaborador');
    }
  };

  return (
    <div className="card-form">
      <h3>Registrar Nuevo Tatuador / Staff (HU-11)</h3>
      {mensaje && <p className="exito" style={{color: '#2ecc71'}}>{mensaje}</p>}
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input type="number" placeholder="ID Usuario / Cédula" value={formData.id_usuario} onChange={(e) => setFormData({...formData, id_usuario: e.target.value})} />
        <input type="text" placeholder="Nombre completo" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} />
        <input type="email" placeholder="Correo electrónico" value={formData.correo} onChange={(e) => setFormData({...formData, correo: e.target.value})} />
        <input type="password" placeholder="Contraseña de acceso" value={formData.clave} onChange={(e) => setFormData({...formData, clave: e.target.value})} />
        
        <select value={formData.rol} onChange={(e) => setFormData({...formData, rol: e.target.value})}>
          <option value="TATUADOR">TATUADOR</option>
          <option value="ADMINISTRADOR">ADMINISTRADOR</option>
        </select>
        
        <button type="submit">Dar de Alta</button>
      </form>
    </div>
  );
}