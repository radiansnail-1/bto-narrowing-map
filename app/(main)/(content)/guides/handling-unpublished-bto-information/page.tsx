import { articleBundle } from '@/data/article-bundles';
import { LocalizedArticle, localizedArticleMetadata } from '@/components/LocalizedArticle';

const bundle = articleBundle('handling-unpublished-bto-information')!;
export const metadata = localizedArticleMetadata(bundle, 'en');
export default function UnknownDataGuidePage() { return <LocalizedArticle bundle={bundle} language="en" />; }
