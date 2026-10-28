'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';
import { COLLECTIONS } from '@/lib/schemas';
import { api } from './api';

type Me = { name: string; email: string; role: string };
const TopbarCtx = createContext<(node: React.ReactNode) => void>(() => {});
/** Pages call this to place breadcrumbs/actions in the sticky top bar. */
export function useTopbar(node: React.ReactNode, deps: unknown[]) {
  const set = useContext(TopbarCtx);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => set(node), deps);
  useEffect(() => () => set(null), [set]);
}

export default function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [me, setMe] = useState<Me | null>(null);
  const [unread, setUnread] = useState(0);
  const [bar, setBar] = useState<React.ReactNode>(null);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    api<Me>('/api/admin/me').then(setMe).catch(() => {});
  }, []);
  useEffect(() => {
    setOpen(false);
    api<{ unread: number }>('/api/admin/stats').then((s) => setUnread(s.unread)).catch(() => {});
  }, [path]);

  const is = (href: string) => (href === '/admin' ? path === '/admin' : path.startsWith(href));
  const link = (href: string, icon: string, label: string, badge?: number) => (
    <Link href={href} data-active={is(href)}>
      <i>{icon}</i>
      {label}
      {!!badge && <span className="badge">{badge}</span>}
    </Link>
  );

  return (
    <TopbarCtx.Provider value={setBar}>
      <div className="adm-shell">
        <aside className="adm-side" data-open={open}>
          <div className="adm-brand">
            <b>F</b>
            <span>
              Studio CMS
              <small>Website control room</small>
            </span>
          </div>
          <nav className="adm-nav">
            {link('/admin', '◇', 'Dashboard')}
            <div className="adm-navlabel mono">Website</div>
            {link('/admin/pages', '▤', 'Pages & sections')}
            {link('/admin/theme', '◑', 'Theme & typography')}
            {link('/admin/settings', '⚙', 'Settings & navigation')}
            <div className="adm-navlabel mono">Content</div>
            {COLLECTIONS.map((c) => link(`/admin/c/${c.key}`, c.icon, c.label))}
            {link('/admin/media', '▧', 'Media library')}
            <div className="adm-navlabel mono">Studio</div>
            {link('/admin/inquiries', '✉', 'Inquiries', unread)}
            {link('/admin/account', '☺', 'Account & users')}
          </nav>
          <div className="adm-side-foot">
            {me && (
              <span>
                {me.name}
                <br />
                <span style={{ color: '#6f6b64' }}>{me.email}</span>
              </span>
            )}
            <div className="a-row">
              <a href="/" target="_blank" className="a-btn sm" style={{ background: '#24232a', borderColor: '#33323a', color: '#e9e6df' }}>
                View site ↗
              </a>
              <button
                className="a-btn sm ghost"
                style={{ color: '#cfcac0' }}
                onClick={async () => {
                  await api('/api/admin/logout', { method: 'POST' });
                  location.href = '/admin/login';
                }}
              >
                Log out
              </button>
            </div>
          </div>
        </aside>
        <div className="adm-main">
          <div className="adm-top">
            <button className="a-btn sm icon adm-burger" onClick={() => setOpen((o) => !o)} aria-label="Menu">
              ☰
            </button>
            {bar}
          </div>
          <div className="adm-content">{children}</div>
        </div>
      </div>
    </TopbarCtx.Provider>
  );
}
