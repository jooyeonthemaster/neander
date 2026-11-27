'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useLocale } from 'next-intl';
import { AnimatePresence, motion } from 'motion/react';
import { Search, X } from 'lucide-react';
import { useFirestorePortfolio, type DisplayPortfolio } from '@/hooks/useFirestorePortfolio';
import { DEVELOPMENT_PROJECTS, type DevelopmentProject } from '@/data/development-projects';
import { DEVELOPMENT_COPY } from '@/components/development/copy';
import { Link } from '@/i18n/navigation';
import { HoverPreviewList, HoverPreviewRow, Reveal } from '@/components/fx';
import { cn } from '@/lib/utils';

/* ─────────────────────────────────────────────────────────
   포트폴리오 목록 (2026-11 개편 · 목업 output/site-mockup-2026-11/5_포트폴리오.png)
   · 분류 탭 + 검색 + 격자/목록 전환 + 최신순/오래된순
   · 격자: 맨 위 큰 사례 1개 → 큰 카드 2장 줄과 작은 카드 3장 줄이 번갈아 나온다. 10개씩 더 본다
   · 목록 보기에서는 줄에 마우스를 올리면 사진이 커서를 따라 뜬다
   · 행사 사례(Firestore)와 프로그램 개발 프로젝트(/development)를 함께 보여 준다 — 날짜가 없는 프로그램 개발은 맨 뒤
   ───────────────────────────────────────────────────────── */

type Division = 'all' | 'online' | 'offline' | 'service' | 'ip';
type Category = Exclude<Division, 'all'>;

const DIVISIONS: { id: Category; ko: string; en: string }[] = [
  { id: 'offline', ko: '행사 · 현장 운영', en: 'Events · On-site' },
  { id: 'ip', ko: '굿즈 · IP 협업', en: 'Goods · IP' },
  { id: 'service', ko: '자체 브랜드', en: 'Own brand' },
  { id: 'online', ko: '온라인', en: 'Online' },
];

/** 한 번에 더 보여 주는 카드 수 — 큰 카드 2 + 작은 카드 3 이 두 번 */
const PAGE = 10;
/** 큰 카드 2장 → 작은 카드 3장 순서 */
const isBig = (index: number) => index % 5 < 2;

/** 목록에 함께 보여 주는 항목: 행사 사례(Firestore)와 프로그램 개발 프로젝트(/development) */
interface GridItem {
  key: string;
  category: Category;
  title: string;
  client: string;
  /** 카드 위 왼쪽 — 기간 (프로그램 개발 프로젝트는 분류 이름) */
  date: string;
  /** 사진 위 칩 — 첫 번째 영어 태그 */
  chip: string;
  /** 큰 카드 아래 태그 — 나머지 영어 태그 */
  tags: string[];
  /** 한 줄 설명 — 사례는 성과 문구, 프로그램 개발은 소개 */
  summary: string;
  /** 장소 (목록 보기) */
  meta: string;
  year: number | null;
  /** 최신순 정렬 값 (YYYYMMDD). 날짜를 알 수 없으면 0 */
  when: number;
  image: string;
  /** 사진이 아닌 그림(로고·도안)은 잘리지 않게 안에 맞춘다 */
  contain: boolean;
  href: string;
  external: boolean;
  searchText: string;
}

function whenOf(period: string | undefined, year: number | null): number {
  const m = /^(\d{4})(?:\.(\d{1,2}))?(?:\.(\d{1,2}))?/.exec(period ?? '');
  if (m) return Number(m[1]) * 10000 + Number(m[2] ?? 0) * 100 + Number(m[3] ?? 0);
  return (year ?? 0) * 10000;
}

