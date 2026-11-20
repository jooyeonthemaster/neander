import { GUIDE_GROUPS } from '@/data/event-guides';
import { GuideCards } from './GuideCards';

/* 체험서비스 소개의 「행사별 안내」 — 인사이트에 있던 서비스 안내 페이지를 쓰임새별로 묶어 보여 준다 */
export function EventGuides({ locale }: { locale: string }) {
  const lang = locale === 'en' ? 'en' : 'ko';
  return (
    <section id="guides" className="scroll-mt-20 border-t border-slate-100 bg-white" aria-labelledby="event-guides-heading">
      <div className="section-padding">
        <div className="container-default">
          <div className="max-w-2xl">
            <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-[0.2em] text-teal-600">EVENT GUIDES</span>
            <h2 id="event-guides-heading" className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
              {lang === 'en' ? 'Guides by use' : '행사별 안내'}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-neutral-500 sm:text-lg">
              {lang === 'en'
                ? 'Prices, how it runs on the day, and past events, one page per use.'
                : '쓰임새별로 비용, 현장 진행, 운영 사례를 한 페이지씩 정리했습니다.'}
            </p>
          </div>
          <div className="mt-12 space-y-12">
            {GUIDE_GROUPS.map((group) => (
              <div key={group.id}>
                <h3 className="mb-5 text-sm font-semibold text-slate-500">{group.title[lang]}</h3>
                <GuideCards slugs={group.slugs} lang={lang} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
