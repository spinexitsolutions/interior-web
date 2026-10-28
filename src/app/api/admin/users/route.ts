import bcrypt from 'bcryptjs';
import { readDb, uid, writeDb } from '@/lib/db';
import { fail, json, requireSession } from '@/lib/api';

const safe = () => readDb().users.map(({ passwordHash, ...u }) => u);

export async function GET() {
  if (!(await requireSession())) return fail('Unauthorised', 401);
  return json(safe());
}

export async function POST(req: Request) {
  const s = await requireSession();
  if (!s || s.role !== 'admin') return fail('Only admins can add users', 403);
  const { email, name, password, role } = await req.json();
  if (!email || !password || String(password).length < 8) return fail('Email and a password of 8+ characters are required');
  if (readDb().users.some((u) => u.email.toLowerCase() === String(email).toLowerCase())) return fail('A user with that email exists');
  const passwordHash = await bcrypt.hash(password, 10);
  writeDb((d) => d.users.push({ id: uid(), email: String(email).trim(), name: name || email, passwordHash, role: role === 'admin' ? 'admin' : 'editor', createdAt: new Date().toISOString() }));
  return json(safe(), 201);
}

export async function DELETE(req: Request) {
  const s = await requireSession();
  if (!s || s.role !== 'admin') return fail('Only admins can remove users', 403);
  const { id } = await req.json();
  if (id === s.sub) return fail('You cannot remove yourself');
  writeDb((d) => {
    d.users = d.users.filter((u) => u.id !== id);
  });
  return json(safe());
}
