'use client';
import { ContactShadows, Environment, Lightformer, SoftShadows } from '@react-three/drei';
import { useEffect, useState } from 'react';

// SoftShadows patches three's global shadow shader chunk, so only one mounted instance may own it
// (several canvases on one page would otherwise inject the PCSS functions twice).
let pcssOwner: object | null = null;
function useSoftShadowOwner() {
  const [me] = useState(() => ({}));
  const [owns, setOwns] = useState(false);
  useEffect(() => {
    if (!pcssOwner) {
      pcssOwner = me;
      setOwns(true);
    }
    return () => {
      if (pcssOwner === me) pcssOwner = null;
    };
  }, [me]);
  return owns;
}

/**
 * Photographic studio lighting built from light-formers (an HDRI made of softboxes — no download):
 * big overhead softbox key, warm window fill, cool rim, plus PCSS soft shadows.
 */
export function StudioLights({ intensity = 1, warm = '#fff1dc' }: { intensity?: number; warm?: string }) {
  const pcss = useSoftShadowOwner();
  return (
    <>
      {pcss && <SoftShadows size={12} samples={14} focus={0.4} />}
      <hemisphereLight args={['#fff8ee', '#b9a88f', 0.18 * intensity]} />
      <directionalLight position={[3.5, 6.5, 3.5]} intensity={3.2 * intensity} color={warm} castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0003} shadow-normalBias={0.02}>
        <orthographicCamera attach="shadow-camera" args={[-5, 5, 5, -5, 0.1, 25]} />
      </directionalLight>
      <directionalLight position={[-4, 3, -3]} intensity={0.5 * intensity} color="#dfe8ff" />
      <Environment resolution={512} frames={1} environmentIntensity={0.65 * intensity}>
        <color attach="background" args={['#3a3530']} />
        <Lightformer form="rect" intensity={3} color="#fff4e6" position={[0, 6, 0]} scale={[8, 8, 1]} rotation-x={Math.PI / 2} />
        <Lightformer form="rect" intensity={2.2} color="#ffe2c4" position={[-6, 2.5, 1]} scale={[4, 5, 1]} rotation-y={Math.PI / 2} />
        <Lightformer form="rect" intensity={1.1} color="#dfe8ff" position={[6, 2, -1]} scale={[3, 6, 1]} rotation-y={-Math.PI / 2} />
        <Lightformer form="rect" intensity={0.8} color="#ffffff" position={[0, 2, 7]} scale={[10, 3, 1]} />
        <Lightformer form="ring" intensity={2} color="#fff" position={[3, 4, 4]} scale={1.5} />
      </Environment>
    </>
  );
}

/** Soft contact shadow (blurred) + a shadow-catching floor for the key light. */
export function FloorShadow({ opacity = 0.45, scale = 6, far = 2.2, color = '#1a140c', catcher = false }: { opacity?: number; scale?: number; far?: number; color?: string; catcher?: boolean }) {
  return (
    <>
      <ContactShadows position={[0, 0.001, 0]} opacity={opacity} scale={scale} blur={3.2} far={far} resolution={1024} color={color} />
      {catcher && (
      <mesh rotation-x={-Math.PI / 2} position-y={0.0005} receiveShadow>
        <planeGeometry args={[scale * 2, scale * 2]} />
        <shadowMaterial transparent opacity={opacity * 0.5} />
      </mesh>
      )}
    </>
  );
}
