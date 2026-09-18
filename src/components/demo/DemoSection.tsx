'use client';

/* ─────────────────────────────────────────────────────────
   NEANDERco.  |  Demo stage
   서비스 상세 페이지 첫 화면. 들어오자마자 데모가 시작되고 화면 높이를 가득 채운다.
   전체 화면 버튼으로 브라우저 UI까지 가린 키오스크 모드로 전환할 수 있다.
   ───────────────────────────────────────────────────────── */

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { Link } from '@/i18n/navigation';
import { loadDemoModule } from '@/data/demo-registry';
import type { DemoModule } from '@/types/demo';
import { DemoShell } from './DemoShell';

interface DemoSectionProps {
  slug: string;
  pillarColor: string;
  /** 서비스 이름 (페이지 h1) */
  title: string;
  subtitle: string;
  pillarName: string;
  industryName: string;
  backHref: string;
  backLabel: string;
  inquiryLabel: string;
  labels: {
    back: string;
    next: string;
    seeResult: string;
    analyzing: string;
    analyzingSubtitle: string;
    complete: string;
    loading: string;
    fullscreen: string;
    exitFullscreen: string;
    scrollHint: string;
    disclaimer: string;
  };
}

function subscribeFullscreen(callback: () => void) {
  document.addEventListener('fullscreenchange', callback);
  return () => document.removeEventListener('fullscreenchange', callback);
}

export function DemoSection({
  slug,
  pillarColor,
  title,
  subtitle,
  pillarName,
  industryName,
  backHref,
  backLabel,
  inquiryLabel,
  labels,
}: DemoSectionProps) {
  const stageRef = useRef<HTMLElement>(null);
  const [demoModule, setDemoModule] = useState<DemoModule | null>(null);

  // 서버 렌더에서는 false — 전체 화면을 지원하는 브라우저에서만 버튼을 보인다
  const canFullscreen = useSyncExternalStore(subscribeFullscreen, () => document.fullscreenEnabled, () => false);
  const isFullscreen = useSyncExternalStore(subscribeFullscreen, () => document.fullscreenElement !== null, () => false);

  // 페이지에 들어오면 바로 데모 모듈을 불러와 시작한다
  useEffect(() => {
    let alive = true;
    loadDemoModule(slug)?.().then((mod) => {
      if (alive) setDemoModule(mod);
    });
    return () => {
      alive = false;
    };
  }, [slug]);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      stageRef.current?.requestFullscreen().catch(() => {});
    }
  }, []);

  return (
    <section
      ref={stageRef}
      aria-label={title}
      className={cn(
        'relative flex flex-col overflow-x-clip bg-slate-950',
        // <main>이 이미 고정 헤더만큼 띄워 두므로, 헤더 아래 남은 화면 높이를 채운다.
        // 전체 화면에서는 헤더가 없고 스테이지 자체가 스크롤된다.
        isFullscreen ? 'min-h-[100dvh] overflow-y-auto' : 'min-h-[calc(100dvh-4rem)] lg:min-h-[calc(100dvh-5rem)]'
      )}
    >
      {/* Grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
        aria-hidden="true"
      />
      {/* Glows */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/3 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ backgroundColor: pillarColor, opacity: 0.08, filter: 'blur(160px)' }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-0 right-0 h-[300px] w-[400px] rounded-full"
        style={{ backgroundColor: pillarColor, opacity: 0.05, filter: 'blur(120px)' }}
        aria-hidden="true"
      />

      {/* Top bar: 뒤로가기 · 서비스 정보 · 문의 · 전체 화면 */}
      <div className="container-wide relative z-10 w-full">
        <div className="flex items-center gap-3 border-b border-white/5 py-3 sm:gap-4 sm:py-4">
          <Link
            href={backHref}
            aria-label={backLabel}
            title={backLabel}
            className="group inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 backdrop-blur-sm transition-all duration-200 hover:border-white/25 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 sm:h-11 sm:w-11"
          >
            <svg
              className="h-5 w-5 transition-transform duration-200 group-hover:-translate-x-0.5"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
                clipRule="evenodd"
              />
            </svg>
          </Link>

          <div className="flex min-w-0 flex-1 items-center gap-3">
            <h1 className="truncate font-display text-lg font-extrabold tracking-tight text-white sm:text-xl lg:text-2xl">{title}</h1>
            <div className="hidden shrink-0 items-center gap-2 md:flex">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
                style={{ backgroundColor: pillarColor }}
              >
                <span className="h-1 w-1 rounded-full bg-white/70" aria-hidden="true" />
                {pillarName}
              </span>
              <span
                className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-medium text-slate-400"
                style={{ borderColor: `${pillarColor}40` }}
              >
                {industryName}
              </span>
            </div>
            <p className="hidden min-w-0 truncate text-sm text-slate-500 xl:block">{subtitle}</p>
          </div>

          <Link
            href="/contact"
            className="hidden shrink-0 items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-transform duration-200 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 lg:inline-flex"
            style={{ backgroundColor: pillarColor, boxShadow: `0 8px 24px ${pillarColor}30` }}
          >
            {inquiryLabel}
          </Link>

          {canFullscreen && (
            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? labels.exitFullscreen : labels.fullscreen}
              title={isFullscreen ? labels.exitFullscreen : labels.fullscreen}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition-colors hover:border-white/25 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 sm:h-11 sm:w-11"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {isFullscreen ? (
                  <path d="M8 3v3a2 2 0 0 1-2 2H3M21 8h-3a2 2 0 0 1-2-2V3M3 16h3a2 2 0 0 1 2 2v3M16 21v-3a2 2 0 0 1 2-2h3" />
                ) : (
                  <path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3" />
                )}
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* 데모 안내 — 실제 현장 프로그램과 품질 차이가 있을 수 있음 */}
      <p className="relative z-10 mx-auto mt-3 max-w-md px-4 text-center text-[11px] leading-relaxed text-slate-500/70 [word-break:keep-all]">
        {labels.disclaimer}
      </p>

      {/* Demo — 남은 높이를 채우고 가운데에 둔다 */}
      <div className="relative z-10 flex w-full flex-1 flex-col justify-center">
        {demoModule ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <DemoShell module={demoModule} pillarColor={pillarColor} serviceName={title} labels={labels} />
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 py-24" role="status">
            <motion.div
              className="h-8 w-8 rounded-full border-2 border-t-transparent"
              style={{ borderColor: `${pillarColor}80`, borderTopColor: 'transparent' }}
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
            />
            <p className="text-sm text-slate-400">{labels.loading}</p>
          </div>
        )}
      </div>

      {/* 아래 서비스 소개로 */}
      {!isFullscreen && (
        <a
          href="#overview"
          className="relative z-10 mx-auto mb-5 inline-flex flex-col items-center gap-1 text-xs text-slate-500 transition-colors hover:text-slate-300"
        >
          {labels.scrollHint}
          <motion.svg
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
            animate={{ y: [0, 4, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04l3.96 4.158V3.75A.75.75 0 0110 3z" clipRule="evenodd" />
          </motion.svg>
        </a>
      )}

      {/* Bottom edge */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(to right, transparent, ${pillarColor}30, transparent)` }}
        aria-hidden="true"
      />
    </section>
  );
}
