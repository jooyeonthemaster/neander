import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { getInsight } from '@/data/insights';
import { splitGuideTitle } from '@/data/event-guides';
import { Reveal } from '@/components/fx';

/* 행사별 안내 카드 — 대표 사진 · 제목(두 줄) · 자세히 보기. 체험 서비스와 서비스 상세에서 함께 쓴다 */
export function GuideCards({ slugs, lang }: { slugs: string[]; lang: 'ko' | 'en' }) {
  const items = slugs.map((slug) => getInsight(slug)).filter((item) => item !== undefined);
  return (
    <ul className="grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, i) => {
        const [main, sub] = splitGuideTitle(item[lang].title);
        return (
          <li key={item.slug}>
            <Reveal delay={i * 80} className="h-full">
              <Link href={`/insights/${item.slug}`} data-cursor="READ" className="group flex h-full flex-col focus-visible:outline-2 focus-visible:outline-offset-4">
                <div className="relative aspect-[16/10] overflow-hidden bg-ink-2">
                  {item.cover && (
                    <Image
                      src={item.cover.src}
                      alt={item.cover.caption[lang] || item[lang].title}
                      fill
                      sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 92vw"
                      className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
                    />
                  )}
                </div>
                <div className="flex flex-1 flex-col border-b border-paper/15 pb-5 pt-4 transition-colors duration-500 group-hover:border-paper/60">
                  <h3 className="t-kr-title text-[1.2rem] text-paper">{main}</h3>
                  {sub && <p className="mt-1.5 text-[0.92rem] leading-snug text-paper/55">{sub}</p>}
                  <span className="t-label mt-auto inline-flex items-center gap-2 pt-4 !text-[0.66rem] text-paper/60 transition-colors group-hover:text-accent">
                    {lang === 'en' ? 'PRICES · PROCESS · CASES' : '비용 · 진행 · 사례'} <span aria-hidden="true" className="transition-transform duration-500 group-hover:translate-x-1.5">→</span>
                  </span>
                </div>
              </Link>
            </Reveal>
          </li>
        );
      })}
    </ul>
  );
}
