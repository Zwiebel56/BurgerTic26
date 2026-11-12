// Manejo centralizado de errores: TODAS las respuestas deben ser JSON
// con la clave "message" (nunca res.send() en texto plano).
const HttpError = require('../utils/HttpError');

// 404: ninguna ruta coincidió.
const notFound = (req, res) => {
  return res.status(404).json({ message: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
};

// Express reconoce un middleware de errores por tener 4 parámetros (err, req, res, next).
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // Errores controlados lanzados por los services (400, 401, 403, 404...)
  if (err instanceof HttpError) {
    return res.status(err.status).json({ message: err.message });
  }

  console.error(err);

  // JSON inválido en el body (lo lanza express.json())
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'El body enviado no es un JSON válido.' });
  }
  // Errores de validación / unicidad de Sequelize -> 400
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({ message: err.errors?.[0]?.message || 'Datos inválidos.' });
  }
  return res.status(500).json({ message: 'Error interno del servidor.' });
};

module.exports = { notFound, errorHandler };
