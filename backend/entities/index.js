const ClienteEntity = require("./ClienteEntity");
const UsuarioEntity = require("./UsuarioEntity");
const TatuajeEntity = require("./TatuajeEntity");
const SesionEntity = require("./SesionEntity");
const FacturaEntity = require("./FacturaEntity");

// 1. Tatuaje (1) -> (N) Sesion
TatuajeEntity.hasMany(SesionEntity, { foreignKey: "tatuaje_id", as: "sesiones" });
SesionEntity.belongsTo(TatuajeEntity, { foreignKey: "tatuaje_id", as: "tatuaje" });

// 2. Cliente (1) <-> (1) Sesion (Relación 1:1 estricta)
ClienteEntity.hasOne(SesionEntity, { foreignKey: "cliente_id", as: "sesion" });
SesionEntity.belongsTo(ClienteEntity, { foreignKey: "cliente_id", as: "cliente" });

// 3. Usuario (1) -> (N) Sesion (Un tatuador puede atender múltiples sesiones)
UsuarioEntity.hasMany(SesionEntity, { foreignKey: "usuario_id", as: "sesiones" });
SesionEntity.belongsTo(UsuarioEntity, { foreignKey: "usuario_id", as: "tatuador" });

// 4. Sesion (1) -> (N) Factura (Una sesión puede tener múltiples facturas)
SesionEntity.hasMany(FacturaEntity, { foreignKey: "sesion_id", as: "facturas" });
FacturaEntity.belongsTo(SesionEntity, { foreignKey: "sesion_id", as: "sesion" });

module.exports = {
  ClienteEntity,
  UsuarioEntity,
  TatuajeEntity,
  SesionEntity,
  FacturaEntity,
};
