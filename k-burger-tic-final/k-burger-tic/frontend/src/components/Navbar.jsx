import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const linkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-white/10 text-neon-cyan' : 'text-slate-300 hover:bg-white/5 hover:text-white'
  }`;

export default function Navbar() {
  const { usuario, isAdmin, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // Navbar adaptativo: el admin ve sus 3 paneles; cliente/visitante ve la tienda.
  const links = isAdmin
    ? [
        { to: '/admin/dashboard', label: 'Dashboard de Ventas' },
        { to: '/admin/platos', label: 'Gestionar Platos' },
        { to: '/admin/pedidos', label: 'Tablero de Pedidos' },
      ]
    : [
        { to: '/', label: 'Inicio', end: true },
        { to: '/menu', label: 'Menú' },
        ...(usuario ? [{ to: '/mis-pedidos', label: 'Mis Pedidos' }] : []),
      ];

  const salir = () => { logout(); setOpen(false); navigate('/'); };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-base/70 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to={isAdmin ? '/admin/dashboard' : '/'} className="text-xl font-bold tracking-tight text-white">
          K-Burger <span className="text-neon-pink">TIC</span>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>{l.label}</NavLink>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {!isAdmin && (
            <Link to="/checkout" aria-label="Carrito de compras" className="btn-ghost relative !px-3">
              <span className="text-lg">🛒</span>
              {count > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-neon-pink px-1 text-xs font-bold text-white shadow-glow-pink">
                  {count}
                </span>
              )}
            </Link>
          )}

          <div className="hidden items-center gap-2 md:flex">
            {usuario ? (
              <>
                <span className="text-sm text-slate-400">Hola, {usuario.nombre}</span>
                <button onClick={salir} className="btn-ghost">Salir</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost">Ingresar</Link>
                <Link to="/register" className="btn-neon">Registrarse</Link>
              </>
            )}
          </div>

          <button onClick={() => setOpen(!open)} className="btn-ghost !px-3 md:hidden" aria-label="Menú">
            {open ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* Mobile */}
      {open && (
        <div className="space-y-1 border-t border-white/10 px-4 py-3 md:hidden" onClick={() => setOpen(false)}>
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>{l.label}</NavLink>
          ))}
          <div className="flex gap-2 pt-2">
            {usuario ? (
              <button onClick={salir} className="btn-ghost w-full">Salir ({usuario.nombre})</button>
            ) : (
              <>
                <Link to="/login" className="btn-ghost flex-1">Ingresar</Link>
                <Link to="/register" className="btn-neon flex-1">Registrarse</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
