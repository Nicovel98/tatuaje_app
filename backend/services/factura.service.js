const facturaRepository = require("../repositories/FacturaRepository");
const sesionRepository = require("../repositories/SesionRepository");
const Factura = require("../models/Factura");

class FacturaService {
  async crearFactura({
    id_factura,
    sesion_id,
    fecha_emision,
    horas_facturadas,
    valor_unitario,
    subtotal,
    total,
    tipo_pago = null,
    monto_pagado = 0.0,
    usuario_creacion = "SISTEMA",
  }) {
    if (!sesion_id || !fecha_emision || horas_facturadas === undefined || valor_unitario === undefined) {
      throw new Error("Campos obligatorios incompletos para emitir la factura.");
    }

    if (id_factura) {
      const existeId = await facturaRepository.findById(id_factura);
      if (existeId) {
        throw new Error("El ID / Número de factura ya está registrado.");
      }
    }

    const sesion = await sesionRepository.findById(sesion_id);
    if (!sesion) {
      throw new Error("La sesión referenciada no existe.");
    }

    const calcSubtotal = subtotal !== undefined ? Number(subtotal) : Number(horas_facturadas) * Number(valor_unitario);
    const calcTotal = total !== undefined ? Number(total) : calcSubtotal;

    let estado = "expedida";
    let fechaPagoFinal = null;
    const pagoNum = Number(monto_pagado || 0);

    if (tipo_pago && pagoNum > 0) {
      estado = "pago";
      fechaPagoFinal = new Date();
    }

    const payload = {
      sesion_id: Number(sesion_id),
      fecha_emision,
      estado,
      horas_facturadas: Number(horas_facturadas),
      valor_unitario: Number(valor_unitario),
      subtotal: calcSubtotal,
      total: calcTotal,
      tipo_pago: tipo_pago || null,
      fecha_pago: fechaPagoFinal,
      monto_pagado: pagoNum,
      eliminado: false,
      usuario_creacion,
    };
    if (id_factura) payload.id_factura = Number(id_factura);

    return await facturaRepository.create(payload);
  }

  async registrarPago(id_factura, { tipo_pago, monto_pagado }, usuarioModificador = "ADMIN") {
    const factura = await facturaRepository.findById(id_factura);
    if (!factura) {
      throw new Error("Factura no encontrada.");
    }

    factura.registrarPago({ tipo_pago, monto_pagado }, usuarioModificador);

    await facturaRepository.update(id_factura, {
      estado: factura.estado,
      tipo_pago: factura.tipo_pago,
      fecha_pago: factura.fecha_pago,
      monto_pagado: factura.monto_pagado,
      usuario_actualizacion: usuarioModificador,
    });

    return factura;
  }

  async listarConDetalles() {
    return await facturaRepository.findWithDetails();
  }

  async obtenerDetalle(id_factura) {
    const factura = await facturaRepository.findByIdWithDetails(id_factura);
    if (!factura) {
      throw new Error(`Factura #${id_factura} no encontrada.`);
    }

    const sesion = factura.sesion;
    const cliente = sesion?.cliente;
    const tatuaje = sesion?.tatuaje;
    const tatuador = sesion?.tatuador;

    return {
      id_factura: factura.id_factura,
      num_factura: factura.id_factura,
      fecha_emision: factura.fecha_emision,
      estado: factura.estado,
      horas_facturadas: factura.horas_facturadas,
      valor_unitario: factura.valor_unitario,
      subtotal: factura.subtotal,
      total: factura.total,
      tipo_pago: factura.tipo_pago,
      fecha_pago: factura.fecha_pago,
      monto_pagado: factura.monto_pagado,
      anticipo: sesion ? Number(sesion.anticipo || 0) : 0,
      valor_estimado: sesion ? Number(sesion.valor || 0) : Number(factura.subtotal),
      id_cliente: cliente ? cliente.id_cliente : "N/A",
      nombre_cliente: cliente ? cliente.nombre : "Cliente General",
      correo_cliente: cliente ? cliente.correo : "N/A",
      telefono_cliente: cliente ? cliente.telefono : "N/A",
      diseno: tatuaje ? tatuaje.diseno : "Servicio de Tatuaje",
      zona_cuerpo: tatuaje ? tatuaje.zona_cuerpo : "General",
      nombre_tatuador: tatuador ? tatuador.nombre : "Staff",
      detalles: [
        {
          tipo_trabajo: tatuaje ? tatuaje.diseno : "Sesión de Tatuaje",
          es_retoque: sesion?.es_retoque || "N",
          nombre_tatuador: tatuador ? tatuador.nombre : "Staff",
          fecha: sesion ? sesion.fecha : factura.fecha_emision,
          horas_facturadas: factura.horas_facturadas,
          subtotal: factura.subtotal,
        },
      ],
    };
  }

  async eliminarFactura(id_factura, usuarioModificador = "ADMIN") {
    const factura = await facturaRepository.findById(id_factura);
    if (!factura) {
      throw new Error("Factura no encontrada.");
    }
    factura.marcarEliminado(usuarioModificador);
    await facturaRepository.update(id_factura, {
      estado: "eliminada",
      eliminado: true,
      usuario_actualizacion: usuarioModificador,
    });
    return true;
  }
}

module.exports = new FacturaService();
