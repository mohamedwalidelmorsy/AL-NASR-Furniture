'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

interface Api { href: string; setHref: (h: string) => void }
const Ctx = createContext<Api>({ href: '', setHref: () => {} });

/** Lets the product page hand its product-specific WhatsApp link to the floating button. */
export function ProductWaProvider({ children }: { children: ReactNode }) {
  const [href, setHref] = useState('');
  const api = useMemo(() => ({ href, setHref }), [href]);
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export const useProductWa = () => useContext(Ctx);

export function useSetProductWa(href: string) {
  const { setHref } = useContext(Ctx);
  useEffect(() => { setHref(href); return () => setHref(''); }, [href, setHref]);
}
