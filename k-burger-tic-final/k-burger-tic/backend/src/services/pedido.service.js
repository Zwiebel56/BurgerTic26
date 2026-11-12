// =============================================================================
// SERVICE DE PEDIDOS + DASHBOARD ANALÍTICO
// =============================================================================
const { fn, col, literal } = require('sequelize');
const { sequelize, Usuario, Plato, Pedido, PlatoXPedido } = require('../models');
const HttpError = require('../utils/HttpError');
const parseId = require('../utils/parseId');

const ESTADOS = ['pendiente', 'aceptado', 'en camino', 'entregado'];
// Un pedido cuenta como VENTA (ingreso real) solo cuando fue entregado.
const ESTADO_VENTA = 'entregado';

// ----------------------------------------------------------------------------
// Helpers de lectura
// ----------------------------------------------------------------------------
// include sobre una relación belongsToMany: Sequelize hace los JOIN contra la
// tabla pivote "PlatosXPedidos" y contra "Platos". Con through.attributes
// elegimos qué columnas de la tabla pivote queremos (acá, la cantidad).
const includePlatos = {
  model: Plato,
  attributes: ['id', 'nombre', 'tipo', 'precio'],
  through: { attributes: ['cantidad'] },
};

// Convierte una instancia Sequelize en un objeto limpio, con subtotales y total.
const formatear = (pedido) => {
  const p = pedido.get({ plain: true });
  const platos = (p.Platos || []).map((pl) => {
    const cantidad = pl.PlatoXPedido.cantidad; // dato de la tabla pivote
    return {
      id: pl.id,
      nombre: pl.nombre,
      tipo: pl.tipo,
      precio: pl.precio,
      cantidad,
      subtotal: pl.precio * cantidad,
    };
  });
  return {
    id: p.id,
    fecha: p.fecha,
    estado: p.estado,
    ...(p.Usuario && { usuario: p.Usuario }),
    platos,
    total: platos.reduce((acc, x) => acc + x.subtotal, 0),
  };
};

const includeUsuario = { model: Usuario, attributes: ['id', 'nombre', 'apellido', 'email'] };

const obtenerFormateado = async (id) => {
  const pedido = await Pedido.findByPk(id, { include: [includePlatos, includeUsuario] });
  if (!pedido) throw new HttpError(404, 'Pedido no encontrado.');
  return formatear(pedido);
};

// ----------------------------------------------------------------------------
// Crear pedido  (usuario autenticado)
// Body: { "platos": [ { "id": 1, "cantidad": 2 } ] }
// ----------------------------------------------------------------------------
const crear = async (idUsuario, body) => {
  const items = body && body.platos;
  if (!Array.isArray(items) || items.length === 0) {
    throw new HttpError(400, 'platos debe ser un arreglo con al menos un elemento: [{ "id": 1, "cantidad": 2 }].');
  }

  // Validamos cada ítem y unificamos ids repetidos sumando sus cantidades.
  const cantidades = new Map();
  for (const item of items) {
    const id = Number(item && item.id);
    const cantidad = Number(item && item.cantidad);
    if (!Number.isInteger(id) || id <= 0 || !Number.isInteger(cantidad) || cantidad < 1) {
      throw new HttpError(400, 'Cada plato necesita un id entero positivo y una cantidad entera mayor o igual a 1.');
    }
    cantidades.set(id, (cantidades.get(id) || 0) + cantidad);
  }

  // Verificamos que todos los platos existan: WHERE id IN (...)
  const ids = [...cantidades.keys()];
  const encontrados = await Plato.findAll({ where: { id: ids }, attributes: ['id'] });
  if (encontrados.length !== ids.length) {
    const existentes = new Set(encontrados.map((x) => x.id));
    const faltantes = ids.filter((id) => !existentes.has(id));
    throw new HttpError(404, `No existen los platos con id: ${faltantes.join(', ')}.`);
  }

  // TRANSACCIÓN: o se guardan el pedido Y todas sus filas pivote, o no se guarda
  // nada (si algo falla, Sequelize hace ROLLBACK y no quedan pedidos "vacíos").
  const idPedido = await sequelize.transaction(async (t) => {
    // fecha = fecha actual (defaultValue NOW) y estado = 'pendiente' (default del modelo).
    // id_usuario viene del JWT (req.user.id), NUNCA del body.
    const pedido = await Pedido.create({ id_usuario: idUsuario }, { transaction: t });
    await PlatoXPedido.bulkCreate(
      ids.map((id) => ({ id_pedido: pedido.id, id_plato: id, cantidad: cantidades.get(id) })),
      { transaction: t }
    );
    return pedido.id;
  });

  return obtenerFormateado(idPedido);
};

// ----------------------------------------------------------------------------
// Listados
// ----------------------------------------------------------------------------
const listarMisPedidos = async (idUsuario) => {
  const pedidos = await Pedido.findAll({
    where: { id_usuario: idUsuario },
    include: [includePlatos],
    order: [['fecha', 'DESC'], ['id', 'DESC']],
  });
  return pedidos.map(formatear);
};

const listarTodos = async () => {
  const pedidos = await Pedido.findAll({
    include: [includePlatos, includeUsuario],
    order: [['fecha', 'DESC'], ['id', 'DESC']],
  });
  return pedidos.map(formatear);
};

