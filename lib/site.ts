export const SITE_NAME = 'Where To BTO';
export const SITE_DESCRIPTION = 'Compare Singapore BTO locations by commute, published prices, nearby amenities, and estimated waiting time using an interactive map and dated official sources.';

function withProtocol(value: string): string {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function resolveSiteUrl(): URL {
  const configured = process.env.NEXT_PUBLIC_SITE_URL
    ?? process.env.VERCEL_PROJECT_PRODUCTION_URL
    ?? process.env.VERCEL_URL;
  return new URL(configured ? withProtocol(configured) : 'http://localhost:3000');
}

/** Uses Vercel's stable production hostname automatically; a custom domain can override it. */
export const SITE_URL = resolveSiteUrl();

export function absoluteUrl(path = '/'): string {
  return new URL(path, SITE_URL).toString();
}
