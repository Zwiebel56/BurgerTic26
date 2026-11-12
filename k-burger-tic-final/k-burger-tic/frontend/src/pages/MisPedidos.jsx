import { Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { ErrorBox, PageTitle, Spinner, StatusBadge } from '../components/ui';
import { ESTADOS, ESTADO_LABEL, formatFecha, formatPrice } from '../utils/format';

// Barra de progreso con los 4 estados del pedido.
function Seguimiento({ estado }) {
  const actual = ESTADOS.indexOf(estado);
  return (
    <ol className="flex items-center">
      {ESTADOS.map((e, i) => (
        <li key={e} className="flex flex-1 items-center last:flex-none">
          <div className="flex flex-col items-center gap-1">
            <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition ${
              i < actual ? 'bg-neon-cyan text-base' : i === actual ? 'animate-pulse bg-neon-pink text-white shadow-glow-pink' : 'bg-white/10 text-slate-500'
            }`}>{i < actual ? '✓' : i + 1}</span>
            <span className={`text-[10px] sm:text-xs ${i <= actual ? 'text-white' : 'text-slate-500'}`}>{ESTADO_LABEL[e]}</span>
          </div>
          {i < ESTADOS.length - 1 && <div className={`mx-1 mb-5 h-0.5 flex-1 ${i < actual ? 'bg-neon-cyan' : 'bg-white/10'}`} />}
        </li>
      ))}
    </ol>
  );
}

export default function MisPedidos() {
  // interval: consulta la API cada 8 s para reflejar cambios de estado (polling)
  const { data, loading, error, reload } = useApi('/pedidos/mis-pedidos', { interval: 8000 });

  return (
    <>
      <PageTitle kicker="Historial" title="Mis pedidos">
        <span className="flex items-center gap-2 text-xs text-slate-400">
          <span className="h-2 w-2 animate-pulse rounded-full bg-neon-cyan" /> Actualización en vivo
        </span>
      </PageTitle>

      {loading && <Spinner />}
      {error && <ErrorBox message={error} onRetry={reload} />}

      {data && data.pedidos.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-5xl">🥡</p>
          <p className="mt-3 text-slate-400">Todavía no hiciste ningún pedido.</p>
          <Link to="/menu" className="btn-neon mt-5">Ir al menú</Link>
        </div>
      )}

      <div className="space-y-5">
        {data?.pedidos.map((p) => (
          <article key={p.id} className="glass space-y-5 p-6">
            <header className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold text-white">Pedido #{p.id}</h2>
                <p className="text-xs text-slate-400">{formatFecha(p.fecha)}</p>
              </div>
              <StatusBadge estado={p.estado} />
            </header>
            <Seguimiento estado={p.estado} />
            <ul className="divide-y divide-white/10 text-sm">
              {p.platos.map((pl) => (
                <li key={pl.id} className="flex justify-between py-2">
                  <span className="text-slate-300">{pl.cantidad}× {pl.nombre}</span>
                  <span className="text-slate-400">{formatPrice(pl.subtotal)}</span>
                </li>
              ))}
            </ul>
            <p className="text-right text-lg font-bold text-white">Total {formatPrice(p.total)}</p>
          </article>
        ))}
      </div>
    </>
  );
}
