'use client';

import { useEffect, useRef } from 'react';
import { ADSENSE_CLIENT, ADSENSE_PREVIEW } from '@/lib/adsense';

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

type AdUnitProps = {
  className?: string;
  placement: 'article' | 'bottom';
  slot?: string;
};

export function AdUnit({ className = '', placement, slot }: AdUnitProps) {
  const requested = useRef(false);

  useEffect(() => {
    if (!slot || requested.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle ?? []).push({});
      requested.current = true;
    } catch {
      // Ad blockers and consent tools can prevent the request. The page remains usable.
    }
  }, [slot]);

  if (!slot && !ADSENSE_PREVIEW) return null;

  return (
    <aside className={`ad-slot ad-slot-${placement} ${className}`.trim()} aria-label="Advertisement">
      <span className="ad-label">Advertisement</span>
      {slot ? (
        <ins
          className="adsbygoogle"
          data-ad-client={ADSENSE_CLIENT}
          data-ad-format={placement === 'article' ? 'fluid' : 'auto'}
          {...(placement === 'article' ? { 'data-ad-layout': 'in-article' } : { 'data-full-width-responsive': 'true' })}
          data-ad-slot={slot}
          style={{ display: 'block', ...(placement === 'article' ? { textAlign: 'center' } : {}) }}
        />
      ) : (
        <div className="ad-preview">Responsive {placement === 'article' ? 'in-article' : 'bottom'} ad</div>
      )}
    </aside>
  );
}
