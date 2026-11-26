'use client';

import { useEffect, useRef, useState } from 'react';
import { ONSITE_STEP_LABELS, type OnsiteFlow } from '@/data/onsite-flows';
import type { VideoFlow } from '@/data/program-previews';
import { cn } from '@/lib/utils';
import { BoothFrame, KioskFrame, PhoneFrame } from './DeviceFrame';

/* ─────────────────────────────────────────────────────────
   「HOW IT WORKS」 — 실제 프로그램 화면이 기기 안에서 단계별로 넘어간다.
   · 화면에 보이는 동안 저절로 넘어간다 (2026-11-21 사용자 — 예전에는 넓은 화면에서 스크롤을 내려야 넘어갔다)
   · 과정 녹화 영상(video · stepAt)이 있으면 기기 화면에서 영상이 돌고, 단계 목록이 영상 시각을 따라간다.
     단계를 누르면 영상이 그 단계로 건너뛴다
   · 움직임 줄이기를 켠 브라우저는 영상 · 자동 넘김 없이 단계 그림만 보여 준다
   화면 속 인물은 AI 로 만든 가상 예시 인물이라 아래에 작게 밝힌다.
   ───────────────────────────────────────────────────────── */

const AUTO_MS = 3600;

export function DeviceFlow({ flow, lang, texts }: { flow: OnsiteFlow | VideoFlow; lang: 'ko' | 'en'; texts?: { title: string; description: string }[] }) {
  const steps = flow.steps;
  const n = steps.length;
  const video = 'video' in flow ? flow.video : undefined;
  const stepAt = 'stepAt' in flow ? flow.stepAt : undefined;
  const custom = 'stepLabels' in flow ? flow.stepLabels : undefined;
  const labelOf = (i: number) => custom?.[i]?.[lang] ?? ONSITE_STEP_LABELS[steps[i].kind][lang];
  const subOf = (i: number) => (lang === 'ko' ? custom?.[i]?.subKo : custom?.[i]?.subEn);
  const [active, setActive] = useState(0);
  const [hold, setHold] = useState(0);
  const [inView, setInView] = useState(false);
  const [reduce, setReduce] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const useVideo = !!video && !!stepAt && !reduce;

  useEffect(() => {
    setReduce(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // 그림만 있을 때: 보이는 동안 저절로 다음 단계로 (직접 고른 직후 잠시 멈춘다)
  useEffect(() => {
    if (useVideo || reduce || !inView || n < 2) return;
    const id = window.setTimeout(() => setActive((i) => (i + 1) % n), Date.now() < hold ? hold - Date.now() + AUTO_MS : AUTO_MS);
    return () => window.clearTimeout(id);
  }, [active, inView, n, useVideo, reduce, hold]);

  // 영상: 보일 때만 재생하고, 재생 위치에 맞춰 단계를 켠다
  useEffect(() => {
    const v = videoRef.current;
    if (!useVideo || !v) return;
    if (inView) void v.play().catch(() => {});
    else v.pause();
    const onTime = () => {
      let i = 0;
      while (i + 1 < stepAt!.length && v.currentTime >= stepAt![i + 1]) i++;
      setActive((cur) => (cur === i ? cur : i));
    };
    // 끝나면 마지막 장면(인화 · 영수증)을 잠시 보여 준 뒤 처음부터 다시
    let again = 0;
    const onEnd = () => { again = window.setTimeout(() => { v.currentTime = 0; void v.play().catch(() => {}); }, 4500); };
    v.addEventListener('timeupdate', onTime);
    v.addEventListener('ended', onEnd);
    return () => { v.removeEventListener('timeupdate', onTime); v.removeEventListener('ended', onEnd); window.clearTimeout(again); };
  }, [useVideo, inView, stepAt]);

  function go(i: number) {
    setActive(i);
    setHold(Date.now() + 6000);
    const v = videoRef.current;
    if (useVideo && v && stepAt) {
      v.currentTime = stepAt[i] + 0.05;
      void v.play().catch(() => {});
    }
  }

  // 영상이 있으면 기기 화면은 영상 한 칸 (단계 그림은 포스터로만 쓴다)
  const screens = useVideo
    ? [{ src: steps[0].src, video, loop: false, alt: lang === 'ko' ? '실제 프로그램을 진행한 화면 녹화' : 'Screen recording of the actual program' }]
    : steps.map((s, i) => ({ src: s.src, alt: labelOf(i) }));
  const screenActive = useVideo ? 0 : active;
  const isResult = steps[active]?.kind === 'result' || steps[active]?.kind === 'phone';
  // 인화물은 영상판에서는 마지막(사진 인화) 단계에서, 그림판에서는 결과부터 슬롯에서 나온다
  const printOut = useVideo ? active === n - 1 : isResult;
  const fast = 'fastForward' in flow && flow.fastForward;
  const fastNote = 'fastNote' in flow ? flow.fastNote : undefined;
  const fastText = !fast ? '' : lang === 'ko' ? ` · ${fastNote?.ko ?? 'AI 생성 구간은 빨리 감았습니다'}` : ` · ${fastNote?.en ?? 'AI wait fast-forwarded'}`;
  const note = useVideo
    ? (lang === 'ko' ? `실제 프로그램 화면 녹화${fastText} · 화면 속 인물은 예시 인물` : `Recording of the actual program${fastText} · sample person shown`)
    : (lang === 'ko' ? '실제 프로그램 화면 · 화면 속 인물은 예시 인물' : 'Actual program screens · sample person shown · on-screen text is in Korean');

  return (
    <div ref={rootRef}>
      <div className="lg:flex lg:min-h-[min(46rem,88svh)] lg:items-center lg:py-10">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-[clamp(2.5rem,6vw,7rem)]">
          {/* 단계 목록 */}
          <ol className="order-2 flex gap-2 overflow-x-auto scrollbar-none lg:order-1 lg:block lg:overflow-visible">
            {steps.map((s, i) => {
              const on = i === active;
              const text = texts?.[Math.min(texts.length - 1, Math.round((i / Math.max(1, n - 1)) * (texts.length - 1)))];
              return (
                <li key={s.src} className="shrink-0 lg:shrink">
                  <button
                    type="button"
                    onClick={() => go(i)}
                    aria-current={on ? 'step' : undefined}
                    className={cn(
                      'group flex w-full items-baseline gap-4 border-paper/15 text-left transition-colors duration-500 max-lg:rounded-full max-lg:border max-lg:px-4 max-lg:py-2.5 lg:gap-7 lg:border-t lg:py-[clamp(0.9rem,2.2vh,1.5rem)]',
                      on ? 'max-lg:border-paper max-lg:bg-paper max-lg:text-ink' : 'max-lg:text-paper/70',
                    )}
                  >
                    <span className={cn('t-label transition-colors duration-500', on ? 'text-accent max-lg:text-ink' : 'text-paper/35 max-lg:text-inherit')}>{String(i + 1).padStart(2, '0')}</span>
                    <span className="min-w-0">
                      <span className={cn('block whitespace-nowrap font-bold tracking-[-0.03em] transition-[color,transform] duration-500 lg:text-[clamp(1.5rem,2.6vw,2.5rem)] lg:leading-tight', on ? 'text-paper max-lg:text-ink lg:translate-x-2' : 'text-paper/30 max-lg:text-inherit lg:group-hover:text-paper/60')}>
                        {labelOf(i)}
                        {subOf(i) && <span className="ml-3 align-middle text-[0.45em] font-semibold tracking-normal text-paper/50 max-lg:hidden">+ {subOf(i)}</span>}
                      </span>
                      {text && (
                        <span className={cn('hidden overflow-hidden text-[0.95rem] leading-relaxed text-paper/60 transition-[max-height,opacity,margin] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] lg:block', on ? 'mt-2 max-h-24 opacity-100' : 'max-h-0 opacity-0')}>
                          {text.description}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
            <li className="hidden border-t border-paper/15 pt-5 text-xs text-paper/40 lg:block">{note}</li>
          </ol>

          {/* 기기 */}
          <div className="order-1 flex flex-col items-center lg:order-2">
            <div className="flex items-end justify-center gap-[clamp(1rem,2.4vw,2.5rem)]">
              {flow.device === 'kiosk' ? (
                <KioskFrame screens={screens} active={screenActive} videoRef={videoRef} receipt={flow.receipt} receiptOut={useVideo ? printOut : isResult} className="!w-[min(62vw,19rem)] lg:!w-[min(21vw,36vh,20rem)]" />
              ) : (
                <BoothFrame screens={screens} active={screenActive} videoRef={videoRef} print={flow.prints?.[0]} printOut={printOut} className="!w-[min(88vw,32rem)] lg:!w-[min(40vw,62vh,35rem)]" />
              )}
              {/* 결과 단계에서 휴대폰 · 영수증이 옆에 선다 */}
              {/* 영수증은 키오스크 출력구에서 나오므로 옆에는 휴대폰만 */}
              {flow.phone && (
                <div className={cn('hidden shrink-0 transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] lg:block', (useVideo ? printOut : isResult) ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0')}>
                  <PhoneFrame src={flow.phone} alt={ONSITE_STEP_LABELS.phone[lang]} className="!w-[min(11vw,19vh,10.5rem)]" />
                </div>
              )}
            </div>
            <p className="mt-5 text-center text-xs text-paper/40 lg:hidden">{note}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
