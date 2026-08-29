import Link from 'next/link';
import type { ReactNode } from 'react';
import { DATA_CHECKED_DATE } from '@/data/sources';
import { formatDate } from '@/components/panel/format';
import { SiteHeader } from '@/components/SiteHeader';

export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <div className="content-shell">
      <SiteHeader />
      {children}
      <footer className="content-footer">
        <div>
          <strong>Where To BTO</strong>
          <p>Compare locations here. Confirm eligibility and project details with HDB.</p>
        </div>
        <div className="footer-links">
          <Link href="/ai-info">AI information</Link>
          <Link href="/sitemap.xml">Sitemap</Link>
          <span>Data checked {formatDate(DATA_CHECKED_DATE)}</span>
        </div>
      </footer>
    </div>
  );
}
