// Configuración de JWT centralizada.
require('dotenv').config();

if (!process.env.JWT_SECRET) {
  // Fallar al arrancar es mejor que firmar tokens con un secreto vacío.
  throw new Error('Falta la variable JWT_SECRET en el archivo .env');
}

module.exports = {
  // Clave privada con la que el servidor FIRMA y VERIFICA los tokens.
  // Si alguien la conoce, puede fabricar tokens válidos: nunca se sube a Git.
  JWT_SECRET: process.env.JWT_SECRET,
  // Duración exigida por el enunciado: 30 minutos.
  JWT_EXPIRES_IN: '30m',
};
