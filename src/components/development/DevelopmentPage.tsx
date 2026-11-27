'use client';

import { useEffect, useRef, useState, useSyncExternalStore, type MouseEvent, type PointerEvent } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion, useMotionValue, useScroll, useSpring, useTransform, type MotionValue } from 'motion/react';
import { useReduce } from '@/components/fx/useReduce';
import { useLocale } from 'next-intl';
import { ArrowUpRight, Blocks, Box, Code2, ExternalLink, Globe2, Monitor, Play, Smartphone, Sparkles, Workflow, X } from 'lucide-react';
import { CONTACT } from '@/lib/constants';
import { smoothScrollIntoView } from '@/lib/smooth-scroll';
import { DEVELOPMENT_PROJECTS, type DevelopmentCategory, type DevelopmentProject } from '@/data/development-projects';
import { Reveal, Spotlight } from '@/components/fx';
import { SectionHead } from '@/components/services/detail/SectionHead';
import { Title } from '@/components/site/Title';
import { Btn } from '@/components/site/ui';
import { cn } from '@/lib/utils';
import { DEVELOPMENT_COPY, type DevelopmentLocale } from './copy';
import { EXTERNAL_ONLY_PROJECTS } from './preview-policy';

/* ─────────────────────────────────────────────────────────
   프로그램 개발 (2026-11 개편)
   문구 · 프로젝트 목록 · 미리보기 동작(제작 화면 / 라이브 체험 / 새 탭 방문)은 예전 그대로이고 모양만 새 디자인으로 옮겼다.
   · 첫 화면: 실제로 만든 사이트 화면의 벽 — 스크롤과 마우스에 따라 기울고 흐른다
   · 프로젝트 카드를 누르면 미리보기 창이 열린다 (외부 사이트의 프레임 정책은 preview-policy.ts 를 따른다)
   ───────────────────────────────────────────────────────── */

type Category = 'all' | DevelopmentCategory;
const CATEGORIES: readonly Category[] = ['all', 'web', 'commerce', 'ai', 'platform', 'interactive'];
const FEATURED_IDS = ['ansan-science', 'smoat', 'ikseonjae'];
const FEATURED = FEATURED_IDS.map((id) => DEVELOPMENT_PROJECTS.find((project) => project.id === id)!).filter(Boolean);
const SCOPE_ICONS = { web: Globe2, platform: Blocks, ai: Sparkles, ax: Workflow };
const CONTACT_HREF = '/contact?type=development';
const subscribeToHydration = () => () => {};
const clientHydrationSnapshot = () => true;
const serverHydrationSnapshot = () => false;

const WALL = DEVELOPMENT_PROJECTS.filter((p) => p.image);
const WALL_COLUMNS = [0, 1, 2, 3, 4].map((c) => WALL.filter((_, i) => i % 5 === c));

function hostname(url: string) {
  return new URL(url).hostname.replace(/^www\./, '');
}

