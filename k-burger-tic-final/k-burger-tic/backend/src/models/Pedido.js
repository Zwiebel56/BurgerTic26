// Modelo "Pedidos". id_usuario es una clave foránea (FK) hacia Usuarios.
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Pedido = sequelize.define(
  'Pedido',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Usuarios', key: 'id' }, // FK declarada a nivel de BD
    },
    // La fecha se completa sola con la fecha actual al crear el pedido.
    fecha: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    estado: {
      type: DataTypes.ENUM('pendiente', 'aceptado', 'en camino', 'entregado'),
      allowNull: false,
      defaultValue: 'pendiente', // estado inicial de todo pedido nuevo
    },
  },
  {
    tableName: 'Pedidos',
    timestamps: false,
  }
);

module.exports = Pedido;
