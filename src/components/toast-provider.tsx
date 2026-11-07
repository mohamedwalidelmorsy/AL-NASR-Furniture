'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

export type ToastKey = 'added' | 'updated' | 'removed' | 'waPending' | 'cleared';
export interface ToastState { key: ToastKey; undo?: boolean; link?: boolean }

interface ToastApi {
  toast: ToastState | null;
  show: (key: ToastKey, opts?: { undo?: boolean; link?: boolean }) => void;
  dismiss: () => void;
}

const Ctx = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const dismiss = useCallback(() => { clearTimeout(timer.current); setToast(null); }, []);
  const show = useCallback<ToastApi['show']>((key, opts) => {
    clearTimeout(timer.current);
    setToast({ key, ...opts });
    timer.current = setTimeout(() => setToast(null), 5000);
  }, []);

  const api = useMemo(() => ({ toast, show, dismiss }), [toast, show, dismiss]);
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useToast(): ToastApi {
  const v = useContext(Ctx);
  if (!v) throw new Error('useToast must be used within ToastProvider');
  return v;
}
