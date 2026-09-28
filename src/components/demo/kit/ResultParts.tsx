'use client';

/* ─────────────────────────────────────────────────────────
   NEANDERco.  |  Demo Kit — result building blocks
   결과 화면 공통 레이아웃과 점수 바·레이더·정보 카드·가공 사진
   ───────────────────────────────────────────────────────── */

import { Children, createContext, useContext, useEffect, useState } from 'react';
import type { DemoResultStatus } from '@/lib/demo-generation';
import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { QUOTE_HREF } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { renderLook, type PhotoLook } from './photo';

/* ── Shell ────────────────────────────────────────────── */

export const DemoResultContext = createContext<{ status: DemoResultStatus; slug: string } | null>(null);

interface ResultShellProps {
  /** 제목 위 작은 라벨 (예: '당신의 피부 타입') */
  eyebrow: string;
  title: string;
  description?: string;
  pillarColor: string;
  onRestart: () => void;
  restartLabel?: string;
  children?: React.ReactNode;
  /** Keep all parts of the primary card visible before the detail fold. */
  coreCount?: number;
}

export function ResultShell({
  eyebrow,
  title,
  description,
  pillarColor,
  onRestart,
  restartLabel = '다시 체험하기',
  children,
  coreCount = 1,
}: ResultShellProps) {
  const tCommon = useTranslations('demos.common');
  const context = useContext(DemoResultContext);
  const parts = Children.toArray(children);
  const safeDescription = context && context.status !== 'ai' && /AI가|AI.*(?:만들었|그렸|분석했)/.test(description ?? '') ? '선택한 조건으로 구성한 예시입니다. 다시 시도하면 같은 입력으로 AI 결과를 요청합니다.' : description;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="demo-result-shell flex flex-col items-center gap-8 text-center"
    >
      <div className="demo-result-heading space-y-3">
        <p className="demo-result-eyebrow text-sm font-medium uppercase tracking-widest text-slate-400">{eyebrow}</p>
        <h2 className="demo-result-title font-display text-3xl font-bold [word-break:keep-all] sm:text-4xl" style={{ color: `var(--venue-ink, ${pillarColor})` }}>
          {title}
        </h2>
        {safeDescription && (
          <p className="demo-result-description mx-auto max-w-md text-sm leading-relaxed text-slate-300 [word-break:keep-all]">{safeDescription}</p>
        )}
      </div>

      {context && parts.length > coreCount ? <>
        <div className="demo-result-core">{parts.slice(0, coreCount)}</div>
        <details className="demo-result-details"><summary>자세히 보기</summary><div>{parts.slice(coreCount)}</div></details>
      </> : children}

      {!context && <div className="demo-result-footer flex flex-col items-center gap-3 pt-2">
        <p className="text-xs text-slate-500">{tCommon('ctaMessage')}</p>
        <div className="demo-result-actions flex gap-3">
          <motion.button
            type="button"
            whileTap={{ scale: 0.99 }}
            onClick={onRestart}
            className="demo-secondary-action rounded-xl border border-slate-700 px-6 py-3 text-sm font-medium text-slate-300 transition-colors hover:border-slate-500"
          >
            {restartLabel}
          </motion.button>
          <Link
            href={QUOTE_HREF}
            className="demo-primary-action demo-accent-surface rounded-xl px-6 py-3 text-sm font-semibold text-white transition-colors"
            style={{ backgroundColor: `var(--venue-accent, ${pillarColor})` }}
          >
            {tCommon('ctaButton')}
          </Link>
        </div>
      </div>}
    </motion.div>
  );
}

/* ── Panel ────────────────────────────────────────────── */

/** 결과 안의 섹션 박스 */
export function Panel({ title, children, className }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('demo-panel w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/60 p-5 text-left', className)}>
      {title && <p className="demo-panel-title mb-4 text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</p>}
      {children}
    </div>
  );
}

/* ── Score bars ───────────────────────────────────────── */

