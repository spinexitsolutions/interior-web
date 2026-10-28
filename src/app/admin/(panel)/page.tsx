'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTopbar } from '@/components/admin/Shell';
import { api } from '@/components/admin/api';
import type { Inquiry } from '@/lib/types';

type Stats = { products: number; projects: number; posts: number; pages: number; media: number; inquiries: number; unread: number; drafts: number; latestInquiries: Inquiry[] };

export default function Dashboard() {
  const [s, setS] = useState<Stats | null>(null);
  useEffect(() => {
    api<Stats>('/api/admin/stats').then(setS);
  }, []);
  useTopbar(<h2>Dashboard</h2>, []);
  const tiles: [string, number | undefined, string][] = [
    ['Products', s?.products, '/admin/c/products'],
    ['Projects', s?.projects, '/admin/c/projects'],
    ['Journal posts', s?.posts, '/admin/c/posts'],
    ['Pages', s?.pages, '/admin/pages'],
    ['Media files', s?.media, '/admin/media'],
    ['Unread inquiries', s?.unread, '/admin/inquiries'],
  ];
  return (
    <div className="a-grid" style={{ gap: 24 }}>
      <div className="a-card a-card-pad" style={{ background: '#16151a', color: '#ece6da', border: 0, display: 'grid', gap: 10 }}>
        <span className="mono" style={{ color: '#8f8a80' }}>
          Welcome back
        </span>
        <h1 style={{ fontWeight: 600, fontSize: 36, letterSpacing: '-0.03em', lineHeight: 1 }}>
          Everything on the website is <span style={{ color: '#7fc4ad' }}>editable</span> from here.
        </h1>
        <p style={{ color: '#a9a399', maxWidth: 640, margin: 0 }}>
          Build pages from 20 section types, upload 3D models for AR, restyle colours & typography and answer client inquiries — changes go live instantly.
        </p>
        <div className="a-row" style={{ marginTop: 6, flexWrap: 'wrap' }}>
          <Link href="/admin/pages" className="a-btn accent">
            Edit homepage
          </Link>
          <Link href="/admin/c/products/new" className="a-btn">
            Add product
          </Link>
          <Link href="/admin/theme" className="a-btn">
            Change theme
          </Link>
        </div>
      </div>
      <div className="a-stats">
        {tiles.map(([label, n, href]) => (
          <Link key={label} href={href} className="a-card a-stat">
            <span className="muted">{label}</span>
            <b>{n ?? '—'}</b>
          </Link>
        ))}
      </div>
      <div className="a-card">
        <div className="a-row" style={{ padding: '16px 20px', borderBottom: '1px solid var(--a-line)' }}>
          <h2 style={{ flex: 1 }}>Latest inquiries</h2>
          <Link href="/admin/inquiries" className="a-btn sm">
            View all
          </Link>
        </div>
        {s?.latestInquiries.length ? (
          <table className="a-table">
            <tbody>
              {s.latestInquiries.map((i) => (
                <tr key={i.id}>
                  <td style={{ width: 10 }}>{!i.read && <span className="a-pill accent">New</span>}</td>
                  <td>
                    <b>{i.name}</b>
                    <div className="muted">{i.email}</div>
                  </td>
                  <td className="muted" style={{ maxWidth: 420, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {i.message}
                  </td>
                  <td className="muted" style={{ whiteSpace: 'nowrap' }}>
                    {new Date(i.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="a-empty">No inquiries yet.</p>
        )}
      </div>
    </div>
  );
}
