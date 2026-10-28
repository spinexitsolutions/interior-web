'use client';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRef } from 'react';
import { useScrollProgress, usePointer } from '../three/useProgress';
import { emphasis } from '../site/RichTitle';
import { resolveModel } from '@/lib/models';
import s from './Hero3D.module.css';

const HeroScene = dynamic(() => import('../three/Scenes').then((m) => m.HeroScene), { ssr: false });

export default function Hero3D({ data }: { data: Record<string, any> }) {
  const ref = useRef<HTMLElement>(null);
  const progress = useScrollProgress(ref, 'through');
  const pointer = usePointer();
  const lines: string[] = (data.title || '').split('\n');
  return (
    <section ref={ref} className={`tone-${data.tone || 'light'} ${s.hero}`}>
      <div className={s.sticky}>
        <div className={s.canvas} data-cursor="Drag · Scroll">
          <HeroScene {...resolveModel(data.model)} palette={data.modelColor ? { upholstery: data.modelColor } : {}} progress={progress} pointer={pointer} />
        </div>
        <div className={`wrap ${s.inner}`}>
          <p className={`label ${s.eyebrow}`}>
            <i /> {data.eyebrow}
          </p>
          <h1 className={`display d-xxl ${s.title}`} data-reveal="lines">
            {lines.map((l, i) => (
              <span className="reveal-line" key={i} style={{ paddingLeft: i % 2 ? '12vw' : 0 }}>
                <span>{emphasis(l)}</span>
              </span>
            ))}
          </h1>
          <div className={s.bottom}>
            <p className={`lead ${s.sub}`} data-reveal="up" data-delay="0.4">
              {data.subtitle}
            </p>
            <div className={s.ctas} data-reveal="up" data-delay="0.55">
              {data.primary?.label && (
                <Link href={data.primary.href} className="btn">
                  {data.primary.label} <span className="arrow">→</span>
                </Link>
              )}
              {data.secondary?.label && (
                <Link href={data.secondary.href} className="btn btn-ghost">
                  {data.secondary.label}
                </Link>
              )}
            </div>
          </div>
          <ul className={s.meta}>
            {(data.meta || []).map((m: { text: string }, i: number) => (
              <li key={i} className="label">
                {m.text}
              </li>
            ))}
          </ul>
          <div className={s.scrollHint} aria-hidden>
            <span />
          </div>
        </div>
      </div>
    </section>
  );
}
