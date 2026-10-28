import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCategories, getProduct, getProducts, getSettings } from '@/lib/content';
import { markdown } from '@/lib/utils';
import ProductView from '@/components/site/ProductView';
import ProductCard from '@/components/sections/ProductCard';
import s from '../../listing.module.css';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = getProduct((await params).slug);
  return p ? { title: p.name, description: p.tagline, openGraph: { images: p.images.slice(0, 1) } } : {};
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  const settings = getSettings();
  const category = getCategories().find((c) => c.slug === product.category);
  const related = getProducts()
    .filter((p) => p.slug !== slug)
    .sort((a, b) => Number(b.category === product.category) - Number(a.category === product.category))
    .slice(0, 4);
  return (
    <>
      <ProductView product={product} currency={settings.currency} showPrice={settings.showPrices} descriptionHtml={markdown(product.description)} categoryName={category?.name || product.category} />
      <section className="section tone-surface">
        <div className="wrap">
          <div className="sec-head">
            <p className="label muted">Pairs well with</p>
            <h2 className="display d-l">
              More from the <em>atelier</em>
            </h2>
          </div>
          <div className={s.grid}>
            {related.map((p, i) => (
              <ProductCard key={p.id} p={p} i={i} currency={settings.currency} showPrice={settings.showPrices} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
