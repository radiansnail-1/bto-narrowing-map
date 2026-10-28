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
    const b = ARTICLE_BUNDLES[0], entries = sitemap();
    for (const language of ARTICLE_LANGUAGES) expect(entries.filter(entry => new URL(entry.url).pathname === articlePath(b.slug, language))).toHaveLength(1);
    expect(new Set(entries.map(entry => entry.url)).size).toBe(entries.length);
    expect(b.publishedDate).toBe('2026-08-29'); expect(b.checkedDate).toBe('2026-08-29');
  });
});
