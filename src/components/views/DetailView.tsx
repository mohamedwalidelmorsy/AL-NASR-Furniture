'use client';

import { Fragment } from 'react';
import { A } from '@/components/ui/A';
import { Img } from '@/components/ui/Img';
import { WaPending } from '@/components/wa-pending';
import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent, type TouchEvent } from 'react';
import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useT } from '@/lib/use-t';
import { fmt } from '@/lib/messages';
import { buildLinks } from '@/lib/links';
import { siteConfig, waLink, whatsappReady } from '@/lib/site-config';
import { useInquiry } from '@/features/inquiry/inquiry-provider';
import { clampQty } from '@/features/inquiry/storage';
import { useSetProductWa } from '@/components/product-wa';
import type { Crumb } from '@/components/layout/PageHeader';
import type { ProductCard } from '@/lib/product-cards';
import type { Locale } from '@/i18n/routing';
import type { Unit } from '@/lib/catalog';

export interface DetailProduct {
  id: string;
  name: string;
  code: string;
  desc: string;
  style: string;
  unit: Unit;
  catName: string;
  catHref: string;
  imgAlt: string;
  images: { full: string; width: number; height: number }[];
  pieces: { name: string; qty: number; dims: number[] | null }[];
  materials: string;
}

export function DetailView({ product, related, crumbs: rawCrumbs }: { product: DetailProduct; related: ProductCard[]; crumbs: Crumb[] }) {
  const crumbs = rawCrumbs.map((c, i) => ({ label: c.label, href: c.href ?? '', isLink: !!c.href, isCurrent: !c.href, notFirst: i > 0 }));
  const t = useT();
  const lang = useLocale() as Locale;
  const rtl = lang === 'ar';
  const pathname = usePathname();
  const links = buildLinks(lang);
  const { validItems, add } = useInquiry();
  const waReady = whatsappReady(siteConfig.whatsappNumber);
  const waNotReady = !waReady;

  const [gIdx, setGIdx] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [returnFocus, setReturnFocus] = useState<HTMLElement | null>(null);
  const [touchX, setTouchX] = useState<number | null>(null);
  // null = follow the quantity already on the Inquiry List (as the prototype did on route entry).
  const [qtyEdit, setQtyEdit] = useState<number | '' | null>(null);
  const lbCloseRef = useRef<HTMLButtonElement>(null);

  const inIt = validItems.find((i) => i.id === product.id);
  const detailQty: number | '' = qtyEdit ?? (inIt ? parseInt(String(inIt.qty), 10) || 1 : 1);
  const setDetailQty = (v: number | '' | ((q: number | '') => number | '')) => setQtyEdit((cur) => (typeof v === 'function' ? v(cur ?? detailQty) : v));

  const n = Math.max(1, product.images.length);
  const gi = Math.min(gIdx, n - 1);
  const go = (delta: number) => setGIdx((i) => (i + delta + n) % n);
  const cur = product.images[gi] ?? product.images[0];
  const labels = product.images.map((_, k) => (k === 0 ? product.name : t.ph.gallery + ' ' + (k + 1)));
  const pad = (k: number) => String(k).padStart(2, '0');

  const openLightbox = () => { setReturnFocus(document.activeElement as HTMLElement | null); setLightbox(true); };
  const closeLightbox = () => { setLightbox(false); setTimeout(() => returnFocus?.focus?.(), 0); };
  useEffect(() => {
    if (!lightbox) return;
    lbCloseRef.current?.focus();
    document.body.style.overflow = 'hidden';
    const onKey = (e: globalThis.KeyboardEvent) => { if (e.key === 'Escape') { setLightbox(false); setTimeout(() => returnFocus?.focus?.(), 0); } };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [lightbox, returnFocus]);

  const url = siteConfig.siteUrl + pathname;
  const waHref = waLink(siteConfig.whatsappNumber, fmt(t.wa.product, { name: product.name, code: product.code, url }));
  useSetProductWa(waHref);
  const counter = fmt(t.detail.imageOf, { i: gi + 1, n });

  const d = {
    name: product.name, code: product.code, desc: product.desc, style: product.style,
    imgFull: cur?.full ?? '', imgAlt: product.imgAlt, catName: product.catName, catHref: product.catHref,
    multi: n > 1, counter, enlargeLabel: t.detail.enlarge + ' — ' + counter,
    thumbs: labels.map((lb, k) => ({ num: pad(k + 1), label: fmt(t.detail.thumb, { i: k + 1 }) + ' — ' + lb, aria: k === gi ? ('true' as const) : undefined, border: k === gi ? '#584838' : 'transparent', onClick: () => setGIdx(k) })),
    prev: () => go(-1), next: () => go(1), openLightbox,
    touchStart: (e: TouchEvent) => setTouchX(e.touches[0].clientX),
    touchEnd: (e: TouchEvent) => {
      if (touchX == null) return;
      const dx = e.changedTouches[0].clientX - touchX;
      setTouchX(null);
      if (Math.abs(dx) > 40 && n > 1) go((dx < 0) !== rtl ? 1 : -1);
    },
    pieces: product.pieces.length
      ? product.pieces.map((p) => ({ name: p.name, qty: '× ' + p.qty, dims: p.dims ? p.dims.join(' × ') + ' ' + t.detail.cm : t.detail.onRequest, color: p.dims ? '#252525' : '#625C54' }))
      : [{ name: t.detail.piecesPending, qty: '—', dims: t.detail.onRequest, color: '#625C54' }],
    hasMaterials: !!product.materials, materials: product.materials,
    qtyLabel: t.detail.quantity + ' (' + t.detail.units[product.unit] + ')', qty: detailQty,
    onQty: (e: ChangeEvent<HTMLInputElement>) => setDetailQty(clampQty(e.target.value)),
    onQtyBlur: () => { if (!(parseInt(String(detailQty), 10) >= 1)) setDetailQty(1); },
    dec: () => setDetailQty((q) => Math.max(1, (parseInt(String(q), 10) || 1) - 1)),
    inc: () => setDetailQty((q) => Math.min(99999, (parseInt(String(q), 10) || 0) + 1)),
    onAdd: () => { const q = Math.max(1, parseInt(String(detailQty), 10) || 1); add(product.id, q); setQtyEdit(null); },
    addLabel: inIt ? t.detail.update : t.detail.add, inList: !!inIt,
    inListText: inIt ? fmt(t.detail.inList, { q: inIt.qty, u: t.detail.units[product.unit] }) : '',
    waHref, related, hasRelated: related.length > 0,
  };
  const lbKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && d.multi) {
      const fwd = (e.key === 'ArrowRight') !== rtl;
      if (fwd) d.next(); else d.prev();
    }
    if (e.key === 'Tab') {
      const els = e.currentTarget.querySelectorAll('button');
      if (!els.length) return;
      const first = els[0], last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  };
  return (
    <>
  <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "clamp(20px,3vw,32px) clamp(20px,4vw,40px) 0", boxSizing: "content-box" }}>
    <nav aria-label={t.crumbs.label}>
      <ol style={{ listStyle: "none", margin: "0", padding: "0", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px 10px", fontSize: "14px", color: "#625C54" }}>
        {crumbs.map((c, __i) => (<Fragment key={__i}>
          <li style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {(c.notFirst) && (<><span aria-hidden="true" style={{ color: "#A58B64" }}>/</span></>)}
            {(c.isLink) && (<><A href={c.href} style={{ color: "#625C54", textDecoration: "none" }} className="sh8">{c.label}</A></>)}
            {(c.isCurrent) && (<><span aria-current="page" style={{ color: "#252525" }}>{c.label}</span></>)}
          </li>
        </Fragment>))}
      </ol>
    </nav>
  </div>
  <section style={{ padding: "clamp(24px,3vw,40px) 0 clamp(48px,6vw,80px)" }}>
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 clamp(20px,4vw,40px)", boxSizing: "content-box", display: "flex", flexWrap: "wrap", gap: "clamp(32px,4vw,56px)", alignItems: "flex-start" }}>
      <div aria-label={t.detail.gallery} role="region" style={{ flex: "3 1 520px", minWidth: "0", display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ position: "relative" }}>
          <button type="button" onClick={d.openLightbox} onTouchStart={d.touchStart} onTouchEnd={d.touchEnd} aria-label={d.enlargeLabel} style={{ display: "block", width: "100%", padding: "0", border: "0", background: "transparent", cursor: "zoom-in", borderRadius: "10px", overflow: "hidden" }}>
            <div style={{ aspectRatio: "4/5", maxHeight: "80vh", width: "100%", background: "#E9E4DC" }}><Img priority sizes="(min-width: 1200px) 640px, (min-width: 640px) 60vw, 100vw" src={d.imgFull} alt={d.imgAlt} decoding="async" style={{ display: "block", width: "100%", height: "100%", objectFit: "contain" }} /></div>
          </button>
          {(d.multi) && (<>
            <div style={{ position: "absolute", bottom: "16px", insetInlineEnd: "16px", display: "flex", gap: "8px" }}>
              <button type="button" onClick={d.prev} aria-label={t.detail.prev} style={{ width: "44px", height: "44px", borderRadius: "6px", border: "1px solid #D8D2C9", background: "#FAF9F6", fontSize: "18px", cursor: "pointer" }}>{t.back}</button>
              <button type="button" onClick={d.next} aria-label={t.detail.next} style={{ width: "44px", height: "44px", borderRadius: "6px", border: "1px solid #D8D2C9", background: "#FAF9F6", fontSize: "18px", cursor: "pointer" }}>{t.arrow}</button>
            </div>
            <span aria-live="polite" style={{ position: "absolute", top: "16px", insetInlineEnd: "16px", padding: "4px 10px", borderRadius: "4px", background: "rgba(37,37,37,.8)", color: "#fff", fontSize: "12px", fontWeight: "600" }}>{d.counter}</span>
          </>)}
        </div>
        {(d.multi) && (<>
          <ul style={{ listStyle: "none", margin: "0", padding: "0", display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(72px,1fr))", gap: "8px" }}>
            {d.thumbs.map((th, __i) => (<Fragment key={__i}>
              <li><button type="button" onClick={th.onClick} aria-label={th.label} aria-current={th.aria} style={{ display: "block", width: "100%", aspectRatio: "1/1", padding: "0", borderRadius: "6px", border: `2px solid ${th.border}`, background: "repeating-linear-gradient(135deg,#E9E4DC 0 6px,#E3DDD3 6px 12px)", cursor: "pointer", font: "500 11px/1 ui-monospace,Menlo,monospace", color: "#625C54" }}>{th.num}</button></li>
            </Fragment>))}
          </ul>
        </>)}
      </div>

      <div style={{ flex: "2 1 340px", minWidth: "0", display: "flex", flexDirection: "column", gap: "24px" }}>
        <p style={{ margin: "0", padding: "10px 14px", borderRadius: "6px", background: "#E9E4DC", fontSize: "13px", color: "#4F4943" }}>{t.detail.sampleNotice}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <A href={d.catHref} style={{ alignSelf: "flex-start", fontSize: "14px", color: "#625C54", textDecoration: "none" }} className="sha">{d.catName}</A>
          <h1 style={{ margin: "0", fontSize: "clamp(28px,3vw,40px)", lineHeight: "1.2", fontWeight: "600", letterSpacing: "-.02em", textWrap: "balance" }}>{d.name}</h1>
          <p style={{ margin: "0", display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center", fontSize: "13px", color: "#625C54" }}><span>{t.card.ref}</span><span dir="ltr" data-keep-ls="" style={{ font: "600 13px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace", color: "#252525", letterSpacing: ".04em" }}>{d.code}</span><span aria-hidden="true">·</span><span>{d.style}</span></p>
        </div>
        <p style={{ margin: "0", fontSize: "16px", color: "#252525", textWrap: "pretty" }}>{d.desc}</p>

        <div style={{ padding: "24px", border: "1px solid #D8D2C9", borderRadius: "10px", background: "#fff", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label htmlFor="dqty" style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "8px" }}>{d.qtyLabel}</label>
            <div style={{ display: "flex", alignItems: "stretch", gap: "0", width: "max-content", border: "1px solid #D8D2C9", borderRadius: "8px", overflow: "hidden" }}>
              <button type="button" onClick={d.dec} aria-label={t.detail.dec} style={{ width: "48px", height: "48px", border: "0", background: "#FAF9F6", fontSize: "20px", cursor: "pointer" }}>−</button>
              <input id="dqty" type="number" inputMode="numeric" min={1} step={1} value={d.qty} onChange={d.onQty} onBlur={d.onQtyBlur} style={{ width: "72px", height: "48px", border: "0", borderInline: "1px solid #D8D2C9", textAlign: "center", fontSize: "16px", fontWeight: "600", background: "#fff", MozAppearance: "textfield" }} />
              <button type="button" onClick={d.inc} aria-label={t.detail.inc} style={{ width: "48px", height: "48px", border: "0", background: "#FAF9F6", fontSize: "20px", cursor: "pointer" }}>+</button>
            </div>
          </div>
          <button type="button" onClick={d.onAdd} style={{ height: "52px", borderRadius: "6px", border: "0", background: "#584838", color: "#fff", fontSize: "15px", fontWeight: "600", cursor: "pointer", transition: "background .2s" }} className="shb">{d.addLabel}</button>
          {(d.inList) && (<>
            <p style={{ margin: "0", display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "8px", fontSize: "14px", color: "#24634B" }}><span>{d.inListText}</span><A href={links.inquiry} style={{ fontWeight: "600" }}>{t.detail.viewList}</A></p>
          </>)}
          {(waReady) && (<>
            <A href={d.waHref} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "48px", borderRadius: "6px", border: "1px solid #584838", color: "#584838", fontSize: "15px", fontWeight: "600", textDecoration: "none" }} className="sh4">{t.detail.wa}</A>
          </>)}
          {(waNotReady) && (<>
            <WaPending style={{ height: "48px", borderRadius: "6px", border: "1px dashed #584838", background: "transparent", color: "#584838", fontSize: "15px", fontWeight: "600", cursor: "pointer" }}>{t.detail.wa} <span style={{ fontSize: "12px", fontWeight: "500", color: "#625C54" }}>· PENDING</span></WaPending>
          </>)}
          <p style={{ margin: "0", fontSize: "13px", color: "#625C54" }}>{t.detail.noPrice}</p>
        </div>
      </div>
    </div>
  </section>

  <section aria-labelledby="spec-title" style={{ padding: "0 0 clamp(56px,8vw,96px)" }}>
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 clamp(20px,4vw,40px)", boxSizing: "content-box", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,420px),1fr))", gap: "40px clamp(32px,5vw,72px)" }}>
      <div>
        <h2 id="spec-title" style={{ margin: "0 0 20px", fontSize: "clamp(22px,2.4vw,26px)", lineHeight: "1.3", fontWeight: "600" }}>{t.detail.pieces}</h2>
        <div role="table" aria-labelledby="spec-title" style={{ borderTop: "1px solid #252525" }}>
          <div role="row" style={{ display: "grid", gridTemplateColumns: "minmax(0,1.3fr) 56px minmax(0,1.5fr)", gap: "12px", padding: "12px 0", borderBottom: "1px solid #D8D2C9", fontSize: "13px", fontWeight: "600", color: "#625C54" }}>
            <span role="columnheader">{t.detail.piece}</span><span role="columnheader">{t.detail.qty}</span><span role="columnheader">{t.detail.dims}</span>
          </div>
          {d.pieces.map((pc, __i) => (<Fragment key={__i}>
            <div role="row" style={{ display: "grid", gridTemplateColumns: "minmax(0,1.3fr) 56px minmax(0,1.5fr)", gap: "12px", padding: "14px 0", borderBottom: "1px solid #D8D2C9", fontSize: "15px" }}>
              <span role="cell" style={{ fontWeight: "500" }}>{pc.name}</span>
              <span role="cell" dir="ltr" style={{ textAlign: "start" }}>{pc.qty}</span>
              <span role="cell" style={{ color: pc.color }}><bdi>{pc.dims}</bdi></span>
            </div>
          </Fragment>))}
        </div>
      </div>
      {(d.hasMaterials) && (<>
        <div>
          <h2 style={{ margin: "0 0 20px", fontSize: "clamp(22px,2.4vw,26px)", lineHeight: "1.3", fontWeight: "600" }}>{t.detail.materials}</h2>
          <p style={{ margin: "0", paddingTop: "14px", borderTop: "1px solid #252525", fontSize: "15px" }}>{d.materials}</p>
        </div>
      </>)}
    </div>
  </section>

  {(d.hasRelated) && (<>
    <section aria-labelledby="rel-title" style={{ padding: "clamp(56px,8vw,96px) 0", background: "#E9E4DC" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 clamp(20px,4vw,40px)", boxSizing: "content-box" }}>
        <h2 id="rel-title" style={{ margin: "0 0 32px", fontSize: "clamp(28px,3vw,36px)", lineHeight: "1.25", fontWeight: "600", letterSpacing: "-.015em" }}>{t.detail.related}</h2>
        <ul style={{ listStyle: "none", margin: "0", padding: "0", display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,max(220px,calc((100% - 48px) / 3))),1fr))", gap: "clamp(16px,2vw,24px)" }}>
          {d.related.map((k, __i) => (<Fragment key={__i}>
            <li>
              <A href={k.href} style={{ display: "flex", flexDirection: "column", gap: "14px", textDecoration: "none", color: "#252525" }}>
                <div style={{ position: "relative", borderRadius: "10px", overflow: "hidden", background: "#FAF9F6" }}><Img src={k.img} alt={k.alt} width={k.w} height={k.h} loading="lazy" decoding="async" style={{ display: "block", width: "100%", height: "auto", aspectRatio: "3/4", objectFit: "contain", transition: "transform .25s ease" }} className="sh6" /><span style={{ position: "absolute", bottom: "10px", insetInlineStart: "10px", padding: "3px 8px", borderRadius: "4px", background: "rgba(250,249,246,.94)", fontSize: "11px", fontWeight: "600", color: "#4F4943" }}>{t.illustrative}</span></div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <h3 style={{ margin: "0", fontSize: "clamp(18px,1.6vw,20px)", lineHeight: "1.4", fontWeight: "600" }}>{k.name}</h3>
                  <span dir="ltr" data-keep-ls="" style={{ alignSelf: "flex-start", font: "500 12px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace", color: "#4F4943", letterSpacing: ".04em" }}>{k.code}</span>
                  <span style={{ marginTop: "6px", display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: "600", color: "#584838" }}>{t.card.view} <span aria-hidden="true">{t.arrow}</span></span>
                </div>
              </A>
            </li>
          </Fragment>))}
        </ul>
      </div>
    </section>
  </>)}
{lightbox && (<>  <div data-testid="lightbox" role="dialog" aria-modal="true" aria-label={d.counter} onKeyDown={lbKeyDown} style={{ position: "fixed", inset: "0", zIndex: "80", background: "rgba(37,37,37,.94)", display: "flex", flexDirection: "column", padding: "16px clamp(16px,3vw,32px) calc(16px + env(safe-area-inset-bottom))" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", color: "#FAF9F6", minHeight: "48px" }}>
      <span style={{ fontSize: "14px" }}>{d.name} · {d.counter}</span>
      <button type="button" ref={lbCloseRef} onClick={closeLightbox} aria-label={t.detail.close} style={{ width: "48px", height: "48px", borderRadius: "6px", border: "1px solid #625C54", background: "transparent", color: "#FAF9F6", fontSize: "22px", cursor: "pointer" }}>×</button>
    </div>
    <div onTouchStart={d.touchStart} onTouchEnd={d.touchEnd} style={{ flex: "1", minHeight: "0", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px 0" }}>
      <Img src={d.imgFull} alt={d.imgAlt} style={{ display: "block", maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: "8px" }} />
    </div>
    {(d.multi) && (<>
      <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
        <button type="button" onClick={d.prev} aria-label={t.detail.prev} style={{ width: "52px", height: "52px", borderRadius: "6px", border: "1px solid #625C54", background: "transparent", color: "#FAF9F6", fontSize: "20px", cursor: "pointer" }}>{t.back}</button>
        <button type="button" onClick={d.next} aria-label={t.detail.next} style={{ width: "52px", height: "52px", borderRadius: "6px", border: "1px solid #625C54", background: "transparent", color: "#FAF9F6", fontSize: "20px", cursor: "pointer" }}>{t.arrow}</button>
      </div>
    </>)}
  </div></>)}
    </>
  );
}
