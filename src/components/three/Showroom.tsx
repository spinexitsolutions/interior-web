'use client';
// Virtual showroom: a gallery room furnished with CMS products. Works in the browser (orbit +
// click-to-walk) and as a full WebXR experience (VR headsets with teleport + thumbstick
// locomotion, or AR passthrough on supported devices).
import { useMemo, useRef, useState, type MutableRefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { XR, XROrigin, TeleportTarget, createXRStore, useXRControllerLocomotion, IfInSessionMode } from '@react-three/xr';
import * as THREE from 'three';
import FurnitureModel from './FurnitureModel';
import Fit from './Fit';
import { StudioLights } from './Stage';
import Effects from './Effects';

export interface ShowroomItem {
  slug: string;
  name: string;
  model: string;
  modelUrl: string;
  color?: string;
  slot?: string;
  dimensions: { w: number; d: number; h: number };
}

// fixed "curated" positions on the gallery floor (x, z, rotationY)
const SPOTS: [number, number, number][] = [
  [-2.6, -1.8, 0.35],
  [0, -2.6, 0],
  [2.6, -1.8, -0.35],
  [-3.2, 1.2, 1.2],
  [3.2, 1.2, -1.2],
  [-1.2, 0.4, 0.6],
  [1.4, 0.6, -0.5],
  [0, 3.0, Math.PI],
];

const ROOM = { w: 10, d: 10, h: 3.6 };

function Room({ dark = false }: { dark?: boolean }) {
  const wall = dark ? "#1d2022" : "#eceeea";
  const floor = dark ? "#2e2a26" : "#c9b89c";
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} receiveShadow name="floor">
        <planeGeometry args={[ROOM.w, ROOM.d]} />
        <meshStandardMaterial color={floor} roughness={0.85} />
      </mesh>
      {/* plank lines */}
      {Array.from({ length: 19 }).map((_, i) => (
        <mesh key={i} rotation-x={-Math.PI / 2} position={[-ROOM.w / 2 + 0.5 + i * 0.5, 0.001, 0]}>
          <planeGeometry args={[0.006, ROOM.d]} />
          <meshBasicMaterial color="#000" transparent opacity={0.06} />
        </mesh>
      ))}
      <mesh position={[0, ROOM.h / 2, -ROOM.d / 2]} receiveShadow>
        <boxGeometry args={[ROOM.w, ROOM.h, 0.1]} />
        <meshStandardMaterial color={wall} roughness={0.95} />
      </mesh>
      <mesh position={[-ROOM.w / 2, ROOM.h / 2, 0]} receiveShadow>
        <boxGeometry args={[0.1, ROOM.h, ROOM.d]} />
        <meshStandardMaterial color={wall} roughness={0.95} />
      </mesh>
      <mesh position={[ROOM.w / 2, ROOM.h / 2, 0]} receiveShadow>
        <boxGeometry args={[0.1, ROOM.h, ROOM.d]} />
        <meshStandardMaterial color={wall} roughness={0.95} />
      </mesh>
      {/* arched niche on back wall */}
      <mesh position={[0, 1.5, -ROOM.d / 2 + 0.06]}>
        <planeGeometry args={[2.2, 3]} />
        <meshStandardMaterial color="#2f4a42" roughness={1} />
      </mesh>
      <mesh position={[0, 3.0, -ROOM.d / 2 + 0.061]}>
        <circleGeometry args={[1.1, 48, 0, Math.PI]} />
        <meshStandardMaterial color="#2f4a42" roughness={1} />
      </mesh>
      {/* skirting */}
      <mesh position={[0, 0.05, -ROOM.d / 2 + 0.06]}>
        <boxGeometry args={[ROOM.w, 0.1, 0.02]} />
        <meshStandardMaterial color="#8c7b64" />
      </mesh>
      {/* window light shafts on the left wall */}
      {[-2.5, 0, 2.5].map((z) => (
        <mesh key={z} position={[-ROOM.w / 2 + 0.06, 1.9, z]} rotation-y={Math.PI / 2}>
          <planeGeometry args={[1.4, 2.4]} />
          <meshBasicMaterial color="#fff6e6" toneMapped={false} />
        </mesh>
      ))}
      <Decor />
    </group>
  );
}

function Decor() {
  return (
    <group>
      <group position={[-4.2, 0, -4.2]}>
        <FurnitureModel model="plant" />
      </group>
      <group position={[4.2, 0, -4.2]} scale={1.3}>
        <FurnitureModel model="plant" />
      </group>
      <group position={[0, 0, -0.9]}>
        <FurnitureModel model="rug" />
      </group>
    </group>
  );
}

function Plinth({ item, spot, selected, onSelect }: { item: ShowroomItem; spot: [number, number, number]; selected: boolean; onSelect: (slug: string) => void }) {
  const [hover, setHover] = useState(false);
  const ring = useRef<THREE.Mesh>(null);
  // real-world size: largest dimension in metres from CMS centimetres
  const size = Math.max(item.dimensions.w, item.dimensions.h, item.dimensions.d) / 100 || 1;
  useFrame((_, dt) => {
    if (ring.current) {
      const m = ring.current.material as THREE.MeshBasicMaterial;
      m.opacity = THREE.MathUtils.damp(m.opacity, hover || selected ? 0.9 : 0.0, 6, dt);
    }
  });
  return (
    <group position={[spot[0], 0, spot[1]]} rotation-y={spot[2]}>
      <group
        onClick={(e) => {
          e.stopPropagation();
          onSelect(item.slug);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHover(false);
          document.body.style.cursor = '';
        }}
      >
        <Fit size={size} fitKey={item.slug + item.model + item.modelUrl}>
          <FurnitureModel model={item.model} modelUrl={item.modelUrl} palette={item.color ? { [item.slot || 'upholstery']: item.color } : {}} />
        </Fit>
      </group>
      <mesh ref={ring} rotation-x={-Math.PI / 2} position-y={0.004}>
        <ringGeometry args={[size * 0.62, size * 0.65, 64]} />
        <meshBasicMaterial color="#23564a" transparent opacity={0} />
      </mesh>
    </group>
  );
}

