import type { MetadataRoute } from 'next';
import { btoProjects } from '@/data/bto-projects';
import { GUIDES } from '@/data/guides';
import { DATA_CHECKED_DATE } from '@/data/sources';
import { absoluteUrl } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const dataDate = new Date(`${DATA_CHECKED_DATE}T00:00:00Z`);
  const editorialDate = new Date('2026-08-29T00:00:00Z');
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/'), lastModified: dataDate, changeFrequency: 'weekly', priority: 1 },
    { url: absoluteUrl('/bto-projects'), lastModified: dataDate, changeFrequency: 'weekly', priority: 0.9 },
    { url: absoluteUrl('/guides'), lastModified: editorialDate, changeFrequency: 'monthly', priority: 0.7 },
    ...GUIDES.map((guide) => ({ url: absoluteUrl(guide.href), lastModified: editorialDate, changeFrequency: 'monthly' as const, priority: 0.8 })),
    { url: absoluteUrl('/faq'), lastModified: editorialDate, changeFrequency: 'monthly', priority: 0.7 },
    { url: absoluteUrl('/methodology'), lastModified: dataDate, changeFrequency: 'monthly', priority: 0.7 },
    { url: absoluteUrl('/privacy'), lastModified: editorialDate, changeFrequency: 'yearly', priority: 0.3 },
    { url: absoluteUrl('/ai-info'), lastModified: dataDate, changeFrequency: 'monthly', priority: 0.5 },
  ];
  return [
    ...staticRoutes,
    ...btoProjects.map((project) => ({
      url: absoluteUrl(`/bto-projects/${project.id}`),
      lastModified: new Date(`${project.checkedDate}T00:00:00Z`),
      changeFrequency: 'weekly' as const,
      priority: project.launchStatus === 'launched' ? 0.8 : 0.65,
    })),
  ];
}
