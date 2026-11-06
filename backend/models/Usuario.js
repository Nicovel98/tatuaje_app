class Usuario {
  constructor({
    id_usuario,
    identificacion = null,
    nombre,
    correo,
    clave,
    rol,
    estado = "ACTIVO",
    eliminado = false,
    fecha_creacion,
    fecha_actualizacion,
    usuario_creacion = "SISTEMA",
    usuario_actualizacion = null,
  }) {
    this.id_usuario = id_usuario;
    this.identificacion = identificacion;
    this.nombre = nombre;
    this.correo = correo;
    this.clave = clave;
    this.rol = rol;
    this.estado = estado;
    this.eliminado = eliminado;
    this.fecha_creacion = fecha_creacion;
    this.fecha_actualizacion = fecha_actualizacion;
    this.usuario_creacion = usuario_creacion;
    this.usuario_actualizacion = usuario_actualizacion;
  }

  esAdministrador() {
    return this.rol === "ADMINISTRADOR";
  }

  estaActivo() {
    return this.estado === "ACTIVO" && !this.eliminado;
  }

  inactivar(usuarioModificador) {
    this.estado = "INACTIVO";
    this.usuario_actualizacion = usuarioModificador;
  }

  activar(usuarioModificador) {
    this.estado = "ACTIVO";
    this.usuario_actualizacion = usuarioModificador;
  }

  marcarEliminado(usuarioModificador) {
    this.eliminado = true;
    this.estado = "INACTIVO";
    this.usuario_actualizacion = usuarioModificador;
  }
}

module.exports = Usuario;
