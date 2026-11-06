class SesionResponseDto {
  static fromModel(model) {
    if (!model) return null;
    return {
      id_sesion: model.id_sesion,
      tatuaje_id: model.tatuaje_id,
      cliente_id: model.cliente_id,
      usuario_id: model.usuario_id,
      fecha: model.fecha,
      duracion_horas: model.duracion_horas,
      es_retoque: model.es_retoque,
      valor: model.valor,
      anticipo: Number(model.anticipo || 0),
      fecha_creacion: model.fecha_creacion,
      tatuaje: model.tatuaje ? {
        id_tatuaje: model.tatuaje.id_tatuaje,
        diseno: model.tatuaje.diseno,
        zona_cuerpo: model.tatuaje.zona_cuerpo,
        estado: model.tatuaje.estado,
      } : null,
      cliente: model.cliente ? {
        id_cliente: model.cliente.id_cliente,
        nombre: model.cliente.nombre,
        telefono: model.cliente.telefono,
        correo: model.cliente.correo,
      } : null,
      tatuador: model.tatuador ? {
        id_usuario: model.tatuador.id_usuario,
        nombre: model.tatuador.nombre,
        correo: model.tatuador.correo,
      } : null,
      facturas: model.facturas || [],
    };
  }

  static fromModelList(list) {
    if (!list) return [];
    return list.map((item) => SesionResponseDto.fromModel(item));
  }
}

module.exports = SesionResponseDto;
