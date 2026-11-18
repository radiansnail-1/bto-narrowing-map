import { SITE_URL } from '@/lib/site';

const aiDomains = new Map([
  ['chatgpt.com', 'chatgpt'], ['www.chatgpt.com', 'chatgpt'], ['chat.openai.com', 'chatgpt'],
  ['perplexity.ai', 'perplexity'], ['www.perplexity.ai', 'perplexity'], ['claude.ai', 'claude'],
  ['gemini.google.com', 'gemini'], ['copilot.microsoft.com', 'copilot'], ['grok.com', 'grok'],
  ['www.grok.com', 'grok'], ['poe.com', 'poe'], ['www.poe.com', 'poe'], ['meta.ai', 'meta_ai'],
  ['www.meta.ai', 'meta_ai'], ['chat.mistral.ai', 'mistral'],
]);
const aiProviders = new Set(aiDomains.values());
const storageKey = 'bto_website_referral_v1';
const sessionTimeout = 30 * 60 * 1000;

type ReferralSession = {
  id: string;
  source: string;
  signal: 'tag' | 'referrer';
  path: string;
  lastSeen: number;
  landingSent: boolean;
  shortlistSent: boolean;
};

let memory: { key: string; session: ReferralSession } | undefined;

function send(event: string, session: ReferralSession, page: URL, verification: boolean) {
  const projectToken = process.env.NEXT_PUBLIC_BTO_WEB_ANALYTICS_KEY;
  const host = process.env.NEXT_PUBLIC_BTO_WEB_ANALYTICS_HOST;
  if (!/^phc_[a-zA-Z0-9]+$/.test(projectToken || '') || host !== 'https://us.i.posthog.com') return;

  const endpoint = `${host}/i/v0/e/`;
  const body = JSON.stringify({
    api_key: projectToken,
    distinct_id: `bto_web_${session.id}`,
    event,
    properties: {
      $process_person_profile: false,
      $is_identified: false,
      $geoip_disable: true,
      $session_id: session.id,
      $host: page.hostname,
      site_surface: 'public_website',
      verification,
      acquisition_source: session.source,
      acquisition_signal: session.signal,
      landing_path: session.path,
      ...(event === 'web_ai_referral_action' ? { action: 'shortlist' } : {}),
    },
  });
  try {
    if (navigator.sendBeacon?.(endpoint, new Blob([body], { type: 'application/json' }))) return;
    void fetch(endpoint, { method: 'POST', body, headers: { 'Content-Type': 'application/json' }, keepalive: true, credentials: 'omit' }).catch(() => {});
  } catch {}
}

export function trackWebsiteReferral(action: 'landing' | 'shortlist') {
  const page = new URL(window.location.href);
  const privacy = navigator as Navigator & { globalPrivacyControl?: boolean };
  const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href;
  if (page.origin !== SITE_URL.origin || canonical !== `${page.origin}${page.pathname}` ||
      document.querySelector('meta[name="robots"]')?.getAttribute('content')?.includes('noindex') ||
      privacy.globalPrivacyControl === true || ['1', 'yes'].includes(String(navigator.doNotTrack).toLowerCase()) ||
      typeof window.crypto?.randomUUID !== 'function') return;

  const verification = page.searchParams.get('analytics_test') === '1';
  const key = verification ? `${storageKey}_verification` : storageKey;
  let session = memory?.key === key ? memory.session : undefined;
  try { session = JSON.parse(window.sessionStorage.getItem(key) || 'null') || session; } catch {}
  const now = Date.now();
  if (session && (!/^[a-f0-9-]{36}$/.test(session.id) || !aiProviders.has(session.source) ||
      !/^\/(?!\/)[^?#]*$/.test(session.path) || !['tag', 'referrer'].includes(session.signal) ||
      !(session.lastSeen <= now && now - session.lastSeen < sessionTimeout))) session = undefined;

  const tag = page.searchParams.get('utm_source')?.trim().toLowerCase() || '';
  const tagSource = aiDomains.get(tag) || (aiProviders.has(tag) ? tag : undefined);
  let referrerSource;
  try { referrerSource = aiDomains.get(new URL(document.referrer).hostname); } catch {}
  const incoming = tagSource || referrerSource;
  if (incoming && (!session || incoming !== session.source)) {
    session = {
      id: window.crypto.randomUUID(), source: incoming, signal: tagSource ? 'tag' : 'referrer',
      path: page.pathname, lastSeen: now, landingSent: false, shortlistSent: false,
    };
  }
  if (!session) return;
  if (tagSource) session.signal = 'tag';
  session.lastSeen = now;
  if (!session.landingSent) {
    session.landingSent = true;
    send('web_ai_referral_landed', session, page, verification);
  }
  if (action === 'shortlist' && !session.shortlistSent) {
    session.shortlistSent = true;
    send('web_ai_referral_action', session, page, verification);
  }
  memory = { key, session };
  try { window.sessionStorage.setItem(key, JSON.stringify(session)); } catch {}
}
