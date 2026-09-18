'use client';

/* ─────────────────────────────────────────────────────────
   NEANDERco.  |  Demo Kit — result building blocks
   결과 화면 공통 레이아웃과 점수 바·레이더·정보 카드·가공 사진
   ───────────────────────────────────────────────────────── */

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { QUOTE_HREF } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { renderLook, type PhotoLook } from './photo';

/* ── Shell ────────────────────────────────────────────── */

interface ResultShellProps {
  /** 제목 위 작은 라벨 (예: '당신의 피부 타입') */
  eyebrow: string;
  title: string;
  description?: string;
  pillarColor: string;
  onRestart: () => void;
  restartLabel?: string;
  children?: React.ReactNode;
}

export function ResultShell({
  eyebrow,
  title,
  description,
  pillarColor,
  onRestart,
  restartLabel = '다시 체험하기',
  children,
}: ResultShellProps) {
  const tCommon = useTranslations('demos.common');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center gap-8 text-center"
    >
      <div className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-widest text-slate-400">{eyebrow}</p>
        <h2 className="font-display text-3xl font-bold [word-break:keep-all] sm:text-4xl" style={{ color: pillarColor }}>
          {title}
        </h2>
        {description && (
          <p className="mx-auto max-w-md text-sm leading-relaxed text-slate-300 [word-break:keep-all]">{description}</p>
        )}
      </div>

      {children}

      <div className="flex flex-col items-center gap-3 pt-2">
        <p className="text-xs text-slate-500">{tCommon('ctaMessage')}</p>
        <div className="flex gap-3">
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRestart}
            className="rounded-xl border border-slate-700 px-6 py-3 text-sm font-medium text-slate-300 transition-colors hover:border-slate-500"
          >
            {restartLabel}
          </motion.button>
          <Link
            href={QUOTE_HREF}
            className="rounded-xl px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-105"
            style={{ backgroundColor: pillarColor }}
          >
            {tCommon('ctaButton')}
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Panel ────────────────────────────────────────────── */

/** 결과 안의 섹션 박스 */
export function Panel({ title, children, className }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/60 p-5 text-left', className)}>
      {title && <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</p>}
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
    <div className={cn('w-full max-w-md space-y-4 text-left', className)}>
      {items.map((item, i) => (
        <div key={item.label} className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-300">{item.label}</span>
            <span className="font-semibold" style={{ color }}>
              {item.value}
              {suffix}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
            <motion.div
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${color}, ${color}cc)` }}
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
    <div>
      {title && <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</p>}
      <div className="flex flex-wrap justify-center gap-2">
        {items.map((item) => (
          <span key={item} className="rounded-full border border-slate-700 bg-slate-800/60 px-3 py-1 text-xs text-slate-300">
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
    <div className={cn('grid w-full max-w-md gap-3', columns === 3 ? 'grid-cols-3' : 'grid-cols-2')}>
      {items.map((item) => (
        <div key={item.label} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-left">
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
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto max-w-full" role="img" aria-label={axes.map((a) => `${a.label} ${a.value}`).join(', ')}>
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <polygon
          key={f}
          points={axes.map((_, i) => point(i, radius * f).join(',')).join(' ')}
          fill="none"
          stroke="#334155"
          strokeWidth="1"
        />
      ))}
      {axes.map((_, i) => {
        const [x, y] = point(i, radius);
        return <line key={i} x1={center} y1={center} x2={x} y2={y} stroke="#334155" strokeWidth="1" />;
      })}
      <motion.polygon
        points={polygon}
        fill={color}
        fillOpacity={0.25}
        stroke={color}
        strokeWidth="2"
        initial={{ opacity: 0, scale: 0.4 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ transformOrigin: `${center}px ${center}px` }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      />
      {axes.map((a, i) => {
        const [x, y] = point(i, radius + 20);
        return (
          <text key={a.label} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="11" fill="#cbd5e1">
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
  alt = 'AI 변환 결과',
  delayMs = 700,
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
  const [rendered, setRendered] = useState<{ src: string; lookKey: string; url: string } | null>(null);
  // src/look가 바뀌면 이전 결과는 버리고 다시 렌더링 중 상태로 보인다
  const output = rendered && rendered.src === src && rendered.lookKey === lookKey ? rendered.url : null;

  useEffect(() => {
    let alive = true;
    const started = performance.now();
    renderLook(src, JSON.parse(lookKey) as PhotoLook)
      .catch(() => src)
      .then((url) => {
        const wait = Math.max(0, delayMs - (performance.now() - started));
        window.setTimeout(() => alive && setRendered({ src, lookKey, url }), wait);
      });
    return () => {
      alive = false;
    };
  }, [src, lookKey, delayMs]);

  return (
    <div className={cn('relative overflow-hidden bg-slate-900', className)}>
      {output ? (
        <motion.img
          src={output}
          alt={alt}
          initial={{ opacity: 0, filter: 'blur(14px)', scale: 1.04 }}
          animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={cn('h-full w-full object-cover', imgClassName)}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900"
            animate={{ backgroundPositionX: ['0%', '200%'] }}
            style={{ backgroundSize: '200% 100%' }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="relative h-6 w-6 rounded-full border-2 border-teal-300 border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
          />
          <p className="relative text-xs text-slate-400">AI 렌더링 중…</p>
        </div>
      )}
      {output && children}
    </div>
  );
}
