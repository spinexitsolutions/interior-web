'use client';
import { useEffect } from 'react';

export default function Modal({ title, onClose, children, actions, width }: { title: string; onClose: () => void; children: React.ReactNode; actions?: React.ReactNode; width?: number }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);
  return (
    <div className="a-modal" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="a-modal-box" style={width ? { width: `min(${width}px, 100%)` } : undefined} role="dialog" aria-modal="true" aria-label={title}>
        <header>
          <h2 style={{ flex: 1 }}>{title}</h2>
          {actions}
          <button className="a-btn ghost icon" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>
        <div className="body">{children}</div>
      </div>
    </div>
  );
}