// ----------------------------------------------------------------------------
// Admin: cambiar estado / eliminar
// ----------------------------------------------------------------------------
const cambiarEstado = async (id, estado) => {
  if (!ESTADOS.includes(estado)) {
    throw new HttpError(400, `estado debe ser uno de: ${ESTADOS.join(', ')}.`);
  }
  const pedido = await Pedido.findByPk(parseId(id));
  if (!pedido) throw new HttpError(404, 'Pedido no encontrado.');

  // Se permite cualquier estado válido (no solo el siguiente) para que el admin
  // pueda corregir un error de carga; el tablero del frontend avanza de a uno.
  pedido.estado = estado;
  await pedido.save();
  return obtenerFormateado(pedido.id);
};

const eliminar = async (id) => {
  const pedido = await Pedido.findByPk(parseId(id));
  if (!pedido) throw new HttpError(404, 'Pedido no encontrado.');
  // Las filas de PlatosXPedidos se borran solas por ON DELETE CASCADE.
  await pedido.destroy();
};

// ----------------------------------------------------------------------------
// DASHBOARD (consultas de agregación)
// ----------------------------------------------------------------------------
// Conceptos que usamos acá:
//  * fn('SUM', ...) / fn('COUNT', ...): llaman a funciones SQL de agregación.
//  * col('Tabla.columna'): referencia una columna (se escapa como "Tabla"."columna").
//  * literal('...'): inserta SQL crudo; lo usamos para multiplicar cantidad*precio.
//  * group: [...] genera GROUP BY; toda columna del SELECT que no esté dentro de
//    una función de agregación DEBE aparecer en el GROUP BY.
//  * include con attributes: [] hace el JOIN pero no trae columnas extra.
//  * include con where + required: true -> INNER JOIN ... WHERE (filtra pedidos).
//  * raw: true devuelve objetos planos (no instancias de modelo).
// Postgres devuelve SUM/COUNT como bigint -> llegan como string; usamos Number().
const SUBTOTAL_SQL = '"PlatoXPedido"."cantidad" * "Plato"."precio"';

const dashboard = async () => {
  // JOIN: PlatosXPedidos -> Pedidos (solo entregados) y PlatosXPedidos -> Platos
  const joinsVentas = [
    { model: Plato, attributes: [], required: true },
    { model: Pedido, attributes: [], required: true, where: { estado: ESTADO_VENTA } },
  ];

  // 1) Recaudación total:
  //    SELECT SUM(cantidad * precio) FROM PlatosXPedidos
  //    JOIN Platos ... JOIN Pedidos ... WHERE Pedidos.estado = 'entregado'
  const filaRecaudacion = await PlatoXPedido.findOne({
    attributes: [[fn('SUM', literal(SUBTOTAL_SQL)), 'total']],
    include: joinsVentas,
    raw: true,
  });
  const recaudacionTotal = Number(filaRecaudacion && filaRecaudacion.total) || 0;

  // 2) Pedidos por estado:  SELECT estado, COUNT(id) FROM Pedidos GROUP BY estado
  const filasEstado = await Pedido.findAll({
    attributes: ['estado', [fn('COUNT', col('id')), 'cantidad']],
    group: ['estado'],
    raw: true,
  });
  const pedidosPorEstado = Object.fromEntries(ESTADOS.map((e) => [e, 0])); // 0 por defecto
  filasEstado.forEach((f) => { pedidosPorEstado[f.estado] = Number(f.cantidad); });

  // 3) Ránking de platos más vendidos (unidades e ingresos):
  //    SELECT Plato.id, nombre, tipo, SUM(cantidad) AS unidades,
  //           SUM(cantidad*precio) AS ingresos
  //    ... GROUP BY Plato.id, nombre, tipo ORDER BY unidades DESC
  const filasRanking = await PlatoXPedido.findAll({
    attributes: [
      [col('Plato.id'), 'id'],
      [col('Plato.nombre'), 'nombre'],
      [col('Plato.tipo'), 'tipo'],
      [fn('SUM', col('PlatoXPedido.cantidad')), 'unidades'],
      [fn('SUM', literal(SUBTOTAL_SQL)), 'ingresos'],
    ],
    include: joinsVentas,
    group: ['Plato.id', 'Plato.nombre', 'Plato.tipo'],
    order: [[literal('"unidades"'), 'DESC'], [literal('"ingresos"'), 'DESC']],
    raw: true,
  });
  const platosMasVendidos = filasRanking.map((f) => ({
    id: f.id,
    nombre: f.nombre,
    tipo: f.tipo,
    unidades: Number(f.unidades),
    ingresos: Number(f.ingresos),
  }));

  // 4) Ticket promedio = recaudación / cantidad de pedidos entregados
  //    (equivale a promediar el total de cada compra).
  const entregados = pedidosPorEstado[ESTADO_VENTA];
  const ticketPromedio = entregados > 0 ? Math.round(recaudacionTotal / entregados) : 0;

  const pedidosActivos = ESTADOS.filter((e) => e !== ESTADO_VENTA)
    .reduce((acc, e) => acc + pedidosPorEstado[e], 0);

  return { recaudacionTotal, ticketPromedio, pedidosActivos, pedidosPorEstado, platosMasVendidos };
};

module.exports = {
  crear, listarMisPedidos, listarTodos, cambiarEstado, eliminar, dashboard,
};
