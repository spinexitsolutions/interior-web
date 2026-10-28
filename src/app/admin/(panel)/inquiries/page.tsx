'use client';
import { useEffect, useState } from 'react';
import { useTopbar } from '@/components/admin/Shell';
import { api, collectionUrl } from '@/components/admin/api';
import { useToast } from '@/components/admin/Toasts';
import type { Inquiry } from '@/lib/types';

export default function Inquiries() {
  const [list, setList] = useState<Inquiry[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const toast = useToast();
  useEffect(() => {
    api<Inquiry[]>(collectionUrl('inquiries')).then((l) => setList([...l].sort((a, b) => b.createdAt.localeCompare(a.createdAt))));
  }, []);
  const patch = async (id: string, data: Partial<Inquiry>) => {
    const u = await api<Inquiry>(collectionUrl('inquiries', id), { method: 'PUT', json: data });
    setList((l) => l.map((x) => (x.id === id ? u : x)));
  };
  const exportCsv = () => {
    const rows = [['Date', 'Name', 'Email', 'Phone', 'Subject', 'Product', 'Message'], ...list.map((i) => [i.createdAt, i.name, i.email, i.phone, i.subject, i.product, i.message])];
    const csv = rows.map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'inquiries.csv';
    a.click();
  };
  useTopbar(
    <>
      <h2>Inquiries</h2>
      <div className="actions">
        <button className={`a-btn sm ${filter === 'all' ? 'primary' : ''}`} onClick={() => setFilter('all')}>
          All
        </button>
        <button className={`a-btn sm ${filter === 'unread' ? 'primary' : ''}`} onClick={() => setFilter('unread')}>
          Unread
        </button>
        <button className="a-btn sm" onClick={exportCsv}>
          Export CSV
        </button>
      </div>
    </>,
    [filter, list],
  );
  const shown = list.filter((i) => filter === 'all' || !i.read);
  return (
    <div className="a-grid" style={{ gap: 8 }}>
      {shown.map((i) => (
        <div key={i.id} className="a-card">
          <button
            className="a-row"
            style={{ width: '100%', padding: '14px 18px', background: 'none', border: 0, font: 'inherit', textAlign: 'left' }}
            onClick={() => {
              setOpen(open === i.id ? null : i.id);
              if (!i.read) patch(i.id, { read: true });
            }}
          >
            {!i.read ? <span className="a-pill accent">New</span> : <span className="a-pill">Read</span>}
            <b style={{ minWidth: 160 }}>{i.name}</b>
            <span className="muted" style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {i.subject ? `${i.subject} — ` : ''}
              {i.message}
            </span>
            <span className="muted" style={{ whiteSpace: 'nowrap' }}>
              {new Date(i.createdAt).toLocaleString()}
            </span>
          </button>
          {open === i.id && (
            <div style={{ padding: '0 18px 18px', display: 'grid', gap: 12 }}>
              <div className="a-row" style={{ flexWrap: 'wrap', gap: 18 }}>
                <span>
                  <span className="muted">Email</span> <a href={`mailto:${i.email}`}>{i.email}</a>
                </span>
                {i.phone && (
                  <span>
                    <span className="muted">Phone</span> <a href={`tel:${i.phone}`}>{i.phone}</a>
                  </span>
                )}
                {i.product && (
                  <span>
                    <span className="muted">Product</span>{' '}
                    <a href={`/collection/${i.product}`} target="_blank">
                      {i.product}
                    </a>
                  </span>
                )}
              </div>
              <p style={{ whiteSpace: 'pre-wrap', margin: 0, background: 'var(--a-soft)', padding: 14, borderRadius: 10 }}>{i.message}</p>
              <div className="a-row">
                <a className="a-btn sm primary" href={`mailto:${i.email}?subject=${encodeURIComponent('Re: ' + (i.subject || 'Your enquiry'))}`}>
                  Reply by email
                </a>
                <button className="a-btn sm" onClick={() => patch(i.id, { read: !i.read })}>
                  Mark as {i.read ? 'unread' : 'read'}
                </button>
                <button
                  className="a-btn sm danger"
                  onClick={async () => {
                    if (!confirm('Delete this inquiry?')) return;
                    await api(collectionUrl('inquiries', i.id), { method: 'DELETE' });
                    setList((l) => l.filter((x) => x.id !== i.id));
                    toast('Deleted');
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
      {!shown.length && <p className="a-empty a-card">No inquiries.</p>}
    </div>
  );
}
