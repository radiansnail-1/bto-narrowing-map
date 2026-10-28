import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { REDDIT_GUIDES } from './reddit-guides';

export const ARTICLE_LANGUAGES = ['en', 'es', 'fr', 'de', 'zh-Hans'] as const;
export type ArticleLanguage = typeof ARTICLE_LANGUAGES[number];
export const LEGACY_ARTICLE_SLUGS = ['start-here', 'how-to-choose-a-bto-location', 'comparing-bto-commutes', 'checking-amenities-near-a-bto', 'understanding-bto-price-and-wait-data', 'handling-unpublished-bto-information'];
export interface ArticleCopy {
  category: string; title: string; description: string; answer: string;
  sections: { heading: string; paragraphs: string[]; sources?: { title: string; href: string }[] }[];
  callout: { title: string; text: string; href: string; label: string };
  next: { title: string; href: string }[];
}
export interface ArticleBundle {
  slug: string; publishedDate: string; checkedDate: string; updatedDate: string;
  translations: Record<ArticleLanguage, ArticleCopy>;
}
const requiredText = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;
const normalizedText = (value: string) => value.replace(/\s+/g, ' ').trim();
function translatedText(value: string, english: string, context: string) {
  const original = normalizedText(english);
  if (original.length >= 20 && normalizedText(value) === original) throw Error(`${context}: copied English fallback text`);
}
const safeHref = (value: unknown) => requiredText(value) && (/^\/(?!\/)[^\\\s]*$/.test(value) || (() => { try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password; } catch { return false; } })());
export function validateArticleBundle(value: unknown): asserts value is ArticleBundle {
  const b = value as ArticleBundle;
  if (!b || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(b.slug)) throw Error('Article bundle requires a URL-safe slug');
  for (const key of ['publishedDate', 'checkedDate', 'updatedDate'] as const) if (!/^\d{4}-\d{2}-\d{2}$/.test(b[key]) || !Number.isFinite(Date.parse(b[key])) || new Date(b[key]).toISOString().slice(0, 10) !== b[key]) throw Error(`Article ${b.slug}: invalid ${key}`);
  if (b.updatedDate < b.publishedDate) throw Error(`Article ${b.slug}: updated date precedes publication`);
  if (!b.translations || Object.keys(b.translations).sort().join(',') !== [...ARTICLE_LANGUAGES].sort().join(',')) throw Error(`Article ${b.slug}: complete en/es/fr/de/zh-Hans translations required`);
  const bodies = new Set<string>();
  for (const language of ARTICLE_LANGUAGES) {
    const c = b.translations[language];
    if (!c || ![c.category, c.title, c.description, c.answer].every(requiredText) || !Array.isArray(c.sections) || !c.sections.length) throw Error(`Article ${b.slug}/${language}: missing article copy`);
    if (!c.sections.every(s => requiredText(s.heading) && Array.isArray(s.paragraphs) && s.paragraphs.length && s.paragraphs.every(requiredText) && (!s.sources || s.sources.every(source => requiredText(source.title) && safeHref(source.href))))) throw Error(`Article ${b.slug}/${language}: incomplete sections or source links`);
    if (!c.callout || ![c.callout.title, c.callout.text, c.callout.label].every(requiredText) || !safeHref(c.callout.href) || !Array.isArray(c.next) || !c.next.every(n => requiredText(n.title) && safeHref(n.href))) throw Error(`Article ${b.slug}/${language}: incomplete callout or navigation`);
    const body = c.sections.flatMap(s => [s.heading, ...s.paragraphs]).join(' ').replace(/\s+/g, ' ').trim();
    if (body.length < 300 || bodies.has(body)) throw Error(`Article ${b.slug}/${language}: empty or repeated English fallback body`);
    bodies.add(body);
    if (language !== 'en' && c.sections.length !== b.translations.en.sections.length) throw Error(`Article ${b.slug}/${language}: section count differs from English`);
    if (language !== 'en') {
      const en = b.translations.en, context = `Article ${b.slug}/${language}`;
      for (const field of ['category', 'title', 'description', 'answer'] as const) translatedText(c[field], en[field], context);
      c.sections.forEach((s, i) => {
        const original = en.sections[i];
        if (s.paragraphs.length !== original.paragraphs.length || JSON.stringify((s.sources || []).map(v => v.href)) !== JSON.stringify((original.sources || []).map(v => v.href))) throw Error(`${context}: paragraphs or citation URLs differ from English`);
        translatedText(s.heading, original.heading, context);
        s.paragraphs.forEach((paragraph, j) => translatedText(paragraph, original.paragraphs[j], context));
      });
      for (const field of ['title', 'text', 'label'] as const) translatedText(c.callout[field], en.callout[field], context);
      if (c.callout.href !== en.callout.href || c.next.length !== en.next.length || c.next.some((n, i) => n.href !== en.next[i].href)) throw Error(`${context}: navigation targets differ from English`);
      c.next.forEach((n, i) => translatedText(n.title, en.next[i].title, context));
    }
  }
}
export function loadArticleBundles(directory = join(process.cwd(), 'data/article-bundles')): ArticleBundle[] {
  const bundles = readdirSync(directory).filter(name => name.endsWith('.json')).sort().map(name => {
    const value: unknown = JSON.parse(readFileSync(join(directory, name), 'utf8'));
    validateArticleBundle(value);
    if (name !== `${value.slug}.json`) throw Error(`Article bundle filename must match slug: ${name}`);
    return value;
  });
  if (new Set(bundles.map(v => v.slug)).size !== bundles.length) throw Error('Duplicate article bundle slug');
  for (const b of bundles) if ((REDDIT_GUIDES.some(v => v.slug === b.slug) || LEGACY_ARTICLE_SLUGS.includes(b.slug)) && b.slug !== 'handling-unpublished-bto-information') throw Error(`Existing English article already owns slug ${b.slug}`);
  return bundles;
}
export const ARTICLE_BUNDLES = loadArticleBundles();
export const articlePath = (slug: string, language: ArticleLanguage = 'en') => `${language === 'en' ? '' : `/${language}`}/guides/${slug}`;
export const articleLanguages = (slug: string) => Object.fromEntries(ARTICLE_LANGUAGES.map(language => [language, articlePath(slug, language)]));
export const articleBundle = (slug: string) => ARTICLE_BUNDLES.find(article => article.slug === slug);
export function isArticleLanguage(value: string): value is ArticleLanguage { return ARTICLE_LANGUAGES.includes(value as ArticleLanguage); }
