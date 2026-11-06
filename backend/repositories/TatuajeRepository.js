const BaseRepository = require("./BaseRepository");
const TatuajeEntity = require("../entities/TatuajeEntity");
const Tatuaje = require("../models/Tatuaje");

class TatuajeRepository extends BaseRepository {
  constructor() {
    super(TatuajeEntity, Tatuaje, "id_tatuaje");
  }

  async findByEstado(estado) {
    const items = await this.entity.findAll({
      where: { estado, eliminado: false },
      order: [["fecha_creacion", "DESC"]],
    });
    return this.toModelList(items);
  }
}

module.exports = new TatuajeRepository();
