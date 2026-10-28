'use client';
// All interactive 3D scenes used by the public site. Loaded client-side only.
import { useMemo, useRef, type MutableRefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import LazyCanvas from './LazyCanvas';
import FurnitureModel from './FurnitureModel';
import Fit from './Fit';
import { FloorShadow, StudioLights } from './Stage';
import Effects from './Effects';
import type { Palette } from '@/lib/furniture/builders';

type P = MutableRefObject<number>;
type Ptr = MutableRefObject<{ x: number; y: number }>;
const damp = THREE.MathUtils.damp;

// ------------------------------------------------------------------ Hero

function HeroRig({ progress, pointer, children }: { progress: P; pointer: Ptr; children: React.ReactNode }) {
  const g = useRef<THREE.Group>(null);
  const { camera } = useThree();
  useFrame((state, dt) => {
    if (!g.current) return;
    const p = progress.current;
    const t = state.clock.elapsedTime;
    g.current.rotation.y = damp(g.current.rotation.y, -0.7 + p * Math.PI * 1.35 + pointer.current.x * 0.35 + Math.sin(t * 0.3) * 0.05, 4, dt);
    g.current.rotation.x = damp(g.current.rotation.x, pointer.current.y * 0.06, 4, dt);
    g.current.position.y = damp(g.current.position.y, -p * 0.5 + Math.sin(t * 0.8) * 0.02, 4, dt);
    camera.position.z = damp(camera.position.z, 5.2 - p * 0.5, 4, dt);
    camera.position.y = damp(camera.position.y, 1.3 + p * 0.6, 4, dt);
    camera.lookAt(0, 0.75 - p * 0.3, 0);
  });
  return <group ref={g}>{children}</group>;
}

export function HeroScene({ model, modelUrl, palette, progress, pointer }: { model?: string; modelUrl?: string; palette: Palette; progress: P; pointer: Ptr }) {
  return (
    <LazyCanvas camera={{ position: [0, 1.3, 5.2], fov: 30 }}>
      <StudioLights intensity={1.05} />
      <HeroRig progress={progress} pointer={pointer}>
        <Fit size={1.5} fitKey={model + (modelUrl || '')}>
          <FurnitureModel model={model} modelUrl={modelUrl} palette={palette} />
        </Fit>
      </HeroRig>
      <FloorShadow opacity={0.5} />
      <Effects />
    </LazyCanvas>
  );
}

// ------------------------------------------------------------------ Exploded scroll story

function Exploder({ progress, children }: { progress: P; children: React.ReactNode }) {
  const g = useRef<THREE.Group>(null);
  const parts = useRef<{ mesh: THREE.Object3D; base: THREE.Vector3; dir: THREE.Vector3; rot: THREE.Euler; spin: THREE.Vector3 }[] | null>(null);

  useFrame((state, dt) => {
    const root = g.current;
    if (!root) return;
    if (!parts.current) {
      const meshes: THREE.Object3D[] = [];
      root.traverse((o) => ((o as THREE.Mesh).isMesh ? meshes.push(o) : 0));
      if (!meshes.length) return;
      const centre = meshes.reduce((a, m) => a.add(m.position), new THREE.Vector3()).divideScalar(meshes.length);
      // sort bottom → top so the piece assembles from the ground up
      meshes.sort((a, b) => a.position.y - b.position.y);
      parts.current = meshes.map((mesh, i) => {
        const dir = mesh.position.clone().sub(centre);
        if (dir.lengthSq() < 1e-4) dir.set(Math.sin(i * 2.4), 0.6, Math.cos(i * 2.4));
        dir.normalize().multiplyScalar(1.4 + (i % 3) * 0.35);
        dir.y += 0.5;
        return { mesh, base: mesh.position.clone(), dir, rot: mesh.rotation.clone(), spin: new THREE.Vector3(Math.sin(i) * 1.2, Math.cos(i * 1.7) * 1.2, Math.sin(i * 0.7) * 0.8) };
      });
    }
    const p = progress.current;
    const n = parts.current.length;
    parts.current.forEach((part, i) => {
      // each part has its own window inside the overall progress
      const start = (i / n) * 0.7;
      const local = THREE.MathUtils.clamp((p - start) / 0.3, 0, 1);
      const e = 1 - Math.pow(1 - local, 3);
      const k = 1 - e;
      const tx = part.base.x + part.dir.x * k;
      const ty = part.base.y + part.dir.y * k;
      const tz = part.base.z + part.dir.z * k;
      part.mesh.position.set(damp(part.mesh.position.x, tx, 8, dt), damp(part.mesh.position.y, ty, 8, dt), damp(part.mesh.position.z, tz, 8, dt));
      part.mesh.rotation.set(part.rot.x + part.spin.x * k, part.rot.y + part.spin.y * k, part.rot.z + part.spin.z * k);
    });
    root.rotation.y = damp(root.rotation.y, -0.5 + p * Math.PI * 0.9 + state.clock.elapsedTime * 0.05, 3, dt);
  });
  return <group ref={g}>{children}</group>;
}

export function ExplodedScene({ model, modelUrl, palette, progress }: { model?: string; modelUrl?: string; palette: Palette; progress: P }) {
  return (
    <LazyCanvas camera={{ position: [0, 1.5, 4.4], fov: 32 }} onCreated={({ camera }) => camera.lookAt(0, 0.7, 0)}>
      <StudioLights intensity={1.2} />
      <Fit size={1.9} fitKey={model + (modelUrl || '')}>
        <Exploder progress={progress}>
          <FurnitureModel model={model} modelUrl={modelUrl} palette={palette} />
        </Exploder>
      </Fit>
      <FloorShadow opacity={0.35} color="#000" />
      <Effects vignette={false} />
    </LazyCanvas>
  );
}

// ------------------------------------------------------------------ Orbit viewer (configurator / product)

function Turntable({ children, auto }: { children: React.ReactNode; auto: boolean }) {
  const g = useRef<THREE.Group>(null);
  const { invalidate } = useThree();
  useFrame((s, dt) => {
    if (g.current && auto) g.current.rotation.y += dt * 0.12;
    invalidate();
  });
  return <group ref={g}>{children}</group>;
}

export function OrbitScene({ model, modelUrl, palette, autoRotate = true, size = 1.9, zoom = false, camera = [2.8, 1.8, 4.2] as [number, number, number] }: { model?: string; modelUrl?: string; palette: Palette; autoRotate?: boolean; size?: number; zoom?: boolean; camera?: [number, number, number] }) {
  const target = useMemo(() => [0, size * 0.32, 0] as [number, number, number], [size]);
  return (
    <LazyCanvas camera={{ position: camera, fov: 30 }}>
      <StudioLights />
      <Turntable auto={autoRotate}>
        <Fit size={size} fitKey={model + (modelUrl || '')}>
          <FurnitureModel model={model} modelUrl={modelUrl} palette={palette} />
        </Fit>
      </Turntable>
      <FloorShadow />
      <Effects vignette={false} />
      <OrbitControls makeDefault target={target} enablePan={false} enableZoom={zoom} minDistance={2} maxDistance={8} minPolarAngle={0.3} maxPolarAngle={Math.PI / 2.05} enableDamping />
    </LazyCanvas>
  );
}
