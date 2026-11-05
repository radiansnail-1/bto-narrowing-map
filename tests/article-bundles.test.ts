import { describe, expect, it, vi } from 'vitest';
vi.mock('next/font/local', () => ({ default: () => ({ variable: 'font-test', className: 'font-test' }) }));
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ARTICLE_BUNDLES, ARTICLE_LANGUAGES, articlePath, loadArticleBundles, validateArticleBundle } from '@/data/article-bundles';
import { localizedArticleMetadata } from '@/components/LocalizedArticle';
import { generateStaticParams as englishParams } from '@/app/(main)/(content)/guides/[guide]/page';
import { generateStaticParams as localizedParams } from '@/app/(localized)/[language]/guides/[guide]/page';
import { generateStaticParams as languageParams } from '@/app/(localized)/[language]/layout';
import sitemap from '@/app/sitemap';
import snapshot from '@/data/official-data-snapshot.json';
import { projectById } from '@/data/bto-projects';
import { matchProject } from '@/lib/matching';
import type { ExplorerAnswers } from '@/lib/types';

const fixture = () => ({ ...structuredClone(ARTICLE_BUNDLES[0]), slug: 'new-five-language-fixture' });
describe('five-language article publishing', () => {
  it('loads a new complete bundle without imports, template changes or a 13-language catalog', () => {
    const b = fixture(), directory = mkdtempSync(join(tmpdir(), 'bto-article-'));
    try { writeFileSync(join(directory, `${b.slug}.json`), JSON.stringify(b)); expect(loadArticleBundles(directory)).toEqual([b]); }
    finally { rmSync(directory, { recursive: true }); }
  });
  it('rejects missing languages, English fallbacks, incomplete sections and unsafe links', () => {
    const missing = fixture(); delete (missing.translations as Partial<typeof missing.translations>).fr;
    expect(() => validateArticleBundle(missing)).toThrow(/complete en/);
    const repeated = fixture(); repeated.translations.fr = structuredClone(repeated.translations.en);
    expect(() => validateArticleBundle(repeated)).toThrow(/fallback/);
    const copiedDescription = fixture(); copiedDescription.translations.fr.description = copiedDescription.translations.en.description;
    expect(() => validateArticleBundle(copiedDescription)).toThrow(/fallback/);
    const copiedParagraph = fixture(); copiedParagraph.translations.fr.sections[0].paragraphs[0] = copiedParagraph.translations.en.sections[0].paragraphs[0];
    expect(() => validateArticleBundle(copiedParagraph)).toThrow(/fallback/);
    const partial = fixture(); partial.translations.es.sections.pop();
    expect(() => validateArticleBundle(partial)).toThrow(/section count/);
    const unsafe = fixture(); unsafe.translations.de.callout.href = 'https://user:password@example.com/';
    expect(() => validateArticleBundle(unsafe)).toThrow(/callout/);
    const badDate = fixture(); badDate.publishedDate = '2026-02-30';
    expect(() => validateArticleBundle(badDate)).toThrow(/invalid publishedDate/);
  });
  it('routes a new article in all five languages with self canonicals and reciprocal alternates', () => {
    const b = fixture(); ARTICLE_BUNDLES.push(b);
    try {
      expect(englishParams()).toContainEqual({ guide: b.slug });
      expect(localizedParams()).toContainEqual({ guide: b.slug });
      expect(languageParams()).toEqual(ARTICLE_LANGUAGES.filter(language => language !== 'en').map(language => ({ language })));
      for (const language of ARTICLE_LANGUAGES) {
        const metadata = localizedArticleMetadata(b, language);
        expect(metadata.alternates?.canonical).toBe(articlePath(b.slug, language));
        expect(metadata.title).toBe(b.translations[language].title);
        expect(metadata.alternates?.languages).toEqual({ ...Object.fromEntries(ARTICLE_LANGUAGES.map(code => [code, articlePath(b.slug, code)])), 'x-default': articlePath(b.slug) });
      }
    } finally { ARTICLE_BUNDLES.pop(); }
  });
  it('keeps the existing English guide once and adds each translated canary to the sitemap', () => {
    const b = ARTICLE_BUNDLES.find(bundle => bundle.slug === 'handling-unpublished-bto-information')!, entries = sitemap();
    for (const language of ARTICLE_LANGUAGES) expect(entries.filter(entry => new URL(entry.url).pathname === articlePath(b.slug, language))).toHaveLength(1);
    expect(new Set(entries.map(entry => entry.url)).size).toBe(entries.length);
    expect(b.publishedDate).toBe('2026-08-29'); expect(b.checkedDate).toBe('2026-08-29');
  });
});

