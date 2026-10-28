// Server-rendered sections. Motion is attached by <Chrome/> through data-* attributes.
import Link from 'next/link';
import type { SectionContext } from '@/lib/content';
import { formatDate, markdown } from '@/lib/utils';
import RichTitle from '../site/RichTitle';
import s from './Basic.module.css';

type D = Record<string, any>;
const tone = (d: D, fallback = 'light') => `tone-${d.tone || fallback}`;

export function SectionHead({ d, aside }: { d: D; aside?: React.ReactNode }) {
  if (!d.title && !d.eyebrow) return null;
  return (
    <div className="sec-head">
      <p className="label muted">{d.eyebrow}</p>
      {d.title ? <RichTitle text={d.title} className="d-l" /> : <span />}
      {aside && <div className="sec-aside">{aside}</div>}
    </div>
  );
}

const ArrowLink = ({ link }: { link?: { label: string; href: string } }) =>
  link?.label ? (
    <Link href={link.href} className="btn btn-ghost">
      {link.label} <span className="arrow">→</span>
    </Link>
  ) : null;

export function Marquee({ data }: { data: D }) {
  const items: string[] = data.items?.length ? data.items : ['Add words in the admin'];
  const row = (
    <div className={s.mqRow} aria-hidden>
      {[...items, ...items].map((t, i) => (
        <span key={i} className={i % 2 ? s.mqItalic : ''}>
          {t}
          <b>✺</b>
        </span>
      ))}
    </div>
  );
  return (
    <section className={`${tone(data, 'dark')} ${s.marquee}`} style={{ ['--mq-speed' as string]: `${data.speed || 30}s` }} aria-label={items.join(', ')}>
      <div className={s.mqTrack}>
        {row}
        {row}
      </div>
    </section>
  );
}

export function Manifesto({ data }: { data: D }) {
  const words = String(data.text || '').split(/\s+/);
  return (
    <section className={`section ${tone(data)}`}>
      <div className="wrap grid-12">
        <p className={`label muted ${s.manLabel}`}>{data.eyebrow}</p>
        <div className={s.manBody}>
          <p className={`display ${s.manText}`} data-reveal="words">
            {words.map((w, i) => (
              <span className="w" key={i}>
                {w}{' '}
              </span>
            ))}
          </p>
          <div data-reveal="up">
            <ArrowLink link={data.link} />
          </div>
        </div>
      </div>
    </section>
  );
}

