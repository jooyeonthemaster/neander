'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { useTranslations } from 'next-intl';
import { timelineData } from '@/data/timeline';
import { TimelineItem } from './TimelineItem';
import { cn } from '@/lib/utils';

export function Timeline() {
  const t = useTranslations('about.timeline');
  const tEntries = useTranslations('about.timeline.entries');
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 80%', 'end 20%'],
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <div ref={containerRef} className="relative">
      {/* Central vertical line (desktop) / left line (mobile) */}
      <div
        className="absolute left-6 top-0 h-full w-px bg-slate-200 lg:left-1/2 lg:-translate-x-px"
        aria-hidden="true"
      />
      {/* Animated progress line */}
      <motion.div
        className="absolute left-6 top-0 w-px bg-gradient-to-b from-teal-500 to-cyan-400 lg:left-1/2 lg:-translate-x-px"
        style={{ height: lineHeight }}
        aria-hidden="true"
      />

      <div className="space-y-16 lg:space-y-20">
        {timelineData.map((yearEntry, yearIndex) => {
          const yearKey = yearEntry.year.toString();

          return (
            <div key={yearEntry.year} className="relative">
              {/* Year badge */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{
                  delay: 0.1,
                  duration: 0.4,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
                className={cn(
                  'relative z-10 mb-8',
                  'flex items-center gap-4',
                  'lg:justify-center'
                )}
              >
                {/* Year circle */}
                <div
                  className={cn(
                    'flex h-12 w-12 shrink-0 items-center justify-center rounded-full',
                    'bg-teal-600 text-sm font-bold text-white shadow-lg shadow-teal-500/25'
                  )}
                >
                  {`'${String(yearEntry.year).slice(-2)}`}
                </div>
                <div className="lg:absolute lg:left-[calc(50%+40px)]">
                  <span className="text-lg font-bold text-slate-900">
                    {tEntries(`${yearKey}.title`)}
                  </span>
                </div>
              </motion.div>

              {/* Events for this year */}
              <div className="space-y-4 lg:space-y-6">
                {yearEntry.events.map((event, eventIndex) => {
                  // Desktop: alternate left/right within each year
                  const isLeftDesktop = eventIndex % 2 === 0;
                  const delay = 0.1 + eventIndex * 0.1;

                  return (
                    <div
                      key={`${yearEntry.year}-${eventIndex}`}
                      className={cn(
                        'relative grid grid-cols-1 gap-4',
                        'pl-14', // mobile: offset for left line
                        'lg:grid-cols-2 lg:gap-12 lg:pl-0'
                      )}
                    >
                      {/* Dot on line */}
                      <div
                        className={cn(
                          'absolute left-[21px] top-5 h-3 w-3 rounded-full',
                          'border-2 border-teal-500 bg-white',
                          'lg:left-1/2 lg:-translate-x-1.5'
                        )}
                        aria-hidden="true"
                      />

                      {/* Desktop: left or right placement */}
                      {isLeftDesktop ? (
                        <>
                          <div className="lg:pr-12 lg:text-right">
                            <TimelineItem
                              title={tEntries(`${yearKey}.events.${eventIndex}`)}
                              description=""
                              icon={event.icon}
                              side="left"
                              delay={delay}
                            />
                          </div>
                          <div className="hidden lg:block" />
                        </>
                      ) : (
                        <>
                          <div className="hidden lg:block" />
                          <div className="lg:pl-12">
                            <TimelineItem
                              title={tEntries(`${yearKey}.events.${eventIndex}`)}
                              description=""
                              icon={event.icon}
                              side="right"
                              delay={delay}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
