import { fmt } from '@/lib/messages';

/** Message forms for a counted noun. Arabic needs: 1 (singular), 2 (dual), 3–10 (plural), 11+ (singular accusative); English: 1 / other. */
export interface CountForms { one: string; two?: string; few: string; many?: string }

export function countMessage(lang: 'en' | 'ar', n: number, f: CountForms): string {
  if (n === 1) return fmt(f.one, { n });
  if (lang === 'ar') {
    if (n === 2) return fmt(f.two ?? f.few, { n });
    if (n >= 11) return fmt(f.many ?? f.few, { n });
  }
  return fmt(f.few, { n });
}
