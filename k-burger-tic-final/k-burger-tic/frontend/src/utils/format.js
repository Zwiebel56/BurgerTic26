export const formatPrice = (n) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n || 0);

export const formatFecha = (iso) =>
  new Date(iso).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' });

export const ESTADOS = ['pendiente', 'aceptado', 'en camino', 'entregado'];

export const ESTADO_LABEL = {
  pendiente: 'Pendiente',
  aceptado: 'Aceptado',
  'en camino': 'En camino',
  entregado: 'Entregado',
};

// Clases completas (Tailwind no detecta clases armadas dinámicamente).
export const ESTADO_STYLES = {
  pendiente: 'bg-amber-400/15 text-amber-300 border-amber-400/30',
  aceptado: 'bg-sky-400/15 text-sky-300 border-sky-400/30',
  'en camino': 'bg-fuchsia-400/15 text-fuchsia-300 border-fuchsia-400/30',
  entregado: 'bg-emerald-400/15 text-emerald-300 border-emerald-400/30',
};

export const TIPOS = [
  { id: 'principal', label: 'Principales', emoji: '🍔' },
  { id: 'combo', label: 'Combos', emoji: '🍱' },
  { id: 'postre', label: 'Postres', emoji: '🍧' },
];

export const tipoInfo = (tipo) =>
  TIPOS.find((t) => t.id === tipo) || { id: tipo, label: tipo, emoji: '🍽️' };
