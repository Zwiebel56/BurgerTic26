// Router principal: monta los módulos de la API.
const { Router } = require('express');
const authRoutes = require('./auth.routes');
const platoRoutes = require('./plato.routes');
const pedidoRoutes = require('./pedido.routes');

const router = Router();

// Health check: sirve para comprobar que la API está viva.
router.get('/', (req, res) => {
  return res.status(200).json({ message: 'K-Burger TIC API funcionando' });
});

router.use('/auth', authRoutes);
router.use('/platos', platoRoutes);
router.use('/pedidos', pedidoRoutes);

module.exports = router;
