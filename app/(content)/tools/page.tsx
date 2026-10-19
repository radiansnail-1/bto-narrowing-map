import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'BTO Calculators and Planning Tools',
  description: 'Choose between an illustrative Deferred Income Assessment calculator and a month-by-month BTO cash and CPF funding roadmap.',
  alternates: { canonical: '/tools' },
  openGraph: {
    title: 'BTO Calculators and Planning Tools | Where To BTO',
    description: 'Choose the BTO planning tool for your question: a DIA payment illustration or a cash and CPF funding roadmap.',
    url: '/tools',
  },
};

export default function ToolsPage() {
  return <main className="content-main narrow-content">
    <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Map</Link><span>/</span><span>Calculators</span></nav>
    <header className="content-hero"><h1>BTO calculators and planning tools</h1><p>Choose the tool that matches the question you are trying to answer. Both show assumptions; neither checks eligibility or predicts HDB approval.</p></header>
    <section className="content-section">
      <h2>Explore a Deferred Income Assessment payment scenario</h2>
      <p>The DIA calculator illustrates selected downpayment, CPF, grant, future loan and cash-at-keys assumptions for an eligible uncompleted BTO scenario. It does not assess whether your household qualifies.</p>
      <Link className="primary-link" href="/tools/dia-calculator">Open the DIA calculator</Link>
    </section>
    <section className="content-section">
      <h2>Plan cash and CPF across the purchase timeline</h2>
      <p>The funding roadmap lays out assumed savings and payments from booking through key collection, with renovation, reserves and loan repayments. Use your own documents and figures; the projection is not a loan offer or affordability decision.</p>
      <Link className="primary-link" href="/tools/bto-roadmap">Open the BTO funding roadmap</Link>
    </section>
    <aside className="content-callout"><h2>Start with location and project facts</h2><p>Compare announced and launched projects, then check each published fact against HDB before making a decision.</p><Link className="secondary-link" href="/bto-projects">Browse the English project directory</Link>{' '}<Link className="secondary-link" href="/">Open the English interactive map</Link></aside>
  </main>;
}
