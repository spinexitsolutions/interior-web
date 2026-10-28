'use client';
// Global client behaviour for the public site: smooth scroll, scroll-driven reveals,
// custom cursor and page-transition curtain. Sections stay server components and simply
// opt in with data-* attributes (data-reveal, data-parallax, data-count, data-cursor).
import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

export default function Chrome({ smooth, cursor, grain, transitions, siteName }: { smooth: boolean; cursor: boolean; grain: boolean; transitions: boolean; siteName: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const cursorRef = useRef<HTMLDivElement>(null);
  const curtainRef = useRef<HTMLDivElement>(null);

  // ---- smooth scroll
  useEffect(() => {
    document.documentElement.classList.add('js');
    if (!smooth || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
    window.__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    const raf = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      window.__lenis = undefined;
    };
  }, [smooth]);

  // ---- reveals (re-run on each route)
  useEffect(() => {
    window.__lenis?.scrollTo(0, { immediate: true });
    window.scrollTo(0, 0);
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-reveal="lines"]').forEach((el) => {
        const spans = el.querySelectorAll('.reveal-line > span');
        gsap.fromTo(spans, { yPercent: 110, rotate: 2 }, { yPercent: 0, rotate: 0, duration: 1.2, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: el, start: 'top 88%' } });
      });
      gsap.utils.toArray<HTMLElement>('[data-reveal="up"]').forEach((el) => {
        gsap.fromTo(el, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, ease: 'expo.out', delay: Number(el.dataset.delay || 0), scrollTrigger: { trigger: el, start: 'top 92%' } });
      });
      gsap.utils.toArray<HTMLElement>('[data-reveal="stagger"]').forEach((el) => {
        gsap.fromTo(el.children, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: el, start: 'top 88%' } });
      });
      gsap.utils.toArray<HTMLElement>('[data-reveal="clip"]').forEach((el) => {
        gsap.fromTo(el, { clipPath: 'inset(18% 12% 18% 12%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: el, start: 'top 95%', end: 'top 35%', scrub: true } });
      });
      gsap.utils.toArray<HTMLElement>('[data-reveal="words"]').forEach((el) => {
        gsap.fromTo(el.querySelectorAll('.w'), { opacity: 0.14 }, { opacity: 1, stagger: 0.05, ease: 'none', scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true } });
      });
      gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
        const amt = Number(el.dataset.parallax || 0.15);
        gsap.fromTo(el, { yPercent: -amt * 100 }, { yPercent: amt * 100, ease: 'none', scrollTrigger: { trigger: el.parentElement || el, start: 'top bottom', end: 'bottom top', scrub: true } });
      });
      gsap.utils.toArray<HTMLElement>('[data-count]').forEach((el) => {
        const raw = el.dataset.count || '';
        const m = raw.match(/^(\D*)([\d,.]+)(.*)$/);
        if (!m) return;
        const target = parseFloat(m[2].replace(/,/g, ''));
        const obj = { v: 0 };
        gsap.to(obj, {
          v: target,
          duration: 2,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 90%' },
          onUpdate: () => (el.textContent = `${m[1]}${Math.round(obj.v).toLocaleString('en-IN')}${m[3]}`),
        });
      });
    });
    const id = setTimeout(() => ScrollTrigger.refresh(), 400);
    return () => {
      clearTimeout(id);
      ctx.revert();
    };
  }, [pathname]);

  // ---- cursor
  useEffect(() => {
    if (!cursor || matchMedia('(hover: none)').matches) return;
    const el = cursorRef.current!;
    const label = el.querySelector('span')!;
    const xTo = gsap.quickTo(el, 'x', { duration: 0.35, ease: 'power3' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.35, ease: 'power3' });
    const move = (e: PointerEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
      const t = (e.target as HTMLElement).closest<HTMLElement>('[data-cursor], a, button, input, textarea, select');
      const text = t?.dataset.cursor;
      el.classList.toggle('is-big', !!text);
      el.classList.toggle('is-link', !text && !!t);
      label.textContent = text || '';
    };
    window.addEventListener('pointermove', move, { passive: true });
    document.documentElement.style.cursor = 'none';
    return () => {
      window.removeEventListener('pointermove', move);
      document.documentElement.style.cursor = '';
    };
  }, [cursor]);

  // ---- page transitions: cover → navigate → reveal
  useEffect(() => {
    if (!transitions) return;
    if (curtainRef.current) gsap.set(curtainRef.current, { y: 0, yPercent: 100 });
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement).closest('a');
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname.startsWith('/admin')) return;
      if (url.pathname === location.pathname) return;
      e.preventDefault();
      gsap.fromTo(curtainRef.current, { yPercent: 100 }, { yPercent: 0, duration: 0.6, ease: 'expo.inOut', onComplete: () => router.push(url.pathname + url.search + url.hash) });
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [transitions, router]);

  useEffect(() => {
    const c = curtainRef.current;
    if (!c || gsap.getProperty(c, 'yPercent') !== 0) return;
    gsap.to(c, { yPercent: -100, duration: 0.8, ease: 'expo.inOut', delay: 0.1 });
  }, [pathname]);

  return (
    <>
      {grain && <div className="grain" aria-hidden />}
      {cursor && (
        <div ref={cursorRef} className="cursor" aria-hidden>
          <span />
        </div>
      )}
      {transitions && (
        <div ref={curtainRef} className="curtain" aria-hidden>
          <span className="display d-l">{siteName}</span>
        </div>
      )}
    </>
  );
}
