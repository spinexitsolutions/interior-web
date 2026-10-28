import type { Palette } from '@/lib/furniture/builders';

export interface Piece {
  key: string;
  pos: [number, number, number];
  rot?: number;
  scale?: number;
  palette?: Palette;
}
export interface Scene {
  bg: string;
  floor: string;
  wall?: string;
  wallZ?: number;
  sideWall?: { x: number; color: string };
  arch?: { x: number; w: number; h: number; color: string };
  window?: { pos: [number, number, number]; size: [number, number]; rot?: number };
  sun?: [number, number, number];
  cam: [number, number, number];
  target: [number, number, number];
  fov?: number;
  light?: number;
  warm?: string;
  exposure?: number;
  pieces: Piece[];
  size?: [number, number];
}

const studio = (key: string, palette: Palette = {}, extra: Partial<Scene> = {}): Scene => ({
  bg: '#e4ddd0',
  floor: '#ddd5c7',
  wall: '#e4ddd0',
  wallZ: -3,
  cam: [2.6, 1.5, 3.6],
  target: [0, 0.55, 0],
  fov: 32,
  sun: [3, 6, 4],
  pieces: [{ key, pos: [0, 0, 0], rot: -0.35, palette }],
  size: [1000, 1250],
  ...extra,
});

export const SCENES: Record<string, Scene> = {
  // ---------------- products
  'product-lune-chair': studio('lune-chair', { upholstery: '#c9b79c' }),
  'product-arc-sofa': studio('arc-sofa', { upholstery: '#8a8f7a' }, { cam: [3.4, 1.8, 4.6], target: [0, 0.45, 0] }),
  'product-halo-lamp': studio('halo-lamp', {}, { cam: [3.2, 1.6, 4.8], target: [0.35, 1.0, 0], bg: '#d9d1c3', wall: '#d9d1c3' }),
  'product-mono-table': studio('mono-table', {}, { cam: [2.6, 1.8, 3.4], target: [0, 0.45, 0] }),
  'product-strata-sideboard': studio('strata-sideboard', {}, { cam: [2.2, 1.3, 3.4], target: [0, 0.45, 0], pieces: [{ key: 'strata-sideboard', pos: [0, 0, 0], rot: -0.4 }, { key: 'vase', pos: [-0.45, 0.81, 0.05], rot: -0.4 }, { key: 'books', pos: [0.45, 0.81, 0], rot: -0.6 }] }),
  'product-orb-table': studio('orb-table', {}, { cam: [1.5, 1.0, 2.1], target: [0, 0.3, 0] }),
  'product-kova-armchair': studio('kova-armchair', {}, { cam: [2.4, 1.5, 3.3], target: [0, 0.45, 0], bg: '#e9dfd2', wall: '#e9dfd2' }),
  'product-nest-bed': studio('nest-bed', {}, { cam: [3.6, 2.4, 4.4], target: [0, 0.4, 0] }),

  // ---------------- categories
  'cat-seating': { ...studio('lune-chair'), pieces: [{ key: 'lune-chair', pos: [-0.6, 0, 0.2], rot: 0.4, palette: { upholstery: '#b4532a' } }, { key: 'kova-armchair', pos: [0.8, 0, -0.3], rot: -0.5, palette: { upholstery: '#c9b79c' } }], cam: [0.4, 1.6, 4.4], target: [0.1, 0.5, 0], bg: '#d8cbb8', wall: '#d8cbb8', floor: '#cdbfa9' },
  'cat-tables': { ...studio('mono-table'), pieces: [{ key: 'mono-table', pos: [-0.3, 0, -0.2] }, { key: 'orb-table', pos: [0.95, 0, 0.6], palette: { stone: '#5f6a45' } }, { key: 'vase', pos: [-0.3, 0.77, -0.2] }], cam: [1.0, 1.7, 4.0], target: [0.2, 0.5, 0] },
  'cat-lighting': { ...studio('halo-lamp'), bg: '#2b2620', wall: '#2b2620', floor: '#3a3129', light: 0.55, pieces: [{ key: 'halo-lamp', pos: [-0.5, 0, 0] }, { key: 'lune-chair', pos: [0.45, 0, 0.35], rot: -0.5, palette: { upholstery: '#c9b79c' } }], cam: [1.2, 1.4, 4.2], target: [0.1, 0.9, 0], exposure: 0.95 },
  'cat-storage': { ...studio('strata-sideboard'), pieces: [{ key: 'strata-sideboard', pos: [0, 0, 0], rot: -0.2, palette: { wood: '#cdb58f' } }, { key: 'vase', pos: [-0.5, 0.81, 0], scale: 1.2 }, { key: 'plant', pos: [1.35, 0, 0.1] }], cam: [0.8, 1.2, 3.6], target: [0.2, 0.55, 0], bg: '#cfd2c4', wall: '#cfd2c4', floor: '#c4c1b0' },
  'cat-bedroom': { ...studio('nest-bed'), pieces: [{ key: 'nest-bed', pos: [0, 0, 0], rot: -0.3 }, { key: 'orb-table', pos: [1.35, 0, -0.75], palette: { stone: '#e8e2d6' } }], cam: [3.4, 2.0, 4.0], target: [0.3, 0.45, -0.2], bg: '#e6dccd', wall: '#e6dccd' },

  // ---------------- interiors (projects)
  'project-1': { bg: '#e8e1d5', floor: '#cbbca4', wall: '#e8e1d5', wallZ: -2.8, sideWall: { x: -3.6, color: '#e2dacc' }, window: { pos: [-3.58, 1.7, -0.6], size: [1.6, 2.4], rot: Math.PI / 2 }, sun: [-6, 5, 1], arch: { x: 0.6, w: 2.0, h: 2.1, color: '#d9cdb9' }, cam: [2.8, 1.5, 5.2], target: [0, 0.6, -0.8], fov: 40, pieces: [{ key: 'rug', pos: [0, 0, -0.4] }, { key: 'arc-sofa', pos: [0.4, 0, -1.8], palette: { upholstery: '#d6c7ad' } }, { key: 'orb-table', pos: [0.3, 0, -0.4], scale: 1.1, palette: { stone: '#b4532a' } }, { key: 'lune-chair', pos: [-1.6, 0, -0.2], rot: 0.9, palette: { upholstery: '#c9b79c' } }, { key: 'halo-lamp', pos: [2.1, 0, -2.0], rot: Math.PI }, { key: 'plant', pos: [-2.8, 0, -2.2], scale: 1.3 }] },
  'project-2': { bg: '#d9b9a0', floor: '#b98a68', wall: '#d39f80', wallZ: -2.5, arch: { x: 0, w: 2.6, h: 2.2, color: '#b4532a' }, sun: [4, 6, 3], cam: [0.2, 1.4, 5.4], target: [0, 0.8, -1], fov: 38, warm: '#ffd9b0', pieces: [{ key: 'kova-armchair', pos: [-1.3, 0, -0.9], rot: 0.5, palette: { upholstery: '#e6dccb' } }, { key: 'kova-armchair', pos: [1.3, 0, -0.9], rot: -0.5, palette: { upholstery: '#e6dccb' } }, { key: 'orb-table', pos: [0, 0, -0.6], palette: { stone: '#2f3b2c' } }, { key: 'plant', pos: [0, 0, -2.0], scale: 1.4 }, { key: 'rug', pos: [0, 0, -0.6] }] },
  'project-3': { bg: '#efe7da', floor: '#d6c6ae', wall: '#ece3d4', wallZ: -2.4, sun: [3, 5, 5], cam: [2.4, 2.0, 4.6], target: [0, 0.6, -0.7], fov: 38, pieces: [{ key: 'mono-table', pos: [-0.9, 0, -0.9], palette: { stone: '#e3dccf' } }, { key: 'orb-table', pos: [0.7, 0, -0.4], palette: { stone: '#5f6a45' } }, { key: 'orb-table', pos: [1.5, 0, -1.4], palette: { stone: '#b4532a' } }, { key: 'vase', pos: [-0.9, 0.77, -0.9] }, { key: 'halo-lamp', pos: [-2.4, 0, -1.6], rot: 0.4 }, { key: 'plant', pos: [2.4, 0, -2.0] }] },
  'project-4': { bg: '#dcd8cc', floor: '#c7bfae', wall: '#dcd8cc', wallZ: -1.6, sideWall: { x: 2.6, color: '#d3cec0' }, sun: [-4, 6, 4], cam: [-1.8, 1.4, 3.6], target: [0.4, 0.6, -0.6], fov: 40, pieces: [{ key: 'strata-sideboard', pos: [0.3, 0, -1.3], palette: { wood: '#cdb58f' } }, { key: 'books', pos: [0.8, 0.81, -1.3] }, { key: 'vase', pos: [-0.1, 0.81, -1.3] }, { key: 'lune-chair', pos: [-0.8, 0, 0.2], rot: 0.6, palette: { upholstery: '#2a2a2e' } }, { key: 'halo-lamp', pos: [1.8, 0, 0], rot: Math.PI * 0.9 }] },
  'project-5': { bg: '#cfd3c6', floor: '#b7b49c', wall: '#cfd3c6', wallZ: -3, sun: [5, 5, 2], window: { pos: [-1.6, 1.6, -2.98], size: [2.2, 2.6] }, cam: [3.0, 1.6, 4.6], target: [0, 0.5, -1], fov: 38, pieces: [{ key: 'arc-sofa', pos: [0, 0, -1.6], palette: { upholstery: '#e6dccb' } }, { key: 'rug', pos: [0, 0, -0.4] }, { key: 'mono-table', pos: [0, 0, -0.3], scale: 0.62, palette: { stone: '#2b2a28' } }, { key: 'kova-armchair', pos: [1.8, 0, -0.1], rot: -1.1, palette: { upholstery: '#2f3b2c' } }, { key: 'plant', pos: [-2.0, 0, -2.4], scale: 1.5 }] },
  'project-6': { bg: '#3a3a2c', floor: '#4a3d2c', wall: '#4a5038', wallZ: -2.4, light: 0.7, sun: [3, 6, 4], cam: [0, 1.7, 4.8], target: [0, 0.6, -0.6], fov: 40, exposure: 1.1, pieces: [{ key: 'mono-table', pos: [0, 0, -0.6] }, { key: 'lune-chair', pos: [-1.1, 0, -0.4], rot: 1.2, palette: { upholstery: '#5c6b4a' } }, { key: 'lune-chair', pos: [1.1, 0, -0.4], rot: -1.2, palette: { upholstery: '#b4532a' } }, { key: 'lune-chair', pos: [0, 0, -1.7], rot: 0, palette: { upholstery: '#c9b79c' } }, { key: 'halo-lamp', pos: [-1.9, 0, -1.6], rot: -0.6, palette: { metal: '#b08d57' } }] },

  // ---------------- journal + studio
  'post-1': { ...studio('plant'), pieces: [{ key: 'plant', pos: [-0.5, 0, 0], scale: 1.4 }, { key: 'lune-chair', pos: [0.6, 0, 0.1], rot: -0.6, palette: { upholstery: '#8a8f7a' } }], bg: '#cfd2c4', wall: '#cfd2c4', floor: '#bfbda9', cam: [0.6, 1.4, 4], target: [0, 0.7, 0] },
  'post-2': { ...studio('orb-table'), pieces: [{ key: 'arc-sofa', pos: [0, 0, -0.6], palette: { upholstery: '#9c4a2a' } }, { key: 'rug', pos: [0, 0, 0.4] }], cam: [0.0, 2.6, 4.2], target: [0, 0.3, 0], bg: '#d8d0c1', wall: '#d8d0c1' },
  'post-3': { ...studio('lune-chair'), pieces: [{ key: 'lune-chair', pos: [0, 0, 0], rot: 0.2, palette: { upholstery: '#e6dccb' } }, { key: 'orb-table', pos: [0.75, 0, 0.1] }], bg: '#b4532a', wall: '#b4532a', floor: '#a14a25', cam: [0.6, 1.0, 3.2], target: [0.25, 0.5, 0] },
  'post-4': { ...studio('strata-sideboard'), pieces: [{ key: 'strata-sideboard', pos: [0, 0, 0], rot: -0.9 }], cam: [1.1, 0.75, 1.6], target: [0, 0.5, 0], bg: '#d9d1c3', wall: '#d9d1c3' },
  'studio-1': { ...studio('kova-armchair'), pieces: [{ key: 'kova-armchair', pos: [-0.4, 0, 0], rot: 0.3, palette: { upholstery: '#b4532a' } }, { key: 'halo-lamp', pos: [0.6, 0, -0.5], rot: Math.PI * 0.8 }, { key: 'plant', pos: [-1.4, 0, -0.8] }], bg: '#e2d9cb', wall: '#e2d9cb', cam: [0.4, 1.3, 4.6], target: [0, 0.8, 0] },
  'studio-2': { ...studio('mono-table'), pieces: [{ key: 'mono-table', pos: [0, 0, 0], palette: { stone: '#8e4b3c' } }, { key: 'vase', pos: [0.2, 0.77, 0.1] }, { key: 'books', pos: [-0.25, 0.77, -0.1] }], cam: [1.4, 1.6, 2.2], target: [0, 0.6, 0], bg: '#e9e4da', wall: '#e9e4da' },
};
