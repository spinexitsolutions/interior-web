import Link from 'next/link';
import type { Product } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import s from './Interactive.module.css';

export default function ProductCard({ p, i, currency, showPrice }: { p: Product; i: number; currency: string; showPrice: boolean }) {
  return (
    <Link href={`/collection/${p.slug}`} className={s.card} data-cursor="View in 3D">
      <div className={`img-frame ${s.cardImg}`}>
        {p.images?.[0] ? <img src={p.images[0]} alt={p.name} loading="lazy" /> : <div className="ph" style={{ height: '100%' }} />}
        {p.images?.[1] && <img src={p.images[1]} alt="" className={s.cardImgAlt} loading="lazy" />}
        <span className={`label ${s.cardIdx}`}>N° {String(i + 1).padStart(2, '0')}</span>
        {p.arEnabled && <span className={`label ${s.cardBadge}`}>AR</span>}
      </div>
      <div className={s.cardMeta}>
        <h3 className="display d-s">{p.name}</h3>
        {showPrice && <span className="label">{formatPrice(p.price, currency)}</span>}
      </div>
      <div className={s.cardSwatches}>
        {p.variants.slice(0, 5).map((v) => (
          <i key={v.name} style={{ background: v.color }} title={v.name} />
        ))}
        <span className="label muted">{p.category}</span>
      </div>
    </Link>
  );
}
