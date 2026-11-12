// =============================================================================
// CONEXIÓN A POSTGRESQL CON SEQUELIZE
// -----------------------------------------------------------------------------
// Sequelize es un ORM (Object-Relational Mapper): nos permite trabajar con
// tablas SQL como si fueran clases/objetos de JavaScript. Internamente usa el
// driver "pg" para hablar con PostgreSQL. Creamos UNA sola instancia y la
// compartimos con todos los modelos (patrón singleton por módulo de Node).
// =============================================================================
require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'kburger_tic',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false, // poner console.log para ver el SQL que genera Sequelize
  }
);

module.exports = sequelize;
