'use client';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { formatPrice } from '@/lib/utils';
import type { ShowroomItem } from '../three/Showroom';
import s from './ShowroomExperience.module.css';

const Experience = dynamic(() => import('./ShowroomStage'), { ssr: false, loading: () => <div className={s.loading}>Building the room…</div> });

type Item = ShowroomItem & { tagline: string; price: number; image: string };

export default function ShowroomExperience({ items, focus, currency, showPrice }: { items: Item[]; focus?: string; currency: string; showPrice: boolean }) {
  const [selected, setSelected] = useState<string | undefined>(focus);
  const [support, setSupport] = useState<{ vr: boolean; ar: boolean }>({ vr: false, ar: false });
  const [dark, setDark] = useState(false);
  const [help, setHelp] = useState(true);
  useEffect(() => {
    const xr = (navigator as Navigator & { xr?: { isSessionSupported: (m: string) => Promise<boolean> } }).xr;
    if (!xr) return;
    Promise.all([xr.isSessionSupported('immersive-vr').catch(() => false), xr.isSessionSupported('immersive-ar').catch(() => false)]).then(([vr, ar]) => setSupport({ vr, ar }));
  }, []);
  useEffect(() => {
    document.documentElement.style.overflow = 'hidden';
    window.__lenis?.stop();
    return () => {
      document.documentElement.style.overflow = '';
      window.__lenis?.start();
    };
  }, []);
  const current = items.find((i) => i.slug === selected);
  return (
    <section className={s.root} data-dark={dark}>
      <Experience items={items} selected={selected} onSelect={setSelected} dark={dark} />

      <div className={s.top}>
        <div>
          <p className="label">Virtual showroom</p>
          <h1 className="display d-m">
            Kala Ghoda, <em>in VR</em>
          </h1>
        </div>
        <div className={s.toggles}>
          <button className={s.chip} onClick={() => setDark((d) => !d)}>
            {dark ? '☀ Day' : '☾ Evening'}
          </button>
          <button className={s.chip} onClick={() => setHelp((h) => !h)}>
            ? Controls
          </button>
        </div>
      </div>

      {help && (
        <div className={s.help}>
          <p className="label">How to explore</p>
          <ul>
            <li>
              <b>Drag</b> to look around · <b>scroll</b> to zoom
            </li>
            <li>
              <b>Double-click</b> the floor to walk there
            </li>
            <li>
              <b>Click</b> a piece for details
            </li>
            <li>
              In a headset: <b>point &amp; release</b> the thumbstick to teleport, or push it to glide
            </li>
          </ul>
        </div>
      )}

      <div className={s.xr}>
        <button className="btn" onClick={() => window.__formaXR?.enterVR()} disabled={!support.vr} title={support.vr ? '' : 'Open this page in a VR headset browser (Quest, Vision Pro)'}>
          ◰ Enter VR {!support.vr && <span className={s.na}>headset needed</span>}
        </button>
        <button className="btn btn-ghost" onClick={() => window.__formaXR?.enterAR()} disabled={!support.ar} title={support.ar ? '' : 'Requires a WebXR AR capable device'}>
          ⌖ Mixed reality {!support.ar && <span className={s.na}>n/a</span>}
        </button>
      </div>

      <nav className={s.list} aria-label="Pieces in the room">
        {items.map((it) => (
          <button key={it.slug} data-active={selected === it.slug} onClick={() => setSelected(it.slug === selected ? undefined : it.slug)}>
            <i style={{ background: it.color }} />
            {it.name}
          </button>
        ))}
      </nav>

      {current && (
        <aside className={s.card}>
          <button className={s.close} onClick={() => setSelected(undefined)} aria-label="Close">
            ✕
          </button>
          {current.image && <img src={current.image} alt="" />}
          <p className="label muted">In the room</p>
          <h2 className="display d-m">{current.name}</h2>
          <p className="muted">{current.tagline}</p>
          {showPrice && <p className="label">{formatPrice(current.price, currency)}</p>}
          <Link href={`/collection/${current.slug}`} className="btn">
            View details & AR <span className="arrow">→</span>
          </Link>
        </aside>
      )}
    </section>
  );
}
