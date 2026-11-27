'use client';

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { motion, useMotionValue, useScroll, useSpring, useTransform } from 'motion/react';
import { useReduce } from '@/components/fx/useReduce';
import { Link } from '@/i18n/navigation';
import { SERVICE_TEXT } from '@/lib/quote/catalog';
import { CORE_SERVICES, priceFrom } from '@/data/site';
import { Lines } from '@/components/fx/Reveal';
import { Btn } from '@/components/site/ui';

/* ─────────────────────────────────────────────────────────
   홈 첫 화면
   · 배경은 여러 행사 현장을 이은 무음 반복 영상(약 25초)이다. 재생이 시작되면 사진 위로 서서히 드러나고,
     휴대폰·데이터 절약 모드·움직임 줄이기에서는 영상을 받지 않고 사진 한 장만 보인다.
     마우스를 움직이면 배경이 살짝 따라 움직이고, 아래 서비스 칸에 올리면 그 서비스의 현장 사진으로 바뀐다.
   · 휴대폰 방문의 절반은 첫 화면만 보고 나간다(스크롤 중앙값 20%) — 그래서 주력 3종과 시작가를 첫 화면 안에 둔다.
   · 제목과 설명은 서버 HTML 에 그대로 있고 CSS 로만 올라온다.
   ───────────────────────────────────────────────────────── */

// 영상을 못 틀거나 움직임 줄이기를 켠 경우에 보이는 사진
const STILL = '/images/portfolio/acscent-id-1.webp';
const VIDEO = '/videos/hero/making.mp4';
const VIDEO_POSTER = '/videos/hero/making-poster.webp';

const WIDE = '(min-width: 1024px)';
function subscribeWide(onChange: () => void) {
  const mq = window.matchMedia(WIDE);
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}
function wideVideoOk(): boolean {
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return window.matchMedia(WIDE).matches && !conn?.saveData;
}

