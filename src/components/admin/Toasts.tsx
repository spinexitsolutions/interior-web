'use client';
import { createContext, useCallback, useContext, useState } from 'react';

type Toast = { id: number; text: string; err?: boolean };
const Ctx = createContext<(text: string, err?: boolean) => void>(() => {});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [list, setList] = useState<Toast[]>([]);
  const push = useCallback((text: string, err?: boolean) => {
    const id = Date.now() + Math.random();
    setList((l) => [...l, { id, text, err }]);
    setTimeout(() => setList((l) => l.filter((t) => t.id !== id)), 3200);
  }, []);
  return (
    <Ctx.Provider value={push}>
      {children}
      <div className="a-toasts" role="status" aria-live="polite">
        {list.map((t) => (
          <div key={t.id} className={`a-toast ${t.err ? 'err' : ''}`}>
            {t.text}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export const useToast = () => useContext(Ctx);
