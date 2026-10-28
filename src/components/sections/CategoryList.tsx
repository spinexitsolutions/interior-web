'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import type { Category } from '@/lib/types';
import RichTitle from '../site/RichTitle';
import s from './Interactive.module.css';

/** Huge typographic list; hovering a row floats its image after the cursor. */
export default function CategoryList({ data, categories, counts }: { data: Record<string, any>; categories: Category[]; counts: Record<string, number> }) {
  const float = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  useEffect(() => {
    const el = float.current!;
    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3' });
    const move = (e: PointerEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
    };
    window.addEventListener('pointermove', move);
    return () => window.removeEventListener('pointermove', move);
  }, []);
  return (
    <section className={`section tone-${data.tone || 'light'}`}>
      <div className="wrap">
        <div className="sec-head">
          <p className="label muted">{data.eyebrow}</p>
          <RichTitle text={data.title} className="d-l" />
        </div>
        <ul className={s.catList} onPointerLeave={() => setHover(null)}>
          {categories.map((c, i) => (
            <li key={c.id} onPointerEnter={() => setHover(i)}>
              <Link href={`/collection?category=${c.slug}`} className={s.catRow} data-dim={hover !== null && hover !== i}>
                <span className="label muted">0{i + 1}</span>
                <span className={`display ${s.catName}`}>{c.name}</span>
                <span className={`muted ${s.catDesc}`}>{c.description}</span>
                <span className="label">({counts[c.slug] || 0})</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div ref={float} className={s.catFloat} data-show={hover !== null} aria-hidden>
        {categories.map((c, i) => (
          <img key={c.id} src={c.image} alt="" data-active={hover === i} />
        ))}
      </div>
    </section>
  );
}
