'use client';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTopbar } from '@/components/admin/Shell';
import FieldRenderer from '@/components/admin/FieldRenderer';
import Modal from '@/components/admin/Modal';
import { api, collectionUrl } from '@/components/admin/api';
import { useToast } from '@/components/admin/Toasts';
import { SECTION_DEFS, sectionDef } from '@/lib/sections';
import { PAGE_META_FIELDS } from '@/lib/schemas';
import { defaultsFor } from '@/lib/fields';
import type { Page, Section } from '@/lib/types';

const sid = () => 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

function summary(s: Section) {
  const d = s.data || {};
  const t = d.title || d.text || d.eyebrow || (Array.isArray(d.items) ? d.items.map((x: any) => (typeof x === 'string' ? x : x.label || x.q)).join(' · ') : '');
  return String(t).replace(/\*/g, '').replace(/\n/g, ' ').slice(0, 80);
}

export default function PageBuilder() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const [page, setPage] = useState<Page | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [adding, setAdding] = useState<number | null>(null);
  const [showMeta, setShowMeta] = useState(false);
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [drag, setDrag] = useState<number | null>(null);
  const [frameKey, setFrameKey] = useState(0);
  const frame = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    api<Page>(collectionUrl('pages', id)).then(setPage).catch((e) => toast(e.message, true));
  }, [id, toast]);

  const update = (fn: (p: Page) => Page) => {
    setPage((p) => (p ? fn(p) : p));
    setDirty(true);
  };
  const setSections = (fn: (s: Section[]) => Section[]) => update((p) => ({ ...p, sections: fn(p.sections) }));

  const save = useCallback(async () => {
    if (!page) return;
    setSaving(true);
    try {
      const saved = await api<Page>(collectionUrl('pages', page.id), { method: 'PUT', json: page });
      setPage(saved);
      setDirty(false);
      setFrameKey((k) => k + 1);
      toast('Page saved — live on the site');
    } catch (e) {
      toast((e as Error).message, true);
    } finally {
      setSaving(false);
    }
  }, [page, toast]);

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        save();
      }
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [save]);
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const url = page ? (page.slug === 'home' ? '/' : `/${page.slug}`) : '/';
  useTopbar(
    <>
      <div className="crumbs">
        <Link href="/admin/pages">Pages</Link> <span>/</span> <b style={{ color: 'var(--a-ink)' }}>{page?.title}</b>
        {dirty && <span className="a-pill warn">Unsaved</span>}
      </div>
      <div className="actions">
        <a className="a-btn ghost" href={url} target="_blank">
          Open ↗
        </a>
        <button className="a-btn primary" onClick={save} disabled={saving || !dirty}>
          {saving ? 'Saving…' : 'Save & publish'}
        </button>
      </div>
    </>,
    [page?.title, dirty, saving, save, url],
  );

  if (!page) return <p className="muted">Loading…</p>;
  const current = page.sections.find((s) => s.id === active);
  const def = current && sectionDef(current.type);

  const move = (from: number, to: number) =>
    setSections((list) => {
      if (to < 0 || to >= list.length) return list;
      const n = [...list];
      const [x] = n.splice(from, 1);
      n.splice(to, 0, x);
      return n;
    });

  return (
    <div className="pb">
      <div className="a-grid">
        {current && def ? (
          <div className="a-card a-card-pad a-grid">
            <div className="a-row">
              <button className="a-btn sm" onClick={() => setActive(null)}>
                ← All sections
              </button>
              <span className="muted" style={{ marginLeft: 'auto' }}>
                {def.icon} {def.label}
              </span>
            </div>
            <p className="f-help" style={{ margin: 0 }}>
              {def.description}
            </p>
            <label className="f-switch">
              <input type="checkbox" checked={current.enabled} onChange={(e) => setSections((l) => l.map((s) => (s.id === current.id ? { ...s, enabled: e.target.checked } : s)))} />
              <span className="f-label">Visible on site</span>
            </label>
            <FieldRenderer fields={def.fields} value={current.data} onChange={(data) => setSections((l) => l.map((s) => (s.id === current.id ? { ...s, data } : s)))} />
          </div>
        ) : (
          <>
            <div className="a-card">
              <button className="a-row" style={{ width: '100%', padding: '14px 16px', background: 'none', border: 0, font: 'inherit' }} onClick={() => setShowMeta((m) => !m)}>
                <h3 style={{ flex: 1, textAlign: 'left' }}>Page settings & SEO</h3>
                <span className="muted">{showMeta ? '▴' : '▾'}</span>
              </button>
              {showMeta && (
                <div style={{ padding: '0 16px 16px' }}>
                  <FieldRenderer fields={PAGE_META_FIELDS} value={page} onChange={(v) => update(() => ({ ...(v as Page) }))} />
                  {page.id !== 'home' && (
                    <button
                      className="a-btn sm danger"
                      style={{ marginTop: 16 }}
                      onClick={async () => {
                        if (!confirm('Delete this page permanently?')) return;
                        await api(collectionUrl('pages', page.id), { method: 'DELETE' });
                        router.push('/admin/pages');
                      }}
                    >
                      Delete page
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="a-row">
              <h3 style={{ flex: 1 }}>Sections ({page.sections.length})</h3>
              <button className="a-btn sm primary" onClick={() => setAdding(page.sections.length)}>
                + Add section
              </button>
            </div>
            <div className="pb-sections">
              {page.sections.map((s, i) => {
                const d = sectionDef(s.type);
                return (
                  <div
                    key={s.id}
                    className="pb-sec"
                    data-disabled={!s.enabled}
                    data-drag={drag === i}
                    draggable
                    onDragStart={() => setDrag(i)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      if (drag !== null) move(drag, i);
                      setDrag(null);
                    }}
                    onDragEnd={() => setDrag(null)}
                  >
                    <span className="pb-handle" title="Drag to reorder">
                      ⋮⋮
                    </span>
                    <span className="ic">{d?.icon || '?'}</span>
                    <button className="meta" style={{ textAlign: 'left', background: 'none', border: 0, padding: 0, font: 'inherit' }} onClick={() => setActive(s.id)}>
                      <b>{d?.label || s.type}</b>
                      <span>{summary(s) || '—'}</span>
                    </button>
                    <button className="a-btn ghost sm icon" title={s.enabled ? 'Hide' : 'Show'} onClick={() => setSections((l) => l.map((x) => (x.id === s.id ? { ...x, enabled: !x.enabled } : x)))}>
                      {s.enabled ? '◉' : '○'}
                    </button>
                    <button className="a-btn ghost sm icon" title="Move up" onClick={() => move(i, i - 1)}>
                      ↑
                    </button>
                    <button className="a-btn ghost sm icon" title="Move down" onClick={() => move(i, i + 1)}>
                      ↓
                    </button>
                    <button className="a-btn ghost sm icon" title="Duplicate" onClick={() => setSections((l) => [...l.slice(0, i + 1), { ...structuredClone(s), id: sid() }, ...l.slice(i + 1)])}>
                      ⧉
                    </button>
                    <button
                      className="a-btn ghost sm icon danger"
                      title="Delete"
                      onClick={() => {
                        if (confirm('Remove this section?')) setSections((l) => l.filter((x) => x.id !== s.id));
                      }}
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
              {!page.sections.length && <p className="a-empty">This page is empty — add your first section.</p>}
            </div>
          </>
        )}
      </div>

      <div className="pb-preview" data-device={device}>
        <header>
          <span className="dots">
            <i />
            <i />
            <i />
          </span>
          <span className="muted" style={{ flex: 1, textAlign: 'center', fontSize: 12 }}>
            {url} {dirty && '· save to refresh preview'}
          </span>
          <button className={`a-btn sm ${device === 'desktop' ? 'primary' : 'ghost'}`} onClick={() => setDevice('desktop')}>
            Desktop
          </button>
          <button className={`a-btn sm ${device === 'mobile' ? 'primary' : 'ghost'}`} onClick={() => setDevice('mobile')}>
            Mobile
          </button>
          <button className="a-btn sm ghost icon" onClick={() => setFrameKey((k) => k + 1)} title="Reload">
            ↻
          </button>
        </header>
        <iframe ref={frame} key={frameKey + device} src={`${url}${active ? `#section-${active}` : ''}`} title="Live preview" />
      </div>

      {adding !== null && (
        <Modal title="Add a section" onClose={() => setAdding(null)}>
          <div className="pb-lib">
            {SECTION_DEFS.map((d) => (
              <button
                key={d.type}
                onClick={() => {
                  const s: Section = { id: sid(), type: d.type, enabled: true, data: { ...defaultsFor(d.fields), title: d.label } };
                  setSections((l) => [...l.slice(0, adding), s, ...l.slice(adding)]);
                  setAdding(null);
                  setActive(s.id);
                }}
              >
                <span className="ic">{d.icon}</span>
                <b>{d.label}</b>
                <span className="muted" style={{ fontSize: 12 }}>
                  {d.description}
                </span>
              </button>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}
