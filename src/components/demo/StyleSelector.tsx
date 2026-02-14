'use client';

import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

export type StyleId = 'watercolor' | 'pixel' | 'retro' | 'cyberpunk';

interface StyleSelectorProps {
  selectedStyle: StyleId | null;
  onSelect: (style: StyleId) => void;
  disabled?: boolean;
}

interface StyleOption {
  id: StyleId;
  emoji: string;
  gradient: string;
}

const STYLES: StyleOption[] = [
  { id: 'watercolor', emoji: '🎨', gradient: 'from-blue-400/20 to-teal-400/20' },
  { id: 'pixel', emoji: '👾', gradient: 'from-green-400/20 to-lime-400/20' },
  { id: 'retro', emoji: '📷', gradient: 'from-amber-400/20 to-orange-400/20' },
  { id: 'cyberpunk', emoji: '🌐', gradient: 'from-fuchsia-400/20 to-cyan-400/20' },
];

export function StyleSelector({ selectedStyle, onSelect, disabled }: StyleSelectorProps) {
  const t = useTranslations('photoBooth');

  return (
    <div>
      <p className="text-sm font-medium text-slate-300 mb-3 text-center">
        {t('selectStyle')}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {STYLES.map((style) => {
          const isSelected = selectedStyle === style.id;

          return (
            <motion.button
              key={style.id}
              type="button"
              onClick={() => onSelect(style.id)}
              disabled={disabled}
              whileHover={disabled ? undefined : { scale: 1.05, y: -2 }}
              whileTap={disabled ? undefined : { scale: 0.95 }}
              className={cn(
                'relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all duration-300',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
                isSelected
                  ? 'border-teal-500 shadow-lg shadow-teal-500/20'
                  : 'border-slate-700 hover:border-slate-500',
                disabled && 'opacity-50 cursor-not-allowed',
                `bg-gradient-to-br ${style.gradient}`
              )}
              aria-pressed={isSelected}
            >
              <span className="text-2xl">{style.emoji}</span>
              <span
                className={cn(
                  'text-xs font-semibold',
                  isSelected ? 'text-teal-300' : 'text-slate-400'
                )}
              >
                {t(`styles.${style.id}`)}
              </span>

              {isSelected && (
                <motion.div
                  layoutId="style-indicator"
                  className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-teal-500 text-white shadow"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                    <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
