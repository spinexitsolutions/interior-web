'use client';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useState } from 'react';
import RichTitle from '../site/RichTitle';
import { resolveModel } from '@/lib/models';
import s from './Interactive.module.css';

const OrbitScene = dynamic(() => import('../three/Scenes').then((m) => m.OrbitScene), { ssr: false });

export default function Configurator({ data, product }: { data: Record<string, any>; product?: { slug: string; name: string; model: string; modelUrl: string } }) {
  const swatches: { name: string; color: string }[] = data.swatches?.length ? data.swatches : [{ name: 'Default', color: '#c9b79c' }];
  const [active, setActive] = useState(0);
  const src = product ? { model: product.model, modelUrl: product.modelUrl } : resolveModel(data.model);
  const slot = data.slot || 'upholstery';
  return (
    <section className={`section tone-${data.tone || 'surface'} ${s.config}`}>
      <div className={`wrap ${s.configGrid}`}>
        <div className={s.configCopy}>
          <p className="label muted">{data.eyebrow}</p>
          <RichTitle text={data.title} className="d-l" />
          <p className="lead muted">{data.text}</p>
          <div className={s.swatchList} role="radiogroup" aria-label="Finish">
            {swatches.map((sw, i) => (
              <button key={sw.name + i} role="radio" aria-checked={i === active} className={s.swatchBtn} data-active={i === active} onClick={() => setActive(i)}>
                <i style={{ background: sw.color }} />
                <span>{sw.name}</span>
              </button>
            ))}
          </div>
          {product && (
            <Link href={`/collection/${product.slug}`} className="btn">
              Configure the {product.name} <span className="arrow">→</span>
            </Link>
          )}
        </div>
        <div className={s.configStage} data-cursor="Drag to rotate">
          <span className={`display ${s.configBg}`} aria-hidden>
            {swatches[active]?.name}
          </span>
          <OrbitScene {...src} palette={{ [slot]: swatches[active]?.color }} size={2.2} camera={[3.2, 1.9, 4.6]} />
          <span className={`label ${s.configHint}`}>⟲ Drag to rotate</span>
        </div>
      </div>
    </section>
  );
}
