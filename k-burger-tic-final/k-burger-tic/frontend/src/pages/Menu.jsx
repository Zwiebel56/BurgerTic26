import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import PlatoCard from '../components/PlatoCard';
import { ErrorBox, PageTitle, Spinner } from '../components/ui';
import { TIPOS } from '../utils/format';

const FILTROS = [{ id: 'todos', label: 'Todos', emoji: '✨' }, ...TIPOS];

export default function Menu() {
  const { data, loading, error, reload } = useApi('/platos');
  const [filtro, setFiltro] = useState('todos');

  const platos = data?.platos || [];
  const visibles = filtro === 'todos' ? platos : platos.filter((p) => p.tipo === filtro);

  return (
    <>
      <PageTitle kicker="Carta" title="Nuestro menú" />

      {/* Filtros por tipo */}
      <div className="mb-8 flex flex-wrap gap-2">
        {FILTROS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFiltro(f.id)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              filtro === f.id
                ? 'border-neon-pink bg-neon-pink/15 text-white shadow-glow-pink'
                : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            {f.emoji} {f.label}
          </button>
        ))}
      </div>

      {loading && <Spinner label="Calentando la plancha…" />}
      {error && <ErrorBox message={error} onRetry={reload} />}
      {!loading && !error && visibles.length === 0 && <p className="text-slate-400">No hay platos en esta categoría.</p>}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visibles.map((p) => <PlatoCard key={p.id} plato={p} />)}
      </div>
    </>
  );
}
