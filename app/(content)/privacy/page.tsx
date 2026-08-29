import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy and Advertising',
  description: 'How Where To BTO handles saved preferences, site measurement, advertising, cookies, and third-party services.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <main className="content-main narrow-content">
      <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Map</Link><span>/</span><span>Privacy</span></nav>
      <article>
        <header className="content-hero"><h1>Privacy and advertising</h1><p>What this site stores, what advertising providers may receive, and the choices available to you.</p><p className="data-line">Effective 29 Aug 2026</p></header>
        <div className="article-body privacy-body">
          <section><h2>Preferences saved on your device</h2><p>Where To BTO saves your map answers, filters, current view, and shortlist in your browser&apos;s local storage so you can continue later. This information stays on that device unless you clear the site data.</p></section>
          <section><h2>Google advertising</h2><p>This site may use Google AdSense to display advertisements. Google and its partners may use cookies or similar technologies to serve, measure, and limit ads. Depending on your region and consent choices, ads may be personalised or non-personalised.</p></section>
          <section><h2>Information used for ads</h2><p>Advertising providers may receive technical information such as your IP address, browser or device details, page viewed, approximate location derived from your IP address, and interactions with an ad. Where To BTO does not send your saved BTO answers or shortlist to Google for ad targeting.</p></section>
          <section><h2>Your choices</h2><p>You can manage Google ad personalisation in Google&apos;s ad settings, reject or change consent choices where a consent notice is shown, block or delete browser cookies, and clear this site&apos;s saved local data through your browser.</p></section>
          <section><h2>External links and sources</h2><p>Project pages link to HDB and other public sources. Those sites have their own privacy practices. Opening an external link leaves Where To BTO.</p></section>
          <section><h2>Questions</h2><p>This policy will be updated when advertising or measurement services change. Until a public contact channel is added, please do not submit personal information through the site.</p></section>
        </div>
      </article>
    </main>
  );
}
