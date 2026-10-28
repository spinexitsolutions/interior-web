import fs from 'node:fs';
import path from 'node:path';
import { UPLOAD_DIR, uid, writeDb } from '@/lib/db';
import { fail, json, requireSession } from '@/lib/api';
import type { Media } from '@/lib/types';

const ALLOWED: Record<string, string> = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.avif': 'image/avif', '.gif': 'image/gif',
  '.glb': 'model/gltf-binary', '.gltf': 'model/gltf+json', '.usdz': 'model/vnd.usdz+zip', '.mp4': 'video/mp4', '.webm': 'video/webm', '.pdf': 'application/pdf',
};
const MAX = 60 * 1024 * 1024;

export async function POST(req: Request) {
  if (!(await requireSession())) return fail('Unauthorised', 401);
  const form = await req.formData();
  const files = form.getAll('file').filter((f): f is File => f instanceof File);
  if (!files.length) return fail('No file');
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const created: Media[] = [];
  for (const file of files) {
    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED[ext]) return fail(`File type ${ext || '?'} is not allowed`);
    if (file.size > MAX) return fail('File is larger than 60MB');
    const base = path.basename(file.name, ext).toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40) || 'file';
    const filename = `${uid()}-${base}${ext}`;
    fs.writeFileSync(path.join(UPLOAD_DIR, filename), Buffer.from(await file.arrayBuffer()));
    created.push({ id: uid(), filename, url: `/media/${filename}`, mime: ALLOWED[ext], size: file.size, alt: '', createdAt: new Date().toISOString() });
  }
  writeDb((d) => d.media.unshift(...created));
  return json(created, 201);
}
