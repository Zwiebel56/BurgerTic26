// Modelo "Usuarios".
// sequelize.define(nombreModelo, atributos, opciones) mapea una clase a una tabla.
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Usuario = sequelize.define(
  'Usuario',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING(50), allowNull: false },
    apellido: { type: DataTypes.STRING(50), allowNull: false },
    // unique: true crea una restricción UNIQUE en PostgreSQL (email único).
    email: {
      type: DataTypes.STRING(256),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    // Aquí se guardará el HASH de bcrypt (nunca la contraseña en texto plano).
    // Un hash bcrypt mide ~60 caracteres, por eso entra en STRING(256).
    password: { type: DataTypes.STRING(256), allowNull: false },
    admin: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  },
  {
    tableName: 'Usuarios',
    timestamps: false, // el enunciado no pide createdAt/updatedAt
  }
);

module.exports = Usuario;
