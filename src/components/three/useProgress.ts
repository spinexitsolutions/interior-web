'use client';
import { useEffect, useRef, type RefObject } from 'react';

/**
 * Writes scroll progress (0 → 1) of `target` into a mutable ref every frame — cheap enough to
 * drive 3D without React re-renders.
 * mode "through": 0 when the element's top hits the viewport top, 1 when its bottom does (pinned sections).
 * mode "pass":    0 when the element enters at the bottom, 1 when it leaves at the top.
 */
export function useScrollProgress(target: RefObject<HTMLElement | null>, mode: 'through' | 'pass' = 'through') {
  const progress = useRef(0);
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const el = target.current;
      if (el) {
        const r = el.getBoundingClientRect();
        const vh = window.innerHeight;
        const p = mode === 'through' ? -r.top / Math.max(r.height - vh, 1) : (vh - r.top) / (r.height + vh);
        progress.current = Math.min(1, Math.max(0, p));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, mode]);
  return progress;
}

/** Normalised pointer position (-1 → 1) stored in a ref. */
export function usePointer() {
  const p = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const on = (e: PointerEvent) => {
      p.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      p.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', on, { passive: true });
    return () => window.removeEventListener('pointermove', on);
  }, []);
  return p;
}
