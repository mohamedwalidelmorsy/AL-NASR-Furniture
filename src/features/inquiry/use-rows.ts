'use client';

import { useT } from '@/lib/use-t';
import { fmt } from '@/lib/messages';
import { unitLabel } from '@/lib/unit-label';
import type { ProductCard } from '@/lib/product-cards';
import { clampQty, MAX_QTY } from './storage';
import { useInquiry } from './inquiry-provider';

/** View rows for the Inquiry List and the RFQ sidebar (same shape the approved prototype rendered). */
export function useInquiryRows(products: ProductCard[]) {
  const t = useT();
  const { validItems, update, remove, mergedCodes } = useInquiry();
  const byId = new Map(products.map((p) => [p.id, p]));
  return validItems.flatMap((i) => {
    const c = byId.get(i.id);
    if (!c) return [];
    const q = parseInt(String(i.qty), 10);
    const unit = unitLabel(t.detail, c.unitKind, q || 1);
    const unitPlural = unitLabel(t.detail, c.unitKind);
    return [{
      href: c.href, img: c.img, box: c.box, fit: c.fit, name: c.name, code: c.code, cat: c.cat, qty: i.qty, note: i.note, hasNote: !!i.note.trim(),
      qtyId: `q-${c.id}`, noteId: `n-${c.id}`, qtyLabel: `${t.inquiry.qty} (${unitPlural})`, qtyText: `${q || 1} ${unit}`,
      removeLabel: `${t.inquiry.remove}: ${c.name}`,
      mergedNote: i.from?.length ? fmt(t.inquiry.mergedFrom, { codes: i.from.map((f) => mergedCodes[f] ?? f).join(', ') }) : '',
      dec: () => update(c.id, { qty: Math.max(1, (parseInt(String(i.qty), 10) || 1) - 1) }),
      inc: () => update(c.id, { qty: Math.min(MAX_QTY, (parseInt(String(i.qty), 10) || 0) + 1) }),
      onQty: (e: { target: { value: string } }) => update(c.id, { qty: clampQty(e.target.value) }),
      onQtyBlur: () => { if (!(parseInt(String(i.qty), 10) >= 1)) update(c.id, { qty: 1 }); },
      onNote: (e: { target: { value: string } }) => update(c.id, { note: e.target.value.slice(0, 300) }),
      onRemove: () => remove(c.id),
    }];
  });
}
