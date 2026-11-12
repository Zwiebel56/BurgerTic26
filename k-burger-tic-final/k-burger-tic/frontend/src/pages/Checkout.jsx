import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Notice, PageTitle } from '../components/ui';
import { formatPrice, tipoInfo } from '../utils/format';

// Métodos de pago SIMULADOS: no se cobra nada real ni se envían a la API.
const METODOS = [
  { id: 'mercadopago', label: 'MercadoPago', desc: 'Pagá con tu cuenta o QR', icon: '💙' },
  { id: 'tarjeta', label: 'Tarjeta', desc: 'Crédito o débito', icon: '💳' },
  { id: 'efectivo', label: 'Efectivo', desc: 'Pagás al recibir tu pedido', icon: '💵' },
];

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

export default function Checkout() {
  const { usuario } = useAuth();
  const { items, total, setQty, remove, clear } = useCart();
  const navigate = useNavigate();
  const [metodo, setMetodo] = useState('mercadopago');
  const [estado, setEstado] = useState('idle'); // idle | procesando
  const [error, setError] = useState('');
  const [confirmado, setConfirmado] = useState(null);

  // ---- Pantalla de éxito ----
  if (confirmado) {
    const m = METODOS.find((x) => x.id === confirmado.metodo);
    return (
      <div className="mx-auto max-w-lg">
        <div className="glass p-10 text-center">
          <div className="text-6xl">🎉</div>
          <h1 className="mt-4 text-3xl font-bold text-white">¡Pedido confirmado!</h1>
          <p className="mt-2 text-slate-400">
            Pedido <span className="font-semibold text-neon-cyan">#{confirmado.pedido.id}</span> · {formatPrice(confirmado.pedido.total)} · {m.icon} {m.label}
          </p>
          <p className="mt-1 text-sm text-slate-500">Estado inicial: pendiente. Seguilo en tiempo real desde “Mis Pedidos”.</p>
          <div className="mt-8 flex justify-center gap-3">
            <button className="btn-neon" onClick={() => navigate('/mis-pedidos')}>Ver mis pedidos</button>
            <Link to="/menu" className="btn-ghost">Seguir pidiendo</Link>
          </div>
        </div>
      </div>
    );
  }

  // ---- Carrito vacío ----
  if (items.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-6xl">🛒</p>
        <h1 className="mt-4 text-2xl font-bold text-white">Tu carrito está vacío</h1>
        <p className="mt-2 text-slate-400">Agregá algo rico del menú para continuar.</p>
        <Link to="/menu" className="btn-neon mt-6">Ver el menú</Link>
      </div>
    );
  }

  const confirmar = async () => {
    setError('');
    setEstado('procesando');
    try {
      await esperar(1600); // simula la pasarela de pago
      // Body exigido por la API: { platos: [{ id, cantidad }] }
      const d = await api('/pedidos', {
        method: 'POST',
        body: { platos: items.map((i) => ({ id: i.id, cantidad: i.cantidad })) },
      });
      clear();
      setConfirmado({ pedido: d.pedido, metodo });
    } catch (err) {
      setError(err.message);
      setEstado('idle');
    }
  };

  return (
    <>
      <PageTitle kicker="Último paso" title="Confirmá tu pedido" />
      <div className="grid gap-8 lg:grid-cols-5">
        {/* Resumen */}
        <section className="glass divide-y divide-white/10 lg:col-span-3">
          {items.map((i) => (
            <div key={i.id} className="flex items-center gap-4 p-4">
              <span className="text-3xl" aria-hidden>{tipoInfo(i.tipo).emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-white">{i.nombre}</p>
                <p className="text-sm text-slate-400">{formatPrice(i.precio)} c/u</p>
              </div>
              <div className="flex items-center rounded-lg border border-white/10 bg-white/5">
                <button className="px-3 py-1 hover:text-neon-pink" onClick={() => setQty(i.id, i.cantidad - 1)}>−</button>
                <span className="w-6 text-center text-sm font-semibold text-white">{i.cantidad}</span>
                <button className="px-3 py-1 hover:text-neon-cyan" onClick={() => setQty(i.id, i.cantidad + 1)}>+</button>
              </div>
              <p className="w-24 text-right font-semibold text-white">{formatPrice(i.precio * i.cantidad)}</p>
              <button className="text-slate-500 hover:text-neon-pink" onClick={() => remove(i.id)} aria-label="Quitar">✕</button>
            </div>
          ))}
          <div className="flex items-center justify-between p-4 text-lg">
            <span className="text-slate-400">Total</span>
            <span className="text-2xl font-bold text-white">{formatPrice(total)}</span>
          </div>
        </section>

        {/* Pago */}
        <section className="glass space-y-5 p-6 lg:col-span-2">
          <div>
            <h2 className="text-lg font-semibold text-white">Método de pago</h2>
            <p className="text-xs text-slate-500">Simulación: no se realiza ningún cobro real.</p>
          </div>
          <div className="space-y-2">
            {METODOS.map((m) => (
              <button
                key={m.id}
                onClick={() => setMetodo(m.id)}
                disabled={estado === 'procesando'}
                className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                  metodo === m.id ? 'border-neon-cyan bg-neon-cyan/10 shadow-glow-cyan' : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <span className="text-2xl">{m.icon}</span>
                <span>
                  <span className="block font-semibold text-white">{m.label}</span>
                  <span className="block text-xs text-slate-400">{m.desc}</span>
                </span>
              </button>
            ))}
          </div>

          {error && <Notice>{error}</Notice>}

          {usuario ? (
            <button className="btn-neon w-full !py-3" onClick={confirmar} disabled={estado === 'procesando'}>
              {estado === 'procesando' ? 'Procesando pago…' : `Pagar ${formatPrice(total)}`}
            </button>
          ) : (
            <button className="btn-neon w-full !py-3" onClick={() => navigate('/login', { state: { from: '/checkout' } })}>
              Iniciá sesión para pagar
            </button>
          )}
        </section>
      </div>
    </>
  );
}
