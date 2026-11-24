import { A } from '@/components/ui/A';
import { fmt } from '@/lib/messages';
import type { PageCtx } from '@/lib/page-ctx';

/** Shown at the URL of a retired (archived) product: the URL never 404s and nothing is silently redirected to a different design. */
export function ArchivedProductView({ ctx, code, catName, catHref }: { ctx: PageCtx; code: string; catName: string; catHref: string }) {
  const { t, links } = ctx;
  return (
    <section data-testid="archived-product" style={{ padding: "clamp(40px,5vw,64px) 0 clamp(56px,8vw,96px)" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 clamp(20px,4vw,40px)", boxSizing: "content-box", display: "flex", flexDirection: "column", gap: "20px", alignItems: "flex-start" }}>
        <h1 style={{ margin: "0", fontSize: "clamp(28px,3vw,40px)", lineHeight: "1.2", fontWeight: "600", maxWidth: "24ch", textWrap: "balance" }}>{t.archived.title}</h1>
        <p style={{ margin: "0", maxWidth: "60ch", fontSize: "17px", color: "#625C54" }}>{t.archived.body}</p>
        <p dir="ltr" data-keep-ls="" style={{ margin: "0", font: "500 13px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace", color: "#625C54" }}>{fmt(t.archived.note, { code })}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
          <A href={catHref} style={{ display: "inline-flex", alignItems: "center", height: "48px", padding: "0 24px", borderRadius: "6px", background: "#584838", color: "#fff", fontSize: "15px", fontWeight: "600", textDecoration: "none" }} className="sh3">{fmt(t.archived.browse, { cat: catName })}</A>
          <A href={links.contact} style={{ display: "inline-flex", alignItems: "center", height: "48px", padding: "0 24px", borderRadius: "6px", border: "1px solid #584838", color: "#584838", fontSize: "15px", fontWeight: "600", textDecoration: "none" }} className="sh4">{t.archived.rfq}</A>
        </div>
      </div>
    </section>
  );
}
