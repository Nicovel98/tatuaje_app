const usuarioRepository = require("../repositories/UsuarioRepository");
const bcrypt = require("bcrypt");

class AuthService {
  async login({ correo, clave }) {
    if (!correo || !clave) {
      throw new Error("Debe ingresar correo y contraseña.");
    }

    const usuario = await usuarioRepository.findByCorreo(correo);
    if (!usuario) {
      const err = new Error("Credenciales incorrectas.");
      err.statusCode = 401;
      throw err;
    }

    if (!usuario.estaActivo()) {
      const err = new Error("El usuario está inactivo o deshabilitado.");
      err.statusCode = 403;
      throw err;
    }

    const coincide = await bcrypt.compare(clave, usuario.clave);
    if (!coincide) {
      const err = new Error("Credenciales incorrectas.");
      err.statusCode = 401;
      throw err;
    }

    return usuario;
  }
}

module.exports = new AuthService();
