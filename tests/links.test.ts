import { describe, expect, it } from 'vitest';
import { buildLinks, pageKeyFromPath, switchLocalePath } from '@/lib/links';
import { dirOf, isLocale, otherLocale } from '@/i18n/routing';

describe('routing helpers', () => {
  it('classifies paths for navigation highlighting', () => {
    expect(pageKeyFromPath('/en')).toBe('home');
    expect(pageKeyFromPath('/ar/collections')).toBe('collections');
    expect(pageKeyFromPath('/en/collections/bedrooms')).toBe('category');
    expect(pageKeyFromPath('/en/collections/bedrooms/soft-arc-bedroom-set')).toBe('detail');
    expect(pageKeyFromPath('/en/shipping-payment')).toBe('shipping');
    expect(pageKeyFromPath('/en/custom-manufacturing')).toBe('custom');
    expect(pageKeyFromPath('/en/sourcing-export')).toBe('sourcing');
    expect(pageKeyFromPath('/ar/whatever')).toBe('notFound');
    expect(pageKeyFromPath('/en/collections/a/b/c')).toBe('notFound');
  });
  it('keeps page identity when switching language', () => {
    expect(switchLocalePath('/en', 'ar')).toBe('/ar');
    expect(switchLocalePath('/en/collections/bedrooms/soft-arc-bedroom-set', 'ar')).toBe('/ar/collections/bedrooms/soft-arc-bedroom-set');
    expect(switchLocalePath('/ar/contact', 'en')).toBe('/en/contact');
  });
  it('builds locale-prefixed links', () => {
    expect(buildLinks('ar').contact).toBe('/ar/contact');
    expect(buildLinks('en').home).toBe('/en');
  });
  it('maps locale → direction', () => {
    expect(dirOf('ar')).toBe('rtl');
    expect(dirOf('en')).toBe('ltr');
    expect(otherLocale('ar')).toBe('en');
    expect(isLocale('fr')).toBe(false);
  });
});
