class Cliente {
  constructor({
    id_cliente,
    nombre,
    telefono,
    correo,
    eliminado = false,
    fecha_creacion,
    fecha_actualizacion,
    usuario_creacion = "SISTEMA",
    usuario_actualizacion = null,
  }) {
    this.id_cliente = id_cliente;
    this.nombre = nombre;
    this.telefono = telefono;
    this.correo = correo;
    this.eliminado = eliminado;
    this.fecha_creacion = fecha_creacion;
    this.fecha_actualizacion = fecha_actualizacion;
    this.usuario_creacion = usuario_creacion;
    this.usuario_actualizacion = usuario_actualizacion;
  }

  marcarEliminado(usuarioModificador) {
    this.eliminado = true;
    this.usuario_actualizacion = usuarioModificador;
  }

  actualizarDatos({ nombre, telefono, correo }, usuarioModificador) {
    if (nombre) this.nombre = nombre;
    if (telefono) this.telefono = telefono;
    if (correo) this.correo = correo;
    this.usuario_actualizacion = usuarioModificador;
  }
}

module.exports = Cliente;
