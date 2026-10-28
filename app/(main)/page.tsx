import { BtoExplorer } from '@/components/BtoExplorer';
import { JsonLd } from '@/components/JsonLd';
import { btoProjects } from '@/data/bto-projects';
import { DATA_CHECKED_DATE } from '@/data/sources';
import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME } from '@/lib/site';

export default function Page() {
  return <>
    <JsonLd value={[
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE_NAME,
        url: absoluteUrl('/'),
        description: SITE_DESCRIPTION,
        inLanguage: 'en-SG',
        dateModified: DATA_CHECKED_DATE,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: SITE_NAME,
        url: absoluteUrl('/'),
        description: SITE_DESCRIPTION,
        applicationCategory: 'LifestyleApplication',
        operatingSystem: 'Any',
        offers: { '@type': 'Offer', price: 0, priceCurrency: 'SGD' },
        featureList: [
          `${btoProjects.length} launched and announced BTO records`,
          'Four transparent comparison criteria',
          'Approximate 1 km amenity context',
          'Source-linked project facts',
        ],
      },
    ]} />
    <BtoExplorer />
  </>;
}
