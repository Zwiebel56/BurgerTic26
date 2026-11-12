// Rutas de pedidos, montadas en /pedidos.
// IMPORTANTE: las rutas fijas (/mis-pedidos, /dashboard) van ANTES de las que
// llevan parámetro (/:id), si no Express interpretaría "dashboard" como un id.
const { Router } = require('express');
const pedidoController = require('../controllers/pedido.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const adminMiddleware = require('../middlewares/admin.middleware');

const router = Router();

// Cliente autenticado
router.post('/', authMiddleware, pedidoController.crear);                  // crear pedido
router.get('/mis-pedidos', authMiddleware, pedidoController.misPedidos);   // historial propio

// Solo admin
router.get('/dashboard', authMiddleware, adminMiddleware, pedidoController.dashboard);
router.get('/', authMiddleware, adminMiddleware, pedidoController.listarTodos);
router.put('/:id/estado', authMiddleware, adminMiddleware, pedidoController.cambiarEstado);
router.delete('/:id', authMiddleware, adminMiddleware, pedidoController.eliminar);

module.exports = router;
