export const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? 'ca-pub-8143877198625443';

export const ADSENSE_SLOTS = {
  article: process.env.NEXT_PUBLIC_ADSENSE_ARTICLE_SLOT,
  bottom: process.env.NEXT_PUBLIC_ADSENSE_BOTTOM_SLOT,
} as const;

export const ADSENSE_PREVIEW = process.env.NEXT_PUBLIC_ADSENSE_PREVIEW === 'true';
export const ADSENSE_HAS_LIVE_UNIT = Boolean(ADSENSE_SLOTS.article || ADSENSE_SLOTS.bottom);

export function publisherId(client = ADSENSE_CLIENT): string {
  return client.replace(/^ca-/, '');
}