export function HomeHero() {
  const t = useTranslations('hero');
  const locale = useLocale();
  const ko = locale !== 'en';
  const lang = ko ? 'ko' : 'en';
  const reduce = useReduce();
  const ref = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [preview, setPreview] = useState<number | null>(null);
  // 배경 영상(2.9MB)은 넓은 화면에서만, 화면이 그려진 뒤에 붙인다 — 휴대폰·데이터 절약 모드는 사진 한 장
  const wide = useSyncExternalStore(subscribeWide, wideVideoOk, () => false);
  const playVideo = wide && !reduce;

  // 재생이 시작되면 영상을 드러낸다. 서버 HTML 의 영상은 화면이 준비되기 전에 재생을 시작해
  // 'playing' 을 놓칠 수 있어, 붙는 시점에 이미 재생 중인지도 본다
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const show = () => { v.dataset.playing = 'true'; };
    if (!v.paused && v.readyState >= 3) show();
    v.addEventListener('playing', show);
    return () => v.removeEventListener('playing', show);
  }, [reduce, playVideo]);

  // 스크롤: 사진은 조금 커지며 어두워지고, 글자는 먼저 올라간다
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.14]);
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '10%']);
  const veil = useTransform(scrollYProgress, [0, 1], [0, 0.55]);
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '-22%']);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  // 마우스: 사진이 반대쪽으로 살짝 밀린다
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const px = useSpring(mx, { stiffness: 60, damping: 18 });
  const py = useSpring(my, { stiffness: 60, damping: 18 });

  function onPointerMove(e: React.PointerEvent<HTMLElement>) {
    if (reduce || e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(((e.clientX - r.left) / r.width - 0.5) * -26);
    my.set(((e.clientY - r.top) / r.height - 0.5) * -18);
  }

  return (
    <section
      ref={ref}
      onPointerMove={onPointerMove}
      className="under-header relative flex min-h-[calc(100svh-4.5rem-env(safe-area-inset-bottom))] flex-col overflow-hidden bg-ink lg:min-h-svh"
      aria-label={t('tagline')}
    >
      {/* ── 배경 사진 ─────────────────────────────────── */}
      <motion.div className="absolute inset-0" style={reduce ? undefined : { scale: bgScale, y: bgY }} aria-hidden="true">
        <motion.div className="absolute -inset-6" style={{ x: px, y: py }}>
          <Image src={STILL} alt={ko ? "AC'SCENT ID 매장의 AI 조향 체험" : "AI perfume experience at the AC'SCENT ID store"} fill sizes="100vw" preload className="zoom-settle object-cover" />
          {playVideo && (
            <video
              ref={videoRef}
              className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-[1200ms] ease-out data-[playing=true]:opacity-100"
              src={VIDEO}
              poster={VIDEO_POSTER}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
            />
          )}
          {/* 서비스 칸에 올리면 그 서비스의 현장 사진 */}
          {CORE_SERVICES.map((s, i) => (
            <div
              key={s.key}
              className="absolute inset-0 transition-opacity duration-700 ease-out"
              style={{ opacity: preview === i ? 1 : 0 }}
            >
              <Image src={s.image} alt={SERVICE_TEXT[s.key].name[lang]} fill sizes="100vw" loading="lazy" className="object-cover" />
            </div>
          ))}
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-ink/75 via-ink/45 to-ink" />
        <div className="grain absolute inset-0 opacity-[0.07] mix-blend-overlay" />
        <motion.div className="absolute inset-0 bg-ink" style={{ opacity: veil }} />
      </motion.div>

      {/* ── 가운데 글 ─────────────────────────────────── */}
      <motion.div
        className="wrap relative z-10 flex flex-1 flex-col items-center justify-center pb-10 pt-28 text-center lg:pt-32"
        style={reduce ? undefined : { y: contentY, opacity: contentOpacity }}
      >
        <p className="t-label rise text-paper/75" style={{ '--i': 0 } as CSSProperties}>
          {ko ? `${t('badge')} · 체험형 AI 콘텐츠 기획사` : `${t('badge')} · AI EXPERIENCE STUDIO`}
        </p>
        <h1 className="mt-7 text-paper">
          <Lines
            immediate
            delay={120}
            className="t-giant !text-[length:clamp(2.2rem,11.6vw,4.4rem)] sm:!text-[length:clamp(3rem,7.3vw,7.6rem)] sm:tracking-[0.03em]"
            lines={[
              <span key="a">
                <span className="block sm:inline">AI IN</span>
                <span className="hidden sm:inline"> </span>
                <span className="block sm:inline">PERSON</span>
              </span>,
            ]}
          />
          {/* 한국어 제목 — 「무엇을 하는 회사인지」가 첫 화면에서 바로 읽히게 영어 제목 다음으로 크게 (2026-11-23) */}
          <span className="rise mt-6 block font-body text-[clamp(1.2rem,5vw,2.1rem)] font-bold leading-[1.35] tracking-[-0.03em] text-paper" style={{ '--i': 4 } as CSSProperties}>
            {ko ? (
              <>행사장에서 직접 해 보는 AI 체험,<br />기획부터 장비·현장 운영까지 맡습니다.</>
            ) : (
              <>Hands-on AI experiences for events —<br />planned, equipped and run on site.</>
            )}
            <span className="sr-only"> — {t('tagline')} {t('companyName')}</span>
          </span>
        </h1>
        {/* 첫 화면 버튼 (2026-11-27): ChatGPT 로 오는 방문(주간 21~28%)의 57%가 홈으로 들어오고 대부분 평일 업무 시간 PC다 —
            금액과 결재용 자료를 찾는 행사 담당자라 견적을 맨 앞에, 회사소개서·포트폴리오 PDF 를 바로 아래에 둔다.
            비교 기준: docs/behavior-baseline-2026-11-27.md (click_cta home_hero:quote 는 이때부터 기록) */}
        <div className="rise mt-9 flex flex-wrap items-center justify-center gap-3" data-cta-area="home_hero" style={{ '--i': 6 } as CSSProperties}>
          <Btn href="/quote" variant="fill" arrow>{t('ctaQuote')}</Btn>
          <Btn href="/services">{t('ctaServices')}</Btn>
        </div>
        <p className="rise mt-5 text-sm text-paper/65" style={{ '--i': 7 } as CSSProperties}>
          <Link href="/portfolio#download" className="underline decoration-paper/30 underline-offset-4 transition-colors hover:text-paper hover:decoration-paper">
            {t('ctaDocs')}
          </Link>
        </p>
      </motion.div>

      {/* ── 아래: 주력 3종 바로 가기 ───────────────────── */}
      <div className="relative z-10 fade-in" style={{ '--i': 9 } as CSSProperties}>
        <div className="wrap flex items-end justify-end pb-4 max-lg:hidden">
          <span className="t-label flex items-center gap-3 text-paper/50">
            SCROLL
            <span className="relative block h-10 w-px overflow-hidden bg-paper/20">
              <span className="absolute inset-0 bg-paper" style={{ animation: 'rd-scroll-hint 2.2s cubic-bezier(0.65,0,0.35,1) infinite' }} />
            </span>
          </span>
        </div>
        <ul className="grid border-t border-paper/20 lg:grid-cols-3" onPointerLeave={() => setPreview(null)}>
          {CORE_SERVICES.map((s, i) => (
            <li key={s.key} className="border-b border-paper/15 last:border-b-0 lg:border-b-0 lg:border-r lg:last:border-r-0">
              <Link
                href={s.href}
                onPointerEnter={(e) => { if (e.pointerType === 'mouse') setPreview(i); }}
                onFocus={() => setPreview(i)}
                onBlur={() => setPreview(null)}
                className="group relative flex items-center gap-4 overflow-hidden px-[clamp(1.25rem,3vw,3.25rem)] py-4 transition-colors duration-500 lg:py-7"
              >
                <span aria-hidden="true" className="absolute inset-0 origin-bottom scale-y-0 bg-paper/[0.08] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-y-100" />
                <span aria-hidden="true" className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-paper transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100" />
                <span className="t-label relative text-accent">{s.no}</span>
                <span className="relative min-w-0 flex-1">
                  <span className="block font-display text-[1.05rem] font-extrabold uppercase leading-tight tracking-[-0.005em] text-paper lg:text-[1.35rem]">{s.en.join(' ')}</span>
                  <span className="mt-1 block text-[13px] text-paper/60">
                    {SERVICE_TEXT[s.key].name[lang]}
                    <span className="mx-2 text-paper/25">·</span>
                    {priceFrom(s.key, lang)}
                  </span>
                </span>
                <span aria-hidden="true" className="relative font-display text-lg text-paper/60 transition-all duration-500 group-hover:translate-x-1.5 group-hover:text-paper">→</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
