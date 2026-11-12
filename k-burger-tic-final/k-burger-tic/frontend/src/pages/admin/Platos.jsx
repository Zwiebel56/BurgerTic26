import { useState } from 'react';
import { api } from '../../api/client';
import { useApi } from '../../hooks/useApi';
import { ErrorBox, Notice, PageTitle, Spinner } from '../../components/ui';
import { TIPOS, formatPrice, tipoInfo } from '../../utils/format';

const VACIO = { id: null, tipo: 'principal', nombre: '', precio: '', descripcion: '' };

export default function Platos() {
  const { data, loading, error, reload } = useApi('/platos');
  const [form, setForm] = useState(VACIO);
  const [msg, setMsg] = useState({ tipo: '', texto: '' });
  const [busy, setBusy] = useState(false);

  const editando = form.id !== null;
  const set = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setMsg({ tipo: '', texto: '' });
    const body = {
      tipo: form.tipo,
      nombre: form.nombre,
      precio: Number(form.precio),
      descripcion: form.descripcion,
    };
    setBusy(true);
    try {
      if (editando) await api(`/platos/${form.id}`, { method: 'PUT', body });
      else await api('/platos', { method: 'POST', body });
      setMsg({ tipo: 'ok', texto: editando ? 'Plato actualizado.' : 'Plato creado.' });
      setForm(VACIO);
      reload();
    } catch (err) {
      setMsg({ tipo: 'error', texto: err.message });
    } finally {
      setBusy(false);
    }
  };

  const eliminar = async (p) => {
    if (!window.confirm(`¿Eliminar "${p.nombre}"?`)) return;
    setMsg({ tipo: '', texto: '' });
    try {
      await api(`/platos/${p.id}`, { method: 'DELETE' });
      if (form.id === p.id) setForm(VACIO);
      setMsg({ tipo: 'ok', texto: 'Plato eliminado.' });
      reload();
    } catch (err) {
      setMsg({ tipo: 'error', texto: err.message }); // p. ej. plato ya vendido
    }
  };

  const editar = (p) => {
    setMsg({ tipo: '', texto: '' });
    setForm({ id: p.id, tipo: p.tipo, nombre: p.nombre, precio: String(p.precio), descripcion: p.descripcion });
  };

  return (
    <>
      <PageTitle kicker="Administración" title="Gestionar platos" />

      {msg.tipo === 'error' && <div className="mb-5"><Notice>{msg.texto}</Notice></div>}
      {msg.tipo === 'ok' && (
        <div className="mb-5 rounded-xl border border-emerald-400/40 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">{msg.texto}</div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Tabla */}
        <section className="glass overflow-hidden lg:col-span-2">
          {loading && <Spinner />}
          {error && <ErrorBox message={error} onRetry={reload} />}
          {data && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Plato</th>
                    <th className="px-4 py-3">Tipo</th>
                    <th className="px-4 py-3 text-right">Precio</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.platos.map((p) => (
                    <tr key={p.id} className={form.id === p.id ? 'bg-neon-cyan/5' : 'hover:bg-white/5'}>
                      <td className="px-4 py-3 font-medium text-white">{p.nombre}</td>
                      <td className="px-4 py-3 text-slate-400">{tipoInfo(p.tipo).emoji} {tipoInfo(p.tipo).label}</td>
                      <td className="px-4 py-3 text-right text-white">{formatPrice(p.precio)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <button onClick={() => editar(p)} className="btn-cyan !px-3 !py-1.5 text-xs">Editar</button>{' '}
                        <button onClick={() => eliminar(p)} className="btn-ghost !px-3 !py-1.5 text-xs hover:!border-neon-pink/50 hover:!text-neon-pink">Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Formulario crear/editar */}
        <section className="glass h-fit space-y-4 p-6 lg:sticky lg:top-24">
          <h2 className="text-lg font-semibold text-white">{editando ? `Editar plato #${form.id}` : 'Nuevo plato'}</h2>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label" htmlFor="tipo">Tipo</label>
              <select id="tipo" className="input" value={form.tipo} onChange={set('tipo')}>
                {TIPOS.map((t) => <option key={t.id} value={t.id} className="bg-base">{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="nombre">Nombre</label>
              <input id="nombre" required maxLength={70} className="input" value={form.nombre} onChange={set('nombre')} />
            </div>
            <div>
              <label className="label" htmlFor="precio">Precio (ARS)</label>
              <input id="precio" type="number" min="0" step="1" required className="input" value={form.precio} onChange={set('precio')} />
            </div>
            <div>
              <label className="label" htmlFor="descripcion">Descripción</label>
              <textarea id="descripcion" required maxLength={400} rows={4} className="input resize-none" value={form.descripcion} onChange={set('descripcion')} />
            </div>
            <div className="flex gap-2">
              <button className="btn-neon flex-1" disabled={busy}>{busy ? 'Guardando…' : editando ? 'Guardar cambios' : 'Crear plato'}</button>
              {editando && <button type="button" className="btn-ghost" onClick={() => setForm(VACIO)}>Cancelar</button>}
            </div>
          </form>
        </section>
      </div>
    </>
  );
}
