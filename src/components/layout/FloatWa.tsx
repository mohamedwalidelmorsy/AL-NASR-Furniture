'use client';

import { A } from '@/components/ui/A';
import { WaPending } from '@/components/wa-pending';
import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useT } from '@/lib/use-t';
import { siteConfig, waLink, whatsappReady } from '@/lib/site-config';
import { pageKeyFromPath } from '@/lib/links';
import { useProductWa } from '@/components/product-wa';
import type { Locale } from '@/i18n/routing';

export function FloatWa() {
  const t = useT();
  const lang = useLocale() as Locale;
  const page = pageKeyFromPath(usePathname());
  const productWa = useProductWa();
  const waReady = whatsappReady(siteConfig.whatsappNumber);
  const waNotReady = !waReady;
  const floatWaHref = productWa.href || waLink(siteConfig.whatsappNumber, t.wa.general);
  // The accessible name must contain the visible text "WhatsApp" (WCAG 2.5.3), also in Arabic.
  const waPendingAria = 'WhatsApp — ' + t.toast.waPending;
  void lang;
  if (page === 'contact' || page === 'inquiry') return null;
  return (
    <>
  {(waReady) && (<>
    <A href={floatWaHref} target="_blank" rel="noopener noreferrer" aria-label={'WhatsApp — ' + t.contact.waBtn} style={{ position: "fixed", bottom: "calc(20px + env(safe-area-inset-bottom))", insetInlineEnd: "20px", zIndex: "45", display: "inline-flex", alignItems: "center", gap: "10px", height: "52px", padding: "0 20px", borderRadius: "26px", background: "#584838", color: "#fff", fontSize: "15px", fontWeight: "600", textDecoration: "none", boxShadow: "0 4px 16px rgba(37,37,37,.18)" }} className="sh3"><span aria-hidden="true" style={{ width: "8px", height: "8px", borderRadius: "4px", background: "#7FC8A0" }}></span>WhatsApp</A>
  </>)}
  {(waNotReady) && (<>
    <WaPending aria-label={waPendingAria} style={{ position: "fixed", bottom: "calc(20px + env(safe-area-inset-bottom))", insetInlineEnd: "20px", zIndex: "45", display: "inline-flex", alignItems: "center", gap: "10px", height: "52px", padding: "0 20px", borderRadius: "26px", border: "0", background: "#584838", color: "#fff", fontSize: "15px", fontWeight: "600", cursor: "pointer", boxShadow: "0 4px 16px rgba(37,37,37,.18)" }}><span aria-hidden="true" style={{ width: "8px", height: "8px", borderRadius: "4px", background: "#A58B64" }}></span>WhatsApp</WaPending>
  </>)}
    </>
  );
}
