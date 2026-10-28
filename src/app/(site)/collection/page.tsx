import type { Metadata } from 'next';
import Link from 'next/link';
import { getCategories, getProducts, getSettings } from '@/lib/content';
import ProductCard from '@/components/sections/ProductCard';
import RichTitle from '@/components/site/RichTitle';
import s from '../listing.module.css';

export const metadata: Metadata = { title: 'Collection' };

type Props = { searchParams: Promise<{ category?: string; sort?: string }> };

export default async function CollectionPage({ searchParams }: Props) {
  const { category, sort } = await searchParams;
  const settings = getSettings();
  const categories = getCategories();
  let products = getProducts();
  if (category) products = products.filter((p) => p.category === category);
  if (sort === 'price-asc') products = [...products].sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') products = [...products].sort((a, b) => b.price - a.price);
  if (sort === 'name') products = [...products].sort((a, b) => a.name.localeCompare(b.name));
  const active = categories.find((c) => c.slug === category);
  const q = (o: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    Object.entries({ category, sort, ...o }).forEach(([k, v]) => v && p.set(k, v));
    const str = p.toString();
    return `/collection${str ? `?${str}` : ''}`;
  };
  return (
    <section className={`tone-light ${s.page}`}>
      <div className="wrap">
        <header className={s.head}>
          <p className="label muted">
            ({products.length}) {active ? active.name : 'All pieces'}
          </p>
          <RichTitle text={active ? `${active.name}\n*collection*` : 'The\n*collection*'} className="d-xxl" as="h1" />
          <p className="lead muted">{active?.description || 'Every piece can be explored in 3D, placed in your room with AR and seen in our VR showroom.'}</p>
        </header>
        <div className={s.filters}>
          <nav className={s.tabs} aria-label="Categories">
            <Link href={q({ category: undefined })} data-active={!category}>
              All
            </Link>
            {categories.map((c) => (
              <Link key={c.id} href={q({ category: c.slug })} data-active={category === c.slug}>
                {c.name}
              </Link>
            ))}
          </nav>
          <nav className={s.tabs} aria-label="Sort">
            <span className="label muted">Sort</span>
            {[
              ['', 'Curated'],
              ['price-asc', 'Price ↑'],
              ['price-desc', 'Price ↓'],
              ['name', 'A—Z'],
            ].map(([v, l]) => (
              <Link key={v} href={q({ sort: v || undefined })} data-active={(sort || '') === v}>
                {l}
              </Link>
            ))}
          </nav>
        </div>
        <div className={s.grid} data-reveal="stagger" key={`${category}-${sort}`}>
          {products.map((p, i) => (
            <ProductCard key={p.id} p={p} i={i} currency={settings.currency} showPrice={settings.showPrices} />
          ))}
        </div>
        {!products.length && <p className="lead muted">Nothing here yet.</p>}
      </div>
    </section>
  );
}
