// Procedural furniture library. Pure three.js (no DOM) so the exact same geometry is used
// in the browser (live 3D, configurator, VR showroom) and in Node (scripts/generate-models.mts
// exports them to .glb / .usdz for AR). Units are metres, origin = floor centre.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { fabricNormal, fabricRough, metalRough, stoneMap, stoneNormal, woodMap, woodNormal, woodRough } from './textures.ts';

export type Slot = 'upholstery' | 'wood' | 'metal' | 'stone' | 'accent' | 'light';
export type Palette = Partial<Record<Slot, string>>;

export interface ModelInfo {
  key: string;
  label: string;
  defaults: Palette;
  slots: Slot[];
}

export const MODEL_LIBRARY: ModelInfo[] = [
  { key: 'lune-chair', label: 'Lune Lounge Chair', slots: ['upholstery', 'wood'], defaults: { upholstery: '#c9b79c', wood: '#5b3a24' } },
  { key: 'arc-sofa', label: 'Arc Sofa', slots: ['upholstery', 'wood'], defaults: { upholstery: '#8a8f7a', wood: '#3e2a1d' } },
  { key: 'halo-lamp', label: 'Halo Floor Lamp', slots: ['metal', 'stone', 'light'], defaults: { metal: '#b08d57', stone: '#d9d2c5', light: '#fff1d6' } },
  { key: 'mono-table', label: 'Mono Dining Table', slots: ['stone', 'wood'], defaults: { stone: '#e3dccf', wood: '#6b4a32' } },
  { key: 'strata-sideboard', label: 'Strata Sideboard', slots: ['wood', 'stone', 'metal'], defaults: { wood: '#7a5134', stone: '#2b2a28', metal: '#1c1b19' } },
  { key: 'orb-table', label: 'Orb Side Table', slots: ['stone', 'accent'], defaults: { stone: '#b4532a', accent: '#e9e4da' } },
  { key: 'kova-armchair', label: 'Kova Armchair', slots: ['upholstery', 'metal'], defaults: { upholstery: '#b4532a', metal: '#1c1b19' } },
  { key: 'nest-bed', label: 'Nest Bed', slots: ['upholstery', 'wood', 'accent'], defaults: { upholstery: '#d8cdbb', wood: '#5b3a24', accent: '#f3efe8' } },
];

export const DECOR_KEYS = ['plant', 'vase', 'rug', 'books'] as const;

const ROUGH: Record<Slot, number> = { upholstery: 1, wood: 0.5, metal: 0.28, stone: 0.38, accent: 0.55, light: 0.4 };
const METAL: Record<Slot, number> = { upholstery: 0, wood: 0, metal: 1, stone: 0, accent: 0.02, light: 0 };

/** Physically based materials per slot: fabric sheen, lacquered wood, honed stone, brushed metal. */
export function makeMaterial(slot: Slot, color: string) {
  const m = new THREE.MeshPhysicalMaterial({ name: slot, color: new THREE.Color(color), roughness: ROUGH[slot], metalness: METAL[slot] });
  switch (slot) {
    case 'upholstery': {
      // velvet-like fabric response + woven micro-surface
      m.sheen = 0.7;
      m.sheenRoughness = 0.6;
      m.sheenColor = new THREE.Color(color).lerp(new THREE.Color('#ffffff'), 0.15);
      const n = fabricNormal();
      if (n) {
        m.normalMap = n;
        m.normalScale.set(0.55, 0.55);
        m.roughnessMap = fabricRough();
      }
      break;
    }
    case 'wood': {
      m.clearcoat = 0.35;
      m.clearcoatRoughness = 0.45;
      const map = woodMap();
      if (map) {
        m.map = map;
        m.roughnessMap = woodRough();
        m.normalMap = woodNormal();
        m.normalScale.set(0.25, 0.25);
      }
      break;
    }
    case 'stone': {
      m.clearcoat = 0.2;
      m.clearcoatRoughness = 0.35;
      const map = stoneMap();
      if (map) {
        m.map = map;
        m.normalMap = stoneNormal();
        m.normalScale.set(0.35, 0.35);
      }
      break;
    }
    case 'metal': {
      const r = metalRough();
      if (r) m.roughnessMap = r;
      m.roughness = 0.9; // multiplied by the brushed roughness map
      if (!r) m.roughness = 0.28;
      break;
    }
    case 'accent':
      m.clearcoat = 0.5;
      m.clearcoatRoughness = 0.3;
      break;
    case 'light':
      m.emissive = new THREE.Color(color);
      m.emissiveIntensity = 2.2;
      m.toneMapped = false;
      break;
  }
  return m;
}

