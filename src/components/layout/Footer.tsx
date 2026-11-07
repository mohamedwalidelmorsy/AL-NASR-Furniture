import { Fragment } from 'react';
import { A } from '@/components/ui/A';
import type { PageCtx } from '@/lib/page-ctx';
import { LangSwitch } from '@/components/lang-switch';

export function Footer({ ctx }: { ctx: PageCtx }) {
  const { t, links, navItems, footerGuides, email, emailHref, emailReady, emailNotReady, waGeneral, waNum, waReady, waNotReady, year } = ctx;
  return (
    <>
<footer style={{ background: "#252525", color: "#E9E4DC" }}>
  <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "clamp(48px,6vw,80px) clamp(20px,4vw,40px) 32px", boxSizing: "content-box" }}>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,200px),1fr))", gap: "40px 32px", paddingBottom: "48px", borderBottom: "1px solid #4A4540" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px", gridColumn: "span 1" }}>
        <div dir="ltr" style={{ display: "flex", flexDirection: "column", gap: "6px", lineHeight: "1", fontFamily: "var(--font-manrope),sans-serif", alignSelf: "flex-start" }}>
          <span data-keep-ls="" style={{ fontSize: "22px", fontWeight: "700", letterSpacing: ".22em", color: "#FAF9F6" }}>AL NASR</span>
          <span data-keep-ls="" style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: ".56em", color: "#A58B64" }}>FURNITURE</span>
        </div>
        <p lang="ar" dir="rtl" style={{ margin: "0", fontFamily: "var(--font-plex-ar),sans-serif", fontSize: "16px", color: "#FAF9F6", alignSelf: "flex-start" }}>النصر للأثاث</p>
        <p style={{ margin: "0", fontSize: "14px", color: "#CFC8BD", maxWidth: "36ch" }}>{t.footer.tagline}</p>
      </div>
      <nav aria-label={t.footer.explore}>
        <h2 style={{ margin: "0 0 16px", fontSize: "13px", fontWeight: "600", letterSpacing: ".14em", textTransform: "uppercase", color: "#A58B64" }}>{t.footer.explore}</h2>
        <ul style={{ listStyle: "none", margin: "0", padding: "0", display: "flex", flexDirection: "column", gap: "4px" }}>
          {navItems.map((n, __i) => (<Fragment key={__i}><li><A href={n.href} style={{ display: "inline-flex", minHeight: "36px", alignItems: "center", color: "#E9E4DC", textDecoration: "none", fontSize: "15px" }} className="shg">{n.label}</A></li></Fragment>))}
          <li><A href={links.inquiry} style={{ display: "inline-flex", minHeight: "36px", alignItems: "center", color: "#E9E4DC", textDecoration: "none", fontSize: "15px" }} className="shg">{t.nav.inquiry}</A></li>
        </ul>
      </nav>
      <nav aria-label={t.footer.guides}>
        <h2 style={{ margin: "0 0 16px", fontSize: "13px", fontWeight: "600", letterSpacing: ".14em", textTransform: "uppercase", color: "#A58B64" }}>{t.footer.guides}</h2>
        <ul style={{ listStyle: "none", margin: "0", padding: "0", display: "flex", flexDirection: "column", gap: "4px" }}>
          {footerGuides.map((g, __i) => (<Fragment key={__i}><li><A href={g.href} style={{ display: "inline-flex", minHeight: "36px", alignItems: "center", color: "#E9E4DC", textDecoration: "none", fontSize: "15px" }} className="shg">{g.label}</A></li></Fragment>))}
        </ul>
      </nav>
      <div>
        <h2 style={{ margin: "0 0 16px", fontSize: "13px", fontWeight: "600", letterSpacing: ".14em", textTransform: "uppercase", color: "#A58B64" }}>{t.footer.contact}</h2>
        <dl style={{ margin: "0", display: "flex", flexDirection: "column", gap: "14px", fontSize: "15px" }}>
          <div><dt style={{ color: "#CFC8BD", fontSize: "13px" }}>{t.footer.whatsapp}</dt><dd style={{ margin: "2px 0 0" }}>{(waReady) && (<><A href={waGeneral} target="_blank" rel="noopener noreferrer" dir="ltr" style={{ color: "#FAF9F6" }}>+{waNum}</A></>)}{(waNotReady) && (<><span style={{ color: "#CFC8BD" }}>{t.footer.pending}</span></>)}</dd></div>
          <div><dt style={{ color: "#CFC8BD", fontSize: "13px" }}>{t.footer.email}</dt><dd style={{ margin: "2px 0 0" }}>{(emailReady) && (<><A href={emailHref} dir="ltr" style={{ color: "#FAF9F6" }}>{email}</A></>)}{(emailNotReady) && (<><span style={{ color: "#CFC8BD" }}>{t.footer.pending}</span></>)}</dd></div>
        </dl>
      </div>
      <div>
        <h2 style={{ margin: "0 0 16px", fontSize: "13px", fontWeight: "600", letterSpacing: ".14em", textTransform: "uppercase", color: "#A58B64" }}>{t.footer.company}</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px", color: "#CFC8BD" }}>
          <A href={links.privacy} style={{ color: "#E9E4DC", fontSize: "15px" }} className="shh">{t.footer.privacy}</A>
          <p style={{ margin: "0" }}>{t.footer.legal}</p>
          <LangSwitch label={t.switchTo} style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", height: "40px", padding: "0 14px", border: "1px solid #4A4540", borderRadius: "6px", color: "#FAF9F6", textDecoration: "none", fontWeight: "600" }} className="shi" />
        </div>
      </div>
    </div>
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "12px", paddingTop: "24px", fontSize: "13px", color: "#CFC8BD" }}>
      <span>© {year} {t.footer.rights}</span>
      <span>{t.footer.wordmark}</span>
    </div>
  </div>
</footer>
    </>
  );
}
