import { Fragment } from 'react';
import { A } from '@/components/ui/A';
import type { Messages } from '@/lib/messages';

export interface Crumb { label: string; href?: string }
export interface PageHead { eyebrow?: string; title: string; intro?: string }

export function PageHeader({ t, crumbs, pageHead }: { t: Messages; crumbs: Crumb[]; pageHead: PageHead }) {
  const hasEyebrow = !!pageHead.eyebrow;
  const hasIntro = !!pageHead.intro;
  const items = crumbs.map((c, i) => ({ label: c.label, href: c.href ?? '', isLink: !!c.href, isCurrent: !c.href, notFirst: i > 0 }));
  return (
    <>
  <div style={{ borderBottom: "1px solid #D8D2C9" }}>
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "clamp(24px,3vw,32px) clamp(20px,4vw,40px) clamp(40px,5vw,64px)", boxSizing: "content-box" }}>
      <nav aria-label={t.crumbs.label}>
        <ol style={{ listStyle: "none", margin: "0 0 clamp(24px,4vw,48px)", padding: "0", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px 10px", fontSize: "14px", color: "#625C54" }}>
          {items.map((c, __i) => (<Fragment key={__i}>
            <li style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {(c.notFirst) && (<><span aria-hidden="true" style={{ color: "#A58B64" }}>/</span></>)}
              {(c.isLink) && (<><A href={c.href} style={{ color: "#625C54", textDecoration: "none" }} className="sh8">{c.label}</A></>)}
              {(c.isCurrent) && (<><span aria-current="page" style={{ color: "#252525" }}>{c.label}</span></>)}
            </li>
          </Fragment>))}
        </ol>
      </nav>
      {(hasEyebrow) && (<><p style={{ margin: "0 0 16px", display: "flex", alignItems: "center", gap: "12px", fontSize: "13px", fontWeight: "600", letterSpacing: ".14em", textTransform: "uppercase", color: "#584838" }}><span aria-hidden="true" style={{ width: "28px", height: "1px", background: "#A58B64", flex: "none" }}></span>{pageHead.eyebrow}</p></>)}
      <h1 style={{ margin: "0", fontSize: "clamp(32px,4vw,48px)", lineHeight: "1.2", fontWeight: "600", letterSpacing: "-.02em", maxWidth: "22ch", textWrap: "balance" }}>{pageHead.title}</h1>
      {(hasIntro) && (<><p style={{ margin: "20px 0 0", fontSize: "17px", color: "#625C54", maxWidth: "62ch", textWrap: "pretty" }}>{pageHead.intro}</p></>)}
    </div>
  </div>
    </>
  );
}
