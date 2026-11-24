'use client';

import { Fragment } from 'react';
import { A } from '@/components/ui/A';
import { Img } from '@/components/ui/Img';
import { useT } from '@/lib/use-t';
import { useLocale } from 'next-intl';
import { countMessage } from '@/lib/plural';
import { buildLinks } from '@/lib/links';
import { useInquiry } from '@/features/inquiry/inquiry-provider';
import { useInquiryRows } from '@/features/inquiry/use-rows';
import type { ProductCard } from '@/lib/product-cards';
import type { Locale } from '@/i18n/routing';

export function InquiryView({ products }: { products: ProductCard[] }) {
  const t = useT();
  const links = buildLinks(useLocale() as Locale);
  const { ready, archivedItems, removeArchived } = useInquiry();
  const hasArchived = archivedItems.length > 0;
  const inqItems = useInquiryRows(products);
  const inqCount = inqItems.length;
  const hasInq = inqCount > 0;
  const inqEmpty = !hasInq && !hasArchived;
  const lang = useLocale() as 'en' | 'ar';
  const inqSelectedText = countMessage(lang, inqCount, { one: t.inquiry.selected1, two: t.inquiry.selected2, few: t.inquiry.selected, many: t.inquiry.selectedMany });
  const archNotice = (n: number) => countMessage(lang, n, { one: t.inquiry.archivedNotice1, two: t.inquiry.archivedNotice2, few: t.inquiry.archivedNotice, many: t.inquiry.archivedNoticeMany });
  // Wait for localStorage so a saved list never flashes the empty state.
  if (!ready) return <section aria-busy="true" style={{ minHeight: '40vh' }} />;
  return (
    <>
  <section style={{ padding: "clamp(32px,4vw,48px) 0 clamp(56px,8vw,96px)" }}>
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 clamp(20px,4vw,40px)", boxSizing: "content-box" }}>
      {(inqEmpty) && (<>
        <div style={{ padding: "clamp(40px,6vw,80px) 24px", border: "1px dashed #D8D2C9", borderRadius: "10px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "16px" }}>
          <h2 style={{ margin: "0", fontSize: "clamp(22px,2.4vw,26px)", fontWeight: "600" }}>{t.inquiry.emptyTitle}</h2>
          <p style={{ margin: "0", maxWidth: "52ch", color: "#625C54" }}>{t.inquiry.emptyBody}</p>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "12px", marginTop: "8px" }}>
            <A href={links.collections} style={{ display: "inline-flex", alignItems: "center", height: "48px", padding: "0 24px", borderRadius: "6px", background: "#584838", color: "#fff", fontSize: "15px", fontWeight: "600", textDecoration: "none" }} className="sh3">{t.inquiry.browse}</A>
            <A href={links.contact} style={{ display: "inline-flex", alignItems: "center", height: "48px", padding: "0 24px", borderRadius: "6px", border: "1px solid #584838", color: "#584838", fontSize: "15px", fontWeight: "600", textDecoration: "none" }} className="sh4">{t.inquiry.general}</A>
          </div>
        </div>
      </>)}
      {(hasInq || hasArchived) && (<>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "clamp(24px,4vw,48px)", alignItems: "flex-start" }}>
          <ul style={{ flex: "3 1 520px", minWidth: "0", listStyle: "none", margin: "0", padding: "0", display: "flex", flexDirection: "column", borderTop: "1px solid #252525" }}>
            {inqItems.map((it, __i) => (<Fragment key={__i}>
              <li style={{ display: "grid", gridTemplateColumns: "clamp(72px,14vw,112px) minmax(0,1fr)", gap: "clamp(16px,2vw,24px)", padding: "24px 0", borderBottom: "1px solid #D8D2C9" }}>
                <A href={it.href} aria-hidden="true" tabIndex={-1} style={{ display: "block", aspectRatio: it.box, alignSelf: "start", borderRadius: "6px", overflow: "hidden", background: "#E9E4DC" }}><Img src={it.img} alt="" loading="lazy" decoding="async" style={{ display: "block", width: "100%", height: "100%", objectFit: it.fit }} /></A>
                <div style={{ display: "flex", flexDirection: "column", gap: "14px", minWidth: "0" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "8px 16px" }}>
                    <div style={{ minWidth: "0" }}>
                      <span style={{ fontSize: "13px", color: "#625C54" }}>{it.cat}</span>
                      <h2 style={{ margin: "2px 0 4px", fontSize: "clamp(18px,1.6vw,20px)", lineHeight: "1.4", fontWeight: "600" }}><A href={it.href} style={{ color: "#252525", textDecoration: "none" }} className="sh5">{it.name}</A></h2>
                      <span dir="ltr" data-keep-ls="" style={{ font: "500 12px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace", color: "#625C54", letterSpacing: ".04em" }}>{it.code}</span>
                    </div>
                    <button type="button" onClick={it.onRemove} aria-label={it.removeLabel} style={{ alignSelf: "flex-start", height: "40px", padding: "0 12px", borderRadius: "6px", border: "0", background: "transparent", color: "#B42318", fontSize: "14px", fontWeight: "600", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: "3px" }}>{t.inquiry.remove}</button>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "flex-end" }}>
                    <div>
                      <label htmlFor={it.qtyId} style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>{it.qtyLabel}</label>
                      <div style={{ display: "flex", border: "1px solid #D8D2C9", borderRadius: "8px", overflow: "hidden", width: "max-content" }}>
                        <button type="button" onClick={it.dec} aria-label={t.detail.dec} style={{ width: "44px", height: "44px", border: "0", background: "#FAF9F6", fontSize: "18px", cursor: "pointer" }}>−</button>
                        <input id={it.qtyId} type="number" inputMode="numeric" min={1} step={1} value={it.qty} onChange={it.onQty} onBlur={it.onQtyBlur} style={{ width: "64px", height: "44px", border: "0", borderInline: "1px solid #D8D2C9", textAlign: "center", fontSize: "16px", fontWeight: "600", background: "#fff" }} />
                        <button type="button" onClick={it.inc} aria-label={t.detail.inc} style={{ width: "44px", height: "44px", border: "0", background: "#FAF9F6", fontSize: "18px", cursor: "pointer" }}>+</button>
                      </div>
                    </div>
                    {(it.mergedNote) && (<p data-testid="merged-note" style={{ flex: "1 1 100%", margin: "0", fontSize: "13px", color: "#625C54" }}>{it.mergedNote}</p>)}
                    <div style={{ flex: "1 1 220px", minWidth: "0" }}>
                      <label htmlFor={it.noteId} style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>{t.inquiry.note}</label>
                      <input id={it.noteId} type="text" value={it.note} onChange={it.onNote} placeholder={t.inquiry.notePh} maxLength={300} style={{ width: "100%", height: "44px", padding: "0 12px", border: "1px solid #D8D2C9", borderRadius: "8px", background: "#fff", fontSize: "16px" }} className="sf9" />
                    </div>
                  </div>
                </div>
              </li>
            </Fragment>))}
            {archivedItems.map((it) => (
              <li key={it.id} data-testid="archived-row" style={{ display: "grid", gridTemplateColumns: "clamp(72px,14vw,112px) minmax(0,1fr)", gap: "clamp(16px,2vw,24px)", padding: "24px 0", borderBottom: "1px solid #D8D2C9", opacity: ".85" }}>
                <div aria-hidden="true" style={{ aspectRatio: "3/4", borderRadius: "6px", background: "repeating-linear-gradient(135deg,#E9E4DC 0 6px,#E3DDD3 6px 12px)" }}></div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", minWidth: "0" }}>
                  <span style={{ alignSelf: "flex-start", padding: "3px 8px", borderRadius: "4px", background: "#E9E4DC", fontSize: "12px", fontWeight: "600", color: "#4F4943" }}>{t.inquiry.archivedLabel}</span>
                  <h2 style={{ margin: "0", fontSize: "clamp(18px,1.6vw,20px)", lineHeight: "1.4", fontWeight: "600" }}>{it.name}</h2>
                  <span dir="ltr" data-keep-ls="" style={{ font: "500 12px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace", color: "#625C54", letterSpacing: ".04em" }}>{it.code}</span>
                  <p style={{ margin: "0", fontSize: "14px", color: "#4F4943" }}>{t.inquiry.qty}: {it.qty}{it.note ? ` · ${it.note}` : ''}</p>
                  <p style={{ margin: "0", fontSize: "13px", color: "#625C54" }}>{t.inquiry.archivedKept}</p>
                </div>
              </li>
            ))}
          </ul>
          <aside aria-labelledby="inq-sum" style={{ flex: "1 1 300px", minWidth: "0", position: "sticky", top: "104px", padding: "28px", borderRadius: "10px", background: "#E9E4DC", display: "flex", flexDirection: "column", gap: "16px" }}>
            <h2 id="inq-sum" style={{ margin: "0", fontSize: "20px", fontWeight: "600" }}>{t.inquiry.summary}</h2>
            {(hasArchived) && (<div role="status" data-testid="archived-notice" style={{ padding: "12px 14px", borderRadius: "6px", background: "#FAF9F6", border: "1px solid #D8D2C9", display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px" }}>
              <span>{archNotice(archivedItems.length)}</span>
              {(!hasInq) && (<span>{t.inquiry.archivedOnly}</span>)}
              <button type="button" onClick={removeArchived} style={{ alignSelf: "flex-start", height: "40px", padding: "0 14px", borderRadius: "6px", border: "1px solid #B42318", background: "transparent", color: "#B42318", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>{t.inquiry.removeArchived}</button>
            </div>)}
            {(hasInq) && (<p style={{ margin: "0", fontSize: "16px" }}>{inqSelectedText}</p>)}
            <p style={{ margin: "0", fontSize: "14px", color: "#4F4943" }}>{t.inquiry.notCart}</p>
            {(hasInq) ? (<A href={links.contact} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", height: "52px", borderRadius: "6px", background: "#584838", color: "#fff", fontSize: "15px", fontWeight: "600", textDecoration: "none" }} className="sh3">{t.inquiry.continueRfq} <span aria-hidden="true">{t.arrow}</span></A>) : (<A href={links.contact} style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "52px", borderRadius: "6px", background: "#584838", color: "#fff", fontSize: "15px", fontWeight: "600", textDecoration: "none" }} className="sh3">{t.inquiry.general}</A>)}
            <A href={links.collections} style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "48px", borderRadius: "6px", border: "1px solid #584838", color: "#584838", fontSize: "15px", fontWeight: "600", textDecoration: "none" }} className="shc">{t.inquiry.continueBrowsing}</A>
            <p style={{ margin: "0", fontSize: "13px", color: "#4F4943" }}>{t.inquiry.saved}</p>
            <A href={links.shipping} style={{ alignSelf: "flex-start", fontSize: "14px", fontWeight: "600" }}>{t.inquiry.guide}</A>
          </aside>
        </div>
      </>)}
    </div>
  </section>
    </>
  );
}
