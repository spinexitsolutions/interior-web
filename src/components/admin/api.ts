'use client';

export async function api<T = any>(url: string, init?: RequestInit & { json?: unknown }): Promise<T> {
  const { json, ...rest } = init || {};
  const res = await fetch(url, {
    ...rest,
    headers: { ...(json !== undefined ? { 'content-type': 'application/json' } : {}), ...(rest.headers || {}) },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
    cache: 'no-store',
  });
  if (res.status === 401 && typeof window !== 'undefined') {
    window.location.href = `/admin/login?next=${encodeURIComponent(window.location.pathname)}`;
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data as T;
}

export async function upload(files: FileList | File[]) {
  const fd = new FormData();
  Array.from(files).forEach((f) => fd.append('file', f));
  return api<{ id: string; url: string; filename: string; mime: string }[]>('/api/admin/upload', { method: 'POST', body: fd });
}

export const collectionUrl = (key: string, id?: string) => `/api/admin/collections/${key}${id ? `/${id}` : ''}`;
