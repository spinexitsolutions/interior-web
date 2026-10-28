import { SignJWT, jwtVerify } from 'jose';

export const SESSION_COOKIE = 'forma_session';
const secret = () => new TextEncoder().encode(process.env.AUTH_SECRET || 'dev-only-insecure-secret-change-me');

export interface Session {
  sub: string;
  email: string;
  name: string;
  role: string;
}

export async function signSession(s: Session) {
  return new SignJWT({ ...s }).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('7d').sign(secret());
}

export async function verifySession(token?: string | null): Promise<Session | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload as unknown as Session;
  } catch {
    return null;
  }
}
