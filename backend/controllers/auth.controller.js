const authService = require("../services/auth.service");
const UsuarioResponseDto = require("../dtos/usuario/usuario-response.dto");

class AuthController {
  async login(req, res) {
    try {
      const { correo, clave } = req.body;
      const usuario = await authService.login({ correo, clave });

      return res.json({
        mensaje: "Inicio de sesión exitoso",
        usuario: UsuarioResponseDto.fromModel(usuario),
      });
    } catch (error) {
      const status = error.statusCode || 400;
      return res.status(status).json({ error: error.message });
    }
  }
}

module.exports = new AuthController();
