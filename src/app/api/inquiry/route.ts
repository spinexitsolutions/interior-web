import { uid, writeDb } from '@/lib/db';
import { fail, json } from '@/lib/api';

const recent = new Map<string, number[]>();

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'local';
  const now = Date.now();
  const hits = (recent.get(ip) || []).filter((t) => now - t < 60_000);
  if (hits.length >= 5) return fail('Too many messages, please wait a minute.', 429);
  recent.set(ip, [...hits, now]);
  const b = await req.json().catch(() => null);
  if (!b) return fail('Invalid request');
  if (b.website) return json({ ok: true }); // honeypot
  const clip = (v: unknown, n: number) => String(v ?? '').trim().slice(0, n);
  const name = clip(b.name, 120);
  const email = clip(b.email, 200);
  const message = clip(b.message, 5000);
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !message) return fail('Please fill in your name, a valid email and a message.');
  writeDb((d) =>
    d.inquiries.unshift({ id: uid(), name, email, phone: clip(b.phone, 40), subject: clip(b.subject, 120), message, product: clip(b.product, 120), read: false, createdAt: new Date().toISOString() }),
  );
  return json({ ok: true }, 201);
}
