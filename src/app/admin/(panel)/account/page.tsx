'use client';
import { useEffect, useState } from 'react';
import { useTopbar } from '@/components/admin/Shell';
import { api } from '@/components/admin/api';
import { useToast } from '@/components/admin/Toasts';

type U = { id: string; email: string; name: string; role: string };

export default function Account() {
  const toast = useToast();
  const [users, setUsers] = useState<U[]>([]);
  const [me, setMe] = useState<{ sub: string; role: string; name: string } | null>(null);
  useEffect(() => {
    api('/api/admin/me').then(setMe);
    api<U[]>('/api/admin/users').then(setUsers);
  }, []);
  useTopbar(<h2>Account & users</h2>, []);
  const form = (fn: (d: Record<string, string>, el: HTMLFormElement) => Promise<void>) => async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const el = e.currentTarget;
    try {
      await fn(Object.fromEntries(new FormData(el).entries()) as Record<string, string>, el);
    } catch (err) {
      toast((err as Error).message, true);
    }
  };
  return (
    <div className="a-grid" style={{ maxWidth: 900 }}>
      <form
        className="a-card a-card-pad a-grid"
        onSubmit={form(async (d, el) => {
          await api('/api/admin/password', { method: 'POST', json: d });
          el.reset();
          toast('Password updated');
        })}
      >
        <h3>Change password</h3>
        <div className="f-grid">
          <label className="f-field half">
            <span className="f-label">Current password</span>
            <input name="current" type="password" required autoComplete="current-password" />
          </label>
          <label className="f-field half">
            <span className="f-label">New password (8+ characters)</span>
            <input name="next" type="password" required minLength={8} autoComplete="new-password" />
          </label>
        </div>
        <div>
          <button className="a-btn primary">Update password</button>
        </div>
      </form>

      <div className="a-card">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--a-line)' }}>
          <h3>Team</h3>
        </div>
        <table className="a-table">
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>
                  <b>{u.name}</b>
                  <div className="muted">{u.email}</div>
                </td>
                <td>
                  <span className="a-pill">{u.role}</span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  {me?.role === 'admin' && me.sub !== u.id && (
                    <button
                      className="a-btn sm danger"
                      onClick={async () => {
                        if (!confirm(`Remove ${u.email}?`)) return;
                        setUsers(await api('/api/admin/users', { method: 'DELETE', json: { id: u.id } }));
                      }}
                    >
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {me?.role === 'admin' && (
          <form
            style={{ padding: 20, borderTop: '1px solid var(--a-line)' }}
            className="a-grid"
            onSubmit={form(async (d, el) => {
              setUsers(await api('/api/admin/users', { method: 'POST', json: d }));
              el.reset();
              toast('User added');
            })}
          >
            <b>Invite a team member</b>
            <div className="f-grid">
              <input name="name" type="text" placeholder="Name" className="f-field half" />
              <input name="email" type="email" placeholder="Email" required className="f-field half" />
              <input name="password" type="password" placeholder="Temporary password (8+)" required minLength={8} className="f-field half" />
              <select name="role" className="f-field half" defaultValue="editor">
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <button className="a-btn">Add user</button>
            </div>
          </form>
        )}
      </div>

      {me?.role === 'admin' && (
        <div className="a-card a-card-pad a-grid" style={{ borderColor: '#f0c9c9' }}>
          <h3>Danger zone</h3>
          <p className="muted" style={{ margin: 0 }}>
            Restore all pages, products, theme and settings to the original demo content. Users and uploaded files are kept.
          </p>
          <div>
            <button
              className="a-btn danger"
              onClick={async () => {
                if (!confirm('Reset ALL content to the demo? This cannot be undone.')) return;
                await api('/api/admin/reset', { method: 'POST' });
                toast('Content reset');
              }}
            >
              Reset content to demo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
