import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { useCart } from '../context/CartContext';
import { ErrorBox, Spinner } from '../components/ui';
import { formatPrice, tipoInfo } from '../utils/format';

export default function PlatoDetalle() {
  const { id } = useParams();
  const { data, loading, error, reload } = useApi(`/platos/${id}`);
  const { add } = useCart();
  const [cantidad, setCantidad] = useState(1);
  const [added, setAdded] = useState(false);

  if (loading) return <Spinner />;
  if (error) {
    return (
      <div className="space-y-4">
        <ErrorBox message={error} onRetry={reload} />
        <Link to="/menu" className="btn-ghost">← Volver al menú</Link>
      </div>
    );
  }

  const plato = data.plato;
  const tipo = tipoInfo(plato.tipo);

  const agregar = () => {
    add(plato, cantidad);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <div>
      <Link to="/menu" className="mb-6 inline-block text-sm text-slate-400 hover:text-neon-cyan">← Volver al menú</Link>
      <div className="grid gap-8 md:grid-cols-2">
        <div className="glass flex h-72 items-center justify-center bg-gradient-to-br from-neon-pink/20 via-transparent to-neon-cyan/20 text-9xl md:h-auto">
          <span aria-hidden>{tipo.emoji}</span>
        </div>
        <div className="glass flex flex-col gap-4 p-8">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-neon-cyan">{tipo.label}</span>
          <h1 className="text-3xl font-bold text-white">{plato.nombre}</h1>
          <p className="leading-relaxed text-slate-400">{plato.descripcion}</p>
          <p className="text-3xl font-bold text-white">{formatPrice(plato.precio)}</p>

          <div className="mt-auto flex flex-wrap items-center gap-4 pt-4">
            <div className="flex items-center rounded-xl border border-white/10 bg-white/5">
              <button className="px-4 py-2 text-lg hover:text-neon-pink" onClick={() => setCantidad((c) => Math.max(1, c - 1))}>−</button>
              <span className="w-8 text-center font-semibold text-white">{cantidad}</span>
              <button className="px-4 py-2 text-lg hover:text-neon-cyan" onClick={() => setCantidad((c) => c + 1)}>+</button>
            </div>
            <button onClick={agregar} className="btn-neon flex-1 !py-3">
              {added ? '✓ Agregado al carrito' : `Agregar · ${formatPrice(plato.precio * cantidad)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
