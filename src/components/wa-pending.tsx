'use client';

import type { CSSProperties, ReactNode } from 'react';
import { useToast } from '@/components/toast-provider';

/** WhatsApp control shown while no number is configured: explains instead of linking nowhere. */
export function WaPending({ children, style, className, ...aria }: { children: ReactNode; style?: CSSProperties; className?: string; 'aria-label'?: string }) {
  const { show } = useToast();
  return (
    <button type="button" onClick={() => show('waPending')} style={style} className={className} {...aria}>
      {children}
    </button>
  );
}
