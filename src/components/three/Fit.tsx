'use client';
import { useRef, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Scales its children so the largest dimension equals `size` and stands them on y=0, centred.
 * Re-fits when `fitKey` changes (e.g. a different model was selected).
 */
export default function Fit({ size = 1.8, fitKey, children }: { size?: number; fitKey?: string; children: ReactNode }) {
  const outer = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);
  const fitted = useRef<string | null>(null);
  useFrame(() => {
    const g = inner.current;
    const o = outer.current;
    if (!g || !o || fitted.current === (fitKey ?? 'x')) return;
    let meshes = 0;
    g.traverse((c) => ((c as THREE.Mesh).isMesh ? meshes++ : 0));
    if (!meshes) return;
    g.position.set(0, 0, 0);
    o.scale.setScalar(1);
    o.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(g);
    const dims = box.getSize(new THREE.Vector3());
    const s = size / Math.max(dims.x, dims.y, dims.z, 0.0001);
    const c = box.getCenter(new THREE.Vector3());
    g.position.set(-c.x, -box.min.y, -c.z);
    o.scale.setScalar(s);
    fitted.current = fitKey ?? 'x';
  });
  return (
    <group ref={outer}>
      <group ref={inner}>{children}</group>
    </group>
  );
}
