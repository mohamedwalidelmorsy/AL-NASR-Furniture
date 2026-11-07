import { A } from '@/components/ui/A';

import type { PageCtaData } from '@/lib/page-ctx';

export function PageCta({ pc }: { pc: PageCtaData }) {
  const pcHasBody = !!pc.body;
  return (
    <>
  <section style={{ background: "#584838", color: "#FAF9F6" }}>
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "clamp(48px,7vw,80px) clamp(20px,4vw,40px)", boxSizing: "content-box", display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: "24px 32px" }}>
      <div style={{ maxWidth: "640px", display: "flex", flexDirection: "column", gap: "14px" }}>
        <h2 style={{ margin: "0", fontSize: "clamp(26px,3vw,34px)", lineHeight: "1.25", fontWeight: "600" }}>{pc.title}</h2>
        {(pcHasBody) && (<><p style={{ margin: "0", fontSize: "17px", color: "#E9E4DC" }}>{pc.body}</p></>)}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
        <A href={pc.href1} style={{ display: "inline-flex", alignItems: "center", minHeight: "48px", padding: "0 24px", borderRadius: "6px", background: "#FAF9F6", color: "#584838", fontSize: "15px", fontWeight: "600", textDecoration: "none" }} className="sh4">{pc.label1}</A>
        <A href={pc.href2} target={pc.target2} rel={pc.rel2} style={{ display: "inline-flex", alignItems: "center", minHeight: "48px", padding: "0 24px", borderRadius: "6px", border: "1px solid #E9E4DC", color: "#FAF9F6", fontSize: "15px", fontWeight: "600", textDecoration: "none" }} className="sh7">{pc.label2}</A>
      </div>
    </div>
  </section>
    </>
  );
}
