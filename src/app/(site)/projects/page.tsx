import type { Metadata } from 'next';
import Link from 'next/link';
import { getProjects } from '@/lib/content';
import RichTitle from '@/components/site/RichTitle';
import s from '../listing.module.css';

export const metadata: Metadata = { title: 'Projects' };

export default function ProjectsPage() {
  const projects = getProjects();
  return (
    <section className={`tone-light ${s.page}`}>
      <div className="wrap">
        <header className={s.head}>
          <p className="label muted">({projects.length}) Selected work</p>
          <RichTitle text={'Rooms we’ve\n*shaped*'} className="d-xxl" as="h1" />
          <p className="lead muted">Homes, cafés and workspaces — each one furnished with pieces made for it.</p>
        </header>
        <ol className={s.projects}>
          {projects.map((p, i) => (
            <li key={p.id} data-reveal="up">
              <Link href={`/projects/${p.slug}`} className={s.projectRow} data-cursor="Open">
                <span className="label muted">{String(i + 1).padStart(2, '0')}</span>
                <span className={`display ${s.projectTitle}`}>{p.title}</span>
                <span className="label muted">{p.type}</span>
                <span className="label muted">{p.location}</span>
                <span className="label muted">{p.year}</span>
                <span className={`img-frame ${s.projectThumb}`}>{p.cover && <img src={p.cover} alt="" />}</span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
