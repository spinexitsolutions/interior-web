import { revalidatePath } from 'next/cache';
import { isCollection, writeDb } from '@/lib/db';
import { fail, json, requireSession } from '@/lib/api';

export async function POST(req: Request, { params }: { params: Promise<{ key: string }> }) {
  if (!(await requireSession())) return fail('Unauthorised', 401);
  const { key } = await params;
  if (!isCollection(key) || key === 'users') return fail('Not found', 404);
  const { ids } = (await req.json()) as { ids: string[] };
  if (!Array.isArray(ids)) return fail('ids required');
  writeDb((d) => {
    (d[key] as any[]).forEach((x) => {
      const i = ids.indexOf(x.id);
      if (i >= 0) x.order = i + 1;
    });
  });
  revalidatePath('/', 'layout');
  return json({ ok: true });
}
