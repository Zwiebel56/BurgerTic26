import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const VALORES = [
  { icon: '🔥', titulo: 'Sabor callejero de Seúl', texto: 'Bulgogi, kimchi crocante y gochujang en burgers smash hechas al momento.' },
  { icon: '🥢', titulo: 'Fusión asiática', texto: 'Teriyaki, bao, dumplings y toques de wasabi que rompen con lo clásico.' },
  { icon: '⚡', titulo: 'Pedido en segundos', texto: 'Armá tu carrito, pagá y seguí tu pedido paso a paso hasta tu puerta.' },
];

export default function Home() {
  const { isAdmin } = useAuth();

  return (
    <div className="space-y-20">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 px-6 py-20 text-center sm:py-28">
        <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-neon-pink/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-neon-cyan/20 blur-3xl" />
        <div className="relative">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-neon-cyan">Korean street burgers · 한국</p>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight text-white sm:text-6xl">
            Hamburguesas del futuro con alma <span className="bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text text-transparent">coreana</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-slate-400">
            Street food coreano y fusión asiática en una experiencia hipermoderna. Elegí, pagá y seguí tu pedido en tiempo real.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to={isAdmin ? '/admin/dashboard' : '/menu'} className="btn-neon !px-7 !py-3 text-base">
              {isAdmin ? 'Ir al panel' : 'Ver el menú'}
            </Link>
            {!isAdmin && <Link to="/register" className="btn-cyan !px-7 !py-3 text-base">Crear cuenta</Link>}
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {VALORES.map((v) => (
          <div key={v.titulo} className="glass p-6 transition hover:border-neon-pink/40">
            <div className="text-3xl">{v.icon}</div>
            <h3 className="mt-3 text-lg font-semibold text-white">{v.titulo}</h3>
            <p className="mt-2 text-sm text-slate-400">{v.texto}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