describe('November 2026 launch reconciliation', () => {
  it('uses the published wait while unverified price and location remain unknown after launch', () => {
    const answers: ExplorerAnswers = { workHubIds: [], customWorkplace: [0, 0], maxBudget: 600000, flatType: '4-room', amenityGroups: [], waitingBand: 'soon' };
    const anchor = projectById.get('nov-2026-sembawang-unnamed')!;
    expect(anchor.name).toBe('Sembawang Anchor');
    expect(anchor.estimatedWaitingTimeMonths).toBe(34);
    expect(anchor.classification).toBe('Standard');
    expect(matchProject(anchor, answers)).toMatchObject({ waiting: 'pass', budget: 'unknown', commute: 'unknown' });
    for (const id of ['nov-2026-bayshore-oasis', 'nov-2026-tengah-unnamed']) {
      const project = projectById.get(id)!;
      expect(project.estimatedWaitingTimeMonths).toBe(38);
      expect(matchProject(project, answers).waiting).toBe('miss');
      expect(matchProject(project, { ...answers, waitingBand: 'mid' }).waiting).toBe('pass');
      expect(project.classification).toBe(id === 'nov-2026-bayshore-oasis' ? 'Plus' : 'Standard');
      expect(project.position).toBeNull();
      expect(project.flatTypes.every(flat => flat.minPrice === null && flat.maxPrice === null)).toBe(true);
      expect(project.flatTypes.map(flat => flat.units)).toEqual(id === 'nov-2026-bayshore-oasis' ? [null, null] : [178, 84, 168, null, null]);
      expect(project.launchStatus).toBe('launched');
      expect(project.launchDate).toBe('2026-11-04');
    }
    expect(projectById.get('nov-2026-bedok-unnamed')!.estimatedWaitingTimeMonths).toBeNull();
    expect(projectById.get('nov-2026-bedok-unnamed')!.name).toBe('Bayshore Sails');
    expect(projectById.get('nov-2026-bedok-unnamed')!.name).not.toBe(projectById.get('nov-2026-bayshore-oasis')!.name);
  });
  it('keeps an independently specified pre-launch unknown fixture neutral', () => {
    const announced = {
      ...projectById.get('nov-2026-sembawang-unnamed')!,
      launchStatus: 'announced_upcoming' as const,
      launchDate: '2026-11',
      classification: null,
      position: null,
      estimatedWaitingTimeMonths: null,
      flatTypes: [{ type: '4-room' as const, minPrice: null, maxPrice: null, units: null, estimatedFloorAreaSqm: null, estimatedInternalFloorAreaSqm: null }],
    };
    const answers: ExplorerAnswers = { workHubIds: [], customWorkplace: [0, 0], maxBudget: 600000, flatType: '4-room', amenityGroups: [], waitingBand: 'soon' };
    expect(matchProject(announced, answers)).toMatchObject({ waiting: 'unknown', budget: 'unknown', commute: 'unknown', missCount: 0 });
    expect(announced.classification).toBeNull();
    expect(announced.launchStatus).toBe('announced_upcoming');
  });
  it('separates exact launch CCA counts, sale units and earlier rental estimates without advancing the full audit', () => {
    const project = projectById.get('nov-2026-toa-payoh-west-caldecott')!;
    expect(project.name).toBe('Toa Payoh Hillside');
    expect(project.flatTypes.find(flat => flat.type === 'Community Care Apartment (CCA)')!.units).toBe(256);
    expect(project.approxBtoUnits).toBe(592 + 584 + 256);
    expect(project.publicRentalUnitsApprox).toBe(230);
    expect(project.estimatedWaitingTimeMonths).toBeNull();
    expect(project.classification).toBe('Prime');
    expect(project.coordinateAccuracy).toContain('not the project centroid');
    expect(snapshot.lastAuditDate).toBe('2026-08-28');
    expect(snapshot.scope.projectCount).toBe(snapshot.projects.length);
    expect(snapshot.projects.find(record => record.id === 'nov-2026-geylang-unnamed')!.checkedDate).toBe('2026-11-05');
    expect(snapshot.projects.find(record => record.id === 'sembawang-voyage')!.checkedDate).toBe('2026-08-27');
  });
});
