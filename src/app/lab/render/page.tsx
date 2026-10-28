import { notFound } from 'next/navigation';
import RenderLab from './RenderLab';

// Dev-only: renders the 3D vignettes used as seed photography (see scripts/render-images.mjs).
export default async function Page({ searchParams }: { searchParams: Promise<{ scene?: string }> }) {
  if (process.env.NODE_ENV === 'production') notFound();
  const { scene = 'project-1' } = await searchParams;
  return <RenderLab scene={scene} />;
}
