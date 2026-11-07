import { beforeEach, describe, expect, it } from 'vitest';
import { clampQty, parseStoredInquiry, reinsert, upsertItem } from '@/features/inquiry/storage';
import { inquiryStore } from '@/features/inquiry/store';
import { siteConfig } from '@/lib/site-config';

const KEY = siteConfig.storageKeys.inquiry;

describe('inquiry storage helpers', () => {
  it('uses the prototype storage key so existing selections survive migration', () => {
    expect(KEY).toBe('alnasr.inquiry.v1');
  });
  it('parses the prototype shape and discards garbage', () => {
    expect(parseStoredInquiry('[{"id":"pv-br-01","qty":3,"note":"x"}]')).toEqual([{ id: 'pv-br-01', qty: 3, note: 'x' }]);
    expect(parseStoredInquiry('not json')).toEqual([]);
    expect(parseStoredInquiry('{"a":1}')).toEqual([]);
    expect(parseStoredInquiry('[null,{"qty":1},{"id":"a","qty":-4}]')).toEqual([{ id: 'a', qty: 1, note: '' }]);
    expect(parseStoredInquiry(null)).toEqual([]);
  });
  it('upserts without duplicates', () => {
    const a = upsertItem([], 'a', 2);
    expect(upsertItem(a, 'a', 5)).toEqual([{ id: 'a', qty: 5, note: '' }]);
    expect(upsertItem(a, 'b', 1)).toHaveLength(2);
  });
  it('clamps quantities to 1…99999', () => {
    expect(clampQty('0')).toBe(1);
    expect(clampQty('123456')).toBe(99999);
    expect(clampQty('')).toBe('');
    expect(clampQty('abc')).toBe(1);
  });
  it('reinserts a removed item at its old position (undo)', () => {
    const items = [{ id: 'a', qty: 1, note: '' }, { id: 'c', qty: 1, note: '' }];
    expect(reinsert(items, { id: 'b', qty: 1, note: '' }, 1).map((i) => i.id)).toEqual(['a', 'b', 'c']);
    expect(reinsert(items, items[0], 0)).toBe(items);
  });
});

describe('inquiry store persistence', () => {
  beforeEach(() => { localStorage.clear(); inquiryStore._reset(); });

  it('persists add/update/remove/undo/clear to localStorage', () => {
    expect(inquiryStore.add('pv-br-01', 2)).toBe('added');
    expect(inquiryStore.add('pv-br-01', 4)).toBe('updated');
    inquiryStore.add('pv-kb-01', 1);
    expect(JSON.parse(localStorage.getItem(KEY)!)).toEqual([{ id: 'pv-br-01', qty: 4, note: '' }, { id: 'pv-kb-01', qty: 1, note: '' }]);

    inquiryStore.update('pv-kb-01', { note: 'blue' });
    expect(inquiryStore.getSnapshot().items[1].note).toBe('blue');

    expect(inquiryStore.remove('pv-br-01')).toBe(true);
    expect(inquiryStore.getSnapshot().items.map((i) => i.id)).toEqual(['pv-kb-01']);
    inquiryStore.undoRemove();
    expect(inquiryStore.getSnapshot().items.map((i) => i.id)).toEqual(['pv-br-01', 'pv-kb-01']);

    inquiryStore.clear();
    expect(JSON.parse(localStorage.getItem(KEY)!)).toEqual([]);
  });

  it('restores a saved list after a reload and keeps stale IDs in storage untouched', () => {
    localStorage.setItem(KEY, JSON.stringify([{ id: 'SAMPLE-CS-01', qty: 2, note: '' }, { id: 'pv-br-01', qty: 7, note: 'n' }]));
    inquiryStore._reset();
    const unsub = inquiryStore.subscribe(() => {});
    expect(inquiryStore.getSnapshot().ready).toBe(true);
    expect(inquiryStore.getSnapshot().items).toHaveLength(2);
    unsub();
  });

  it('server snapshot is empty and not ready (hydration-safe)', () => {
    expect(inquiryStore.getServerSnapshot()).toEqual({ items: [], ready: false });
  });
});
