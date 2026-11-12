import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice, tipoInfo } from '../utils/format';

export default function PlatoCard({ plato }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const tipo = tipoInfo(plato.tipo);

  const agregar = () => {
    add(plato);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <article className="glass group flex flex-col overflow-hidden transition hover:-translate-y-1 hover:border-neon-cyan/40 hover:shadow-glow-cyan">
      <Link to={`/plato/${plato.id}`} className="flex h-36 items-center justify-center bg-gradient-to-br from-neon-pink/20 via-transparent to-neon-cyan/20 text-6xl transition group-hover:scale-105">
        <span aria-hidden>{tipo.emoji}</span>
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <span className="text-xs font-semibold uppercase tracking-widest text-neon-cyan">{tipo.label}</span>
        <Link to={`/plato/${plato.id}`} className="text-lg font-semibold leading-tight text-white hover:text-neon-pink">
          {plato.nombre}
        </Link>
        <p className="line-clamp-2 text-sm text-slate-400">{plato.descripcion}</p>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-lg font-bold text-white">{formatPrice(plato.precio)}</span>
          <button onClick={agregar} className="btn-neon !px-4 !py-2">
            {added ? '✓ Agregado' : '+ Agregar'}
          </button>
        </div>
      </div>
    </article>
  );
}
