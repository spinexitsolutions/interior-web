import { revalidatePath } from 'next/cache';
import { isCollection, readDb, uid, writeDb } from '@/lib/db';
import { fail, json, requireSession } from '@/lib/api';
import { slugify } from '@/lib/utils';

type Ctx = { params: Promise<{ key: string }> };
const BLOCKED = new Set(['users']);

export async function GET(_: Request, { params }: Ctx) {
  const { key } = await params;
  if (!isCollection(key) || BLOCKED.has(key)) return fail('Not found', 404);
  return json(readDb()[key]);
}

export async function POST(req: Request, { params }: Ctx) {
  if (!(await requireSession())) return fail('Unauthorised', 401);
  const { key } = await params;
  if (!isCollection(key) || BLOCKED.has(key)) return fail('Not found', 404);
  const body = await req.json();
  const list = readDb()[key] as any[];
  const item: any = { ...body, id: uid(), createdAt: new Date().toISOString() };
  if ('slug' in item || item.title || item.name) {
    item.slug = slugify(item.slug || item.title || item.name || item.id);
    while (list.some((x) => x.slug === item.slug)) item.slug += '-2';
  }
  if (typeof item.order !== 'number') item.order = list.length + 1;
  writeDb((d) => {
    (d[key] as any[]).push(item);
  });
  revalidatePath('/', 'layout');
  return json(item, 201);
}