export function ScoreBars({
  items,
  color,
  suffix = '',
  className,
}: {
  items: { label: string; value: number }[];
  color: string;
  suffix?: string;
  className?: string;
}) {
  return (
    <div className={cn('demo-score-bars w-full max-w-md space-y-4 text-left', className)}>
      {items.map((item, i) => (
        <div key={item.label} className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-300">{item.label}</span>
            <span className="demo-score-value font-semibold" style={{ color: `var(--venue-accent, ${color})` }}>
              {item.value}
              {suffix}
            </span>
          </div>
          <div className="demo-score-track h-2 w-full overflow-hidden rounded-full bg-slate-800">
            <motion.div
              className="h-full rounded-full"
              style={{ background: `var(--venue-accent, ${color})` }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, Math.max(0, item.value))}%` }}
              transition={{ type: 'spring', stiffness: 60, damping: 14, delay: 0.2 + i * 0.1 }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Chips ────────────────────────────────────────────── */

export function TraitChips({ items, title }: { items: string[]; title?: string }) {
  return (
    <div className="demo-traits">
      {title && <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</p>}
      <div className="flex flex-wrap justify-center gap-2">
        {items.map((item) => (
          <span key={item} className="demo-trait-chip rounded-full border border-slate-700 bg-slate-800/60 px-3 py-1 text-xs text-slate-300">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Info grid ────────────────────────────────────────── */

export function InfoGrid({
  items,
  columns = 2,
}: {
  items: { label: string; value: string; emoji?: string; desc?: string }[];
  columns?: 2 | 3;
}) {
  return (
    <div className={cn('demo-info-grid grid w-full max-w-md gap-3', columns === 3 ? 'grid-cols-3' : 'grid-cols-2')}>
      {items.map((item) => (
        <div key={item.label} className="demo-info-card rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-left">
          <p className="text-[11px] font-medium text-slate-500">
            {item.emoji && <span className="mr-1">{item.emoji}</span>}
            {item.label}
          </p>
          <p className="mt-1 text-sm font-semibold text-white [word-break:keep-all]">{item.value}</p>
          {item.desc && <p className="mt-1 text-xs leading-relaxed text-slate-400 [word-break:keep-all]">{item.desc}</p>}
        </div>
      ))}
    </div>
  );
}

/* ── Radar ────────────────────────────────────────────── */

export function RadarChart({
  axes,
  color,
  size = 240,
}: {
  axes: { label: string; value: number }[];
  color: string;
  size?: number;
}) {
  const center = size / 2;
  const radius = size / 2 - 36;
  const angle = (i: number) => (Math.PI * 2 * i) / axes.length - Math.PI / 2;
  const point = (i: number, r: number) => [center + Math.cos(angle(i)) * r, center + Math.sin(angle(i)) * r] as const;
  const polygon = axes.map((a, i) => point(i, (Math.min(100, Math.max(0, a.value)) / 100) * radius).join(',')).join(' ');

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="demo-radar mx-auto max-w-full" role="img" aria-label={axes.map((a) => `${a.label} ${a.value}`).join(', ')}>
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <polygon
          key={f}
          points={axes.map((_, i) => point(i, radius * f).join(',')).join(' ')}
          fill="none"
          stroke="var(--venue-line, #334155)"
          strokeWidth="1"
        />
      ))}
      {axes.map((_, i) => {
        const [x, y] = point(i, radius);
        return <line key={i} x1={center} y1={center} x2={x} y2={y} stroke="var(--venue-line, #334155)" strokeWidth="1" />;
      })}
      <motion.polygon
        points={polygon}
        fill={`var(--venue-accent, ${color})`}
        fillOpacity={0.25}
        stroke={`var(--venue-accent, ${color})`}
        strokeWidth="2"
        initial={{ opacity: 0, scale: 0.4 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ transformOrigin: `${center}px ${center}px` }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      />
      {axes.map((a, i) => {
        const [x, y] = point(i, radius + 20);
        return (
          <text key={a.label} className="demo-radar-label" x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="14" fill="#cbd5e1">
            {a.label}
          </text>
        );
      })}
    </svg>
  );
}

/* ── Processed photo ──────────────────────────────────── */

/**
 * 캡처 이미지에 PhotoLook을 적용해 보여준다. "AI 렌더링" 연출을 위해 잠깐 로딩을 보여준 뒤
 * 블러에서 선명하게 드러난다. children은 사진 위에 얹는 프레임/스티커용.
 */
export function ProcessedPhoto({
  src,
  look,
  className,
  imgClassName,
  alt = '체험 이미지',
  delayMs = 0,
  children,
}: {
  src: string;
  look: PhotoLook;
  className?: string;
  imgClassName?: string;
  alt?: string;
  delayMs?: number;
  children?: React.ReactNode;
}) {
  const lookKey = JSON.stringify(look);
  const context = useContext(DemoResultContext);
  const [rendered, setRendered] = useState<{ src: string; lookKey: string; url: string } | null>(null);
  // src/look가 바뀌면 이전 결과는 버리고 다시 렌더링 중 상태로 보인다
  const output = rendered && rendered.src === src && rendered.lookKey === lookKey ? rendered.url : lookKey === '{}' ? src : null;

  useEffect(() => {
    let alive = true;
    if (lookKey === '{}') return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const started = performance.now();
    renderLook(src, JSON.parse(lookKey) as PhotoLook)
      .catch(() => src)
      .then((url) => {
        const wait = Math.max(0, delayMs - (performance.now() - started));
        timer = setTimeout(() => alive && setRendered({ src, lookKey, url }), wait);
      });
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [src, lookKey, delayMs]);

  return (
    <div className={cn('demo-processed-photo relative overflow-hidden bg-slate-900', className)}>
      <motion.img
        src={output ?? src}
        alt={context && context.status !== 'ai' ? '선택한 사진으로 구성한 체험 예시' : alt}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={cn('h-full w-full object-cover', imgClassName)}
      />
      {!output && <span className="demo-photo-finishing">사진 효과 적용 중</span>}
      {children}
    </div>
  );
}
