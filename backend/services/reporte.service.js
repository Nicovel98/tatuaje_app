const facturaRepository = require("../repositories/FacturaRepository");

class ReporteService {
  async obtenerComisiones(fechaInicio, fechaFin) {
    if (!fechaInicio || !fechaFin) {
      throw new Error("Debe ingresar ambas fechas para filtrar.");
    }

    if (new Date(fechaInicio) > new Date(fechaFin)) {
      throw new Error("Rango de fechas inválido: la fecha inicial debe ser anterior o igual a la final.");
    }

    const facturas = await facturaRepository.findByRangoFechas(fechaInicio, fechaFin);

    // Agrupar por tatuador. Una factura consolidada se reparte entre los
    // tatuadores de sus sesiones, proporcionalmente al valor de cada sesión.
    const agrupado = {};
    const facturasPorTatuador = {};

    const acumular = (idUsuario, nombre, idFactura, monto) => {
      if (!agrupado[idUsuario]) {
        agrupado[idUsuario] = {
          id_usuario: idUsuario,
          nombre_tatuador: nombre,
          facturas_emitidas: 0,
          bruto_trabajado: 0,
          comision_tatuador: 0,
          ganancia_estudio: 0,
        };
        facturasPorTatuador[idUsuario] = new Set();
      }
      facturasPorTatuador[idUsuario].add(idFactura);
      agrupado[idUsuario].bruto_trabajado += monto;
      agrupado[idUsuario].comision_tatuador += monto * 0.5;
      agrupado[idUsuario].ganancia_estudio += monto * 0.5;
    };

    for (const f of facturas) {
      const subtotal = Number(f.subtotal);
      const sesiones = await facturaRepository.findSesionesDeFactura(f);

      if (sesiones.length === 0) {
        acumular(0, "Sin Asignar", f.id_factura, subtotal);
        continue;
      }

      const totalValor = sesiones.reduce((sum, x) => sum + Number(x.valor), 0);
      for (const ses of sesiones) {
        const parte = totalValor > 0 ? Number(ses.valor) / totalValor : 1 / sesiones.length;
        const t = ses.tatuador;
        acumular(t ? t.id_usuario : 0, t ? t.nombre : "Sin Asignar", f.id_factura, subtotal * parte);
      }
    }

    return Object.values(agrupado).map((r) => ({
      ...r,
      facturas_emitidas: facturasPorTatuador[r.id_usuario].size,
      bruto_trabajado: Number(r.bruto_trabajado.toFixed(2)),
      comision_tatuador: Number(r.comision_tatuador.toFixed(2)),
      ganancia_estudio: Number(r.ganancia_estudio.toFixed(2)),
    }));
  }

  async obtenerHistorialFacturas() {
    const facturas = await facturaRepository.findWithDetails();
    return facturas.map((f) => ({
      id_factura: f.id_factura,
      num_factura: f.id_factura,
      fecha_emision: f.fecha_emision,
      estado: f.estado,
      total: f.total,
      tipo_pago: f.tipo_pago,
      monto_pagado: f.monto_pagado,
      diseno: f.sesion?.tatuaje?.diseno || f.tatuaje?.diseno || "N/A",
      nombre_cliente: f.sesion?.cliente?.nombre || "N/A",
      nombre_tatuador: f.sesion?.tatuador?.nombre || "N/A",
    }));
  }
}

module.exports = new ReporteService();
