const { DataTypes } = require("sequelize");
const db = require("../config/database");

const ClienteEntity = db.getSequelize().define(
  "Cliente",
  {
    id_cliente: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    correo: {
      type: DataTypes.STRING(120),
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
    tableName: "CLIENTE",
    timestamps: true,
    createdAt: "fecha_creacion",
    updatedAt: "fecha_actualizacion",
  }
);

module.exports = ClienteEntity;
