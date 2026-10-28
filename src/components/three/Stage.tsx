'use client';
import { ContactShadows, Environment, Lightformer } from '@react-three/drei';

/**
 * Studio lighting built from light-formers (an HDRI made of softboxes — no download).
 * Real-time shadow maps are opt-in (`shadows`) because they are the most expensive part;
 * product scenes rely on the much cheaper ContactShadows instead.
 */
export function StudioLights({ intensity = 1, warm = '#fff1dc', shadows = false }: { intensity?: number; warm?: string; shadows?: boolean }) {
  return (
    <>
      <hemisphereLight args={['#fff8ee', '#b9a88f', 0.18 * intensity]} />
      <directionalLight position={[3.5, 6.5, 3.5]} intensity={3.2 * intensity} color={warm} castShadow={shadows} shadow-mapSize={[1024, 1024]} shadow-bias={-0.0003} shadow-normalBias={0.02}>
        <orthographicCamera attach="shadow-camera" args={[-5, 5, 5, -5, 0.1, 25]} />
      </directionalLight>
      <directionalLight position={[-4, 3, -3]} intensity={0.5 * intensity} color="#dfe8ff" />
      <Environment resolution={256} frames={1} environmentIntensity={0.65 * intensity}>
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

/** Soft blurred contact shadow under the object (cheap, low-res). */
export function FloorShadow({ opacity = 0.45, scale = 6, far = 2.2, color = '#1a140c' }: { opacity?: number; scale?: number; far?: number; color?: string }) {
  return <ContactShadows position={[0, 0.001, 0]} opacity={opacity} scale={scale} blur={2.6} far={far} resolution={256} color={color} />;
}
