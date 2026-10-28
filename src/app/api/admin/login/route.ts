import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { readDb } from '@/lib/db';
import { SESSION_COOKIE, signSession } from '@/lib/auth';
import { fail, json } from '@/lib/api';

const attempts = new Map<string, { n: number; until: number }>();

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'local';
  const a = attempts.get(ip);
  if (a && a.until > Date.now()) return fail('Too many attempts. Try again in a minute.', 429);
  const { email = '', password = '' } = await req.json().catch(() => ({}));
  const user = readDb().users.find((u) => u.email.toLowerCase() === String(email).toLowerCase().trim());
  if (!user || !(await bcrypt.compare(String(password), user.passwordHash))) {
    const n = (a?.n || 0) + 1;
    attempts.set(ip, { n, until: n >= 5 ? Date.now() + 60_000 : 0 });
    return fail('Invalid email or password', 401);
  }
  attempts.delete(ip);
  const token = await signSession({ sub: user.id, email: user.email, name: user.name, role: user.role });
  (await cookies()).set(SESSION_COOKIE, token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' && process.env.INSECURE_COOKIES !== '1', path: '/', maxAge: 60 * 60 * 24 * 7 });
  return json({ ok: true, user: { email: user.email, name: user.name, role: user.role } });
}
