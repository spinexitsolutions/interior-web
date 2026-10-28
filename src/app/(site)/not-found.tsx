import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="section tone-light" style={{ minHeight: '80vh', display: 'grid', placeItems: 'center', textAlign: 'center' }}>
      <div className="wrap">
        <p className="label muted">Error 404</p>
        <h1 className="display d-xxl">
          Lost in <em>space</em>.
        </h1>
        <p className="lead muted" style={{ margin: '24px auto 40px' }}>
          This room doesn’t exist — but plenty of others do.
        </p>
        <Link href="/" className="btn">
          Back home <span className="arrow">→</span>
        </Link>
      </div>
    </section>
  );
}
