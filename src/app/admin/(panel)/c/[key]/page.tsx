'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useTopbar } from '@/components/admin/Shell';
import { api, collectionUrl } from '@/components/admin/api';
import { useToast } from '@/components/admin/Toasts';
import { collectionDef } from '@/lib/schemas';

export default function CollectionList() {
  const { key } = useParams<{ key: string }>();
  const def = collectionDef(key);
  const toast = useToast();
  const [items, setItems] = useState<any[] | null>(null);
  const [q, setQ] = useState('');
  const [drag, setDrag] = useState<number | null>(null);

  useEffect(() => {
    api<any[]>(collectionUrl(key)).then((l) => setItems(def?.sortable ? [...l].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) : [...l].reverse()));
  }, [key, def?.sortable]);

  useTopbar(
    <>
      <h2>{def?.label}</h2>
      <div className="actions">
        <Link href={`/admin/c/${key}/new`} className="a-btn primary">
          + New {def?.singular.toLowerCase()}
        </Link>
      </div>
    </>,
    [key],
  );

  const filtered = useMemo(() => (items || []).filter((it) => JSON.stringify(it).toLowerCase().includes(q.toLowerCase())), [items, q]);
  if (!def) return <p>Unknown collection.</p>;

  async function reorder(from: number, to: number) {
    if (!items || from === to) return;
    const n = [...items];
    const [x] = n.splice(from, 1);
    n.splice(to, 0, x);
    setItems(n);
    await api(`${collectionUrl(key)}/reorder`, { method: 'POST', json: { ids: n.map((i) => i.id) } });
    toast('Order saved');
  }
  async function remove(id: string) {
    if (!confirm('Delete permanently?')) return;
    await api(collectionUrl(key, id), { method: 'DELETE' });
    setItems((l) => l?.filter((x) => x.id !== id) || null);
    toast('Deleted');
  }

  const img = (it: any) => {
    const v = def.imageField ? it[def.imageField] : '';
    return Array.isArray(v) ? v[0] : v;
  };

  return (
    <div className="a-grid">
      <input type="search" placeholder={`Search ${def.label.toLowerCase()}…`} value={q} onChange={(e) => setQ(e.target.value)} style={{ maxWidth: 360 }} />
      <div className="a-card">
        <table className="a-table">
          <thead>
            <tr>
              {def.sortable && !q && <th style={{ width: 30 }} />}
              {def.imageField && <th style={{ width: 70 }} />}
              <th>{def.singular}</th>
              {'status' in (items?.[0] || {}) && <th>Status</th>}
              <th />
            </tr>
          </thead>
          <tbody>
            {filtered.map((it, i) => (
              <tr
                key={it.id}
                draggable={def.sortable && !q}
                onDragStart={() => setDrag(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => drag !== null && reorder(drag, i)}
                style={drag === i ? { opacity: 0.4 } : undefined}
              >
                {def.sortable && !q && (
                  <td className="pb-handle" title="Drag to reorder">
                    ⋮⋮
                  </td>
                )}
                {def.imageField && <td>{img(it) ? <img className="thumb" src={img(it)} alt="" /> : <div className="thumb" />}</td>}
                <td>
                  <Link href={`/admin/c/${key}/${it.id}`}>
                    <b>{it[def.titleField] || '(untitled)'}</b>
                  </Link>
                  {def.subtitleField && <div className="muted">{String(it[def.subtitleField] ?? '')}</div>}
                </td>
                {'status' in it && (
                  <td>
                    <span className={`a-pill ${it.status === 'published' ? 'ok' : 'warn'}`}>{it.status}</span> {it.featured && <span className="a-pill accent">Featured</span>}
                  </td>
                )}
                <td style={{ textAlign: 'right' }}>
                  <div className="a-row" style={{ justifyContent: 'flex-end' }}>
                    {def.publicPath && (
                      <a className="a-btn sm ghost" href={def.publicPath(it)} target="_blank">
                        View ↗
                      </a>
                    )}
                    <Link className="a-btn sm" href={`/admin/c/${key}/${it.id}`}>
                      Edit
                    </Link>
                    <button className="a-btn sm ghost danger icon" onClick={() => remove(it.id)} aria-label="Delete">
                      ✕
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items && !filtered.length && <p className="a-empty">Nothing here yet.</p>}
        {!items && <p className="a-empty">Loading…</p>}
      </div>
    </div>
  );
}
