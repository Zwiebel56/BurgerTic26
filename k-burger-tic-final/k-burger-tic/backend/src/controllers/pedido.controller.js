// CONTROLLER DE PEDIDOS: traduce HTTP <-> service. Errores -> next(error).
const pedidoService = require('../services/pedido.service');

const crear = async (req, res, next) => {
  try {
    // req.user.id lo dejó authMiddleware a partir del JWT
    const pedido = await pedidoService.crear(req.user.id, req.body);
    return res.status(201).json({ message: 'Pedido creado correctamente.', pedido });
  } catch (error) { return next(error); }
};

const misPedidos = async (req, res, next) => {
  try {
    const pedidos = await pedidoService.listarMisPedidos(req.user.id);
    return res.status(200).json({ message: 'Pedidos obtenidos correctamente.', pedidos });
  } catch (error) { return next(error); }
};

const listarTodos = async (req, res, next) => {
  try {
    const pedidos = await pedidoService.listarTodos();
    return res.status(200).json({ message: 'Pedidos obtenidos correctamente.', pedidos });
  } catch (error) { return next(error); }
};

const cambiarEstado = async (req, res, next) => {
  try {
    const pedido = await pedidoService.cambiarEstado(req.params.id, req.body && req.body.estado);
    return res.status(200).json({ message: 'Estado del pedido actualizado correctamente.', pedido });
  } catch (error) { return next(error); }
};

const eliminar = async (req, res, next) => {
  try {
    await pedidoService.eliminar(req.params.id);
    return res.status(200).json({ message: 'Pedido eliminado correctamente.' });
  } catch (error) { return next(error); }
};

const dashboard = async (req, res, next) => {
  try {
    const datos = await pedidoService.dashboard();
    return res.status(200).json({ message: 'Dashboard obtenido correctamente.', ...datos });
  } catch (error) { return next(error); }
};

module.exports = { crear, misPedidos, listarTodos, cambiarEstado, eliminar, dashboard };
