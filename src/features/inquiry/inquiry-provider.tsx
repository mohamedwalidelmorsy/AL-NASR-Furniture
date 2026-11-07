'use client';

import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from 'react';
import { useToast } from '@/components/toast-provider';
import { inquiryStore } from './store';
import type { InquiryItem } from './storage';

interface InquiryApi {
  items: InquiryItem[];
  /** Items that still exist in the catalog (stale IDs from older prototypes stay in storage but are ignored). */
  validItems: InquiryItem[];
  /** False until localStorage has been read on the client (avoids SSR/hydration mismatch). */
  ready: boolean;
  add: (id: string, qty: number) => void;
  update: (id: string, patch: Partial<Omit<InquiryItem, 'id'>>) => void;
  remove: (id: string) => void;
  undoRemove: () => void;
  clear: () => void;
}

const ValidIds = createContext<string[]>([]);

export function InquiryProvider({ children, validIds }: { children: ReactNode; validIds: string[] }) {
  return <ValidIds.Provider value={validIds}>{children}</ValidIds.Provider>;
}

export function useInquiry(): InquiryApi {
  const snap = useSyncExternalStore(inquiryStore.subscribe, inquiryStore.getSnapshot, inquiryStore.getServerSnapshot);
  const validIds = useContext(ValidIds);
  const { show, dismiss } = useToast();
  return useMemo<InquiryApi>(() => ({
    items: snap.items,
    ready: snap.ready,
    validItems: snap.items.filter((i) => validIds.includes(i.id)),
    add: (id, qty) => show(inquiryStore.add(id, qty), { link: true }),
    update: inquiryStore.update,
    remove: (id) => { if (inquiryStore.remove(id)) show('removed', { undo: true }); },
    undoRemove: () => { inquiryStore.undoRemove(); dismiss(); },
    clear: () => { inquiryStore.clear(); show('cleared'); },
  }), [snap, validIds, show, dismiss]);
}
