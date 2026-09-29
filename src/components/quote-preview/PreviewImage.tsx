'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ImageOff, LoaderCircle, RotateCcw } from 'lucide-react';
import type { Lang } from '@/lib/quote/catalog';
import { cn } from '@/lib/utils';

type LoadedImage = { src: string; alt: string };

/** Keep the last decoded image visible until the latest selection is ready. */
export function PreviewImage({ src, alt, lang, className, testId, announce = true }: {
  src: string;
  alt: string;
  lang: Lang;
  className?: string;
  testId: string;
  announce?: boolean;
}) {
  const [visible, setVisible] = useState<LoadedImage | null>(null);
  const [failed, setFailed] = useState<{ src: string; attempt: number } | null>(null);
  const [attempt, setAttempt] = useState(0);
  const reducedMotion = useReducedMotion();
  const hasError = failed?.src === src && failed.attempt === attempt;
  const loading = visible?.src !== src && !hasError;

  useEffect(() => {
    let active = true;
    const image = new window.Image();
    image.decoding = 'async';

    const fail = () => {
      if (active) setFailed({ src, attempt });
    };

    image.onload = async () => {
      // Decoding before the swap prevents a blank frame even for cached images.
      try {
        await image.decode();
        if (active) {
          setVisible({ src, alt });
          setFailed(null);
        }
      } catch {
        fail();
      }
    };
    image.onerror = fail;
    image.src = src;

    return () => {
      active = false;
      image.onload = null;
      image.onerror = null;
    };
  }, [src, alt, attempt]);

  return (
    <div data-testid={testId} data-asset-src={visible?.src ?? ''} data-requested-src={src}
      data-loading={loading ? 'true' : 'false'} data-error={hasError ? 'true' : 'false'}
      className={cn('relative isolate overflow-hidden bg-[#f4f2ef]', className)}>
      <div role="img" aria-label={visible?.alt ?? alt} className="absolute inset-0">
        <AnimatePresence initial={false}>
          {visible && (
            // Optimized, local WebP assets are predecoded above; direct img keeps swaps atomic.
            <motion.img key={visible.src} src={visible.src} alt="" aria-hidden="true" draggable={false}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.28, ease: 'easeOut' }}
              className="absolute inset-0 h-full w-full select-none object-contain" />
          )}
        </AnimatePresence>
      </div>

      {!visible && !hasError && (
        <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
          <div className="h-20 w-20 rounded-[28px] border border-white/90 bg-white/60 shadow-sm motion-safe:animate-pulse" />
        </div>
      )}

      <div role={announce ? 'status' : undefined} aria-live={announce ? 'polite' : 'off'} aria-atomic="true"
        className="pointer-events-none absolute bottom-3 left-3 z-10">
        {loading && (
          <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/90 px-3 py-2 text-[11px] font-medium text-slate-600 shadow-sm backdrop-blur-sm">
            <LoaderCircle size={13} aria-hidden="true" className="motion-safe:animate-spin" />
            {lang === 'ko' ? '선택한 모습 불러오는 중' : 'Loading your selection'}
          </span>
        )}
      </div>

      {hasError && (
        <div className={cn('absolute z-20 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-sm',
          visible ? 'inset-x-3 bottom-3' : 'inset-x-4 top-1/2 -translate-y-1/2')}>
          <ImageOff size={18} aria-hidden="true" className="shrink-0 text-slate-400" />
          <p role="status" className="flex-1 text-xs leading-relaxed text-slate-600">
            {lang === 'ko'
              ? (visible ? '새 이미지를 불러오지 못했어요. 이전 모습을 표시하고 있어요.' : '이미지를 불러오지 못했어요.')
              : (visible ? 'The new image could not load. Showing the previous view.' : 'This image could not load.')}
          </p>
          <button type="button" onClick={() => setAttempt((value) => value + 1)}
            className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-xl bg-teal-50 px-3 text-xs font-semibold text-teal-800 transition-colors hover:bg-teal-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 motion-reduce:transition-none">
            <RotateCcw size={13} aria-hidden="true" />{lang === 'ko' ? '다시 시도' : 'Retry'}
          </button>
        </div>
      )}
    </div>
  );
}
