'use client';
import { useEffect, useRef, useState } from 'react';
import Modal from './Modal';
import { api, upload } from './api';
import { useToast } from './Toasts';
import type { Media } from '@/lib/types';

const isImage = (m: { mime?: string; url: string }) => (m.mime ? m.mime.startsWith('image/') : /\.(jpe?g|png|webp|gif|avif)$/i.test(m.url));

export function UploadDrop({ accept, multiple = true, onUploaded, label = 'Drop files here or click to upload' }: { accept?: string; multiple?: boolean; onUploaded: (m: Media[]) => void; label?: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  async function go(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    try {
      const res = (await upload(files)) as unknown as Media[];
      onUploaded(res);
      toast(`Uploaded ${res.length} file${res.length > 1 ? 's' : ''}`);
    } catch (e) {
      toast((e as Error).message, true);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div
      className="a-drop"
      data-over={over}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        go(e.dataTransfer.files);
      }}
      onClick={() => input.current?.click()}
      role="button"
      tabIndex={0}
    >
      {busy ? 'Uploading…' : label}
      <input ref={input} type="file" hidden accept={accept} multiple={multiple} onChange={(e) => go(e.target.files)} />
    </div>
  );
}

/** Library modal: pick an existing file or upload a new one. */
export default function MediaPicker({ onPick, onClose, accept = 'image/*', multiple = false }: { onPick: (urls: string[]) => void; onClose: () => void; accept?: string; multiple?: boolean }) {
  const [media, setMedia] = useState<Media[]>([]);
  const [sel, setSel] = useState<string[]>([]);
  const [q, setQ] = useState('');
  const images = accept.startsWith('image');
  useEffect(() => {
    api<Media[]>('/api/admin/collections/media').then(setMedia);
  }, []);
  const list = media.filter((m) => (images ? isImage(m) : true) && m.filename.toLowerCase().includes(q.toLowerCase()));
  const toggle = (url: string) => {
    if (!multiple) return onPick([url]);
    setSel((s) => (s.includes(url) ? s.filter((x) => x !== url) : [...s, url]));
  };
  return (
    <Modal
      title="Media library"
      onClose={onClose}
      actions={
        multiple ? (
          <button className="a-btn primary" disabled={!sel.length} onClick={() => onPick(sel)}>
            Insert {sel.length || ''}
          </button>
        ) : null
      }
    >
      <div className="a-grid">
        <UploadDrop accept={accept} multiple={multiple} onUploaded={(m) => (multiple ? (setMedia((x) => [...m, ...x]), setSel((s) => [...s, ...m.map((x) => x.url)])) : onPick([m[0].url]))} />
        <input type="search" placeholder="Search files…" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="a-media-grid">
          {list.map((m) => (
            <button key={m.id} className="a-media-cell" onClick={() => toggle(m.url)} style={sel.includes(m.url) ? { borderColor: 'var(--a-accent)', boxShadow: '0 0 0 3px var(--a-accent-soft)' } : undefined}>
              <div className="pv" style={isImage(m) ? { backgroundImage: `url(${m.url})` } : undefined}>
                {!isImage(m) && '◇'}
              </div>
              <div className="nm">{m.filename}</div>
            </button>
          ))}
        </div>
        {!list.length && <p className="a-empty">No files yet — upload something above.</p>}
      </div>
    </Modal>
  );
}
