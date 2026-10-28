'use client';
// Renders any CMS schema (src/lib/fields.ts) as a form. Used by every editor in the admin.
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import type { Field } from '@/lib/fields';
import { defaultsFor } from '@/lib/fields';
import { MODEL_LIBRARY } from '@/lib/furniture/builders';
import { BODY_FONTS, DISPLAY_FONTS, MONO_FONTS } from '@/lib/schemas';
import { markdown } from '@/lib/utils';
import MediaPicker from './MediaPicker';
import { api, collectionUrl, upload } from './api';
import { useToast } from './Toasts';

const ModelPreview = dynamic(() => import('./ModelPreview'), { ssr: false });

type Value = Record<string, any>;

export default function FieldRenderer({ fields, value, onChange }: { fields: Field[]; value: Value; onChange: (v: Value) => void }) {
  const set = (name: string, v: unknown) => onChange({ ...value, [name]: v });
  return (
    <div className="f-grid">
      {fields.map((f) => (
        <div key={f.name} className={`f-field ${'half' in f && f.half ? 'half' : ''}`}>
          {f.type !== 'boolean' && (
            <label className="f-label" htmlFor={`f-${f.name}`}>
              {f.label}
            </label>
          )}
          <Input field={f} value={value?.[f.name]} onChange={(v) => set(f.name, v)} />
          {f.help && <span className="f-help">{f.help}</span>}
        </div>
      ))}
    </div>
  );
}

function Input({ field: f, value, onChange }: { field: Field; value: any; onChange: (v: any) => void }) {
  const id = `f-${f.name}`;
  switch (f.type) {
    case 'text':
    case 'url':
      return <input id={id} type="text" value={value ?? ''} placeholder={'placeholder' in f ? f.placeholder : undefined} onChange={(e) => onChange(e.target.value)} />;
    case 'date':
      return <input id={id} type="date" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />;
    case 'number':
      return <input id={id} type="number" value={value ?? 0} min={f.min} max={f.max} step={f.step ?? 'any'} onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))} />;
    case 'textarea':
      return <textarea id={id} rows={3} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />;
    case 'markdown':
      return <MarkdownInput id={id} value={value ?? ''} onChange={onChange} />;
    case 'boolean':
      return (
        <label className="f-switch">
          <input id={id} type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} />
          <span className="f-label">{f.label}</span>
        </label>
      );
    case 'color':
      return (
        <div className="f-color">
          <input type="color" value={/^#[0-9a-f]{6}$/i.test(value || '') ? value : '#000000'} onChange={(e) => onChange(e.target.value)} aria-label={f.label} />
          <input id={id} type="text" value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder="#000000" />
        </div>
      );
    case 'select':
      return (
        <select id={id} value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
          {f.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
    case 'ref':
      return <RefInput id={id} collection={f.collection} value={value ?? ''} onChange={onChange} />;
    case 'tags':
      return <TagsInput value={Array.isArray(value) ? value : []} onChange={onChange} />;
    case 'image':
      return <ImageInput value={value ?? ''} onChange={onChange} />;
    case 'images':
      return <ImagesInput value={Array.isArray(value) ? value : []} onChange={onChange} />;
    case 'file':
      return <FileInput value={value ?? ''} accept={f.accept} onChange={onChange} />;
    case 'model':
      return <ModelInput value={value ?? ''} onChange={onChange} />;
    case 'font':
      return <FontInput id={id} role={f.fontRole || 'body'} value={value ?? ''} onChange={onChange} />;
    case 'group':
      return (
        <div className="f-group">
          <FieldRenderer fields={f.fields} value={value || {}} onChange={onChange} />
        </div>
      );
    case 'list':
      return <ListInput field={f} value={Array.isArray(value) ? value : []} onChange={onChange} />;
  }
}

function MarkdownInput({ id, value, onChange }: { id: string; value: string; onChange: (v: string) => void }) {
  const [preview, setPreview] = useState(false);
  return (
    <div className="a-grid" style={{ gap: 6 }}>
      <div className="a-row">
        <button type="button" className={`a-btn sm ${!preview ? 'primary' : ''}`} onClick={() => setPreview(false)}>
          Write
        </button>
        <button type="button" className={`a-btn sm ${preview ? 'primary' : ''}`} onClick={() => setPreview(true)}>
          Preview
        </button>
        <span className="f-help" style={{ marginLeft: 'auto' }}>
          **bold** · *italic* · ## heading · - list · [link](/url)
        </span>
      </div>
      {preview ? (
        <div className="f-group" style={{ background: '#fff' }} dangerouslySetInnerHTML={{ __html: markdown(value) || '<p class="muted">Nothing yet</p>' }} />
      ) : (
        <textarea id={id} rows={8} value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}

const refCache = new Map<string, Promise<any[]>>();
function RefInput({ id, collection, value, onChange }: { id: string; collection: string; value: string; onChange: (v: string) => void }) {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    if (!refCache.has(collection)) refCache.set(collection, api<any[]>(collectionUrl(collection)));
    refCache.get(collection)!.then(setItems).catch(() => refCache.delete(collection));
  }, [collection]);
  return (
    <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">— None —</option>
      {items.map((it) => (
        <option key={it.id} value={it.slug ?? it.id}>
          {it.name ?? it.title ?? it.slug}
        </option>
      ))}
    </select>
  );
}

function TagsInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [draft, setDraft] = useState('');
  const add = () => {
    const t = draft.trim();
    if (t && !value.includes(t)) onChange([...value, t]);
    setDraft('');
  };
  return (
    <div className="f-tags">
      {value.map((t, i) => (
        <span key={t + i}>
          {t}
          <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label={`Remove ${t}`}>
            ✕
          </button>
        </span>
      ))}
      <input
        type="text"
        value={draft}
        placeholder="Type and press Enter"
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            add();
          } else if (e.key === 'Backspace' && !draft && value.length) onChange(value.slice(0, -1));
        }}
        onBlur={add}
      />
    </div>
  );
}

function ImageInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="f-img">
      <div className="f-thumb" style={value ? { backgroundImage: `url(${value})` } : undefined}>
        {!value && 'No image'}
      </div>
      <div className="a-grid" style={{ gap: 6, flex: 1 }}>
        <div className="a-row">
          <button type="button" className="a-btn sm" onClick={() => setOpen(true)}>
            {value ? 'Replace' : 'Choose image'}
          </button>
          {value && (
            <button type="button" className="a-btn sm ghost danger" onClick={() => onChange('')}>
              Remove
            </button>
          )}
        </div>
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder="/media/… or https://…" />
      </div>
      {open && (
        <MediaPicker
          onClose={() => setOpen(false)}
          onPick={([u]) => {
            onChange(u);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}

function ImagesInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [open, setOpen] = useState(false);
  const move = (i: number, d: number) => {
    const n = [...value];
    const j = i + d;
    if (j < 0 || j >= n.length) return;
    [n[i], n[j]] = [n[j], n[i]];
    onChange(n);
  };
  return (
    <div className="a-grid" style={{ gap: 8 }}>
      <div className="f-thumbs">
        {value.map((u, i) => (
          <div className="cell" key={u + i}>
            <div className="f-thumb" style={{ backgroundImage: `url(${u})` }} />
            <button type="button" className="x" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label="Remove">
              ✕
            </button>
            <div className="a-row" style={{ justifyContent: 'center', gap: 2 }}>
              <button type="button" className="a-btn ghost sm icon" onClick={() => move(i, -1)} aria-label="Move left">
                ←
              </button>
              <button type="button" className="a-btn ghost sm icon" onClick={() => move(i, 1)} aria-label="Move right">
                →
              </button>
            </div>
          </div>
        ))}
        <button type="button" className="f-thumb" onClick={() => setOpen(true)} style={{ borderStyle: 'dashed' }}>
          + Add
        </button>
      </div>
      {open && (
        <MediaPicker
          multiple
          onClose={() => setOpen(false)}
          onPick={(urls) => {
            onChange([...value, ...urls]);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}

function FileInput({ value, accept, onChange }: { value: string; accept?: string; onChange: (v: string) => void }) {
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  return (
    <div className="a-grid" style={{ gap: 6 }}>
      <div className="a-row">
        <label className="a-btn sm">
          {busy ? 'Uploading…' : value ? 'Replace file' : 'Upload file'}
          <input
            type="file"
            hidden
            accept={accept}
            onChange={async (e) => {
              if (!e.target.files?.length) return;
              setBusy(true);
              try {
                const [m] = await upload(e.target.files);
                onChange(m.url);
                toast('File uploaded');
              } catch (err) {
                toast((err as Error).message, true);
              } finally {
                setBusy(false);
              }
            }}
          />
        </label>
        {value && (
          <button type="button" className="a-btn sm ghost danger" onClick={() => onChange('')}>
            Remove
          </button>
        )}
      </div>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder="No file" />
    </div>
  );
}

function ModelInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const isUrl = value.startsWith('/') || value.startsWith('http');
  return (
    <div className="a-grid" style={{ gap: 6 }}>
      <select value={isUrl ? '__custom' : value} onChange={(e) => onChange(e.target.value === '__custom' ? '/media/' : e.target.value)}>
        <option value="">— Choose —</option>
        {MODEL_LIBRARY.map((m) => (
          <option key={m.key} value={m.key}>
            {m.label}
          </option>
        ))}
        <option value="__custom">Custom uploaded .glb…</option>
      </select>
      {isUrl && <FileInput value={value === '/media/' ? '' : value} accept=".glb,.gltf" onChange={(v) => onChange(v || 'lune-chair')} />}
      {value && value !== '/media/' && (
        <div className="model-pv" style={{ height: 180 }}>
          <ModelPreview value={value} />
        </div>
      )}
    </div>
  );
}

function FontInput({ id, role, value, onChange }: { id: string; role: 'display' | 'body' | 'mono'; value: string; onChange: (v: string) => void }) {
  const list = role === 'display' ? DISPLAY_FONTS : role === 'mono' ? MONO_FONTS : BODY_FONTS;
  useEffect(() => {
    if (!value) return;
    const href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(value).replace(/%20/g, '+')}&display=swap`;
    if (!document.querySelector(`link[href="${href}"]`)) {
      const l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = href;
      document.head.appendChild(l);
    }
  }, [value]);
  return (
    <div>
      <input id={id} type="text" list={`${id}-list`} value={value} onChange={(e) => onChange(e.target.value)} placeholder="Google Font name" />
      <datalist id={`${id}-list`}>
        {list.map((f) => (
          <option key={f} value={f} />
        ))}
      </datalist>
      <div className="f-font-preview" style={{ fontFamily: `'${value}'` }}>
        {role === 'mono' ? 'N° 01 — LABEL 0123' : 'Furniture that holds the light'}
      </div>
    </div>
  );
}

function ListInput({ field, value, onChange }: { field: Extract<Field, { type: 'list' }>; value: any[]; onChange: (v: any[]) => void }) {
  const [open, setOpen] = useState<number | null>(value.length ? null : null);
  const move = (i: number, d: number) => {
    const n = [...value];
    const j = i + d;
    if (j < 0 || j >= n.length) return;
    [n[i], n[j]] = [n[j], n[i]];
    onChange(n);
    setOpen(open === i ? j : open);
  };
  const title = (it: any, i: number) => {
    const k = field.itemLabel || field.fields[0]?.name;
    const t = k ? it?.[k] : '';
    return t ? String(t) : `Item ${i + 1}`;
  };
  return (
    <div className="f-list">
      {value.map((it, i) => (
        <div className="f-item" key={i}>
          <header>
            {it?.color && <i style={{ width: 14, height: 14, borderRadius: 4, background: it.color, flexShrink: 0 }} />}
            <button type="button" className="t" style={{ textAlign: 'left', background: 'none', border: 0, padding: 0, font: 'inherit' }} onClick={() => setOpen(open === i ? null : i)}>
              {title(it, i)}
            </button>
            <button type="button" className="a-btn ghost sm icon" onClick={() => move(i, -1)} aria-label="Move up">
              ↑
            </button>
            <button type="button" className="a-btn ghost sm icon" onClick={() => move(i, 1)} aria-label="Move down">
              ↓
            </button>
            <button type="button" className="a-btn ghost sm icon" onClick={() => setOpen(open === i ? null : i)} aria-label="Edit">
              {open === i ? '▴' : '▾'}
            </button>
            <button type="button" className="a-btn ghost sm icon danger" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label="Remove">
              ✕
            </button>
          </header>
          {open === i && (
            <div className="body">
              <FieldRenderer fields={field.fields} value={it || {}} onChange={(v) => onChange(value.map((x, j) => (j === i ? v : x)))} />
            </div>
          )}
        </div>
      ))}
      <div>
        <button
          type="button"
          className="a-btn sm"
          onClick={() => {
            onChange([...value, defaultsFor(field.fields)]);
            setOpen(value.length);
          }}
        >
          + Add {field.label.toLowerCase().replace(/s$/, '')}
        </button>
      </div>
    </div>
  );
}
