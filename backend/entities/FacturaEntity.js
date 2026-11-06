const { DataTypes } = require("sequelize");
const db = require("../config/database");

const FacturaEntity = db.getSequelize().define(
  "Factura",
  {
    id_factura: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    sesion_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // Puede ser null si es una factura consolidada de tatuaje
    },
    tatuaje_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    fecha_emision: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    estado: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "expedida", // 'expedida', 'pago', 'eliminada'
    },
    horas_facturadas: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: false,
    },
    valor_unitario: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    subtotal: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    total: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    tipo_pago: {
      type: DataTypes.STRING(20),
      allowNull: true, // 'EFECTIVO', 'TRANSFERENCIA', 'TARJETA'
    },
    fecha_pago: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    monto_pagado: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      defaultValue: 0.0,
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
    tableName: "FACTURA",
    timestamps: true,
    createdAt: "fecha_creacion",
    updatedAt: "fecha_actualizacion",
  }
);

module.exports = FacturaEntity;
