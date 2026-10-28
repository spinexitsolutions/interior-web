'use client';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { ARProduct } from '../site/ARViewer';
import type { ShowroomItem } from '../three/Showroom';
import RichTitle from '../site/RichTitle';
import s from './Interactive.module.css';

const OrbitScene = dynamic(() => import('../three/Scenes').then((m) => m.OrbitScene), { ssr: false });
const ARViewer = dynamic(() => import('../site/ARViewer'), { ssr: false });
const ShowroomPreview = dynamic(() => import('../three/Showroom').then((m) => m.ShowroomPreview), { ssr: false });

export function ARPromo({ data, product }: { data: Record<string, any>; product?: ARProduct }) {
  const [open, setOpen] = useState(false);
  return (
    <section className={`section tone-${data.tone || 'accent'} ${s.ar}`}>
      <div className={`wrap ${s.arGrid}`}>
        <div className={s.arCopy}>
          <p className="label muted">{data.eyebrow}</p>
          <RichTitle text={data.title} className="d-xl" />
          <p className="lead">{data.text}</p>
          <ul className={s.arPoints}>
            {(data.points || []).map((p: { text: string }, i: number) => (
              <li key={i}>
                <span className="label">0{i + 1}</span> {p.text}
              </li>
            ))}
          </ul>
          {product && (
            <button className="btn" onClick={() => setOpen(true)}>
              {data.buttonLabel || 'View in AR'} <span className="arrow">→</span>
            </button>
          )}
        </div>
        <div className={s.arStage} data-cursor="Drag">
          <div className={s.arPhone}>
            <div className={s.arScreen}>
              {product && <OrbitScene model={product.model} modelUrl={product.modelUrl} palette={{}} size={1.4} camera={[2.2, 1.6, 3.2]} />}
              <span className={s.arReticle} aria-hidden />
              <span className={`label ${s.arTag}`}>AR · {product?.name}</span>
            </div>
          </div>
        </div>
      </div>
      {product && <ARViewer product={product} open={open} onClose={() => setOpen(false)} />}
    </section>
  );
}

export function VRPromo({ data, items }: { data: Record<string, any>; items: ShowroomItem[] }) {
  return (
    <section className={`tone-${data.tone || 'dark'} ${s.vr}`}>
      <div className={s.vrCanvas} aria-hidden>
        <ShowroomPreview items={items} />
      </div>
      <div className={`wrap ${s.vrInner}`}>
        <p className="label muted">{data.eyebrow}</p>
        <RichTitle text={data.title} className="d-xl" />
        <p className="lead">{data.text}</p>
        <Link href="/showroom" className="btn" data-cursor="Enter">
          {data.buttonLabel || 'Enter showroom'} <span className="arrow">→</span>
        </Link>
        <div className={s.vrBadges}>
          <span className="label">Meta Quest</span>
          <span className="label">Apple Vision Pro</span>
          <span className="label">Any browser</span>
        </div>
      </div>
    </section>
  );
}

export function Testimonials({ data, items }: { data: Record<string, any>; items: { id: string; quote: string; name: string; role: string; avatar: string }[] }) {
  const [i, setI] = useState(0);
  if (!items.length) return null;
  const next = () => setI((x) => (x + 1) % items.length);
  return (
    <section className={`section tone-${data.tone || 'surface'}`}>
      <div className={`wrap ${s.testi}`}>
        <div>
          <p className="label muted">{data.eyebrow}</p>
          <RichTitle text={data.title} className="d-l" />
          <div className={s.testiNav}>
            <span className="label">
              {String(i + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
            </span>
            <button className="btn btn-ghost" onClick={next}>
              Next <span className="arrow">→</span>
            </button>
          </div>
        </div>
        <div className={s.stack} onClick={next} data-cursor="Next">
          {items.map((t, k) => {
            const pos = (k - i + items.length) % items.length;
            return (
              <figure key={t.id} className={s.stackCard} style={{ ['--pos' as string]: pos, zIndex: items.length - pos }} data-pos={pos}>
                <blockquote className="display">“{t.quote}”</blockquote>
                <figcaption>
                  <span className={s.avatar}>{t.avatar ? <img src={t.avatar} alt="" /> : t.name.charAt(0)}</span>
                  <span>
                    <strong>{t.name}</strong>
                    <br />
                    <span className="label muted">{t.role}</span>
                  </span>
                </figcaption>
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function Contact({ data, contact, products }: { data: Record<string, any>; contact: { email: string; phone: string; address: string; hours: string }; products: { slug: string; name: string }[] }) {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');
  const subjects: string[] = data.subjects?.length ? data.subjects : ['General enquiry'];
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState('sending');
    const body = Object.fromEntries(new FormData(e.currentTarget).entries());
    const res = await fetch('/api/inquiry', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    if (res.ok) setState('sent');
    else {
      setState('error');
      setError((await res.json().catch(() => ({}))).error || 'Something went wrong');
    }
  }
  const [preProduct, setPreProduct] = useState('');
  useEffect(() => setPreProduct(new URLSearchParams(window.location.search).get('product') || ''), []);
  return (
    <section className={`section tone-${data.tone || 'light'} ${s.contact}`}>
      <div className={`wrap ${s.contactGrid}`}>
        <div className={s.contactInfo}>
          <p className="label muted">{data.eyebrow}</p>
          <RichTitle text={data.title} className="d-xl" as="h1" />
          <p className="lead muted">{data.text}</p>
          <dl className={s.contactDl}>
            <dt className="label muted">Email</dt>
            <dd>
              <a className="link-u" href={`mailto:${contact.email}`}>
                {contact.email}
              </a>
            </dd>
            <dt className="label muted">Phone</dt>
            <dd>{contact.phone}</dd>
            <dt className="label muted">Showroom</dt>
            <dd style={{ whiteSpace: 'pre-line' }}>{contact.address}</dd>
            <dt className="label muted">Hours</dt>
            <dd>{contact.hours}</dd>
          </dl>
        </div>
        {state === 'sent' ? (
          <div className={s.sent}>
            <p className="display d-l">
              Thank <em>you</em>.
            </p>
            <p className="lead muted">Your note has reached the studio. We’ll be in touch within one working day.</p>
          </div>
        ) : (
          <form className={s.form} onSubmit={submit}>
            <label>
              <span className="label">Your name *</span>
              <input name="name" required autoComplete="name" />
            </label>
            <label>
              <span className="label">Email *</span>
              <input name="email" type="email" required autoComplete="email" />
            </label>
            <label>
              <span className="label">Phone</span>
              <input name="phone" autoComplete="tel" />
            </label>
            <label>
              <span className="label">Subject</span>
              <select name="subject">
                {subjects.map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
            <label className={s.full}>
              <span className="label">Interested in</span>
              <select name="product" key={preProduct} defaultValue={preProduct}>
                <option value="">— No specific piece —</option>
                {products.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <label className={s.full}>
              <span className="label">Tell us about your space *</span>
              <textarea name="message" rows={5} required />
            </label>
            <input type="text" name="website" tabIndex={-1} autoComplete="off" className={s.hp} aria-hidden />
            <div className={s.full}>
              <button className="btn" disabled={state === 'sending'}>
                {state === 'sending' ? 'Sending…' : 'Send enquiry'} <span className="arrow">→</span>
              </button>
              {state === 'error' && <p style={{ color: 'var(--accent)' }}>{error}</p>}
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
