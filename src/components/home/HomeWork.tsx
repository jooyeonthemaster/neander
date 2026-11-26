'use client';

import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useFirestorePortfolio, type DisplayPortfolio } from '@/hooks/useFirestorePortfolio';
import { HOME_WORK_PRIORITY } from '@/data/site';
import { Reveal } from '@/components/fx';
import { Title } from '@/components/site/Title';
import { ArrowLink, SectionLabel } from '@/components/site/ui';
import { cn } from '@/lib/utils';

/* ─────────────────────────────────────────────────────────
   홈 「FROM THE FIELD」 — 운영 사례 6건.
   기업·기관 방문자가 많이 본 사례(HOME_WORK_PRIORITY)를 먼저 올리고, 모자라면 관리자가 '대표'로 표시한 사례로 채운다.
   ───────────────────────────────────────────────────────── */

function pick(projects: DisplayPortfolio[]): DisplayPortfolio[] {
  const bySlug = new Map(projects.map((p) => [p.slug, p]));
  const picked: DisplayPortfolio[] = [];
  for (const slug of HOME_WORK_PRIORITY) {
    const p = bySlug.get(slug);
    if (p) picked.push(p);
  }
  for (const p of projects) {
    if (picked.length >= 6) break;
    if (p.is_featured && !picked.includes(p)) picked.push(p);
  }
  return picked.slice(0, 6);
}

export function HomeWork() {
  const t = useTranslations('portfolio');
  const locale = useLocale();
  const ko = locale !== 'en';
  const { projects } = useFirestorePortfolio();
  const items = pick(projects);
  if (items.length === 0) return null;

  return (
    <section id="work" className="relative bg-ink">
      <div className="wrap section-y">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Reveal><SectionLabel no="02">SELECTED WORK</SectionLabel></Reveal>
            <Title en={['FROM', 'THE FIELD.']} ko={ko ? '직접 운영한 현장' : undefined} className="mt-6" />
          </div>
          <Reveal delay={120}><ArrowLink href="/portfolio">{ko ? '전체 프로젝트' : 'ALL PROJECTS'}</ArrowLink></Reveal>
        </div>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3 lg:gap-5">
          {items.map((p, i) => {
            const title = ko ? p.title_ko : p.title_en || p.title_ko;
            const client = (ko ? p.client_ko : p.client_en) || p.client;
            return (
              <li key={p.slug} className={cn(i === 0 && 'sm:col-span-2 lg:row-span-2')}>
                <Reveal variant="clip" delay={(i % 3) * 90} className="h-full">
                  <Link
                    href={`/portfolio/${p.slug}`}
                    data-cursor="VIEW"
                    className={cn('group relative block h-full w-full overflow-hidden bg-ink-2', i === 0 ? 'aspect-[4/3] lg:aspect-auto lg:min-h-[38rem]' : 'aspect-[4/3]')}
                  >
                    {p.thumbnail && (
                      <Image
                        src={p.thumbnail}
                        alt={title}
                        fill
                        sizes={i === 0 ? '(min-width: 1024px) 62vw, 100vw' : '(min-width: 1024px) 31vw, (min-width: 640px) 50vw, 100vw'}
                        className="rd-zoom object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/45 via-40% to-transparent transition-opacity duration-500 group-hover:opacity-85" aria-hidden="true" />
                    <div className="absolute inset-x-0 bottom-0 p-5 lg:p-7">
                      <p className="t-label text-accent">
                        {t(`filterCategories.${p.category}`)}
                        {p.year ? <span className="ml-3 text-paper/55">{p.year}</span> : null}
                      </p>
                      <h3 className={cn('t-kr-title mt-2.5 text-paper', i === 0 ? 'text-2xl lg:text-[2.1rem]' : 'text-lg lg:text-xl')}>{title}</h3>
                      {client && <p className="mt-1.5 text-sm text-paper/55">{client}</p>}
                    </div>
                    <span aria-hidden="true" className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-paper/40 font-display text-paper opacity-0 transition-all duration-500 group-hover:opacity-100 group-focus-visible:opacity-100 pointer-coarse:opacity-100 lg:hidden">→</span>
                  </Link>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
