'use client';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Product } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import s from './ProductView.module.css';

const OrbitScene = dynamic(() => import('../three/Scenes').then((m) => m.OrbitScene), { ssr: false, loading: () => <div className={s.loading}>Loading 3D…</div> });
const ARViewer = dynamic(() => import('./ARViewer'), { ssr: false });

export default function ProductView({ product: p, currency, showPrice, descriptionHtml, categoryName }: { product: Product; currency: string; showPrice: boolean; descriptionHtml: string; categoryName: string }) {
  const [variant, setVariant] = useState(p.variants[0]);
  const [mode, setMode] = useState<'3d' | 'photos'>('3d');
  const [ar, setAr] = useState(false);
  const [dims, setDims] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(location.search).get('ar') === '1') setAr(true);
  }, []);

  const palette = variant ? { [variant.slot]: variant.color } : {};
  return (
    <section className={`tone-light ${s.wrap}`}>
      <div className={s.stage}>
        <div className={s.stageTop}>
          <Link href="/collection" className="label link-u">
            ← Collection
          </Link>
          <span className="label muted">{categoryName}</span>
        </div>
        {mode === '3d' ? (
          <div className={s.canvas} data-cursor="Drag · Zoom">
            <OrbitScene model={p.model} modelUrl={p.modelUrl} palette={palette} size={2.1} zoom effects autoRotate={false} camera={[3, 1.9, 4.4]} />
            {dims && (
              <div className={s.dims} aria-label="Dimensions">
                <span className="label">W {p.dimensions.w} cm</span>
                <span className="label">D {p.dimensions.d} cm</span>
                <span className="label">H {p.dimensions.h} cm</span>
              </div>
            )}
          </div>
        ) : (
          <div className={s.photos}>
            {p.images.map((src, i) => (
              <img key={i} src={src} alt={`${p.name} ${i + 1}`} />
            ))}
          </div>
        )}
        <div className={s.toolbar}>
          <div className={s.seg} role="tablist">
            <button role="tab" aria-selected={mode === '3d'} onClick={() => setMode('3d')}>
              3D
            </button>
            <button role="tab" aria-selected={mode === 'photos'} onClick={() => setMode('photos')} disabled={!p.images.length}>
              Photos
            </button>
          </div>
          {mode === '3d' && (
            <button className={s.tool} onClick={() => setDims((d) => !d)} aria-pressed={dims}>
              ⇲ Dimensions
            </button>
          )}
          {p.arEnabled && (
            <button className={`btn ${s.arBtn}`} onClick={() => setAr(true)} data-cursor="AR">
              ⌖ View in your room
            </button>
          )}
          <Link href={`/showroom?focus=${p.slug}`} className={`btn btn-ghost ${s.vrBtn}`}>
            ◰ Walk around in VR
          </Link>
        </div>
      </div>

      <aside className={s.info}>
        <div className={s.infoInner}>
          <p className="label muted">{p.designer ? `Designed by ${p.designer}` : categoryName}</p>
          <h1 className="display d-l">{p.name}</h1>
          <p className="lead muted">{p.tagline}</p>
          {showPrice && <p className={`display ${s.price}`}>{formatPrice(p.price, currency)}</p>}

          {p.variants.length > 0 && (
            <div className={s.variants}>
              <p className="label">
                Finish — <span className="muted">{variant?.name}</span>
              </p>
              <div className={s.swatches}>
                {p.variants.map((v) => (
                  <button key={v.name} className={s.swatch} data-active={variant?.name === v.name} onClick={() => setVariant(v)} title={v.name} aria-label={v.name}>
                    <i style={{ background: v.color }} />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className={s.actions}>
            <Link href={`/contact?product=${p.slug}`} className="btn">
              Enquire about this piece <span className="arrow">→</span>
            </Link>
          </div>

          <div className="prose" dangerouslySetInnerHTML={{ __html: descriptionHtml }} />

          <dl className={s.specs}>
            <dt className="label muted">Dimensions</dt>
            <dd>
              W {p.dimensions.w} × D {p.dimensions.d} × H {p.dimensions.h} cm
            </dd>
            {p.materials.length > 0 && (
              <>
                <dt className="label muted">Materials</dt>
                <dd>{p.materials.join(', ')}</dd>
              </>
            )}
            {p.leadTime && (
              <>
                <dt className="label muted">Lead time</dt>
                <dd>{p.leadTime}</dd>
              </>
            )}
            {p.designer && (
              <>
                <dt className="label muted">Designer</dt>
                <dd>{p.designer}</dd>
              </>
            )}
          </dl>
        </div>
      </aside>
      {p.arEnabled && <ARViewer product={p} variant={variant} open={ar} onClose={() => setAr(false)} />}
    </section>
  );
}
