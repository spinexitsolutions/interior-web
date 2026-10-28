// Procedural PBR texture maps (fabric weave, wood grain, travertine, brushed metal) generated
// on a canvas at runtime — no image downloads, tiny bundle, Blender-like surface detail.
// Browser-only: returns null under Node so the GLB exporter keeps working.
import * as THREE from 'three';

const SIZE = 256;
const cache = new Map<string, THREE.Texture | null>();

function rand(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Tileable value noise (wraps at `period`). */
function makeNoise(period: number, seed: number) {
  const r = rand(seed);
  const grid = Array.from({ length: period * period }, r);
  const at = (x: number, y: number) => grid[((y % period) + period) % period * period + (((x % period) + period) % period)];
  const fade = (t: number) => t * t * (3 - 2 * t);
  return (u: number, v: number) => {
    const x = u * period;
    const y = v * period;
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = fade(x - xi);
    const yf = fade(y - yi);
    const a = at(xi, yi) + (at(xi + 1, yi) - at(xi, yi)) * xf;
    const b = at(xi, yi + 1) + (at(xi + 1, yi + 1) - at(xi, yi + 1)) * xf;
    return a + (b - a) * yf;
  };
}

function fbm(u: number, v: number, layers: ((u: number, v: number) => number)[]) {
  let sum = 0;
  let amp = 0.5;
  let norm = 0;
  for (const n of layers) {
    sum += n(u, v) * amp;
    norm += amp;
    amp *= 0.5;
  }
  return sum / norm;
}

function canvasTexture(draw: (data: Uint8ClampedArray) => void, colorSpace: THREE.ColorSpace, repeat: number) {
  const c = document.createElement('canvas');
  c.width = c.height = SIZE;
  const ctx = c.getContext('2d')!;
  const img = ctx.createImageData(SIZE, SIZE);
  draw(img.data);
  ctx.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat, repeat);
  t.colorSpace = colorSpace;
  t.anisotropy = 8;
  t.needsUpdate = true;
  return t;
}

/** Converts a height field into a tangent-space normal map. */
function heightToNormal(h: Float32Array, strength: number) {
  return (d: Uint8ClampedArray) => {
    for (let y = 0; y < SIZE; y++)
      for (let x = 0; x < SIZE; x++) {
        const l = h[y * SIZE + ((x - 1 + SIZE) % SIZE)];
        const r = h[y * SIZE + ((x + 1) % SIZE)];
        const u = h[((y - 1 + SIZE) % SIZE) * SIZE + x];
        const dn = h[((y + 1) % SIZE) * SIZE + x];
        let nx = (l - r) * strength;
        let ny = (u - dn) * strength;
        let nz = 1;
        const len = Math.hypot(nx, ny, nz);
        nx /= len;
        ny /= len;
        nz /= len;
        const i = (y * SIZE + x) * 4;
        d[i] = (nx * 0.5 + 0.5) * 255;
        d[i + 1] = (ny * 0.5 + 0.5) * 255;
        d[i + 2] = (nz * 0.5 + 0.5) * 255;
        d[i + 3] = 255;
      }
  };
}

function gray(h: Float32Array, lo: number, hi: number) {
  return (d: Uint8ClampedArray) => {
    for (let i = 0; i < h.length; i++) {
      const v = (lo + (hi - lo) * h[i]) * 255;
      d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = v;
      d[i * 4 + 3] = 255;
    }
  };
}

function field(fn: (u: number, v: number) => number) {
  const h = new Float32Array(SIZE * SIZE);
  for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) h[y * SIZE + x] = fn(x / SIZE, y / SIZE);
  return h;
}

function memo(key: string, make: () => THREE.Texture) {
  if (typeof document === 'undefined') return null;
  if (!cache.has(key)) cache.set(key, make());
  return cache.get(key)!;
}

// ------------------------------------------------------------------ fabric (bouclé / linen weave)
let fabricH: Float32Array | null = null;
const fabricHeight = () =>
  (fabricH ??= (() => {
    const n = [makeNoise(32, 3), makeNoise(64, 7), makeNoise(128, 11)];
    return field((u, v) => {
      const weave = 0.5 + 0.25 * Math.sin(u * Math.PI * 2 * 40) * Math.sin(v * Math.PI * 2 * 40) + 0.25 * Math.sin((u + v) * Math.PI * 2 * 20);
      const loops = fbm(u, v, n);
      return weave * 0.45 + loops * 0.55;
    });
  })());
export const fabricNormal = () => memo('fabricN', () => canvasTexture(heightToNormal(fabricHeight(), 3.2), THREE.NoColorSpace, 6));
export const fabricRough = () => memo('fabricR', () => canvasTexture(gray(fabricHeight(), 0.82, 1), THREE.NoColorSpace, 6));

// ------------------------------------------------------------------ wood grain
let woodH: Float32Array | null = null;
const woodHeight = () =>
  (woodH ??= (() => {
    const warp = makeNoise(8, 21);
    const fine = makeNoise(128, 5);
    return field((u, v) => {
      const w = warp(u, v) * 6;
      const rings = 0.5 + 0.5 * Math.sin((u * 18 + w) * Math.PI * 2);
      return Math.pow(rings, 3) * 0.7 + fine(u * 0.15, v) * 0.3;
    });
  })());
export const woodMap = () => memo('woodC', () => canvasTexture(gray(woodHeight(), 0.72, 1.0), THREE.SRGBColorSpace, 1));
export const woodRough = () => memo('woodR', () => canvasTexture(gray(woodHeight(), 0.42, 0.62), THREE.NoColorSpace, 1));
export const woodNormal = () => memo('woodN', () => canvasTexture(heightToNormal(woodHeight(), 1.2), THREE.NoColorSpace, 1));

// ------------------------------------------------------------------ travertine / stone
let stoneH: Float32Array | null = null;
const stoneHeight = () =>
  (stoneH ??= (() => {
    const n = [makeNoise(4, 31), makeNoise(16, 37), makeNoise(64, 41), makeNoise(128, 43)];
    const pores = makeNoise(128, 47);
    return field((u, v) => {
      const veins = 0.5 + 0.5 * Math.sin((v * 6 + fbm(u, v, n) * 3) * Math.PI * 2);
      const p = pores(u, v) > 0.82 ? 0.35 : 1;
      return (0.65 + 0.35 * veins) * p;
    });
  })());
export const stoneMap = () => memo('stoneC', () => canvasTexture(gray(stoneHeight(), 0.8, 1.0), THREE.SRGBColorSpace, 1));
export const stoneNormal = () => memo('stoneN', () => canvasTexture(heightToNormal(stoneHeight(), 0.9), THREE.NoColorSpace, 1));

// ------------------------------------------------------------------ brushed metal
let metalH: Float32Array | null = null;
const metalHeight = () =>
  (metalH ??= (() => {
    const n = makeNoise(256, 53);
    return field((u, v) => n(u * 0.02, v));
  })());
export const metalRough = () => memo('metalR', () => canvasTexture(gray(metalHeight(), 0.18, 0.38), THREE.NoColorSpace, 2));
