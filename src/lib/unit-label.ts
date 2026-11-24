import type { UnitKind } from '@/lib/catalog';
import type { Messages } from '@/lib/messages';

/** Context-sensitive name of one unit of a product ("corner sofa", "bedroom set"…), singular for 1, plural otherwise. */
export function unitLabel(t: Pick<Messages['detail'], 'unitKinds'>, kind: UnitKind, qty?: number | ''): string {
  const k = t.unitKinds[kind] ?? t.unitKinds['bedroom-set'];
  return qty === 1 ? k.one : k.other;
}
