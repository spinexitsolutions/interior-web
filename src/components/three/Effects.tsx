'use client';
// Blender-style "look": ground-truth-ish ambient occlusion (N8AO), soft bloom on light sources,
// AgX filmic tone mapping, gentle vignette and SMAA. Automatically skipped on weak devices.
import { EffectComposer, N8AO, Bloom, ToneMapping, Vignette, SMAA, BrightnessContrast, HueSaturation } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import { useEffect, useState } from 'react';

export function useHighQuality() {
  const [hq, setHq] = useState(false);
  useEffect(() => {
    const cores = navigator.hardwareConcurrency || 4;
    const small = window.innerWidth < 760;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    setHq(!small && !reduce && cores >= 4);
  }, []);
  return hq;
}

export default function Effects({ ao = 1, bloom = 0.35, vignette = true, force = false }: { ao?: number; bloom?: number; vignette?: boolean; force?: boolean }) {
  const hq = useHighQuality();
  if (!hq && !force) return null;
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <N8AO aoRadius={0.45} distanceFalloff={0.6} intensity={2.4 * ao} halfRes={false} quality="high" />
      <Bloom mipmapBlur luminanceThreshold={0.92} luminanceSmoothing={0.2} intensity={bloom} />
      <ToneMapping mode={ToneMappingMode.AGX} />
      <BrightnessContrast brightness={-0.02} contrast={0.16} />
      <HueSaturation saturation={0.12} />
      {vignette ? <Vignette offset={0.3} darkness={0.45} /> : <></>}
      <SMAA />
    </EffectComposer>
  );
}
