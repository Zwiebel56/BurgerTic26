// Punto de entrada: conecta a PostgreSQL, sincroniza tablas y levanta Express.
require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models'); // importar models/index.js registra modelos y asociaciones

const PORT = process.env.PORT || 3000;

const start = async () => {
  try {
    await sequelize.authenticate(); // verifica credenciales/conexión
    console.log('Conexión a PostgreSQL establecida.');

    // sync() crea las tablas si no existen (no borra datos). Para recrearlas
    // desde cero con datos de prueba usar: npm run seed
    await sequelize.sync();
    console.log('Modelos sincronizados.');

    app.listen(PORT, () => console.log(`Servidor escuchando en http://localhost:${PORT}`));
  } catch (error) {
    console.error('No se pudo iniciar el servidor:', error);
    process.exit(1);
  }
};

start();
