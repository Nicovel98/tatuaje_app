const BaseRepository = require("./BaseRepository");
const { FacturaEntity, SesionEntity, TatuajeEntity, ClienteEntity, UsuarioEntity } = require("../entities");
const Factura = require("../models/Factura");
const { Op } = require("sequelize");

class FacturaRepository extends BaseRepository {
  constructor() {
    super(FacturaEntity, Factura, "id_factura");
  }

  async findWithDetails() {
    const items = await this.entity.findAll({
      where: { eliminado: false },
      include: [
        {
          model: SesionEntity,
          as: "sesion",
          include: [
            { model: TatuajeEntity, as: "tatuaje" },
            { model: ClienteEntity, as: "cliente" },
            { model: UsuarioEntity, as: "tatuador", attributes: ["id_usuario", "nombre", "correo"] },
          ],
        },
      ],
      order: [["fecha_emision", "DESC"]],
    });

    return items.map((item) => {
      const json = item.toJSON();
      return new Factura({
        ...json,
        sesion: json.sesion,
      });
    });
  }

  async findByRangoFechas(fechaInicio, fechaFin) {
    const items = await this.entity.findAll({
      where: {
        eliminado: false,
        fecha_emision: {
          [Op.between]: [fechaInicio, fechaFin],
        },
      },
      include: [
        {
          model: SesionEntity,
          as: "sesion",
          include: [
            { model: TatuajeEntity, as: "tatuaje" },
            { model: ClienteEntity, as: "cliente" },
            { model: UsuarioEntity, as: "tatuador", attributes: ["id_usuario", "nombre", "correo"] },
          ],
        },
      ],
      order: [["fecha_emision", "ASC"]],
    });

    return items.map((item) => new Factura({ ...item.toJSON(), sesion: item.sesion }));
  }
}

module.exports = new FacturaRepository();
