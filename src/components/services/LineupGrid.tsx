import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { screensOf, type LineProgram } from '@/data/product-lines';
import { Reveal } from '@/components/fx';
import { cn } from '@/lib/utils';
import { LazyVideo } from '@/components/fx/LazyVideo';

/* 상품에 올릴 수 있는 프로그램 전체 — 실제 프로그램 첫 화면 타일. 마우스를 올리면 결과 화면으로 바뀐다.
   화면이 없는 프로그램은 이름만 둔다. 공개된 상세 페이지가 있는 것만 링크. */
export function LineupGrid({ programs, device, lang }: { programs: LineProgram[]; device: 'kiosk' | 'booth'; lang: 'ko' | 'en' }) {
  const ko = lang === 'ko';
  // 영상판 · 데모 첫 화면이 있는 것도 화면 타일로 (영상판은 결과 화면으로 바뀌지 않는다)
  const withScreen = programs.filter((p) => screensOf(p).start);
  const rest = programs.filter((p) => !screensOf(p).start);
  return (
    <div>
      <ul className={cn('grid gap-x-4 gap-y-9', device === 'kiosk' ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4')}>
        {withScreen.map((p, i) => {
          const s = screensOf(p);
          const body = (
            <>
              <span className={cn('relative block overflow-hidden border border-paper/15 bg-ink-2 transition-colors duration-500 group-hover:border-paper/50', device === 'kiosk' ? 'aspect-[9/16]' : 'aspect-video')}>
                {p.clip ? (
                  // 영상판은 실제 첫 화면 녹화가 돈다
                  <LazyVideo src={p.clip} poster={s.start} loop aria-label={`${p.name[lang]} — ${ko ? '프로그램 첫 화면' : 'program start screen'}`} className="absolute inset-0 h-full w-full object-cover object-top" />
                ) : (
  <Image src={s.start!} alt={`${p.name[lang]} — ${ko ? '프로그램 첫 화면' : 'program start screen'}`} fill sizes={device === 'kiosk' ? '(min-width: 1280px) 15vw, (min-width: 768px) 23vw, 45vw' : '(min-width: 1280px) 23vw, (min-width: 640px) 46vw, 92vw'} className="object-cover object-top" />
                )}
                {s.result && s.result !== s.start && (
                  <Image src={s.result} alt="" fill sizes={device === 'kiosk' ? '(min-width: 1280px) 15vw, 45vw' : '(min-width: 1280px) 23vw, 92vw'} loading="lazy" className="object-cover object-top opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100" />
                )}
              </span>
              <span className="mt-3 flex items-baseline gap-2">
                <span className="t-label !text-[0.62rem] text-accent">{String(i + 1).padStart(2, '0')}</span>
                <span className="min-w-0 flex-1 text-[0.98rem] font-bold leading-snug tracking-[-0.02em] text-paper">{p.name[lang]}</span>
                {p.href && <span aria-hidden="true" className="font-display text-sm text-paper/40 transition-all duration-500 group-hover:translate-x-1 group-hover:text-paper">→</span>}
              </span>
              {p.operated && <span className="mt-1 block pl-[1.55rem] text-[11px] text-paper/45">{ko ? '실제 행사 운영' : 'Run at real events'}</span>}
            </>
          );
          return (
            <li key={p.slug}>
              <Reveal delay={(i % 6) * 60}>
                {p.href ? <Link href={p.href} className="group block focus-visible:outline-2 focus-visible:outline-offset-4">{body}</Link> : <div className="group">{body}</div>}
              </Reveal>
            </li>
          );
        })}
      </ul>
      {rest.length > 0 && (
        <Reveal className="mt-12 flex flex-wrap gap-2.5 border-t border-paper/15 pt-8">
          {rest.map((p) =>
            p.href ? (
              <Link key={p.slug} href={p.href} className="rounded-full border border-paper/25 px-4 py-2 text-[0.92rem] text-paper/80 transition-colors hover:border-paper hover:text-paper">{p.name[lang]} <span aria-hidden="true">→</span></Link>
            ) : (
              <span key={p.slug} className="rounded-full border border-paper/15 px-4 py-2 text-[0.92rem] text-paper/55">{p.name[lang]}</span>
            ),
          )}
        </Reveal>
      )}
      {/* 포트폴리오와 같은 영상판 첫 화면 — 실제 영상판이 아직 없는 프로그램은 콘셉트 화면(제작 예정)이다 (2026-11-26) */}
      <p className="mt-8 text-xs text-paper/40">
        {programs.some((p) => p.concept)
          ? (ko ? '영상판 첫 화면 · 영상판을 만들고 있는 프로그램은 제작 예정 화면 예시입니다 · 화면 속 인물은 예시 인물입니다.' : 'Video-host start screens · programs whose video version is in production show an example screen · the person shown is a sample.')
          : (ko ? '실제 프로그램 화면 · 화면 속 인물은 예시 인물입니다.' : 'Actual program screens · the person shown is a sample · on-screen text is in Korean.')}
      </p>
    </div>
  );
}
