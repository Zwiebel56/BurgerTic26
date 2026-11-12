// =============================================================================
// SERVICE DE PLATOS (CRUD)
// =============================================================================
const { Plato, PlatoXPedido } = require('../models');
const HttpError = require('../utils/HttpError');
const parseId = require('../utils/parseId');

const TIPOS = ['principal', 'combo', 'postre'];

// Valida y limpia los datos de un plato.
// parcial = true (PUT): solo se validan los campos que vengan en el body.
const validarDatos = (data = {}, parcial = false) => {
  const limpio = {};
  const requerido = (campo) => !parcial || data[campo] !== undefined;

  if (requerido('tipo')) {
    if (!TIPOS.includes(data.tipo)) {
      throw new HttpError(400, `tipo debe ser uno de: ${TIPOS.join(', ')}.`);
    }
    limpio.tipo = data.tipo;
  }
  if (requerido('nombre')) {
    if (typeof data.nombre !== 'string' || !data.nombre.trim() || data.nombre.trim().length > 70) {
      throw new HttpError(400, 'nombre es obligatorio y admite hasta 70 caracteres.');
    }
    limpio.nombre = data.nombre.trim();
  }
  if (requerido('precio')) {
    if (!Number.isInteger(data.precio) || data.precio < 0) {
      throw new HttpError(400, 'precio debe ser un número entero mayor o igual a 0.');
    }
    limpio.precio = data.precio;
  }
  if (requerido('descripcion')) {
    if (typeof data.descripcion !== 'string' || !data.descripcion.trim() || data.descripcion.trim().length > 400) {
      throw new HttpError(400, 'descripcion es obligatoria y admite hasta 400 caracteres.');
    }
    limpio.descripcion = data.descripcion.trim();
  }

  if (parcial && Object.keys(limpio).length === 0) {
    throw new HttpError(400, 'Debe enviar al menos un campo para actualizar (tipo, nombre, precio o descripcion).');
  }
  return limpio;
};

const obtenerOFallar = async (id) => {
  // findByPk = "find by primary key" -> SELECT ... WHERE id = ?
  const plato = await Plato.findByPk(parseId(id));
  if (!plato) throw new HttpError(404, 'Plato no encontrado.');
  return plato;
};

const listar = async ({ tipo } = {}) => {
  const where = {};
  if (tipo !== undefined) {
    if (!TIPOS.includes(tipo)) throw new HttpError(400, `tipo debe ser uno de: ${TIPOS.join(', ')}.`);
    where.tipo = tipo; // filtro opcional: GET /platos?tipo=combo
  }
  return Plato.findAll({ where, order: [['id', 'ASC']] });
};

const obtener = (id) => obtenerOFallar(id);

const crear = (data) => Plato.create(validarDatos(data, false));

const actualizar = async (id, data) => {
  const plato = await obtenerOFallar(id);
  return plato.update(validarDatos(data, true)); // UPDATE solo de los campos enviados
};

const eliminar = async (id) => {
  const plato = await obtenerOFallar(id);

  // Si el plato ya fue vendido, borrarlo falsearía el historial de ventas y el
  // dashboard. Lo impedimos con un mensaje claro (además la FK está en RESTRICT).
  const vecesPedido = await PlatoXPedido.count({ where: { id_plato: plato.id } });
  if (vecesPedido > 0) {
    throw new HttpError(400, 'No se puede eliminar el plato porque forma parte de pedidos existentes.');
  }
  await plato.destroy();
};

module.exports = { listar, obtener, crear, actualizar, eliminar };