function mats(palette: Palette, defaults: Palette) {
  const cache = new Map<Slot, THREE.MeshPhysicalMaterial>();
  return (slot: Slot) => {
    let m = cache.get(slot);
    if (!m) {
      m = makeMaterial(slot, palette[slot] ?? defaults[slot] ?? '#cccccc');
      cache.set(slot, m);
    }
    return m;
  };
}

function mesh(geo: THREE.BufferGeometry, mat: THREE.Material, name: string, pos: [number, number, number], rot: [number, number, number] = [0, 0, 0]) {
  const m = new THREE.Mesh(geo, mat);
  m.name = name;
  m.position.set(...pos);
  m.rotation.set(...rot);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

const rbox = (w: number, h: number, d: number, r = 0.04, seg = 4) => new RoundedBoxGeometry(w, h, d, seg, Math.min(r, w / 2, h / 2, d / 2));

function taperedLeg(top: number, bottom: number, h: number) {
  return new THREE.CylinderGeometry(top, bottom, h, 20);
}

// ---------------------------------------------------------------- products

/** Soft rounded "puck" (cushion / seat) made from a lathe profile. */
function puck(r: number, h: number, round = Math.min(h / 2, 0.05)) {
  const pts: THREE.Vector2[] = [new THREE.Vector2(0, 0)];
  const seg = 8;
  for (let i = 0; i <= seg; i++) {
    const a = -Math.PI / 2 + (i / seg) * (Math.PI / 2);
    pts.push(new THREE.Vector2(r - round + Math.cos(a) * round, round + Math.sin(a) * round));
  }
  for (let i = 0; i <= seg; i++) {
    const a = (i / seg) * (Math.PI / 2);
    pts.push(new THREE.Vector2(r - round + Math.cos(a) * round, h - round + Math.sin(a) * round));
  }
  pts.push(new THREE.Vector2(0, h));
  return new THREE.LatheGeometry(pts, 64);
}

/** Curved wall (annulus sector) extruded upward — used for tub-chair backs and headboards. */
function curvedWall(rOuter: number, rInner: number, from: number, to: number, height: number, bevel = 0.03) {
  const shape = new THREE.Shape();
  shape.absarc(0, 0, rOuter, from, to, false);
  shape.absarc(0, 0, rInner, to, from, true);
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, { depth: height, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 5, curveSegments: 64 });
  geo.rotateX(-Math.PI / 2);
  return geo;
}

function luneChair(m: ReturnType<typeof mats>) {
  const g = new THREE.Group();
  const up = m('upholstery');
  const wood = m('wood');
  g.add(mesh(puck(0.4, 0.17, 0.07), up, 'seat', [0, 0.34, 0]));
  g.add(mesh(curvedWall(0.42, 0.33, -0.12 * Math.PI, 1.12 * Math.PI, 0.38, 0.04), up, 'back', [0, 0.47, 0]));
  g.add(mesh(puck(0.33, 0.09, 0.045), up, 'cushion', [0, 0.5, 0.03]));
  const legGeo = taperedLeg(0.024, 0.016, 0.37);
  for (let i = 0; i < 4; i++) {
    const a = Math.PI / 4 + (i * Math.PI) / 2;
    const x = Math.cos(a) * 0.27;
    const z = Math.sin(a) * 0.27;
    const leg = mesh(legGeo, wood, `leg-${i}`, [x, 0.175, z]);
    leg.rotation.set(Math.sin(a) * 0.16, 0, -Math.cos(a) * 0.16);
    g.add(leg);
  }
  return g;
}

function arcSofa(m: ReturnType<typeof mats>) {
  const g = new THREE.Group();
  const up = m('upholstery');
  const wood = m('wood');
  g.add(mesh(rbox(2.3, 0.14, 0.95, 0.03), wood, 'plinth', [0, 0.13, 0]));
  for (let i = 0; i < 3; i++) {
    const x = -0.68 + i * 0.68;
    g.add(mesh(rbox(0.66, 0.2, 0.78, 0.08), up, `seat-${i}`, [x, 0.3, 0.06]));
    g.add(mesh(rbox(0.64, 0.5, 0.22, 0.1), up, `back-${i}`, [x, 0.62, -0.32], [-0.14, 0, 0]));
  }
  g.add(mesh(rbox(0.22, 0.46, 0.95, 0.1), up, 'arm-l', [-1.13, 0.43, 0]));
  g.add(mesh(rbox(0.22, 0.46, 0.95, 0.1), up, 'arm-r', [1.13, 0.43, 0]));
  g.add(mesh(rbox(2.3, 0.42, 0.18, 0.06), up, 'backrest', [0, 0.41, -0.4]));
  const leg = taperedLeg(0.03, 0.025, 0.08);
  ([[-1.05, 0.38], [1.05, 0.38], [-1.05, -0.38], [1.05, -0.38]] as const).forEach(([x, z], i) => g.add(mesh(leg, wood, `foot-${i}`, [x, 0.04, z])));
  return g;
}

