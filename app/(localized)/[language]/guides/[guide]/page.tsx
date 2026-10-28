import { notFound } from 'next/navigation';
import { ARTICLE_BUNDLES, articleBundle, isArticleLanguage } from '@/data/article-bundles';
import { LocalizedArticle, localizedArticleMetadata } from '@/components/LocalizedArticle';

interface Props { params: Promise<{ language: string; guide: string }> }
export const dynamicParams = false;
export function generateStaticParams() { return ARTICLE_BUNDLES.map(bundle => ({ guide: bundle.slug })); }
export async function generateMetadata({ params }: Props) {
  const { language, guide } = await params, bundle = articleBundle(guide);
  if (!bundle || !isArticleLanguage(language) || language === 'en') return {};
  return localizedArticleMetadata(bundle, language);
}
export default async function ArticlePage({ params }: Props) {
  const { language, guide } = await params, bundle = articleBundle(guide);
  if (!bundle || !isArticleLanguage(language) || language === 'en') notFound();
  return <LocalizedArticle bundle={bundle} language={language} />;
}
