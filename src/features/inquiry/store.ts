import { siteConfig } from '@/lib/site-config';
import { parseStoredInquiry, reinsert, upsertItem, type InquiryItem } from './storage';

/**
 * Tiny external store for the Inquiry List, persisted in localStorage under the prototype's key
 * (`alnasr.inquiry.v1`). Consumed through useSyncExternalStore so SSR and hydration always agree
 * (server snapshot = empty/not ready) and other tabs stay in sync via the `storage` event.
 */
export interface InquirySnapshot { items: InquiryItem[]; ready: boolean }

const SERVER_SNAPSHOT: InquirySnapshot = { items: [], ready: false };
let snapshot: InquirySnapshot = SERVER_SNAPSHOT;
let removed: { item: InquiryItem; idx: number } | null = null;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());
const readStorage = (): InquiryItem[] => {
  try { return parseStoredInquiry(localStorage.getItem(siteConfig.storageKeys.inquiry)); } catch { return []; }
};
function set(items: InquiryItem[]) {
  try { localStorage.setItem(siteConfig.storageKeys.inquiry, JSON.stringify(items)); } catch { /* quota / private mode */ }
  snapshot = { items, ready: true };
  emit();
}
function ensureLoaded() {
  if (!snapshot.ready) snapshot = { items: readStorage(), ready: true };
}

export const inquiryStore = {
  getServerSnapshot: () => SERVER_SNAPSHOT,
  getSnapshot: () => snapshot,
  subscribe(cb: () => void) {
    listeners.add(cb);
    if (typeof window !== 'undefined') {
      if (!snapshot.ready) { ensureLoaded(); queueMicrotask(emit); }
      window.addEventListener('storage', onStorage);
    }
    return () => { listeners.delete(cb); if (!listeners.size && typeof window !== 'undefined') window.removeEventListener('storage', onStorage); };
  },
  add(id: string, qty: number): 'added' | 'updated' {
    ensureLoaded();
    const exists = snapshot.items.some((i) => i.id === id);
    set(upsertItem(snapshot.items, id, qty));
    return exists ? 'updated' : 'added';
  },
  update(id: string, patch: Partial<Omit<InquiryItem, 'id'>>) {
    ensureLoaded();
    set(snapshot.items.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  },
  remove(id: string): boolean {
    ensureLoaded();
    const idx = snapshot.items.findIndex((i) => i.id === id);
    if (idx < 0) return false;
    removed = { item: snapshot.items[idx], idx };
    set(snapshot.items.filter((i) => i.id !== id));
    return true;
  },
  undoRemove() {
    if (!removed) return;
    set(reinsert(snapshot.items, removed.item, removed.idx));
    removed = null;
  },
  clear() { ensureLoaded(); set([]); },
  /** Test helper: forget in-memory state so the next subscriber re-reads storage. */
  _reset() { snapshot = SERVER_SNAPSHOT; removed = null; },
};

function onStorage(e: StorageEvent) {
  if (e.key !== siteConfig.storageKeys.inquiry) return;
  snapshot = { items: parseStoredInquiry(e.newValue), ready: true };
  emit();
}
