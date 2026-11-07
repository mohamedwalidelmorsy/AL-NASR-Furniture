import { A } from '@/components/ui/A';
import type { PageCtx } from '@/lib/page-ctx';

export function NotFoundView({ ctx }: { ctx: PageCtx }) {
  const { t, links } = ctx;
  return (
    <>
  <section style={{ padding: "clamp(40px,5vw,64px) 0 clamp(56px,8vw,96px)" }}>
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 clamp(20px,4vw,40px)", boxSizing: "content-box", display: "flex", flexWrap: "wrap", gap: "12px" }}>
      <A href={links.home} style={{ display: "inline-flex", alignItems: "center", height: "48px", padding: "0 24px", borderRadius: "6px", background: "#584838", color: "#fff", fontSize: "15px", fontWeight: "600", textDecoration: "none" }} className="sh3">{t.notFound.home}</A>
      <A href={links.collections} style={{ display: "inline-flex", alignItems: "center", height: "48px", padding: "0 24px", borderRadius: "6px", border: "1px solid #584838", color: "#584838", fontSize: "15px", fontWeight: "600", textDecoration: "none" }}>{t.notFound.browse}</A>
    </div>
  </section>
    </>
  );
}
