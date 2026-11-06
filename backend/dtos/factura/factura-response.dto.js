class FacturaResponseDto {
  static fromModel(model) {
    if (!model) return null;
    return {
      id_factura: model.id_factura,
      sesion_id: model.sesion_id,
      tatuaje_id: model.tatuaje_id,
      fecha_emision: model.fecha_emision,
      estado: model.estado,
      horas_facturadas: model.horas_facturadas,
      valor_unitario: model.valor_unitario,
      subtotal: model.subtotal,
      total: model.total,
      tipo_pago: model.tipo_pago,
      fecha_pago: model.fecha_pago,
      monto_pagado: model.monto_pagado,
      fecha_creacion: model.fecha_creacion,
      resumen: model.resumen || null,
      sesion: model.sesion ? {
        id_sesion: model.sesion.id_sesion,
        fecha: model.sesion.fecha,
        duracion_horas: model.sesion.duracion_horas,
        tatuaje: model.sesion.tatuaje,
        cliente: model.sesion.cliente,
        tatuador: model.sesion.tatuador,
      } : null,
    };
  }

  static fromModelList(list) {
    if (!list) return [];
    return list.map((item) => FacturaResponseDto.fromModel(item));
  }
}

module.exports = FacturaResponseDto;
