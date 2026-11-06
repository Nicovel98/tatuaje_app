class TatuajeResponseDto {
  static fromModel(model) {
    if (!model) return null;
    return {
      id_tatuaje: model.id_tatuaje,
      diseno: model.diseno,
      zona_cuerpo: model.zona_cuerpo,
      estado: model.estado,
      horas_estimadas: model.horas_estimadas,
      valor_estimado: model.valor_estimado,
      fecha_finalizacion: model.fecha_finalizacion,
      fecha_creacion: model.fecha_creacion,
    };
  }

  static fromModelList(list) {
    if (!list) return [];
    return list.map((item) => TatuajeResponseDto.fromModel(item));
  }
}

module.exports = TatuajeResponseDto;
