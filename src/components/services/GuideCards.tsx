import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { getInsight } from '@/data/insights';
import { splitGuideTitle } from '@/data/event-guides';

/* 행사별 안내 카드 — 대표 사진 · 제목(두 줄) · 자세히 보기. 체험서비스 소개와 서비스 상세에서 함께 쓴다 */
export function GuideCards({ slugs, lang }: { slugs: string[]; lang: 'ko' | 'en' }) {
  const items = slugs.map((slug) => getInsight(slug)).filter((item) => item !== undefined);
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => {
        const [main, sub] = splitGuideTitle(item[lang].title);
        return (
          <li key={item.slug}>
            <Link
              href={`/insights/${item.slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
            >
              <div className="relative aspect-[16/10] bg-slate-100">
                {item.cover && (
                  <Image
                    src={item.cover.src}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                )}
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-lg font-bold leading-snug text-slate-900 group-hover:text-teal-700">{main}</h3>
                {sub && <p className="mt-1.5 text-sm leading-snug text-slate-500">{sub}</p>}
                <span className="mt-auto pt-4 text-sm font-semibold text-teal-700">
                  {lang === 'en' ? 'Prices, process and cases →' : '비용 · 진행 · 사례 보기 →'}
                </span>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
