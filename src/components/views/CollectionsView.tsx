'use client';

import { Fragment } from 'react';
import { A } from '@/components/ui/A';
import { Img } from '@/components/ui/Img';
import { useState, type ChangeEvent } from 'react';
import { useT } from '@/lib/use-t';
import { fmt } from '@/lib/messages';
import type { CatCard } from '@/lib/page-ctx';
import type { ProductCard } from '@/lib/product-cards';

export function CollectionsView({ allCats, products }: { allCats: CatCard[]; products: ProductCard[] }) {
  const t = useT();
  const [cq, setCq] = useState('');
  const hasCq = !!cq.trim();
  const noCq = !hasCq;
  const needle = cq.trim().toLowerCase();
  const cqResults = hasCq ? products.filter((p) => p.search.includes(needle)) : [];
  const cqEmpty = hasCq && cqResults.length === 0;
  const cqStatus = cqResults.length ? (cqResults.length === 1 ? fmt(t.collections.results1, { q: cq.trim() }) : fmt(t.collections.results, { n: cqResults.length, q: cq.trim() })) : fmt(t.collections.noResults, { q: cq.trim() });
  const onCq = (e: ChangeEvent<HTMLInputElement>) => setCq(e.target.value);
  const clearCq = () => setCq('');
  return (
    <>
  <section style={{ padding: "clamp(32px,4vw,48px) 0 clamp(56px,8vw,96px)" }}>
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 clamp(20px,4vw,40px)", boxSizing: "content-box" }}>
      <div role="search" style={{ maxWidth: "560px", marginBottom: "clamp(32px,4vw,48px)" }}>
        <label htmlFor="cq" style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "8px" }}>{t.collections.search}</label>
        <div style={{ display: "flex", gap: "8px" }}>
          <input id="cq" type="search" value={cq} onChange={onCq} placeholder={t.collections.searchPh} autoComplete="off" style={{ flex: "1", minWidth: "0", height: "48px", padding: "0 14px", border: "1px solid #D8D2C9", borderRadius: "8px", background: "#fff", fontSize: "16px" }} className="sf9" />
          {(hasCq) && (<><button type="button" onClick={clearCq} style={{ height: "48px", padding: "0 16px", border: "1px solid #D8D2C9", borderRadius: "8px", background: "transparent", fontSize: "14px", fontWeight: "600", color: "#584838", cursor: "pointer" }}>{t.collections.clear}</button></>)}
        </div>
      </div>
      {(hasCq) && (<>
        <p role="status" style={{ margin: "0 0 24px", fontSize: "15px", color: "#625C54" }}>{cqStatus}</p>
        {(cqEmpty) && (<>
          <div style={{ padding: "48px 24px", border: "1px dashed #D8D2C9", borderRadius: "10px", textAlign: "center" }}><p style={{ margin: "0", fontSize: "15px", color: "#625C54" }}>{t.collections.noResultsHint}</p></div>
        </>)}
        <ul style={{ listStyle: "none", margin: "0", padding: "0", display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,max(220px,calc((100% - 48px) / 3))),1fr))", gap: "clamp(16px,2vw,24px)" }}>
          {cqResults.map((k, __i) => (<Fragment key={__i}>
            <li>
              <A href={k.href} style={{ display: "flex", flexDirection: "column", gap: "14px", textDecoration: "none", color: "#252525" }}>
                <div style={{ position: "relative", borderRadius: "10px", overflow: "hidden", background: "#E9E4DC" }}><Img src={k.img} alt={k.alt} width={k.w} height={k.h} loading="lazy" decoding="async" style={{ display: "block", width: "100%", height: "auto", aspectRatio: k.box, objectFit: k.fit, transition: "transform .25s ease" }} className="sh6" /><span style={{ position: "absolute", bottom: "10px", insetInlineStart: "10px", padding: "3px 8px", borderRadius: "4px", background: "rgba(250,249,246,.94)", fontSize: "11px", fontWeight: "600", color: "#4F4943" }}>{t.illustrative}</span></div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span style={{ fontSize: "13px", color: "#625C54" }}>{k.cat}</span>
                  <h3 style={{ margin: "0", fontSize: "clamp(18px,1.6vw,20px)", lineHeight: "1.4", fontWeight: "600" }}>{k.name}</h3>
                  <span dir="ltr" data-keep-ls="" style={{ alignSelf: "flex-start", font: "500 12px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace", color: "#625C54", letterSpacing: ".04em" }}>{k.code}</span>
                  <span style={{ marginTop: "6px", display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: "600", color: "#584838" }}>{t.card.view} <span aria-hidden="true">{t.arrow}</span></span>
                </div>
              </A>
            </li>
          </Fragment>))}
        </ul>
      </>)}
      {(noCq) && (<>
        <ul style={{ listStyle: "none", margin: "0", padding: "0", display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,max(240px,calc((100% - 48px) / 3))),1fr))", gap: "clamp(24px,3vw,40px) clamp(16px,2vw,24px)" }}>
          {allCats.map((c, __i) => (<Fragment key={__i}>
            <li>
              <A href={c.href} style={{ display: "flex", flexDirection: "column", gap: "16px", textDecoration: "none", color: "#252525" }}>
                <div style={{ borderRadius: "10px", overflow: "hidden", background: "#E9E4DC" }}><Img src={c.img} alt={c.alt} loading={__i < 3 ? "eager" : "lazy"} decoding="async" style={{ display: "block", width: "100%", height: "auto", aspectRatio: "4/3", objectFit: "cover", objectPosition: "center 38%", transition: "transform .25s ease" }} className="sh6" /></div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "12px" }}><h2 style={{ margin: "0", fontSize: "20px", lineHeight: "1.4", fontWeight: "600" }}>{c.name}</h2><span style={{ fontSize: "13px", color: "#625C54", flex: "none" }}>{c.count}</span></div>
                  <p style={{ margin: "0", fontSize: "14px", color: "#625C54" }}>{c.desc}</p>
                  <span style={{ marginTop: "6px", display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: "600", color: "#584838" }}>{t.featured.cta} <span aria-hidden="true">{t.arrow}</span></span>
                </div>
              </A>
            </li>
          </Fragment>))}
        </ul>
      </>)}
    </div>
  </section>
    </>
  );
}
