import { handleRfq } from '@/features/rfq/server/handler';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = (req: Request) => handleRfq(req);
