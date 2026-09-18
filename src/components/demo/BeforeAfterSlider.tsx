'use client';

import { useState, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface BeforeAfterSliderProps {
  beforeSrc: string;
  afterSrc: string;
  className?: string;
}

export function BeforeAfterSlider({ beforeSrc, afterSrc, className }: BeforeAfterSliderProps) {
  const t = useTranslations('photoBooth');
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback((clientX: number) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.min(100, Math.max(0, (x / rect.width) * 100));
    setPosition(percent);
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      setIsDragging(true);
      updatePosition(e.clientX);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [updatePosition]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      updatePosition(e.clientX);
    },
    [isDragging, updatePosition]
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn('relative select-none overflow-hidden cursor-col-resize', className)}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      role="slider"
      aria-label={t('compareSlider')}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(position)}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') {
          setPosition((p) => Math.max(0, p - 2));
        } else if (e.key === 'ArrowRight') {
          setPosition((p) => Math.min(100, p + 2));
        }
      }}
    >
      {/* After image (full width, bottom layer) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={afterSrc}
        alt={t('afterImage')}
        className="block w-full h-auto max-h-[500px] object-contain"
        draggable={false}
      />

      {/* Before image — after 이미지와 같은 크기로 겹쳐 두고 왼쪽 position%만 보이게 자른다 */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={beforeSrc}
        alt={t('beforeImage')}
        className="absolute inset-0 block h-full w-full object-contain"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        draggable={false}
      />

      {/* Divider line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]"
        style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
      >
        {/* Drag handle */}
        <motion.div
          className={cn(
            'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
            'flex h-10 w-10 items-center justify-center rounded-full',
            'bg-white shadow-xl border-2',
            isDragging ? 'border-teal-400 scale-110' : 'border-slate-300'
          )}
          animate={{ scale: isDragging ? 1.15 : 1 }}
          transition={{ duration: 0.15 }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M5 3L2 8l3 5M11 3l3 5-3 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500" />
          </svg>
        </motion.div>
      </div>

      {/* Labels */}
      <div className="absolute top-3 left-3 rounded-md bg-black/60 backdrop-blur-sm px-2.5 py-1">
        <span className="text-xs font-semibold text-white">Before</span>
      </div>
      <div className="absolute top-3 right-3 rounded-md bg-black/60 backdrop-blur-sm px-2.5 py-1">
        <span className="text-xs font-semibold text-white">After</span>
      </div>
    </div>
  );
}
