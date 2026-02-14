'use client';

import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { useQuoteStore } from '@/stores/quoteStore';
import { addOns } from '@/data/pricing';
import { formatKRW } from '@/lib/pricing';
import { cn } from '@/lib/utils';

export function AddOnsSection() {
  const t = useTranslations('quote');
  const selectedAddOns = useQuoteStore((s) => s.selectedAddOns);
  const toggleAddOn = useQuoteStore((s) => s.toggleAddOn);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:p-8">
      <h3 className="text-lg font-semibold text-slate-900 mb-1">
        {t('addOnsTitle')}
      </h3>
      <p className="text-sm text-slate-500 mb-6">
        {t('addOnsSubtitle')}
      </p>

      <div className="space-y-3">
        {addOns.map((addon) => {
          const isActive = selectedAddOns.includes(addon.id);

          return (
            <motion.div
              key={addon.id}
              layout
              className={cn(
                'flex items-center justify-between rounded-xl border-2 p-4 transition-all duration-300 cursor-pointer',
                isActive
                  ? 'border-teal-500 bg-teal-50/50 shadow-sm shadow-teal-500/5'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              )}
              onClick={() => toggleAddOn(addon.id)}
              role="checkbox"
              aria-checked={isActive}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleAddOn(addon.id);
                }
              }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-center gap-3">
                {/* Custom toggle */}
                <div className="relative">
                  <div
                    className={cn(
                      'h-6 w-11 rounded-full transition-colors duration-200',
                      isActive ? 'bg-teal-600' : 'bg-slate-300'
                    )}
                  >
                    <motion.div
                      className="absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm"
                      animate={{ left: isActive ? 22 : 4 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </div>
                </div>

                <div>
                  <span
                    className={cn(
                      'text-sm font-medium transition-colors',
                      isActive ? 'text-teal-700' : 'text-slate-700'
                    )}
                  >
                    {t(`addOns.${addon.labelKey}`)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'text-sm font-semibold tabular-nums transition-colors',
                    isActive ? 'text-teal-600' : 'text-slate-500'
                  )}
                >
                  +{formatKRW(addon.priceKRW)}
                </span>

                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 text-white"
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                      <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
