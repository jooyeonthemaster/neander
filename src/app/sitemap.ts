import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { SITE_URL } from '@/lib/constants';
import { localePath } from '@/lib/seo';
import { getAllSlugs } from '@/data/experiences';
import { fetchPublishedPortfolio } from '@/lib/firebase/rest';
import { INSIGHTS } from '@/data/insights';

// 검색엔진에 알릴 공개 페이지. 숨은 페이지(formula-lab, demo/acscent)와 아직 기사가 없는 press는 뺀다.
const STATIC_PATHS: { path: string; priority: number }[] = [
  { path: '/', priority: 1 },
  { path: '/services', priority: 0.9 },
  { path: '/development', priority: 0.9 },
  { path: '/quote', priority: 0.9 },
  { path: '/portfolio', priority: 0.9 },
  { path: '/about', priority: 0.7 },
  { path: '/contact', priority: 0.8 },
  { path: '/experience', priority: 0.6 },
  { path: '/faq', priority: 0.5 },
  { path: '/insights', priority: 0.7 },
  { path: '/brochure', priority: 0.6 },
  { path: '/demo', priority: 0.5 },
  { path: '/demo/scent-quiz', priority: 0.4 },
  { path: '/demo/photo-booth', priority: 0.4 },
  { path: '/privacy', priority: 0.2 },
];

function entry(path: string, priority: number, lastModified?: string): MetadataRoute.Sitemap[number] {
  return {
    url: `${SITE_URL}${localePath(path, routing.defaultLocale)}`,
    lastModified: lastModified ? new Date(lastModified) : undefined,
    priority,
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, `${SITE_URL}${localePath(path, l)}`]),
      ),
    },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const portfolio = await fetchPublishedPortfolio();
  return [
    ...STATIC_PATHS.map(({ path, priority }) => entry(path, priority)),
    ...getAllSlugs().map((slug) => entry(`/services/${slug}`, 0.6)),
    ...INSIGHTS.map((item) => entry(`/insights/${item.slug}`, item.kind === 'landing' ? 0.8 : 0.7, item.date)),
    ...portfolio.map((item) => entry(`/portfolio/${item.slug}`, 0.6, item.updated_at || undefined)),
  ];
}
