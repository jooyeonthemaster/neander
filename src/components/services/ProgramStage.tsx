'use client';

import { useEffect, useRef, useState } from 'react';
import { Link } from '@/i18n/navigation';
import { screensOf, type LineProgram } from '@/data/product-lines';
import { cn } from '@/lib/utils';
import { BoothFrame, KioskFrame } from './DeviceFrame';

/* ─────────────────────────────────────────────────────────
   기기 한 대 + 프로그램 목록. 프로그램에 마우스를 올리면(휴대폰은 저절로)
   기기 화면이 그 프로그램의 첫 화면 → 결과 화면으로 바뀐다. 포토부스는 결과에서 인화물이 나온다.
   화면 속 인물은 가상 예시 인물이라 아래에 밝힌다.
   ───────────────────────────────────────────────────────── */

const CYCLE_MS = 3800;
/** 지금 시각 (마우스를 올린 뒤 잠시 자동 넘김을 멈추는 데 쓴다) */
const clock = () => Date.now();
const RESULT_AFTER_MS = 1500;

interface ProgramStageProps {
  device: 'kiosk' | 'booth';
  /** 결과 화면까지 있는 프로그램 (stagePrograms 로 거른 목록) */
  programs: LineProgram[];
  lang: 'ko' | 'en';
  /** 목록에 보일 개수 */
  limit?: number;
  className?: string;
  deviceClassName?: string;
}

export function ProgramStage({ device, programs, lang, limit = 7, className, deviceClassName }: ProgramStageProps) {
  const list = programs.slice(0, limit);
  const [active, setActive] = useState(0);
  // 결과 화면을 보여 주는 프로그램 번호 — 프로그램이 바뀌면 저절로 첫 화면(0)부터 다시 시작한다
  const [resultFor, setResultFor] = useState<number | null>(null);
  const phase: 0 | 1 = resultFor === active ? 1 : 0;
  const hold = useRef(0);
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const ko = lang === 'ko';

  // 화면에 보일 때만 돌린다
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // 첫 화면 → 잠시 뒤 결과 화면
  useEffect(() => {
    const id = window.setTimeout(() => setResultFor(active), RESULT_AFTER_MS);
    return () => window.clearTimeout(id);
  }, [active]);

  // 저절로 다음 프로그램으로 (마우스를 올린 동안과 그 직후에는 멈춘다)
  useEffect(() => {
    if (!inView || list.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => {
      if (clock() < hold.current) return;
      setActive((i) => (i + 1) % list.length);
    }, CYCLE_MS);
    return () => window.clearInterval(id);
  }, [inView, list.length]);

  function choose(i: number) {
    hold.current = clock() + 9000;
    setActive(i);
  }

  // 영상판은 결과도 같은 장면이라 첫 화면과 같은 그림이 두 번 들어간다 (DeviceFrame 의 key 는 순번을 함께 쓴다)
  const screens = list.flatMap((p) => {
    const s = screensOf(p);
    return [
      { src: s.start!, video: p.clip, alt: `${p.name[lang]} — ${ko ? '첫 화면' : 'start screen'}` },
      { src: s.result!, video: p.clip, alt: `${p.name[lang]} — ${ko ? '결과 화면' : 'result screen'}` },
    ];
  });
  const current = list[active];
  // 영상판 콘셉트 화면(제작 예정)은 실제 프로그램 화면이라고 쓰지 않는다 (program-previews.ts 의 concept)
  const note = current?.concept
    ? (ko ? '영상판 콘셉트 화면 · 제작 예정 화면 예시' : 'Video-host concept screen · example of a screen in production')
    : (ko ? '실제 프로그램 화면 · 화면 속 인물은 예시 인물' : 'Actual program screens · sample person shown · on-screen text is in Korean');

  return (
    <div ref={ref} className={cn('grid items-center gap-10 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-[clamp(1.75rem,3.6vw,4rem)]', className)}>
      <div className="flex flex-col items-center">
        {device === 'kiosk' ? (
          <KioskFrame screens={screens} active={active * 2 + phase} className={cn('!w-[min(58vw,17.5rem)]', deviceClassName)} />
        ) : (
          <BoothFrame screens={screens} active={active * 2 + phase} print={current?.flow?.prints?.[0]} printOut={phase === 1} className={cn('!w-[min(86vw,30rem)]', deviceClassName)} />
        )}
        <p className="mt-4 max-w-xs text-center text-[11px] leading-relaxed text-paper/40">{note}</p>
      </div>

      <ul className="min-w-0 border-t border-paper/15" onPointerLeave={() => { hold.current = clock() + 2500; }}>
        {list.map((p, i) => {
          const on = i === active;
          const inner = (
            <>
              <span className={cn('t-label w-7 shrink-0 transition-colors duration-300', on ? 'text-accent' : 'text-paper/30')}>{String(i + 1).padStart(2, '0')}</span>
              <span className={cn('min-w-0 flex-1 text-[clamp(1.05rem,1.45vw,1.35rem)] font-bold leading-snug tracking-[-0.03em] transition-[color,transform] duration-500', on ? 'translate-x-1.5 text-paper' : 'text-paper/40')}>
                {p.name[lang]}
                {p.operated && <span className={cn('ml-2.5 inline-block rounded-full border px-2 py-0.5 align-middle text-[10px] font-medium leading-none tracking-normal transition-colors duration-300', on ? 'border-accent/70 text-accent' : 'border-paper/15 text-paper/30')}>{ko ? '운영 사례' : 'operated'}</span>}
              </span>
              {p.href && <span aria-hidden="true" className={cn('shrink-0 font-display transition-all duration-500', on ? 'translate-x-0 text-paper opacity-100' : '-translate-x-2 opacity-0')}>→</span>}
            </>
          );
          const cls = 'flex w-full items-baseline gap-4 border-b border-paper/15 py-[clamp(0.7rem,1.3vw,1.05rem)] text-left';
          return (
            <li key={p.slug} onPointerEnter={(e) => { if (e.pointerType === 'mouse') choose(i); }}>
              {p.href ? (
                <Link href={p.href} onFocus={() => choose(i)} className={cls} aria-current={on ? 'true' : undefined}>{inner}</Link>
              ) : (
                <button type="button" onClick={() => choose(i)} onFocus={() => choose(i)} className={cls} aria-pressed={on}>{inner}</button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
