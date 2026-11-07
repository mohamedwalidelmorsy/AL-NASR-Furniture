'use client';

import { Fragment } from 'react';
import { A } from '@/components/ui/A';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useT } from '@/lib/use-t';
import { useInquiry } from '@/features/inquiry/inquiry-provider';
import { buildLinks, NAV_DEFS, pageKeyFromPath, switchLocalePath } from '@/lib/links';
import { otherLocale, type Locale } from '@/i18n/routing';

export function Header() {
  const t = useT();
  const lang = useLocale() as Locale;
  const pathname = usePathname();
  const page = pageKeyFromPath(pathname);
  const links = buildLinks(lang);
  const otherLang = otherLocale(lang);
  const langHref = switchLocalePath(pathname, otherLang);
  const langAria = lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية';
  const { validItems } = useInquiry();
  const inqCount = validItems.length;
  const hasInq = inqCount > 0;
  const inqAria = t.nav.inquiry + (inqCount ? ' (' + inqCount + ')' : '');
  const inqAriaCurrent = page === 'inquiry' ? 'page' : undefined;
  const footerGuides = [{ href: links.shipping, label: t.nav.shipping }, { href: links.custom, label: t.nav.custom }];
  const navItems = NAV_DEFS.map((d) => {
    const cur = d.active.includes(page);
    return { href: d.path ? `/${lang}/${d.path}` : links.home, label: t.nav[d.label], aria: cur ? ('page' as const) : undefined, color: cur ? '#252525' : '#625C54', bc: cur ? '#A58B64' : 'transparent' };
  });

  // The menu is "open" only for the page it was opened on, so navigating closes it without an effect.
  const [menu, setMenuState] = useState<{ open: boolean; path: string }>({ open: false, path: pathname });
  const menuOpen = menu.open && menu.path === pathname;
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const setMenu = (open: boolean) => setMenuState({ open, path: pathname });
  const toggleMenu = () => setMenu(!menuOpen);
  const showMenu = menuOpen;
  const menuExpanded = menuOpen ? 'true' : 'false';
  const menuLabel = menuOpen ? t.nav.close : t.nav.menu;

  // Lock page scroll while the menu is open; Escape and growing into the full-nav layout close it.
  useEffect(() => {
    if (!menuOpen) return;
    document.body.style.overflow = 'hidden';
    const close = () => setMenuState({ open: false, path: pathname });
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { close(); menuBtnRef.current?.focus(); } };
    const mq = window.matchMedia('(min-width: 1140px)');
    const onMq = () => { if (mq.matches) close(); };
    window.addEventListener('keydown', onKey);
    mq.addEventListener('change', onMq);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); mq.removeEventListener('change', onMq); };
  }, [menuOpen, pathname]);
  return (
    <>
<header style={{ position: "sticky", top: "0", zIndex: "50", background: "#FAF9F6", borderBottom: "1px solid #D8D2C9" }}>
  <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 clamp(20px,4vw,40px)", boxSizing: "content-box", height: "var(--header-h)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "24px" }}>
    <A href={links.home} aria-label="AL NASR FURNITURE" dir="ltr" style={{ display: "flex", flexDirection: "column", gap: "5px", textDecoration: "none", color: "#252525", lineHeight: "1", fontFamily: "var(--font-manrope),sans-serif", flex: "none" }}>
      <span data-keep-ls="" style={{ fontSize: "19px", fontWeight: "700", letterSpacing: ".22em" }}>AL NASR</span>
      <span data-keep-ls="" style={{ fontSize: "9.5px", fontWeight: "600", letterSpacing: ".56em", color: "#584838" }}>FURNITURE</span>
    </A>
    <div className="ctn-full">
      <nav aria-label={t.nav.primary}>
        <ul style={{ listStyle: "none", margin: "0", padding: "0", display: "flex", alignItems: "center", gap: "26px" }}>
          {navItems.map((n, __i) => (<Fragment key={__i}>
            <li><A href={n.href} aria-current={n.aria} style={{ display: "inline-flex", alignItems: "center", height: "44px", fontSize: "15px", fontWeight: "500", color: n.color, textDecoration: "none", borderBottom: `1.5px solid ${n.bc}` }} className="sh1">{n.label}</A></li>
          </Fragment>))}
        </ul>
      </nav>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: "6px", flex: "none" }}>
      <div className="ctn-notmobile">
        <A href={langHref} hrefLang={otherLang} lang={otherLang} aria-label={langAria} data-testid="lang-switch" style={{ display: "inline-flex", alignItems: "center", height: "44px", padding: "0 10px", fontSize: "14px", fontWeight: "600", color: "#584838", textDecoration: "none", borderRadius: "6px" }} className="sh2">{t.switchTo}</A>
      </div>
      <A href={links.inquiry} aria-label={inqAria} aria-current={inqAriaCurrent} style={{ display: "inline-flex", alignItems: "center", gap: "8px", height: "44px", padding: "0 10px", borderRadius: "6px", fontSize: "14px", fontWeight: "600", color: "#252525", textDecoration: "none" }} className="sh2">
        <span>{t.nav.inquiryShort}</span>
        {(hasInq) && (<><span aria-hidden="true" style={{ minWidth: "22px", height: "22px", padding: "0 6px", borderRadius: "11px", background: "#584838", color: "#fff", fontSize: "12px", fontWeight: "700", display: "inline-flex", alignItems: "center", justifyContent: "center", lineHeight: "1" }}>{inqCount}</span></>)}
      </A>
      <div className="ctn-notmobile">
        <A href={links.contact} style={{ display: "inline-flex", alignItems: "center", height: "44px", padding: "0 18px", borderRadius: "6px", background: "#584838", color: "#fff", fontSize: "15px", fontWeight: "600", textDecoration: "none", transition: "background .2s" }} className="sh3">{t.nav.rfq}</A>
      </div>
      <div className="ctn-compact">
        <button type="button" ref={menuBtnRef} onClick={toggleMenu} aria-expanded={menuExpanded} aria-controls="mobile-menu" aria-label={menuLabel} style={{ width: "44px", height: "44px", display: "inline-flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "5px", background: "transparent", border: "1px solid #D8D2C9", borderRadius: "6px", cursor: "pointer", marginInlineStart: "4px" }}>
          <span style={{ width: "18px", height: "1.5px", background: "#252525" }}></span>
          <span style={{ width: "18px", height: "1.5px", background: "#252525" }}></span>
          <span style={{ width: "18px", height: "1.5px", background: "#252525" }}></span>
        </button>
      </div>
    </div>
  </div>
  {(showMenu) && (<>
    <div id="mobile-menu" className="mobile-menu" style={{ position: "fixed", top: "var(--header-h)", left: "0", right: "0", bottom: "0", background: "#FAF9F6", overflow: "auto", zIndex: "49", borderTop: "1px solid #D8D2C9" }}>
      <nav aria-label={t.nav.primary} style={{ padding: "16px clamp(20px,4vw,40px) 40px", display: "flex", flexDirection: "column", gap: "24px" }}>
        <ul style={{ listStyle: "none", margin: "0", padding: "0", display: "flex", flexDirection: "column" }}>
          {navItems.map((n, __i) => (<Fragment key={__i}>
            <li style={{ borderBottom: "1px solid #D8D2C9" }}><A href={n.href} aria-current={n.aria} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: "60px", fontSize: "22px", fontWeight: "600", color: n.color, textDecoration: "none" }}><span>{n.label}</span><span aria-hidden="true" style={{ color: "#A58B64" }}>{t.arrow}</span></A></li>
          </Fragment>))}
        </ul>
        <ul style={{ listStyle: "none", margin: "-8px 0 0", padding: "0", display: "flex", flexDirection: "column" }}>
          {footerGuides.map((g, __i) => (<Fragment key={__i}>
            <li><A href={g.href} style={{ display: "flex", alignItems: "center", minHeight: "48px", fontSize: "16px", fontWeight: "500", color: "#625C54", textDecoration: "none" }}>{g.label}</A></li>
          </Fragment>))}
        </ul>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <A href={links.contact} style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "52px", borderRadius: "6px", background: "#584838", color: "#fff", fontSize: "15px", fontWeight: "600", textDecoration: "none" }}>{t.nav.rfq}</A>
          <A href={links.inquiry} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", height: "52px", borderRadius: "6px", border: "1px solid #584838", color: "#584838", fontSize: "15px", fontWeight: "600", textDecoration: "none" }}>{t.nav.inquiry} {(hasInq) && (<><span>({inqCount})</span></>)}</A>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", paddingTop: "8px", borderTop: "1px solid #D8D2C9" }}>
          <span style={{ fontSize: "14px", color: "#625C54" }}>{t.nav.lang}</span>
          <A href={langHref} hrefLang={otherLang} lang={otherLang} aria-label={langAria} data-testid="lang-switch" style={{ display: "inline-flex", alignItems: "center", height: "44px", padding: "0 16px", border: "1px solid #D8D2C9", borderRadius: "6px", fontWeight: "600", color: "#584838", textDecoration: "none" }}>{t.switchTo}</A>
        </div>
      </nav>
    </div>
  </>)}
</header>
    </>
  );
}
