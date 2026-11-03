class Factura {
  constructor({
    id_factura,
    sesion_id,
    fecha_emision,
    estado = "expedida",
    horas_facturadas,
    valor_unitario,
    subtotal,
    total,
    tipo_pago = null,
    fecha_pago = null,
    monto_pagado = 0.0,
    eliminado = false,
    fecha_creacion,
    fecha_actualizacion,
    usuario_creacion = "SISTEMA",
    usuario_actualizacion = null,
    sesion = null,
  }) {
    this.id_factura = id_factura;
    this.sesion_id = sesion_id;
    this.fecha_emision = fecha_emision;
    this.estado = estado;
    this.horas_facturadas = Number(horas_facturadas);
    this.valor_unitario = Number(valor_unitario);
    this.subtotal = Number(subtotal);
    this.total = Number(total);
    this.tipo_pago = tipo_pago;
    this.fecha_pago = fecha_pago;
    this.monto_pagado = Number(monto_pagado);
    this.eliminado = eliminado;
    this.fecha_creacion = fecha_creacion;
    this.fecha_actualizacion = fecha_actualizacion;
    this.usuario_creacion = usuario_creacion;
    this.usuario_actualizacion = usuario_actualizacion;
    this.sesion = sesion;
  }

  registrarPago({ tipo_pago, monto_pagado }, usuarioModificador) {
    const tiposValidos = ["EFECTIVO", "TRANSFERENCIA", "TARJETA"];
    if (!tiposValidos.includes(tipo_pago)) {
      throw new Error(`Tipo de pago inválido: ${tipo_pago}`);
    }
    this.tipo_pago = tipo_pago;
    this.monto_pagado = Number(monto_pagado);
    this.fecha_pago = new Date();
    this.estado = "pago";
    this.usuario_actualizacion = usuarioModificador;
  }

  marcarEliminado(usuarioModificador) {
    this.eliminado = true;
    this.estado = "eliminada";
    this.usuario_actualizacion = usuarioModificador;
  }
}

module.exports = Factura;
