import { notFound } from 'next/navigation';
import { getPage, getSectionContext } from '@/lib/content';
import SectionRenderer from '@/components/sections/SectionRenderer';

export default function Home() {
  const page = getPage('home');
  if (!page) notFound();
  return <SectionRenderer sections={page.sections} ctx={getSectionContext()} />;
}
