import { revalidatePath } from 'next/cache';
import { resetDb } from '@/lib/db';
import { fail, json, requireSession } from '@/lib/api';

export async function POST() {
  const s = await requireSession();
  if (!s || s.role !== 'admin') return fail('Only admins can reset content', 403);
  resetDb();
  revalidatePath('/', 'layout');
  return json({ ok: true });
}
