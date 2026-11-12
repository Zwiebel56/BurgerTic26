// =============================================================================
// SERVICE DE AUTENTICACIÓN
// Capa de negocio: acá viven las reglas (validar, hashear, comparar, firmar).
// No conoce req/res; solo recibe datos y devuelve resultados o lanza HttpError.
// =============================================================================
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');
const HttpError = require('../utils/HttpError');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/jwt');

const SALT_ROUNDS = 10;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Nunca exponemos el hash de la contraseña.
const datosPublicos = (u) => ({
  id: u.id, nombre: u.nombre, apellido: u.apellido, email: u.email, admin: u.admin,
});

const register = async ({ nombre, apellido, email, password }) => {
  // ---- 1) Validaciones básicas ------------------------------------------------
  if (!nombre || !apellido || !email || !password) {
    throw new HttpError(400, 'nombre, apellido, email y password son obligatorios.');
  }
  if (nombre.length > 50 || apellido.length > 50) {
    throw new HttpError(400, 'nombre y apellido admiten hasta 50 caracteres.');
  }
  if (!EMAIL_REGEX.test(email) || email.length > 256) {
    throw new HttpError(400, 'El email no tiene un formato válido.');
  }
  if (password.length < 6) {
    throw new HttpError(400, 'La contraseña debe tener al menos 6 caracteres.');
  }

  // ---- 2) Email único ---------------------------------------------------------
  // findOne({ where }) -> SELECT * FROM "Usuarios" WHERE email = ... LIMIT 1
  const emailNormalizado = email.trim().toLowerCase();
  const existente = await Usuario.findOne({ where: { email: emailNormalizado } });
  if (existente) {
    throw new HttpError(400, 'Ya existe un usuario registrado con ese email.');
  }

  // ---- 3) Hash de la contraseña con bcrypt -----------------------------------
  // bcrypt.hash(plano, saltRounds):
  //   * genera un SALT aleatorio (así dos usuarios con la misma contraseña
  //     obtienen hashes distintos),
  //   * saltRounds = 10 -> 2^10 rondas de cómputo: lo vuelve lento a propósito
  //     para frenar ataques de fuerza bruta,
  //   * devuelve un string de ~60 chars con salt + hash. Es de UNA SOLA VÍA:
  //     no se puede "desencriptar", solo comparar con bcrypt.compare.
  const passwordHasheado = await bcrypt.hash(password, SALT_ROUNDS);

  // ---- 4) Crear el usuario ----------------------------------------------------
  // admin se fuerza a false: aunque el body traiga "admin": true lo ignoramos,
  // así nadie puede auto-otorgarse permisos de administrador al registrarse.
  const usuario = await Usuario.create({
    nombre: nombre.trim(),
    apellido: apellido.trim(),
    email: emailNormalizado,
    password: passwordHasheado,
    admin: false,
  });

  // Nunca devolvemos el hash de la contraseña.
  return { id: usuario.id, nombre: usuario.nombre, apellido: usuario.apellido, email: usuario.email };
};

const login = async ({ email, password }) => {
  if (!email || !password) {
    throw new HttpError(400, 'email y password son obligatorios.');
  }

  const usuario = await Usuario.findOne({ where: { email: email.trim().toLowerCase() } });

  // bcrypt.compare(plano, hash): extrae el salt guardado dentro del hash,
  // vuelve a hashear la contraseña ingresada y compara el resultado.
  // Usamos el MISMO mensaje si el email no existe o si la clave es incorrecta,
  // para no revelar qué emails están registrados (user enumeration).
  const passwordOk = usuario ? await bcrypt.compare(password, usuario.password) : false;
  if (!usuario || !passwordOk) {
    throw new HttpError(401, 'Credenciales inválidas.');
  }

  // ---- Firma del JWT ----------------------------------------------------------
  // Un JWT tiene 3 partes en base64 separadas por puntos: header.payload.firma
  //   * payload: datos que viajan en el token. Guardamos SOLO { id } (lo exige el
  //     enunciado). El payload NO está cifrado, cualquiera puede leerlo, por eso
  //     jamás se incluyen contraseñas.
  //   * firma: HMAC-SHA256 de header+payload con JWT_SECRET. Si alguien modifica
  //     el payload, la firma deja de coincidir y la verificación falla.
  //   * expiresIn '30m': agrega el claim "exp"; pasado ese tiempo jwt.verify
  //     lanza TokenExpiredError.
  const token = jwt.sign({ id: usuario.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  // Devolvemos también los datos públicos del usuario (incluido el flag admin):
  // el frontend los necesita para armar el navbar adaptativo sin decodificar el JWT.
  return { token, usuario: datosPublicos(usuario) };
};

// Datos del usuario autenticado (para GET /auth/me). El id viene del JWT.
const me = async (idUsuario) => {
  const usuario = await Usuario.findByPk(idUsuario);
  if (!usuario) throw new HttpError(401, 'El usuario del token ya no existe.');
  return datosPublicos(usuario);
};

module.exports = { register, login, me };
