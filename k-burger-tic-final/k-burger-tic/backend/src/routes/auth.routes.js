// Rutas de autenticación. Se montan en /auth (ver routes/index.js).
const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const adminMiddleware = require('../middlewares/admin.middleware');

const router = Router();

// Públicas
router.post('/register', authController.register); // POST /auth/register
router.post('/login', authController.login);       // POST /auth/login

// Cualquier usuario con token válido: devuelve sus datos (lo usa el frontend)
router.get('/me', authMiddleware, authController.me); // GET /auth/me

// ---- Ruta de PRUEBA para verificar los middlewares (se puede borrar) ----
// Solo administradores (token válido + admin === true):
router.get('/admin-check', authMiddleware, adminMiddleware, (req, res) => {
  return res.status(200).json({ message: 'Acceso de administrador concedido.' });
});

module.exports = router;
