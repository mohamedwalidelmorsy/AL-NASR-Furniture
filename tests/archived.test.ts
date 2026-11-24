import { describe, expect, it, vi } from 'vitest';

// A retired sample product injected into the catalog for these tests only (the real data has no archived records yet).
vi.mock('@/lib/catalog', async (orig) => {
  const m = await orig<typeof import('@/lib/catalog')>();
  const old = { ...m.allProducts()[0], id: 'pv-old-01', code: 'PV-OLD-01', slug: 'old-sample', status: 'archived' as const };
  const all = () => [...m.allProducts(), old];
  return { ...m, allProducts: all, activeProducts: () => all().filter((p) => (p.status ?? 'active') === 'active'), archivedProducts: () => all().filter((p) => p.status === 'archived') };
});

import { classifyItems } from '@/features/inquiry/storage';
import { buildRfqPayload, resolveItems } from '@/features/rfq/payload';
import { emptyRfqForm, type RfqFormValues } from '@/features/rfq/schema';
import { handleRfq } from '@/features/rfq/server/handler';
import { createRateLimiter } from '@/lib/rate-limit';

const items = [{ id: 'pv-br-01', qty: 3, note: 'keep' }, { id: 'pv-old-01', qty: 7, note: 'old note' }, { id: 'NOT-A-PRODUCT', qty: 1, note: '' }];

describe('Inquiry List — archived products are never silently replaced or submitted', () => {
  it('classifies lines without rewriting ids, quantities or notes', () => {
    const r = classifyItems(items, ['pv-br-01'], ['pv-old-01']);
    expect(r.active.map((i) => i.id)).toEqual(['pv-br-01']);
    expect(r.archived).toEqual([{ id: 'pv-old-01', qty: 7, note: 'old note' }]);
    expect(r.unknown.map((i) => i.id)).toEqual(['NOT-A-PRODUCT']);
  });
  it('the RFQ payload only ever contains ACTIVE products; the buyer can still submit them', () => {
    expect(resolveItems(items).map((i) => i.id)).toEqual(['pv-br-01']);
    const form: RfqFormValues = { ...emptyRfqForm(), name: 'A', country: 'SA', email: 'a@b.co', message: '', consent: true };
    const p = buildRfqPayload(form, items, 'en', 'http://x/y');
    expect(p.items.map((i) => i.collection_id)).toEqual(['pv-br-01']);
    expect(p.items[0]).toMatchObject({ quantity: 3, notes: 'keep' });
  });
});

describe('RFQ API rejects archived product ids', () => {
  const body = (itemsIn: unknown[]) => JSON.stringify({
    contact: { name: 'A', company: null, buyer_type: null, email: 'a@b.co', phone: null, preferred_method: 'email' }, destination_country: 'SA',
    items: itemsIn, inquiry_type: null, trade_preferences: { delivery_term: null, payment_term: null, destination_port_city: null }, message: 'hi',
    consent: { given: true, text_version: 'v1', at: new Date().toISOString() }, locale: 'en', source_url: 'http://x', created_at: new Date().toISOString(), website: '',
  });
  const req = (b: string) => new Request('http://localhost/api/rfq', { method: 'POST', headers: { 'content-type': 'application/json' }, body: b });
  const deps = () => ({ delivery: { isConfigured: () => true, send: vi.fn(async () => undefined) }, limiter: createRateLimiter(100, 60), log: vi.fn() });

  it('422 archived_item (distinct from unknown_item); nothing is sent', async () => {
    const d = deps();
    const res = await handleRfq(req(body([{ collection_id: 'pv-old-01', code: 'PV-OLD-01', quantity: 1, unit: 'set', notes: null }])), d as never);
    expect(res.status).toBe(422);
    expect(JSON.stringify(await res.json())).toContain('archived_item');
    expect(d.delivery.send).not.toHaveBeenCalled();
  });
  it('still rejects unknown ids with unknown_item and accepts active ones', async () => {
    const d = deps();
    const bad = await handleRfq(req(body([{ collection_id: 'zzz', code: 'ZZZ', quantity: 1, unit: 'set', notes: null }])), d as never);
    expect(JSON.stringify(await bad.json())).toContain('unknown_item');
    const ok = await handleRfq(req(body([{ collection_id: 'pv-br-01', code: 'PV-BR-01', quantity: 2, unit: 'set', notes: null }])), d as never);
    expect(ok.status).toBe(200);
  });
});
