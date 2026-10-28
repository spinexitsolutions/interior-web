'use client';
import { useEffect, useState } from 'react';
import { useTopbar } from '@/components/admin/Shell';
import { UploadDrop } from '@/components/admin/MediaPicker';
import { api, collectionUrl } from '@/components/admin/api';
import { useToast } from '@/components/admin/Toasts';
import type { Media } from '@/lib/types';

const isImage = (m: Media) => (m.mime || '').startsWith('image/');

export default function MediaLibrary() {
  const [media, setMedia] = useState<Media[]>([]);
  const [sel, setSel] = useState<Media | null>(null);
  const toast = useToast();
  useEffect(() => {
    api<Media[]>(collectionUrl('media')).then(setMedia);
  }, []);
  useTopbar(<h2>Media library</h2>, []);
  return (
    <div className="ed">
      <div className="a-grid">
        <UploadDrop accept="image/*,.glb,.gltf,.usdz,.mp4,.webm,.pdf" onUploaded={(m) => setMedia((x) => [...m, ...x])} label="Drop images, 3D models (.glb / .usdz), videos or PDFs — or click to upload" />
        <div className="a-media-grid">
          {media.map((m) => (
            <button key={m.id} className="a-media-cell" onClick={() => setSel(m)} style={sel?.id === m.id ? { borderColor: 'var(--a-accent)' } : undefined}>
              <div className="pv" style={isImage(m) ? { backgroundImage: `url(${m.url})` } : undefined}>
                {!isImage(m) && (m.mime.startsWith('model') ? '◐' : '◇')}
              </div>
              <div className="nm">{m.filename}</div>
            </button>
          ))}
        </div>
        {!media.length && <p className="a-empty">No files yet.</p>}
      </div>
      <div className="ed-side">
        {sel ? (
          <div className="a-card a-card-pad a-grid">
            {isImage(sel) && <img src={sel.url} alt="" style={{ width: '100%', borderRadius: 10 }} />}
            <div>
              <b style={{ wordBreak: 'break-all' }}>{sel.filename}</b>
              <div className="muted">
                {sel.mime} · {(sel.size / 1024).toFixed(0)} kB
              </div>
            </div>
            <label className="f-field">
              <span className="f-label">URL</span>
              <input type="text" readOnly value={sel.url} onFocus={(e) => e.target.select()} />
            </label>
            <div className="a-row">
              <button
                className="a-btn sm"
                onClick={() => {
                  navigator.clipboard.writeText(sel.url);
                  toast('URL copied');
                }}
              >
                Copy URL
              </button>
              <button
                className="a-btn sm danger"
                onClick={async () => {
                  if (!confirm('Remove from library? (Pages still using it will show a broken image.)')) return;
                  await api(collectionUrl('media', sel.id), { method: 'DELETE' });
                  setMedia((l) => l.filter((x) => x.id !== sel.id));
                  setSel(null);
                }}
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="a-card a-card-pad muted">Select a file to see its details.</div>
        )}
      </div>
    </div>
  );
}
