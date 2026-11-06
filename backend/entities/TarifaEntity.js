const { DataTypes } = require("sequelize");
const db = require("../config/database");

const TarifaEntity = db.getSequelize().define(
  "Tarifa",
  {
    id_tarifa: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    tipo_trabajo: {
      type: DataTypes.STRING(60),
      allowNull: false,
      unique: true,
    },
    valor_hora: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    tatuador_nombre: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    eliminado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    usuario_creacion: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: "SISTEMA",
    },
    usuario_actualizacion: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
  },
  {
    tableName: "TARIFA",
    timestamps: true,
    createdAt: "fecha_creacion",
    updatedAt: "fecha_actualizacion",
  }
);

module.exports = TarifaEntity;
