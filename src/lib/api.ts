import 'server-only';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { SESSION_COOKIE, verifySession } from './auth';

export const json = (data: unknown, status = 200) => NextResponse.json(data, { status });
export const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });

/** Defence in depth: middleware already guards /api/admin, this re-checks inside handlers. */
export async function requireSession() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return verifySession(token);
}
