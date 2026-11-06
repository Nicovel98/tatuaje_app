class UsuarioResponseDto {
  static fromModel(model) {
    if (!model) return null;
    return {
      id_usuario: model.id_usuario,
      identificacion: model.identificacion,
      nombre: model.nombre,
      correo: model.correo,
      rol: model.rol,
      estado: model.estado,
      fecha_creacion: model.fecha_creacion,
      usuario_creacion: model.usuario_creacion,
    };
  }

  static fromModelList(list) {
    if (!list) return [];
    return list.map((item) => UsuarioResponseDto.fromModel(item));
  }
}

module.exports = UsuarioResponseDto;
