'use client';

/* ─────────────────────────────────────────────────────────
   NEANDERco.  |  Demo popup
   서비스 목록에서 카드를 누르면 상세 페이지로 가지 않고 데모를 팝업으로 띄운다.
   닫기 버튼 · Esc · 바깥 클릭 · 브라우저 뒤로가기로 닫힌다 (URL ?demo=<slug> — IndustryShowcase가 관리).
   ───────────────────────────────────────────────────────── */

import { useEffect, useRef, useSyncExternalStore, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { experiences, getIndustryById, getPillarById } from '@/data/experiences';
import { getDemoMockupTheme } from '@/data/demo-experiences/mockup-themes';
import { DemoSection } from './DemoSection';
import './demo-modal.css';

interface DemoModalProps {
  slug: string;
  onClose: () => void;
  /** Keep an embedded demo inside its parent flow instead of navigating away. */
  returnLabel?: string;
}

const noopSubscribe = () => () => {};

export function DemoModal({ slug, onClose, returnLabel }: DemoModalProps) {
  // ?demo= 링크로 들어오면 서버 렌더에서도 불리므로, document가 있는 브라우저에서만 그린다
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const t = useTranslations('services');
  const tDemo = useTranslations('demos');
  const panelRef = useRef<HTMLDivElement>(null);

  const exp = experiences.find((e) => e.slug === slug);
  const pillar = exp ? getPillarById(exp.pillar) : undefined;
  const industry = exp ? getIndustryById(exp.industry) : undefined;
  const theme = getDemoMockupTheme(slug);

  // 뒤 페이지 스크롤 잠금 + 열릴 때 닫기 버튼으로 포커스, 닫히면 원래 자리로
  useEffect(() => {
    if (!mounted) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.querySelector<HTMLElement>('[data-demo-close]')?.focus();
    // The loading header is replaced once the lazy demo is ready. Keep initial
    // keyboard focus in the dialog without stealing it from an active control.
    const observer = new MutationObserver(() => {
      const close = panelRef.current?.querySelector<HTMLElement>('.venue-shell [data-demo-close]');
      if (!close) return;
      if (document.activeElement === document.body) close.focus();
      observer.disconnect();
    });
    if (panelRef.current) observer.observe(panelRef.current, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus?.();
    };
  }, [mounted]);

  // Esc로 닫기 (전체 화면 중에는 브라우저가 먼저 전체 화면을 끝낸다)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !e.defaultPrevented && !document.fullscreenElement) {
        e.preventDefault();
        onClose();
      }
      if (e.key !== 'Tab') return;
      const panel = panelRef.current;
      if (!panel) return;
      const controls = Array.from(panel.querySelectorAll<HTMLElement>('a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]'))
        .filter((element) => element.getClientRects().length > 0 && !element.closest('[inert], [aria-hidden="true"]'));
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (!first || !last) return;
      if (e.shiftKey && (document.activeElement === first || !panel.contains(document.activeElement))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (document.activeElement === last || !panel.contains(document.activeElement))) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!exp || !mounted) return null;

  const pillarName = pillar ? t(pillar.nameKey) : '';
  const name = t(exp.nameKey);

  return createPortal(
    <motion.div
      style={{ zIndex: 'var(--z-modal)' }}
      className="fixed inset-0 flex items-stretch justify-center bg-stone-900/30 backdrop-blur-md sm:p-5 lg:p-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      // 바깥(어두운 배경)을 누르면 닫는다
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={name}
        className="demo-modal-panel relative flex min-h-0 w-full max-w-7xl flex-col overflow-hidden shadow-2xl ring-1 ring-white/10 sm:rounded-2xl"
        style={{
          '--demo-modal-paper': theme.canvas,
          '--demo-modal-ink': theme.ink,
          colorScheme: theme.light ? 'light' : 'dark',
        } as CSSProperties}
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.98 }}
        transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {/* The stage stays inside the inset popup frame and advances through pages. */}
        <div className="demo-modal-scroll min-h-0 flex-1 overflow-hidden overscroll-contain" data-lenis-prevent>
          <DemoSection
            variant="modal"
            slug={slug}
            pillarColor={pillar?.color ?? '#0D9488'}
            title={name}
            subtitle={t(exp.oneLinerKey)}
            pillarName={pillarName}
            industryName={industry ? t(industry.nameKey) : ''}
            backHref={`/services/${slug}`}
            backLabel={t('backToPillar', { pillar: pillarName })}
            inquiryLabel={t('inquiryBtn')}
            onClose={onClose}
            closeLabel={tDemo('stage.close')}
            detailHref={`/services/${slug}`}
            returnLabel={returnLabel}
            labels={{
              back: tDemo('common.back'),
              next: tDemo('common.next'),
              seeResult: tDemo('common.seeResult'),
              analyzing: tDemo('common.analyzing'),
              analyzingSubtitle: tDemo('common.analyzingSubtitle'),
              complete: tDemo('common.complete'),
              loading: tDemo('stage.loading'),
              fullscreen: tDemo('stage.fullscreen'),
              exitFullscreen: tDemo('stage.exitFullscreen'),
              scrollHint: tDemo('stage.scrollHint'),
              disclaimer: tDemo('stage.disclaimer'),
            }}
          />
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}
