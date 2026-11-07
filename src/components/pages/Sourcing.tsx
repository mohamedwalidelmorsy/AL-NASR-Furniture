import { Fragment } from 'react';
import { A } from '@/components/ui/A';
import type { PageCtx } from '@/lib/page-ctx';

export function Sourcing({ ctx }: { ctx: PageCtx }) {
  const { t, exportSteps, guideCards } = ctx;
  return (
    <>
  <section style={{ padding: "clamp(48px,6vw,80px) 0" }}>
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 clamp(20px,4vw,40px)", boxSizing: "content-box", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,380px),1fr))", gap: "24px clamp(32px,6vw,96px)" }}>
      <h2 style={{ margin: "0", fontSize: "clamp(28px,3vw,36px)", lineHeight: "1.25", fontWeight: "600", letterSpacing: "-.015em" }}>{t.sourcing.coordTitle}</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {t.sourcing.coordBody.map((para, __i) => (<Fragment key={__i}><p style={{ margin: "0", fontSize: "17px", maxWidth: "60ch", textWrap: "pretty" }}>{para}</p></Fragment>))}
      </div>
    </div>
  </section>
  <section aria-labelledby="steps-title" style={{ padding: "clamp(56px,8vw,96px) 0", background: "#E9E4DC" }}>
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 clamp(20px,4vw,40px)", boxSizing: "content-box" }}>
      <h2 id="steps-title" style={{ margin: "0 0 clamp(32px,4vw,48px)", fontSize: "clamp(28px,3vw,36px)", lineHeight: "1.25", fontWeight: "600", letterSpacing: "-.015em" }}>{t.sourcing.processTitle}</h2>
      <ol style={{ listStyle: "none", margin: "0", padding: "0", borderTop: "1px solid #252525" }}>
        {exportSteps.map((s, __i) => (<Fragment key={__i}>
          <li style={{ display: "grid", gridTemplateColumns: "clamp(40px,6vw,72px) minmax(0,1fr)", gap: "12px", padding: "22px 0", borderBottom: "1px solid #C9C1B5" }}>
            <span dir="ltr" style={{ fontSize: "15px", fontWeight: "700", color: "#584838", lineHeight: "1.6" }}>{s.num}</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px clamp(24px,4vw,56px)" }}>
              <div style={{ flex: "1 1 240px", minWidth: "0" }}>
                <h3 style={{ margin: "0", fontSize: "19px", lineHeight: "1.45", fontWeight: "600" }}>{s.title}</h3>
                {(s.hasTerm) && (<><span dir="ltr" lang="en" style={{ display: "inline-block", marginTop: "2px", font: "500 12px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace", color: "#4F4943" }}>{s.term}</span></>)}
              </div>
              <p style={{ flex: "2 1 340px", minWidth: "0", margin: "0", fontSize: "15px", color: "#4F4943", maxWidth: "64ch" }}>{s.body}</p>
            </div>
          </li>
        </Fragment>))}
      </ol>
    </div>
  </section>
  <section aria-labelledby="qc-title" style={{ padding: "clamp(56px,8vw,96px) 0" }}>
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 clamp(20px,4vw,40px)", boxSizing: "content-box", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,420px),1fr))", gap: "40px clamp(32px,5vw,72px)", alignItems: "start" }}>
      <div>
        <h2 id="qc-title" style={{ margin: "0 0 20px", fontSize: "clamp(28px,3vw,36px)", lineHeight: "1.25", fontWeight: "600", letterSpacing: "-.015em" }}>{t.sourcing.qcTitle}</h2>
        <p style={{ margin: "0 0 20px", fontSize: "17px", maxWidth: "60ch" }}>{t.sourcing.qcBody}</p>
        <ul style={{ listStyle: "none", margin: "0 0 24px", padding: "0", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,220px),1fr))", columnGap: "24px", borderTop: "1px solid #D8D2C9" }}>
          {t.sourcing.qcChecks.map((x, __i) => (<Fragment key={__i}>
            <li style={{ display: "flex", alignItems: "baseline", gap: "12px", padding: "12px 0", borderBottom: "1px solid #D8D2C9", fontSize: "15px" }}><span aria-hidden="true" style={{ width: "6px", height: "6px", background: "#A58B64", flex: "none", transform: "translateY(-3px)" }}></span><span>{x}</span></li>
          </Fragment>))}
        </ul>
        <p style={{ margin: "0", fontSize: "15px", color: "#625C54", maxWidth: "60ch" }}>{t.sourcing.qcMedia}</p>
      </div>
      <div style={{ padding: "clamp(24px,3vw,32px)", border: "1px solid #D8D2C9", borderRadius: "10px", background: "#fff", display: "flex", flexDirection: "column", gap: "16px" }}>
        <h3 style={{ margin: "0", fontSize: "22px", lineHeight: "1.35", fontWeight: "600" }}>{t.sourcing.tpiTitle}</h3>
        <p style={{ margin: "0", fontSize: "15px" }}>{t.sourcing.tpiBody}</p>
        <div>
          <p style={{ margin: "0 0 10px", fontSize: "13px", fontWeight: "600", color: "#584838" }}>{t.sourcing.tpiExamplesLabel}</p>
          <ul style={{ listStyle: "none", margin: "0", padding: "0", display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {t.sourcing.tpiExamples.map((x, __i) => (<Fragment key={__i}><li dir="ltr" lang="en" style={{ padding: "6px 14px", border: "1px solid #D8D2C9", borderRadius: "20px", fontSize: "14px", fontWeight: "600" }}>{x}</li></Fragment>))}
          </ul>
          <p style={{ margin: "10px 0 0", fontSize: "13px", color: "#625C54" }}>{t.sourcing.tpiDisclaimer}</p>
        </div>
        <p style={{ margin: "0", paddingTop: "16px", borderTop: "1px solid #D8D2C9", fontSize: "15px", color: "#4F4943" }}>{t.sourcing.tpiScope}</p>
        <p style={{ margin: "0", fontSize: "15px", color: "#4F4943" }}>{t.sourcing.tpiArrange}</p>
      </div>
    </div>
  </section>
  <section aria-labelledby="guides-title" style={{ padding: "0 0 clamp(56px,8vw,96px)" }}>
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 clamp(20px,4vw,40px)", boxSizing: "content-box" }}>
      <h2 id="guides-title" style={{ margin: "0 0 24px", fontSize: "clamp(22px,2.4vw,26px)", lineHeight: "1.3", fontWeight: "600" }}>{t.sourcing.guidesTitle}</h2>
      <ul style={{ listStyle: "none", margin: "0", padding: "0", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,340px),1fr))", gap: "clamp(16px,2vw,24px)" }}>
        {guideCards.map((g, __i) => (<Fragment key={__i}>
          <li><A href={g.href} style={{ height: "100%", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", padding: "28px 24px", borderRadius: "10px", background: "#E9E4DC", color: "#252525", textDecoration: "none", transition: "background .2s" }} className="she"><span style={{ display: "flex", flexDirection: "column", gap: "6px" }}><span style={{ fontSize: "20px", fontWeight: "600", lineHeight: "1.4" }}>{g.title}</span><span style={{ fontSize: "15px", color: "#4F4943" }}>{g.body}</span></span><span aria-hidden="true" style={{ color: "#584838", fontSize: "18px" }}>{t.arrow}</span></A></li>
        </Fragment>))}
      </ul>
    </div>
  </section>
  <section style={{ padding: "clamp(56px,8vw,96px) 0", borderTop: "1px solid #D8D2C9" }}>
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 clamp(20px,4vw,40px)", boxSizing: "content-box" }}>
      <h2 style={{ margin: "0 0 32px", fontSize: "clamp(28px,3vw,36px)", lineHeight: "1.25", fontWeight: "600", letterSpacing: "-.015em" }}>{t.sourcing.faqTitle}</h2>
      <div style={{ borderTop: "1px solid #252525" }}>
        {t.sourcing.faq.map((f, __i) => (<Fragment key={__i}>
          <details style={{ borderBottom: "1px solid #D8D2C9" }}>
            <summary style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", minHeight: "64px", padding: "12px 0", fontSize: "18px", fontWeight: "600" }}><span>{f.q}</span><span aria-hidden="true" style={{ color: "#584838", fontSize: "22px", fontWeight: "400" }}>+</span></summary>
            <p style={{ margin: "0 0 24px", fontSize: "16px", color: "#625C54", maxWidth: "64ch" }}>{f.a}</p>
          </details>
        </Fragment>))}
      </div>
    </div>
  </section>
    </>
  );
}
