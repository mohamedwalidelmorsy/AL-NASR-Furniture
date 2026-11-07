import { siteConfig } from '@/lib/site-config';
import type { RfqPayload } from './schema';

export type RfqFailure = 'not_configured' | 'server' | 'network';

export class RfqSubmitError extends Error {
  constructor(public readonly code: RfqFailure) {
    super(code);
  }
}

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
    throw new RfqSubmitError(res.status === 503 && body.error === 'not_configured' ? 'not_configured' : 'server');
  }
  let data: { reference?: unknown } = {};
  try { data = (await res.json()) as { reference?: unknown }; } catch { /* reference is optional */ }
  return { reference: typeof data.reference === 'string' ? data.reference : null };
}
