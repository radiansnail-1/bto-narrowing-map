import Link from 'next/link';

const navigation = [
  { href: '/', label: 'Map' },
  { href: '/bto-projects', label: 'Projects' },
  { href: '/guides', label: 'Guides' },
  { href: '/faq', label: 'FAQ' },
  { href: '/methodology', label: 'Methodology' },
] as const;

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link className="site-wordmark" href="/" aria-label="Where To BTO home">
          <span>Where</span> To BTO
        </Link>
        <nav className="site-nav" aria-label="Main navigation">
          {navigation.map((item) => <Link href={item.href} key={item.href}>{item.label}</Link>)}
        </nav>
      </div>
    </header>
  );
}
