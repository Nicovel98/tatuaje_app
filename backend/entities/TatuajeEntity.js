const { DataTypes } = require("sequelize");
const db = require("../config/database");

const TatuajeEntity = db.getSequelize().define(
  "Tatuaje",
  {
    id_tatuaje: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    diseno: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    zona_cuerpo: {
      type: DataTypes.STRING(60),
      allowNull: false,
    },
    estado: {
      type: DataTypes.STRING(15),
      allowNull: false,
    },
    horas_estimadas: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: false,
      defaultValue: 1.0,
    },
    valor_estimado: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    anticipo: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    fecha_finalizacion: {
      type: DataTypes.DATEONLY,
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
    tableName: "TATUAJE",
    timestamps: true,
    createdAt: "fecha_creacion",
    updatedAt: "fecha_actualizacion",
  }
);

module.exports = TatuajeEntity;
