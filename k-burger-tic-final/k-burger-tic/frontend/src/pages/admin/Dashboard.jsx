import { useApi } from '../../hooks/useApi';
import { ErrorBox, PageTitle, Spinner } from '../../components/ui';
import { ESTADOS, ESTADO_LABEL, ESTADO_STYLES, formatPrice, tipoInfo } from '../../utils/format';

const Kpi = ({ label, value, accent, icon }) => (
  <div className={`glass relative overflow-hidden p-6 ${accent === 'pink' ? 'hover:shadow-glow-pink' : 'hover:shadow-glow-cyan'} transition`}>
    <span className="absolute right-4 top-4 text-3xl opacity-60">{icon}</span>
    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</p>
    <p className={`mt-3 text-3xl font-bold ${accent === 'pink' ? 'text-neon-pink' : 'text-neon-cyan'}`}>{value}</p>
  </div>
);

export default function Dashboard() {
  const { data, loading, error, reload } = useApi('/pedidos/dashboard');

  if (loading) return <Spinner label="Calculando métricas…" />;
  if (error) return <ErrorBox message={error} onRetry={reload} />;

  const ranking = data.platosMasVendidos;
  const maxIngresos = Math.max(1, ...ranking.map((p) => p.ingresos));
  const maxUnidades = Math.max(1, ...ranking.map((p) => p.unidades));

  return (
    <>
      <PageTitle kicker="Analíticas" title="Dashboard de ventas">
        <button onClick={reload} className="btn-ghost">↻ Actualizar</button>
      </PageTitle>

      {/* KPIs */}
      <div className="grid gap-5 sm:grid-cols-3">
        <Kpi label="Ingresos (entregados)" value={formatPrice(data.recaudacionTotal)} accent="pink" icon="💰" />
        <Kpi label="Pedidos activos" value={data.pedidosActivos} accent="cyan" icon="🔥" />
        <Kpi label="Ticket promedio" value={formatPrice(data.ticketPromedio)} accent="pink" icon="🧾" />
      </div>

      {/* Pedidos por estado */}
      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        {ESTADOS.map((e) => (
          <div key={e} className={`rounded-2xl border p-4 ${ESTADO_STYLES[e]}`}>
            <p className="text-xs font-semibold uppercase tracking-wider">{ESTADO_LABEL[e]}</p>
            <p className="mt-1 text-2xl font-bold">{data.pedidosPorEstado[e]}</p>
          </div>
        ))}
      </div>

      {/* Ventas por plato */}
      <section className="glass mt-8 p-6">
        <h2 className="text-lg font-semibold text-white">Ventas por plato</h2>
        <p className="mb-6 text-xs text-slate-500">Solo pedidos entregados · barra rosa = ingresos, barra cian = unidades</p>

        {ranking.length === 0 && <p className="text-sm text-slate-400">Todavía no hay ventas entregadas.</p>}

        <ul className="space-y-5">
          {ranking.map((p, idx) => (
            <li key={p.id}>
              <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
                <span className="truncate font-medium text-white">
                  <span className="mr-2 text-slate-500">#{idx + 1}</span>{tipoInfo(p.tipo).emoji} {p.nombre}
                </span>
                <span className="shrink-0 text-slate-400">{p.unidades} u. · <span className="font-semibold text-white">{formatPrice(p.ingresos)}</span></span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-white/5">
                <div className="h-full rounded-full bg-gradient-to-r from-neon-pink to-fuchsia-400 shadow-glow-pink transition-all duration-700"
                  style={{ width: `${(p.ingresos / maxIngresos) * 100}%` }} />
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/5">
                <div className="h-full rounded-full bg-neon-cyan/80 transition-all duration-700"
                  style={{ width: `${(p.unidades / maxUnidades) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
