'use client';

import { Fragment } from 'react';
import { A } from '@/components/ui/A';
import { Img } from '@/components/ui/Img';
import { useState, type ChangeEvent } from 'react';
import { useT } from '@/lib/use-t';
import { useLocale } from 'next-intl';
import { countMessage } from '@/lib/plural';
import { useInquiry } from '@/features/inquiry/inquiry-provider';
import type { ProductCard } from '@/lib/product-cards';

export interface CategoryViewProps {
  products: (ProductCard & { styleKey: string | null })[];
  catTabs: { href: string; name: string; current: boolean }[];
  styleOptions: { key: string; label: string }[];
}

export function CategoryView({ products, catTabs: tabs, styleOptions }: CategoryViewProps) {
  const t = useT();
  const lang = useLocale() as 'en' | 'ar';
  const { validItems } = useInquiry();
  const [q, setQ] = useState('');
  const [style, setStyle] = useState('all');
  const inq = new Map(validItems.map((i) => [i.id, i]));
  const needle = q.trim().toLowerCase();
  const filtered = products.filter((p) => (style === 'all' || p.styleKey === style) && (!needle || p.search.includes(needle)));
  const catCards = filtered.map((p) => ({ ...p, inList: inq.has(p.id), qty: inq.get(p.id)?.qty ?? '' }));
  const catCount = countMessage(lang, filtered.length, { one: t.category.count1, two: t.category.count2, few: t.category.count, many: t.category.countMany });
  const catEmpty = filtered.length === 0;
  const onQ = (e: ChangeEvent<HTMLInputElement>) => setQ(e.target.value);
  const resetFilters = () => { setQ(''); setStyle('all'); };
  const hasStyleChips = styleOptions.length > 1;
  const styleChips = [{ key: 'all', label: t.category.all }, ...styleOptions].map((o) => {
    const on = style === o.key;
    return { label: o.label, pressed: on ? ('true' as const) : ('false' as const), bg: on ? '#584838' : 'transparent', color: on ? '#fff' : '#584838', border: on ? '#584838' : '#D8D2C9', onClick: () => setStyle(o.key) };
  });
  const catTabs = tabs.map((c) => ({ href: c.href, name: c.name, aria: c.current ? ('page' as const) : undefined, bg: c.current ? '#252525' : 'transparent', color: c.current ? '#FAF9F6' : '#252525', border: c.current ? '#252525' : '#D8D2C9' }));
  return (
    <>
  <section style={{ padding: "clamp(32px,4vw,48px) 0 clamp(56px,8vw,96px)" }}>
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 clamp(20px,4vw,40px)", boxSizing: "content-box" }}>
      <nav aria-label={t.collections.allCats} style={{ marginBottom: "32px" }}>
        <ul style={{ listStyle: "none", margin: "0", padding: "0", display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {catTabs.map((c, __i) => (<Fragment key={__i}>
            <li><A href={c.href} aria-current={c.aria} style={{ display: "inline-flex", alignItems: "center", height: "40px", padding: "0 16px", borderRadius: "20px", border: `1px solid ${c.border}`, background: c.bg, color: c.color, fontSize: "14px", fontWeight: "600", textDecoration: "none" }}>{c.name}</A></li>
          </Fragment>))}
        </ul>
      </nav>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: "20px 32px", paddingBottom: "24px", marginBottom: "32px", borderBottom: "1px solid #D8D2C9" }}>
        <div role="search" style={{ flex: "1 1 280px", maxWidth: "420px" }}>
          <label htmlFor="catq" style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "8px" }}>{t.category.search}</label>
          <input id="catq" type="search" value={q} onChange={onQ} placeholder={t.collections.searchPh} autoComplete="off" style={{ width: "100%", height: "48px", padding: "0 14px", border: "1px solid #D8D2C9", borderRadius: "8px", background: "#fff", fontSize: "16px" }} className="sf9" />
        </div>
        {(hasStyleChips) && (<>
          <fieldset style={{ border: "0", margin: "0", padding: "0", minWidth: "0" }}>
            <legend style={{ padding: "0", fontSize: "14px", fontWeight: "600", marginBottom: "8px" }}>{t.category.filter}</legend>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {styleChips.map((ch, __i) => (<Fragment key={__i}>
                <button type="button" onClick={ch.onClick} aria-pressed={ch.pressed} style={{ height: "40px", padding: "0 16px", borderRadius: "20px", border: `1px solid ${ch.border}`, background: ch.bg, color: ch.color, fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>{ch.label}</button>
              </Fragment>))}
            </div>
          </fieldset>
        </>)}
        <p role="status" style={{ margin: "0", marginInlineStart: "auto", fontSize: "14px", color: "#625C54", minHeight: "20px" }}>{catCount}</p>
      </div>
      {(catEmpty) && (<>
        <div style={{ padding: "56px 24px", border: "1px dashed #D8D2C9", borderRadius: "10px", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", textAlign: "center" }}>
          <p style={{ margin: "0", fontSize: "16px" }}>{t.category.empty}</p>
          <button type="button" onClick={resetFilters} style={{ height: "44px", padding: "0 20px", borderRadius: "6px", border: "1px solid #584838", background: "transparent", color: "#584838", fontWeight: "600", fontSize: "15px", cursor: "pointer" }}>{t.category.reset}</button>
        </div>
      </>)}
      <ul style={{ listStyle: "none", margin: "0", padding: "0", display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,max(220px,calc((100% - 48px) / 3))),1fr))", gap: "clamp(32px,4vw,48px) clamp(16px,2vw,24px)" }}>
        {catCards.map((k, __i) => (<Fragment key={__i}>
          <li>
            <A href={k.href} style={{ display: "flex", flexDirection: "column", gap: "14px", textDecoration: "none", color: "#252525" }}>
              <div style={{ position: "relative", borderRadius: "10px", overflow: "hidden", background: "#E9E4DC" }}>
                <Img src={k.img} alt={k.alt} width={k.w} height={k.h} loading={__i < 3 ? "eager" : "lazy"} decoding="async" style={{ display: "block", width: "100%", height: "auto", aspectRatio: k.box, objectFit: k.fit, transition: "transform .25s ease" }} className="sh6" /><span style={{ position: "absolute", bottom: "10px", insetInlineStart: "10px", padding: "3px 8px", borderRadius: "4px", background: "rgba(250,249,246,.94)", fontSize: "11px", fontWeight: "600", color: "#4F4943" }}>{t.illustrative}</span>
                {(k.inList) && (<><span style={{ position: "absolute", top: "12px", insetInlineStart: "12px", padding: "4px 10px", borderRadius: "4px", background: "#584838", color: "#fff", fontSize: "12px", fontWeight: "600" }}>{t.nav.inquiryShort} · {k.qty}</span></>)}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "13px", color: "#625C54" }}>{k.style}{k.chip ? ` · ${k.chip}` : ''}</span>
                <h2 style={{ margin: "0", fontSize: "clamp(18px,1.6vw,20px)", lineHeight: "1.4", fontWeight: "600" }}>{k.name}</h2>
                <span dir="ltr" data-keep-ls="" style={{ alignSelf: "flex-start", font: "500 12px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace", color: "#625C54", letterSpacing: ".04em" }}>{k.code}</span>
                <span style={{ marginTop: "6px", display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: "600", color: "#584838" }}>{t.card.view} <span aria-hidden="true">{t.arrow}</span></span>
              </div>
            </A>
          </li>
        </Fragment>))}
      </ul>
    </div>
  </section>
    </>
  );
}
