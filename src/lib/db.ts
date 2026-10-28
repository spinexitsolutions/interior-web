// Tiny JSON-file database. Keeps the whole CMS in data/db.json (seeded on first boot) so the
// project runs anywhere with zero infrastructure. Swap this module for Postgres/Mongo later —
// every read/write in the app goes through the helpers below.
import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import type { CollectionKey, Database, SingletonKey } from './types';
import { seedDatabase } from './seed';

export const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
export const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
const DB_FILE = path.join(DATA_DIR, 'db.json');

let cache: { db: Database; mtime: number } | null = null;

function create(): Database {
  const email = process.env.ADMIN_EMAIL || 'admin@forma.studio';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const db: Database = {
    ...seedDatabase(),
    users: [{ id: 'u1', email, name: 'Studio Admin', passwordHash: bcrypt.hashSync(password, 10), role: 'admin', createdAt: new Date().toISOString() }],
  };
  persist(db);
  return db;
}

function persist(db: Database) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = `${DB_FILE}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, DB_FILE);
  cache = { db, mtime: fs.statSync(DB_FILE).mtimeMs };
}

export function readDb(): Database {
  if (!fs.existsSync(DB_FILE)) return create();
  const mtime = fs.statSync(DB_FILE).mtimeMs;
  if (cache && cache.mtime === mtime) return cache.db;
  const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')) as Database;
  cache = { db, mtime };
  return db;
}

export function writeDb(mutator: (db: Database) => void) {
  const db = structuredClone(readDb());
  mutator(db);
  persist(db);
  return db;
}

export function resetDb() {
  const users = readDb().users;
  const db: Database = { ...seedDatabase(), users };
  persist(db);
}

export const COLLECTION_KEYS: CollectionKey[] = ['pages', 'products', 'categories', 'projects', 'posts', 'testimonials', 'inquiries', 'media', 'users'];
export const SINGLETON_KEYS: SingletonKey[] = ['theme', 'settings'];

export const isCollection = (k: string): k is CollectionKey => (COLLECTION_KEYS as string[]).includes(k);
export const isSingleton = (k: string): k is SingletonKey => (SINGLETON_KEYS as string[]).includes(k);

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
