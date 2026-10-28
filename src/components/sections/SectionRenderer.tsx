import type { Section } from '@/lib/types';
import { productModel, type SectionContext } from '@/lib/content';
import Hero3D from './Hero3D';
import ScrollStory from './ScrollStory';
import CollectionRail from './CollectionRail';
import Configurator from './Configurator';
import CategoryList from './CategoryList';
import { ARPromo, Contact, Testimonials, VRPromo } from './Promos';
import { Cta, Faq, Gallery, ImageSplit, Journal, Manifesto, Marquee, Process, ProjectsBento, RichText, Stats } from './Basic';

export function showroomItems(ctx: SectionContext) {
  return ctx.products.filter((p) => p.inShowroom).map((p) => ({ slug: p.slug, name: p.name, model: p.model, modelUrl: p.modelUrl, dimensions: p.dimensions, color: p.variants[0]?.color, slot: p.variants[0]?.slot }));
}

function render(section: Section, ctx: SectionContext) {
  const d = section.data || {};
  const currency = ctx.settings.currency;
  switch (section.type) {
    case 'hero3d':
      return <Hero3D data={d} />;
    case 'scrollStory':
      return <ScrollStory data={d} />;
    case 'marquee':
      return <Marquee data={d} />;
    case 'manifesto':
      return <Manifesto data={d} />;
    case 'collectionRail': {
      let list = ctx.products;
      if (d.source === 'featured') list = list.filter((p) => p.featured);
      if (d.source === 'category' && d.category) list = list.filter((p) => p.category === d.category);
      return <CollectionRail data={d} products={list.slice(0, d.limit || 8)} currency={currency} showPrice={ctx.settings.showPrices} />;
    }
    case 'configurator': {
      const p = ctx.products.find((x) => x.slug === d.product);
      return <Configurator data={d} product={p ? { slug: p.slug, name: p.name, model: p.model, modelUrl: p.modelUrl } : undefined} />;
    }
    case 'categoryGrid': {
      const counts: Record<string, number> = {};
      ctx.products.forEach((p) => (counts[p.category] = (counts[p.category] || 0) + 1));
      return <CategoryList data={d} categories={ctx.categories} counts={counts} />;
    }
    case 'projectsBento':
      return <ProjectsBento data={d} ctx={ctx} />;
    case 'arPromo': {
      const p = ctx.products.find((x) => x.slug === d.product) || ctx.products.find((x) => x.arEnabled);
      return <ARPromo data={d} product={p ? productModel(p) : undefined} />;
    }
    case 'vrPromo':
      return <VRPromo data={d} />;
    case 'stats':
      return <Stats data={d} />;
    case 'process':
      return <Process data={d} />;
    case 'imageSplit':
      return <ImageSplit data={d} />;
    case 'gallery':
      return <Gallery data={d} />;
    case 'testimonials':
      return <Testimonials data={d} items={ctx.testimonials} />;
    case 'journal':
      return <Journal data={d} ctx={ctx} />;
    case 'faq':
      return <Faq data={d} />;
    case 'richText':
      return <RichText data={d} />;
    case 'contact':
      return <Contact data={d} contact={ctx.settings.contact} products={ctx.products.map((p) => ({ slug: p.slug, name: p.name }))} />;
    case 'cta':
      return <Cta data={d} />;
    default:
      return null;
  }
}

export default function SectionRenderer({ sections, ctx }: { sections: Section[]; ctx: SectionContext }) {
  return (
    <>
      {sections
        .filter((s) => s.enabled)
        .map((s) => (
          <div key={s.id} id={`section-${s.id}`} data-section={s.type}>
            {render(s, ctx)}
          </div>
        ))}
    </>
  );
}
