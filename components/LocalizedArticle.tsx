import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';
import { ARTICLE_LANGUAGES, articleLanguages, articlePath, type ArticleBundle, type ArticleLanguage } from '@/data/article-bundles';
import { absoluteUrl } from '@/lib/site';

export const articleUi = {
  en: { map: 'Map', guides: 'Guides', language: 'Article language', updated: 'Updated', checked: 'Sources checked', next: 'Next reads', notice: 'The map, project pages and linked planning tools are in English. Confirm current project details and eligibility with HDB.', sitemap: 'Sitemap' },
  es: { map: 'Mapa', guides: 'Guías', language: 'Idioma del artículo', updated: 'Actualizado', checked: 'Fuentes revisadas', next: 'Lecturas relacionadas', notice: 'El mapa, las páginas de proyectos y las herramientas de planificación enlazadas están en inglés. Confirma con HDB los datos actuales del proyecto y los requisitos de acceso.', sitemap: 'Mapa del sitio' },
  fr: { map: 'Carte', guides: 'Guides', language: 'Langue de l’article', updated: 'Mis à jour', checked: 'Sources vérifiées', next: 'Pour poursuivre', notice: 'La carte, les pages des projets et les outils de planification liés sont en anglais. Vérifiez les informations actuelles du projet et les conditions d’éligibilité auprès de HDB.', sitemap: 'Plan du site' },
  de: { map: 'Karte', guides: 'Ratgeber', language: 'Sprache des Artikels', updated: 'Aktualisiert', checked: 'Quellen geprüft', next: 'Weiterlesen', notice: 'Die Karte, Projektseiten und verlinkten Planungshilfen sind auf Englisch. Prüfen Sie aktuelle Projektdaten und die Anspruchsvoraussetzungen bei HDB.', sitemap: 'Seitenübersicht' },
  'zh-Hans': { map: '地图', guides: '指南', language: '文章语言', updated: '更新日期', checked: '资料核查日期', next: '延伸阅读', notice: '地图、项目页面及链接的规划工具目前为英文。请向建屋发展局（HDB）确认最新项目资料及申请资格。', sitemap: '网站地图' },
};
export function localizedArticleMetadata(bundle: ArticleBundle, language: ArticleLanguage): Metadata {
  const copy = bundle.translations[language], path = articlePath(bundle.slug, language);
  return { title: copy.title, description: copy.description, alternates: { canonical: path, languages: { ...articleLanguages(bundle.slug), 'x-default': articlePath(bundle.slug) } }, openGraph: { title: copy.title, description: copy.description, url: path, type: 'article', publishedTime: bundle.publishedDate, modifiedTime: bundle.updatedDate, locale: language.replace('-', '_') } };
}
export function LocalizedArticle({ bundle, language }: { bundle: ArticleBundle; language: ArticleLanguage }) {
  const c = bundle.translations[language], ui = articleUi[language], path = articlePath(bundle.slug, language);
  const date = (value: string) => new Intl.DateTimeFormat(language, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`));
  return <>
    <JsonLd value={{ '@context': 'https://schema.org', '@type': 'Article', headline: c.title, description: c.description, inLanguage: language, datePublished: bundle.publishedDate, dateModified: bundle.updatedDate, mainEntityOfPage: absoluteUrl(path), publisher: { '@type': 'Organization', name: 'Where To BTO', url: absoluteUrl('/') } }} />
    <main className="content-main narrow-content" lang={language}>
      <nav className="breadcrumbs" aria-label={ui.guides}><Link href="/">{ui.map}</Link><span>/</span><Link href="/guides">{ui.guides}</Link><span>/</span><span>{c.category}</span></nav>
      <nav className="article-languages" aria-label={ui.language}>{ARTICLE_LANGUAGES.map(code => <Link key={code} href={articlePath(bundle.slug, code)} lang={code} hrefLang={code} aria-current={code === language ? 'page' : undefined}>{({ en: 'English', es: 'Español', fr: 'Français', de: 'Deutsch', 'zh-Hans': '简体中文' })[code]}</Link>)}</nav>
      <article><header className="content-hero"><h1>{c.title}</h1><p>{c.answer}</p><p className="data-line">{ui.updated} <time dateTime={bundle.updatedDate}>{date(bundle.updatedDate)}</time> · {ui.checked} <time dateTime={bundle.checkedDate}>{date(bundle.checkedDate)}</time></p></header>
        <div className="article-body">{c.sections.map(section => <section key={section.heading}><h2>{section.heading}</h2>{section.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}{section.sources && <p className="data-line">{section.sources.map((source, index) => <span key={source.href}>{index > 0 && ' · '}<a href={source.href} rel="noreferrer">{source.title} ↗</a></span>)}</p>}</section>)}</div>
        <aside className="content-callout"><h2>{c.callout.title}</h2><p>{c.callout.text}</p><Link className="primary-link" href={c.callout.href}>{c.callout.label}</Link></aside>
        <section className="article-next"><h2>{ui.next}</h2>{c.next.map(next => <Link href={next.href} key={next.href}>{next.title}<span>→</span></Link>)}</section>
      </article>
    </main>
  </>;
}
