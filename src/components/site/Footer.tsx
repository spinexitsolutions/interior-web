import Link from 'next/link';
import type { Settings } from '@/lib/types';
import RichTitle from './RichTitle';
import s from './Footer.module.css';

export default function Footer({ settings }: { settings: Settings }) {
  const { footer, contact, socials } = settings;
  return (
    <footer className={`tone-dark ${s.footer}`}>
      <div className="wrap">
        <div className={s.top}>
          <RichTitle text={footer.headline} className="d-xl" as="p" />
          {settings.headerCta?.label && (
            <Link href={settings.headerCta.href} className={`btn ${s.cta}`} data-cursor="Let’s talk">
              {settings.headerCta.label} <span className="arrow">→</span>
            </Link>
          )}
        </div>
        <hr className="rule" />
        <div className={s.cols}>
          <div>
            <p className="label muted">Studio</p>
            <p style={{ whiteSpace: 'pre-line' }}>{contact.address}</p>
            {contact.mapUrl && (
              <a href={contact.mapUrl} target="_blank" rel="noreferrer" className="label link-u">
                Get directions ↗
              </a>
            )}
          </div>
          <div>
            <p className="label muted">Contact</p>
            <p>
              <a href={`mailto:${contact.email}`} className="link-u">
                {contact.email}
              </a>
              <br />
              <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className="link-u">
                {contact.phone}
              </a>
            </p>
            <p className="muted">{contact.hours}</p>
          </div>
          {footer.columns.map((col) => (
            <div key={col.title}>
              <p className="label muted">{col.title}</p>
              <ul className={s.list}>
                {col.links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link href={l.href} className="link-u">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <p className="label muted">Follow</p>
            <ul className={s.list}>
              {socials.map((l) => (
                <li key={l.href}>
                  <a href={l.href} target="_blank" rel="noreferrer" className="link-u">
                    {l.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className={s.giant} aria-hidden>
          {settings.logoText.split('').map((c, i) => (
            <span key={i} style={{ animationDelay: `${i * 0.06}s` }}>
              {c}
            </span>
          ))}
        </div>
        <div className={s.bottom}>
          <span className="label muted">{footer.note}</span>
          <span className="label muted">{settings.tagline}</span>
        </div>
      </div>
    </footer>
  );
}
