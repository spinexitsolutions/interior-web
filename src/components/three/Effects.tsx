'use client';
// Optional post-processing (ambient occlusion + filmic tone mapping). Used only where a single
// 3D view fills the screen (product page, VR showroom, render lab) and skipped on weak devices.
import { EffectComposer, N8AO, Bloom, ToneMapping, SMAA, BrightnessContrast } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import { useEffect, useState } from 'react';

export function useHighQuality() {
  const [hq, setHq] = useState(false);
  useEffect(() => {
    const cores = navigator.hardwareConcurrency || 4;
    const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
    const small = window.innerWidth < 900;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    setHq(!small && !reduce && cores >= 8 && mem >= 8);
  }, []);
  return hq;
}

export default function Effects({ ao = 1, bloom = 0, force = false }: { ao?: number; bloom?: number; force?: boolean }) {
  const hq = useHighQuality();
  if (!hq && !force) return null;
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <N8AO aoRadius={0.45} distanceFalloff={0.6} intensity={2.2 * ao} halfRes={!force} quality={force ? 'high' : 'performance'} />
      {bloom > 0 ? <Bloom mipmapBlur luminanceThreshold={0.92} luminanceSmoothing={0.2} intensity={bloom} /> : <></>}
      <ToneMapping mode={ToneMappingMode.AGX} />
      <BrightnessContrast brightness={-0.02} contrast={0.16} />
      <SMAA />
    </EffectComposer>
  );
}
