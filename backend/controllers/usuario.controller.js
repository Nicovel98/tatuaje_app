const usuarioService = require("../services/usuario.service");
const UsuarioResponseDto = require("../dtos/usuario/usuario-response.dto");

class UsuarioController {
  async crear(req, res) {
    try {
      const { id_usuario, nombre, correo, clave, rol, usuario_creacion } = req.body;
      const nuevoUsuario = await usuarioService.crearUsuario({
        id_usuario,
        nombre,
        correo,
        clave,
        rol,
        usuario_creacion: usuario_creacion || "ADMINISTRADOR",
      });

      return res.status(201).json({
        mensaje: "Colaborador registrado con éxito",
        usuario: UsuarioResponseDto.fromModel(nuevoUsuario),
      });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async listar(req, res) {
    try {
      const usuarios = await usuarioService.listarActivos();
      return res.json(UsuarioResponseDto.fromModelList(usuarios));
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async actualizar(req, res) {
    try {
      const { id } = req.params;
      const { usuario_modificador, ...datos } = req.body;
      const usuario = await usuarioService.actualizarUsuario(id, datos, usuario_modificador);
      return res.json({
        mensaje: "Usuario actualizado con éxito",
        usuario: UsuarioResponseDto.fromModel(usuario),
      });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async inactivar(req, res) {
    try {
      const { id } = req.params;
      const { usuario_modificador } = req.body;
      const usuario = await usuarioService.inactivarUsuario(id, usuario_modificador);
      return res.json({
        mensaje: "Usuario inactivado con éxito",
        usuario: UsuarioResponseDto.fromModel(usuario),
      });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async eliminar(req, res) {
    try {
      const { id } = req.params;
      const { usuario_modificador } = req.body;
      await usuarioService.eliminarUsuario(id, usuario_modificador);
      return res.json({ mensaje: "Usuario eliminado exitosamente (soft delete)" });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new UsuarioController();
