// Configuración de Express (sin levantar el servidor, para mantenerlo testeable).
const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const app = express();

app.use(cors());          // permite que el frontend React (otro puerto) consuma la API
app.use(express.json());  // parsea bodies JSON -> req.body

app.use('/', routes);

app.use(notFound);        // 404 en JSON
app.use(errorHandler);    // 400 / 500 en JSON

module.exports = app;
