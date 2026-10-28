import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProject, getProjects } from '@/lib/content';
import { markdown } from '@/lib/utils';
import RichTitle from '@/components/site/RichTitle';
import s from '../../listing.module.css';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = getProject((await params).slug);
  return p ? { title: p.title, description: p.summary, openGraph: { images: p.cover ? [p.cover] : [] } } : {};
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) notFound();
  const all = getProjects();
  const next = all[(all.findIndex((x) => x.slug === slug) + 1) % all.length];
  return (
    <article className="tone-light">
      <header className={`wrap ${s.articleHead}`}>
        <p className="label muted">
          {p.type} · {p.location} · {p.year}
        </p>
        <RichTitle text={p.title} className="d-xxl" as="h1" />
      </header>
      <div className={`img-frame ${s.hero}`} data-reveal="clip">
        {p.cover && <img src={p.cover} alt={p.title} data-parallax="0.1" />}
      </div>
      <div className={`wrap ${s.articleBody}`}>
        <dl className={s.facts}>
          <dt className="label muted">Location</dt>
          <dd>{p.location}</dd>
          <dt className="label muted">Year</dt>
          <dd>{p.year}</dd>
          <dt className="label muted">Area</dt>
          <dd>{p.area}</dd>
          <dt className="label muted">Type</dt>
          <dd>{p.type}</dd>
        </dl>
        <div>
          <p className="display d-m" data-reveal="up">
            {p.summary}
          </p>
          <div className="prose" dangerouslySetInnerHTML={{ __html: markdown(p.body) }} />
        </div>
      </div>
      <div className={`wrap ${s.galleryRow}`}>
        {p.gallery.map((src, i) => (
          <figure key={i} className="img-frame" data-reveal="clip">
            <img src={src} alt="" data-parallax="0.08" />
          </figure>
        ))}
      </div>
      {next && next.slug !== p.slug && (
        <Link href={`/projects/${next.slug}`} className={`tone-dark ${s.next}`} data-cursor="Next">
          <span className="label muted">Next project</span>
          <span className="display d-xl">{next.title} →</span>
        </Link>
      )}
    </article>
  );
}
