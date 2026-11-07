/** Pure helpers for the Inquiry List. Storage shape is unchanged from the approved prototype
 *  (`alnasr.inquiry.v1` → [{ id, qty, note }]) so existing selections survive the migration. */
export interface InquiryItem {
  id: string;
  qty: number | '';
  note: string;
}

export const MAX_QTY = 99999;

export function parseStoredInquiry(raw: string | null): InquiryItem[] {
  if (!raw) return [];
  try {
    const v: unknown = JSON.parse(raw);
    if (!Array.isArray(v)) return [];
    return v
      .filter((i): i is Record<string, unknown> => !!i && typeof i === 'object' && typeof (i as { id?: unknown }).id === 'string' && !!(i as { id: string }).id)
      .map((i) => ({
        id: String(i.id),
        qty: i.qty === '' ? '' : Math.max(1, Math.min(MAX_QTY, parseInt(String(i.qty), 10) || 1)),
        note: typeof i.note === 'string' ? i.note.slice(0, 300) : '',
      }));
  } catch {
    return [];
  }
}

export const upsertItem = (items: InquiryItem[], id: string, qty: number): InquiryItem[] =>
  items.some((i) => i.id === id) ? items.map((i) => (i.id === id ? { ...i, qty } : i)) : [...items, { id, qty, note: '' }];

export const clampQty = (v: string | number): number | '' =>
  v === '' ? '' : Math.max(1, Math.min(MAX_QTY, parseInt(String(v), 10) || 1));

export function reinsert(items: InquiryItem[], item: InquiryItem, idx: number): InquiryItem[] {
  if (items.some((i) => i.id === item.id)) return items;
  const n = items.slice();
  n.splice(idx, 0, item);
  return n;
}
