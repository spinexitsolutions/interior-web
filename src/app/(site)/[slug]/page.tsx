import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPage, getSectionContext } from '@/lib/content';
import SectionRenderer from '@/components/sections/SectionRenderer';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = getPage((await params).slug);
  if (!page) return {};
  return { title: page.seoTitle || page.title, description: page.seoDescription || undefined };
}

export default async function CmsPage({ params }: Props) {
  const { slug } = await params;
  const page = getPage(slug);
  if (!page || slug === 'home') notFound();
  return (
    <div style={{ paddingTop: 1 }}>
      <SectionRenderer sections={page.sections} ctx={getSectionContext()} />
    </div>
  );
}
