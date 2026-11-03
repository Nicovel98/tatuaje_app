class ClienteResponseDto {
  static fromModel(model) {
    if (!model) return null;
    return {
      id_cliente: model.id_cliente,
      nombre: model.nombre,
      telefono: model.telefono,
      correo: model.correo,
      fecha_creacion: model.fecha_creacion,
      fecha_actualizacion: model.fecha_actualizacion,
    };
  }

  static fromModelList(list) {
    if (!list) return [];
    return list.map((item) => ClienteResponseDto.fromModel(item));
  }
}

module.exports = ClienteResponseDto;
