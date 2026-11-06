const ClienteEntity = require("./ClienteEntity");
const UsuarioEntity = require("./UsuarioEntity");
const TatuajeEntity = require("./TatuajeEntity");
const SesionEntity = require("./SesionEntity");
const FacturaEntity = require("./FacturaEntity");
const TarifaEntity = require("./TarifaEntity");

// 1. Tatuaje (1) -> (N) Sesion
TatuajeEntity.hasMany(SesionEntity, { foreignKey: "tatuaje_id", as: "sesiones" });
SesionEntity.belongsTo(TatuajeEntity, { foreignKey: "tatuaje_id", as: "tatuaje" });

// 2. Cliente (1) -> (N) Sesion
ClienteEntity.hasMany(SesionEntity, { foreignKey: "cliente_id", as: "sesiones" });
SesionEntity.belongsTo(ClienteEntity, { foreignKey: "cliente_id", as: "cliente" });

// 3. Usuario (1) -> (N) Sesion
UsuarioEntity.hasMany(SesionEntity, { foreignKey: "usuario_id", as: "sesiones" });
SesionEntity.belongsTo(UsuarioEntity, { foreignKey: "usuario_id", as: "tatuador" });

// 4. Tarifa (1) -> (N) Sesion
TarifaEntity.hasMany(SesionEntity, { foreignKey: "tarifa_id", as: "sesiones" });
SesionEntity.belongsTo(TarifaEntity, { foreignKey: "tarifa_id", as: "tarifa" });

// 5. Sesion (1) -> (N) Factura
SesionEntity.hasMany(FacturaEntity, { foreignKey: "sesion_id", as: "facturas" });
FacturaEntity.belongsTo(SesionEntity, { foreignKey: "sesion_id", as: "sesion" });

// 6. Tatuaje (1) -> (N) Factura (para facturas consolidadas de tatuaje)
TatuajeEntity.hasMany(FacturaEntity, { foreignKey: "tatuaje_id", as: "facturas" });
FacturaEntity.belongsTo(TatuajeEntity, { foreignKey: "tatuaje_id", as: "tatuaje" });

module.exports = {
  ClienteEntity,
  UsuarioEntity,
  TatuajeEntity,
  SesionEntity,
  FacturaEntity,
  TarifaEntity,
};
