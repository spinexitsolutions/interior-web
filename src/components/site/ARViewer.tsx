'use client';
import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import type { Variant } from '@/lib/types';
import s from './ARViewer.module.css';

const MV_SRC = 'https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js';

function loadModelViewer() {
  if (typeof window === 'undefined' || customElements.get('model-viewer')) return Promise.resolve();
  const existing = document.querySelector<HTMLScriptElement>(`script[src="${MV_SRC}"]`);
  if (existing) return customElements.whenDefined('model-viewer').then(() => undefined);
  return new Promise<void>((resolve, reject) => {
    const el = document.createElement('script');
    el.type = 'module';
    el.src = MV_SRC;
    el.onload = () => customElements.whenDefined('model-viewer').then(() => resolve());
    el.onerror = reject;
    document.head.appendChild(el);
  });
}

export interface ARProduct {
  slug: string;
  name: string;
  model: string;
  modelUrl: string;
  usdzUrl: string;
  variants: Variant[];
  dimensions?: { w: number; d: number; h: number };
}

/** Full-screen AR launcher built on <model-viewer>: WebXR / Scene Viewer (Android) / Quick Look (iOS). */
export default function ARViewer({ product, variant, open, onClose }: { product: ARProduct; variant?: Variant; open: boolean; onClose: () => void }) {
  const mv = useRef<HTMLElement & Record<string, any>>(null);
  const [ready, setReady] = useState(false);
  const [canAR, setCanAR] = useState<boolean | null>(null);
  const [qr, setQr] = useState('');
  const [current, setCurrent] = useState<Variant | undefined>(variant);

  useEffect(() => setCurrent(variant), [variant]);

  useEffect(() => {
    if (!open) return;
    loadModelViewer().then(() => setReady(true)).catch(() => setReady(false));
    const url = new URL(window.location.href);
    url.searchParams.set('ar', '1');
    QRCode.toDataURL(url.toString(), { margin: 1, width: 360, color: { dark: '#16140f', light: '#00000000' } }).then(setQr);
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', esc);
    document.documentElement.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', esc);
      document.documentElement.style.overflow = '';
    };
  }, [open, onClose]);

  // recolour the glTF material that matches the variant slot
  useEffect(() => {
    const el = mv.current;
    if (!el || !ready) return;
    const apply = () => {
      setCanAR(!!el.canActivateAR);
      if (!current || !el.model) return;
      const mat = el.model.materials.find((m: any) => (m.name || '').toLowerCase() === current.slot);
      if (!mat) return;
      const c = current.color.replace('#', '');
      const rgb = [0, 2, 4].map((i) => Math.pow(parseInt(c.slice(i, i + 2), 16) / 255, 2.2));
      mat.pbrMetallicRoughness.setBaseColorFactor([...rgb, 1]);
    };
    el.addEventListener('load', apply);
    if (el.loaded) apply();
    return () => el.removeEventListener('load', apply);
  }, [ready, current, open]);

  if (!open) return null;
  const glb = product.modelUrl || `/models/${product.model}.glb`;
  const defaultVariant = product.variants[0];
  // a recoloured model must be exported on the fly for iOS, so only pass the static USDZ for the default look
  const useStaticUsdz = !current || current === defaultVariant;
  const usdz = useStaticUsdz ? product.usdzUrl || (product.modelUrl ? '' : `/models/${product.model}.usdz`) : '';

  return (
    <div className={s.backdrop} role="dialog" aria-modal="true" aria-label={`${product.name} in augmented reality`}>
      <div className={s.panel}>
        <header className={s.head}>
          <div>
            <p className="label muted">Augmented reality</p>
            <h2 className="display d-m">{product.name}</h2>
          </div>
          <button className={s.close} onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>
        <div className={s.body}>
          <div className={s.stage}>
            {ready ? (
              <model-viewer
                ref={mv}
                key={glb + usdz}
                src={glb}
                {...(usdz ? { 'ios-src': usdz } : {})}
                alt={product.name}
                ar=""
                ar-modes="webxr scene-viewer quick-look"
                ar-scale="fixed"
                ar-placement="floor"
                camera-controls=""
                auto-rotate=""
                shadow-intensity="1"
                exposure="1.05"
                environment-image="neutral"
                touch-action="pan-y"
                style={{ width: '100%', height: '100%', background: 'transparent' }}
              >
                <button slot="ar-button" className={`btn ${s.arBtn}`}>
                  Place in my room <span className="arrow">→</span>
                </button>
              </model-viewer>
            ) : (
              <div className={s.loading}>Loading 3D…</div>
            )}
          </div>
          <aside className={s.side}>
            {product.variants.length > 0 && (
              <div>
                <p className="label muted">Finish</p>
                <div className={s.swatches}>
                  {product.variants.map((v) => (
                    <button key={v.name} className={s.swatch} data-active={current?.name === v.name} onClick={() => setCurrent(v)} title={v.name}>
                      <i style={{ background: v.color }} />
                      <span>{v.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {canAR === false && qr && (
              <div className={s.qr}>
                <img src={qr} alt="QR code to open this product on your phone" />
                <p>
                  <strong>Scan with your phone</strong>
                  <br />
                  <span className="muted">Opens this piece in AR on iPhone or Android — no app needed.</span>
                </p>
              </div>
            )}
            {canAR && <p className="muted">Tap “Place in my room”, point your camera at the floor and move slowly until the piece appears.</p>}
            {product.dimensions && (
              <p className="label muted">
                True scale · W {product.dimensions.w} × D {product.dimensions.d} × H {product.dimensions.h} cm
              </p>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
