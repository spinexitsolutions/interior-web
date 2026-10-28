'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTopbar } from '@/components/admin/Shell';
import { api, collectionUrl } from '@/components/admin/api';
import { useToast } from '@/components/admin/Toasts';
import type { Page } from '@/lib/types';

export default function PagesList() {
  const [pages, setPages] = useState<Page[]>([]);
  const router = useRouter();
  const toast = useToast();
  useEffect(() => {
    api<Page[]>(collectionUrl('pages')).then(setPages);
  }, []);
  async function create() {
    const title = prompt('Page title', 'New page');
    if (!title) return;
    try {
      const p = await api<Page>(collectionUrl('pages'), { method: 'POST', json: { title, slug: title, seoTitle: '', seoDescription: '', status: 'draft', sections: [] } });
      router.push(`/admin/pages/${p.id}`);
    } catch (e) {
      toast((e as Error).message, true);
    }
  }
  useTopbar(
    <>
      <h2>Pages & sections</h2>
      <div className="actions">
        <button className="a-btn primary" onClick={create}>
          + New page
        </button>
      </div>
    </>,
    [],
  );
  return (
    <div className="a-card">
      <table className="a-table">
        <thead>
          <tr>
            <th>Page</th>
            <th>URL</th>
            <th>Sections</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {pages.map((p) => (
            <tr key={p.id}>
              <td>
                <Link href={`/admin/pages/${p.id}`}>
                  <b>{p.title}</b>
                </Link>
              </td>
              <td className="muted">{p.slug === 'home' ? '/' : `/${p.slug}`}</td>
              <td>{p.sections.length}</td>
              <td>
                <span className={`a-pill ${p.status === 'published' ? 'ok' : 'warn'}`}>{p.status}</span>
              </td>
              <td style={{ textAlign: 'right' }}>
                <div className="a-row" style={{ justifyContent: 'flex-end' }}>
                  <a className="a-btn sm ghost" href={p.slug === 'home' ? '/' : `/${p.slug}`} target="_blank">
                    View ↗
                  </a>
                  <Link className="a-btn sm" href={`/admin/pages/${p.id}`}>
                    Edit
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="muted" style={{ padding: '12px 16px', margin: 0, borderTop: '1px solid var(--a-line)' }}>
        Tip: Collection, Projects, Journal and Showroom are dedicated pages fed by their collections. Every other page — including the homepage — is built from sections here. Add a page to the menu under Settings → Navigation.
      </p>
    </div>
  );
}
