import 'server-only';
import type { Locale } from '@/i18n/routing';
import { dirOf, otherLocale } from '@/i18n/routing';
import { allMessages, type Messages } from '@/lib/messages';
import { buildLinks, href, type Links } from '@/lib/links';
import { phoneContacts, siteConfig, waLink, whatsappReady } from '@/lib/site-config';
import { categories, galleryFor, loc, productsInCategory, productById, type Category } from '@/lib/catalog';
import { HERO_IMAGE } from '@/lib/hero';
import { countMessage } from '@/lib/plural';

export interface CatCard { href: string; name: string; desc: string; img: string; alt: string; count: string }

export interface PageCtx {
  lang: Locale;
  otherLang: Locale;
  rtl: boolean;
  t: Messages;
  links: Links;
  allCats: CatCard[];
  featuredCats: CatCard[];
  heroImg: { src: string; width: number; height: number; alt: string };
  whyItems: (Messages['why']['items'][number] & { num: string; href: string })[];
  processSteps: (Messages['process']['steps'][number] & { num: string })[];
  mqItems: (Messages['about']['mq'][number] & { num: string })[];
  exportSteps: { num: string; title: string; body: string; term: string; hasTerm: boolean }[];
  guideCards: { title: string; body: string; href: string }[];
  payItems: { num: string; title: string; body: string; term: string; hasTerm: boolean }[];
  portItems: { num: string; name: string; alt: string }[];
  sendItems: { num: string; label: string }[];
  footerGuides: { href: string; label: string }[];
  navItems: { href: string; label: string }[];
  waReady: boolean;
  waNotReady: boolean;
  waNum: string;
  waGeneral: string;
  email: string;
  emailReady: boolean;
  emailNotReady: boolean;
  emailHref: string;
  /** Official phone / WhatsApp numbers with call and WhatsApp links (primary first). */
  phones: { num: string; text: string; tel: string; wa: string }[];
  exportEmail: string;
  exportEmailReady: boolean;
  exportEmailHref: string;
  website: string;
  year: number;
}

const pad = (n: number) => String(n).padStart(2, '0');

function catCard(c: Category, lang: Locale, t: Messages): CatCard {
  const list = productsInCategory(c.id);
  const n = list.length;
  const first = (c.coverProductId ? productById(c.coverProductId) : undefined) ?? list[0];
  const im = first ? galleryFor(first, lang)[0] : undefined;
  return {
    href: href(lang, `collections/${c.slug}`),
    name: loc(c.name, lang),
    desc: loc(c.desc, lang),
    img: im?.card ?? '',
    alt: `${loc(c.name, lang)} — ${t.illustrativeAlt}`,
    count: countMessage(lang, n, { one: t.collections.count1, two: t.collections.count2, few: t.collections.count, many: t.collections.countMany }),
  };
}

export function getPageCtx(lang: Locale): PageCtx {
  const t = allMessages[lang];
  const links = buildLinks(lang);
  const H = (p: string) => href(lang, p);
  const cards = categories.map((c) => catCard(c, lang, t));

  const waNum = siteConfig.whatsappNumber ?? '';
  const waReady = whatsappReady(siteConfig.whatsappNumber);
  const email = siteConfig.email ?? '';

  return {
    lang, otherLang: otherLocale(lang), rtl: dirOf(lang) === 'rtl', t, links,
    allCats: cards, featuredCats: cards,
    heroImg: { src: HERO_IMAGE.src, width: HERO_IMAGE.width, height: HERO_IMAGE.height, alt: t.hero.imageAlt },
    whyItems: t.why.items.map((x, i) => ({ num: pad(i + 1), href: H(x.to), ...x })),
    processSteps: t.process.steps.map((x, i) => ({ num: pad(i + 1), ...x })),
    mqItems: t.about.mq.map((x, i) => ({ num: pad(i + 1), ...x })),
    exportSteps: t.sourcing.steps.map((x, i) => {
      const term = (x as { term?: string }).term ?? '';
      return { num: pad(i + 1), title: x.title, body: x.body, term, hasTerm: !!term };
    }),
    guideCards: t.sourcing.guides.map((g) => ({ title: g.title, body: g.body, href: H(g.to) })),
    payItems: t.ship.payments.map((x, i) => {
      const term = (x as { term?: string }).term ?? '';
      return { num: pad(i + 1), title: x.title, body: x.body, term, hasTerm: !!term };
    }),
    portItems: t.ship.ports.map((x, i) => ({ num: pad(i + 1), name: x.name, alt: x.alt })),
    sendItems: t.custom.send.map((label, i) => ({ num: pad(i + 1), label })),
    footerGuides: [{ href: links.shipping, label: t.nav.shipping }, { href: links.custom, label: t.nav.custom }],
    navItems: [
      { href: links.home, label: t.nav.home }, { href: links.collections, label: t.nav.collections },
      { href: links.about, label: t.nav.about }, { href: links.sourcing, label: t.nav.sourcing },
      { href: links.contact, label: t.nav.contact },
    ],
    waReady, waNotReady: !waReady, waNum,
    waGeneral: waLink(siteConfig.whatsappNumber, t.wa.general),
    email, emailReady: !!email, emailNotReady: !email, emailHref: email ? `mailto:${email}` : '',
    phones: phoneContacts(t.wa.general),
    exportEmail: siteConfig.exportEmail ?? '', exportEmailReady: !!siteConfig.exportEmail, exportEmailHref: siteConfig.exportEmail ? `mailto:${siteConfig.exportEmail}` : '',
    website: siteConfig.website,
    year: new Date().getFullYear(),
  };
}

export interface PageCtaData { title: string; body: string; label1: string; href1: string; label2: string; href2: string; target2?: string; rel2?: string; mail?: { label: string; href: string; text: string } }

/** CTA band shown under About / Sourcing / Shipping / Custom pages (same wiring as the prototype). */
export function pageCta(ctx: PageCtx, page: 'about' | 'sourcing' | 'shipping' | 'custom'): PageCtaData {
  const { t, links, lang, waReady, waGeneral } = ctx;
  const waOr = (label: string) => (waReady
    ? { label2: label, href2: waGeneral, target2: '_blank', rel2: 'noopener noreferrer' }
    : { label2: t.nav.contact, href2: links.contact });
  const H = (p: string) => href(lang, p);
  // General e-mail for the company page, export e-mail for the export guides (omitted when not configured).
  const general = ctx.emailReady ? { mail: { label: t.contactInfo.general, href: ctx.emailHref, text: ctx.email } } : {};
  const exportMail = ctx.exportEmailReady ? { mail: { label: t.contactInfo.export, href: ctx.exportEmailHref, text: ctx.exportEmail } } : {};
  switch (page) {
    case 'about': return { title: t.about.ctaTitle, body: t.about.ctaBody, label1: t.about.cta1, href1: links.collections, ...waOr(t.about.cta2), ...general };
    case 'sourcing': return { title: t.sourcing.ctaTitle, body: '', label1: t.cta.rfq, href1: links.contact, ...waOr(t.cta.wa), ...exportMail };
    case 'shipping': return { title: t.ship.ctaTitle, body: t.ship.ctaBody, label1: t.ship.cta, href1: H('contact?type=shipping'), ...waOr(t.cta.wa), ...exportMail };
    case 'custom': return { title: t.custom.ctaTitle, body: t.custom.ctaBody, label1: t.custom.cta, href1: H('contact?type=project'), label2: t.custom.cta2, href2: H('contact?type=custom') };
  }
}
