'use client';

import { createContext, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from 'react';
import { useLocale } from 'next-intl';
import { useToast } from '@/components/toast-provider';
import { inquiryStore } from './store';
import { classifyItems, type InquiryItem } from './storage';
import type { Locale } from '@/i18n/routing';

/** Archived (retired) catalog entries: shown in the Inquiry List with their stored quantity/note but never submitted. */
export interface ArchivedInfo { id: string; code: string; name: { en: string; ar: string }; href: string }
export interface ArchivedItem extends InquiryItem { name: string; code: string; href: string }

interface InquiryApi {
  items: InquiryItem[];
  /** Items that still exist in the catalog (stale IDs from older prototypes stay in storage but are ignored). */
  validItems: InquiryItem[];
  /** Lines whose product has been archived: kept (qty + note intact) until removed, excluded from RFQ submission. */
  archivedItems: ArchivedItem[];
  removeArchived: () => void;
  /** duplicate id → public reference code (to explain a combined line). */
  mergedCodes: Record<string, string>;
  /** False until localStorage has been read on the client (avoids SSR/hydration mismatch). */
  ready: boolean;
  add: (id: string, qty: number) => void;
  update: (id: string, patch: Partial<Omit<InquiryItem, 'id'>>) => void;
  remove: (id: string) => void;
  undoRemove: () => void;
  clear: () => void;
}

const ValidIds = createContext<string[]>([]);
const ArchivedCtx = createContext<ArchivedInfo[]>([]);
/** Approved duplicate id → continuing product id, plus the duplicate's public reference code (for the disclosure line). */
export interface MergedInfo { from: string; to: string; fromCode: string }
const MergedCtx = createContext<MergedInfo[]>([]);

export function InquiryProvider({ children, validIds, archived = [], merged = [] }: { children: ReactNode; validIds: string[]; archived?: ArchivedInfo[]; merged?: MergedInfo[] }) {
  return <ValidIds.Provider value={validIds}><ArchivedCtx.Provider value={archived}><MergedCtx.Provider value={merged}>{children}</MergedCtx.Provider></ArchivedCtx.Provider></ValidIds.Provider>;
}

export function useInquiry(): InquiryApi {
  const snap = useSyncExternalStore(inquiryStore.subscribe, inquiryStore.getSnapshot, inquiryStore.getServerSnapshot);
  const validIds = useContext(ValidIds);
  const archived = useContext(ArchivedCtx);
  const merged = useContext(MergedCtx);
  // Explicit canonicalisation of saved lines (approved duplicates → continuing product); runs once per saved list, in every tab.
  useEffect(() => {
    if (snap.ready && merged.length && snap.items.some((i) => merged.some((m) => m.from === i.id))) inquiryStore.migrate(Object.fromEntries(merged.map((m) => [m.from, m.to])));
  }, [snap, merged]);
  const lang = useLocale() as Locale;
  const { show, dismiss } = useToast();
  return useMemo<InquiryApi>(() => {
    const cls = classifyItems(snap.items, validIds, archived.map((a) => a.id));
    const archivedItems: ArchivedItem[] = cls.archived.flatMap((i) => {
      const a = archived.find((x) => x.id === i.id);
      return a ? [{ ...i, name: a.name[lang] ?? a.name.en, code: a.code, href: a.href }] : [];
    });
    return {
    items: snap.items,
    ready: snap.ready,
    validItems: cls.active,
    archivedItems,
    mergedCodes: Object.fromEntries(merged.map((m) => [m.from, m.fromCode])),
    removeArchived: () => { archivedItems.forEach((i) => inquiryStore.remove(i.id)); if (archivedItems.length) show('removed'); },
    add: (id, qty) => show(inquiryStore.add(id, qty), { link: true }),
    update: inquiryStore.update,
    remove: (id) => { if (inquiryStore.remove(id)) show('removed', { undo: true }); },
    undoRemove: () => { inquiryStore.undoRemove(); dismiss(); },
    clear: () => { inquiryStore.clear(); show('cleared'); },
    };
  }, [snap, validIds, archived, merged, lang, show, dismiss]);
}
