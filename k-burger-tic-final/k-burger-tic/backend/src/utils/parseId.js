// Convierte un id recibido por URL (string) en entero positivo o lanza 400.
const HttpError = require('./HttpError');

const parseId = (valor) => {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(400, 'El id debe ser un número entero positivo.');
  }
  return id;
};

module.exports = parseId;
