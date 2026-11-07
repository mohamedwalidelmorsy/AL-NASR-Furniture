'use client';

import { Fragment } from 'react';
const SECTION_IDS = ['ship-pay', 'ship-inco', 'ship-ports', 'ship-cont', 'ship-cbm', 'ship-transit'];

/** In-page table of contents for the Shipping & Payment guide (smooth scroll honours reduced motion). */
export function ShipToc({ labels, tocLabel }: { labels: string[]; tocLabel: string }) {
  const t = { ship: { tocLabel } };
  const tocItems = labels.map((label, i) => ({ label, onClick: () => {
    const el = document.getElementById(SECTION_IDS[i]);
    if (!el) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 88, behavior: reduce ? 'auto' : 'smooth' });
    el.focus({ preventScroll: true });
  } }));
  return (
    <>
  <nav aria-label={t.ship.tocLabel} style={{ padding: "24px 0", borderBottom: "1px solid #D8D2C9" }}>
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 clamp(20px,4vw,40px)", boxSizing: "content-box", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px 16px" }}>
      <span style={{ fontSize: "13px", fontWeight: "600", color: "#625C54" }}>{t.ship.tocLabel}</span>
      <ul style={{ listStyle: "none", margin: "0", padding: "0", display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {tocItems.map((ti, __i) => (<Fragment key={__i}>
          <li><button type="button" onClick={ti.onClick} style={{ height: "40px", padding: "0 16px", borderRadius: "20px", border: "1px solid #D8D2C9", background: "transparent", color: "#252525", fontSize: "14px", fontWeight: "600", cursor: "pointer" }} className="shf">{ti.label}</button></li>
        </Fragment>))}
      </ul>
    </div>
  </nav>
    </>
  );
}
