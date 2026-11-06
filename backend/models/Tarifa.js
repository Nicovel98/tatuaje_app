class Tarifa {
  constructor({
    id_tarifa,
    tipo_trabajo,
    valor_hora,
    tatuador_nombre = null,
    eliminado = false,
    fecha_creacion,
    fecha_actualizacion,
    usuario_creacion = "SISTEMA",
    usuario_actualizacion = null,
  }) {
    this.id_tarifa = id_tarifa;
    this.tipo_trabajo = tipo_trabajo;
    this.valor_hora = Number(valor_hora);
    this.tatuador_nombre = tatuador_nombre;
    this.eliminado = eliminado;
    this.fecha_creacion = fecha_creacion;
    this.fecha_actualizacion = fecha_actualizacion;
    this.usuario_creacion = usuario_creacion;
    this.usuario_actualizacion = usuario_actualizacion;
  }

  validarValorHora() {
    return !isNaN(this.valor_hora) && this.valor_hora > 0;
  }
}

module.exports = Tarifa;
