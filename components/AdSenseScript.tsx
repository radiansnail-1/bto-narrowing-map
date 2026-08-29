import Script from 'next/script';
import { ADSENSE_CLIENT, ADSENSE_HAS_LIVE_UNIT } from '@/lib/adsense';

export function AdSenseScript() {
  if (!ADSENSE_HAS_LIVE_UNIT) return null;

  return (
    <Script
      id="google-adsense"
      async
      crossOrigin="anonymous"
      strategy="afterInteractive"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
    />
  );
}
