'use client';
import { OrbitScene } from '../three/Scenes';
import { resolveModel } from '@/lib/models';
import type { Palette } from '@/lib/furniture/builders';

export default function ModelPreview({ value, modelUrl, palette = {} }: { value?: string; modelUrl?: string; palette?: Palette }) {
  const src = modelUrl ? { model: '', modelUrl } : resolveModel(value);
  return <OrbitScene {...src} palette={palette} size={1.8} camera={[2.8, 1.7, 4]} />;
}
