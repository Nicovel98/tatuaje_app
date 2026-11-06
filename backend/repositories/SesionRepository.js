const BaseRepository = require("./BaseRepository");
const { SesionEntity, TatuajeEntity, ClienteEntity, UsuarioEntity, FacturaEntity, TarifaEntity } = require("../entities");
const Sesion = require("../models/Sesion");

class SesionRepository extends BaseRepository {
  constructor() {
    super(SesionEntity, Sesion, "id_sesion");
  }

  async findWithDetails() {
    const items = await this.entity.findAll({
      where: { eliminado: false },
      include: [
        { model: TatuajeEntity, as: "tatuaje" },
        { model: ClienteEntity, as: "cliente" },
        { model: UsuarioEntity, as: "tatuador", attributes: ["id_usuario", "nombre", "correo", "rol"] },
        { model: FacturaEntity, as: "facturas", where: { eliminado: false }, required: false },
        { model: TarifaEntity, as: "tarifa", required: false },
      ],
      order: [["fecha", "DESC"]],
    });

    return items.map((item) => {
      const json = item.toJSON();
      return new Sesion({
        ...json,
        tatuaje: json.tatuaje,
        cliente: json.cliente,
        tatuador: json.tatuador,
        facturas: json.facturas,
        tarifa: json.tarifa,
      });
    });
  }

  async findByClienteId(cliente_id) {
    const item = await this.entity.findOne({
      where: { cliente_id, eliminado: false },
    });
    return this.toModel(item);
  }

  async findAllByClienteId(cliente_id) {
    const items = await this.entity.findAll({
      where: { cliente_id, eliminado: false },
      include: [
        { model: TatuajeEntity, as: "tatuaje" },
        { model: FacturaEntity, as: "facturas", where: { eliminado: false }, required: false },
        { model: TarifaEntity, as: "tarifa", required: false },
      ],
      order: [["fecha", "ASC"]],
    });
    return items.map((i) => i.toJSON());
  }

  async findPendientesDeFactura() {
    const items = await this.entity.findAll({
      where: { eliminado: false },
      include: [
        { model: TatuajeEntity, as: "tatuaje" },
        { model: ClienteEntity, as: "cliente" },
        { model: UsuarioEntity, as: "tatuador", attributes: ["id_usuario", "nombre", "correo"] },
        { model: FacturaEntity, as: "facturas", where: { eliminado: false }, required: false },
        { model: TarifaEntity, as: "tarifa", required: false },
      ],
      order: [["fecha", "DESC"]],
    });

    return items
      .filter((item) => {
        const facturasValidas = (item.facturas || []).filter((f) => f.estado !== "eliminada");
        return facturasValidas.length === 0;
      })
      .map((item) => {
        const json = item.toJSON();
        return new Sesion({
          ...json,
          tatuaje: json.tatuaje,
          cliente: json.cliente,
          tatuador: json.tatuador,
          facturas: json.facturas,
          tarifa: json.tarifa,
        });
      });
  }
}

module.exports = new SesionRepository();
