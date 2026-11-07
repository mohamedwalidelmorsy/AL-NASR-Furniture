import { Fragment } from 'react';
import type { PageCtx } from '@/lib/page-ctx';

export function Custom({ ctx }: { ctx: PageCtx }) {
  const { t, sendItems } = ctx;
  return (
    <>
  <section aria-labelledby="cm-title" style={{ padding: "clamp(48px,6vw,80px) 0" }}>
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 clamp(20px,4vw,40px)", boxSizing: "content-box", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,400px),1fr))", gap: "40px clamp(32px,5vw,72px)", alignItems: "start" }}>
      <div>
        <h2 id="cm-title" style={{ margin: "0 0 20px", fontSize: "clamp(28px,3vw,36px)", lineHeight: "1.25", fontWeight: "600", letterSpacing: "-.015em" }}>{t.custom.customTitle}</h2>
        <p style={{ margin: "0", fontSize: "17px", maxWidth: "56ch", textWrap: "pretty" }}>{t.custom.customBody}</p>
      </div>
      <div style={{ padding: "clamp(24px,3vw,32px)", border: "1px solid #D8D2C9", borderRadius: "10px", background: "#fff" }}>
        <h3 style={{ margin: "0 0 12px", fontSize: "20px", fontWeight: "600" }}>{t.custom.sendTitle}</h3>
        <ol style={{ listStyle: "none", margin: "0", padding: "0", borderTop: "1px solid #D8D2C9" }}>
          {sendItems.map((si, __i) => (<Fragment key={__i}>
            <li style={{ display: "grid", gridTemplateColumns: "40px minmax(0,1fr)", gap: "8px", alignItems: "baseline", padding: "12px 0", borderBottom: "1px solid #D8D2C9", fontSize: "15px" }}><span dir="ltr" style={{ fontSize: "13px", fontWeight: "700", color: "#584838" }}>{si.num}</span><span>{si.label}</span></li>
          </Fragment>))}
        </ol>
        <p style={{ margin: "16px 0 0", fontSize: "14px", color: "#625C54" }}>{t.custom.sendNote}</p>
      </div>
    </div>
  </section>
  <section aria-labelledby="pj-title" style={{ padding: "clamp(56px,8vw,96px) 0", background: "#E9E4DC" }}>
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 clamp(20px,4vw,40px)", boxSizing: "content-box" }}>
      <h2 id="pj-title" style={{ margin: "0 0 20px", fontSize: "clamp(28px,3vw,36px)", lineHeight: "1.25", fontWeight: "600", letterSpacing: "-.015em" }}>{t.custom.projTitle}</h2>
      <p style={{ margin: "0 0 clamp(32px,4vw,48px)", fontSize: "17px", color: "#4F4943", maxWidth: "62ch" }}>{t.custom.projBody}</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,320px),1fr))", gap: "32px clamp(24px,4vw,56px)" }}>
        <div>
          <h3 style={{ margin: "0 0 12px", fontSize: "17px", fontWeight: "600" }}>{t.custom.projTypesTitle}</h3>
          <ul style={{ listStyle: "none", margin: "0", padding: "0", borderTop: "1px solid #252525" }}>
            {t.custom.projTypes.map((x, __i) => (<Fragment key={__i}><li style={{ padding: "14px 0", borderBottom: "1px solid #C9C1B5", fontSize: "17px", fontWeight: "500" }}>{x}</li></Fragment>))}
          </ul>
        </div>
        <div>
          <h3 style={{ margin: "0 0 12px", fontSize: "17px", fontWeight: "600" }}>{t.custom.projCatsTitle}</h3>
          <ul style={{ listStyle: "none", margin: "0", padding: "0", display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {t.custom.projCats.map((x, __i) => (<Fragment key={__i}><li style={{ padding: "8px 14px", border: "1px solid #C9C1B5", borderRadius: "20px", background: "#FAF9F6", fontSize: "14px" }}>{x}</li></Fragment>))}
          </ul>
        </div>
      </div>
      <div style={{ marginTop: "clamp(32px,4vw,48px)", padding: "24px", borderRadius: "10px", background: "#FAF9F6", display: "flex", flexDirection: "column", gap: "8px", maxWidth: "900px" }}>
        <h3 style={{ margin: "0", fontSize: "17px", fontWeight: "600" }}>{t.custom.assessTitle}</h3>
        <p style={{ margin: "0", fontSize: "15px" }}>{t.custom.assessBody}</p>
        <p style={{ margin: "0", fontSize: "14px", color: "#625C54" }}>{t.custom.focusNote}</p>
      </div>
    </div>
  </section>
    </>
  );
}
