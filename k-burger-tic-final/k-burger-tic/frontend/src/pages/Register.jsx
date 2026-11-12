import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Notice } from '../components/ui';

export default function Register() {
  const { usuario, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nombre: '', apellido: '', email: '', password: '', confirmar: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (usuario) return <Navigate to="/" replace />;

  const set = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres.');
    if (form.password !== form.confirmar) return setError('Las contraseñas no coinciden.');
    setBusy(true);
    try {
      const { nombre, apellido, email, password } = form;
      await register({ nombre, apellido, email, password });
      navigate('/menu', { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="glass p-8">
        <h1 className="text-2xl font-bold text-white">Crear cuenta</h1>
        <p className="mt-1 text-sm text-slate-400">Sumate y pedí tu primera K-Burger.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="nombre">Nombre</label>
              <input id="nombre" required maxLength={50} className="input" value={form.nombre} onChange={set('nombre')} />
            </div>
            <div>
              <label className="label" htmlFor="apellido">Apellido</label>
              <input id="apellido" required maxLength={50} className="input" value={form.apellido} onChange={set('apellido')} />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" type="email" required className="input" value={form.email} onChange={set('email')} />
          </div>
          <div>
            <label className="label" htmlFor="password">Contraseña</label>
            <input id="password" type="password" required className="input" value={form.password} onChange={set('password')} placeholder="Mínimo 6 caracteres" />
          </div>
          <div>
            <label className="label" htmlFor="confirmar">Repetir contraseña</label>
            <input id="confirmar" type="password" required className="input" value={form.confirmar} onChange={set('confirmar')} />
          </div>
          {error && <Notice>{error}</Notice>}
          <button className="btn-neon w-full" disabled={busy}>{busy ? 'Creando cuenta…' : 'Registrarme'}</button>
        </form>
        <p className="mt-5 text-center text-sm text-slate-400">
          ¿Ya tenés cuenta? <Link to="/login" className="text-neon-cyan hover:underline">Ingresá</Link>
        </p>
      </div>
    </div>
  );
}
