'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useLocale, useTranslations } from 'next-intl';
import { experiences, pillars, type PillarId } from '@/data/experiences';
import { smoothScrollIntoView } from '@/lib/smooth-scroll';
import { Reveal } from '@/components/fx';
import { Title } from '@/components/site/Title';
import { SectionLabel } from '@/components/site/ui';
import { cn } from '@/lib/utils';
import { ProgramCard } from './ProgramCard';

/* ─────────────────────────────────────────────────────────
   전체 체험 프로그램 — 분류(필라)로 거른다.
   주소의 ?pillar= 값과 맞물려 있어 다른 페이지에서 걸러진 채로 들어올 수 있다 (예전 IndustryShowcase 와 같은 동작).
   영어 이름은 한국어판 카드의 작은 라벨로 쓰려고 서버에서 받아 온다.
   ───────────────────────────────────────────────────────── */

const subscribeToHydration = () => () => {};
const clientHydrationSnapshot = () => true;
const serverHydrationSnapshot = () => false;

export function ProgramExplorer({ initialPillar, namesEn, no }: { initialPillar?: PillarId; namesEn: Record<string, string>; no?: string }) {
  const t = useTranslations('services');
  const locale = useLocale();
  const ko = locale !== 'en';
  // 클라이언트 핸들러가 준비되기 전의 클릭은 받지 않는다
  const hydrated = useSyncExternalStore(subscribeToHydration, clientHydrationSnapshot, serverHydrationSnapshot);
  const [active, setActive] = useState<PillarId | 'all'>(initialPillar ?? 'all');
  const sectionRef = useRef<HTMLElement>(null);
  const pillarMap = useMemo(() => new Map(pillars.map((p) => [p.id, p])), []);
  const list = useMemo(() => (active === 'all' ? experiences : experiences.filter((e) => e.pillar === active)), [active]);

  const choose = useCallback((id: PillarId | 'all') => {
    if (id === active) return;
    setActive(id);
    const url = new URL(window.location.href);
    if (id === 'all') url.searchParams.delete('pillar');
    else url.searchParams.set('pillar', id);
    window.history.pushState(null, '', url);
  }, [active]);

  useEffect(() => {
    const onPopState = () => {
      const selected = new URLSearchParams(window.location.search).get('pillar');
      setActive(pillars.some((p) => p.id === selected) ? (selected as PillarId) : 'all');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // ?pillar= 로 들어오면 이 구역으로 내려 준다
  useEffect(() => {
    if (!initialPillar || !sectionRef.current) return;
    const timer = setTimeout(() => smoothScrollIntoView(sectionRef.current, { block: 'start' }), 400);
    return () => clearTimeout(timer);
  }, [initialPillar]);

  const pill = (id: PillarId | 'all', label: string, count: number) => {
    const on = active === id;
    return (
      <button
        key={id}
        type="button"
        onClick={() => choose(id)}
        disabled={!hydrated}
        aria-pressed={on}
        className={cn(
          'flex shrink-0 items-baseline gap-2 whitespace-nowrap rounded-full border px-5 py-2.5 text-[0.95rem] font-semibold transition-colors duration-300',
          on ? 'border-paper bg-paper text-ink' : 'border-paper/20 text-paper/70 hover:border-paper/60 hover:text-paper',
        )}
      >
        {label}
        <span aria-hidden="true" className={cn('font-display text-[0.7rem] font-bold', on ? 'text-ink/60' : 'text-accent')}>{count}</span>
      </button>
    );
  };

  return (
    <section ref={sectionRef} id="experiences" className="scroll-mt-20 border-t border-paper/10 bg-ink" aria-labelledby="program-explorer-heading">
      <div className="wrap section-y">
        <Reveal><SectionLabel no={no}>ALL PROGRAMS</SectionLabel></Reveal>
        <Title id="program-explorer-heading" en={['READY-MADE', 'EXPERIENCES.']} ko={ko ? `${t('industryTitle')} ${experiences.length}종` : undefined} className="mt-6" />

        <Reveal delay={100} className="-mx-[clamp(1.25rem,6vw,6.75rem)] mt-10 flex gap-2 overflow-x-auto px-[clamp(1.25rem,6vw,6.75rem)] pb-1 scrollbar-none lg:mt-12">
          {pill('all', t('allPillars'), experiences.length)}
          {pillars.map((p) => {
            const count = experiences.filter((e) => e.pillar === p.id).length;
            return count > 0 ? pill(p.id, t(p.nameKey), count) : null;
          })}
        </Reveal>

        <div className="mt-10 min-h-[20rem] lg:mt-12" aria-live="polite">
          <AnimatePresence mode="wait">
            <motion.ul
              key={active}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {list.map((exp) => {
                const pillar = pillarMap.get(exp.pillar);
                return (
                  <li key={exp.id}>
                    <ProgramCard slug={exp.slug} name={t(exp.nameKey)} nameEn={namesEn[exp.slug]} oneLiner={t(exp.oneLinerKey)} tag={pillar ? t(pillar.nameKey) : undefined} />
                  </li>
                );
              })}
            </motion.ul>
          </AnimatePresence>
          {list.length === 0 && <p className="py-16 text-center text-paper/50">{t('noExperiences')}</p>}
        </div>
      </div>
    </section>
  );
}
