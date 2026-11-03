const facturaRepository = require("../repositories/FacturaRepository");

class ReporteService {
  async obtenerComisiones(fechaInicio, fechaFin) {
    if (!fechaInicio || !fechaFin) {
      throw new Error("Debe ingresar ambas fechas para filtrar.");
    }

    const facturas = await facturaRepository.findByRangoFechas(fechaInicio, fechaFin);

    // Agrupar por tatuador
    const agrupado = {};

    for (const f of facturas) {
      const tatuador = f.sesion?.tatuador;
      const idUsuario = tatuador ? tatuador.id_usuario : 0;
      const nombreTatuador = tatuador ? tatuador.nombre : "Sin Asignar";

      if (!agrupado[idUsuario]) {
        agrupado[idUsuario] = {
          id_usuario: idUsuario,
          nombre_tatuador: nombreTatuador,
          facturas_emitidas: 0,
          bruto_trabajado: 0,
          comision_tatuador: 0,
          ganancia_estudio: 0,
        };
      }

      agrupado[idUsuario].facturas_emitidas += 1;
      agrupado[idUsuario].bruto_trabajado += Number(f.subtotal);
      agrupado[idUsuario].comision_tatuador += Number(f.subtotal) * 0.5;
      agrupado[idUsuario].ganancia_estudio += Number(f.subtotal) * 0.5;
    }

    return Object.values(agrupado);
  }

  async obtenerHistorialFacturas() {
    const facturas = await facturaRepository.findWithDetails();
    return facturas.map((f) => ({
      id_factura: f.id_factura,
      fecha_emision: f.fecha_emision,
      estado: f.estado,
      total: f.total,
      tipo_pago: f.tipo_pago,
      monto_pagado: f.monto_pagado,
      diseno: f.sesion?.tatuaje?.diseno || "N/A",
      nombre_cliente: f.sesion?.cliente?.nombre || "N/A",
      nombre_tatuador: f.sesion?.tatuador?.nombre || "N/A",
    }));
  }
}

module.exports = new ReporteService();
