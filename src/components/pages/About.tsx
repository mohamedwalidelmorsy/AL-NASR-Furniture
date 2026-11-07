import { Fragment } from 'react';
import { A } from '@/components/ui/A';
import type { PageCtx } from '@/lib/page-ctx';

export function About({ ctx }: { ctx: PageCtx }) {
  const { t, allCats, mqItems } = ctx;
  return (
    <>
  <section style={{ padding: "clamp(48px,6vw,80px) 0" }}>
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 clamp(20px,4vw,40px)", boxSizing: "content-box", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,400px),1fr))", gap: "clamp(32px,5vw,72px)", alignItems: "start" }}>
      <div role="img" aria-label={t.ph.about} style={{ aspectRatio: "4/3", borderRadius: "10px", background: "repeating-linear-gradient(135deg,#E9E4DC 0 12px,#E3DDD3 12px 24px)", display: "flex", alignItems: "flex-end" }}><span style={{ margin: "16px", padding: "6px 10px", background: "rgba(250,249,246,.92)", borderRadius: "4px", font: "500 12px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace", color: "#625C54" }}>{t.ph.about}</span></div>
      <div>
        <h2 style={{ margin: "0 0 20px", fontSize: "clamp(28px,3vw,36px)", lineHeight: "1.25", fontWeight: "600", letterSpacing: "-.015em" }}>{t.about.whoTitle}</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {t.about.whoBody.map((para, __i) => (<Fragment key={__i}><p style={{ margin: "0", fontSize: "17px", maxWidth: "60ch", textWrap: "pretty" }}>{para}</p></Fragment>))}
        </div>
      </div>
    </div>
  </section>
  <section aria-labelledby="ab-prod" style={{ padding: "0 0 clamp(56px,8vw,96px)" }}>
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 clamp(20px,4vw,40px)", boxSizing: "content-box" }}>
      <h2 id="ab-prod" style={{ margin: "0 0 24px", fontSize: "clamp(28px,3vw,36px)", lineHeight: "1.25", fontWeight: "600", letterSpacing: "-.015em" }}>{t.about.productsTitle}</h2>
      <ul style={{ listStyle: "none", margin: "0", padding: "0", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,400px),1fr))", columnGap: "clamp(32px,5vw,72px)", borderTop: "1px solid #252525" }}>
        {allCats.map((c, __i) => (<Fragment key={__i}>
          <li style={{ borderBottom: "1px solid #D8D2C9" }}><A href={c.href} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", padding: "18px 0", textDecoration: "none", color: "#252525" }} className="shd"><span style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: "0" }}><span style={{ fontSize: "18px", fontWeight: "600" }}>{c.name}</span><span style={{ fontSize: "15px", color: "#625C54" }}>{c.desc}</span></span><span aria-hidden="true" style={{ color: "#A58B64", paddingTop: "2px" }}>{t.arrow}</span></A></li>
        </Fragment>))}
      </ul>
    </div>
  </section>
  <section style={{ padding: "clamp(56px,8vw,96px) 0", background: "#E9E4DC" }}>
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 clamp(20px,4vw,40px)", boxSizing: "content-box" }}>
      <h2 style={{ margin: "0 0 clamp(32px,4vw,48px)", fontSize: "clamp(28px,3vw,36px)", lineHeight: "1.25", fontWeight: "600", letterSpacing: "-.015em" }}>{t.about.mqTitle}</h2>
      <ul style={{ listStyle: "none", margin: "0", padding: "0", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,260px),1fr))", gap: "clamp(24px,3vw,40px)" }}>
        {mqItems.map((w, __i) => (<Fragment key={__i}>
          <li style={{ paddingTop: "24px", borderTop: "1px solid #C9C1B5", display: "flex", flexDirection: "column", gap: "12px" }}>
            <span dir="ltr" style={{ fontSize: "13px", fontWeight: "600", color: "#584838" }}>{w.num}</span>
            <h3 style={{ margin: "0", fontSize: "22px", lineHeight: "1.35", fontWeight: "600" }}>{w.title}</h3>
            <p style={{ margin: "0", fontSize: "15px", color: "#4F4943" }}>{w.body}</p>
          </li>
        </Fragment>))}
      </ul>
    </div>
  </section>
  <section style={{ padding: "clamp(56px,8vw,96px) 0" }}>
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 clamp(20px,4vw,40px)", boxSizing: "content-box", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,400px),1fr))", gap: "48px clamp(32px,5vw,72px)" }}>
      <div>
        <h2 style={{ margin: "0 0 20px", fontSize: "clamp(28px,3vw,36px)", lineHeight: "1.25", fontWeight: "600", letterSpacing: "-.015em" }}>{t.about.visionTitle}</h2>
        <p style={{ margin: "0", paddingTop: "20px", borderTop: "1px solid #252525", fontSize: "clamp(19px,1.8vw,22px)", lineHeight: "1.6", fontWeight: "500", maxWidth: "40ch", textWrap: "pretty" }}>{t.about.visionBody}</p>
      </div>
      <div>
        <h2 style={{ margin: "0 0 20px", fontSize: "clamp(28px,3vw,36px)", lineHeight: "1.25", fontWeight: "600", letterSpacing: "-.015em" }}>{t.about.partnersTitle}</h2>
        <p style={{ margin: "0", paddingTop: "20px", borderTop: "1px solid #252525", fontSize: "17px", maxWidth: "56ch" }}>{t.about.partnersBody}</p>
      </div>
    </div>
  </section>
    </>
  );
}