function caseItem(project: DisplayPortfolio, ko: boolean): GridItem {
  const kind = project.image_metadata?.[project.thumbnail]?.kind;
  const tags = project.tags_en?.length ? project.tags_en : project.tags ?? [];
  return {
    key: project.slug,
    category: project.category,
    title: ko ? project.title_ko : project.title_en || project.title_ko,
    client: (ko ? project.client_ko : project.client_en) || project.client,
    date: (ko ? project.period_ko : project.period_en) || project.period || (project.year ? String(project.year) : ''),
    chip: tags[0] ?? '',
    tags: tags.slice(1),
    summary: (ko ? project.result_ko : project.result_en || project.result_ko) ?? '',
    meta: (ko ? project.location_ko : project.location_en) || project.location || '',
    year: project.year,
    when: whenOf(project.period, project.year),
    image: project.thumbnail,
    contain: !!kind && kind !== 'photo',
    href: `/portfolio/${project.slug}`,
    external: false,
    searchText: [project.title_ko, project.title_en, project.description_ko, project.description_en,
      project.client, project.client_ko, project.client_en, project.location, project.location_ko, project.location_en, project.year, ...(project.tags ?? []),
      ...(project.tags_ko ?? []), ...(project.tags_en ?? [])].join(' '),
  };
}

// 프로그램 개발 프로젝트는 상세 페이지가 없어서 카드가 실제 사이트로 바로 이어진다 (/development 와 같은 데이터)
function developmentItem(project: DevelopmentProject, lang: 'ko' | 'en'): GridItem {
  return {
    key: `development-${project.id}`,
    category: 'online',
    title: project.name[lang],
    client: project.client,
    date: DEVELOPMENT_COPY[lang].categories[project.category],
    chip: DEVELOPMENT_COPY.en.categories[project.category],
    tags: project.tags.slice(0, 2),
    summary: project.description[lang],
    meta: DEVELOPMENT_COPY[lang].categories[project.category],
    year: null,
    when: 0,
    image: project.image,
    contain: false,
    href: project.url,
    external: true,
    searchText: [project.name.ko, project.name.en, project.client, project.description.ko, project.description.en, ...project.tags,
      DEVELOPMENT_COPY.ko.categories[project.category], DEVELOPMENT_COPY.en.categories[project.category]].join(' '),
  };
}

/** 성과 문구의 모든 마디가 '숫자 + 단위'일 때만 큰 숫자로 나눠 보여 준다.
    "이틀간 316팀 완성 · 약 860명 참여" → 316 「팀 완성 · 이틀간」, 860 「명 참여 (약)」. 아니면 문장 그대로 둔다 */
function resultStats(result: string): { value: string; label: string }[] | null {
  const parts = result.split(/\s+·\s+|,\s+/).filter(Boolean);
  if (parts.length === 0 || parts.length > 3) return null;
  const stats: { value: string; label: string }[] = [];
  for (const part of parts) {
    const m = /^(.*?)(\d[\d,]*)\s*(\S.*)$/.exec(part);
    if (!m) return null;
    const before = m[1].trim();
    const approx = /^(약|about|around|approx\.?)$/i.test(before);
    stats.push({ value: m[2], label: !before ? m[3] : approx ? `${m[3]} (${before})` : `${m[3]} · ${before}` });
  }
  return stats;
}

function ItemLink({ item, className, children, cursor }: { item: GridItem; className?: string; children: React.ReactNode; cursor?: string }) {
  return item.external ? (
    <a href={item.href} target="_blank" rel="noopener noreferrer" data-cursor={cursor ?? 'OPEN'} className={className}>{children}</a>
  ) : (
    <Link href={item.href} data-cursor={cursor ?? 'VIEW'} className={className}>{children}</Link>
  );
}

const CHIP = 'font-display text-[11px] font-bold uppercase leading-none tracking-[0.22em]';

