class Sesion {
  constructor({
    id_sesion,
    tatuaje_id,
    cliente_id,
    usuario_id,
    fecha,
    duracion_horas,
    es_retoque = "N",
    valor,
    anticipo = 0.0,
    eliminado = false,
    fecha_creacion,
    fecha_actualizacion,
    usuario_creacion = "SISTEMA",
    usuario_actualizacion = null,
    // Propiedades cargadas opcionalmente en eager loading
    tatuaje = null,
    cliente = null,
    tatuador = null,
    facturas = [],
  }) {
    this.id_sesion = id_sesion;
    this.tatuaje_id = tatuaje_id;
    this.cliente_id = cliente_id;
    this.usuario_id = usuario_id;
    this.fecha = fecha;
    this.duracion_horas = Number(duracion_horas);
    this.es_retoque = es_retoque;
    this.valor = Number(valor);
    this.anticipo = Number(anticipo || 0);
    this.eliminado = eliminado;
    this.fecha_creacion = fecha_creacion;
    this.fecha_actualizacion = fecha_actualizacion;
    this.usuario_creacion = usuario_creacion;
    this.usuario_actualizacion = usuario_actualizacion;
    this.tatuaje = tatuaje;
    this.cliente = cliente;
    this.tatuador = tatuador;
    this.facturas = facturas;
  }

  marcarEliminado(usuarioModificador) {
    this.eliminado = true;
    this.usuario_actualizacion = usuarioModificador;
  }
}

module.exports = Sesion;
