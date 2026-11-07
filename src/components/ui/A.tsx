import Link from 'next/link';
import type { AnchorHTMLAttributes } from 'react';

/** Internal paths ("/en/…") use next/link (prefetch + client navigation); everything else is a plain anchor. */
export function A({ href, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  if (href.startsWith('/') && !href.startsWith('//')) return <Link href={href} {...rest} />;
  return <a href={href} {...rest} />;
}
