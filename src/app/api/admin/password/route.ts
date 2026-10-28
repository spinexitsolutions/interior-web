import bcrypt from 'bcryptjs';
import { readDb, writeDb } from '@/lib/db';
import { fail, json, requireSession } from '@/lib/api';

export async function POST(req: Request) {
  const s = await requireSession();
  if (!s) return fail('Unauthorised', 401);
  const { current = '', next = '', name } = await req.json();
  const user = readDb().users.find((u) => u.id === s.sub);
  if (!user) return fail('User not found', 404);
  if (next) {
    if (!(await bcrypt.compare(current, user.passwordHash))) return fail('Current password is incorrect', 401);
    if (String(next).length < 8) return fail('New password must be at least 8 characters');
  }
  const hash = next ? await bcrypt.hash(next, 10) : user.passwordHash;
  writeDb((d) => {
    const u = d.users.find((x) => x.id === s.sub)!;
    u.passwordHash = hash;
    if (name) u.name = String(name);
  });
  return json({ ok: true });
}
