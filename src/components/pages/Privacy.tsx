import type { PageCtx } from '@/lib/page-ctx';

export function Privacy({ ctx }: { ctx: PageCtx }) {
  const { t } = ctx;
  return (
    <>
  <section style={{ padding: "clamp(40px,5vw,64px) 0 clamp(56px,8vw,96px)" }}>
    <div style={{ maxWidth: "720px", margin: "0 auto", padding: "0 clamp(20px,4vw,40px)", boxSizing: "content-box", display: "flex", flexDirection: "column", gap: "16px" }}>
      <p style={{ margin: "0", fontSize: "17px" }}>{t.privacy.body}</p>
      <p dir="auto" style={{ margin: "0", padding: "12px 16px", border: "1px dashed #D8D2C9", borderRadius: "6px", fontSize: "14px", color: "#625C54" }}>{t.privacy.status}</p>
    </div>
  </section>
    </>
  );
}
