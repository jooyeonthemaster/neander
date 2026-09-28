'use client';

/* ─────────────────────────────────────────────────────────
   NEANDERco.  |  Demo stage
   서비스 상세 페이지 첫 화면. 들어오자마자 데모가 시작되고 화면 높이를 가득 채운다.
   전체 화면 버튼으로 브라우저 UI까지 가린 키오스크 모드로 전환할 수 있다.
   variant="modal"이면 서비스 목록 위 팝업 안에 들어간다 (DemoModal) — 뒤로가기 대신 닫기 버튼,
   아래 안내는 상세 페이지 링크가 된다.
   ───────────────────────────────────────────────────────── */

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from 'react';
import { motion, MotionConfig } from 'motion/react';
import { cn } from '@/lib/utils';
import { Link } from '@/i18n/navigation';
import { loadDemoModule } from '@/data/demo-registry';
import type { DemoModule } from '@/types/demo';
import { DemoShell } from './DemoShell';
import { getExperienceDesign } from '@/data/demo-experiences';
import { getProgramArtDirection } from '@/data/demo-experiences/art-directions';
import { getDemoMockupLayout } from '@/data/demo-experiences/mockup-layouts';
import { getDemoMockupTheme } from '@/data/demo-experiences/mockup-themes';
import './program-fonts.css';
import './experience-venue.css';
import './viewport-demo.css';
import './viewport-capture.css';
import './viewport-product.css';
import './viewport-media.css';
import './viewport-simple.css';
import './mockup-shell.css';
import './mockup-scenes.css';
import './mockup-controls.css';
import './demo-review.css';

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
  /** 'modal' — 서비스 목록의 팝업 안에서 쓴다 */
  variant?: 'page' | 'modal';
  /** 팝업 닫기 (variant='modal') */
  onClose?: () => void;
  closeLabel?: string;
  /** 팝업 아래 '서비스 자세히 보기' 링크 대상 (variant='modal') */
  detailHref?: string;
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
  backHref,
  backLabel,
  variant = 'page',
  onClose,
  closeLabel,
  detailHref,
  labels,
}: DemoSectionProps) {
  const isModal = variant === 'modal';
  const Heading = isModal ? 'h2' : 'h1';
  const stageRef = useRef<HTMLElement>(null);
  const [demoModule, setDemoModule] = useState<DemoModule | null>(null);
  const [loadError, setLoadError] = useState(false);
  const design = getExperienceDesign(slug);
  const art = getProgramArtDirection(slug);
  const theme = getDemoMockupTheme(slug);
  const layout = getDemoMockupLayout(slug);
  const accent = theme.accent;

  // 서버 렌더에서는 false — 전체 화면을 지원하는 브라우저에서만 버튼을 보인다
  const canFullscreen = useSyncExternalStore(subscribeFullscreen, () => document.fullscreenEnabled, () => false);
  const isFullscreen = useSyncExternalStore(subscribeFullscreen, () => document.fullscreenElement !== null, () => false);

  // 페이지에 들어오면 바로 데모 모듈을 불러와 시작한다
  useEffect(() => {
    let alive = true;
    const timer = window.setTimeout(() => {
      if (alive) { setLoadError(true); alive = false; }
    }, 15_000);
    const loader = loadDemoModule(slug);
    Promise.resolve().then(() => {
      setLoadError(false);
      return loader ? loader() : Promise.reject(new Error('Unknown demo'));
    }).then((mod) => {
      if (alive) setDemoModule(mod);
    }).catch(() => { if (alive) setLoadError(true); }).finally(() => clearTimeout(timer));
    return () => { alive = false; clearTimeout(timer); };
  }, [slug]);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      stageRef.current?.requestFullscreen().catch(() => {});
    }
  }, []);

  const renderHeader = (progress: ReactNode) => (
      <div className="venue-topbar relative z-10 w-full">
        <div className="venue-topbar-inner flex items-center gap-3 py-3 sm:gap-4 sm:py-4">
          {!isModal && (
          <Link
            href={backHref}
            aria-label={backLabel}
            title={backLabel}
            className="group inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 backdrop-blur-sm transition-all duration-200 hover:border-white/25 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 sm:h-11 sm:w-11"
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
          )}

          <div className="venue-topbar-titles flex min-w-0 flex-1 items-center gap-3">
            <Heading className="venue-service-title font-display">{title}</Heading>

          </div>

          {progress}

          {canFullscreen && (
            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? labels.exitFullscreen : labels.fullscreen}
              title={isFullscreen ? labels.exitFullscreen : labels.fullscreen}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition-colors hover:border-white/25 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 sm:h-11 sm:w-11"
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

          {isModal && onClose && !isFullscreen && (
            <button
              type="button"
              onClick={onClose}
              aria-label={closeLabel}
              title={closeLabel}
              data-demo-close
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition-colors hover:border-white/25 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 sm:h-11 sm:w-11"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          )}
        </div>
      </div>

  );

  const detailLink = !isFullscreen && (isModal && detailHref
    ? <Link href={detailHref} className="venue-detail-link">{labels.scrollHint}<span aria-hidden="true">↗</span></Link>
    : <a href="#overview" className="venue-detail-link">{labels.scrollHint}<span aria-hidden="true">↗</span></a>);

  return (
    <MotionConfig reducedMotion="user">
    <section
      ref={stageRef}
      aria-label={title}
      className={cn(
        'relative flex flex-col overflow-x-clip bg-slate-950',
        design && 'experience-venue',
        // <main>이 이미 고정 헤더만큼 띄워 두므로, 헤더 아래 남은 화면 높이를 채운다.
        // 전체 화면에서도 스크롤 없이 현재 체험 단계가 화면 안에 들어간다.
        isFullscreen
          ? 'h-[100dvh]'
          : isModal
            ? 'h-full'
            : 'h-[calc(100dvh-4rem)] lg:h-[calc(100dvh-5rem)]'
      )}
      data-fit-viewport
      data-venue-layout={design?.layout}
      data-program={slug}
      data-mockup-layout={layout}
      data-color-mode={theme.light ? 'light' : 'dark'}
      style={design ? {
        '--venue-accent': accent,
        '--venue-secondary': theme.secondary,
        '--venue-bg': theme.canvas,
        '--venue-paper': theme.paper,
        '--venue-ink': theme.ink,
        '--venue-muted': theme.muted,
        '--venue-accent-ink': theme.accentInk,
        '--venue-heading-font': theme.headingFont,
        '--venue-body-font': '"Pretendard", sans-serif',
        '--venue-title-weight': 700,
        '--venue-title-tracking': '-.04em',
        '--venue-radius': '12px',
        '--venue-image-position': art?.imagePosition ?? 'center',
        '--venue-backdrop-position': art?.backdropPosition ?? 'center',
        '--venue-backdrop-opacity': art?.backdropOpacity ?? .3,
      } as CSSProperties : undefined}
    >
      {/* Demo — 남은 높이를 채우고 가운데에 둔다 */}
      <div className="venue-demo-area relative z-10 flex min-h-0 w-full flex-1 flex-col">
        {demoModule ? (
          <motion.div
            className="venue-demo-loaded"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <DemoShell key={demoModule.config.targetSlug} module={demoModule} pillarColor={pillarColor} serviceName={title} labels={labels} renderHeader={renderHeader} detailLink={detailLink} disclaimer={labels.disclaimer} />
          </motion.div>
        ) : (
          <div className="mockup-loading">
            {renderHeader(null)}
            <div className="flex flex-1 flex-col items-center justify-center gap-4" role="status">
            {!loadError && <motion.div
              className="h-8 w-8 rounded-full border-2 border-t-transparent"
              style={{ borderColor: `${pillarColor}80`, borderTopColor: 'transparent' }}
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
            />}
            <p>{loadError ? '데모를 불러오지 못했어요. 다시 시도해 주세요.' : labels.loading}</p>
            {loadError && <button className="mockup-next" type="button" onClick={() => window.location.reload()}>다시 불러오기</button>}
            </div>
          </div>
        )}
      </div>

    </section>
    </MotionConfig>
  );
}
