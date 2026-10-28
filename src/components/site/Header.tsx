'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Settings } from '@/lib/types';
import s from './Header.module.css';

export default function Header({ settings }: { settings: Settings }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    let last = window.scrollY;
    const on = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      setHidden(y > 200 && y > last && !open);
      last = y;
    };
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, [open]);
  useEffect(() => {
    document.documentElement.style.overflow = open ? 'hidden' : '';
    if (open) window.__lenis?.stop();
    else window.__lenis?.start();
  }, [open]);

  const { announcement: ann } = settings;
  return (
    <>
      {ann.enabled && ann.text && (
        <Link href={ann.href || '#'} className={s.ann}>
          <span className="label">{ann.text}</span>
        </Link>
      )}
      <header className={s.header} data-hidden={hidden} data-scrolled={scrolled} data-open={open}>
        <div className={`wrap ${s.bar}`}>
          <Link href="/" className={s.logo} aria-label={settings.siteName}>
            {settings.logoImage ? <img src={settings.logoImage} alt={settings.siteName} /> : settings.logoText}
          </Link>
          <nav className={s.nav} aria-label="Main">
            {settings.nav.map((l, i) => (
              <Link key={l.href + i} href={l.href} className={s.navLink} data-active={pathname === l.href || (l.href !== '/' && pathname.startsWith(l.href))}>
                <span className={s.idx}>0{i + 1}</span>
                <span className={s.roll} data-text={l.label}>
                  {l.label}
                </span>
              </Link>
            ))}
          </nav>
          <div className={s.right}>
            {settings.headerCta?.label && (
              <Link href={settings.headerCta.href} className={`btn ${s.cta}`}>
                {settings.headerCta.label} <span className="arrow">→</span>
              </Link>
            )}
            <button className={s.burger} onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label="Menu">
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>
      <div className={s.overlay} data-open={open} aria-hidden={!open}>
        <div className={`wrap ${s.overlayInner}`}>
          <nav className={s.bigNav}>
            {[{ label: 'Home', href: '/' }, ...settings.nav].map((l, i) => (
              <Link key={l.href + i} href={l.href} style={{ transitionDelay: open ? `${0.1 + i * 0.05}s` : '0s' }} tabIndex={open ? 0 : -1}>
                <span className="label">0{i}</span>
                <span className="display">{l.label}</span>
              </Link>
            ))}
          </nav>
          <div className={s.overlayMeta}>
            <p className="label muted">Visit</p>
            <p style={{ whiteSpace: 'pre-line' }}>{settings.contact.address}</p>
            <p className="label muted">Write</p>
            <a href={`mailto:${settings.contact.email}`}>{settings.contact.email}</a>
            <div className={s.socials}>
              {settings.socials.map((l) => (
                <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="label link-u">
                  {l.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
