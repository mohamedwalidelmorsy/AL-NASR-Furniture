'use client';

import { Fragment } from 'react';
import { A } from '@/components/ui/A';
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useForm, useWatch, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import countries from '@/data/countries.json';
import { useT } from '@/lib/use-t';
import { buildLinks } from '@/lib/links';
import { countMessage } from '@/lib/plural';
import { siteConfig, waLink, whatsappReady } from '@/lib/site-config';
import { useInquiry } from '@/features/inquiry/inquiry-provider';
import { useInquiryRows } from '@/features/inquiry/use-rows';
import { emptyRfqForm, rfqFormSchema, INQUIRY_TYPES, type RfqFormValues } from '@/features/rfq/schema';
import { availablePrefs, buildRfqPayload, effectivePref, resolveItems } from '@/features/rfq/payload';
import { RfqSubmitError, submitRfq, type RfqFailure } from '@/features/rfq/client';
import { fmt } from '@/lib/messages';
import type { ProductCard } from '@/lib/product-cards';
import type { Locale } from '@/i18n/routing';

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';
type FieldKey = Exclude<keyof RfqFormValues, 'pref'>;

export function ContactView({ products }: { products: ProductCard[] }) {
  const t = useT();
  const lang = useLocale() as Locale;
  const links = buildLinks(lang);
  const ltrAlign = lang === 'ar' ? 'right' : 'left';
  const inq = useInquiry();
  const inqItems = useInquiryRows(products);
  const hasInq = inqItems.length > 0;
  const inqEmpty = !hasInq;
  const typeParam = useSearchParams().get('type');

  const waReady = whatsappReady(siteConfig.whatsappNumber);
  const waNotReady = !waReady;
  const waGeneral = waLink(siteConfig.whatsappNumber, t.wa.general);
  const email = siteConfig.email ?? '';
  const emailReady = !!email;
  const emailNotReady = !email;
  const emailHref = email ? 'mailto:' + email : '';

  const resolver = useMemo(() => zodResolver(rfqFormSchema(hasInq)), [hasInq]);
  const form = useForm<RfqFormValues>({ defaultValues: emptyRfqForm(), resolver, mode: 'onSubmit', reValidateMode: 'onChange' });
  const { watch, control, setValue, reset, trigger, handleSubmit, formState } = form;
  const f = useWatch({ control }) as RfqFormValues;
  const showErrors = formState.isSubmitted;
  const errs = formState.errors as FieldErrors<RfqFormValues>;

  const [submit, setSubmit] = useState<SubmitState>('idle');
  const [submitErr, setSubmitErr] = useState<RfqFailure | null>(null);
  const [retryAfterSec, setRetryAfterSec] = useState<number | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [askClear, setAskClear] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  // Restore the saved draft (never the honeypot) and apply a ?type= preset from CTAs.
  useEffect(() => {
    let draft: Partial<RfqFormValues> = {};
    try { draft = JSON.parse(localStorage.getItem(siteConfig.storageKeys.draft) || 'null') ?? {}; } catch { /* corrupt draft */ }
    const preset = typeParam && (INQUIRY_TYPES as readonly string[]).includes(typeParam) ? { inquiryType: typeParam as RfqFormValues['inquiryType'] } : {};
    reset({ ...emptyRfqForm(), ...draft, ...preset, website: '' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeParam]);
  useEffect(() => {
    // React Hook Form's watch() subscription is not React-Compiler compatible; this component opts out of compilation by design.
    // eslint-disable-next-line react-hooks/incompatible-library
    const sub = watch((v) => {
      const d = { ...v } as Partial<RfqFormValues>;
      delete d.website;
      const pristine = JSON.stringify({ ...emptyRfqForm(), website: undefined }) === JSON.stringify({ ...emptyRfqForm(), ...d, website: undefined });
      try {
        if (pristine) localStorage.removeItem(siteConfig.storageKeys.draft);
        else localStorage.setItem(siteConfig.storageKeys.draft, JSON.stringify(d));
      } catch { /* storage unavailable */ }
    });
    return () => sub.unsubscribe();
  }, [watch]);
  // Selecting/removing items changes whether a message is required.
  useEffect(() => { if (formState.isSubmitted) void trigger(); }, [hasInq, formState.isSubmitted, trigger]);
  // Move focus to the error alert once it is rendered (a setTimeout before the render left focus on <body>).
  useEffect(() => { if (submit === 'error') errorRef.current?.focus(); }, [submit, submitErr]);

  const errKey = (k: FieldKey): string | undefined => (showErrors ? (errs[k]?.message as string | undefined) : undefined);
  const fv = (k: FieldKey) => {
    const key = errKey(k);
    return {
      value: f[k] as string & boolean,
      onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        { setValue(k, (e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value) as never, { shouldDirty: true }); if (showErrors) void trigger(); },
      err: key ? t.form.err[key as keyof typeof t.form.err] : '',
      has: !!key, bc: key ? '#B42318' : '#D8D2C9', inv: key ? ('true' as const) : undefined,
      desc: key ? 'f-' + k + '-err' : k === 'phone' ? 'f-phone-hint' : undefined,
    };
  };
  const fields = Object.fromEntries((['name', 'company', 'buyerType', 'country', 'email', 'phone', 'message', 'consent', 'website', 'inquiryType', 'shipTerm', 'payTerm', 'destPort'] as FieldKey[]).map((k) => [k, fv(k)])) as Record<FieldKey, ReturnType<typeof fv>>;

  const order: FieldKey[] = ['name', 'country', 'email', 'phone', 'message', 'consent'];
  const seen = new Set<string>();
  const errorList = showErrors ? order.flatMap((k) => {
    const key = errKey(k);
    if (!key || seen.has(key)) return [];
    seen.add(key);
    return [{ msg: t.form.err[key as keyof typeof t.form.err], focus: () => { const el = document.getElementById('f-' + k); if (el) { el.focus(); window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 120); } } }];
  }) : [];
  const hasErrors = errorList.length > 0;
  useEffect(() => { if (hasErrors && formState.submitCount) summaryRef.current?.focus(); }, [formState.submitCount]); // eslint-disable-line react-hooks/exhaustive-deps

  const av = availablePrefs(f);
  const effPref = effectivePref(f);
  const prefOptions = (['email', 'whatsapp', 'phone'] as const).map((v) => {
    const dis = !av.includes(v), on = effPref === v;
    return { v, label: t.form.prefs[v], disabled: dis, checked: on, onChange: () => setValue('pref', v, { shouldDirty: true }), border: on ? '#584838' : '#D8D2C9', bg: on ? '#fff' : 'transparent', opacity: dis ? '0.5' : '1' };
  });

  const selStyle = (k: FieldKey) => ({ width: '100%', height: 48, padding: '0 14px', border: '1px solid ' + (errKey(k) ? '#B42318' : '#D8D2C9'), borderRadius: 8, background: '#fff', fontSize: 16, color: '#252525' });
  const countrySelect = (
    <select id="f-country" value={f.country} onChange={fields.country.onChange} aria-required="true" aria-invalid={fields.country.inv} aria-describedby={fields.country.desc} autoComplete="country" style={selStyle('country')}>
      <option value="">{t.form.selectCountry}</option>
      <optgroup label={t.form.gcc}>{countries.filter((c) => c.g === 'gcc').map((c) => <option key={c.code} value={c.code}>{c[lang]}</option>)}</optgroup>
      <optgroup label={t.form.other}>{countries.filter((c) => c.g !== 'gcc').map((c) => <option key={c.code} value={c.code}>{c[lang]}</option>)}</optgroup>
    </select>
  );
  const optSel = (k: 'buyerType' | 'inquiryType' | 'shipTerm' | 'payTerm', list: { v: string; l: string }[], ph: string) => (
    <select id={'f-' + k} value={f[k] || ''} onChange={fields[k].onChange} style={selStyle(k)}>
      <option value="">{ph}</option>
      {list.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
    </select>
  );
  const buyerTypeSelect = optSel('buyerType', t.form.buyerTypes, t.form.select);
  const inquiryTypeSelect = optSel('inquiryType', t.form.inquiryTypes, t.form.select);
  const shipTermSelect = optSel('shipTerm', t.form.shipTerms, t.form.noPref);
  const payTermSelect = optSel('payTerm', t.form.payTerms, t.form.noPref);

  const busy = submit === 'submitting';
  // Online submission switched off (NEXT_PUBLIC_RFQ_ENABLED=false): nothing is sent, contact links are offered instead.
  const rfqOff = !siteConfig.rfqEnabled;
  const isSuccess = submit === 'success';
  const notSuccess = !isSuccess;
  const isError = submit === 'error';
  const errBase = ({ not_configured: 'notConfigured', rate_limited: 'rateLimited', unavailable: 'unavailable', server: 'server', network: 'network' } as const)[submitErr ?? 'network'];
  const submitErrTitle = t.form[`${errBase}Title`];
  // 429: tell the buyer how long to wait (Retry-After, rounded up to minutes; 10 = the default window).
  const waitMinutes = Math.max(1, Math.ceil((retryAfterSec ?? 600) / 60));
  const submitErrBody = errBase === 'rateLimited'
    ? fmt(t.form.rateLimited, { duration: countMessage(lang, waitMinutes, t.form.minutes) })
    : t.form[errBase];
  // Alternative contact inside the error: WhatsApp when configured, otherwise the sales e-mail.
  const altEmail = !waReady && emailReady;
  const messageReqLabel = hasInq ? t.form.optional : t.form.required;
  const messagePh = ({ custom: t.form.messagePhCustom, project: t.form.messagePhProject, shipping: t.form.messagePhShipping } as Record<string, string>)[f.inquiryType] || (hasInq ? t.form.messagePhItems : t.form.messagePhGeneral);
  const submitLabel = busy ? t.form.submitting : submit === 'error' ? t.form.retry : t.form.submit;
  const submitBg = busy || rfqOff ? '#8A7D70' : '#584838';
  const submitCursor = busy ? 'progress' : rfqOff ? 'not-allowed' : 'pointer';
  const hasReference = !!reference;

  const send = async (values: RfqFormValues) => {
    if (busy || rfqOff) return; // never send while online submission is off
    if (values.website) return; // honeypot: likely a bot — do not send, do not fake success
    const items = resolveItems(inq.validItems);
    const payload = buildRfqPayload(values, items, lang, window.location.href);
    setSubmit('submitting'); setSubmitErr(null); setRetryAfterSec(null);
    try {
      const r = await submitRfq(payload);
      reset(emptyRfqForm());
      try { localStorage.removeItem(siteConfig.storageKeys.draft); } catch { /* ignore */ }
      setReference(r.reference); setAskClear(items.length > 0); setSubmit('success');
      setTimeout(() => successRef.current?.focus(), 0);
    } catch (e) {
      setSubmitErr(e instanceof RfqSubmitError ? e.code : 'network');
      setRetryAfterSec(e instanceof RfqSubmitError ? e.retryAfterSeconds : null);
      setSubmit('error');
    }
  };
  const onSubmit = (ev: FormEvent<HTMLFormElement>) => { void handleSubmit(send)(ev); };
  const clearAfterSuccess = () => { inq.clear(); setAskClear(false); };
  const keepAfterSuccess = () => setAskClear(false);
  const newRequest = () => { setSubmit('idle'); setReference(null); setAskClear(false); };
  return (
    <>
  <section style={{ padding: "clamp(32px,4vw,48px) 0 clamp(56px,8vw,96px)" }}>
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 clamp(20px,4vw,40px)", boxSizing: "content-box", display: "flex", flexDirection: "column", gap: "clamp(40px,6vw,72px)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,300px),1fr))", gap: "clamp(16px,2vw,24px)" }}>
        <div style={{ padding: "28px", border: "1px solid #D8D2C9", borderRadius: "10px", background: "#fff", display: "flex", flexDirection: "column", gap: "12px", alignItems: "flex-start" }}>
          <h2 style={{ margin: "0", fontSize: "20px", fontWeight: "600" }}>{t.contact.waTitle}</h2>
          <p style={{ margin: "0", fontSize: "15px", color: "#625C54" }}>{t.contact.waBody}</p>
          {(waReady) && (<><A href={waGeneral} target="_blank" rel="noopener noreferrer" style={{ marginTop: "8px", display: "inline-flex", alignItems: "center", height: "48px", padding: "0 20px", borderRadius: "6px", background: "#584838", color: "#fff", fontSize: "15px", fontWeight: "600", textDecoration: "none" }} className="sh3">{t.contact.waBtn}</A></>)}
          {(waNotReady) && (<><p style={{ margin: "8px 0 0", padding: "10px 14px", border: "1px dashed #D8D2C9", borderRadius: "6px", fontSize: "14px", color: "#625C54" }}>{t.contact.waPending} · <span dir="ltr">PENDING</span></p></>)}
        </div>
        <div style={{ padding: "28px", border: "1px solid #D8D2C9", borderRadius: "10px", background: "#fff", display: "flex", flexDirection: "column", gap: "12px", alignItems: "flex-start" }}>
          <h2 style={{ margin: "0", fontSize: "20px", fontWeight: "600" }}>{t.contact.emailTitle}</h2>
          {(emailReady) && (<><A href={emailHref} dir="ltr" style={{ fontSize: "16px", fontWeight: "600" }}>{email}</A></>)}
          {(emailNotReady) && (<><p style={{ margin: "0", padding: "10px 14px", border: "1px dashed #D8D2C9", borderRadius: "6px", fontSize: "14px", color: "#625C54" }}>{t.contact.emailPending} · <span dir="ltr">PENDING</span></p></>)}
        </div>
      </div>

      <div id="rfq" style={{ display: "flex", flexWrap: "wrap", gap: "clamp(32px,5vw,64px)", alignItems: "flex-start" }}>
        <div style={{ flex: "3 1 520px", minWidth: "0" }}>
          <h2 style={{ margin: "0 0 8px", fontSize: "clamp(28px,3vw,36px)", lineHeight: "1.25", fontWeight: "600", letterSpacing: "-.015em" }}>{t.contact.rfqTitle}</h2>
          <p style={{ margin: "0 0 32px", color: "#625C54", maxWidth: "60ch" }}>{t.contact.rfqBody}</p>

          {(isSuccess) && (<>
            <div ref={successRef} tabIndex={-1} role="status" style={{ padding: "32px", border: "1px solid #24634B", borderRadius: "10px", background: "#fff", display: "flex", flexDirection: "column", gap: "16px", outline: "none" }}>
              <h3 style={{ margin: "0", fontSize: "22px", fontWeight: "600", color: "#24634B" }}>{t.form.successTitle}</h3>
              <p style={{ margin: "0" }}>{t.form.successBody}</p>
              {(hasReference) && (<><p style={{ margin: "0", fontSize: "14px" }}>{t.form.reference}: <strong dir="ltr">{reference}</strong></p></>)}
              {(askClear) && (<>
                <div style={{ paddingTop: "16px", borderTop: "1px solid #D8D2C9", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <p style={{ margin: "0", fontSize: "15px" }}>{t.form.clearQ}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                    <button type="button" onClick={clearAfterSuccess} style={{ height: "44px", padding: "0 18px", borderRadius: "6px", border: "0", background: "#584838", color: "#fff", fontWeight: "600", cursor: "pointer" }}>{t.form.clear}</button>
                    <button type="button" onClick={keepAfterSuccess} style={{ height: "44px", padding: "0 18px", borderRadius: "6px", border: "1px solid #584838", background: "transparent", color: "#584838", fontWeight: "600", cursor: "pointer" }}>{t.form.keep}</button>
                  </div>
                </div>
              </>)}
              <button type="button" onClick={newRequest} style={{ alignSelf: "flex-start", height: "44px", padding: "0", border: "0", background: "transparent", color: "#584838", fontWeight: "600", textDecoration: "underline", textUnderlineOffset: "3px", cursor: "pointer" }}>{t.form.newReq}</button>
            </div>
          </>)}

          {(notSuccess) && (<>
            <form data-testid="rfq-form" noValidate onSubmit={onSubmit} aria-busy={busy} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {(rfqOff) && (<>
                <div role="status" data-testid="rfq-disabled" style={{ padding: "20px 24px", border: "1px solid #584838", borderRadius: "8px", background: "#F3EFE8", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <p style={{ margin: "0", fontWeight: "600" }}>{t.form.disabledTitle}</p>
                  <p id="rfq-off-note" style={{ margin: "0", fontSize: "15px" }}>{t.form.disabledBody}</p>
                  {(waReady) && (<><A href={waGeneral} target="_blank" rel="noopener noreferrer" style={{ alignSelf: "flex-start", fontWeight: "600" }}>{t.contact.waBtn}</A></>)}
                  {(emailReady) && (<><A href={emailHref} style={{ alignSelf: "flex-start", fontWeight: "600" }}>{t.form.emailSales} <span dir="ltr">({email})</span></A></>)}
                </div>
              </>)}
              {(hasErrors) && (<>
                <div ref={summaryRef} tabIndex={-1} role="alert" style={{ padding: "20px 24px", border: "1px solid #B42318", borderRadius: "8px", background: "#FDF3F2", outline: "none" }}>
                  <p style={{ margin: "0 0 10px", fontWeight: "600", color: "#B42318" }}>{t.form.summaryTitle}</p>
                  <ul style={{ margin: "0", paddingInlineStart: "20px", display: "flex", flexDirection: "column", gap: "4px" }}>
                    {errorList.map((er, __i) => (<Fragment key={__i}>
                      <li><button type="button" onClick={er.focus} style={{ padding: "2px 0", border: "0", background: "transparent", color: "#B42318", textDecoration: "underline", textUnderlineOffset: "3px", cursor: "pointer", fontSize: "15px", textAlign: "start" }}>{er.msg}</button></li>
                    </Fragment>))}
                  </ul>
                </div>
              </>)}

              <div style={{ maxWidth: "480px" }}>
                <label htmlFor="f-inquiryType" style={{ display: "flex", justifyContent: "space-between", gap: "8px", fontSize: "14px", fontWeight: "600", marginBottom: "8px" }}><span>{t.form.inquiryType}</span><span style={{ fontWeight: "400", color: "#625C54" }}>{t.form.optional}</span></label>
                {inquiryTypeSelect}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,240px),1fr))", gap: "20px" }}>
                <div>
                  <label htmlFor="f-name" style={{ display: "flex", justifyContent: "space-between", gap: "8px", fontSize: "14px", fontWeight: "600", marginBottom: "8px" }}><span>{t.form.name}</span><span style={{ fontWeight: "400", color: "#625C54" }}>{t.form.required}</span></label>
                  <input id="f-name" type="text" autoComplete="name" value={fields.name.value} onChange={fields.name.onChange} aria-invalid={fields.name.inv} aria-describedby={fields.name.desc} aria-required="true" style={{ width: "100%", height: "48px", padding: "0 14px", border: `1px solid ${fields.name.bc}`, borderRadius: "8px", background: "#fff", fontSize: "16px" }} className="sf9" />
                  {(fields.name.has) && (<><p id="f-name-err" style={{ margin: "6px 0 0", fontSize: "14px", color: "#B42318" }}>{fields.name.err}</p></>)}
                </div>
                <div>
                  <label htmlFor="f-company" style={{ display: "flex", justifyContent: "space-between", gap: "8px", fontSize: "14px", fontWeight: "600", marginBottom: "8px" }}><span>{t.form.company}</span><span style={{ fontWeight: "400", color: "#625C54" }}>{t.form.optional}</span></label>
                  <input id="f-company" type="text" autoComplete="organization" value={fields.company.value} onChange={fields.company.onChange} style={{ width: "100%", height: "48px", padding: "0 14px", border: "1px solid #D8D2C9", borderRadius: "8px", background: "#fff", fontSize: "16px" }} className="sf9" />
                </div>
                <div>
                  <label htmlFor="f-buyerType" style={{ display: "flex", justifyContent: "space-between", gap: "8px", fontSize: "14px", fontWeight: "600", marginBottom: "8px" }}><span>{t.form.buyerType}</span><span style={{ fontWeight: "400", color: "#625C54" }}>{t.form.optional}</span></label>
                  {buyerTypeSelect}
                </div>
                <div>
                  <label htmlFor="f-country" style={{ display: "flex", justifyContent: "space-between", gap: "8px", fontSize: "14px", fontWeight: "600", marginBottom: "8px" }}><span>{t.form.country}</span><span style={{ fontWeight: "400", color: "#625C54" }}>{t.form.required}</span></label>
                  {countrySelect}
                  {(fields.country.has) && (<><p id="f-country-err" style={{ margin: "6px 0 0", fontSize: "14px", color: "#B42318" }}>{fields.country.err}</p></>)}
                </div>
              </div>

              <fieldset style={{ margin: "0", padding: "20px", border: "1px solid #D8D2C9", borderRadius: "10px", minWidth: "0" }}>
                <legend style={{ padding: "0 8px", fontSize: "14px", fontWeight: "600" }}>{t.form.contactHint}</legend>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,240px),1fr))", gap: "20px" }}>
                  <div>
                    <label htmlFor="f-email" style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "8px" }}>{t.form.email}</label>
                    <input id="f-email" type="email" dir="ltr" autoComplete="email" inputMode="email" value={fields.email.value} onChange={fields.email.onChange} aria-invalid={fields.email.inv} aria-describedby={fields.email.desc} placeholder="name@company.com" style={{ width: "100%", height: "48px", padding: "0 14px", border: `1px solid ${fields.email.bc}`, borderRadius: "8px", background: "#fff", fontSize: "16px", textAlign: ltrAlign }} className="sf9" />
                    {(fields.email.has) && (<><p id="f-email-err" style={{ margin: "6px 0 0", fontSize: "14px", color: "#B42318" }}>{fields.email.err}</p></>)}
                  </div>
                  <div>
                    <label htmlFor="f-phone" style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "8px" }}>{t.form.phone}</label>
                    <input id="f-phone" type="tel" dir="ltr" autoComplete="tel" inputMode="tel" value={fields.phone.value} onChange={fields.phone.onChange} aria-invalid={fields.phone.inv} aria-describedby={fields.phone.desc} placeholder="+971 50 123 4567" style={{ width: "100%", height: "48px", padding: "0 14px", border: `1px solid ${fields.phone.bc}`, borderRadius: "8px", background: "#fff", fontSize: "16px", textAlign: ltrAlign }} className="sf9" />
                    <p id="f-phone-hint" style={{ margin: "6px 0 0", fontSize: "13px", color: "#625C54" }}>{t.form.phoneHint}</p>
                    {(fields.phone.has) && (<><p id="f-phone-err" style={{ margin: "4px 0 0", fontSize: "14px", color: "#B42318" }}>{fields.phone.err}</p></>)}
                  </div>
                </div>
                <div role="radiogroup" aria-labelledby="pref-label" style={{ marginTop: "20px" }}>
                  <p id="pref-label" style={{ margin: "0 0 10px", fontSize: "14px", fontWeight: "600" }}>{t.form.pref}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {prefOptions.map((o, __i) => (<Fragment key={__i}>
                      <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", minHeight: "44px", padding: "0 14px", border: `1px solid ${o.border}`, borderRadius: "8px", background: o.bg, fontSize: "15px", cursor: "pointer", opacity: o.opacity }}>
                        <input type="radio" name="pref" value={o.v} checked={o.checked} disabled={o.disabled} onChange={o.onChange} style={{ accentColor: "#584838", width: "18px", height: "18px", margin: "0" }} />
                        {o.label}
                      </label>
                    </Fragment>))}
                  </div>
                </div>
              </fieldset>

              <fieldset style={{ margin: "0", padding: "20px", border: "1px solid #D8D2C9", borderRadius: "10px", minWidth: "0" }}>
                <legend style={{ padding: "0 8px", fontSize: "14px", fontWeight: "600" }}>{t.form.tradeTitle} <span style={{ fontWeight: "400", color: "#625C54" }}>· {t.form.optional}</span></legend>
                <p style={{ margin: "0 0 16px", fontSize: "13px", color: "#625C54" }}>{t.form.tradeHint} <A href={links.shipping} style={{ fontWeight: "600" }}>{t.form.termsGuide}</A></p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,240px),1fr))", gap: "20px" }}>
                  <div>
                    <label htmlFor="f-shipTerm" style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "8px" }}>{t.form.shipTerm}</label>
                    {shipTermSelect}
                  </div>
                  <div>
                    <label htmlFor="f-payTerm" style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "8px" }}>{t.form.payTerm}</label>
                    {payTermSelect}
                  </div>
                  <div style={{ gridColumn: "1/-1" }}>
                    <label htmlFor="f-destPort" style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "8px" }}>{t.form.destPort}</label>
                    <input id="f-destPort" type="text" value={fields.destPort.value} onChange={fields.destPort.onChange} placeholder={t.form.destPortPh} maxLength={120} autoComplete="off" style={{ width: "100%", height: "48px", padding: "0 14px", border: "1px solid #D8D2C9", borderRadius: "8px", background: "#fff", fontSize: "16px" }} className="sf9" />
                  </div>
                </div>
              </fieldset>

              <div>
                <label htmlFor="f-message" style={{ display: "flex", justifyContent: "space-between", gap: "8px", fontSize: "14px", fontWeight: "600", marginBottom: "8px" }}><span>{t.form.message}</span><span style={{ fontWeight: "400", color: "#625C54" }}>{messageReqLabel}</span></label>
                <textarea id="f-message" rows={5} value={fields.message.value} onChange={fields.message.onChange} placeholder={messagePh} aria-invalid={fields.message.inv} aria-describedby={fields.message.desc} maxLength={3000} style={{ width: "100%", padding: "12px 14px", border: `1px solid ${fields.message.bc}`, borderRadius: "8px", background: "#fff", fontSize: "16px", lineHeight: "1.6", resize: "vertical" }} className="sf9"></textarea>
                {(fields.message.has) && (<><p id="f-message-err" style={{ margin: "6px 0 0", fontSize: "14px", color: "#B42318" }}>{fields.message.err}</p></>)}
              </div>

              <div aria-hidden="true" style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0 0 0 0)" }}>
                <label htmlFor="f-website">Website</label>
                <input id="f-website" type="text" tabIndex={-1} autoComplete="off" value={fields.website.value} onChange={fields.website.onChange} />
              </div>

              <div>
                <label style={{ display: "flex", alignItems: "flex-start", gap: "12px", fontSize: "15px", cursor: "pointer" }}>
                  <input id="f-consent" type="checkbox" checked={fields.consent.value} onChange={fields.consent.onChange} aria-invalid={fields.consent.inv} aria-describedby={fields.consent.desc} style={{ accentColor: "#584838", width: "20px", height: "20px", margin: "2px 0 0", flex: "none" }} />
                  <span>{t.form.consent} <A href={links.privacy}>{t.form.privacy}</A> <span style={{ color: "#625C54", fontSize: "13px" }}>{t.form.privacyPending}</span></span>
                </label>
                {(fields.consent.has) && (<><p id="f-consent-err" style={{ margin: "6px 0 0", fontSize: "14px", color: "#B42318" }}>{fields.consent.err}</p></>)}
              </div>

              {(isError) && (<>
                <div ref={errorRef} tabIndex={-1} role="alert" style={{ padding: "20px 24px", border: "1px solid #B42318", borderRadius: "8px", background: "#FDF3F2", display: "flex", flexDirection: "column", gap: "8px", outline: "none" }}>
                  <p style={{ margin: "0", fontWeight: "600", color: "#B42318" }}>{submitErrTitle}</p>
                  <p style={{ margin: "0", fontSize: "15px", color: "#252525" }}>{submitErrBody}</p>
                  {(waReady) && (<><A href={waGeneral} target="_blank" rel="noopener noreferrer" style={{ alignSelf: "flex-start", fontWeight: "600" }}>{t.contact.waBtn}</A></>)}
                  {(altEmail) && (<><A href={emailHref} style={{ alignSelf: "flex-start", fontWeight: "600" }}>{t.form.emailSales} <span dir="ltr">({email})</span></A></>)}
                </div>
              </>)}

              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "16px" }}>
                <button type="submit" disabled={busy || rfqOff} aria-describedby={rfqOff ? 'rfq-off-note' : undefined} style={{ height: "52px", padding: "0 28px", borderRadius: "6px", border: "0", background: submitBg, color: "#fff", fontSize: "15px", fontWeight: "600", cursor: submitCursor, transition: "background .2s" }}>{submitLabel}</button>
                <p style={{ margin: "0", fontSize: "13px", color: "#625C54" }}>{t.form.notOrder}</p>
              </div>
            </form>
          </>)}
        </div>

        <aside aria-labelledby="rfq-sel" style={{ flex: "2 1 300px", minWidth: "0", position: "sticky", top: "104px", padding: "28px", borderRadius: "10px", background: "#E9E4DC", display: "flex", flexDirection: "column", gap: "16px" }}>
          <h2 id="rfq-sel" style={{ margin: "0", fontSize: "20px", fontWeight: "600" }}>{t.form.selectedTitle}</h2>
          {(inq.archivedItems.length > 0) && (<div role="status" data-testid="rfq-archived-notice" style={{ padding: "12px 14px", borderRadius: "6px", background: "#FAF9F6", border: "1px solid #D8D2C9", display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px" }}>
            <span>{countMessage(lang, inq.archivedItems.length, { one: t.inquiry.archivedNotice1, two: t.inquiry.archivedNotice2, few: t.inquiry.archivedNotice, many: t.inquiry.archivedNoticeMany })}</span>
            <button type="button" onClick={inq.removeArchived} style={{ alignSelf: "flex-start", height: "40px", padding: "0 14px", borderRadius: "6px", border: "1px solid #B42318", background: "transparent", color: "#B42318", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>{t.inquiry.removeArchived}</button>
          </div>)}
          {(inqEmpty) && (<>
            <p style={{ margin: "0", fontSize: "15px", color: "#4F4943" }}>{t.form.noneSelected}</p>
            <A href={links.collections} style={{ alignSelf: "flex-start", fontWeight: "600", fontSize: "15px" }}>{t.form.browse}</A>
          </>)}
          {(hasInq) && (<>
            <ul style={{ listStyle: "none", margin: "0", padding: "0", display: "flex", flexDirection: "column", borderTop: "1px solid #C9C1B5" }}>
              {inqItems.map((it, __i) => (<Fragment key={__i}>
                <li style={{ display: "flex", justifyContent: "space-between", gap: "16px", padding: "12px 0", borderBottom: "1px solid #C9C1B5", fontSize: "15px" }}>
                  <span style={{ minWidth: "0" }}><span style={{ display: "block", fontWeight: "600" }}>{it.name}</span><span dir="ltr" data-keep-ls="" style={{ font: "500 12px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace", color: "#4F4943" }}>{it.code}</span>{(it.hasNote) && (<><span style={{ display: "block", fontSize: "13px", color: "#4F4943", marginTop: "4px" }}>{it.note}</span></>)}</span>
                  <span style={{ flex: "none", fontWeight: "600" }}><bdi>{it.qtyText}</bdi></span>
                </li>
              </Fragment>))}
            </ul>
            <A href={links.inquiry} style={{ alignSelf: "flex-start", fontWeight: "600", fontSize: "15px" }}>{t.form.editList}</A>
          </>)}
          <div style={{ marginTop: "8px", paddingTop: "20px", borderTop: "1px solid #C9C1B5" }}>
            <h3 style={{ margin: "0 0 10px", fontSize: "15px", fontWeight: "600" }}>{t.contact.includesTitle}</h3>
            <ul style={{ listStyle: "none", margin: "0", padding: "0", display: "flex", flexDirection: "column", gap: "6px", fontSize: "14px", color: "#4F4943" }}>
              {t.contact.includes.map((x, __i) => (<Fragment key={__i}><li style={{ display: "flex", alignItems: "baseline", gap: "10px" }}><span aria-hidden="true" style={{ width: "6px", height: "6px", background: "#A58B64", flex: "none", transform: "translateY(-3px)" }}></span><span>{x}</span></li></Fragment>))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  </section>
    </>
  );
}
