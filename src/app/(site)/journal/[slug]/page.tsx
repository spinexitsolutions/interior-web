import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPost } from '@/lib/content';
import { formatDate, markdown } from '@/lib/utils';
import RichTitle from '@/components/site/RichTitle';
import s from '../../listing.module.css';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = getPost((await params).slug);
  return p ? { title: p.title, description: p.excerpt, openGraph: { images: p.cover ? [p.cover] : [] } } : {};
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const p = getPost(slug);
  if (!p) notFound();
  return (
    <article className="tone-light">
      <header className={`wrap ${s.articleHead}`} style={{ textAlign: 'center' }}>
        <p className="label muted">
          {formatDate(p.date)} · {p.author} · {p.tags.join(', ')}
        </p>
        <RichTitle text={p.title} className="d-xl" as="h1" />
        <p className="lead muted" style={{ margin: '0 auto' }}>
          {p.excerpt}
        </p>
      </header>
      <div className={`img-frame ${s.hero}`} data-reveal="clip">
        {p.cover && <img src={p.cover} alt="" data-parallax="0.1" />}
      </div>
      <div className="wrap" style={{ paddingBlock: '80px 140px' }}>
        <div className="prose" style={{ margin: '0 auto' }} dangerouslySetInnerHTML={{ __html: markdown(p.body) }} />
        <p style={{ textAlign: 'center', marginTop: 80 }}>
          <Link href="/journal" className="btn btn-ghost">
            ← All notes
          </Link>
        </p>
      </div>
    </article>
  );
}
