import fs from 'node:fs';
import path from 'node:path';
import { UPLOAD_DIR } from '@/lib/db';

const TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.avif': 'image/avif', '.gif': 'image/gif',
  '.glb': 'model/gltf-binary', '.gltf': 'model/gltf+json', '.usdz': 'model/vnd.usdz+zip', '.mp4': 'video/mp4', '.webm': 'video/webm', '.pdf': 'application/pdf',
};

export async function GET(_: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const rel = (await params).path.join('/');
  const file = path.resolve(UPLOAD_DIR, rel);
  if (!file.startsWith(path.resolve(UPLOAD_DIR) + path.sep) || !fs.existsSync(file)) return new Response('Not found', { status: 404 });
  const type = TYPES[path.extname(file).toLowerCase()];
  if (!type) return new Response('Not found', { status: 404 });
  return new Response(fs.readFileSync(file), {
    headers: { 'content-type': type, 'cache-control': 'public, max-age=31536000, immutable', 'x-content-type-options': 'nosniff' },
  });
}
