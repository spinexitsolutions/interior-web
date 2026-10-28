'use client';
import { useEffect, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { applyPalette, buildModel, type Palette } from '@/lib/furniture/builders';

export interface ModelSource {
  model?: string;
  modelUrl?: string;
}

function Procedural({ model, palette }: { model: string; palette: Palette }) {
  const group = useMemo(() => buildModel(model), [model]);
  useEffect(() => applyPalette(group, palette), [group, palette]);
  useEffect(() => () => disposeTree(group), [group]);
  return <primitive object={group} />;
}

function Uploaded({ url, palette }: { url: string; palette: Palette }) {
  const gltf = useGLTF(url);
  const scene = useMemo(() => {
    const s = gltf.scene.clone(true);
    s.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) {
        m.castShadow = true;
        m.receiveShadow = true;
        m.material = Array.isArray(m.material) ? m.material.map((x) => x.clone()) : m.material.clone();
      }
    });
    return s;
  }, [gltf.scene]);
  useEffect(() => applyPalette(scene, palette), [scene, palette]);
  return <primitive object={scene} />;
}

/** Renders a built-in procedural model or an uploaded GLB, recoloured by palette slots. */
export default function FurnitureModel({ model = 'lune-chair', modelUrl, palette = {} }: ModelSource & { palette?: Palette }) {
  if (modelUrl) return <Uploaded url={modelUrl} palette={palette} />;
  return <Procedural model={model} palette={palette} />;
}

export function disposeTree(root: THREE.Object3D) {
  root.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.isMesh) {
      m.geometry?.dispose();
      (Array.isArray(m.material) ? m.material : [m.material]).forEach((x) => x?.dispose());
    }
  });
}

/** Fits any model inside a unit-ish box so very different products frame consistently. */
export function useFitScale(object: THREE.Object3D | null, target = 1.6) {
  return useMemo(() => {
    if (!object) return 1;
    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3());
    return target / Math.max(size.x, size.y, size.z, 0.001);
  }, [object, target]);
}
