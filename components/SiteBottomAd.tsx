'use client';

import { usePathname } from 'next/navigation';
import { AdUnit } from '@/components/AdUnit';
import { ADSENSE_SLOTS } from '@/lib/adsense';

const AD_FREE_PATHS = new Set(['/privacy', '/ai-info']);

export function SiteBottomAd() {
  const pathname = usePathname();

  if (AD_FREE_PATHS.has(pathname)) return null;

  return <AdUnit className="site-bottom-ad" placement="bottom" slot={ADSENSE_SLOTS.bottom} />;
}
