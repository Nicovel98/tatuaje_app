const { DataTypes } = require("sequelize");
const db = require("../config/database");

const SesionEntity = db.getSequelize().define(
  "Sesion",
  {
    id_sesion: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    tatuaje_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    cliente_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true, // Relación 1:1 estricta con Cliente
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false, // 1:N con Usuario
    },
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    duracion_horas: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: false,
    },
    es_retoque: {
      type: DataTypes.STRING(1),
      allowNull: false,
      defaultValue: "N",
    },
    valor: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
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
    tableName: "SESION",
    timestamps: true,
    createdAt: "fecha_creacion",
    updatedAt: "fecha_actualizacion",
  }
);

module.exports = SesionEntity;
