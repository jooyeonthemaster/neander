'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

/* ─────────────────────────────────────────────────────────
   Language Toggle
   Pill-shaped KR / EN switcher with sliding indicator
   ───────────────────────────────────────────────────────── */

interface LanguageToggleProps {
  className?: string;
  /** Translucent track and light labels for use over a dark background */
  inverted?: boolean;
}

export default function LanguageToggle({ className, inverted = false }: LanguageToggleProps) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  function switchLocale(nextLocale: 'ko' | 'en') {
    if (nextLocale === locale) return;
    router.replace(pathname, { locale: nextLocale });
  }

  const isKo = locale === 'ko';

  return (
    <div
      className={cn(
        'relative flex h-9 items-center rounded-full border p-0.5 transition-colors',
        inverted
          ? 'border-white/20 bg-white/10 backdrop-blur-sm'
          : 'border-neutral-200 bg-neutral-50',
        className,
      )}
      role="radiogroup"
      aria-label="Language selection"
    >
      {/* Sliding indicator */}
      <motion.div
        className="absolute top-0.5 h-8 w-[calc(50%-2px)] rounded-full bg-white shadow-sm"
        layout
        animate={{ x: isKo ? 0 : '100%' }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      />

      <button
        role="radio"
        aria-checked={isKo}
        onClick={() => switchLocale('ko')}
        className={cn(
          'relative z-10 flex h-8 w-12 items-center justify-center rounded-full text-xs font-semibold tracking-wide transition-colors',
          isKo
            ? 'text-teal-600'
            : inverted
              ? 'text-white/60 hover:text-white'
              : 'text-neutral-400 hover:text-neutral-600',
        )}
      >
        KR
      </button>

      <button
        role="radio"
        aria-checked={!isKo}
        onClick={() => switchLocale('en')}
        className={cn(
          'relative z-10 flex h-8 w-12 items-center justify-center rounded-full text-xs font-semibold tracking-wide transition-colors',
          !isKo
            ? 'text-teal-600'
            : inverted
              ? 'text-white/60 hover:text-white'
              : 'text-neutral-400 hover:text-neutral-600',
        )}
      >
        EN
      </button>
    </div>
  );
}
