import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Analytics } from '@vercel/analytics/next';
import { hankenGrotesk } from '@/app/fonts';
import { ARTICLE_LANGUAGES, isArticleLanguage } from '@/data/article-bundles';
import { articleUi } from '@/components/LocalizedArticle';
import { SITE_NAME, SITE_URL } from '@/lib/site';
import '@/app/globals.css';

export const metadata: Metadata = { metadataBase: SITE_URL, title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` }, robots: { index: true, follow: true } };
export const dynamicParams = false;
export function generateStaticParams() { return ARTICLE_LANGUAGES.filter(language => language !== 'en').map(language => ({ language })); }
export default async function LocalizedLayout({ children, params }: { children: React.ReactNode; params: Promise<{ language: string }> }) {
  const { language } = await params;
  if (!isArticleLanguage(language) || language === 'en') notFound();
  const ui = articleUi[language];
  return <html lang={language} className={hankenGrotesk.variable}><body className={hankenGrotesk.className}>
    <div className="content-shell"><header className="site-header"><div className="site-header-inner"><Link className="site-wordmark" href="/"><span>Where</span> To BTO</Link><nav className="site-nav" aria-label={ui.guides}><Link href="/">{ui.map}</Link><Link href="/guides">{ui.guides}</Link></nav></div></header>
      {children}
      <footer className="content-footer"><div><strong>Where To BTO</strong><p>{ui.notice}</p></div><Link href="/sitemap.xml">{ui.sitemap}</Link></footer>
    </div><Analytics />
  </body></html>;
}
