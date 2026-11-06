const usuarioRepository = require("../repositories/UsuarioRepository");
const Usuario = require("../models/Usuario");
const bcrypt = require("bcrypt");

class UsuarioService {
  async crearUsuario({ id_usuario, identificacion, nombre, correo, clave, rol, usuario_creacion = "SISTEMA" }) {
    if (!nombre || !nombre.trim() || !correo || !correo.trim() || !clave || !rol) {
      throw new Error("Nombre, correo, contraseña y rol son obligatorios.");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo.trim())) {
      throw new Error("El formato del correo electrónico es inválido.");
    }

    if (id_usuario) {
      const existeId = await usuarioRepository.findById(id_usuario);
      if (existeId) {
        throw new Error("El ID de usuario ya se encuentra registrado.");
      }
    }

    const existeCorreo = await usuarioRepository.existsByCorreo(correo.trim());
    if (existeCorreo) {
      throw new Error("El correo electrónico ya está en uso.");
    }

    const saltRounds = 10;
    const claveHash = await bcrypt.hash(clave, saltRounds);

    const payload = {
      identificacion: identificacion ? String(identificacion).trim() : null,
      nombre: nombre.trim(),
      correo: correo.trim(),
      clave: claveHash,
      rol,
      estado: "ACTIVO",
      eliminado: false,
      usuario_creacion,
    };
    if (id_usuario) payload.id_usuario = Number(id_usuario);

    const guardado = await usuarioRepository.create(payload);
    return guardado;
  }

  async listarActivos() {
    return await usuarioRepository.findActivos();
  }

  async actualizarUsuario(id_usuario, datos, usuarioModificador = "ADMIN") {
    const usuario = await usuarioRepository.findById(id_usuario);
    if (!usuario) {
      throw new Error("Usuario no encontrado.");
    }

    if (datos.correo) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(datos.correo.trim())) {
        throw new Error("El formato del correo electrónico es inválido.");
      }

      if (datos.correo.trim() !== usuario.correo) {
        const existeCorreo = await usuarioRepository.existsByCorreo(datos.correo.trim());
        if (existeCorreo) {
          throw new Error("El correo electrónico ya está en uso por otro colaborador.");
        }
      }
    }

    const payload = {
      usuario_actualizacion: usuarioModificador,
    };
    if (datos.identificacion !== undefined) payload.identificacion = datos.identificacion ? String(datos.identificacion).trim() : null;
    if (datos.nombre !== undefined) payload.nombre = datos.nombre.trim();
    if (datos.correo !== undefined) payload.correo = datos.correo.trim();
    if (datos.rol !== undefined) payload.rol = datos.rol;
    if (datos.estado !== undefined) payload.estado = datos.estado;
    if (datos.clave && datos.clave.trim() !== "") {
      const saltRounds = 10;
      payload.clave = await bcrypt.hash(datos.clave, saltRounds);
    }

    return await usuarioRepository.update(id_usuario, payload);
  }

  async inactivarUsuario(id_usuario, usuarioModificador = "ADMIN") {
    const usuario = await usuarioRepository.findById(id_usuario);
    if (!usuario) {
      throw new Error("Usuario no encontrado.");
    }

    usuario.inactivar(usuarioModificador);
    await usuarioRepository.update(id_usuario, {
      estado: usuario.estado,
      usuario_actualizacion: usuarioModificador,
    });
    return usuario;
  }

  async eliminarUsuario(id_usuario, usuarioModificador = "ADMIN") {
    const usuario = await usuarioRepository.findById(id_usuario);
    if (!usuario) {
      throw new Error("Usuario no encontrado.");
    }
    usuario.marcarEliminado(usuarioModificador);
    await usuarioRepository.softDelete(id_usuario, usuarioModificador);
    return true;
  }
}

module.exports = new UsuarioService();
