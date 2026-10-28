/** A "model" field holds either a built-in model key or a URL to an uploaded .glb. */
export function resolveModel(value?: string) {
  if (value && (value.startsWith('/') || value.startsWith('http'))) return { model: '', modelUrl: value };
  return { model: value || 'lune-chair', modelUrl: '' };
}