function Furnishings({ items, selected, onSelect }: { items: ShowroomItem[]; selected?: string; onSelect: (slug: string) => void }) {
  return (
    <>
      {items.slice(0, SPOTS.length).map((it, i) => (
        <Plinth key={it.slug} item={it} spot={SPOTS[i]} selected={selected === it.slug} onSelect={onSelect} />
      ))}
    </>
  );
}

/** Animated camera rig for desktop: glides its orbit target to wherever the visitor clicked. */
function DesktopRig({ target }: { target: MutableRefObject<THREE.Vector3> }) {
  const controls = useThree((s) => s.controls) as unknown as { target: THREE.Vector3; update: () => void } | null;
  useFrame((_, dt) => {
    if (!controls) return;
    controls.target.x = THREE.MathUtils.damp(controls.target.x, target.current.x, 3, dt);
    controls.target.z = THREE.MathUtils.damp(controls.target.z, target.current.z, 3, dt);
    controls.update();
  });
  return null;
}

function Locomotion({ origin }: { origin: MutableRefObject<THREE.Group | null> }) {
  useXRControllerLocomotion(origin, { speed: 1.6 });
  return null;
}

export function useShowroomStore() {
  return useMemo(
    () =>
      createXRStore({
        controller: { teleportPointer: true },
        hand: { teleportPointer: true },
        emulate: false,
        offerSession: false,
      }),
    [],
  );
}

export function ShowroomCanvas({ items, selected, onSelect, store, dark }: { items: ShowroomItem[]; selected?: string; onSelect: (slug: string) => void; store: ReturnType<typeof createXRStore>; dark?: boolean }) {
  const origin = useRef<THREE.Group>(null);
  const [originPos, setOriginPos] = useState(new THREE.Vector3(0, 0, 3.5));
  const target = useRef(new THREE.Vector3(0, 0.6, -0.6));
  return (
    <Canvas shadows dpr={[1, 1.75]} camera={{ position: [3.2, 2.6, 7.2], fov: 42 }} gl={{ antialias: true }}>
      <color attach="background" args={[dark ? '#0e1012' : '#eef0ec']} />
      <fog attach="fog" args={[dark ? '#0e1012' : '#eef0ec', 14, 26]} />
      <XR store={store}>
        <StudioLights intensity={1.1} />
        <IfInSessionMode deny={['immersive-ar']}>
          <TeleportTarget onTeleport={(p) => setOriginPos(new THREE.Vector3(p.x, 0, p.z))}>
            <Room dark={dark} />
          </TeleportTarget>
        </IfInSessionMode>
        <Furnishings items={items} selected={selected} onSelect={onSelect} />
        <XROrigin ref={origin} position={originPos} />
        <IfInSessionMode allow={['immersive-vr', 'immersive-ar']}>
          <Locomotion origin={origin} />
        </IfInSessionMode>
        <IfInSessionMode deny={['immersive-vr', 'immersive-ar']}>
          <Effects ao={0.9} bloom={0.5} />
          <OrbitControls makeDefault target={[0, 0.6, -0.6]} minDistance={2} maxDistance={11} maxPolarAngle={Math.PI / 2.1} enableDamping />
          <DesktopRig target={target} />
          <FloorClick onPick={(p) => target.current.set(THREE.MathUtils.clamp(p.x, -4, 4), 0.6, THREE.MathUtils.clamp(p.z, -4, 4))} />
        </IfInSessionMode>
      </XR>
    </Canvas>
  );
}

/** Invisible plane catching double-clicks on the floor to glide the camera there. */
function FloorClick({ onPick }: { onPick: (p: THREE.Vector3) => void }) {
  return (
    <mesh rotation-x={-Math.PI / 2} position-y={0.002} onDoubleClick={(e) => onPick(e.point)} visible={false}>
      <planeGeometry args={[ROOM.w, ROOM.d]} />
      <meshBasicMaterial />
    </mesh>
  );
}

/** Lightweight preview of the room for the homepage VR teaser (no XR session). */
export function ShowroomPreview({ items }: { items: ShowroomItem[] }) {
  return (
    <Canvas shadows dpr={[1, 1.5]} camera={{ position: [0, 2.7, 6.6], fov: 44 }}>
      <color attach="background" args={['#0e1012']} />
      <StudioLights intensity={1.1} />
      <AutoOrbit />
      <Room />
      <Furnishings items={items} onSelect={() => {}} />
      <Effects />
    </Canvas>
  );
}

function AutoOrbit() {
  useFrame(({ camera, clock }) => {
    const t = clock.elapsedTime * 0.25;
    camera.position.set(Math.sin(t) * 3.2, 2.7 + Math.sin(t * 1.3) * 0.2, 6.6 + Math.cos(t * 0.7) * 0.6);
    camera.lookAt(0, 0.6, -0.6);
  });
  return null;
}
