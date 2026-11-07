'use client';

import { A } from '@/components/ui/A';
import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useT } from '@/lib/use-t';
import { useToast } from '@/components/toast-provider';
import { useInquiry } from '@/features/inquiry/inquiry-provider';
import { buildLinks, pageKeyFromPath } from '@/lib/links';
import type { Locale } from '@/i18n/routing';

export function ToastView() {
  const t = useT();
  const links = buildLinks(useLocale() as Locale);
  const page = pageKeyFromPath(usePathname());
  const { toast } = useToast();
  const { undoRemove } = useInquiry();
  const hasToast = !!toast;
  const toastMsg = toast ? t.toast[toast.key] : '';
  const toastUndo = !!toast?.undo;
  const toastLink = !!toast?.link && page !== 'inquiry';
  return (
    <>
<div role="status" aria-live="polite" style={{ position: "fixed", left: "50%", transform: "translateX(-50%)", bottom: "calc(88px + env(safe-area-inset-bottom))", zIndex: "60", width: "max-content", maxWidth: "calc(100vw - 40px)" }}>
  {(hasToast) && (<>
    <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "12px 16px 12px 20px", borderRadius: "8px", background: "#252525", color: "#FAF9F6", fontSize: "15px", boxShadow: "0 6px 24px rgba(37,37,37,.2)" }}>
      <span>{toastMsg}</span>
      {(toastUndo) && (<><button type="button" onClick={undoRemove} style={{ height: "36px", padding: "0 12px", borderRadius: "6px", border: "1px solid #625C54", background: "transparent", color: "#FAF9F6", fontWeight: "600", cursor: "pointer" }}>{t.toast.undo}</button></>)}
      {(toastLink) && (<><A href={links.inquiry} style={{ color: "#E9E4DC", fontWeight: "600", whiteSpace: "nowrap" }}>{t.detail.viewList}</A></>)}
    </div>
  </>)}
</div>
    </>
  );
}
