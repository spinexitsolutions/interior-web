'use client';
import { useEffect } from 'react';
import { ShowroomCanvas, useShowroomStore, type ShowroomItem } from '../three/Showroom';

declare global {
  interface Window {
    __formaXR?: { enterVR: () => void; enterAR: () => void };
  }
}

export default function ShowroomStage({ items, selected, onSelect, dark }: { items: ShowroomItem[]; selected?: string; onSelect: (slug: string | undefined) => void; dark: boolean }) {
  const store = useShowroomStore();
  useEffect(() => {
    window.__formaXR = { enterVR: () => store.enterVR(), enterAR: () => store.enterAR() };
    return () => {
      window.__formaXR = undefined;
    };
  }, [store]);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <ShowroomCanvas items={items} selected={selected} onSelect={(slug) => onSelect(slug)} store={store} dark={dark} />
    </div>
  );
}
