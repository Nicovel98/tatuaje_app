const BaseRepository = require("./BaseRepository");
const TarifaEntity = require("../entities/TarifaEntity");
const Tarifa = require("../models/Tarifa");

class TarifaRepository extends BaseRepository {
  constructor() {
    super(TarifaEntity, Tarifa, "id_tarifa");
  }

  async findByTipo(tipo_trabajo) {
    const record = await this.entity.findOne({
      where: { tipo_trabajo, eliminado: false },
    });
    return record ? this.toModel(record) : null;
  }

  async getNextId() {
    const max = await this.entity.max("id_tarifa");
    return (max || 0) + 1;
  }
}

module.exports = new TarifaRepository();
