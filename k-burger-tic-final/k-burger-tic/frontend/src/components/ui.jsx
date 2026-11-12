import { ESTADO_LABEL, ESTADO_STYLES } from '../utils/format';

export const Spinner = ({ label = 'Cargando…' }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-400">
    <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-neon-cyan" />
    <span className="text-sm">{label}</span>
  </div>
);

export const ErrorBox = ({ message, onRetry }) => (
  <div className="glass border-neon-pink/40 p-5 text-sm text-neon-pink">
    <p>{message}</p>
    {onRetry && <button onClick={onRetry} className="btn-ghost mt-3">Reintentar</button>}
  </div>
);

export const Notice = ({ children }) => (
  <div className="rounded-xl border border-neon-pink/40 bg-neon-pink/10 px-4 py-3 text-sm text-neon-pink">{children}</div>
);

export const PageTitle = ({ kicker, title, children }) => (
  <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
    <div>
      {kicker && <p className="mb-1 text-xs font-semibold uppercase tracking-[0.25em] text-neon-cyan">{kicker}</p>}
      <h1 className="text-3xl font-bold text-white sm:text-4xl">{title}</h1>
    </div>
    {children}
  </div>
);

export const StatusBadge = ({ estado }) => (
  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${ESTADO_STYLES[estado]}`}>
    {ESTADO_LABEL[estado] || estado}
  </span>
);
