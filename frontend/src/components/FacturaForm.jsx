import { useState } from 'react';
import axios from 'axios';

export default function FacturaForm({ tatuajes, onFacturaGenerada }) {
  const [tatuajeId, setTatuajeId] = useState('');
  const [numFactura, setNumFactura] = useState('');
  const [resumen, setResumen] = useState(null);
  const [anticipo, setAnticipo] = useState('0');
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [facturaEmitida, setFacturaEmitida] = useState(null); // Guarda los datos de la última factura para imprimir

  const consultarSesiones = async (id) => {
    setTatuajeId(id);
    if (!id) {
      setResumen(null);
      return;
    }
    try {
      const res = await axios.get(`http://localhost:5000/api/facturacion/resumen/${id}`);
      setResumen(res.data);
      setError('');
    } catch (err) {
      setResumen(null);
      setError(err.response?.data?.error || 'Error al consultar las sesiones del tatuaje');
    }
  };

  const handleGenerarFactura = async (e) => {
    e.preventDefault();
    if (!numFactura || !tatuajeId || !resumen) {
      setError('Por favor completa todos los campos requeridos.');
      return;
    }

    const totalFinal = parseFloat(resumen.total_calculado) - parseFloat(anticipo);

    if (totalFinal < 0) {
      setError('El anticipo no puede ser mayor al valor total acumulado.');
      return;
    }

    try {
      const datosFactura = {
        num_factura: parseInt(numFactura),
        fecha_emision: new Date().toISOString().split('T')[0],
        total: totalFinal,
        TATUAJE_id_tatuaje: parseInt(tatuajeId),
        // 👈 CAMBIO CRUCIAL EN 3FN: Enviamos las sesiones para que el backend llene DETALLE_FACTURA
        sesiones_facturar: resumen.sesiones_detalladas 
      };

      await axios.post('http://localhost:5000/api/facturas', datosFactura);
      
      const tatuajeSeleccionado = tatuajes.find(t => t.id_tatuaje === parseInt(tatuajeId));
      setFacturaEmitida({
        ...datosFactura,
        diseno: tatuajeSeleccionado?.diseno,
        cliente: tatuajeSeleccionado?.nombre_cliente,
        subtotal: resumen.total_calculado,
        anticipo: anticipo,
        total_sesiones: resumen.total_sesiones
      });

      setExito(`Factura #${numFactura} y desglose de servicios emitidos con éxito.`);
      setError('');
      setResumen(null);
      setNumFactura('');
      setAnticipo('0');
      if (onFacturaGenerada) onFacturaGenerada();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar la factura en el sistema.');
    }
  };

  // Función mágica para mandar a imprimir o guardar como PDF desde el celular o PC
  const handleImprimir = () => {
    window.print();
  };

  return (
    <div className="card-form">
      <h3>Generar Factura de Servicio (HU-06)</h3>
      {error && <p className="error">{error}</p>}
      {exito && <p className="exito" style={{ color: '#2ecc71', fontWeight: 'bold' }}>{exito}</p>}

      <form onSubmit={handleGenerarFactura} className="no-print">
        <input 
          type="number" 
          placeholder="Número de Factura" 
          value={numFactura} 
          onChange={(e) => setNumFactura(e.target.value)} 
        />

        <select value={tatuajeId} onChange={(e) => consultarSesiones(e.target.value)}>
          <option value="">-- Selecciona el Tatuaje a Facturar --</option>
          {tatuajes.map(t => (
            <option key={t.id_tatuaje} value={t.id_tatuaje}>{t.diseno} (ID: {t.id_tatuaje})</option>
          ))}
        </select>

        <input 
          type="number" 
          placeholder="Descontar Anticipo (\$) - HU-05" 
          value={anticipo} 
          onChange={(e) => setAnticipo(e.target.value)} 
        />

        {resumen && (
          <div style={{ margin: '15px 0', padding: '15px', background: '#1e1e24', borderRadius: '4px', borderLeft: '5px solid #2ecc71' }}>
            <h4>Resumen de Cobro Consolidado</h4>
            <p><strong>Sesiones:</strong> {resumen.total_sesiones}</p>
            <p><strong>Subtotal sesiones:</strong> \${parseFloat(resumen.total_calculado).toLocaleString('es-CO')}</p>
            <p><strong>Anticipo a deducir:</strong> -\${parseFloat(anticipo || 0).toLocaleString('es-CO')}</p>
            <hr style={{ borderColor: '#444' }} />
            <p style={{ fontSize: '18px', color: '#f4d03f' }}>
              <strong>Neto a Pagar:</strong> \${(parseFloat(resumen.total_calculado) - parseFloat(anticipo || 0)).toLocaleString('es-CO')}
            </p>
          </div>
        )}

        <button type="submit" disabled={!resumen}>Confirmar y Emitir Factura</button>
      </form>

      {/* Botón de impresión rápido si ya se generó una factura */}
      {facturaEmitida && (
        <div style={{ marginTop: '15px' }} className="no-print">
          <button onClick={handleImprimir} style={{ background: '#2ecc71', color: '#fff', width: '100%' }}>
            🖨️ Descargar PDF / Imprimir Factura #{facturaEmitida.num_factura}
          </button>
        </div>
      )}

      {/* VISTA IMPRIMIBLE: Este bloque está oculto en la pantalla normal y solo aparece al imprimir */}
      {facturaEmitida && (
        <div className="print-only ticket-factura">
          <div className="ticket-header">
            <h2>ART INK TATTOO STUDIO</h2>
            <p>Nit: 123456789-0</p>
            <p>Tel: +57 300 123 4567</p>
            <p>Bogotá, Colombia</p>
          </div>
          <hr />
          <div className="ticket-body">
            <p><strong>Factura N°:</strong> {facturaEmitida.num_factura}</p>
            <p><strong>Fecha:</strong> {facturaEmitida.fecha_emision}</p>
            <p><strong>Cliente:</strong> {facturaEmitida.cliente}</p>
            <p><strong>Trabajo / Diseño:</strong> {facturaEmitida.diseno}</p>
            <p><strong>Sesiones Realizadas:</strong> {facturaEmitida.total_sesiones}</p>
            <hr />
            <div className="ticket-totales">
              <p>Subtotal Sesiones: <span>\${parseFloat(facturaEmitida.subtotal).toLocaleString('es-CO')}</span></p>
              <p>Anticipo Deducido: <span>-\${parseFloat(facturaEmitida.anticipo).toLocaleString('es-CO')}</span></p>
              <h3 style={{ marginTop: '10px' }}>TOTAL NETO: <span>\${parseFloat(facturaEmitida.total).toLocaleString('es-CO')}</span></h3>
            </div>
          </div>
          <hr />
          <div className="ticket-footer">
            <p>¡Gracias por confiar en nuestro arte!</p>
            <p>Conserve este ticket para el control de sus retoques.</p>
          </div>
        </div>
      )}
    </div>
  );
}