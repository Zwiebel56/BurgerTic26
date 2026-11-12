// Rutas de platos, montadas en /platos.
const { Router } = require('express');
const platoController = require('../controllers/plato.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const adminMiddleware = require('../middlewares/admin.middleware');

const router = Router();

// Públicas: el menú lo ve cualquiera
router.get('/', platoController.listar);        // GET /platos  (?tipo=principal|combo|postre)
router.get('/:id', platoController.obtener);    // GET /platos/:id

// Solo admin
router.post('/', authMiddleware, adminMiddleware, platoController.crear);
router.put('/:id', authMiddleware, adminMiddleware, platoController.actualizar);
router.delete('/:id', authMiddleware, adminMiddleware, platoController.eliminar);

module.exports = router;
