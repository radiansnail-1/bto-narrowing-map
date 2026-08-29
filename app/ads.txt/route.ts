import { ADSENSE_CLIENT, publisherId } from '@/lib/adsense';

export function GET() {
  return new Response(`google.com, ${publisherId(ADSENSE_CLIENT)}, DIRECT, f08c47fec0942fa0\n`, {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}