function ProjectImage({ project, locale, priority = false, sizes = '(min-width: 1280px) 30vw, (min-width: 768px) 46vw, 92vw', contain = false }: {
  project: DevelopmentProject; locale: DevelopmentLocale; priority?: boolean; sizes?: string; contain?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  if (project.image && !failed) {
    return (
      <Image
        src={project.image}
        alt={project.name[locale] + ' ' + DEVELOPMENT_COPY[locale].screenshotAlt}
        fill
        priority={priority}
        sizes={sizes}
        className={contain ? 'object-contain object-top' : 'object-cover object-top'}
        onError={() => setFailed(true)}
      />
    );
  }
  // 화면 사진이 없는 프로젝트(3D 부스 설계)는 이름을 적은 판으로 대신한다
  return (
    <div className="absolute inset-0 flex flex-col items-start justify-end overflow-hidden bg-ink-3 p-6">
      {project.id === 'booth-3d' && <Box className="absolute right-[4%] top-[12%] text-paper/15" size={150} strokeWidth={0.6} aria-hidden="true" />}
      <Code2 size={24} strokeWidth={1.25} className="text-accent" aria-hidden="true" />
      <span className="t-label mt-4 !text-[0.62rem] text-paper/50">{project.client}</span>
      <strong className="mt-1 max-w-[85%] text-2xl font-bold leading-tight tracking-[-0.03em] text-paper">{project.name[locale]}</strong>
      <small className="mt-3 flex items-center gap-2 text-xs text-paper/55">{DEVELOPMENT_COPY[locale].fallback}<ArrowUpRight size={13} aria-hidden="true" /></small>
    </div>
  );
}

function WallColumn({ items, progress, from, to }: { items: typeof WALL; progress: MotionValue<number>; from: string; to: string }) {
  const lang = useLocale() === 'en' ? 'en' : 'ko';
  const reduce = useReduce();
  const y = useTransform(progress, [0, 1], [from, to]);
  return (
    <motion.div className="flex flex-col gap-4 lg:gap-5" style={reduce ? undefined : { y }}>
      {items.map((p) => (
        <div key={p.id} className="relative aspect-[16/10] overflow-hidden round-tile bg-ink-3">
          <Image src={p.image} alt={p.name[lang]} fill sizes="(min-width: 1024px) 20vw, 34vw" className="object-cover object-top" />
        </div>
      ))}
    </motion.div>
  );
}

function BrowserBar({ url, className }: { url: string; className?: string }) {
  return (
    <div className={cn('flex h-8 items-center gap-1.5 bg-ink-3 px-3.5', className)} aria-hidden="true">
      <i className="h-2 w-2 rounded-full bg-paper/20" /><i className="h-2 w-2 rounded-full bg-paper/20" /><i className="h-2 w-2 rounded-full bg-paper/20" />
      <span className="ml-3 truncate rounded-full bg-paper/[0.07] px-3 py-0.5 font-display text-[10px] tracking-[0.04em] text-paper/50">{hostname(url)}</span>
    </div>
  );
}

function scrollToWork(event: MouseEvent<HTMLAnchorElement>) {
  event.preventDefault();
  smoothScrollIntoView(document.getElementById('development-work'));
  document.getElementById('development-work-title')?.focus({ preventScroll: true });
}

export function DevelopmentPage({ locale }: { locale: DevelopmentLocale }) {
  const copy = DEVELOPMENT_COPY[locale];
  const ko = locale === 'ko';
  // Keep the first click reliable even while the server-rendered page is hydrating.
  const hydrated = useSyncExternalStore(subscribeToHydration, clientHydrationSnapshot, serverHydrationSnapshot);
  const [category, setCategory] = useState<Category>('all');
  const filterAnchorRef = useRef<HTMLDivElement>(null);
  const filterBarRef = useRef<HTMLDivElement>(null);
  const restoreFilterPosition = useRef(false);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [preview, setPreview] = useState<DevelopmentProject | null>(null);
  const featured = FEATURED[featuredIndex];
  const visibleProjects = DEVELOPMENT_PROJECTS.filter((project) => category === 'all' || project.category === category);

  function changeCategory(next: Category) {
    if (next === category) return;
    const bar = filterBarRef.current;
    restoreFilterPosition.current = Boolean(bar && bar.getBoundingClientRect().top <= parseFloat(getComputedStyle(bar).top) + 1);
    setCategory(next);
  }

  useEffect(() => {
    if (!restoreFilterPosition.current) return;
    restoreFilterPosition.current = false;
    smoothScrollIntoView(filterAnchorRef.current, { immediate: true });
  }, [category]);

  // 첫 화면: 화면 벽이 스크롤에 따라 흐르고, 마우스를 따라 기운다
  const heroRef = useRef<HTMLElement>(null);
  const reduce = useReduce();
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const tiltX = useSpring(useMotionValue(0), { stiffness: 50, damping: 16 });
  const tiltY = useSpring(useMotionValue(0), { stiffness: 50, damping: 16 });
  function onHeroMove(e: PointerEvent<HTMLElement>) {
    if (reduce || e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    tiltY.set(((e.clientX - r.left) / r.width - 0.5) * 7);
    tiltX.set(((e.clientY - r.top) / r.height - 0.5) * -5);
  }

  return (
    <div>
      {/* ── 첫 화면 ───────────────────────────────────── */}
      <section ref={heroRef} onPointerMove={onHeroMove} className="under-header relative isolate flex min-h-[min(58rem,100svh)] flex-col justify-end overflow-hidden bg-ink" aria-labelledby="development-hero-title">
        <div aria-hidden="true" className="absolute inset-0 -z-10 [perspective:1400px]">
          <motion.div className="absolute inset-x-[-12%] top-[-22%] grid rotate-[-9deg] grid-cols-3 gap-4 sm:grid-cols-5 lg:gap-5" style={reduce ? undefined : { rotateX: tiltX, rotateY: tiltY }}>
            <WallColumn items={WALL_COLUMNS[0]} progress={scrollYProgress} from="0%" to="-16%" />
            <WallColumn items={WALL_COLUMNS[1]} progress={scrollYProgress} from="-10%" to="6%" />
            <WallColumn items={WALL_COLUMNS[2]} progress={scrollYProgress} from="4%" to="-20%" />
            <div className="hidden sm:block"><WallColumn items={WALL_COLUMNS[3]} progress={scrollYProgress} from="-14%" to="4%" /></div>
            <div className="hidden sm:block"><WallColumn items={WALL_COLUMNS[4]} progress={scrollYProgress} from="2%" to="-14%" /></div>
          </motion.div>
          <div className="absolute inset-0" style={{ background: 'radial-gradient(75% 70% at 30% 62%, rgba(8,9,11,0.94), rgba(8,9,11,0.72) 58%, rgba(8,9,11,0.5))' }} />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink to-transparent" />
        </div>

        <div className="wrap pb-[clamp(2.5rem,6vw,5rem)] pt-36 lg:pt-44">
          <p className="t-label rise text-paper/65">{copy.eyebrow}</p>
          <Title
            as="h1"
            id="development-hero-title"
            en={['FROM IDEA', 'TO SERVICE.']}
            ko={`${copy.title[0]} ${copy.title[1]}`}
            size="giant"
            immediate
            delay={100}
            className="mt-6 [&_[data-lines]]:!text-[length:clamp(1.5rem,max(min(8.2vw,3.55rem),7.4vw),7.2rem)]"
            koClassName="!text-[clamp(1.2rem,2.1vw,1.9rem)] !font-bold text-paper"
          />
          <p className="rise mt-6 max-w-xl whitespace-pre-line text-[clamp(1rem,1.25vw,1.2rem)] leading-relaxed text-paper/70" style={{ '--i': 5 } as React.CSSProperties}>
            {copy.lead} {copy.description}
          </p>
          <div className="rise mt-8 flex flex-wrap items-center gap-3" style={{ '--i': 6 } as React.CSSProperties}>
            <Btn href={CONTACT_HREF} variant="fill" arrow>{copy.consult}</Btn>
            <a href="#development-work" onClick={scrollToWork} className="group/btn relative isolate inline-flex min-h-[3.25rem] items-center gap-3 overflow-hidden border border-paper/70 px-7 text-[0.95rem] font-semibold text-paper transition-colors duration-500 before:absolute before:inset-0 before:-z-10 before:origin-bottom before:scale-y-0 before:bg-paper before:transition-transform before:duration-500 hover:text-ink hover:before:scale-y-100">
              {copy.explore} <span className="font-display text-sm text-accent group-hover/btn:text-ink">{DEVELOPMENT_PROJECTS.length}</span> <span aria-hidden="true" className="font-display transition-transform duration-500 group-hover/btn:translate-y-1">↓</span>
            </a>
          </div>
        </div>
      </section>

      {/* ── 만드는 것 ─────────────────────────────────── */}
      <section className="border-t border-paper/10 bg-ink" aria-labelledby="development-scope-title">
        <div className="wrap section-y">
          <SectionHead id="development-scope-title" no="01" label={copy.scopeEyebrow} en={['USEFUL', 'TECHNOLOGY.']} ko={copy.scopeTitle} />
          <div className="mt-14 grid gap-px border border-paper/15 bg-paper/15 sm:grid-cols-2 lg:grid-cols-4">
            {copy.scopes.map((scope, index) => {
              const Icon = SCOPE_ICONS[scope.icon];
              return (
                <Reveal key={scope.icon} delay={index * 80} className="group flex min-h-[17rem] flex-col bg-ink p-7 transition-colors duration-500 hover:bg-ink-2 lg:p-8">
                  <div className="flex items-center justify-between">
                    <Icon size={26} strokeWidth={1.3} className="text-paper/70 transition-[color,transform] duration-500 group-hover:-translate-y-1 group-hover:text-accent" aria-hidden="true" />
                    <span className="t-label text-accent">0{index + 1}</span>
                  </div>
                  <h3 className="t-kr-title mt-auto pt-10 text-[1.35rem] text-paper">{scope.title}</h3>
                  <p className="mt-3 text-[0.95rem] leading-relaxed text-paper/60">{scope.description}</p>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 만든 서비스 ───────────────────────────────── */}
      <section id="development-work" className="scroll-mt-16 border-t border-paper/10 bg-ink" aria-labelledby="development-work-title">
        <div className="wrap section-y">
          <SectionHead no="02" label={copy.workEyebrow} en={['BUILT', '& LIVE.']} ko={copy.workTitle.replace('\n', ' ')} aside={<span className="whitespace-pre-line">{copy.workDescription}</span>} />
          <h2 id="development-work-title" tabIndex={-1} className="sr-only">{copy.workTitle}</h2>

          {/* 대표 프로젝트 — 세 개 중 골라 본다 */}
          <div className="mt-14 grid items-center gap-x-[clamp(2rem,5vw,5rem)] gap-y-10 lg:grid-cols-[1.45fr_1fr]">
            <Reveal variant="scale">
              <div className="overflow-hidden round-frame border border-paper/15 bg-ink-2">
                <BrowserBar url={featured.url} />
                <button
                  type="button"
                  disabled={!hydrated}
                  onClick={() => setPreview(featured)}
                  data-cursor="PREVIEW"
                  aria-label={featured.name[locale] + ' ' + copy.previewSuffix}
                  className="group relative block aspect-[16/10] w-full overflow-hidden bg-ink-3 disabled:cursor-progress"
                >
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.div key={featured.id} className="absolute inset-0" initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
                      <ProjectImage project={featured} locale={locale} priority sizes="(min-width: 1024px) 56vw, 95vw" />
                    </motion.div>
                  </AnimatePresence>
                  <span className="absolute bottom-4 right-4 inline-flex items-center gap-2 bg-paper px-4 py-2.5 text-xs font-semibold text-ink transition-colors duration-300 group-hover:bg-accent lg:hidden">
                    <Play size={11} fill="currentColor" aria-hidden="true" />{copy.heroPreview}
                  </span>
                </button>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <p className="t-label text-paper/50">{copy.selected} / 0{featuredIndex + 1}</p>
              <h3 className="t-kr-title mt-4 text-[clamp(1.7rem,3vw,2.75rem)] !leading-[1.15] text-paper">{featured.name[locale]}</h3>
              <p className="mt-4 text-[1.02rem] leading-relaxed text-paper/65">{featured.description[locale]}</p>
              <div className="mt-7 flex flex-wrap gap-2.5">
                <button type="button" disabled={!hydrated} onClick={() => setPreview(featured)} className="inline-flex min-h-12 items-center gap-2.5 bg-paper px-6 text-[0.95rem] font-semibold text-ink transition-colors duration-300 hover:bg-accent disabled:cursor-progress">
                  <Play size={12} fill="currentColor" aria-hidden="true" />{copy.preview}
                </button>
                <a href={featured.url} target="_blank" rel="noopener noreferrer" aria-label={featured.name[locale] + ' ' + copy.visitSuffix} className="inline-flex min-h-12 items-center gap-2 border border-paper/60 px-6 text-[0.95rem] font-semibold text-paper transition-colors duration-300 hover:bg-paper hover:text-ink">
                  {copy.visit}<ArrowUpRight size={16} aria-hidden="true" />
                </a>
              </div>
              <div className="mt-9 border-t border-paper/15" role="group" aria-label={copy.heroSelect}>
                {FEATURED.map((project, index) => (
                  <button
                    key={project.id}
                    type="button"
                    disabled={!hydrated}
                    aria-pressed={featuredIndex === index}
                    onClick={() => setFeaturedIndex(index)}
                    onPointerEnter={(e) => { if (e.pointerType === 'mouse') setFeaturedIndex(index); }}
                    className={cn('flex w-full items-baseline gap-5 border-b border-paper/15 py-3.5 text-left transition-colors duration-300 disabled:cursor-progress', featuredIndex === index ? 'text-paper' : 'text-paper/40 hover:text-paper/80')}
                  >
                    <span className={cn('t-label', featuredIndex === index ? 'text-accent' : 'text-paper/30')}>0{index + 1}</span>
                    <span className={cn('text-[1.05rem] font-semibold tracking-[-0.02em] transition-transform duration-500', featuredIndex === index && 'translate-x-1.5')}>{project.name[locale]}</span>
                  </button>
                ))}
              </div>
            </Reveal>
          </div>

          {/* 분야 고르기 — 내려도 위에 붙어 있다 */}
          <div ref={filterAnchorRef} aria-hidden="true" className="mt-[clamp(4rem,8vw,7rem)] scroll-mt-20" />
          <div ref={filterBarRef} className="sticky top-0 z-20 -mx-[clamp(1.25rem,6vw,6.75rem)] flex items-center justify-between gap-6 border-y border-paper/15 bg-ink/85 px-[clamp(1.25rem,6vw,6.75rem)] backdrop-blur-xl">
            <div className="flex gap-7 overflow-x-auto scrollbar-none" role="group" aria-label={copy.filterLabel}>
              {CATEGORIES.map((item) => {
                const count = item === 'all' ? DEVELOPMENT_PROJECTS.length : DEVELOPMENT_PROJECTS.filter((project) => project.category === item).length;
                const on = category === item;
                return (
                  <button key={item} type="button" disabled={!hydrated} onClick={() => changeCategory(item)} aria-pressed={on} className={cn('relative flex shrink-0 items-baseline gap-2 whitespace-nowrap py-4 text-[0.95rem] font-semibold transition-colors duration-300 disabled:cursor-progress', on ? 'text-paper' : 'text-paper/50 hover:text-paper/85')}>
                    {copy.categories[item]}
                    <span aria-hidden="true" className="font-display text-[0.66rem] font-bold text-accent">{String(count).padStart(2, '0')}</span>
                    {on && <motion.span layoutId="development-filter" className="absolute inset-x-0 -bottom-px h-0.5 bg-paper" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
                  </button>
                );
              })}
            </div>
            <span className="t-label hidden shrink-0 !text-[0.64rem] text-paper/45 md:block" role="status" aria-live="polite">{copy.visibleCount(visibleProjects.length, DEVELOPMENT_PROJECTS.length)}</span>
          </div>

          <div className="mt-10 grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {visibleProjects.map((project, i) => (
              <Reveal key={project.id} delay={(i % 3) * 70}>
                <article className="group" data-development-project={project.id}>
                  <button type="button" disabled={!hydrated} onClick={() => setPreview(project)} data-cursor="PREVIEW" aria-label={project.name[locale] + ' ' + copy.previewSuffix} className="block w-full overflow-hidden round-frame border border-paper/15 bg-ink-2 text-left transition-colors duration-500 hover:border-paper/50 disabled:cursor-progress">
                    <BrowserBar url={project.url} />
                    <div className="relative aspect-[16/10] overflow-hidden bg-ink-3">
                      <div className="absolute inset-0 transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]">
                        <ProjectImage project={project} locale={locale} />
                      </div>
                    </div>
                  </button>
                  <div className="mt-4 flex items-center justify-between">
                    <p className="t-label !text-[0.64rem] text-accent">{copy.categories[project.category]}</p>
                    <span className="t-label !text-[0.62rem] text-paper/35">{String(DEVELOPMENT_PROJECTS.indexOf(project) + 1).padStart(2, '0')} / {String(DEVELOPMENT_PROJECTS.length).padStart(2, '0')}</span>
                  </div>
                  <div className="mt-2 flex items-start justify-between gap-4">
                    <h3 className="t-kr-title text-[1.25rem] text-paper">
                      <button type="button" disabled={!hydrated} onClick={() => setPreview(project)} className="text-left decoration-paper/40 underline-offset-4 hover:underline disabled:cursor-progress">{project.name[locale]}</button>
                    </h3>
                    <a href={project.url} target="_blank" rel="noopener noreferrer" aria-label={project.name[locale] + ' ' + copy.visitSuffix} className="mt-0.5 shrink-0 text-paper/50 transition-[color,transform] duration-300 hover:-translate-y-0.5 hover:translate-x-0.5 hover:text-accent">
                      <ArrowUpRight size={22} aria-hidden="true" />
                    </a>
                  </div>
                  <p className="mt-2 text-[0.92rem] leading-relaxed text-paper/55">{project.description[locale]}</p>
                  <ul className="mt-4 flex flex-wrap gap-1.5" aria-label={ko ? '프로젝트 키워드' : 'Project keywords'}>
                    {project.tags.map((tag) => <li key={tag} className="rounded-full border border-paper/15 px-2.5 py-1 font-display text-[10px] tracking-[0.08em] text-paper/55">{tag}</li>)}
                  </ul>
                </article>
              </Reveal>
            ))}
          </div>
          <p className="mt-12 flex items-center gap-3 text-[13px] text-paper/45"><span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent" />{copy.workNote}</p>
        </div>
      </section>

      {/* ── 일하는 순서 ───────────────────────────────── */}
      <section className="border-t border-paper/10 bg-ink" aria-labelledby="development-process-title">
        <div className="wrap section-y">
          <SectionHead id="development-process-title" no="03" label={copy.processEyebrow} en={['START TO', 'GROWTH.']} ko={copy.processTitle.replace('\n', ' ')} aside={<span className="whitespace-pre-line">{copy.processDescription}</span>} />
          <ol className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {copy.steps.map((step, index) => {
              const last = index === copy.steps.length - 1;
              return (
                <Reveal as="li" key={step.label} delay={index * 80} className={cn('flex min-h-[19rem] flex-col border p-7 lg:p-8', last ? 'border-paper bg-paper text-ink' : 'border-paper/15')}>
                  <span className={cn('font-display text-[4.2rem] font-extrabold leading-none', last ? 'text-ink' : 'text-outline')}>0{index + 1}</span>
                  <p className={cn('t-label mt-auto pt-8 !text-[0.64rem]', last ? 'text-ink/55' : 'text-accent')}>{step.label}</p>
                  <h3 className="t-kr-title mt-2.5 text-[1.3rem]">{step.title}</h3>
                  <p className={cn('mt-3 text-[0.95rem] leading-relaxed', last ? 'text-ink/65' : 'text-paper/60')}>{step.description}</p>
                </Reveal>
              );
            })}
          </ol>
        </div>
      </section>

      {/* ── 상담 ──────────────────────────────────────── */}
      <Spotlight as="section" className="overflow-hidden border-t border-paper/10 bg-ink">
        <div className="wrap section-y relative text-center" aria-labelledby="development-cta-title">
          <Reveal><p className="t-label text-paper/55">{copy.ctaEyebrow}</p></Reveal>
          <Title id="development-cta-title" en={['WHAT SHALL', 'WE BUILD?']} ko={copy.ctaTitle.replace('\n', ' ')} size="h1" className="mt-7" />
          <Reveal delay={120}><p className="mx-auto mt-8 max-w-xl whitespace-pre-line text-[1.05rem] leading-relaxed text-paper/65">{copy.ctaDescription}</p></Reveal>
          <Reveal delay={180} className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Btn href={CONTACT_HREF} variant="fill" arrow>{copy.consult}</Btn>
            <Btn
              href={'mailto:' + CONTACT.email + '?subject=' + encodeURIComponent(ko ? '[개발·AX] 프로젝트 상담' : '[Development & AX] Project inquiry')}
              external
              aria-label={copy.emailLabel + ' ' + CONTACT.email}
            >
              {CONTACT.email}
            </Btn>
          </Reveal>
        </div>
      </Spotlight>

      {preview && <ProjectPreview key={preview.id} project={preview} locale={locale} onClose={() => setPreview(null)} />}
    </div>
  );
}

function ProjectPreview({ project, locale, onClose }: { project: DevelopmentProject; locale: DevelopmentLocale; onClose: () => void }) {
  const copy = DEVELOPMENT_COPY[locale];
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [mode, setMode] = useState<'overview' | 'live'>('overview');
  const [mobile, setMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  const externalOnly = EXTERNAL_ONLY_PROJECTS.includes(project.id);
  const live = mode === 'live' && !externalOnly;

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';
    dialog?.showModal();
    return () => { dialog?.close(); document.body.style.overflow = previousOverflow; previousFocus?.focus({ preventScroll: true }); };
  }, []);

  useEffect(() => {
    if (mode !== 'live') return;
    const timer = window.setTimeout(() => setLoading(false), 10000);
    return () => window.clearTimeout(timer);
  }, [mode]);

  const toggle = (on: boolean) => cn('inline-flex min-h-10 items-center gap-2 border px-4 text-[13px] font-semibold transition-colors', on ? 'border-paper bg-paper text-ink' : 'border-paper/20 text-paper/65 hover:border-paper/50 hover:text-paper');

  return (
    <dialog
      ref={dialogRef}
      data-preview-mode={live ? 'live' : 'overview'}
      aria-labelledby="development-preview-title"
      aria-describedby="development-preview-description"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
      data-lenis-prevent
      className={cn(
        'theme-dark fixed inset-0 m-auto w-[min(84rem,calc(100%-1rem))] max-w-none overflow-hidden border border-paper/15 bg-ink-2 p-0 text-paper backdrop:bg-ink/80 backdrop:backdrop-blur-md sm:w-[min(84rem,calc(100%-3rem))]',
        live ? 'h-[min(56rem,calc(100dvh-1.5rem))] sm:h-[min(56rem,calc(100dvh-3rem))]' : 'h-fit max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3rem)]',
      )}
    >
      <div className={cn('flex w-full flex-col', live ? 'h-full' : 'max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3rem)]')}>
        <div className="flex items-center justify-between gap-4 border-b border-paper/12 px-5 py-4 sm:px-7">
          <div className="min-w-0">
            <p className="t-label !text-[0.62rem] text-accent">{copy.categories[project.category]}</p>
            <h2 id="development-preview-title" className="t-kr-title mt-1 truncate text-xl text-paper">{project.name[locale]}</h2>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <a href={project.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-1.5 whitespace-nowrap bg-paper px-3 text-[13px] font-semibold text-ink transition-colors hover:bg-accent sm:gap-2 sm:px-4">{copy.visit}<ExternalLink size={14} aria-hidden="true" /></a>
            <button type="button" onClick={onClose} aria-label={copy.close} autoFocus className="flex h-10 w-10 items-center justify-center border border-paper/20 text-paper/80 transition-colors hover:border-paper hover:text-paper"><X size={20} aria-hidden="true" /></button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-paper/12 px-5 py-3 sm:px-7">
          <div role="group" aria-label={locale === 'ko' ? '프로젝트 보기 방식' : 'Preview mode'} className="flex gap-2">
            <button type="button" aria-pressed={mode === 'overview'} onClick={() => setMode('overview')} className={toggle(mode === 'overview')}>{project.image ? copy.overview : locale === 'ko' ? '프로젝트 소개' : 'Project overview'}</button>
            <button type="button" aria-pressed={mode === 'live'} onClick={() => { if (mode !== 'live') { setLoading(true); setMode('live'); } }} className={toggle(mode === 'live')}>
              <span aria-hidden="true" className={cn('h-1.5 w-1.5 rounded-full', mode === 'live' ? 'bg-accent-deep' : 'bg-accent')} />{copy.live}
            </button>
          </div>
          {live && (
            <div role="group" aria-label={locale === 'ko' ? '미리보기 기기' : 'Preview device'} className="flex gap-1.5">
              <button type="button" aria-pressed={!mobile} aria-label={copy.desktop} onClick={() => setMobile(false)} className={cn(toggle(!mobile), '!px-3')}><Monitor size={16} aria-hidden="true" /></button>
              <button type="button" aria-pressed={mobile} aria-label={copy.mobile} onClick={() => setMobile(true)} className={cn(toggle(mobile), '!px-3')}><Smartphone size={16} aria-hidden="true" /></button>
            </div>
          )}
        </div>

        <div className={cn('relative min-h-0 bg-ink p-3 sm:p-5', live ? 'flex-1' : 'overflow-y-auto')}>
          {!live ? (
            <div className="relative mx-auto aspect-[16/10] w-full max-w-[70rem] overflow-hidden bg-ink-3">
              <ProjectImage project={project} locale={locale} sizes="90vw" contain />
              <span className="t-label absolute bottom-3 left-3 bg-ink/70 px-2.5 py-1.5 !text-[0.6rem] text-paper/85 backdrop-blur">{project.image ? copy.screenshotLabel : copy.fallback}</span>
              {mode === 'live' && externalOnly && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-ink/85 p-6 text-center backdrop-blur-sm">
                  <p className="t-kr-title text-xl text-paper">{copy.liveUnavailable}</p>
                  <span className="max-w-sm text-sm leading-relaxed text-paper/65">{copy.liveUnavailableDescription}</span>
                  <a href={project.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-12 items-center gap-2.5 bg-paper px-6 text-[0.95rem] font-semibold text-ink transition-colors hover:bg-accent">{copy.visit}<ArrowUpRight size={17} aria-hidden="true" /></a>
                </div>
              )}
            </div>
          ) : (
            <div className={cn('relative mx-auto h-full min-h-[20rem] overflow-hidden bg-snow', mobile ? 'w-[min(390px,100%)]' : 'w-full')} data-mobile={mobile}>
              {loading && (
                <div className="absolute inset-0 z-[2] flex flex-col items-center justify-center bg-ink-2 text-center" role="status">
                  <span className="h-6 w-6 animate-spin rounded-full border border-paper/20 border-t-accent" />
                  <p className="mt-3 text-[0.95rem] font-semibold text-paper">{copy.loading}</p>
                  <span className="mt-1 text-xs text-paper/50">{copy.loadingDescription}</span>
                </div>
              )}
              <iframe
                src={project.url}
                title={project.name[locale] + ' — ' + copy.liveTitle}
                className="relative z-[1] block h-full w-full border-0"
                onLoad={() => setLoading(false)}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads"
                referrerPolicy="no-referrer"
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-5 border-t border-paper/12 px-5 py-3.5 sm:px-7">
          <p id="development-preview-description" className="text-xs leading-relaxed text-paper/55">{mode === 'overview' ? project.description[locale] : copy.liveHint}</p>
          <a href={project.url} target="_blank" rel="noopener noreferrer" className="flex shrink-0 items-center gap-2 font-display text-[11px] tracking-[0.06em] text-paper/70 transition-colors hover:text-accent">{hostname(project.url)}<ArrowUpRight size={13} aria-hidden="true" /></a>
        </div>
      </div>
    </dialog>
  );
}
