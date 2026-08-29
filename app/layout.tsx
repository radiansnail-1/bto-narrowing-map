import type { Metadata } from 'next';
import { hankenGrotesk } from './fonts';
import { ADSENSE_CLIENT } from '@/lib/adsense';
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/site';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: SITE_URL,
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: { canonical: '/' },
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: '/',
    siteName: SITE_NAME,
    locale: 'en_SG',
    type: 'website',
  },
  twitter: { card: 'summary', title: SITE_NAME, description: SITE_DESCRIPTION },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
  },
  category: 'housing',
  other: { 'google-adsense-account': ADSENSE_CLIENT },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={hankenGrotesk.variable}>
      <body className={hankenGrotesk.className}>{children}</body>
    </html>
  );
}
