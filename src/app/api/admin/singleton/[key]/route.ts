import { revalidatePath } from 'next/cache';
import { isSingleton, readDb, writeDb } from '@/lib/db';
import { fail, json, requireSession } from '@/lib/api';

type Ctx = { params: Promise<{ key: string }> };

export async function GET(_: Request, { params }: Ctx) {
  const { key } = await params;
  if (!isSingleton(key)) return fail('Not found', 404);
  return json(readDb()[key]);
}

export async function PUT(req: Request, { params }: Ctx) {
  if (!(await requireSession())) return fail('Unauthorised', 401);
  const { key } = await params;
  if (!isSingleton(key)) return fail('Not found', 404);
  const body = await req.json();
  if (!body || typeof body !== 'object') return fail('Invalid body');
  const db = writeDb((d) => {
    (d as any)[key] = { ...(d as any)[key], ...body };
  });
  revalidatePath('/', 'layout');
  return json(db[key]);
}
