// Renders the procedural 3D vignettes in src/app/lab/render into seed photography.
// Usage: npm run dev (in another terminal), then `node scripts/render-images.mjs [scene…]`
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }
import { mkdirSync } from 'node:fs';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const OUT = new URL('../public/images/seed/', import.meta.url);
mkdirSync(OUT, { recursive: true });

const all = [
  ...['lune-chair', 'arc-sofa', 'halo-lamp', 'mono-table', 'strata-sideboard', 'orb-table', 'kova-armchair', 'nest-bed'].map((k) => `product-${k}`),
  ...['seating', 'tables', 'lighting', 'storage', 'bedroom'].map((k) => `cat-${k}`),
  ...[1, 2, 3, 4, 5, 6].map((n) => `project-${n}`),
  ...[1, 2, 3, 4].map((n) => `post-${n}`),
  'studio-1',
  'studio-2',
];
const scenes = process.argv.slice(2).length ? process.argv.slice(2) : all;
const size = (s) => (s.startsWith('product') ? [1000, 1250] : s.startsWith('cat') ? [900, 1200] : s.startsWith('studio') ? [1200, 1500] : [1600, 1100]);

const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
for (const scene of scenes) {
  const [width, height] = size(scene);
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto(`${BASE}/lab/render?scene=${scene}`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 600000 });
  await page.screenshot({ path: new URL(`${scene}.jpg`, OUT).pathname, type: 'jpeg', quality: 84, timeout: 180000 });
  await page.close();
  console.log('✓', scene);
}
await browser.close();
