// Exports every procedural model to public/models/<key>.glb (+ .usdz for iOS Quick Look AR).
// Run: npm run models
import { writeFileSync, mkdirSync } from 'node:fs';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { USDZExporter } from 'three/examples/jsm/exporters/USDZExporter.js';
import { buildModel, MODEL_LIBRARY } from '../src/lib/furniture/builders.ts';

// Minimal FileReader polyfill so GLTFExporter can run under Node.
class NodeFileReader {
  result: ArrayBuffer | string | null = null;
  onload: ((e: unknown) => void) | null = null;
  onloadend: ((e: unknown) => void) | null = null;
  readAsArrayBuffer(blob: Blob) {
    blob.arrayBuffer().then((buf) => { this.result = buf; this.onload?.({ target: this }); this.onloadend?.({ target: this }); });
  }
  readAsDataURL(blob: Blob) {
    blob.arrayBuffer().then((buf) => {
      this.result = `data:${blob.type || 'application/octet-stream'};base64,${Buffer.from(buf).toString('base64')}`;
      this.onload?.({ target: this }); this.onloadend?.({ target: this });
    });
  }
}
(globalThis as any).FileReader = NodeFileReader;

const out = new URL('../public/models/', import.meta.url);
mkdirSync(out, { recursive: true });

for (const info of MODEL_LIBRARY) {
  const scene = new THREE.Scene();
  scene.add(buildModel(info.key));
  scene.updateMatrixWorld(true);
  const glb = (await new GLTFExporter().parseAsync(scene, { binary: true })) as ArrayBuffer;
  writeFileSync(new URL(`${info.key}.glb`, out), Buffer.from(glb));
  const usdz = await new USDZExporter().parseAsync(scene);
  writeFileSync(new URL(`${info.key}.usdz`, out), Buffer.from(usdz));
  console.log(`✓ ${info.key}  glb ${(glb.byteLength / 1024).toFixed(0)}kB  usdz ${(usdz.byteLength / 1024).toFixed(0)}kB`);
}