/** 맨 위 큰 사례 — 왼쪽 아래에 이름 · 성과 숫자, 오른쪽 아래에 VIEW 원 */
function Featured({ item }: { item: GridItem }) {
  const [head, ...rest] = item.title.split(' — ');
  const stats = item.summary ? resultStats(item.summary) : null;
  const month = /^\d{4}\.\d{1,2}/.exec(item.date)?.[0] ?? (item.year ? String(item.year) : '');
  return (
    <Reveal variant="clip">
      <ItemLink item={item} cursor="" className="group relative block min-h-[34rem] overflow-hidden bg-ink-2 focus-visible:outline-2 focus-visible:outline-offset-4 sm:aspect-[16/11] sm:min-h-0 lg:aspect-[16/10]">
        {item.image && (
          <Image
            src={item.image}
            alt={item.title}
            fill
            sizes="(min-width: 1024px) 88vw, 100vw"
            className="rd-zoom object-cover brightness-[0.7] transition-[transform,filter] duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04] group-hover:brightness-[0.82]"
          />
        )}
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/10 sm:bg-gradient-to-r sm:from-ink/90 sm:via-ink/45 sm:to-ink/20" />
        <div className="absolute inset-x-6 bottom-7 sm:bottom-10 sm:left-10 sm:right-10 lg:bottom-16 lg:left-16 lg:right-56 lg:max-w-[56rem]">
          <p className="t-label text-paper/60">
            <span className="mr-3.5 text-accent">FEATURED</span>
            {[item.chip, month].filter(Boolean).join(' · ')}
          </p>
          <h3 className="t-kr-title mt-5 text-[clamp(1.6rem,3.2vw,2.875rem)] !font-extrabold !leading-[1.2] !tracking-[-0.035em] text-paper">
            <span className="block">{head}</span>
            {rest.length > 0 && <span className="block">{rest.join(' — ')}</span>}
          </h3>
          <p className="mt-4 text-[clamp(0.9rem,1.1vw,1rem)] text-paper/70">{[item.client, item.date].filter(Boolean).join(' · ')}</p>
          {stats ? (
            <div className="mt-8 flex flex-wrap gap-x-11 gap-y-5 border-t border-paper/30 pt-6">
              {stats.map((stat) => (
                <p key={stat.label}>
                  <strong className="block font-display text-[clamp(2.25rem,3.9vw,3.5rem)] font-extrabold leading-none text-paper">{stat.value}</strong>
                  <span className="mt-2 block text-sm text-paper/60">{stat.label}</span>
                </p>
              ))}
            </div>
          ) : item.summary ? (
            <p className="mt-7 border-t border-paper/30 pt-5 text-[clamp(0.95rem,1.2vw,1.1rem)] text-paper/75">{item.summary}</p>
          ) : null}
        </div>
        <span aria-hidden="true" className="absolute bottom-16 right-14 hidden h-32 w-32 place-items-center rounded-full border border-paper font-display text-[13px] font-bold tracking-[0.2em] text-paper transition-colors duration-500 group-hover:bg-paper group-hover:text-ink lg:grid">
          VIEW →
        </span>
      </ItemLink>
    </Reveal>
  );
}

function Card({ item, big, index }: { item: GridItem; big: boolean; index: number }) {
  return (
    <Reveal variant="clip" delay={(big ? index % 5 : (index % 5) - 2) * 80}>
      <ItemLink item={item} className="group block focus-visible:outline-2 focus-visible:outline-offset-4">
        <div className={cn('relative overflow-hidden bg-ink-2', big ? 'aspect-[5/4]' : 'aspect-[6/5]')}>
          {item.image ? (
            <Image
              src={item.image}
              alt={item.title}
              fill
              sizes={big ? '(min-width: 640px) 46vw, 92vw' : '(min-width: 768px) 30vw, 92vw'}
              className={cn(
                'rd-zoom brightness-[0.88] saturate-[0.92] transition-[transform,filter] duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06] group-hover:brightness-100 group-hover:saturate-100',
                item.contain ? 'object-contain p-3' : item.external ? 'object-cover object-top' : 'object-cover',
              )}
            />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center p-6 text-center font-display text-sm font-bold tracking-[0.12em] text-paper/45">{item.client}</span>
          )}
          {item.chip && <span className={cn(CHIP, 'absolute left-3 top-3 bg-ink/65 px-3 py-[7px] text-paper backdrop-blur-md lg:left-[18px] lg:top-[18px]')}>{item.chip}</span>}
        </div>
        <p className="t-label mt-5 flex items-baseline justify-between gap-4 !text-[0.72rem] !tracking-[0.2em] text-paper/60">
          <span className="shrink-0">{item.date}</span>
          <span className="truncate text-right">{item.client}</span>
        </p>
        <h3 className={cn('t-kr-title mt-3 !leading-[1.35] text-paper', big ? 'text-[clamp(1.25rem,1.85vw,1.625rem)]' : 'text-[clamp(1.1rem,1.5vw,1.3125rem)]')}>
          {item.title}
          {item.external && <span aria-hidden="true" className="ml-2 inline-block font-display text-[0.8em] text-paper/50 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">↗</span>}
        </h3>
        {item.summary && <p className={cn('mt-2 text-[0.94rem] leading-relaxed text-paper/60', !big && 'line-clamp-2')}>{item.summary}</p>}
        {big && item.tags.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2" aria-hidden="true">
            {item.tags.map((tag) => (
              <li key={tag} className="rounded-full border border-paper/15 px-3 py-1.5 font-display text-[11px] uppercase leading-none tracking-[0.12em] text-paper/70">{tag}</li>
            ))}
          </ul>
        )}
      </ItemLink>
    </Reveal>
  );
}

