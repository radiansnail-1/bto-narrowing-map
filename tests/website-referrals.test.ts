import { beforeEach, afterEach, expect, test, vi } from 'vitest';
import { trackWebsiteReferral } from '@/lib/website-referrals';

const canonicalOrigin = 'https://wheretobto.com';
const captured: Blob[] = [];
let saved: Map<string, string>;

function page(path: string, referrer = '', gpc = false, canonicalPath = path.split('?')[0]) {
  const location = new URL(path, canonicalOrigin);
  vi.stubGlobal('window', {
    location,
    crypto: { randomUUID: () => '7fdb3614-2513-4725-8138-0a5ae0038243' },
    sessionStorage: {
      getItem: (key: string) => saved.get(key),
      setItem: (key: string, value: string) => saved.set(key, value),
    },
  });
  vi.stubGlobal('document', { referrer, querySelector: (selector: string) =>
    selector.startsWith('link') ? { href: canonicalOrigin + canonicalPath } : null,
  });
  vi.stubGlobal('navigator', {
    globalPrivacyControl: gpc,
    sendBeacon: (_url: string, body: Blob) => { captured.push(body); return true; },
  });
}

beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_BTO_WEB_ANALYTICS_KEY', 'phc_test');
  vi.stubEnv('NEXT_PUBLIC_BTO_WEB_ANALYTICS_HOST', 'https://us.i.posthog.com');
  captured.length = 0;
  saved = new Map([['bto_website_referral_v1', '{}'], ['bto_website_referral_v1_verification', '{}']]);
});

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

test('a tagged landing and first successful shortlist action share the same tab and only allowed fields', async () => {
  page('/guides?utm_source=ChatGPT.com&budget=12345');
  trackWebsiteReferral('landing');
  trackWebsiteReferral('landing');
  page('/');
  trackWebsiteReferral('shortlist');
  trackWebsiteReferral('shortlist');
  const rows = await Promise.all(captured.map(async (body) => JSON.parse(await body.text())));
  expect(rows.map((row) => row.event)).toEqual(['web_ai_referral_landed', 'web_ai_referral_action']);
  expect(rows[1].properties).toMatchObject({
    $host: 'wheretobto.com', site_surface: 'public_website', acquisition_source: 'chatgpt',
    acquisition_signal: 'tag', landing_path: '/guides', action: 'shortlist', verification: false,
  });
  expect(rows[0].distinct_id).toBe(rows[1].distinct_id);
  expect(JSON.stringify(rows)).not.toMatch(/budget|12345|utm_source/);
});

test('referrers are exact-host matches and privacy, canonical and verification boundaries hold', async () => {
  page('/?utm_source=chatgpt.com.example', 'https://chatgpt.com.example/');
  trackWebsiteReferral('landing');
  page('/?utm_source=chatgpt.com', '', true);
  trackWebsiteReferral('landing');
  page('/does-not-exist?utm_source=chatgpt.com', '', false, '/');
  trackWebsiteReferral('landing');
  page('https://preview.example/?utm_source=chatgpt.com');
  trackWebsiteReferral('landing');
  expect(captured).toHaveLength(0);
  page('/?analytics_test=1', 'https://gemini.google.com/app');
  trackWebsiteReferral('landing');
  const row = JSON.parse(await captured[0].text());
  expect(row.properties).toMatchObject({ acquisition_source: 'gemini', acquisition_signal: 'referrer', verification: true });
  expect(saved.get('bto_website_referral_v1')).toBe('{}');
});
