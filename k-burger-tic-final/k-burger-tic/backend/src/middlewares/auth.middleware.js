// =============================================================================
// authMiddleware: ¿quién hace la petición? (AUTENTICACIÓN)
// Un middleware es una función (req, res, next) que corre ANTES del controller.
// Si todo está bien llama a next(); si no, corta la cadena respondiendo el error.
// =============================================================================
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwt');

const authMiddleware = (req, res, next) => {
  // El cliente debe enviar el header:  Authorization: Bearer <token>
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token no proporcionado. Use el header Authorization: Bearer <token>.' });
  }

  const token = header.split(' ')[1];

  try {
    // jwt.verify recalcula la firma con JWT_SECRET y chequea el claim "exp".
    // Si el token fue alterado o expiró, lanza una excepción.
    const payload = jwt.verify(token, JWT_SECRET);

    // Dejamos el id disponible para los siguientes middlewares y controllers.
    req.user = { id: payload.id };
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'El token expiró. Inicie sesión nuevamente.' });
    }
    return res.status(401).json({ message: 'Token inválido.' });
  }
};

module.exports = authMiddleware;
