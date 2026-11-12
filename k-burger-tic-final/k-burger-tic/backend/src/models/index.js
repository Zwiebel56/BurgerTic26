// =============================================================================
// ASOCIACIONES ENTRE MODELOS
// -----------------------------------------------------------------------------
// Se centralizan acá para evitar dependencias circulares y para que cualquier
// archivo pueda hacer: const { Usuario, Plato, Pedido } = require('../models');
// =============================================================================
const sequelize = require('../config/database');
const Usuario = require('./Usuario');
const Plato = require('./Plato');
const Pedido = require('./Pedido');
const PlatoXPedido = require('./PlatoXPedido');

// ---- 1:N  Usuario -> Pedidos ------------------------------------------------
// Un usuario tiene muchos pedidos; cada pedido pertenece a un usuario.
Usuario.hasMany(Pedido, { foreignKey: 'id_usuario' });
Pedido.belongsTo(Usuario, { foreignKey: 'id_usuario' });

// ---- N:M  Pedidos <-> Platos (belongsToMany) --------------------------------
// Un pedido contiene muchos platos y un plato aparece en muchos pedidos.
// belongsToMany exige una tabla intermedia ("through") y qué columna de esa
// tabla apunta a cada lado:
//   - foreignKey: columna de la tabla pivote que referencia al modelo ACTUAL.
//   - otherKey:   columna que referencia al OTRO modelo.
// Gracias a esto Sequelize genera métodos como pedido.addPlato(...),
// pedido.getPlatos() y permite hacer include: [Plato] en las consultas.
Pedido.belongsToMany(Plato, {
  through: PlatoXPedido,
  foreignKey: 'id_pedido',
  otherKey: 'id_plato',
});
Plato.belongsToMany(Pedido, {
  through: PlatoXPedido,
  foreignKey: 'id_plato',
  otherKey: 'id_pedido',
});

// ---- "Super Many-to-Many" ---------------------------------------------------
// Además enlazamos directamente la tabla pivote con ambos modelos. Esto nos
// permite consultar PlatosXPedidos de forma directa (JOIN + fn('SUM') +
// GROUP BY) para el Dashboard de la Fase 3, p. ej. "unidades vendidas por plato".
// onDelete CASCADE (pedido): al borrar un pedido se borran sus filas pivote.
// onDelete RESTRICT (plato): un plato ya vendido no se puede borrar, así el
// historial de ventas del dashboard nunca queda alterado.
Pedido.hasMany(PlatoXPedido, { foreignKey: 'id_pedido', onDelete: 'CASCADE' });
PlatoXPedido.belongsTo(Pedido, { foreignKey: 'id_pedido' });
Plato.hasMany(PlatoXPedido, { foreignKey: 'id_plato', onDelete: 'RESTRICT' });
PlatoXPedido.belongsTo(Plato, { foreignKey: 'id_plato' });

module.exports = { sequelize, Usuario, Plato, Pedido, PlatoXPedido };
