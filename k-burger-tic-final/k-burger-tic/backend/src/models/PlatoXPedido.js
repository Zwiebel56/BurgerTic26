// Modelo "PlatosXPedidos": TABLA INTERMEDIA (pivote) de la relación N:M
// entre Pedidos y Platos. Además de las dos FK guarda la "cantidad", por eso
// necesitamos definirla como modelo propio y no dejar que Sequelize la cree sola.
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PlatoXPedido = sequelize.define(
  'PlatoXPedido',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_pedido: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Pedidos', key: 'id' },
      onDelete: 'CASCADE', // al borrar un pedido se borran sus renglones
    },
    id_plato: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Platos', key: 'id' },
      onDelete: 'RESTRICT', // no se puede borrar un plato que ya fue vendido (protege el historial)
    },
    cantidad: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1 } },
  },
  {
    tableName: 'PlatosXPedidos',
    timestamps: false,
  }
);

module.exports = PlatoXPedido;
