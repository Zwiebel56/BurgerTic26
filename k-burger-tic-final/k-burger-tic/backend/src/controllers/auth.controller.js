// =============================================================================
// CONTROLLER DE AUTENTICACIÓN
// Capa HTTP: lee req, llama al service y arma la respuesta JSON con el status
// correcto. Los errores se delegan con next(error) al errorHandler central.
// =============================================================================
const authService = require('../services/auth.service');

const register = async (req, res, next) => {
  try {
    const usuario = await authService.register(req.body);
    return res.status(201).json({ message: 'Usuario registrado correctamente.', usuario });
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { token, usuario } = await authService.login(req.body);
    // Además de "message", el login devuelve el token que el frontend guardará
    // en localStorage y enviará luego como: Authorization: Bearer <token>
    return res.status(200).json({ message: 'Login exitoso.', token, usuario });
  } catch (error) {
    return next(error);
  }
};

// GET /auth/me: permite al frontend restaurar la sesión a partir del token guardado.
const me = async (req, res, next) => {
  try {
    const usuario = await authService.me(req.user.id);
    return res.status(200).json({ message: 'Sesión válida.', usuario });
  } catch (error) {
    return next(error);
  }
};

module.exports = { register, login, me };
