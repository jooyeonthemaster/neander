'use client';

import { useCallback } from 'react';
import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { useQuoteStore, type EventDetails } from '@/stores/quoteStore';
import { cn } from '@/lib/utils';

const EVENT_TYPES = ['popup', 'festival', 'exhibition', 'concert', 'brand-event', 'other'] as const;

const ATTENDEE_MARKS = [50, 100, 200, 500, 1000];

const VENUE_SIZES = [
  { value: 'small' as const, icon: 'S', area: '~100m2' },
  { value: 'medium' as const, icon: 'M', area: '100-300m2' },
  { value: 'large' as const, icon: 'L', area: '300m2+' },
];

export function EventDetailsForm() {
  const t = useTranslations('quote');
  const eventDetails = useQuoteStore((s) => s.eventDetails);
  const updateEventDetails = useQuoteStore((s) => s.updateEventDetails);

  const handleUpdate = useCallback(
    <K extends keyof EventDetails>(key: K, value: EventDetails[K]) => {
      updateEventDetails({ [key]: value });
    },
    [updateEventDetails]
  );

  // Find closest mark for display
  const closestMark = ATTENDEE_MARKS.reduce((prev, curr) =>
    Math.abs(curr - eventDetails.expectedAttendees) < Math.abs(prev - eventDetails.expectedAttendees)
      ? curr
      : prev
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:p-8 space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-1">
          {t('eventDetailsTitle')}
        </h3>
        <p className="text-sm text-slate-500">
          {t('eventDetailsSubtitle')}
        </p>
      </div>

      {/* Event Type */}
      <fieldset>
        <legend className="text-sm font-medium text-slate-700 mb-3">
          {t('eventType')}
        </legend>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {EVENT_TYPES.map((type) => (
            <motion.button
              key={type}
              type="button"
              onClick={() => handleUpdate('type', type)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                'rounded-lg border px-4 py-3 text-sm font-medium transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400',
                eventDetails.type === type
                  ? 'border-teal-500 bg-teal-50 text-teal-700 shadow-sm shadow-teal-500/10'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              )}
              aria-pressed={eventDetails.type === type}
            >
              {t(`eventTypes.${type}`)}
            </motion.button>
          ))}
        </div>
      </fieldset>

      {/* Duration */}
      <div>
        <label className="text-sm font-medium text-slate-700 mb-3 block">
          {t('duration')}
        </label>
        <div className="flex items-center gap-3">
          <motion.button
            type="button"
            onClick={() => handleUpdate('duration', Math.max(1, eventDetails.duration - 1))}
            whileTap={{ scale: 0.9 }}
            disabled={eventDetails.duration <= 1}
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg border text-lg font-bold transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400',
              eventDetails.duration <= 1
                ? 'border-slate-200 text-slate-300 cursor-not-allowed'
                : 'border-slate-300 text-slate-600 hover:bg-slate-50 hover:border-slate-400'
            )}
            aria-label={t('decrease')}
          >
            -
          </motion.button>

          <div className="flex h-12 w-20 items-center justify-center rounded-lg border border-slate-300 bg-slate-50 font-display text-xl font-bold text-slate-900 tabular-nums">
            {eventDetails.duration}
          </div>

          <motion.button
            type="button"
            onClick={() => handleUpdate('duration', Math.min(30, eventDetails.duration + 1))}
            whileTap={{ scale: 0.9 }}
            disabled={eventDetails.duration >= 30}
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg border text-lg font-bold transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400',
              eventDetails.duration >= 30
                ? 'border-slate-200 text-slate-300 cursor-not-allowed'
                : 'border-slate-300 text-slate-600 hover:bg-slate-50 hover:border-slate-400'
            )}
            aria-label={t('increase')}
          >
            +
          </motion.button>

          <span className="text-sm text-slate-500 ml-1">{t('days')}</span>

          {eventDetails.duration > 1 && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="ml-auto text-xs font-medium text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full"
            >
              x{(1 + (eventDetails.duration - 1) * 0.3).toFixed(1)} {t('multiplier')}
            </motion.span>
          )}
        </div>
      </div>

      {/* Expected Attendees */}
      <div>
        <label htmlFor="attendees-slider" className="text-sm font-medium text-slate-700 mb-3 block">
          {t('expectedAttendees')}
        </label>
        <div className="space-y-3">
          <div className="relative">
            <input
              id="attendees-slider"
              type="range"
              min={50}
              max={1000}
              step={10}
              value={eventDetails.expectedAttendees}
              onChange={(e) => handleUpdate('expectedAttendees', Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer
                         bg-gradient-to-r from-teal-200 to-teal-500
                         [&::-webkit-slider-thumb]:appearance-none
                         [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5
                         [&::-webkit-slider-thumb]:rounded-full
                         [&::-webkit-slider-thumb]:bg-teal-600
                         [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white
                         [&::-webkit-slider-thumb]:shadow-md
                         [&::-webkit-slider-thumb]:transition-transform
                         [&::-webkit-slider-thumb]:hover:scale-110
                         [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5
                         [&::-moz-range-thumb]:rounded-full
                         [&::-moz-range-thumb]:bg-teal-600
                         [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white
                         [&::-moz-range-thumb]:shadow-md"
              aria-valuemin={50}
              aria-valuemax={1000}
              aria-valuenow={eventDetails.expectedAttendees}
              aria-valuetext={`${eventDetails.expectedAttendees} ${t('people')}`}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            {ATTENDEE_MARKS.map((mark) => (
              <button
                key={mark}
                type="button"
                onClick={() => handleUpdate('expectedAttendees', mark)}
                className={cn(
                  'tabular-nums transition-colors hover:text-teal-600',
                  'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal-400 rounded',
                  closestMark === mark && 'text-teal-600 font-semibold'
                )}
              >
                {mark === 1000 ? '1,000+' : mark}
              </button>
            ))}
          </div>
          <p className="text-center text-sm font-semibold text-teal-600 tabular-nums">
            {eventDetails.expectedAttendees.toLocaleString()} {t('people')}
          </p>
        </div>
      </div>

      {/* Venue Size */}
      <fieldset>
        <legend className="text-sm font-medium text-slate-700 mb-3">
          {t('venueSize')}
        </legend>
        <div className="grid grid-cols-3 gap-3">
          {VENUE_SIZES.map((size) => (
            <motion.button
              key={size.value}
              type="button"
              onClick={() => handleUpdate('venueSize', size.value)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={cn(
                'relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400',
                eventDetails.venueSize === size.value
                  ? 'border-teal-500 bg-teal-50/50 shadow-md shadow-teal-500/10'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              )}
              aria-pressed={eventDetails.venueSize === size.value}
            >
              <span
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold transition-colors',
                  eventDetails.venueSize === size.value
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-100 text-slate-500'
                )}
              >
                {size.icon}
              </span>
              <span
                className={cn(
                  'text-sm font-medium',
                  eventDetails.venueSize === size.value ? 'text-teal-700' : 'text-slate-700'
                )}
              >
                {t(`venueSizes.${size.value}`)}
              </span>
              <span className="text-xs text-slate-400">{size.area}</span>

              {eventDetails.venueSize === size.value && (
                <motion.div
                  layoutId="venue-indicator"
                  className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 text-white"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                    <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
      </fieldset>

      {/* Location */}
      <div>
        <label htmlFor="location-input" className="text-sm font-medium text-slate-700 mb-2 block">
          {t('location')}
        </label>
        <input
          id="location-input"
          type="text"
          value={eventDetails.location}
          onChange={(e) => handleUpdate('location', e.target.value)}
          placeholder={t('locationPlaceholder')}
          className={cn(
            'w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm',
            'outline-none transition-all duration-200',
            'focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20',
            'placeholder:text-slate-400'
          )}
        />
      </div>

      {/* Preferred Date */}
      <div>
        <label htmlFor="date-input" className="text-sm font-medium text-slate-700 mb-2 block">
          {t('preferredDate')}
        </label>
        <input
          id="date-input"
          type="date"
          value={eventDetails.date}
          onChange={(e) => handleUpdate('date', e.target.value)}
          className={cn(
            'w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm',
            'outline-none transition-all duration-200',
            'focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20',
            'text-slate-700'
          )}
        />
      </div>
    </div>
  );
}
