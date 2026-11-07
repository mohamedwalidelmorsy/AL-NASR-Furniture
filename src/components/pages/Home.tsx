import { Fragment } from 'react';
import { A } from '@/components/ui/A';
import { Img } from '@/components/ui/Img';
import { WaPending } from '@/components/wa-pending';
import type { PageCtx } from '@/lib/page-ctx';

export function Home({ ctx }: { ctx: PageCtx }) {
  const { t, links, featuredCats, heroImg, processSteps, whyItems, waGeneral, waReady, waNotReady } = ctx;
  return (
    <>
  <section aria-labelledby="hero-title" style={{ borderBottom: "1px solid #D8D2C9" }}>
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "clamp(40px,7vw,88px) clamp(20px,4vw,40px)", boxSizing: "content-box", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,400px),1fr))", gap: "clamp(32px,5vw,72px)", alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        <p style={{ margin: "0 0 24px", display: "flex", alignItems: "center", gap: "12px", fontSize: "13px", fontWeight: "600", letterSpacing: ".14em", textTransform: "uppercase", color: "#584838" }}><span aria-hidden="true" style={{ width: "28px", height: "1px", background: "#A58B64", flex: "none" }}></span>{t.hero.eyebrow}</p>
        <h1 id="hero-title" style={{ margin: "0", fontSize: "clamp(36px,4.6vw,56px)", lineHeight: "1.12", fontWeight: "600", letterSpacing: "-.025em", textWrap: "balance", maxWidth: "16ch" }}>{t.hero.title}</h1>
        <p style={{ margin: "28px 0 0", fontSize: "17px", color: "#625C54", maxWidth: "52ch", textWrap: "pretty" }}>{t.hero.body}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "36px" }}>
          <A href={links.collections} style={{ display: "inline-flex", alignItems: "center", gap: "10px", height: "48px", padding: "0 24px", borderRadius: "6px", background: "#584838", color: "#fff", fontSize: "15px", fontWeight: "600", textDecoration: "none", transition: "background .2s" }} className="sh3">{t.hero.cta1} <span aria-hidden="true">{t.arrow}</span></A>
          <A href={links.contact} style={{ display: "inline-flex", alignItems: "center", height: "48px", padding: "0 24px", borderRadius: "6px", border: "1px solid #584838", color: "#584838", fontSize: "15px", fontWeight: "600", textDecoration: "none", transition: "background .2s" }} className="sh4">{t.hero.cta2}</A>
        </div>
        <p style={{ margin: "32px 0 0", paddingTop: "20px", borderTop: "1px solid #D8D2C9", fontSize: "14px", color: "#625C54", maxWidth: "52ch" }}>{t.hero.note}</p>
      </div>
      <div style={{ aspectRatio: "4/5", maxHeight: "640px", width: "100%", borderRadius: "10px", overflow: "hidden", background: "#E9E4DC" }}><Img priority sizes="(min-width: 1200px) 560px, (min-width: 640px) 50vw, 100vw" src={heroImg.src} alt={heroImg.alt} decoding="async" style={{ display: "block", width: "100%", height: "100%", objectFit: "contain" }} /></div>
    </div>
  </section>

  <section aria-labelledby="feat-title" style={{ padding: "clamp(56px,8vw,96px) 0" }}>
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 clamp(20px,4vw,40px)", boxSizing: "content-box" }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: "16px 32px", marginBottom: "clamp(24px,3vw,40px)" }}>
        <div>
          <p style={{ margin: "0 0 16px", display: "flex", alignItems: "center", gap: "12px", fontSize: "13px", fontWeight: "600", letterSpacing: ".14em", textTransform: "uppercase", color: "#584838" }}><span aria-hidden="true" style={{ width: "28px", height: "1px", background: "#A58B64", flex: "none" }}></span>{t.featured.eyebrow}</p>
          <h2 id="feat-title" style={{ margin: "0", fontSize: "clamp(28px,3vw,36px)", lineHeight: "1.25", fontWeight: "600", letterSpacing: "-.015em" }}>{t.featured.title}</h2>
        </div>
        <A href={links.collections} style={{ display: "inline-flex", alignItems: "center", gap: "8px", minHeight: "44px", fontSize: "15px", fontWeight: "600", color: "#584838", textDecoration: "none" }} className="sh5">{t.featured.viewAll} <span aria-hidden="true">{t.arrow}</span></A>
      </div>
      <ul style={{ listStyle: "none", margin: "0", padding: "0", display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,max(240px,calc((100% - 48px) / 3))),1fr))", gap: "clamp(16px,2vw,24px)" }}>
        {featuredCats.map((c, __i) => (<Fragment key={__i}>
          <li>
            <A href={c.href} style={{ display: "flex", flexDirection: "column", gap: "16px", textDecoration: "none", color: "#252525" }}>
              <div style={{ borderRadius: "10px", overflow: "hidden" }}>
                <Img src={c.img} alt={c.alt} loading="lazy" decoding="async" style={{ display: "block", width: "100%", height: "auto", aspectRatio: "4/3", objectFit: "cover", objectPosition: "center 38%", transition: "transform .25s ease" }} className="sh6" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <h3 style={{ margin: "0", fontSize: "20px", lineHeight: "1.4", fontWeight: "600" }}>{c.name}</h3>
                <p style={{ margin: "0", fontSize: "14px", color: "#625C54" }}>{c.desc}</p>
                <span style={{ marginTop: "6px", display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: "600", color: "#584838" }}>{t.featured.cta} <span aria-hidden="true">{t.arrow}</span></span>
              </div>
            </A>
          </li>
        </Fragment>))}
      </ul>
    </div>
  </section>

  <section aria-labelledby="intro-title" style={{ padding: "clamp(56px,8vw,96px) 0", borderTop: "1px solid #D8D2C9" }}>
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 clamp(20px,4vw,40px)", boxSizing: "content-box", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,380px),1fr))", gap: "24px clamp(32px,6vw,96px)" }}>
      <div>
        <p style={{ margin: "0 0 16px", display: "flex", alignItems: "center", gap: "12px", fontSize: "13px", fontWeight: "600", letterSpacing: ".14em", textTransform: "uppercase", color: "#584838" }}><span aria-hidden="true" style={{ width: "28px", height: "1px", background: "#A58B64", flex: "none" }}></span>{t.intro.eyebrow}</p>
        <h2 id="intro-title" style={{ margin: "0", fontSize: "clamp(28px,3vw,36px)", lineHeight: "1.25", fontWeight: "600", letterSpacing: "-.015em", textWrap: "balance" }}>{t.intro.title}</h2>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "24px", paddingTop: "4px" }}>
        <p style={{ margin: "0", fontSize: "17px", color: "#252525", maxWidth: "60ch", textWrap: "pretty" }}>{t.intro.body}</p>
        <A href={links.about} style={{ display: "inline-flex", alignItems: "center", gap: "8px", minHeight: "44px", fontSize: "15px", fontWeight: "600", color: "#584838", textDecoration: "none" }} className="sh5">{t.intro.link} <span aria-hidden="true">{t.arrow}</span></A>
      </div>
    </div>
  </section>

  <section aria-labelledby="why-title" style={{ padding: "clamp(56px,8vw,96px) 0", background: "#E9E4DC" }}>
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 clamp(20px,4vw,40px)", boxSizing: "content-box" }}>
      <p style={{ margin: "0 0 16px", display: "flex", alignItems: "center", gap: "12px", fontSize: "13px", fontWeight: "600", letterSpacing: ".14em", textTransform: "uppercase", color: "#584838" }}><span aria-hidden="true" style={{ width: "28px", height: "1px", background: "#A58B64", flex: "none" }}></span>{t.why.eyebrow}</p>
      <h2 id="why-title" style={{ margin: "0 0 clamp(32px,4vw,56px)", fontSize: "clamp(28px,3vw,36px)", lineHeight: "1.25", fontWeight: "600", letterSpacing: "-.015em", maxWidth: "22ch", textWrap: "balance" }}>{t.why.title}</h2>
      <ul style={{ listStyle: "none", margin: "0", padding: "0", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,260px),1fr))", gap: "clamp(24px,3vw,40px)" }}>
        {whyItems.map((w, __i) => (<Fragment key={__i}>
          <li style={{ paddingTop: "24px", borderTop: "1px solid #C9C1B5", display: "flex", flexDirection: "column", gap: "12px" }}>
            <span dir="ltr" style={{ fontSize: "13px", fontWeight: "600", color: "#584838" }}>{w.num}</span>
            <h3 style={{ margin: "0", fontSize: "clamp(20px,2vw,22px)", lineHeight: "1.35", fontWeight: "600" }}>{w.title}</h3>
            <p style={{ margin: "0", fontSize: "15px", color: "#4F4943", textWrap: "pretty" }}>{w.body}</p>
            <A href={w.href} style={{ marginTop: "auto", display: "inline-flex", alignItems: "center", gap: "8px", minHeight: "44px", fontWeight: "600", color: "#584838", textDecoration: "none", fontSize: "14px" }} className="sh5">{w.link} <span aria-hidden="true">{t.arrow}</span></A>
          </li>
        </Fragment>))}
      </ul>
    </div>
  </section>

  <section aria-labelledby="proc-title" style={{ padding: "clamp(56px,8vw,96px) 0" }}>
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 clamp(20px,4vw,40px)", boxSizing: "content-box" }}>
      <p style={{ margin: "0 0 16px", display: "flex", alignItems: "center", gap: "12px", fontSize: "13px", fontWeight: "600", letterSpacing: ".14em", textTransform: "uppercase", color: "#584838" }}><span aria-hidden="true" style={{ width: "28px", height: "1px", background: "#A58B64", flex: "none" }}></span>{t.process.eyebrow}</p>
      <h2 id="proc-title" style={{ margin: "0 0 clamp(32px,4vw,56px)", fontSize: "clamp(28px,3vw,36px)", lineHeight: "1.25", fontWeight: "600", letterSpacing: "-.015em" }}>{t.process.title}</h2>
      <ol style={{ listStyle: "none", margin: "0", padding: "0", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,220px),1fr))", gap: "32px 24px" }}>
        {processSteps.map((p, __i) => (<Fragment key={__i}>
          <li style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div aria-hidden="true" style={{ display: "flex", alignItems: "center", gap: "12px" }}><span dir="ltr" style={{ fontSize: "13px", fontWeight: "700", color: "#584838" }}>{p.num}</span><span style={{ flex: "1", height: "1px", background: "#D8D2C9" }}></span></div>
            <h3 style={{ margin: "0", fontSize: "20px", lineHeight: "1.4", fontWeight: "600" }}>{p.title}</h3>
            <p style={{ margin: "0", fontSize: "15px", color: "#625C54" }}>{p.body}</p>
          </li>
        </Fragment>))}
      </ol>
      <div style={{ marginTop: "48px", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "12px 32px" }}>
        <p style={{ margin: "0", fontSize: "14px", color: "#625C54", maxWidth: "68ch" }}>{t.process.note}</p>
        <A href={links.sourcing} style={{ display: "inline-flex", alignItems: "center", gap: "8px", minHeight: "44px", fontSize: "15px", fontWeight: "600", color: "#584838", textDecoration: "none" }} className="sh5">{t.process.link} <span aria-hidden="true">{t.arrow}</span></A>
      </div>
    </div>
  </section>

  <section aria-labelledby="proj-title" style={{ padding: "clamp(56px,8vw,96px) 0", borderTop: "1px solid #D8D2C9" }}>
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 clamp(20px,4vw,40px)", boxSizing: "content-box", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,380px),1fr))", gap: "24px clamp(32px,6vw,96px)" }}>
      <div>
        <p style={{ margin: "0 0 16px", display: "flex", alignItems: "center", gap: "12px", fontSize: "13px", fontWeight: "600", letterSpacing: ".14em", textTransform: "uppercase", color: "#584838" }}><span aria-hidden="true" style={{ width: "28px", height: "1px", background: "#A58B64", flex: "none" }}></span>{t.projects.eyebrow}</p>
        <h2 id="proj-title" style={{ margin: "0", fontSize: "clamp(28px,3vw,36px)", lineHeight: "1.25", fontWeight: "600", letterSpacing: "-.015em", textWrap: "balance" }}>{t.projects.title}</h2>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "24px", paddingTop: "4px" }}>
        <p style={{ margin: "0", fontSize: "17px", maxWidth: "60ch", textWrap: "pretty" }}>{t.projects.body}</p>
        <A href={links.custom} style={{ display: "inline-flex", alignItems: "center", gap: "8px", minHeight: "44px", fontSize: "15px", fontWeight: "600", color: "#584838", textDecoration: "none" }} className="sh5">{t.projects.link} <span aria-hidden="true">{t.arrow}</span></A>
      </div>
    </div>
  </section>

  <section aria-labelledby="cta-title" style={{ background: "#584838", color: "#FAF9F6" }}>
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "clamp(56px,8vw,96px) clamp(20px,4vw,40px)", boxSizing: "content-box", display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: "32px" }}>
      <div style={{ maxWidth: "600px" }}>
        <h2 id="cta-title" style={{ margin: "0 0 16px", fontSize: "clamp(28px,3vw,36px)", lineHeight: "1.25", fontWeight: "600", letterSpacing: "-.015em" }}>{t.cta.title}</h2>
        <p style={{ margin: "0", fontSize: "17px", color: "#E9E4DC" }}>{t.cta.body}</p>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
        <A href={links.contact} style={{ display: "inline-flex", alignItems: "center", height: "48px", padding: "0 24px", borderRadius: "6px", background: "#FAF9F6", color: "#584838", fontSize: "15px", fontWeight: "600", textDecoration: "none" }} className="sh4">{t.cta.rfq}</A>
        {(waReady) && (<>
          <A href={waGeneral} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", height: "48px", padding: "0 24px", borderRadius: "6px", border: "1px solid #E9E4DC", color: "#FAF9F6", fontSize: "15px", fontWeight: "600", textDecoration: "none" }} className="sh7">{t.cta.wa}</A>
        </>)}
        {(waNotReady) && (<>
          <WaPending style={{ display: "inline-flex", alignItems: "center", gap: "8px", height: "48px", padding: "0 24px", borderRadius: "6px", border: "1px dashed #E9E4DC", background: "transparent", color: "#FAF9F6", fontSize: "15px", fontWeight: "600", cursor: "pointer" }}>{t.cta.wa} <span style={{ fontSize: "12px", fontWeight: "500", color: "#E9E4DC" }}>· PENDING</span></WaPending>
        </>)}
      </div>
    </div>
  </section>
    </>
  );
}
