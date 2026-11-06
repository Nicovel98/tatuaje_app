const { DataTypes } = require("sequelize");
const db = require("../config/database");

const UsuarioEntity = db.getSequelize().define(
  "Usuario",
  {
    id_usuario: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    identificacion: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    correo: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true,
    },
    clave: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    rol: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    estado: {
      type: DataTypes.STRING(15),
      allowNull: false,
      defaultValue: "ACTIVO",
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
    tableName: "USUARIO",
    timestamps: true,
    createdAt: "fecha_creacion",
    updatedAt: "fecha_actualizacion",
  }
);

module.exports = UsuarioEntity;
