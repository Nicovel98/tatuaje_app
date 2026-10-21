import { useState } from 'react';
import axios from 'axios';

export default function SesionForm({ tatuajes, tarifas, usuarioActivo, onSesionCreada }) {
  const [formData, setFormData] = useState({
    id_sesion: '', fecha: '', duracion_horas: '', es_retoque: 'N', valor: '0', TATUAJE_id_tatuaje: '', TARIFA_id_tarifa: ''
  });
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  // Corregido: Nombre unificado sin espacios para evitar el error de parsing
  const handleCambioHorasOTarifa = (campo, valorCampo) => {
    const nuevoFormData = { ...formData, [campo]: valorCampo };
    
    if (nuevoFormData.duracion_horas && nuevoFormData.TARIFA_id_tarifa) {
      const tarifaSeleccionada = tarifas.find(t => t.id_tarifa === parseInt(nuevoFormData.TARIFA_id_tarifa));
      if (tarifaSeleccionada && nuevoFormData.es_retoque === 'N') {
        nuevoFormData.valor = (parseFloat(nuevoFormData.duracion_horas) * parseFloat(tarifaSeleccionada.valor_hora)).toString();
      } else if (nuevoFormData.es_retoque === 'S') {
        nuevoFormData.valor = '0'; 
      }
    }
    setFormData(nuevoFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const datosEnviar = { ...formData, USUARIO_id_usuario: usuarioActivo.id_usuario };
      await axios.post('http://localhost:5000/api/sesiones', datosEnviar);
      
      setExito('¡Sesión registrada exitosamente!');
      setError('');
      setFormData({ id_sesion: '', fecha: '', duracion_horas: '', es_retoque: 'N', valor: '0', TATUAJE_id_tatuaje: '', TARIFA_id_tarifa: '' });
      onSesionCreada();
    } catch (err) {
      setExito('');
      setError(err.response?.data?.error || 'Error al registrar la sesión de trabajo');
    }
  };

  return (
    <div className="card-form">
      <h3>Registrar Sesión de Trabajo (HU-02)</h3>
      {error && <p className="error">{error}</p>}
      {exito && <p className="exito" style={{ color: '#2ecc71' }}>{exito}</p>}
      
      <form onSubmit={handleSubmit}>
        <input type="number" placeholder="ID Sesión" value={formData.id_sesion} onChange={(e) => handleCambioHorasOTarifa('id_sesion', e.target.value)} />
        <input type="date" value={formData.fecha} onChange={(e) => handleCambioHorasOTarifa('fecha', e.target.value)} />
        <input type="number" step="0.1" placeholder="Duración en Horas" value={formData.duracion_horas} onChange={(e) => handleCambioHorasOTarifa('duracion_horas', e.target.value)} />
        
        <label style={{ fontSize: '14px' }}>
          ¿Es un retoque?
          <select value={formData.es_retoque} onChange={(e) => handleCambioHorasOTarifa('es_retoque', e.target.value)} style={{ marginLeft: '10px', width: 'auto' }}>
            <option value="N">No (Cobro normal)</option>
            <option value="S">Sí (Gratuito / Ajuste)</option>
          </select>
        </label>

        <select value={formData.TARIFA_id_tarifa} onChange={(e) => handleCambioHorasOTarifa('TARIFA_id_tarifa', e.target.value)}>
          <option value="">-- Selecciona el Tipo de Trabajo / Tarifa --</option>
          {tarifas.map(t => (
            <option key={t.id_tarifa} value={t.id_tarifa}>{t.tipo_trabajo} (${parseFloat(t.valor_hora).toLocaleString('es-CO')}/h)</option>
          ))}
        </select>

        <select value={formData.TATUAJE_id_tatuaje} onChange={(e) => handleCambioHorasOTarifa('TATUAJE_id_tatuaje', e.target.value)}>
          <option value="">-- Selecciona el Tatuaje en Curso --</option>
          {tatuajes.map(t => (
            <option key={t.id_tatuaje} value={t.id_tatuaje}>{t.diseno} (ID: {t.id_tatuaje})</option>
          ))}
        </select>

        <div style={{ marginTop: '10px', padding: '10px', background: '#1e1e24', borderRadius: '4px' }}>
          <strong>Valor calculado de la sesión:</strong> ${parseFloat(formData.valor).toLocaleString('es-CO')}
        </div>

        <button type="submit">Guardar Sesión</button>
      </form>
    </div>
  );
}