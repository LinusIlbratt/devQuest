'use client';

import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useState } from 'react';

export default function AdminPage() {
  const nodes = useQuery(api.map.getNodes, {});

  const upsertNode = useMutation(api.admin.upsertNode);
  const deleteNode = useMutation(api.admin.deleteNode);

  // useState-hook to handle form data in a component
  const [form, setForm] = useState({
    slug: '',
    title: '',
    kind: 'theory' as 'theory' | 'quiz' | 'sim' | 'boss',
    area: 'Docker',
    x: 100,
    y: 100,
    requires: ''
  });

  if (nodes === undefined) return <main className="p-6">Laddar…</main>;

  // async function to create or update a node
  const onCreate = async () => {
    if (!form.slug.trim() || !form.title.trim()) return alert('Slug och title krävs.');
    await upsertNode({
      slug: form.slug.trim(),
      title: form.title.trim(),
      kind: form.kind,
      area: form.area.trim(),
      pos: { x: Number(form.x), y: Number(form.y) },
      requires: form.requires
        .split(',')
        .map(s => s.trim())
        .filter(Boolean),
    });
    setForm({ ...form, slug: '', title: '', requires: '' });
  };

  const onDelete = async (slug: string) => {
    if (!confirm(`Ta bort nod "${slug}"?`)) return;
    try {
      await deleteNode({ slug });
    } catch (e: any) {
      alert(e.message ?? String(e));
    }
  };

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Admin</h1>
      
      <section className="border rounded p-4 space-y-3">
        <h2 className="font-semibold">Skapa / Uppdatera nod</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <input className="border rounded p-2" placeholder="slug" value={form.slug}
                 onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} />
          <input className="border rounded p-2" placeholder="title" value={form.title}
                 onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          <select className="border rounded p-2" value={form.kind}
                  onChange={e => setForm(f => ({ ...f, kind: e.target.value as any }))}>
            <option value="theory">theory</option>
            <option value="quiz">quiz</option>
            <option value="sim">sim</option>
            <option value="boss">boss</option>
          </select>
          <input className="border rounded p-2" placeholder="area" value={form.area}
                 onChange={e => setForm(f => ({ ...f, area: e.target.value }))} />
          <input className="border rounded p-2" type="number" placeholder="x" value={form.x}
                 onChange={e => setForm(f => ({ ...f, x: Number(e.target.value) }))} />
          <input className="border rounded p-2" type="number" placeholder="y" value={form.y}
                 onChange={e => setForm(f => ({ ...f, y: Number(e.target.value) }))} />
          <input className="border rounded p-2 col-span-2 md:col-span-3" placeholder="requires (comma-separated slugs)"
                 value={form.requires}
                 onChange={e => setForm(f => ({ ...f, requires: e.target.value }))} />
        </div>
        <button className="px-4 py-2 rounded bg-black text-white" onClick={onCreate}>
          Spara nod
        </button>
      </section>

      <section className="border rounded p-4 space-y-3">
        <h2 className="font-semibold">Noder ({nodes.length})</h2>
        <ul className="space-y-2">
          {nodes.map(n => (
            <li key={n._id} className="border rounded p-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{n.title}</div>
                <div className="text-xs opacity-60">
                  {n.slug} · {n.area} · {n.kind} · pos({n.pos.x},{n.pos.y}) · requires: {n.requires.join(', ') || '—'}
                </div>
              </div>
              <button className="px-3 py-1 rounded bg-red-600 text-white text-sm"
                      onClick={() => onDelete(n.slug)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
