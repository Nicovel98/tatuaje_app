const facturaRepository = require("../repositories/FacturaRepository");
const sesionRepository = require("../repositories/SesionRepository");
const tatuajeRepository = require("../repositories/TatuajeRepository");
const { SesionEntity } = require("../entities");
const Factura = require("../models/Factura");

class FacturaService {
  async crearFactura({
    id_factura,
    sesion_id,
    tatuaje_id,
    fecha_emision,
    horas_facturadas,
    valor_unitario,
    subtotal,
    total,
    tipo_pago = null,
    monto_pagado = 0.0,
    usuario_creacion = "SISTEMA",
  }) {
    if (tatuaje_id && !sesion_id) {
      return await this.crearFacturaTatuaje({
        id_factura,
        tatuaje_id,
        fecha_emision,
        tipo_pago,
        monto_pagado,
        usuario_creacion,
      });
    }

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
      tatuaje_id: sesion.tatuaje_id || (tatuaje_id ? Number(tatuaje_id) : null),
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

  async crearFacturaTatuaje({
    id_factura,
    tatuaje_id,
    fecha_emision = new Date().toISOString().split("T")[0],
    tipo_pago = null,
    monto_pagado = 0.0,
    usuario_creacion = "SISTEMA",
  }) {
    if (!tatuaje_id) {
      throw new Error("Debe especificar el ID del tatuaje a facturar.");
    }

    const tatuaje = await tatuajeRepository.findById(tatuaje_id);
    if (!tatuaje) {
      throw new Error("El tatuaje referenciado no existe.");
    }

    const sesiones = await SesionEntity.findAll({
      where: { tatuaje_id, eliminado: false },
      order: [["fecha", "ASC"]],
    });

    if (!sesiones || sesiones.length === 0) {
      throw new Error("No hay sesiones para facturar.");
    }

    if (id_factura) {
      const existeId = await facturaRepository.findById(id_factura);
      if (existeId) {
        throw new Error("El ID / Número de factura ya está registrado.");
      }
    }

    const totalHoras = sesiones.reduce((sum, s) => sum + Number(s.duracion_horas), 0);
    const totalSesiones = sesiones.reduce((sum, s) => sum + Number(s.valor), 0);
    const totalAnticipos = sesiones.reduce((sum, s) => sum + Number(s.anticipo || 0), 0);
    const saldoPagar = Math.max(0, totalSesiones - totalAnticipos);
    const valorUnitario = totalHoras > 0 ? Number((totalSesiones / totalHoras).toFixed(2)) : totalSesiones;

    let estado = "expedida";
    let fechaPagoFinal = null;
    const pagoNum = Number(monto_pagado || 0);

    if (tipo_pago && pagoNum > 0) {
      estado = "pago";
      fechaPagoFinal = new Date();
    }

    const payload = {
      tatuaje_id: Number(tatuaje_id),
      sesion_id: sesiones[0]?.id_sesion || null,
      fecha_emision,
      estado,
      horas_facturadas: totalHoras,
      valor_unitario: valorUnitario,
      subtotal: totalSesiones,
      total: saldoPagar,
      tipo_pago: tipo_pago || null,
      fecha_pago: fechaPagoFinal,
      monto_pagado: pagoNum,
      eliminado: false,
      usuario_creacion,
    };
    if (id_factura) payload.id_factura = Number(id_factura);

    const factura = await facturaRepository.create(payload);

    return {
      ...factura,
      resumen: {
        total_sesiones: totalSesiones,
        anticipo: totalAnticipos,
        saldo_a_pagar: saldoPagar,
        num_sesiones: sesiones.length,
      },
    };
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
      fecha_emision: factura.fecha_emision,
      estado: factura.estado,
      horas_facturadas: factura.horas_facturadas,
      valor_unitario: factura.valor_unitario,
      subtotal: factura.subtotal,
      total: factura.total,
      tipo_pago: factura.tipo_pago,
      fecha_pago: factura.fecha_pago,
      monto_pagado: factura.monto_pagado,
      cliente: cliente ? { id_cliente: cliente.id_cliente, nombre: cliente.nombre, correo: cliente.correo, telefono: cliente.telefono } : null,
      tatuaje: tatuaje ? { id_tatuaje: tatuaje.id_tatuaje, diseno: tatuaje.diseno, zona_cuerpo: tatuaje.zona_cuerpo } : null,
      tatuador: tatuador ? { id_usuario: tatuador.id_usuario, nombre: tatuador.nombre } : null,
      sesion: sesion ? { id_sesion: sesion.id_sesion, duracion_horas: sesion.duracion_horas, anticipo: sesion.anticipo, valor: sesion.valor } : null,
    };
  }

  async eliminarFactura(id_factura, usuarioModificador = "ADMIN") {
    const factura = await facturaRepository.findById(id_factura);
    if (!factura) {
      throw new Error("Factura no encontrada.");
    }
    await facturaRepository.softDelete(id_factura, usuarioModificador);
    return true;
  }
}

module.exports = new FacturaService();