export function PortfolioGrid() {
  const [active, setActive] = useState<Division>('all');
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [order, setOrder] = useState<'newest' | 'oldest'>('newest');
  const [shown, setShown] = useState(PAGE);
  const locale = useLocale();
  const ko = locale !== 'en';
  const lang = ko ? 'ko' : 'en';
  const { projects, loading } = useFirestorePortfolio();

  if (loading) {
    return (
      <div className="wrap py-24 text-center" role="status">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-paper/20 border-t-accent" aria-hidden="true" />
        <span className="sr-only">{ko ? '프로젝트를 불러오는 중입니다.' : 'Loading projects.'}</span>
      </div>
    );
  }

  const terms = search.normalize('NFC').toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  // 날짜를 아는 항목은 최신순(또는 오래된순), 날짜를 모르는 항목(아카이브 · 프로그램 개발)은 그 뒤에 원래 순서대로
  const all: GridItem[] = [
    ...projects.map((project) => caseItem(project, ko)),
    ...DEVELOPMENT_PROJECTS.map((project) => developmentItem(project, lang)),
  ];
  const dated = all.filter((item) => item.when > 0).sort((a, b) => (order === 'newest' ? b.when - a.when : a.when - b.when));
  const items = [...dated, ...all.filter((item) => item.when === 0)];
  const matching = items.filter((item) => {
    const text = item.searchText.normalize('NFC').toLocaleLowerCase();
    return terms.every((term) => text.includes(term));
  });
  const filtered = active === 'all' ? matching : matching.filter((p) => p.category === active);
  // 맨 위 큰 사례: 기본 화면(전체 · 최신순 · 격자)에서 가장 최근 사례
  const featured = active === 'all' && terms.length === 0 && view === 'grid' && order === 'newest' ? filtered[0] : undefined;
  const rest = featured ? filtered.slice(1) : filtered;
  const visible = view === 'grid' ? rest.slice(0, shown) : rest;
  const visibleCount = visible.length + (featured ? 1 : 0);

  // 조건이 바뀌면 처음 10개부터 다시 보여 준다
  const reset = () => setShown(PAGE);

  const tab = (id: Division, label: string, count: number) => (
    <button
      key={id}
      type="button"
      onClick={() => { setActive(id); reset(); }}
      aria-pressed={active === id}
      aria-controls="portfolio-results"
      className={cn(
        'relative flex shrink-0 items-baseline gap-1.5 whitespace-nowrap py-5 text-base font-semibold transition-colors duration-300 xl:py-8',
        active === id ? 'text-paper' : 'text-paper/55 hover:text-paper/85',
      )}
    >
      {label}
      <span aria-hidden="true" className="-translate-y-1.5 font-display text-[11px] font-bold text-accent">{count}</span>
      {active === id && <motion.span layoutId="portfolio-tab" className="absolute inset-x-0 -bottom-px h-0.5 bg-paper" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
    </button>
  );

  const tool = 'font-display text-xs font-semibold uppercase tracking-[0.2em] transition-colors';

  return (
    <div>
      {/* ── 탭 · 검색 · 보기 전환 · 정렬 ────────────────── */}
      <div className="border-y border-paper/15">
        <div className="wrap flex flex-col gap-x-10 xl:flex-row xl:items-center xl:justify-between">
          <div className="-mx-[clamp(1.25rem,6vw,6.75rem)] flex min-w-0 gap-8 overflow-x-auto px-[clamp(1.25rem,6vw,6.75rem)] scrollbar-none xl:mx-0 xl:px-0 2xl:gap-[2.375rem]">
            {tab('all', ko ? '전체' : 'All', matching.length)}
            {DIVISIONS.map((d) => tab(d.id, ko ? d.ko : d.en, matching.filter((p) => p.category === d.id).length))}
          </div>
          {/* 휴대폰: 검색 한 줄 → 보기 전환 · 정렬 한 줄 */}
          <div className="flex flex-wrap items-center gap-x-5 border-t border-paper/15 py-3 xl:shrink-0 xl:flex-nowrap xl:gap-x-[1.625rem] xl:border-t-0 xl:py-0">
            <div className="relative min-w-0 basis-full sm:basis-0 sm:flex-1 xl:w-64 xl:flex-none xl:basis-auto">
              <label htmlFor="portfolio-search" className="sr-only">{ko ? '프로젝트 검색' : 'Search projects'}</label>
              <Search className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-paper/40" aria-hidden="true" />
              <input
                id="portfolio-search"
                type="search"
                value={search}
                onChange={(event) => { setSearch(event.target.value); reset(); }}
                placeholder={ko ? '프로젝트 · 브랜드 · 연도 검색' : 'Search project, brand, year'}
                aria-controls="portfolio-results"
                className="w-full border-0 border-b border-transparent bg-transparent py-2.5 pl-7 pr-8 text-base text-paper outline-none sm:text-sm transition-colors placeholder:text-paper/35 focus:border-paper/60 [&::-webkit-search-cancel-button]:hidden"
              />
              {search && (
                <button type="button" onClick={() => { setSearch(''); reset(); }} aria-label={ko ? '검색어 지우기' : 'Clear search'} className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-paper/50 hover:text-paper">
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>
            <div className="flex flex-1 items-center justify-between gap-5 sm:flex-none xl:gap-[1.625rem]">
            <div className="flex shrink-0 items-center gap-1" role="group" aria-label={ko ? '보기 방식' : 'View'}>
              {(['grid', 'list'] as const).map((v, i) => (
                <span key={v} className="flex items-center gap-1">
                  {i > 0 && <span aria-hidden="true" className="text-xs text-paper/25">/</span>}
                  <button type="button" onClick={() => { setView(v); reset(); }} aria-pressed={view === v} className={cn(tool, 'px-1 py-2', view === v ? 'text-paper' : 'text-paper/45 hover:text-paper/80')}>{v}</button>
                </span>
              ))}
            </div>
            <button
              type="button"
              onClick={() => { setOrder(order === 'newest' ? 'oldest' : 'newest'); reset(); }}
              aria-label={ko ? `정렬: ${order === 'newest' ? '최신순' : '오래된순'}. 누르면 바뀝니다` : `Sort: ${order} first. Press to switch`}
              aria-controls="portfolio-results"
              className={cn(tool, 'shrink-0 whitespace-nowrap py-2 text-paper/60 hover:text-paper', ko && 'font-[family-name:var(--font-body)] !text-[0.8125rem] !tracking-[0.04em]')}
            >
              {order === 'newest' ? (ko ? '최신순 ↓' : 'Newest ↓') : (ko ? '오래된순 ↑' : 'Oldest ↑')}
            </button>
            </div>
          </div>
        </div>
      </div>
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {ko ? `전체 ${items.length}개 중 ${filtered.length}개 프로젝트` : `${filtered.length} of ${items.length} projects`}
      </p>

      {/* ── 결과 ─────────────────────────────────────── */}
      <div id="portfolio-results" className="wrap pt-[clamp(2.5rem,5vw,4.375rem)]">
        {featured && <Featured item={featured} />}

        <AnimatePresence mode="wait">
          <motion.div
            key={`${active}-${view}-${order}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className={cn(featured && 'mt-[clamp(3.5rem,7vw,6.25rem)]')}
          >
            {view === 'grid' ? (
              // 6칸 격자: 큰 카드는 3칸(한 줄 2장), 작은 카드는 2칸(한 줄 3장)
              <ul className="grid grid-cols-6 gap-x-5 gap-y-14 lg:gap-x-7 lg:gap-y-[4.375rem]">
                {visible.map((item, i) => (
                  <li key={item.key} className={isBig(i) ? 'col-span-6 sm:col-span-3' : 'col-span-6 md:col-span-2'}>
                    <Card item={item} big={isBig(i)} index={i} />
                  </li>
                ))}
              </ul>
            ) : (
              <HoverPreviewList>
                <ul className="border-t border-paper/15">
                  {visible.map((item) => (
                    <li key={item.key}>
                      <HoverPreviewRow image={item.image || null}>
                        <ItemLink item={item} cursor="" className="group grid items-baseline gap-x-8 gap-y-1 border-b border-paper/15 py-5 transition-colors duration-500 hover:border-paper/60 md:grid-cols-[4.5rem_minmax(0,1fr)_minmax(0,16rem)_2rem]">
                          <span className="t-label text-paper/40">{item.year ?? '—'}</span>
                          <span className="t-kr-title text-[clamp(1.05rem,1.6vw,1.45rem)] text-paper transition-transform duration-500 group-hover:translate-x-2">{item.title}</span>
                          <span className="truncate text-sm text-paper/50">{[item.client, item.meta].filter(Boolean).join(' · ')}</span>
                          <span aria-hidden="true" className="hidden justify-self-end font-display text-paper/40 transition-colors group-hover:text-accent md:block">{item.external ? '↗' : '→'}</span>
                        </ItemLink>
                      </HoverPreviewRow>
                    </li>
                  ))}
                </ul>
              </HoverPreviewList>
            )}
          </motion.div>
        </AnimatePresence>

        {filtered.length === 0 ? (
          <div className="border border-dashed border-paper/20 py-20 text-center">
            <p className="text-paper/55">{ko ? '검색 조건에 맞는 프로젝트가 없습니다.' : 'No projects match your search.'}</p>
            <button type="button" onClick={() => { setSearch(''); setActive('all'); reset(); }} className="t-label mt-5 border-b border-paper/50 pb-1 text-paper hover:border-accent hover:text-accent">
              {ko ? '전체 프로젝트 보기' : 'VIEW ALL PROJECTS'}
            </button>
          </div>
        ) : (
          <div className="pb-[clamp(5rem,10vw,8.75rem)] pt-[clamp(4rem,8vw,6.875rem)] text-center">
            {visibleCount < filtered.length && (
              <button
                type="button"
                onClick={() => setShown(shown + PAGE)}
                aria-controls="portfolio-results"
                className="group/btn relative isolate inline-flex min-h-[3.75rem] items-center justify-center overflow-hidden border border-paper/70 px-11 font-display text-[0.8125rem] font-semibold uppercase tracking-[0.2em] text-paper transition-colors duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] before:absolute before:inset-0 before:-z-10 before:origin-bottom before:scale-y-0 before:bg-paper before:transition-transform before:duration-500 before:ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-paper hover:text-ink hover:before:scale-y-100 focus-visible:outline-2 focus-visible:outline-offset-4"
              >
                More projects +
              </button>
            )}
            <p className={cn('text-sm text-paper/60', visibleCount < filtered.length && 'mt-[1.125rem]')}>
              {ko ? `${filtered.length}개 중 ${visibleCount}개` : `${visibleCount} of ${filtered.length}`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