function haloLamp(m: ReturnType<typeof mats>) {
  const g = new THREE.Group();
  const metal = m('metal');
  g.add(mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.05, 48), m('stone'), 'base', [0, 0.025, 0]));
  const curve = new THREE.CubicBezierCurve3(new THREE.Vector3(0, 0.05, 0), new THREE.Vector3(0, 1.5, 0), new THREE.Vector3(0.3, 2.0, 0), new THREE.Vector3(0.95, 1.75, 0));
  g.add(mesh(new THREE.TubeGeometry(curve, 64, 0.014, 12, false), metal, 'arc', [0, 0, 0]));
  const shade = new THREE.SphereGeometry(0.22, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2);
  shade.computeVertexNormals();
  const shadeMat = metal.clone();
  shadeMat.side = THREE.DoubleSide;
  g.add(mesh(shade, shadeMat, 'shade', [0.95, 1.75, 0]));
  g.add(mesh(new THREE.SphereGeometry(0.07, 24, 16), m('light'), 'bulb', [0.95, 1.68, 0]));
  return g;
}

function monoTable(m: ReturnType<typeof mats>) {
  const g = new THREE.Group();
  g.add(mesh(new THREE.CylinderGeometry(0.65, 0.65, 0.045, 96), m('stone'), 'top', [0, 0.745, 0]));
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i <= 24; i++) {
    const t = i / 24;
    const r = 0.1 + 0.18 * Math.pow(Math.abs(t - 0.5) * 2, 2.2);
    pts.push(new THREE.Vector2(r, t * 0.72));
  }
  pts.unshift(new THREE.Vector2(0, 0));
  pts.push(new THREE.Vector2(0, 0.72));
  g.add(mesh(new THREE.LatheGeometry(pts, 64), m('wood'), 'pedestal', [0, 0, 0]));
  return g;
}

function strataSideboard(m: ReturnType<typeof mats>) {
  const g = new THREE.Group();
  const wood = m('wood');
  g.add(mesh(rbox(1.8, 0.6, 0.45, 0.015), wood, 'body', [0, 0.47, 0]));
  g.add(mesh(rbox(1.84, 0.035, 0.48, 0.008), m('stone'), 'top', [0, 0.79, 0]));
  const flute = new THREE.CylinderGeometry(0.018, 0.018, 0.56, 12);
  for (let i = 0; i < 44; i++) g.add(mesh(flute, wood, `flute-${i}`, [-0.86 + i * 0.04, 0.47, 0.228]));
  const leg = new THREE.BoxGeometry(0.03, 0.17, 0.4);
  g.add(mesh(leg, m('metal'), 'leg-l', [-0.75, 0.085, 0]));
  g.add(mesh(leg, m('metal'), 'leg-r', [0.75, 0.085, 0]));
  return g;
}

function orbTable(m: ReturnType<typeof mats>) {
  const g = new THREE.Group();
  g.add(mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.035, 64), m('accent'), 'top', [0, 0.52, 0]));
  g.add(mesh(new THREE.SphereGeometry(0.2, 48, 32), m('stone'), 'orb', [0, 0.3, 0]));
  g.add(mesh(new THREE.CylinderGeometry(0.06, 0.16, 0.14, 48), m('stone'), 'foot', [0, 0.07, 0]));
  return g;
}

function kovaArmchair(m: ReturnType<typeof mats>) {
  const g = new THREE.Group();
  const up = m('upholstery');
  g.add(mesh(rbox(0.82, 0.22, 0.8, 0.09), up, 'seat', [0, 0.32, 0]));
  g.add(mesh(rbox(0.82, 0.55, 0.2, 0.09), up, 'back', [0, 0.66, -0.31], [-0.1, 0, 0]));
  g.add(mesh(rbox(0.16, 0.36, 0.78, 0.07), up, 'arm-l', [-0.42, 0.5, 0]));
  g.add(mesh(rbox(0.16, 0.36, 0.78, 0.07), up, 'arm-r', [0.42, 0.5, 0]));
  const tube = new THREE.TorusGeometry(0.36, 0.014, 12, 48, Math.PI);
  g.add(mesh(tube, m('metal'), 'sled-l', [-0.38, 0.21, 0], [0, Math.PI / 2, Math.PI]));
  g.add(mesh(tube, m('metal'), 'sled-r', [0.38, 0.21, 0], [0, Math.PI / 2, Math.PI]));
  g.children.slice(-2).forEach((c) => c.scale.set(1, 0.55, 1));
  return g;
}

