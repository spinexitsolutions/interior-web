'use client';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { useScrollProgress } from '../three/useProgress';
import RichTitle from '../site/RichTitle';
import { resolveModel } from '@/lib/models';
import s from './ScrollStory.module.css';

const ExplodedScene = dynamic(() => import('../three/Scenes').then((m) => m.ExplodedScene), { ssr: false });

export default function ScrollStory({ data }: { data: Record<string, any> }) {
  const ref = useRef<HTMLElement>(null);
  const progress = useScrollProgress(ref, 'through');
  const steps: { title: string; text: string }[] = data.steps || [];
  const [active, setActive] = useState(0);
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const p = progress.current;
      setActive(Math.min(steps.length - 1, Math.floor(p * steps.length * 0.999)));
      if (bar.current) bar.current.style.transform = `scaleY(${p})`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [progress, steps.length]);

  return (
    <section ref={ref} className={`tone-${data.tone || 'dark'} ${s.story}`} style={{ height: `${Math.max(steps.length, 2) * 85 + 100}vh` }}>
      <div className={s.sticky}>
        <div className={`wrap ${s.grid}`}>
          <div className={s.copy}>
            <p className="label muted">{data.eyebrow}</p>
            <RichTitle text={data.title} className="d-l" />
            <ol className={s.steps}>
              {steps.map((st, i) => (
                <li key={i} data-active={i === active} data-past={i < active}>
                  <h3 className="display d-s">{st.title}</h3>
                  <p className="muted">{st.text}</p>
                </li>
              ))}
            </ol>
          </div>
          <div className={s.canvas} data-cursor="Scroll to build">
            <ExplodedScene key={data.model} {...resolveModel(data.model)} palette={{}} progress={progress} />
          </div>
          <div className={s.progress} aria-hidden>
            <div ref={bar} />
          </div>
          <p className={`label ${s.counter}`}>
            {String(active + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}
          </p>
        </div>
      </div>
    </section>
  );
}
