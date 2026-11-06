const BaseRepository = require("./BaseRepository");
const { SesionEntity, TatuajeEntity, ClienteEntity, UsuarioEntity, FacturaEntity } = require("../entities");
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
      });
    });
  }

  async findByClienteId(cliente_id) {
    const item = await this.entity.findOne({
      where: { cliente_id, eliminado: false },
    });
    return this.toModel(item);
  }

  async findPendientesDeFactura() {
    // Sesiones que no tienen ninguna factura expedida o pagada
    const items = await this.entity.findAll({
      where: { eliminado: false },
      include: [
        { model: TatuajeEntity, as: "tatuaje" },
        { model: ClienteEntity, as: "cliente" },
        { model: UsuarioEntity, as: "tatuador", attributes: ["id_usuario", "nombre", "correo"] },
        { model: FacturaEntity, as: "facturas", where: { eliminado: false }, required: false },
      ],
      order: [["fecha", "DESC"]],
    });

    return items
      .map((item) => item.toJSON())
      .filter((s) => !s.facturas || s.facturas.length === 0)
      .map((s) => new Sesion(s));
  }
}

module.exports = new SesionRepository();
