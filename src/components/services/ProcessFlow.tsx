'use client';

import { useTranslations } from 'next-intl';
import { processSteps, type ProcessStep } from '@/data/services';
import { ScrollReveal, StaggerChildren, StaggerItem } from '@/components/animations';
import { cn } from '@/lib/utils';

/* ── Step icon SVGs ───────────────────────────────────── */

function StepIcon({ icon, className }: { icon: string; className?: string }) {
  const props = {
    xmlns: 'http://www.w3.org/2000/svg',
    width: 24,
    height: 24,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
    'aria-hidden': true as const,
  };

  switch (icon) {
    case 'lightbulb':
      return (
        <svg {...props}>
          <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
          <path d="M9 18h6" />
          <path d="M10 22h4" />
        </svg>
      );
    case 'code':
      return (
        <svg {...props}>
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      );
    case 'wrench':
      return (
        <svg {...props}>
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76Z" />
        </svg>
      );
    case 'play':
      return (
        <svg {...props}>
          <polygon points="6 3 20 12 6 21 6 3" />
        </svg>
      );
    default:
      return null;
  }
}

/* ── Connector line between steps ─────────────────────── */

function Connector({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center', className)} aria-hidden="true">
      {/* Horizontal connector (desktop) */}
      <div className="hidden lg:flex items-center w-full">
        <div className="h-px flex-1 bg-gradient-to-r from-teal-300 to-teal-200" />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mx-1 text-teal-400 flex-shrink-0"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      </div>

      {/* Vertical connector (mobile) */}
      <div className="flex lg:hidden flex-col items-center h-10">
        <div className="w-px flex-1 bg-gradient-to-b from-teal-300 to-teal-200" />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="my-0.5 text-teal-400 flex-shrink-0"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </div>
  );
}

/* ── Individual Step Card ─────────────────────────────── */

function StepCard({
  step,
  name,
  description,
}: {
  step: ProcessStep;
  name: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      {/* Step icon box */}
      <div className="relative mb-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 border border-teal-100">
          <StepIcon icon={step.icon} className="h-6 w-6 text-teal-600" />
        </div>
        <span
          className={cn(
            'absolute -top-2 -right-2',
            'flex h-6 w-6 items-center justify-center',
            'rounded-full bg-teal-600 text-[11px] font-bold text-white',
            'ring-2 ring-white'
          )}
        >
          {step.step}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-base font-bold tracking-tight text-neutral-900 sm:text-lg">
        {name}
      </h3>

      {/* Description */}
      <p className="mt-2 max-w-[220px] text-sm text-neutral-500 leading-relaxed">
        {description}
      </p>
    </div>
  );
}

/* ── ProcessFlow Section ──────────────────────────────── */

export function ProcessFlow() {
  const t = useTranslations('services');

  return (
    <section className="relative bg-neutral-50" aria-labelledby="process-flow-heading">
      <div className="section-padding">
        <div className="container-default">
          <ScrollReveal>
            <div className="max-w-2xl text-center mx-auto">
              <span className="inline-block mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-teal-600">
                PROCESS
              </span>
              <h2 id="process-flow-heading" className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl">
                {t('processTitle')}
              </h2>
              <p className="mt-4 text-base text-neutral-500 leading-relaxed sm:text-lg">
                {t('processSubtitle')}
              </p>
            </div>
          </ScrollReveal>

          <StaggerChildren
            staggerDelay={0.12}
            className="mt-12 lg:mt-16"
          >
            {/* Desktop: horizontal flow */}
            <div className="hidden lg:grid lg:grid-cols-7 lg:items-start lg:gap-2">
              {processSteps.map((step, idx) => (
                <StaggerItem
                  key={step.id}
                  className={idx < processSteps.length - 1 ? 'contents' : ''}
                >
                  <div className="col-span-1 flex justify-center">
                    <StepCard
                      step={step}
                      name={t(step.nameKey)}
                      description={t(step.descriptionKey)}
                    />
                  </div>

                  {idx < processSteps.length - 1 && (
                    <div className="col-span-1 flex items-center pt-8">
                      <Connector />
                    </div>
                  )}
                </StaggerItem>
              ))}
            </div>

            {/* Mobile: vertical flow */}
            <div className="flex flex-col items-center gap-0 lg:hidden">
              {processSteps.map((step, idx) => (
                <StaggerItem key={step.id}>
                  <StepCard
                    step={step}
                    name={t(step.nameKey)}
                    description={t(step.descriptionKey)}
                  />
                  {idx < processSteps.length - 1 && <Connector />}
                </StaggerItem>
              ))}
            </div>
          </StaggerChildren>
        </div>
      </div>
    </section>
  );
}
