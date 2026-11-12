// =============================================================================
// Cliente HTTP de la API REST.
// - Agrega automáticamente el header Authorization: Bearer <token>.
// - Todas las respuestas de la API son JSON con la clave "message": si la
//   respuesta no es 2xx lanzamos un ApiError con ese mensaje para mostrarlo.
// =============================================================================
export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
export const TOKEN_KEY = 'kburger_token'; // clave del JWT en localStorage

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

// El AuthContext registra acá su logout para que un 401 (token vencido)
// cierre la sesión automáticamente.
let onUnauthorized = null;
export const setUnauthorizedHandler = (fn) => { onUnauthorized = fn; };

export async function api(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem(TOKEN_KEY);
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('No se pudo conectar con el servidor. ¿Está encendido el backend?', 0);
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 401 && auth && token && onUnauthorized) onUnauthorized();
    throw new ApiError(data.message || 'Ocurrió un error inesperado.', res.status);
  }
  return data;
}
