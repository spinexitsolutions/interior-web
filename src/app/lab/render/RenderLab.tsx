'use client';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Suspense, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import FurnitureModel from '@/components/three/FurnitureModel';
import { FloorShadow, StudioLights } from '@/components/three/Stage';
import Effects from '@/components/three/Effects';
import { SCENES, type Piece } from './scenes';

// subtle oak-plank floor texture for interiors
let _floor: THREE.CanvasTexture | null = null;
function floorTex() {
  if (typeof document === 'undefined') return null;
  if (_floor) return _floor;
  const c = document.createElement('canvas');
  c.width = c.height = 1024;
  const g = c.getContext('2d')!;
  g.fillStyle = '#fff';
  g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 8; i++) {
    const shade = 225 + Math.round(Math.random() * 30);
    g.fillStyle = `rgb(${shade},${shade - 4},${shade - 10})`;
    g.fillRect(i * 128, 0, 126, 1024);
    for (let k = 0; k < 60; k++) {
      g.strokeStyle = `rgba(120,90,60,${Math.random() * 0.08})`;
      g.beginPath();
      const x = i * 128 + Math.random() * 126;
      g.moveTo(x, 0);
      g.bezierCurveTo(x + Math.random() * 10 - 5, 300, x + Math.random() * 10 - 5, 700, x, 1024);
      g.stroke();
    }
    g.fillStyle = 'rgba(60,40,20,0.25)';
    g.fillRect(i * 128 + 126, 0, 2, 1024);
  }
  _floor = new THREE.CanvasTexture(c);
  _floor.wrapS = _floor.wrapT = THREE.RepeatWrapping;
  _floor.repeat.set(18, 18);
  _floor.colorSpace = THREE.SRGBColorSpace;
  _floor.anisotropy = 8;
  return _floor;
}

function Ready({ onDone }: { onDone: () => void }) {
  const n = useRef(0);
  useFrame(() => {
    n.current++;
    if (n.current === 24) {
      onDone();
      setTimeout(() => ((window as any).__ready = true), 300);
    }
  });
  return null;
}

function Cam({ pos, target, fov }: { pos: [number, number, number]; target: [number, number, number]; fov: number }) {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(...pos);
    (camera as THREE.PerspectiveCamera).fov = fov;
    camera.lookAt(...target);
    camera.updateProjectionMatrix();
  }, [camera, pos, target, fov]);
  return null;
}

function PieceView({ p }: { p: Piece }) {
  return (
    <group position={p.pos} rotation-y={p.rot ?? 0} scale={p.scale ?? 1}>
      <FurnitureModel model={p.key} palette={p.palette || {}} />
    </group>
  );
}

export default function RenderLab({ scene }: { scene: string }) {
  const s = SCENES[scene] || SCENES['project-1'];
  const [frozen, setFrozen] = useState(false);
  return (
    <div style={{ position: 'fixed', inset: 0, background: s.bg }}>
      <Canvas frameloop={frozen ? 'never' : 'always'} shadows dpr={1} gl={{ antialias: true, preserveDrawingBuffer: true, toneMappingExposure: s.exposure ?? 1 }} camera={{ fov: s.fov ?? 35 }}>
        <color attach="background" args={[s.bg]} />
        <Cam pos={s.cam} target={s.target} fov={s.fov ?? 35} />
        <Suspense fallback={null}>
          <StudioLights intensity={s.light ?? 1} warm={s.warm} shadows />
          {s.sun && (
            <directionalLight position={s.sun} intensity={2.8} color="#ffe2bf" castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0004}>
              <orthographicCamera attach="shadow-camera" args={[-6, 6, 6, -6, 0.1, 30]} />
            </directionalLight>
          )}
          {/* floor */}
          <mesh rotation-x={-Math.PI / 2} receiveShadow>
            <planeGeometry args={[40, 40]} />
            <meshStandardMaterial color={s.floor} roughness={0.75} map={floorTex()} />
          </mesh>
          {/* back wall */}
          {s.wall && (
            <mesh position={[0, 5, s.wallZ ?? -2.2]} receiveShadow>
              <planeGeometry args={[40, 10]} />
              <meshStandardMaterial color={s.wall} roughness={1} />
            </mesh>
          )}
          {s.sideWall && (
            <mesh position={[s.sideWall.x, 5, 0]} rotation-y={s.sideWall.x < 0 ? Math.PI / 2 : -Math.PI / 2} receiveShadow>
              <planeGeometry args={[40, 10]} />
              <meshStandardMaterial color={s.sideWall.color} roughness={1} />
            </mesh>
          )}
          {s.arch && (
            <group position={[s.arch.x, 0, (s.wallZ ?? -2.2) + 0.01]}>
              <mesh position={[0, s.arch.h / 2, 0]}>
                <planeGeometry args={[s.arch.w, s.arch.h]} />
                <meshStandardMaterial color={s.arch.color} roughness={1} />
              </mesh>
              <mesh position={[0, s.arch.h, 0]}>
                <circleGeometry args={[s.arch.w / 2, 64, 0, Math.PI]} />
                <meshStandardMaterial color={s.arch.color} roughness={1} />
              </mesh>
            </group>
          )}
          {s.window && (
            <mesh position={s.window.pos} rotation-y={s.window.rot ?? 0}>
              <planeGeometry args={s.window.size} />
              <meshBasicMaterial color={[4, 3.8, 3.4]} toneMapped={false} />
            </mesh>
          )}
          {s.pieces.map((p, i) => (
            <PieceView key={i} p={p} />
          ))}
          <FloorShadow opacity={0.5} scale={14} far={3} />
          <Effects force bloom={0.4} />
          <Ready onDone={() => setFrozen(true)} />
        </Suspense>
      </Canvas>
    </div>
  );
}
