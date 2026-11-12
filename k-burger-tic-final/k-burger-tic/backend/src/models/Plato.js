// Modelo "Platos". ENUM limita los valores permitidos a nivel de base de datos.
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Plato = sequelize.define(
  'Plato',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tipo: {
      type: DataTypes.ENUM('principal', 'combo', 'postre'),
      allowNull: false,
    },
    nombre: { type: DataTypes.STRING(70), allowNull: false },
    precio: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 0 } },
    descripcion: { type: DataTypes.STRING(400), allowNull: false },
  },
  {
    tableName: 'Platos',
    timestamps: false,
  }
);

module.exports = Plato;
