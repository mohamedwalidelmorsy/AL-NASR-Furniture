/** Pure helpers for the Inquiry List. Storage shape is unchanged from the approved prototype
 *  (`alnasr.inquiry.v1` → [{ id, qty, note }]) so existing selections survive the migration. */
export interface InquiryItem {
  id: string;
  qty: number | '';
  note: string;
  /** Ids of approved duplicate records that were combined into this line (disclosure metadata; never used as a product id). */
  from?: string[];
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
        ...(Array.isArray(i.from) && i.from.every((f) => typeof f === 'string') && i.from.length ? { from: (i.from as string[]).slice(0, 10) } : {}),
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

export type ItemClass = 'active' | 'archived' | 'unknown';

/**
 * Splits persisted inquiry lines by catalog status. Nothing is rewritten or re-mapped:
 * archived lines keep their id, quantity and note until the buyer removes them; unknown ids are ignored (but kept in storage).
 */
export function classifyItems(items: InquiryItem[], activeIds: readonly string[], archivedIds: readonly string[]) {
  const out: { active: InquiryItem[]; archived: InquiryItem[]; unknown: InquiryItem[] } = { active: [], archived: [], unknown: [] };
  for (const i of items) {
    if (activeIds.includes(i.id)) out.active.push(i);
    else if (archivedIds.includes(i.id)) out.archived.push(i);
    else out.unknown.push(i);
  }
  return out;
}

const qtyOf = (q: number | '') => (q === '' ? 1 : Math.max(1, Math.min(MAX_QTY, parseInt(String(q), 10) || 1)));

/**
 * Explicit, owner-approved canonicalisation of old Inquiry List lines: a line saved under a duplicate id (e.g. `pv-br-12`)
 * becomes the continuing product (`pv-br-01`). Quantity and note are preserved; if both ids are present the quantities are
 * added and the notes joined, so the same design never appears twice. The original id is kept in `from` for disclosure.
 * Anything not in the map is returned untouched.
 */
export function migrateMergedItems(items: InquiryItem[], map: Record<string, string>): InquiryItem[] {
  if (!items.some((i) => map[i.id])) return items;
  const out: InquiryItem[] = [];
  for (const i of items) {
    const to = map[i.id];
    if (!to) { out.push(i); continue; }
    const existing = out.find((o) => o.id === to);
    const from = [...new Set([...(i.from ?? []), i.id])];
    if (existing) {
      existing.qty = Math.min(MAX_QTY, qtyOf(existing.qty) + qtyOf(i.qty));
      existing.note = [existing.note.trim(), i.note.trim()].filter(Boolean).join(' / ').slice(0, 300);
      existing.from = [...new Set([...(existing.from ?? []), ...from])];
    } else out.push({ id: to, qty: i.qty, note: i.note, from });
  }
  // a continuing id that appeared later than its duplicate must not stay duplicated
  const merged: InquiryItem[] = [];
  for (const i of out) {
    const same = merged.find((m) => m.id === i.id);
    if (same) { same.qty = Math.min(MAX_QTY, qtyOf(same.qty) + qtyOf(i.qty)); same.note = [same.note.trim(), i.note.trim()].filter(Boolean).join(' / ').slice(0, 300); same.from = [...new Set([...(same.from ?? []), ...(i.from ?? [])])]; }
    else merged.push(i);
  }
  return merged;
}
