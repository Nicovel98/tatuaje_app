const BaseRepository = require("./BaseRepository");
const UsuarioEntity = require("../entities/UsuarioEntity");
const Usuario = require("../models/Usuario");

class UsuarioRepository extends BaseRepository {
  constructor() {
    super(UsuarioEntity, Usuario, "id_usuario");
  }

  async findByCorreo(correo) {
    const item = await this.entity.findOne({
      where: { correo, eliminado: false },
    });
    return this.toModel(item);
  }

  async findActivos() {
    const items = await this.entity.findAll({
      where: { estado: "ACTIVO", eliminado: false },
      order: [["nombre", "ASC"]],
    });
    return this.toModelList(items);
  }

  async existsByCorreo(correo) {
    const count = await this.entity.count({
      where: { correo },
    });
    return count > 0;
  }
}

module.exports = new UsuarioRepository();
