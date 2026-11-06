class Tatuaje {
  constructor({
    id_tatuaje,
    diseno,
    zona_cuerpo,
    estado = "PENDIENTE",
    horas_estimadas = 1.0,
    valor_estimado,
    fecha_finalizacion = null,
    eliminado = false,
    fecha_creacion,
    fecha_actualizacion,
    usuario_creacion = "SISTEMA",
    usuario_actualizacion = null,
  }) {
    this.id_tatuaje = id_tatuaje;
    this.diseno = diseno;
    this.zona_cuerpo = zona_cuerpo;
    this.estado = estado;
    this.horas_estimadas = Number(horas_estimadas);
    this.valor_estimado = Number(valor_estimado);
    this.fecha_finalizacion = fecha_finalizacion;
    this.eliminado = eliminado;
    this.fecha_creacion = fecha_creacion;
    this.fecha_actualizacion = fecha_actualizacion;
    this.usuario_creacion = usuario_creacion;
    this.usuario_actualizacion = usuario_actualizacion;
  }

  cambiarEstado(nuevoEstado, usuarioModificador) {
    const estadosValidos = ["PENDIENTE", "EN_PROGRESO", "FINALIZADO", "CANCELADO"];
    if (!estadosValidos.includes(nuevoEstado)) {
      throw new Error(`Estado inválido: ${nuevoEstado}`);
    }
    this.estado = nuevoEstado;
    if (nuevoEstado === "FINALIZADO") {
      this.fecha_finalizacion = new Date().toISOString().split("T")[0];
    }
    this.usuario_actualizacion = usuarioModificador;
  }

  marcarEliminado(usuarioModificador) {
    this.eliminado = true;
    this.usuario_actualizacion = usuarioModificador;
  }
}

module.exports = Tatuaje;
