'use client';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useTopbar } from '@/components/admin/Shell';
import FieldRenderer from '@/components/admin/FieldRenderer';
import { api, collectionUrl } from '@/components/admin/api';
import { useToast } from '@/components/admin/Toasts';
import { collectionDef } from '@/lib/schemas';
import { defaultsFor } from '@/lib/fields';

const ModelPreview = dynamic(() => import('@/components/admin/ModelPreview'), { ssr: false });

export default function ItemEditor() {
  const { key, id } = useParams<{ key: string; id: string }>();
  const def = collectionDef(key)!;
  const isNew = id === 'new';
  const router = useRouter();
  const toast = useToast();
  const [item, setItem] = useState<any>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [variant, setVariant] = useState(0);

  useEffect(() => {
    if (!def) return;
    if (isNew) {
      const base = defaultsFor(def.fields);
      if ('status' in base) base.status = 'draft';
      if (key === 'products') Object.assign(base, { model: 'lune-chair', arEnabled: true, dimensions: { w: 80, d: 80, h: 80 } });
      if (key === 'posts') base.date = new Date().toISOString().slice(0, 10);
      setItem(base);
    } else api(collectionUrl(key, id)).then(setItem).catch((e) => toast(e.message, true));
  }, [key, id, isNew, def, toast]);

  const save = useCallback(async () => {
    setSaving(true);
    try {
      const saved = await api(isNew ? collectionUrl(key) : collectionUrl(key, id), { method: isNew ? 'POST' : 'PUT', json: item });
      setItem(saved);
      setDirty(false);
      toast(`${def.singular} saved`);
      if (isNew) router.replace(`/admin/c/${key}/${saved.id}`);
    } catch (e) {
      toast((e as Error).message, true);
    } finally {
      setSaving(false);
    }
  }, [isNew, key, id, item, def, router, toast]);

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

  const title = item?.[def?.titleField] || (isNew ? `New ${def?.singular.toLowerCase()}` : '');
  useTopbar(
    <>
      <div className="crumbs">
        <Link href={`/admin/c/${key}`}>{def?.label}</Link> <span>/</span> <b style={{ color: 'var(--a-ink)' }}>{title}</b>
        {dirty && <span className="a-pill warn">Unsaved</span>}
      </div>
      <div className="actions">
        {!isNew && def?.publicPath && item?.slug && (
          <a className="a-btn ghost" href={def.publicPath(item)} target="_blank">
            View ↗
          </a>
        )}
        <button className="a-btn primary" onClick={save} disabled={saving || (!dirty && !isNew)}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </>,
    [title, dirty, saving, save, item?.slug],
  );

  if (!def) return <p>Unknown collection.</p>;
  if (!item) return <p className="muted">Loading…</p>;
  const v = item.variants?.[variant];

  return (
    <div className="ed">
      <div className="a-card a-card-pad">
        <FieldRenderer
          fields={def.fields}
          value={item}
          onChange={(next) => {
            setItem(next);
            setDirty(true);
          }}
        />
      </div>
      <div className="ed-side">
        {key === 'products' && (
          <div className="a-card a-card-pad a-grid">
            <h3>3D preview</h3>
            <div className="model-pv">
              <ModelPreview value={item.model} modelUrl={item.modelUrl || undefined} palette={v ? { [v.slot]: v.color } : {}} />
            </div>
            {item.variants?.length > 0 && (
              <div className="a-row" style={{ flexWrap: 'wrap' }}>
                {item.variants.map((x: any, i: number) => (
                  <button key={i} className={`a-btn sm ${i === variant ? 'primary' : ''}`} onClick={() => setVariant(i)}>
                    <i style={{ width: 10, height: 10, borderRadius: 3, background: x.color }} /> {x.name}
                  </button>
                ))}
              </div>
            )}
            <p className="f-help" style={{ margin: 0 }}>
              This exact model is used for the 3D viewer, the VR showroom and AR (“view in your room”).
            </p>
          </div>
        )}
        <div className="a-card a-card-pad a-grid" style={{ gap: 8 }}>
          <h3>Publishing</h3>
          <p className="f-help" style={{ margin: 0 }}>
            Changes are live the moment you save. Set status to <b>draft</b> to hide an item from the website.
          </p>
          {!isNew && (
            <button
              className="a-btn danger"
              onClick={async () => {
                if (!confirm('Delete permanently?')) return;
                await api(collectionUrl(key, id), { method: 'DELETE' });
                router.push(`/admin/c/${key}`);
              }}
            >
              Delete {def.singular.toLowerCase()}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
