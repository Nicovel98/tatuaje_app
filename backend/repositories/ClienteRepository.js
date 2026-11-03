const BaseRepository = require("./BaseRepository");
const ClienteEntity = require("../entities/ClienteEntity");
const Cliente = require("../models/Cliente");

class ClienteRepository extends BaseRepository {
  constructor() {
    super(ClienteEntity, Cliente, "id_cliente");
  }

  async existsByCorreo(correo) {
    const count = await this.entity.count({
      where: { correo, eliminado: false },
    });
    return count > 0;
  }
}

module.exports = new ClienteRepository();
