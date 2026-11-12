// CONTROLLER DE PLATOS: traduce HTTP <-> service. Errores -> next(error).
const platoService = require('../services/plato.service');

const listar = async (req, res, next) => {
  try {
    const platos = await platoService.listar({ tipo: req.query.tipo });
    return res.status(200).json({ message: 'Platos obtenidos correctamente.', platos });
  } catch (error) { return next(error); }
};

const obtener = async (req, res, next) => {
  try {
    const plato = await platoService.obtener(req.params.id);
    return res.status(200).json({ message: 'Plato obtenido correctamente.', plato });
  } catch (error) { return next(error); }
};

const crear = async (req, res, next) => {
  try {
    const plato = await platoService.crear(req.body);
    return res.status(201).json({ message: 'Plato creado correctamente.', plato });
  } catch (error) { return next(error); }
};

const actualizar = async (req, res, next) => {
  try {
    const plato = await platoService.actualizar(req.params.id, req.body);
    return res.status(200).json({ message: 'Plato actualizado correctamente.', plato });
  } catch (error) { return next(error); }
};

const eliminar = async (req, res, next) => {
  try {
    await platoService.eliminar(req.params.id);
    return res.status(200).json({ message: 'Plato eliminado correctamente.' });
  } catch (error) { return next(error); }
};

module.exports = { listar, obtener, crear, actualizar, eliminar };
