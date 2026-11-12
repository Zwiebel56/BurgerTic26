import { useState } from 'react';
import { api } from '../../api/client';
import { useApi } from '../../hooks/useApi';
import { ErrorBox, Notice, PageTitle, Spinner } from '../../components/ui';
import { ESTADOS, ESTADO_LABEL, ESTADO_STYLES, formatFecha, formatPrice } from '../../utils/format';

export default function Pedidos() {
  // Tablero tipo kanban; se refresca solo cada 15 s para ver pedidos nuevos.
  const { data, setData, loading, error, reload } = useApi('/pedidos', { interval: 15000 });
  const [busyId, setBusyId] = useState(null);
  const [msg, setMsg] = useState('');

  // dir = +1 avanza al siguiente estado, -1 retrocede (para corregir errores)
  const mover = async (pedido, dir) => {
    const nuevo = ESTADOS[ESTADOS.indexOf(pedido.estado) + dir];
    if (!nuevo) return;
    setBusyId(pedido.id);
    setMsg('');
    try {
      const d = await api(`/pedidos/${pedido.id}/estado`, { method: 'PUT', body: { estado: nuevo } });
      setData((prev) => ({ ...prev, pedidos: prev.pedidos.map((p) => (p.id === pedido.id ? d.pedido : p)) }));
    } catch (err) {
      setMsg(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const eliminar = async (pedido) => {
    if (!window.confirm(`¿Eliminar el pedido #${pedido.id}? Esta acción no se puede deshacer.`)) return;
    setBusyId(pedido.id);
    setMsg('');
    try {
      await api(`/pedidos/${pedido.id}`, { method: 'DELETE' });
      setData((prev) => ({ ...prev, pedidos: prev.pedidos.filter((p) => p.id !== pedido.id) }));
    } catch (err) {
      setMsg(err.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <PageTitle kicker="Operación" title="Tablero de pedidos">
        <button onClick={reload} className="btn-ghost">↻ Actualizar</button>
      </PageTitle>

      {msg && <div className="mb-5"><Notice>{msg}</Notice></div>}
      {loading && <Spinner />}
      {error && <ErrorBox message={error} onRetry={reload} />}

      {data && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {ESTADOS.map((estado, colIdx) => {
            const pedidos = data.pedidos.filter((p) => p.estado === estado);
            return (
              <section key={estado} className="glass flex flex-col gap-3 p-3">
                <header className={`flex items-center justify-between rounded-xl border px-3 py-2 ${ESTADO_STYLES[estado]}`}>
                  <h2 className="text-sm font-bold uppercase tracking-wider">{ESTADO_LABEL[estado]}</h2>
                  <span className="rounded-full bg-black/30 px-2 py-0.5 text-xs font-bold">{pedidos.length}</span>
                </header>

                {pedidos.length === 0 && <p className="py-6 text-center text-xs text-slate-500">Sin pedidos</p>}

                {pedidos.map((p) => (
                  <article key={p.id} className={`rounded-xl border border-white/10 bg-white/5 p-3 text-sm transition ${busyId === p.id ? 'opacity-50' : ''}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-white">#{p.id}</p>
                        <p className="text-xs text-slate-400">{p.usuario ? `${p.usuario.nombre} ${p.usuario.apellido}` : 'Cliente'}</p>
                        <p className="text-xs text-slate-500">{formatFecha(p.fecha)}</p>
                      </div>
                      <button onClick={() => eliminar(p)} disabled={busyId === p.id} className="text-slate-500 hover:text-neon-pink" aria-label="Eliminar pedido">🗑</button>
                    </div>
                    <ul className="mt-2 space-y-0.5 text-xs text-slate-300">
                      {p.platos.map((pl) => <li key={pl.id}>{pl.cantidad}× {pl.nombre}</li>)}
                    </ul>
                    <p className="mt-2 text-right font-semibold text-white">{formatPrice(p.total)}</p>
                    <div className="mt-2 flex gap-2">
                      {colIdx > 0 && (
                        <button onClick={() => mover(p, -1)} disabled={busyId === p.id} className="btn-ghost !px-3 !py-1.5 text-xs" aria-label="Retroceder estado">←</button>
                      )}
                      {colIdx < ESTADOS.length - 1 ? (
                        <button onClick={() => mover(p, 1)} disabled={busyId === p.id} className="btn-cyan flex-1 !py-1.5 text-xs">
                          {ESTADO_LABEL[ESTADOS[colIdx + 1]]} →
                        </button>
                      ) : (
                        <span className="flex-1 py-1.5 text-center text-xs text-emerald-300">✓ Completado</span>
                      )}
                    </div>
                  </article>
                ))}
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}
