'use client';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import type { Product } from '@/lib/types';
import ProductCard from './ProductCard';
import RichTitle from '../site/RichTitle';
import s from './Interactive.module.css';

/** Vertical scroll drives a horizontal rail (sticky track, translated by scroll progress). */
export default function CollectionRail({ data, products, currency, showPrice }: { data: Record<string, any>; products: Product[]; currency: string; showPrice: boolean }) {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const sec = section.current!;
    const tr = track.current!;
    const size = () => {
      const dist = Math.max(0, tr.scrollWidth - window.innerWidth);
      sec.style.height = `${window.innerHeight + dist}px`;
      return dist;
    };
    let dist = size();
    let raf = 0;
    let x = 0;
    const tick = () => {
      const r = sec.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - window.innerHeight)));
      x += (-p * dist - x) * 0.12;
      tr.style.transform = `translate3d(${x}px,0,0)`;
      tr.style.setProperty('--skew', `${Math.max(-6, Math.min(6, (-p * dist - x) * 0.02))}deg`);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const onResize = () => (dist = size());
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, [products.length]);

  return (
    <section ref={section} className={`tone-${data.tone || 'light'} ${s.rail}`}>
      <div className={s.railSticky}>
        <div ref={track} className={s.railTrack}>
          <div className={s.railIntro}>
            <p className="label muted">{data.eyebrow}</p>
            <RichTitle text={data.title} className="d-xl" />
            {data.link?.label && (
              <Link href={data.link.href} className="btn">
                {data.link.label} <span className="arrow">→</span>
              </Link>
            )}
            <p className="label muted">Scroll ⟶</p>
          </div>
          {products.map((p, i) => (
            <div key={p.id} className={s.railItem} style={{ marginTop: i % 2 ? '8vh' : 0 }}>
              <ProductCard p={p} i={i} currency={currency} showPrice={showPrice} />
            </div>
          ))}
          <Link href={data.link?.href || '/collection'} className={s.railEnd} data-cursor="All pieces">
            <span className="display d-l">
              See <em>every</em>
              <br />
              piece →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
