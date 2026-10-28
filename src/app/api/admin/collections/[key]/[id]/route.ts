import { revalidatePath } from 'next/cache';
import { isCollection, readDb, writeDb } from '@/lib/db';
import { fail, json, requireSession } from '@/lib/api';
import { slugify } from '@/lib/utils';

type Ctx = { params: Promise<{ key: string; id: string }> };
const BLOCKED = new Set(['users']);

async function guard(params: Ctx['params']) {
  const { key, id } = await params;
  if (!isCollection(key) || BLOCKED.has(key)) return { error: fail('Not found', 404) };
  return { key, id };
}

export async function GET(_: Request, { params }: Ctx) {
  const g = await guard(params);
  if ('error' in g) return g.error;
  const item = (readDb()[g.key] as any[]).find((x) => x.id === g.id);
  return item ? json(item) : fail('Not found', 404);
}

export async function PUT(req: Request, { params }: Ctx) {
  if (!(await requireSession())) return fail('Unauthorised', 401);
  const g = await guard(params);
  if ('error' in g) return g.error;
  const body = await req.json();
  let updated: any = null;
  writeDb((d) => {
    const list = d[g.key] as any[];
    const i = list.findIndex((x) => x.id === g.id);
    if (i < 0) return;
    const next = { ...list[i], ...body, id: g.id };
    if ('slug' in next) {
      next.slug = slugify(next.slug || next.title || next.name || g.id);
      if (list.some((x, j) => j !== i && x.slug === next.slug)) next.slug += '-2';
    }
    list[i] = next;
    updated = next;
  });
  revalidatePath('/', 'layout');
  return updated ? json(updated) : fail('Not found', 404);
}

export async function DELETE(_: Request, { params }: Ctx) {
  if (!(await requireSession())) return fail('Unauthorised', 401);
  const g = await guard(params);
  if ('error' in g) return g.error;
  if (g.key === 'pages' && g.id === 'home') return fail('The homepage cannot be deleted');
  writeDb((d) => {
    (d as any)[g.key] = (d[g.key] as any[]).filter((x) => x.id !== g.id);
  });
  revalidatePath('/', 'layout');
  return json({ ok: true });
}
