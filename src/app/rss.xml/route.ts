import { SITE_URL } from '@/lib/constants';
import { INSIGHTS } from '@/data/insights';
import { fetchPublishedPortfolio } from '@/lib/firebase/rest';

// /rss.xml — 네이버 서치어드바이저 「RSS 제출」용 새 글 목록 (한국어).
// 인사이트(가이드·구매 의도 랜딩)와 공개 포트폴리오 사례를 최신순으로 싣는다.
// 서치어드바이저는 RSS에 새 항목이 생기면 그 주소를 먼저 수집한다.
export const revalidate = 3600;

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

interface Item {
  title: string;
  link: string;
  description: string;
  date: Date | null;
  category: string;
}

function toDate(value: unknown): Date | null {
  if (!value) return null;
  const d = new Date(String(value));
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function GET() {
  const portfolio = await fetchPublishedPortfolio();

  const items: Item[] = [
    ...INSIGHTS.map((i) => ({
      title: i.ko.title,
      link: `${SITE_URL}/insights/${i.slug}`,
      description: i.ko.description,
      date: toDate(i.date),
      category: i.kind === 'landing' ? '서비스 안내' : '인사이트',
    })),
    ...portfolio.map((p) => ({
      title: p.title_ko,
      link: `${SITE_URL}/portfolio/${p.slug}`,
      description: p.description_ko ?? '',
      date: toDate(p.updated_at) ?? toDate(p.created_at),
      category: '포트폴리오',
    })),
  ]
    .filter((i) => i.title)
    .sort((a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0));

  const latest = items.find((i) => i.date)?.date ?? new Date();
  const body = items
    .map(
      (i) => `    <item>
      <title>${esc(i.title)}</title>
      <link>${esc(i.link)}</link>
      <guid isPermaLink="true">${esc(i.link)}</guid>
      <description>${esc(i.description)}</description>
      <category>${esc(i.category)}</category>${i.date ? `\n      <pubDate>${i.date.toUTCString()}</pubDate>` : ''}
    </item>`,
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>네안데르 NEANDER — 행사·팝업 AI 체험</title>
    <link>${SITE_URL}</link>
    <description>AI 향수 만들기·AI 포토부스·AI 키오스크 등 행사·팝업 AI 체험 안내와 운영 사례</description>
    <language>ko</language>
    <lastBuildDate>${latest.toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
${body}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
