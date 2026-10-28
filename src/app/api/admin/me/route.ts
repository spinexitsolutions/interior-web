import { fail, json, requireSession } from '@/lib/api';

export async function GET() {
  const s = await requireSession();
  return s ? json(s) : fail('Unauthorised', 401);
}
