// =============================================================================
// adminMiddleware: ¿tiene permiso? (AUTORIZACIÓN)
// Debe usarse SIEMPRE después de authMiddleware, porque necesita req.user.id.
//   router.get('/ruta', authMiddleware, adminMiddleware, controller)
// =============================================================================
const { Usuario } = require('../models');

const adminMiddleware = async (req, res, next) => {
  try {
    // Consultamos la base en cada request en vez de guardar "admin" en el JWT:
    // el payload solo lleva { id } y así, si a un usuario le quitan el rol,
    // pierde el acceso inmediatamente sin esperar a que expire su token.
    const usuario = await Usuario.findByPk(req.user.id, { attributes: ['id', 'admin'] });

    if (!usuario) {
      return res.status(401).json({ message: 'El usuario del token ya no existe.' });
    }
    if (usuario.admin !== true) {
      return res.status(403).json({ message: 'Acceso denegado: se requieren permisos de administrador.' });
    }
    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = adminMiddleware;
