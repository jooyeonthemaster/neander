'use client';

import { useRef, useMemo } from 'react';
import { motion, AnimatePresence, useInView } from 'motion/react';
import { useTranslations } from 'next-intl';
import { useQuoteStore } from '@/stores/quoteStore';
import { services as servicesData } from '@/data/services';
import { addOns } from '@/data/pricing';
import { formatKRW } from '@/lib/pricing';
import { useCountUp } from '@/hooks/useCountUp';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

export function QuoteSummary() {
  const t = useTranslations('quote');
  const selectedServices = useQuoteStore((s) => s.services);
  const eventDetails = useQuoteStore((s) => s.eventDetails);
  const selectedAddOns = useQuoteStore((s) => s.selectedAddOns);
  const getEstimate = useQuoteStore((s) => s.getEstimate);
  const reset = useQuoteStore((s) => s.reset);

  const estimate = getEstimate();

  const totalRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(totalRef, { once: false });

  const animatedTotal = useCountUp({
    target: Math.round(estimate.total / 10000),
    duration: 0.8,
    enabled: isInView,
  });

  const selectedAddOnDetails = useMemo(
    () => addOns.filter((a) => selectedAddOns.includes(a.id)),
    [selectedAddOns]
  );

  const hasContent = selectedServices.length > 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 px-6 py-4">
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M3 3h12M3 7h12M3 11h8M3 15h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          {t('quoteSummary')}
        </h3>
      </div>

      <div className="p-6 space-y-5">
        {/* Event info */}
        {eventDetails.location && (
          <div className="text-xs text-slate-500 space-y-1">
            <div className="flex justify-between">
              <span>{t('eventType')}</span>
              <span className="font-medium text-slate-700">{t(`eventTypes.${eventDetails.type}`)}</span>
            </div>
            {eventDetails.location && (
              <div className="flex justify-between">
                <span>{t('location')}</span>
                <span className="font-medium text-slate-700 truncate max-w-[140px]">{eventDetails.location}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>{t('duration')}</span>
              <span className="font-medium text-slate-700">{eventDetails.duration} {t('days')}</span>
            </div>
          </div>
        )}

        {/* Services list */}
        {hasContent && (
          <>
            <div className="border-t border-slate-100 pt-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                {t('selectedServices')}
              </p>
              <AnimatePresence mode="popLayout">
                <div className="space-y-2.5">
                  {selectedServices.map((svc) => {
                    const serviceInfo = servicesData.find((s) => s.key === svc.serviceKey);
                    return (
                      <motion.div
                        key={svc.id}
                        layout
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base" aria-hidden="true">{serviceInfo?.icon}</span>
                          <span className="text-slate-700 font-medium text-xs">
                            {t(`services.${svc.serviceKey}.name`)}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-slate-900 tabular-nums">
                          {formatKRW(svc.subtotal)}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </AnimatePresence>
            </div>

            {/* Add-ons */}
            {selectedAddOnDetails.length > 0 && (
              <div className="border-t border-slate-100 pt-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  {t('addOnsLabel')}
                </p>
                <div className="space-y-2">
                  {selectedAddOnDetails.map((addon) => (
                    <div key={addon.id} className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">{t(`addOns.${addon.labelKey}`)}</span>
                      <span className="font-medium text-slate-700 tabular-nums">
                        +{formatKRW(addon.priceKRW)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Duration multiplier */}
            {estimate.durationMultiplier > 1 && (
              <div className="flex items-center justify-between text-xs text-teal-600 bg-teal-50 rounded-lg px-3 py-2">
                <span className="font-medium">{t('durationMultiplier')}</span>
                <span className="font-bold tabular-nums">
                  x{estimate.durationMultiplier.toFixed(1)}
                </span>
              </div>
            )}

            {/* Separator */}
            <div className="border-t-2 border-slate-900 pt-4" ref={totalRef}>
              <div className="flex items-end justify-between">
                <span className="text-sm font-medium text-slate-500">{t('estimatedTotal')}</span>
                <div className="text-right">
                  <motion.div
                    key={estimate.total}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    className="font-display text-2xl font-bold text-slate-900 tabular-nums"
                  >
                    {estimate.total >= 10000
                      ? `${animatedTotal.toLocaleString()}${t('manwon')}`
                      : formatKRW(estimate.total)}
                  </motion.div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Empty state */}
        {!hasContent && (
          <div className="py-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 6v12M6 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-sm text-slate-400">{t('emptyServices')}</p>
          </div>
        )}

        {/* Disclaimer */}
        <p className="text-[11px] text-slate-400 leading-relaxed">
          {t('disclaimer')}
        </p>

        {/* Actions */}
        <div className="space-y-2.5">
          <Link
            href="/contact"
            className={cn(
              'flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition-all duration-200',
              hasContent
                ? 'bg-teal-600 text-white hover:bg-teal-500 shadow-md shadow-teal-600/20'
                : 'bg-slate-200 text-slate-400 pointer-events-none'
            )}
          >
            {t('requestQuote')}
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M3 7h8M8 3l3 4-3 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>

          {hasContent && (
            <button
              type="button"
              onClick={reset}
              className={cn(
                'w-full rounded-lg px-4 py-2.5 text-sm font-medium text-slate-500',
                'hover:text-slate-700 hover:bg-slate-100 transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400'
              )}
            >
              {t('reset')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
