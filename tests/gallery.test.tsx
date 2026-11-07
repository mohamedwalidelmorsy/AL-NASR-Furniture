import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { allMessages, pickClientMessages } from '@/lib/messages';
import { DetailView, type DetailProduct } from '@/components/views/DetailView';
import { ToastProvider } from '@/components/toast-provider';
import { InquiryProvider } from '@/features/inquiry/inquiry-provider';
import { inquiryStore } from '@/features/inquiry/store';
import type { Locale } from '@/i18n/routing';

vi.mock('next/navigation', () => ({ usePathname: () => '/en/collections/bedrooms/x' }));
vi.mock('next/image', () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

const product: DetailProduct = {
  id: 'pv-br-01', name: 'Test Set', code: 'PV-BR-01', desc: 'd', style: 'Illustrative design', unit: 'set', catName: 'Bedroom Sets', catHref: '/en/collections/bedrooms', imgAlt: 'alt',
  images: [1, 2, 3].map((n) => ({ full: `/img-${n}.webp`, width: 100, height: 100 })), pieces: [], materials: '',
};

function view(locale: Locale = 'en') {
  return render(
    <NextIntlClientProvider locale={locale} messages={pickClientMessages(allMessages[locale])}>
      <ToastProvider>
        <InquiryProvider validIds={['pv-br-01']}>
          <DetailView product={product} related={[]} crumbs={[{ label: 'Home', href: '/en' }, { label: 'Test Set' }]} />
        </InquiryProvider>
      </ToastProvider>
    </NextIntlClientProvider>,
  );
}
const mainSrc = () => (screen.getByRole('region', { name: 'Image gallery' }).querySelector('img') as HTMLImageElement).getAttribute('src');

beforeEach(() => { localStorage.clear(); inquiryStore._reset(); });
afterEach(cleanup);

describe('product image gallery (multi-image)', () => {
  it('shows a counter, steps with next/prev (wrapping) and via thumbnails', () => {
    view();
    expect(mainSrc()).toBe('/img-1.webp');
    expect(screen.getAllByText('Image 1 of 3').length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button', { name: 'Next image' }));
    expect(mainSrc()).toBe('/img-2.webp');
    fireEvent.click(screen.getByRole('button', { name: 'Previous image' }));
    fireEvent.click(screen.getByRole('button', { name: 'Previous image' }));
    expect(mainSrc()).toBe('/img-3.webp'); // wraps backwards
    fireEvent.click(screen.getByRole('button', { name: /Show image 2/ }));
    expect(mainSrc()).toBe('/img-2.webp');
    expect(screen.getByRole('button', { name: /Show image 2/ })).toHaveAttribute('aria-current', 'true');
  });

  it('lightbox: opens as a modal dialog, arrow keys navigate, Escape closes', () => {
    view();
    fireEvent.click(screen.getByRole('button', { name: /View larger image/ }));
    const dlg = screen.getByRole('dialog');
    expect(dlg).toHaveAttribute('aria-modal', 'true');
    expect(within(dlg).getByRole('button', { name: 'Close image viewer' })).toHaveFocus();
    fireEvent.keyDown(dlg, { key: 'ArrowRight' });
    expect(within(dlg).getByRole('img').getAttribute('src')).toBe('/img-2.webp');
    fireEvent.keyDown(dlg, { key: 'ArrowLeft' });
    expect(within(dlg).getByRole('img').getAttribute('src')).toBe('/img-1.webp');
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('lightbox arrow keys are mirrored in Arabic (RTL)', () => {
    view('ar');
    fireEvent.click(screen.getByRole('button', { name: /^عرض الصورة بحجم أكبر/ }));
    const dlg = screen.getByRole('dialog');
    fireEvent.keyDown(dlg, { key: 'ArrowLeft' }); // forward in RTL
    expect(within(dlg).getByRole('img').getAttribute('src')).toBe('/img-2.webp');
  });

  it('adds to the Inquiry List once and updates the quantity on the second add', () => {
    view();
    fireEvent.change(document.getElementById('dqty')!, { target: { value: '5' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add to Inquiry' }));
    expect(inquiryStore.getSnapshot().items).toEqual([{ id: 'pv-br-01', qty: 5, note: '' }]);
    fireEvent.change(document.getElementById('dqty')!, { target: { value: '8' } });
    fireEvent.click(screen.getByRole('button', { name: 'Update Inquiry' }));
    expect(inquiryStore.getSnapshot().items).toEqual([{ id: 'pv-br-01', qty: 8, note: '' }]);
  });
});