export function ProjectsBento({ data, ctx }: { data: D; ctx: SectionContext }) {
  const list = ctx.projects.filter((p) => p.featured).slice(0, data.limit || 5);
  return (
    <section className={`section ${tone(data)}`}>
      <div className="wrap">
        <SectionHead d={data} aside={<ArrowLink link={data.link} />} />
        <div className={s.bento}>
          {list.map((p, i) => (
            <Link key={p.id} href={`/projects/${p.slug}`} className={s.bentoItem} data-i={i} data-cursor="View">
              <div className={`img-frame ${s.bentoImg}`} data-reveal="clip">
                {p.cover ? <img src={p.cover} alt={p.title} data-parallax="0.08" /> : <div className="ph" />}
              </div>
              <div className={s.bentoMeta}>
                <span className="label muted">
                  {String(i + 1).padStart(2, '0')} — {p.type}
                </span>
                <h3 className="display d-s">{p.title}</h3>
                <span className="label muted">
                  {p.location} · {p.year}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Stats({ data }: { data: D }) {
  return (
    <section className={`${tone(data)} ${s.stats}`}>
      <div className={`wrap ${s.statsGrid}`} data-reveal="stagger">
        {(data.items || []).map((it: D, i: number) => (
          <div key={i} className={s.stat}>
            <span className={`display ${s.statValue}`} data-count={it.value}>
              {it.value}
            </span>
            <span className="label muted">{it.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Process({ data }: { data: D }) {
  return (
    <section className={`section ${tone(data)}`} id="process">
      <div className={`wrap ${s.process}`}>
        <div className={s.processHead}>
          <p className="label muted">{data.eyebrow}</p>
          <RichTitle text={data.title} className="d-l" />
        </div>
        <ol className={s.processList}>
          {(data.steps || []).map((st: D, i: number) => (
            <li key={i} data-reveal="up">
              <span className={`display ${s.processNum}`}>{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h3 className="display d-m">{st.title}</h3>
                <p className="muted">{st.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function ImageSplit({ data }: { data: D }) {
  return (
    <section className={`section ${tone(data)}`}>
      <div className={`wrap ${s.split}`} data-reverse={!!data.reverse}>
        <div className={`img-frame ${s.splitImg}`} data-reveal="clip">
          {data.image ? <img src={data.image} alt="" data-parallax="0.1" /> : <div className="ph" style={{ height: '100%' }} />}
        </div>
        <div className={s.splitCopy}>
          <p className="label muted">{data.eyebrow}</p>
          <RichTitle text={data.title} className="d-l" />
          <div className="prose" data-reveal="up" dangerouslySetInnerHTML={{ __html: markdown(data.text) }} />
          <div data-reveal="up">
            <ArrowLink link={data.link} />
          </div>
        </div>
      </div>
    </section>
  );
}

export function Gallery({ data }: { data: D }) {
  const imgs: string[] = data.images || [];
  return (
    <section className={`section ${tone(data)}`}>
      <div className="wrap">
        <SectionHead d={data} />
        <div className={s.gallery}>
          {imgs.map((src, i) => (
            <figure key={i} className={`img-frame ${s.galleryItem}`} data-reveal="clip">
              <img src={src} alt="" data-parallax={i % 2 ? '0.12' : '0.06'} />
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Journal({ data, ctx }: { data: D; ctx: SectionContext }) {
  const posts = ctx.posts.slice(0, data.limit || 3);
  return (
    <section className={`section ${tone(data)}`}>
      <div className="wrap">
        <SectionHead d={data} aside={<ArrowLink link={{ label: 'All notes', href: '/journal' }} />} />
        <div className={s.journal}>
          {posts.map((p, i) => (
            <PostCard key={p.id} post={p} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function PostCard({ post: p, i }: { post: SectionContext['posts'][number]; i: number }) {
  return (
    <Link href={`/journal/${p.slug}`} className={s.post} data-reveal="up" data-delay={String(i * 0.08)} data-cursor="Read">
      <div className={`img-frame ${s.postImg}`}>{p.cover ? <img src={p.cover} alt="" /> : <div className="ph" />}</div>
      <div className={s.postMeta}>
        <span className="label muted">{formatDate(p.date)}</span>
        <span className="label muted">{p.tags?.[0]}</span>
      </div>
      <h3 className="display d-s">{p.title}</h3>
      <p className="muted">{p.excerpt}</p>
    </Link>
  );
}

export function Faq({ data }: { data: D }) {
  return (
    <section className={`section ${tone(data)}`}>
      <div className={`wrap ${s.faq}`}>
        <div>
          <p className="label muted">{data.eyebrow}</p>
          <RichTitle text={data.title} className="d-l" />
        </div>
        <div className={s.faqList}>
          {(data.items || []).map((it: D, i: number) => (
            <details key={i} className={s.faqItem}>
              <summary>
                <span className="display d-s">{it.q}</span>
                <i aria-hidden />
              </summary>
              <p className="muted">{it.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function RichText({ data }: { data: D }) {
  return (
    <section className={`section ${tone(data)}`}>
      <div className="wrap">
        <SectionHead d={data} />
        <div className="prose" style={data.narrow ? { margin: '0 auto' } : { marginLeft: '25%' }} dangerouslySetInnerHTML={{ __html: markdown(data.body) }} />
      </div>
    </section>
  );
}

export function Cta({ data }: { data: D }) {
  return (
    <section className={`${tone(data, 'dark')} ${s.cta}`}>
      <div className="wrap">
        <p className="label muted">{data.eyebrow}</p>
        <RichTitle text={data.title} className="d-xxl" />
        {data.link?.label && (
          <Link href={data.link.href} className={s.ctaCircle} data-cursor="Go">
            <span>{data.link.label}</span>
            <b>→</b>
          </Link>
        )}
      </div>
    </section>
  );
}
