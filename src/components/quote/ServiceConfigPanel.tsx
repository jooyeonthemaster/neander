'use client';

import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { useQuoteStore, type SelectedService } from '@/stores/quoteStore';
import { pricingTiers } from '@/data/pricing';
import { formatKRW } from '@/lib/pricing';
import { cn } from '@/lib/utils';

interface ServiceConfigPanelProps {
  selectedService: SelectedService;
  onRemove: () => void;
}

export function ServiceConfigPanel({ selectedService, onRemove }: ServiceConfigPanelProps) {
  const t = useTranslations('quote');
  const updateServiceOption = useQuoteStore((s) => s.updateServiceOption);

  const tier = pricingTiers.find((pt) => pt.serviceKey === selectedService.serviceKey);
  if (!tier) return null;

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="overflow-hidden"
    >
      <div className="mt-4 pt-4 border-t border-slate-200 space-y-4">
        {tier.options.map((option) => {
          const currentValue = selectedService.options[option.id] ?? option.defaultValue;

          return (
            <div key={option.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-600">
                  {t(`options.${option.labelKey}`)}
                </label>

                {/* Price indicator */}
                {option.type === 'toggle' && (
                  <span className="text-xs text-slate-400">
                    +{formatKRW(option.priceModifier as number)}
                  </span>
                )}
              </div>

              {/* Toggle option */}
              {option.type === 'toggle' && (
                <button
                  type="button"
                  role="switch"
                  aria-checked={currentValue === true}
                  onClick={() =>
                    updateServiceOption(selectedService.id, option.id, !currentValue)
                  }
                  className={cn(
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2',
                    currentValue === true ? 'bg-teal-600' : 'bg-slate-300'
                  )}
                >
                  <motion.span
                    layout
                    className="inline-block h-4 w-4 rounded-full bg-white shadow-sm"
                    animate={{ x: currentValue === true ? 22 : 4 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </button>
              )}

              {/* Select option */}
              {option.type === 'select' && option.choices && (
                <div className="flex flex-wrap gap-1.5">
                  {option.choices.map((choice) => (
                    <motion.button
                      key={choice.value}
                      type="button"
                      onClick={() =>
                        updateServiceOption(selectedService.id, option.id, choice.value)
                      }
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        'rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400',
                        currentValue === choice.value
                          ? 'bg-teal-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      )}
                      aria-pressed={currentValue === choice.value}
                    >
                      {t(`options.${choice.labelKey}`)}
                      {choice.price > 0 && (
                        <span className="ml-1 opacity-70">
                          +{formatKRW(choice.price)}
                        </span>
                      )}
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Number stepper */}
              {option.type === 'number' && (
                <div className="flex items-center gap-2">
                  <motion.button
                    type="button"
                    onClick={() =>
                      updateServiceOption(
                        selectedService.id,
                        option.id,
                        Math.max(option.min ?? 0, (currentValue as number) - 1)
                      )
                    }
                    whileTap={{ scale: 0.9 }}
                    disabled={(currentValue as number) <= (option.min ?? 0)}
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-md border text-sm font-bold transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400',
                      (currentValue as number) <= (option.min ?? 0)
                        ? 'border-slate-200 text-slate-300 cursor-not-allowed'
                        : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                    )}
                    aria-label={t('decrease')}
                  >
                    -
                  </motion.button>

                  <span className="min-w-[2rem] text-center text-sm font-semibold text-slate-900 tabular-nums">
                    {currentValue as number}
                  </span>

                  <motion.button
                    type="button"
                    onClick={() =>
                      updateServiceOption(
                        selectedService.id,
                        option.id,
                        Math.min(option.max ?? 99, (currentValue as number) + 1)
                      )
                    }
                    whileTap={{ scale: 0.9 }}
                    disabled={(currentValue as number) >= (option.max ?? 99)}
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-md border text-sm font-bold transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400',
                      (currentValue as number) >= (option.max ?? 99)
                        ? 'border-slate-200 text-slate-300 cursor-not-allowed'
                        : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                    )}
                    aria-label={t('increase')}
                  >
                    +
                  </motion.button>

                  <span className="text-xs text-slate-400 ml-1">
                    +{formatKRW(option.priceModifier as number)}/{t('each')}
                  </span>
                </div>
              )}
            </div>
          );
        })}

        {/* Subtotal & remove */}
        <div className="flex items-center justify-between pt-3 border-t border-dashed border-slate-200">
          <div className="text-xs text-slate-500">
            {t('subtotal')}:{' '}
            <span className="font-semibold text-slate-900">
              {formatKRW(selectedService.subtotal)}
            </span>
          </div>
          <button
            type="button"
            onClick={onRemove}
            className={cn(
              'text-xs text-rose-500 hover:text-rose-600 font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 rounded px-2 py-1'
            )}
          >
            {t('removeService')}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
