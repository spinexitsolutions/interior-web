import type { Metadata } from 'next';
import { getProducts, getSettings } from '@/lib/content';
import ShowroomExperience from '@/components/site/ShowroomExperience';

export const metadata: Metadata = { title: 'VR Showroom', description: 'Walk our virtual furniture showroom in your browser or a VR headset.' };

export default async function ShowroomPage({ searchParams }: { searchParams: Promise<{ focus?: string }> }) {
  const { focus } = await searchParams;
  const settings = getSettings();
  const items = getProducts()
    .filter((p) => p.inShowroom || p.slug === focus)
    .map((p) => ({ slug: p.slug, name: p.name, tagline: p.tagline, price: p.price, model: p.model, modelUrl: p.modelUrl, dimensions: p.dimensions, color: p.variants[0]?.color, slot: p.variants[0]?.slot, image: p.images[0] || '' }));
  return <ShowroomExperience items={items} focus={focus} currency={settings.currency} showPrice={settings.showPrices} />;
}
