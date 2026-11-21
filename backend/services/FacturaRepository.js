const BaseRepository = require("./BaseRepository");
const { FacturaEntity, SesionEntity, TatuajeEntity, ClienteEntity, UsuarioEntity, TarifaEntity } = require("../entities");
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

  async findByIdWithDetails(id_factura) {
    const item = await this.entity.findOne({
      where: { id_factura, eliminado: false },
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
    });

    if (!item) return null;
    const json = item.toJSON();
    return new Factura({
      ...json,
      sesion: json.sesion,
    });
  }


  /**
   * Devuelve las sesiones (como objetos planos) que componen una factura.
   * - Factura individual: solo su sesión.
   * - Factura consolidada de tatuaje: todas las sesiones activas del tatuaje.
   * Se distingue comparando el subtotal de la factura con el valor de su sesión.
   */
  async findSesionesDeFactura(factura) {
    const include = [
      { model: TarifaEntity, as: "tarifa" },
      { model: UsuarioEntity, as: "tatuador", attributes: ["id_usuario", "nombre"] },
    ];

    const principal = factura.sesion_id
      ? await SesionEntity.findOne({ where: { id_sesion: factura.sesion_id }, include })
      : null;

    const esIndividual =
      principal &&
      (!factura.tatuaje_id || Math.abs(Number(principal.valor) - Number(factura.subtotal)) < 0.01);

    if (esIndividual) return [principal.toJSON()];

    if (factura.tatuaje_id) {
      const todas = await SesionEntity.findAll({
        where: { tatuaje_id: factura.tatuaje_id, eliminado: false },
        include,
        order: [["fecha", "ASC"]],
      });
      return todas.map((x) => x.toJSON());
    }

    return principal ? [principal.toJSON()] : [];
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

    return items.map((item) => new Factura({ ...item.toJSON() }));
  }
}

module.exports = new FacturaRepository();
