import { describe, expect, it } from 'vitest';
import sitemap from '@/app/sitemap';
import { GET as getAdsTxt } from '@/app/ads.txt/route';
import { FAQ_ITEMS } from '@/data/faq';
import { btoProjects } from '@/data/bto-projects';
import { GUIDES } from '@/data/guides';

describe('crawlable site surface', () => {
  it('has one stable, URL-safe page slug per project', () => {
    const ids = btoProjects.map((project) => project.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  });

  it('publishes every project and core information page in the sitemap', () => {
    const entries = sitemap();
    const paths = entries.map((entry) => new URL(entry.url).pathname);
    expect(paths).toContain('/');
    expect(paths).toContain('/bto-projects');
    expect(paths).toContain('/faq');
    expect(paths).toContain('/methodology');
    expect(paths).toContain('/privacy');
    expect(paths).toContain('/ai-info');
    for (const guide of GUIDES) expect(paths).toContain(guide.href);
    for (const project of btoProjects) expect(paths).toContain(`/bto-projects/${project.id}`);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it('publishes a useful set of distinct guide pages', () => {
    expect(GUIDES.length).toBeGreaterThanOrEqual(5);
    expect(new Set(GUIDES.map((guide) => guide.href)).size).toBe(GUIDES.length);
    for (const guide of GUIDES) {
      expect(guide.title.length).toBeGreaterThan(18);
      expect(guide.description.length).toBeGreaterThan(80);
    }
  });

  it('publishes the AdSense seller declaration', async () => {
    const response = getAdsTxt();
    expect(response.headers.get('content-type')).toContain('text/plain');
    await expect(response.text()).resolves.toBe('google.com, pub-8143877198625443, DIRECT, f08c47fec0942fa0\n');
  });

  it('keeps FAQ questions distinct and substantive', () => {
    expect(FAQ_ITEMS.length).toBeGreaterThanOrEqual(8);
    expect(new Set(FAQ_ITEMS.map((item) => item.question)).size).toBe(FAQ_ITEMS.length);
    for (const item of FAQ_ITEMS) {
      expect(item.question.length).toBeGreaterThan(12);
      expect(item.answer.length).toBeGreaterThan(80);
    }
  });
});
