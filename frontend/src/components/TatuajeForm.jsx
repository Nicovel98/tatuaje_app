import { useState } from 'react';
import axios from 'axios';

export default function TatuajeForm({ clientes, onTatuajeCreado }) {
  const [formData, setFormData] = useState({
    id_tatuaje: '', diseno: '', zona_cuerpo: '', estado: 'PENDIENTE', valor_estimado: '', fecha_finalizacion: '', CLIENTE_id_cliente: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/tatuajes', formData);
      onTatuajeCreado();
      setFormData({ id_tatuaje: '', diseno: '', zona_cuerpo: '', estado: 'PENDIENTE', valor_estimado: '', fecha_finalizacion: '', CLIENTE_id_cliente: '' });
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar tatuaje');
    }
  };

  return (
    <div className="card-form">
      <h3>Registrar Tatuaje</h3>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input type="number" placeholder="ID Tatuaje" value={formData.id_tatuaje} onChange={(e) => setFormData({...formData, id_tatuaje: e.target.value})} />
        <input type="text" placeholder="Diseño (ej: Dragón Oriental)" value={formData.diseno} onChange={(e) => setFormData({...formData, diseno: e.target.value})} />
        <input type="text" placeholder="Zona del Cuerpo" value={formData.zona_cuerpo} onChange={(e) => setFormData({...formData, zona_cuerpo: e.target.value})} />
        
        <select value={formData.estado} onChange={(e) => setFormData({...formData, estado: e.target.value})}>
          <option value="PENDIENTE">PENDIENTE</option>
          <option value="EN_PROGRESO">EN_PROGRESO</option>
          <option value="FINALIZADO">FINALIZADO</option>
          <option value="CANCELADO">CANCELADO</option>
        </select>

        <input type="number" placeholder="Valor Estimado" value={formData.valor_estimated} onChange={(e) => setFormData({...formData, valor_estimado: e.target.value})} />
        <input type="date" value={formData.fecha_finalizacion} onChange={(e) => setFormData({...formData, fecha_finalizacion: e.target.value})} />
        
        <select value={formData.CLIENTE_id_cliente} onChange={(e) => setFormData({...formData, CLIENTE_id_cliente: e.target.value})}>
          <option value="">-- Selecciona un Cliente --</option>
          {clientes.map(c => (
            <option key={c.id_cliente} value={c.id_cliente}>{c.nombre} (ID: {c.id_cliente})</option>
          ))}
        </select>

        <button type="submit">Guardar Tatuaje</button>
      </form>
    </div>
  );
}
