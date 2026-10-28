import type { Metadata } from 'next';
import { getPosts } from '@/lib/content';
import RichTitle from '@/components/site/RichTitle';
import { PostCard } from '@/components/sections/Basic';
import s from '../listing.module.css';

export const metadata: Metadata = { title: 'Journal' };

export default function JournalPage() {
  const posts = getPosts();
  return (
    <section className={`tone-light ${s.page}`}>
      <div className="wrap">
        <header className={s.head}>
          <p className="label muted">({posts.length}) Notes</p>
          <RichTitle text={'Notes from\nthe *atelier*'} className="d-xxl" as="h1" />
          <p className="lead muted">Materials, craft, guides and the occasional opinion.</p>
        </header>
        <div className={s.grid}>
          {posts.map((p, i) => (
            <PostCard key={p.id} post={p} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
