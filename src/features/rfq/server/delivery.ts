import 'server-only';
import type { RfqPayload } from '../schema';

/** Delivery adapter boundary. Swap the implementation (SMTP, CRM, queue) without touching the route. */
export interface RfqDelivery {
  isConfigured(): boolean;
  send(rfq: RfqPayload, reference: string): Promise<void>;
}

export class DeliveryError extends Error {
  constructor(public readonly status: number | 'network') {
    super(`delivery_failed:${status}`);
  }
}

const clean = (s: string | null | undefined) => (s ?? '').replace(/[\r\n]+/g, ' ').trim();

export function formatRfqText(rfq: RfqPayload, reference: string): string {
  const lines = [
    `RFQ ${reference}`,
    `Received: ${rfq.created_at}   Language: ${rfq.locale}   Page: ${clean(rfq.source_url)}`,
    '',
    `Name: ${clean(rfq.contact.name)}`,
    `Company: ${clean(rfq.contact.company) || '-'}`,
    `Buyer type: ${rfq.contact.buyer_type ?? '-'}`,
    `Country: ${rfq.destination_country}`,
    `Email: ${clean(rfq.contact.email) || '-'}`,
    `Phone: ${clean(rfq.contact.phone) || '-'}`,
    `Preferred contact: ${rfq.contact.preferred_method}`,
    '',
    `Inquiry type: ${rfq.inquiry_type ?? '-'}`,
    `Delivery term: ${rfq.trade_preferences.delivery_term ?? '-'}`,
    `Payment term: ${rfq.trade_preferences.payment_term ?? '-'}`,
    `Destination port/city: ${clean(rfq.trade_preferences.destination_port_city) || '-'}`,
    '',
    'Items:',
    ...(rfq.items.length ? rfq.items.map((i) => `  - ${i.code} (${i.collection_id}) x ${i.quantity} ${i.unit}${i.notes ? ` — ${clean(i.notes)}` : ''}`) : ['  (none)']),
    '',
    'Message:',
    rfq.message ?? '-',
    '',
    `Consent: given, text version ${rfq.consent.text_version}, at ${rfq.consent.at}`,
  ];
  return lines.join('\n');
}

export class ResendDelivery implements RfqDelivery {
  constructor(private readonly apiKey: string, private readonly to: string, private readonly from: string) {}

  isConfigured() { return true; }

  async send(rfq: RfqPayload, reference: string) {
    let res: Response;
    try {
      res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: this.from,
          to: [this.to],
          subject: `New RFQ ${reference} — ${rfq.destination_country}`,
          text: formatRfqText(rfq, reference),
          ...(rfq.contact.email ? { reply_to: rfq.contact.email } : {}),
        }),
        signal: AbortSignal.timeout(10_000),
      });
    } catch {
      throw new DeliveryError('network');
    }
    if (!res.ok) throw new DeliveryError(res.status);
  }
}

const NOT_CONFIGURED: RfqDelivery = {
  isConfigured: () => false,
  send: async () => { throw new DeliveryError(503); },
};

export function getDelivery(env: NodeJS.ProcessEnv = process.env): RfqDelivery {
  const { RESEND_API_KEY, RFQ_TO_EMAIL, RFQ_FROM_EMAIL } = env;
  if (RESEND_API_KEY && RFQ_TO_EMAIL && RFQ_FROM_EMAIL) return new ResendDelivery(RESEND_API_KEY, RFQ_TO_EMAIL, RFQ_FROM_EMAIL);
  return NOT_CONFIGURED;
}
