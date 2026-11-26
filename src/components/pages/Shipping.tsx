import { Fragment } from 'react';
import type { PageCtx } from '@/lib/page-ctx';

export function Shipping({ ctx }: { ctx: PageCtx }) {
  const { t, payItems, portItems } = ctx;
  return (
    <>
  <section id="ship-pay" tabIndex={-1} aria-labelledby="pay-title" style={{ padding: "clamp(48px,6vw,80px) 0", outline: "none" }}>
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 clamp(20px,4vw,40px)", boxSizing: "content-box" }}>
      <h2 id="pay-title" style={{ margin: "0 0 20px", fontSize: "clamp(28px,3vw,36px)", lineHeight: "1.25", fontWeight: "600", letterSpacing: "-.015em" }}>{t.ship.payTitle}</h2>
      {t.ship.payIntro ? <p style={{ margin: "0 0 clamp(28px,3vw,40px)", fontSize: "17px", color: "#625C54", maxWidth: "62ch" }}>{t.ship.payIntro}</p> : <div style={{ height: "clamp(8px,1vw,20px)" }} />}
      <ol style={{ listStyle: "none", margin: "0", padding: "0", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,280px),1fr))", gap: "clamp(16px,2vw,24px)" }}>
        {payItems.map((p, __i) => (<Fragment key={__i}>
          <li style={{ padding: "28px 24px", border: "1px solid #D8D2C9", borderRadius: "10px", background: "#fff", display: "flex", flexDirection: "column", gap: "12px" }}>
            <span dir="ltr" style={{ fontSize: "13px", fontWeight: "600", color: "#584838" }}>{p.num}</span>
            <h3 style={{ margin: "0", fontSize: "19px", lineHeight: "1.45", fontWeight: "600" }}>{p.title}</h3>
            {(p.hasTerm) && (<><span dir="ltr" lang="en" style={{ alignSelf: "flex-start", font: "500 12px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace", color: "#4F4943" }}>{p.term}</span></>)}
            {p.body ? <p style={{ margin: "0", fontSize: "15px", color: "#4F4943" }}>{p.body}</p> : null}
          </li>
        </Fragment>))}
      </ol>
      {t.ship.payNote ? <p style={{ margin: "24px 0 0", padding: "16px 20px", borderRadius: "8px", background: "#E9E4DC", fontSize: "15px", maxWidth: "80ch" }}>{t.ship.payNote}</p> : null}
    </div>
  </section>

  <section id="ship-inco" tabIndex={-1} aria-labelledby="inco-title" style={{ padding: "clamp(56px,8vw,96px) 0", background: "#E9E4DC", outline: "none" }}>
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 clamp(20px,4vw,40px)", boxSizing: "content-box" }}>
      <h2 id="inco-title" style={{ margin: "0 0 20px", fontSize: "clamp(28px,3vw,36px)", lineHeight: "1.25", fontWeight: "600", letterSpacing: "-.015em" }}>{t.ship.incoTitle}</h2>
      <p style={{ margin: "0 0 clamp(28px,3vw,40px)", fontSize: "17px", color: "#4F4943", maxWidth: "66ch" }}>{t.ship.incoIntro}</p>
      <ul style={{ listStyle: "none", margin: "0", padding: "0", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,260px),1fr))", gap: "clamp(16px,2vw,20px)" }}>
        {t.ship.incoterms.map((inc, __i) => (<Fragment key={__i}>
          <li style={{ padding: "24px", border: "1px solid #C9C1B5", borderRadius: "10px", background: "#FAF9F6", display: "flex", flexDirection: "column", gap: "18px", minWidth: "0" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-start" }}>
              <span dir="ltr" lang="en" data-keep-ls="" style={{ fontSize: "30px", fontWeight: "700", letterSpacing: ".04em", lineHeight: "1.1" }}>{inc.code}</span>
              <span style={{ fontSize: "15px", fontWeight: "600" }}>{inc.name}</span>
              <span style={{ padding: "3px 10px", borderRadius: "12px", border: "1px solid #C9C1B5", fontSize: "12px", color: "#4F4943" }}>{inc.mode}</span>
            </div>
            <dl style={{ margin: "0", display: "flex", flexDirection: "column", gap: "14px", fontSize: "14px", lineHeight: "1.6" }}>
              <div><dt style={{ fontSize: "12px", fontWeight: "600", letterSpacing: ".08em", textTransform: "uppercase", color: "#584838" }}>{t.ship.incoLabels.seller}</dt><dd style={{ margin: "2px 0 0" }}>{inc.seller}</dd></div>
              <div><dt style={{ fontSize: "12px", fontWeight: "600", letterSpacing: ".08em", textTransform: "uppercase", color: "#584838" }}>{t.ship.incoLabels.buyer}</dt><dd style={{ margin: "2px 0 0" }}>{inc.buyer}</dd></div>
              <div><dt style={{ fontSize: "12px", fontWeight: "600", letterSpacing: ".08em", textTransform: "uppercase", color: "#584838" }}>{t.ship.incoLabels.cost}</dt><dd style={{ margin: "2px 0 0" }}>{inc.cost}</dd></div>
              <div><dt style={{ fontSize: "12px", fontWeight: "600", letterSpacing: ".08em", textTransform: "uppercase", color: "#584838" }}>{t.ship.incoLabels.risk}</dt><dd style={{ margin: "2px 0 0" }}>{inc.risk}</dd></div>
              <div><dt style={{ fontSize: "12px", fontWeight: "600", letterSpacing: ".08em", textTransform: "uppercase", color: "#584838" }}>{t.ship.incoLabels.insurance}</dt><dd style={{ margin: "2px 0 0" }}>{inc.insurance}</dd></div>
            </dl>
          </li>
        </Fragment>))}
      </ul>
      <ul style={{ listStyle: "none", margin: "32px 0 0", padding: "0", display: "flex", flexDirection: "column", gap: "10px", maxWidth: "80ch" }}>
        {t.ship.incoNotes.map((x, __i) => (<Fragment key={__i}><li style={{ display: "flex", alignItems: "baseline", gap: "12px", fontSize: "15px", color: "#252525" }}><span aria-hidden="true" style={{ width: "6px", height: "6px", background: "#A58B64", flex: "none", transform: "translateY(-3px)" }}></span><span>{x}</span></li></Fragment>))}
      </ul>
    </div>
  </section>

  <section id="ship-ports" tabIndex={-1} aria-labelledby="ports-title" style={{ padding: "clamp(56px,8vw,96px) 0", outline: "none" }}>
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 clamp(20px,4vw,40px)", boxSizing: "content-box", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,380px),1fr))", gap: "32px clamp(32px,6vw,96px)", alignItems: "start" }}>
      <div>
        <h2 id="ports-title" style={{ margin: "0 0 20px", fontSize: "clamp(28px,3vw,36px)", lineHeight: "1.25", fontWeight: "600", letterSpacing: "-.015em" }}>{t.ship.portsTitle}</h2>
        <p style={{ margin: "0", fontSize: "17px", color: "#625C54", maxWidth: "52ch" }}>{t.ship.portsIntro}</p>
      </div>
      <div>
        <ul style={{ listStyle: "none", margin: "0", padding: "0", borderTop: "1px solid #252525" }}>
          {portItems.map((pt, __i) => (<Fragment key={__i}>
            <li style={{ display: "grid", gridTemplateColumns: "48px minmax(0,1fr)", gap: "12px", alignItems: "baseline", padding: "16px 0", borderBottom: "1px solid #D8D2C9" }}>
              <span dir="ltr" style={{ fontSize: "13px", fontWeight: "700", color: "#584838" }}>{pt.num}</span>
              <span style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "4px 16px" }}><span style={{ fontSize: "18px", fontWeight: "600" }}>{pt.name}</span><span dir="auto" style={{ fontSize: "14px", color: "#625C54" }}>{pt.alt}</span></span>
            </li>
          </Fragment>))}
        </ul>
        <p style={{ margin: "20px 0 0", fontSize: "14px", color: "#625C54" }}>{t.ship.portsNote}</p>
      </div>
    </div>
  </section>

  <section id="ship-cont" tabIndex={-1} aria-labelledby="cont-title" style={{ padding: "clamp(56px,8vw,96px) 0", background: "#E9E4DC", outline: "none" }}>
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 clamp(20px,4vw,40px)", boxSizing: "content-box" }}>
      <h2 id="cont-title" style={{ margin: "0 0 20px", fontSize: "clamp(28px,3vw,36px)", lineHeight: "1.25", fontWeight: "600", letterSpacing: "-.015em" }}>{t.ship.contTitle}</h2>
      <p style={{ margin: "0 0 clamp(28px,3vw,40px)", fontSize: "17px", color: "#4F4943", maxWidth: "66ch" }}>{t.ship.contIntro}</p>
      <ul style={{ listStyle: "none", margin: "0", padding: "0", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,260px),1fr))", gap: "clamp(16px,2vw,24px)" }}>
        {t.ship.containers.map((ct, __i) => (<Fragment key={__i}>
          <li style={{ padding: "28px 24px", border: "1px solid #C9C1B5", borderRadius: "10px", background: "#FAF9F6", display: "flex", flexDirection: "column", gap: "10px" }}>
            <h3 style={{ margin: "0", fontSize: "20px", lineHeight: "1.4", fontWeight: "600" }}>{ct.name}</h3>
            {(ct.alt) && (<><span dir="ltr" lang="en" style={{ alignSelf: "flex-start", font: "500 12px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace", color: "#4F4943" }}>{ct.alt}</span></>)}
            <span dir="ltr" style={{ alignSelf: "flex-start", marginTop: "8px", fontSize: "44px", fontWeight: "600", letterSpacing: "-.02em", lineHeight: "1" }}>{ct.range}</span>
            <span style={{ fontSize: "13px", color: "#4F4943" }}>{t.ship.contUnit}</span>
            <p style={{ margin: "6px 0 0", paddingTop: "14px", borderTop: "1px solid #D8D2C9", fontSize: "15px", color: "#4F4943" }}>{ct.body}</p>
          </li>
        </Fragment>))}
      </ul>
      <div style={{ marginTop: "24px", padding: "24px", borderRadius: "10px", background: "#FAF9F6", display: "flex", flexDirection: "column", gap: "10px", maxWidth: "900px" }}>
        <h3 style={{ margin: "0", fontSize: "17px", fontWeight: "600" }}>{t.ship.contNoteTitle}</h3>
        {t.ship.contNote.map((para, __i) => (<Fragment key={__i}><p style={{ margin: "0", fontSize: "15px", color: "#4F4943" }}>{para}</p></Fragment>))}
      </div>
    </div>
  </section>

  <section id="ship-cbm" tabIndex={-1} aria-labelledby="cbm-title" style={{ padding: "clamp(56px,8vw,96px) 0", outline: "none" }}>
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 clamp(20px,4vw,40px)", boxSizing: "content-box", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,400px),1fr))", gap: "40px clamp(32px,5vw,72px)", alignItems: "start" }}>
      <div>
        <h2 id="cbm-title" style={{ margin: "0 0 20px", fontSize: "clamp(28px,3vw,36px)", lineHeight: "1.25", fontWeight: "600", letterSpacing: "-.015em" }}>{t.ship.cbmTitle}</h2>
        <p style={{ margin: "0 0 24px", fontSize: "17px", color: "#625C54", maxWidth: "56ch" }}>{t.ship.cbmIntro}</p>
        <p dir="auto" style={{ margin: "0", padding: "20px 24px", borderRadius: "10px", background: "#252525", color: "#FAF9F6", font: "600 clamp(15px,1.6vw,18px)/1.6 ui-monospace,SFMono-Regular,Menlo,monospace" }}>{t.ship.cbmFormula}</p>
        <p style={{ margin: "16px 0 0", fontSize: "14px", color: "#625C54" }}><strong style={{ color: "#252525", fontWeight: "600" }}>{t.ship.cbmExampleLabel}:</strong> <bdi>{t.ship.cbmExample}</bdi></p>
      </div>
      <div>
        <h3 style={{ margin: "0 0 12px", fontSize: "17px", fontWeight: "600" }}>{t.ship.cbmFactorsTitle}</h3>
        <ul style={{ listStyle: "none", margin: "0", padding: "0", borderTop: "1px solid #252525" }}>
          {t.ship.cbmFactors.map((x, __i) => (<Fragment key={__i}><li style={{ display: "flex", alignItems: "baseline", gap: "12px", padding: "12px 0", borderBottom: "1px solid #D8D2C9", fontSize: "15px" }}><span aria-hidden="true" style={{ width: "6px", height: "6px", background: "#A58B64", flex: "none", transform: "translateY(-3px)" }}></span><span>{x}</span></li></Fragment>))}
        </ul>
        <p style={{ margin: "20px 0 0", fontSize: "14px", color: "#625C54" }}>{t.ship.cbmNote}</p>
      </div>
    </div>
  </section>

  <section id="ship-transit" tabIndex={-1} aria-labelledby="transit-title" style={{ padding: "clamp(56px,8vw,96px) 0", borderTop: "1px solid #D8D2C9", outline: "none" }}>
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 clamp(20px,4vw,40px)", boxSizing: "content-box", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,400px),1fr))", gap: "40px clamp(32px,5vw,72px)", alignItems: "start" }}>
      <div>
        <h2 id="transit-title" style={{ margin: "0 0 20px", fontSize: "clamp(28px,3vw,36px)", lineHeight: "1.25", fontWeight: "600", letterSpacing: "-.015em" }}>{t.ship.transitTitle}</h2>
        <p style={{ margin: "0", fontSize: "17px", maxWidth: "56ch" }}>{t.ship.transitBody}</p>
      </div>
      <div>
        <ul style={{ listStyle: "none", margin: "0", padding: "0", display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {t.ship.transitFactors.map((x, __i) => (<Fragment key={__i}><li style={{ padding: "8px 14px", border: "1px solid #D8D2C9", borderRadius: "20px", fontSize: "14px" }}>{x}</li></Fragment>))}
        </ul>
        <p style={{ margin: "20px 0 0", padding: "16px 20px", borderRadius: "8px", background: "#E9E4DC", fontSize: "15px" }}>{t.ship.transitNote}</p>
      </div>
    </div>
  </section>
    </>
  );
}
