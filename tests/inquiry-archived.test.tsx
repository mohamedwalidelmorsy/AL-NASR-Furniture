import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { allMessages, pickClientMessages } from '@/lib/messages';
import { InquiryView } from '@/components/views/InquiryView';
import { ToastProvider } from '@/components/toast-provider';
import { InquiryProvider } from '@/features/inquiry/inquiry-provider';
import { inquiryStore } from '@/features/inquiry/store';
import { siteConfig } from '@/lib/site-config';
import { getProductCards } from '@/lib/product-cards';
import type { Locale } from '@/i18n/routing';

vi.mock('next/image', () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

const archived = [{ id: 'pv-old-01', code: 'PV-OLD-01', name: { en: 'Old Sample Set', ar: 'طقم تجريبي قديم' }, href: '/en/collections/bedrooms/old-sample' }];

function view(locale: Locale = 'en') {
  const cards = getProductCards(locale);
  return render(
    <NextIntlClientProvider locale={locale} messages={pickClientMessages(allMessages[locale])}>
      <ToastProvider>
        <InquiryProvider validIds={['pv-br-01']} archived={archived}>
          <InquiryView products={cards} />
        </InquiryProvider>
      </ToastProvider>
    </NextIntlClientProvider>,
  );
}

describe('Inquiry List with an archived product (persisted data)', () => {
  beforeEach(() => {
    localStorage.setItem(siteConfig.storageKeys.inquiry, JSON.stringify([{ id: 'pv-old-01', qty: 7, note: 'old note' }, { id: 'pv-br-01', qty: 3, note: 'keep' }]));
    inquiryStore._reset();
  });
  afterEach(() => { cleanup(); localStorage.clear(); inquiryStore._reset(); });

  it('shows the archived line with its stored quantity and note, clearly marked, next to the valid item', async () => {
    view();
    const row = await screen.findByTestId('archived-row');
    expect(row).toHaveTextContent('Old Sample Set');
    expect(row).toHaveTextContent('Sample design — no longer available');
    expect(row).toHaveTextContent('7');
    expect(row).toHaveTextContent('old note');
    expect(screen.getByText('1 unavailable item will not be included in your request.')).toBeInTheDocument();
    expect(screen.getByText('1 collection selected')).toBeInTheDocument(); // only the active line counts
  });

  it('lets the buyer remove unavailable items and keep the valid one — nothing is re-mapped', async () => {
    view();
    await screen.findByTestId('archived-row');
    fireEvent.click(screen.getByRole('button', { name: 'Remove unavailable items' }));
    expect(screen.queryByTestId('archived-row')).toBeNull();
    expect(JSON.parse(localStorage.getItem(siteConfig.storageKeys.inquiry)!)).toEqual([{ id: 'pv-br-01', qty: 3, note: 'keep' }]);
  });

  it('renders Arabic labels', async () => {
    view('ar');
    const row = await screen.findByTestId('archived-row');
    expect(row).toHaveTextContent('طقم تجريبي قديم');
    expect(row).toHaveTextContent('تصميم تجريبي — لم يعد متاحًا');
  });
});