function nestBed(m: ReturnType<typeof mats>) {
  const g = new THREE.Group();
  const up = m('upholstery');
  g.add(mesh(rbox(1.8, 0.28, 2.15, 0.03), m('wood'), 'frame', [0, 0.16, 0]));
  g.add(mesh(rbox(1.7, 0.2, 2.0, 0.08), m('accent'), 'mattress', [0, 0.4, 0.04]));
  g.add(mesh(rbox(1.95, 0.95, 0.18, 0.09), up, 'headboard', [0, 0.6, -1.08]));
  g.add(mesh(rbox(0.7, 0.16, 0.42, 0.08), up, 'pillow-l', [-0.42, 0.57, -0.75], [0.35, 0, 0]));
  g.add(mesh(rbox(0.7, 0.16, 0.42, 0.08), up, 'pillow-r', [0.42, 0.57, -0.75], [0.35, 0, 0]));
  g.add(mesh(rbox(1.72, 0.06, 0.9, 0.03), up, 'throw', [0, 0.52, 0.55]));
  return g;
}

// ---------------------------------------------------------------- decor

function plant() {
  const g = new THREE.Group();
  const pot = makeMaterial('stone', '#d8cfc0');
  const leaf = new THREE.MeshStandardMaterial({ name: 'accent', color: '#3f5236', roughness: 0.7, side: THREE.DoubleSide });
  g.add(mesh(new THREE.CylinderGeometry(0.2, 0.15, 0.38, 32), pot, 'pot', [0, 0.19, 0]));
  const leafGeo = new THREE.SphereGeometry(0.16, 12, 8);
  leafGeo.scale(0.35, 1, 0.08);
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const tilt = 0.4 + (i % 3) * 0.2;
    const l = mesh(leafGeo, leaf, `leaf-${i}`, [Math.cos(a) * 0.12, 0.58 + (i % 4) * 0.08, Math.sin(a) * 0.12], [0, -a, tilt]);
    g.add(l);
  }
  return g;
}

function vase() {
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    pts.push(new THREE.Vector2(0.05 + 0.07 * Math.sin(t * Math.PI) + (t > 0.85 ? (t - 0.85) * 0.2 : 0), t * 0.34));
  }
  const g = new THREE.Group();
  g.add(mesh(new THREE.LatheGeometry(pts, 48), new THREE.MeshStandardMaterial({ name: 'accent', color: '#b4532a', roughness: 0.5, side: THREE.DoubleSide }), 'vase', [0, 0, 0]));
  return g;
}

function rug() {
  const g = new THREE.Group();
  g.add(mesh(new THREE.CylinderGeometry(1.4, 1.4, 0.012, 96), makeMaterial('upholstery', '#cfc4b2'), 'rug', [0, 0.006, 0]));
  return g;
}

function books() {
  const g = new THREE.Group();
  const colors = ['#2f3b2c', '#b4532a', '#e9e4da', '#16140f'];
  colors.forEach((c, i) => {
    g.add(mesh(new THREE.BoxGeometry(0.26 - i * 0.02, 0.035, 0.2 - i * 0.01), new THREE.MeshStandardMaterial({ name: 'accent', color: c, roughness: 0.8 }), `book-${i}`, [0, 0.0175 + i * 0.035, 0], [0, i * 0.15, 0]));
  });
  return g;
}

const BUILDERS: Record<string, (m: ReturnType<typeof mats>) => THREE.Group> = {
  'lune-chair': luneChair,
  'arc-sofa': arcSofa,
  'halo-lamp': haloLamp,
  'mono-table': monoTable,
  'strata-sideboard': strataSideboard,
  'orb-table': orbTable,
  'kova-armchair': kovaArmchair,
  'nest-bed': nestBed,
  plant: () => plant(),
  vase: () => vase(),
  rug: () => rug(),
  books: () => books(),
};

export function hasModel(key: string) {
  return key in BUILDERS;
}

/** Build a fresh three.js group for the given model key, recoloured with `palette`. */
export function buildModel(key: string, palette: Palette = {}): THREE.Group {
  const info = MODEL_LIBRARY.find((x) => x.key === key);
  const builder = BUILDERS[key] ?? BUILDERS['lune-chair'];
  const group = builder(mats(palette, info?.defaults ?? {}));
  group.name = key;
  return group;
}

/** Recolour any object (procedural or uploaded GLB) whose material name matches a slot. */
export function applyPalette(root: THREE.Object3D, palette: Palette) {
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    const list = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    list.forEach((mat) => {
      const m = mat as THREE.MeshStandardMaterial;
      const slot = (m.name || '').toLowerCase() as Slot;
      const c = palette[slot];
      if (c && m.color) {
        m.color.set(c);
        const pm = m as THREE.MeshPhysicalMaterial;
        if (pm.sheenColor && pm.sheen > 0) pm.sheenColor.set(c).lerp(new THREE.Color('#ffffff'), 0.15);
        if (slot === 'light' && m.emissive) m.emissive.set(c);
      }
    });
  });
}
