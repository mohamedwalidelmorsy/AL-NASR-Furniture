'use client';

import type { CSSProperties } from 'react';
import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { A } from '@/components/ui/A';
import { otherLocale, type Locale } from '@/i18n/routing';
import { switchLocalePath } from '@/lib/links';

/** Link to the same page in the other language (page identity is preserved; Arabic ⇄ English). */
export function LangSwitch({ label, style, className }: { label: string; style?: CSSProperties; className?: string }) {
  const lang = useLocale() as Locale;
  const other = otherLocale(lang);
  const pathname = usePathname();
  return (
    <A
      href={switchLocalePath(pathname, other)}
      hrefLang={other}
      lang={other}
      aria-label={lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
      style={style}
      className={className}
      data-testid="lang-switch"
    >
      {label}
    </A>
  );
}
