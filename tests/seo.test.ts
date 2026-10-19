import { describe, expect, it } from 'vitest';
import sitemap from '@/app/sitemap';
import { FAQ_ITEMS } from '@/data/faq';
import { btoProjects } from '@/data/bto-projects';
import { GUIDES } from '@/data/guides';
import { REDDIT_GUIDES } from '@/data/reddit-guides';
import { metadata as chineseMetadata } from '@/app/(content)/zh/page';
import { metadata as toolsMetadata } from '@/app/(content)/tools/page';

describe('crawlable site surface', () => {
  it('has one stable, URL-safe page slug per project', () => {
    const ids = btoProjects.map((project) => project.id);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  });

  it('publishes every project and core information page in the sitemap', () => {
    const entries = sitemap();
    const paths = entries.map((entry) => new URL(entry.url).pathname);
    expect(paths).toContain('/');
    expect(paths).toContain('/bto-projects');
    expect(paths).toContain('/faq');
    expect(paths).toContain('/methodology');
    expect(paths).toContain('/ai-info');
    expect(paths).toContain('/tools/dia-calculator');
    expect(paths).toContain('/tools/bto-roadmap');
    expect(paths).toContain('/tools');
    expect(paths).toContain('/zh');
    for (const guide of GUIDES) expect(paths).toContain(guide.href);
    for (const project of btoProjects) expect(paths).toContain(`/bto-projects/${project.id}`);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it('keeps the Chinese entry and calculator chooser discoverable with honest metadata', () => {
    const entries = sitemap();
    const paths = entries.map((entry) => new URL(entry.url).pathname);
    expect(paths).toContain('/zh');
    expect(paths).toContain('/tools');
    expect(chineseMetadata.alternates?.canonical).toBe('/zh');
    expect(chineseMetadata.alternates?.languages).toMatchObject({ 'en-SG': '/', 'zh-Hans': '/zh' });
    expect(chineseMetadata.openGraph).toMatchObject({ locale: 'zh_CN', url: '/zh' });
    expect(toolsMetadata.alternates?.canonical).toBe('/tools');
    expect(toolsMetadata.title).toContain('BTO Calculators');
  });

  it('keeps guide URLs distinct and copy nonempty', () => {
    expect(new Set(GUIDES.map((guide) => guide.href)).size).toBe(GUIDES.length);
    for (const guide of GUIDES) {
      expect(guide.title.trim()).not.toBe('');
      expect(guide.description.trim()).not.toBe('');
    }
  });

  it('keeps the OA reserve guide dated, sourced and included exactly once', () => {
    const guide = REDDIT_GUIDES.find(({ slug }) => slug === 'cpf-oa-reserve-for-bto');
    expect(guide).toBeDefined();
    expect(guide?.publishedDate).toBe('2026-10-19');
    expect(guide?.checkedDate).toBe('2026-10-19');
    expect(guide?.sections).toHaveLength(5);
    const sources = guide?.sections.flatMap(section => section.sources ?? []) ?? [];
    expect(sources).toHaveLength(6);
    for (const source of sources) expect(new URL(source.href).hostname).toBe('www.cpf.gov.sg');
    const path = '/guides/cpf-oa-reserve-for-bto';
    expect(GUIDES.filter(guide => guide.href === path)).toHaveLength(1);
    const entries = sitemap().filter(entry => new URL(entry.url).pathname === path);
    expect(entries).toHaveLength(1);
    expect(entries[0].lastModified).toEqual(new Date('2026-10-19T00:00:00Z'));
    expect(REDDIT_GUIDES.find(({ slug }) => slug === 'november-2026-bto-hfe-checklist')?.publishedDate).toBe('2026-10-18');
    expect(REDDIT_GUIDES.find(({ slug }) => slug === 'bto-cash-cpf-payment-timeline')?.publishedDate).toBeUndefined();
  });

  it('keeps FAQ questions distinct and answers nonempty', () => {
    expect(new Set(FAQ_ITEMS.map((item) => item.question)).size).toBe(FAQ_ITEMS.length);
    for (const item of FAQ_ITEMS) {
      expect(item.question.trim()).not.toBe('');
      expect(item.answer.trim()).not.toBe('');
    }
  });
});
