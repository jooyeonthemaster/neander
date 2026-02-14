'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { StaggerChildren, StaggerItem } from '@/components/animations';
import { cn } from '@/lib/utils';

const valueIcons = [
  // Experience
  <svg key="exp" className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
  </svg>,
  // Innovation
  <svg key="inn" className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
  </svg>,
  // Collaboration
  <svg key="col" className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>,
  // Impact
  <svg key="imp" className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>,
];

const valueKeys = ['experience', 'innovation', 'collaboration', 'impact'] as const;

export function ValuesSection() {
  const t = useTranslations('about.values');

  return (
    <StaggerChildren className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-8">
      {valueKeys.map((key, i) => (
        <StaggerItem key={key}>
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={cn(
              'group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-8',
              'shadow-sm transition-colors duration-200',
              'hover:border-teal-200 hover:shadow-md'
            )}
          >
            {/* Top accent line */}
            <div
              className="absolute left-0 top-0 h-1 w-full origin-left scale-x-0 bg-gradient-to-r from-teal-500 to-cyan-400 transition-transform duration-300 group-hover:scale-x-100"
              aria-hidden="true"
            />

            {/* Icon */}
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600 transition-colors duration-200 group-hover:bg-teal-100">
              {valueIcons[i]}
            </div>

            {/* Title */}
            <h3 className="mb-3 text-lg font-bold text-slate-900">
              {t(`items.${key}.title`)}
            </h3>

            {/* Description */}
            <p className="text-sm leading-relaxed text-slate-500">
              {t(`items.${key}.description`)}
            </p>
          </motion.div>
        </StaggerItem>
      ))}
    </StaggerChildren>
  );
}
