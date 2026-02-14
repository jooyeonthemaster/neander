'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslations } from 'next-intl';
import { useQuoteStore } from '@/stores/quoteStore';
import { services } from '@/data/services';
import { formatKRW } from '@/lib/pricing';
import { cn } from '@/lib/utils';
import { ServiceConfigPanel } from './ServiceConfigPanel';

export function ServiceSelector() {
  const t = useTranslations('quote');
  const selectedServices = useQuoteStore((s) => s.services);
  const addService = useQuoteStore((s) => s.addService);
  const removeService = useQuoteStore((s) => s.removeService);
  const [expandedServiceKey, setExpandedServiceKey] = useState<string | null>(null);

  const selectableServices = services;

  function handleToggleService(serviceKey: string) {
    const existing = selectedServices.find((s) => s.serviceKey === serviceKey);
    if (existing) {
      removeService(existing.id);
      if (expandedServiceKey === serviceKey) {
        setExpandedServiceKey(null);
      }
    } else {
      addService(serviceKey);
      setExpandedServiceKey(serviceKey);
    }
  }

  function handleConfigClick(serviceKey: string) {
    setExpandedServiceKey(expandedServiceKey === serviceKey ? null : serviceKey);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:p-8">
        <h3 className="text-lg font-semibold text-slate-900 mb-1">
          {t('serviceTitle')}
        </h3>
        <p className="text-sm text-slate-500 mb-6">
          {t('serviceSubtitle')}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {selectableServices.map((service) => {
            const selected = selectedServices.find((s) => s.serviceKey === service.key);
            const isSelected = !!selected;
            const isExpanded = expandedServiceKey === service.key;

            return (
              <div key={service.id}>
                <motion.div
                  layout
                  className={cn(
                    'relative rounded-xl border-2 p-5 transition-all duration-300 cursor-pointer',
                    'focus-within:ring-2 focus-within:ring-teal-400 focus-within:ring-offset-2',
                    isSelected
                      ? 'border-teal-500 bg-gradient-to-br from-teal-50/80 to-white shadow-lg shadow-teal-500/10'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-md bg-white'
                  )}
                  whileHover={{ y: isSelected ? 0 : -2 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Selected checkmark */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-teal-600 text-white shadow-md z-10"
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                          <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className="flex h-10 w-10 items-center justify-center rounded-lg text-lg"
                        style={{ backgroundColor: `${service.color}15` }}
                        aria-hidden="true"
                      >
                        {service.icon}
                      </span>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900">
                          {t(`services.${service.key}.name`)}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {t('from')} {formatKRW(service.basePriceKRW)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <motion.button
                      type="button"
                      onClick={() => handleToggleService(service.key)}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className={cn(
                        'flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400',
                        isSelected
                          ? 'bg-teal-600 text-white hover:bg-teal-500'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      )}
                    >
                      {isSelected ? t('added') : t('add')}
                    </motion.button>

                    {isSelected && (
                      <motion.button
                        type="button"
                        onClick={() => handleConfigClick(service.key)}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={cn(
                          'flex h-9 w-9 items-center justify-center rounded-lg border transition-colors',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400',
                          isExpanded
                            ? 'border-teal-500 bg-teal-50 text-teal-600'
                            : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                        )}
                        aria-label={t('configure')}
                        aria-expanded={isExpanded}
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                          <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </motion.button>
                    )}
                  </div>

                  {/* Config panel below card */}
                  <AnimatePresence>
                    {isSelected && isExpanded && selected && (
                      <ServiceConfigPanel
                        selectedService={selected}
                        onRemove={() => {
                          removeService(selected.id);
                          setExpandedServiceKey(null);
                        }}
                      />
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            );
          })}
        </div>

        {/* Custom service CTA */}
        <div className="mt-4 rounded-xl border border-dashed border-slate-300 p-4 text-center">
          <p className="text-sm text-slate-500">
            <span className="mr-1.5">⚡</span>
            {t('customServiceCTA')}
          </p>
        </div>
      </div>
    </div>
  );
}
