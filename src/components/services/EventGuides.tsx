import { GUIDE_GROUPS } from '@/data/event-guides';
import { SectionHead } from './detail/SectionHead';
import { GuideCards } from './GuideCards';

/* 체험 서비스의 「행사별 안내」 — 인사이트에 있는 서비스 안내 페이지를 쓰임새별로 묶어 보여 준다 (주소는 /insights 그대로) */
export function EventGuides({ locale, no }: { locale: string; no?: string }) {
  const lang = locale === 'en' ? 'en' : 'ko';
  return (
    <section id="guides" className="scroll-mt-20 border-t border-paper/10 bg-ink" aria-labelledby="event-guides-heading">
      <div className="wrap section-y">
        <SectionHead
          id="event-guides-heading"
          no={no}
          label="EVENT GUIDES"
          en={['BY EVENT.']}
          ko={lang === 'ko' ? '행사별 안내' : undefined}
          aside={lang === 'en' ? 'Prices, how it runs on the day, and past events — one page per use.' : '쓰임새별 비용 · 현장 진행 · 운영 사례를 한 페이지씩 정리했습니다.'}
        />
        <div className="mt-14 space-y-16">
          {GUIDE_GROUPS.map((group) => (
            <div key={group.id}>
              <h3 className="mb-6 flex items-center gap-4 text-sm font-semibold text-paper/60">
                <span aria-hidden="true" className="h-px w-8 bg-accent" />
                {group.title[lang]}
              </h3>
              <GuideCards slugs={group.slugs} lang={lang} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
