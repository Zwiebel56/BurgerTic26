import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Notice } from '../components/ui';

export default function Login() {
  const { usuario, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (usuario) return <Navigate to={usuario.admin ? '/admin/dashboard' : '/'} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const u = await login(form.email, form.password);
      navigate(location.state?.from || (u.admin ? '/admin/dashboard' : '/'), { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="glass p-8">
        <h1 className="text-2xl font-bold text-white">Ingresar</h1>
        <p className="mt-1 text-sm text-slate-400">Bienvenido de vuelta a K-Burger TIC.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" type="email" required className="input" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="vos@mail.com" />
          </div>
          <div>
            <label className="label" htmlFor="password">Contraseña</label>
            <input id="password" type="password" required className="input" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
          </div>
          {error && <Notice>{error}</Notice>}
          <button className="btn-neon w-full" disabled={busy}>{busy ? 'Ingresando…' : 'Ingresar'}</button>
        </form>
        <p className="mt-5 text-center text-sm text-slate-400">
          ¿No tenés cuenta? <Link to="/register" className="text-neon-cyan hover:underline">Registrate</Link>
        </p>
      </div>
    </div>
  );
}
