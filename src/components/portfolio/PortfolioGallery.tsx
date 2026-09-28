'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import type { PortfolioImageMetadata } from '@/types/admin';

interface PortfolioGalleryProps {
  images: string[];
  metadata?: Record<string, PortfolioImageMetadata>;
  title: string;
  locale: string;
  heading: string;
}

const KIND_LABELS = {
  ko: { photo: '사진', artwork: '제작물', screenshot: '화면 캡처', render: '렌더링' },
  en: { photo: 'Photo', artwork: 'Artwork', screenshot: 'Screenshot', render: 'Rendering' },
};

export function PortfolioGallery({ images, metadata, title, locale, heading }: PortfolioGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const headingId = useId();
  const captionId = useId();
  const isKo = locale === 'ko';
  const isOpen = activeIndex !== null;
  const activeImage = activeIndex === null ? null : images[activeIndex];

  function captionFor(src: string, index: number) {
    const item = metadata?.[src];
    const caption = isKo ? item?.caption_ko : item?.caption_en;
    return caption || (isKo ? item?.caption_en : item?.caption_ko) || `${title} · ${index + 1}`;
  }

  function kindFor(src: string) {
    const kind = metadata?.[src]?.kind;
    return kind ? KIND_LABELS[isKo ? 'ko' : 'en'][kind] : null;
  }

  function navigate(direction: number) {
    setActiveIndex((current) => current === null ? null : (current + direction + images.length) % images.length);
  }

  function close() {
    dialogRef.current?.close();
  }

  useEffect(() => {
    const dialog = dialogRef.current;
    if (isOpen && dialog && !dialog.open) dialog.showModal();
    if (!isOpen && dialog?.open) dialog.close();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [isOpen]);

  if (images.length === 0) return null;

  return (
    <section className="mt-12" aria-labelledby={headingId}>
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
        <h2 id={headingId} className="text-xl font-bold text-slate-900">
          {heading} <span className="ml-1 text-base font-normal text-slate-500">{images.length}</span>
        </h2>
        <p className="text-xs text-slate-500">{isKo ? '사진을 누르면 크게 볼 수 있습니다.' : 'Select an image to enlarge it.'}</p>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 sm:grid-cols-2">
        {images.map((src, index) => (
          <figure key={`${src}-${index}`} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <button
              type="button"
              className="group relative block w-full cursor-zoom-in bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-500"
              aria-label={isKo ? `${captionFor(src, index)} 확대 보기` : `Enlarge ${captionFor(src, index)}`}
              aria-haspopup="dialog"
              onClick={(event) => {
                triggerRef.current = event.currentTarget;
                setActiveIndex(index);
              }}
            >
              {/* Keep the original aspect ratio, including portrait and artwork images. */}
              <img src={src} alt={captionFor(src, index)} className="block h-auto w-full" loading="lazy" decoding="async" />
              <span className="absolute bottom-3 right-3 rounded-full bg-slate-950/70 p-2 text-white transition-colors group-hover:bg-teal-700" aria-hidden="true">
                <ZoomIn className="h-4 w-4" />
              </span>
            </button>
            <figcaption className="flex flex-wrap items-start gap-2 px-4 py-3 text-sm leading-relaxed text-slate-600">
              {kindFor(src) && <span className="shrink-0 rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{kindFor(src)}</span>}
              <span className="min-w-0 flex-1">{captionFor(src, index)}</span>
            </figcaption>
          </figure>
        ))}
      </div>

      <dialog
        ref={dialogRef}
        aria-label={isKo ? `${title} 이미지 확대 보기` : `${title} image viewer`}
        aria-describedby={activeImage ? captionId : undefined}
        className="fixed inset-0 m-auto h-[100dvh] max-h-none w-screen max-w-none flex-col border-0 bg-slate-950 p-0 text-white open:flex backdrop:bg-slate-950/90"
        data-lenis-prevent
        onCancel={(event) => { event.preventDefault(); close(); }}
        onClose={() => {
          setActiveIndex(null);
          triggerRef.current?.focus({ preventScroll: true });
        }}
        onKeyDown={(event) => {
          if (event.key === 'Tab') {
            const buttons = event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not([disabled])');
            const first = buttons[0];
            const last = buttons[buttons.length - 1];
            if (event.shiftKey && document.activeElement === first) {
              event.preventDefault();
              last?.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
              event.preventDefault();
              first?.focus();
            }
          }
          if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.preventDefault();
            navigate(event.key === 'ArrowLeft' ? -1 : 1);
          }
        }}
      >
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-white/10 px-4 py-3 sm:px-6">
          <p className="truncate text-sm text-slate-300">{title}</p>
          <button type="button" autoFocus onClick={close} aria-label={isKo ? '확대 보기 닫기' : 'Close image viewer'} className="shrink-0 rounded-full p-3 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300">
            <X className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        {activeImage && activeIndex !== null && (
          <>
            <div className="flex min-h-0 flex-1 items-center justify-center p-3 sm:p-6">
              <img src={activeImage} alt={captionFor(activeImage, activeIndex)} className="h-full w-full object-contain" />
            </div>
            <div className="shrink-0 border-t border-white/10 px-4 py-4 sm:px-6">
              <div className="mx-auto flex max-w-5xl items-center gap-3 sm:gap-6">
                {images.length > 1 && (
                  <button type="button" onClick={() => navigate(-1)} aria-label={isKo ? '이전 이미지' : 'Previous image'} className="shrink-0 rounded-full border border-white/25 p-3 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300">
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </button>
                )}
                <div className="min-w-0 flex-1 text-center" aria-live="polite" aria-atomic="true">
                  <p className="mb-1 text-xs text-slate-400">{activeIndex + 1} / {images.length}{kindFor(activeImage) ? ` · ${kindFor(activeImage)}` : ''}</p>
                  <p id={captionId} className="max-h-24 overflow-y-auto text-sm leading-relaxed text-slate-200">{captionFor(activeImage, activeIndex)}</p>
                </div>
                {images.length > 1 && (
                  <button type="button" onClick={() => navigate(1)} aria-label={isKo ? '다음 이미지' : 'Next image'} className="shrink-0 rounded-full border border-white/25 p-3 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300">
                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </dialog>
    </section>
  );
}
