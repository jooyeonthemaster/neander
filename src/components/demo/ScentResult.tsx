'use client';

import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { type ScentProfile } from '@/data/scent-quiz';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { ScentRadarChart } from './ScentRadarChart';

interface ScentResultProps {
  profile: ScentProfile;
  onRestart: () => void;
}

export function ScentResult({ profile, onRestart }: ScentResultProps) {
  const t = useTranslations('scentQuiz');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-400 mb-3"
        >
          {t('yourScent')}
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="font-display text-4xl font-bold text-white sm:text-5xl"
        >
          {profile.name}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-3 text-base text-slate-400 italic"
        >
          &ldquo;{profile.description}&rdquo;
        </motion.p>
      </div>

      {/* Radar chart */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="flex justify-center"
      >
        <ScentRadarChart scores={profile.scores} />
      </motion.div>

      {/* Notes breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-2xl border border-slate-700/50 bg-slate-900/80 backdrop-blur p-6 space-y-5"
      >
        {/* Top notes */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-teal-400" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {t('topNotes')}
            </h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.topNotes.map((note) => (
              <span
                key={note}
                className="rounded-full bg-teal-500/10 border border-teal-500/20 px-3 py-1 text-sm text-teal-300 font-medium"
              >
                {note}
              </span>
            ))}
          </div>
        </div>

        {/* Middle notes */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-cyan-400" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {t('middleNotes')}
            </h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.middleNotes.map((note) => (
              <span
                key={note}
                className="rounded-full bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 text-sm text-cyan-300 font-medium"
              >
                {note}
              </span>
            ))}
          </div>
        </div>

        {/* Base notes */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-slate-400" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {t('baseNotes')}
            </h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.baseNotes.map((note) => (
              <span
                key={note}
                className="rounded-full bg-slate-500/10 border border-slate-500/20 px-3 py-1 text-sm text-slate-300 font-medium"
              >
                {note}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="space-y-4 text-center"
      >
        <div className="rounded-2xl bg-gradient-to-r from-teal-600/20 to-cyan-600/20 border border-teal-500/20 p-6">
          <p className="text-sm text-teal-300 font-medium mb-4">
            {t('ctaMessage')}
          </p>
          <Link
            href="/contact"
            className={cn(
              'inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold',
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
        </div>

        <button
          type="button"
          onClick={onRestart}
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
      </motion.div>
    </div>
  );
}
