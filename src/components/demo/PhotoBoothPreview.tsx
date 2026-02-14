'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { StyleSelector, type StyleId } from './StyleSelector';
import { BeforeAfterSlider } from './BeforeAfterSlider';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

type ProcessingState = 'idle' | 'uploading' | 'processing' | 'done';

export function PhotoBoothPreview() {
  const t = useTranslations('photoBooth');
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<StyleId | null>(null);
  const [processingState, setProcessingState] = useState<ProcessingState>('idle');
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const processImage = useCallback(
    (imageSrc: string, style: StyleId) => {
      setProcessingState('processing');

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;

        if (style === 'pixel') {
          // Pixel art: downscale then upscale with nearest-neighbor
          const smallW = Math.max(img.width / 12, 20);
          const smallH = Math.max(img.height / 12, 20);

          // Disable image smoothing for pixel art effect
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(img, 0, 0, smallW, smallH);
          ctx.drawImage(canvas, 0, 0, smallW, smallH, 0, 0, canvas.width, canvas.height);
        } else {
          // Draw full image first
          ctx.drawImage(img, 0, 0);

          if (style === 'watercolor') {
            ctx.filter = 'blur(1px) saturate(1.5) contrast(0.9)';
            ctx.globalAlpha = 0.95;
            ctx.drawImage(img, 0, 0);
            ctx.filter = 'none';
            ctx.globalAlpha = 1;
          } else if (style === 'retro') {
            ctx.filter = 'sepia(0.6) contrast(1.2)';
            ctx.drawImage(img, 0, 0);
            ctx.filter = 'none';

            // Grain overlay
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            for (let i = 0; i < data.length; i += 4) {
              const grain = (Math.random() - 0.5) * 40;
              data[i] = Math.min(255, Math.max(0, data[i]! + grain));
              data[i + 1] = Math.min(255, Math.max(0, data[i + 1]! + grain));
              data[i + 2] = Math.min(255, Math.max(0, data[i + 2]! + grain));
            }
            ctx.putImageData(imageData, 0, 0);
          } else if (style === 'cyberpunk') {
            ctx.filter = 'hue-rotate(180deg) saturate(2) brightness(1.1)';
            ctx.drawImage(img, 0, 0);
            ctx.filter = 'none';

            // Scanline overlay
            ctx.globalAlpha = 0.05;
            ctx.fillStyle = '#00ffff';
            for (let y = 0; y < canvas.height; y += 3) {
              ctx.fillRect(0, y, canvas.width, 1);
            }
            ctx.globalAlpha = 1;
          }
        }

        setTimeout(() => {
          const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
          setProcessedImage(dataUrl);
          setProcessingState('done');
        }, 2000);
      };
      img.src = imageSrc;
    },
    []
  );

  const handleFile = useCallback(
    (file: File) => {
      setError(null);

      if (!file.type.startsWith('image/')) {
        setError(t('errorNotImage'));
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setError(t('errorTooLarge'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setOriginalImage(result);
        setProcessedImage(null);
        setSelectedStyle(null);
        setProcessingState('idle');
      };
      reader.readAsDataURL(file);
    },
    [t]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleStyleSelect = useCallback(
    (style: StyleId) => {
      setSelectedStyle(style);
      if (originalImage) {
        processImage(originalImage, style);
      }
    },
    [originalImage, processImage]
  );

  const handleReset = useCallback(() => {
    setOriginalImage(null);
    setProcessedImage(null);
    setSelectedStyle(null);
    setProcessingState('idle');
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return (
    <div className="relative mx-auto max-w-2xl px-4 py-12 sm:py-20">
      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
        className="hidden"
        aria-hidden="true"
      />

      {/* Title */}
      <div className="text-center mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-400 mb-3">
          {t('category')}
        </p>
        <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">
          {t('title')}
        </h1>
        <p className="mt-3 text-sm text-slate-400">
          {t('subtitle')}
        </p>
      </div>

      {/* Upload zone / Image area */}
      <AnimatePresence mode="wait">
        {!originalImage && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              className={cn(
                'relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300 cursor-pointer',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400',
                isDragging
                  ? 'border-teal-400 bg-teal-500/10 scale-[1.02]'
                  : 'border-slate-700 bg-slate-900/50 hover:border-slate-500 hover:bg-slate-800/50'
              )}
              aria-label={t('uploadLabel')}
            >
              <motion.div
                animate={isDragging ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
                className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800"
              >
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                  <path d="M4 20l6-8 4 5 4-6 6 9" stroke="rgba(20,184,166,0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="18" cy="8" r="2.5" stroke="rgba(20,184,166,0.6)" strokeWidth="1.5" />
                  <rect x="2" y="4" width="24" height="20" rx="3" stroke="rgba(20,184,166,0.4)" strokeWidth="1.5" />
                </svg>
              </motion.div>

              <p className="text-sm font-medium text-slate-300 mb-1">
                {isDragging ? t('dropHere') : t('dragOrClick')}
              </p>
              <p className="text-xs text-slate-500">
                JPEG, PNG {t('upTo')} 5MB
              </p>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 text-center text-sm text-rose-400"
                role="alert"
              >
                {error}
              </motion.p>
            )}
          </motion.div>
        )}

        {originalImage && (
          <motion.div
            key="editor"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Image preview or comparison */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800">
              {processingState === 'done' && processedImage ? (
                <BeforeAfterSlider
                  beforeSrc={originalImage}
                  afterSrc={processedImage}
                />
              ) : (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={originalImage}
                    alt={t('uploadedImage')}
                    className="w-full h-auto max-h-[500px] object-contain"
                  />

                  {/* Processing overlay */}
                  {processingState === 'processing' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm"
                    >
                      {/* Shimmer effect */}
                      <div className="relative w-48 h-1.5 rounded-full bg-slate-800 overflow-hidden mb-4">
                        <motion.div
                          className="absolute inset-y-0 w-1/3 rounded-full bg-gradient-to-r from-transparent via-teal-400 to-transparent"
                          animate={{ x: ['-100%', '400%'] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                        />
                      </div>
                      <p className="text-sm font-medium text-slate-300">
                        {t('processing')}
                      </p>
                    </motion.div>
                  )}
                </div>
              )}
            </div>

            {/* Style selector */}
            <StyleSelector
              selectedStyle={selectedStyle}
              onSelect={handleStyleSelect}
              disabled={processingState === 'processing'}
            />

            {/* CTA Banner */}
            {processingState === 'done' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-2xl bg-gradient-to-r from-teal-600/20 to-cyan-600/20 border border-teal-500/20 p-5 text-center"
              >
                <p className="text-sm text-teal-300 font-medium mb-3">
                  {t('ctaMessage')}
                </p>
                <Link
                  href="/contact"
                  className={cn(
                    'inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold',
                    'bg-gradient-to-r from-teal-500 to-cyan-500 text-white',
                    'shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 transition-shadow',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400'
                  )}
                >
                  {t('ctaButton')}
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M3 7h8M8 3l3 4-3 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </motion.div>
            )}

            {/* Reset button */}
            <div className="text-center">
              <button
                type="button"
                onClick={handleReset}
                className={cn(
                  'inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium',
                  'text-slate-400 hover:text-white hover:bg-slate-800 transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400'
                )}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M1 7a6 6 0 1011.196-3M12.196 1v3h-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {t('tryAgain')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
