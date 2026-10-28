import { readDb } from '@/lib/db';
import { fail, json, requireSession } from '@/lib/api';

export async function GET() {
  if (!(await requireSession())) return fail('Unauthorised', 401);
  const d = readDb();
  return json({
    products: d.products.length,
    projects: d.projects.length,
    posts: d.posts.length,
    pages: d.pages.length,
    media: d.media.length,
    inquiries: d.inquiries.length,
    unread: d.inquiries.filter((i) => !i.read).length,
    latestInquiries: [...d.inquiries].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5),
    drafts: [...d.products, ...d.projects, ...d.posts, ...d.pages].filter((x: any) => x.status === 'draft').length,
  });
}
