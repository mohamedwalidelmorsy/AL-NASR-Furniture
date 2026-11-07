'use client';

import { useMessages } from 'next-intl';
import type { Messages } from '@/lib/messages';
import type { CLIENT_NAMESPACES } from '@/lib/messages';

type ClientMessages = Pick<Messages, (typeof CLIENT_NAMESPACES)[number]>;

/** Client-side access to the message tree delivered by NextIntlClientProvider (client namespaces only). */
export const useT = () => useMessages() as unknown as ClientMessages;
