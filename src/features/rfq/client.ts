import { siteConfig } from '@/lib/site-config';
import type { RfqPayload } from './schema';

export type RfqFailure = 'not_configured' | 'rate_limited' | 'unavailable' | 'server' | 'network';

export class RfqSubmitError extends Error {
  /** Seconds to wait before retrying, from the server's Retry-After header (429 / 503). */
  constructor(public readonly code: RfqFailure, public readonly retryAfterSeconds: number | null = null) {
    super(code);
  }
}

const retryAfter = (res: Response): number | null => {
  const n = Number(res.headers.get('retry-after'));
  return Number.isFinite(n) && n > 0 ? Math.ceil(n) : null;
};

/** 503 `not_configured` = delivery not set up; any other 503 = temporarily unavailable (e.g. limiter fail-closed). */
const failureOf = (status: number, error: string | undefined): RfqFailure => {
  if (status === 503) return error === 'not_configured' ? 'not_configured' : 'unavailable';
  if (status === 429) return 'rate_limited';
  return 'server';
};

/** Resolves ONLY on a real 2xx from the server — never reports success otherwise. */
export async function submitRfq(payload: RfqPayload, fetchImpl: typeof fetch = fetch): Promise<{ reference: string | null }> {
  let res: Response;
  try {
    res = await fetchImpl(siteConfig.rfqEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new RfqSubmitError('network');
  }
  if (!res.ok) {
    let body: { error?: string } = {};
    try { body = (await res.json()) as { error?: string }; } catch { /* non-JSON error body */ }
    throw new RfqSubmitError(failureOf(res.status, body.error), retryAfter(res));
  }
  let data: { reference?: unknown } = {};
  try { data = (await res.json()) as { reference?: unknown }; } catch { /* reference is optional */ }
  return { reference: typeof data.reference === 'string' ? data.reference : null };
}
