'use client';

import { useEffect } from 'react';
import { trackWebsiteReferral } from '@/lib/website-referrals';

export function WebsiteReferrals() {
  useEffect(() => { trackWebsiteReferral('landing'); }, []);
  return null;
}
