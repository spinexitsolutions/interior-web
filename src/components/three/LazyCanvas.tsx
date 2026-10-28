'use client';
import { Canvas, type CanvasProps } from '@react-three/fiber';
import { Suspense, useEffect, useRef, useState } from 'react';

/** Mounts the WebGL canvas only when near the viewport and pauses rendering when off-screen. */
export default function LazyCanvas({ children, className, style, ...props }: CanvasProps & { className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        setVisible(e.isIntersecting);
        if (e.isIntersecting) setMounted(true);
      },
      { rootMargin: '300px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={className} style={{ position: 'relative', width: '100%', height: '100%', ...style }}>
      {mounted && (
        <Canvas frameloop={visible ? 'always' : 'never'} dpr={[1, 1.75]} shadows gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }} {...props}>
          <Suspense fallback={null}>{children}</Suspense>
        </Canvas>
      )}
    </div>
  );
}
