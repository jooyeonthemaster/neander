'use client';

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type MouseEvent } from 'react';
import Image from 'next/image';
import { ArrowDown, ArrowRight, ArrowUpRight, Blocks, Box, Code2, ExternalLink, Globe2, Monitor, Play, Smartphone, Sparkles, Workflow, X } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { CONTACT } from '@/lib/constants';
import { smoothScrollIntoView } from '@/lib/smooth-scroll';
import { DEVELOPMENT_PROJECTS, type DevelopmentCategory, type DevelopmentProject } from '@/data/development-projects';
import { DEVELOPMENT_COPY, type DevelopmentLocale } from './copy';
import { EXTERNAL_ONLY_PROJECTS } from './preview-policy';
import styles from './development.module.css';

type Category = 'all' | DevelopmentCategory;
const CATEGORIES: readonly Category[] = ['all', 'web', 'commerce', 'ai', 'platform', 'interactive'];
const FEATURED_IDS = ['ansan-science', 'smoat', 'ikseonjae'];
const FEATURED = FEATURED_IDS.map((id) => DEVELOPMENT_PROJECTS.find((project) => project.id === id)!).filter(Boolean);
const SCOPE_ICONS = { web: Globe2, platform: Blocks, ai: Sparkles, ax: Workflow };
const CONTACT_HREF = '/contact?type=development';
const subscribeToHydration = () => () => {};
const clientHydrationSnapshot = () => true;
const serverHydrationSnapshot = () => false;

function ProjectImage({ project, locale, priority = false, sizes = '(min-width: 1280px) 580px, (min-width: 768px) 46vw, 92vw' }: {
  project: DevelopmentProject; locale: DevelopmentLocale; priority?: boolean; sizes?: string;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={styles.projectImage} style={{ '--project-accent': project.accent } as CSSProperties}>
      {project.image && !failed ? (
        <Image src={project.image} alt={project.name[locale] + ' ' + DEVELOPMENT_COPY[locale].screenshotAlt} fill priority={priority} sizes={sizes} className={styles.screenImage} onError={() => setFailed(true)} />
      ) : (
        <div className={styles.projectPoster + (project.id === 'booth-3d' ? ' ' + styles.modelPoster : '')}>
          {project.id === 'booth-3d' && <Box className={styles.modelSketch} size={170} strokeWidth={.6} aria-hidden="true" />}
          <Code2 size={26} strokeWidth={1.25} aria-hidden="true" />
          <span>{project.client}</span>
          <strong>{project.name[locale]}</strong>
          <small>{DEVELOPMENT_COPY[locale].fallback}<ArrowUpRight size={14} aria-hidden="true" /></small>
        </div>
      )}
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

  return (
    <div className={styles.page}>
      <section className={styles.hero} aria-labelledby="development-hero-title">
        <div className={styles.heroGrid} aria-hidden="true" />
        <div className={styles.container}>
          <div className={styles.heroLayout}>
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}><span className={styles.statusDot} />{copy.eyebrow}</p>
              <h1 id="development-hero-title" className={styles.heroTitle}>
                <span>{copy.title[0]}</span><span>{copy.title[1]}</span>
              </h1>
              <p className={styles.heroLead}>{copy.lead}</p>
              <p className={styles.heroDescription}>{copy.description}</p>
              <div className={styles.heroActions}>
                <Link href={CONTACT_HREF} className={styles.primaryButton}>{copy.consult}<ArrowUpRight size={18} aria-hidden="true" /></Link>
                <a href="#development-work" onClick={scrollToWork} className={styles.textButton}>{copy.explore}<ArrowDown size={16} aria-hidden="true" /></a>
              </div>
              <div className={styles.heroFootnote}><span className={styles.smallRule} /><p>{copy.heroCaption}</p></div>
            </div>

            <div className={styles.heroVisual}>
              <div className={styles.visualBackplate} aria-hidden="true"><Code2 size={40} strokeWidth={1} /></div>
              <div className={styles.heroBrowser}>
                <div className={styles.browserToolbar} aria-hidden="true">
                  <span className={styles.browserDots}><i /><i /><i /></span>
                  <span>{new URL(featured.url).hostname}</span><ArrowUpRight size={13} />
                </div>
                <button className={styles.heroScreen} disabled={!hydrated} onClick={() => setPreview(featured)} aria-label={featured.name[locale] + ' ' + copy.previewSuffix}>
                  <ProjectImage key={featured.id} project={featured} locale={locale} priority sizes="(min-width: 1024px) 650px, 95vw" />
                  <span className={styles.heroScreenAction}><Play size={12} fill="currentColor" aria-hidden="true" />{copy.heroPreview}</span>
                </button>
                <div className={styles.heroBrowserCaption}>
                  <div><span>{copy.selected} / 0{featuredIndex + 1}</span><strong>{featured.name[locale]}</strong></div>
                  <button disabled={!hydrated} onClick={() => setPreview(featured)} className={styles.circleButton} aria-label={featured.name[locale] + ' ' + copy.previewSuffix}><ArrowUpRight size={21} aria-hidden="true" /></button>
                </div>
              </div>
              <div className={styles.featuredSelectors} role="group" aria-label={copy.heroSelect}>
                {FEATURED.map((project, index) => <button key={project.id} disabled={!hydrated} aria-pressed={featuredIndex === index} onClick={() => setFeaturedIndex(index)}><span>0{index + 1}</span>{project.id === 'ansan-science' ? locale === 'ko' ? '안산 과학축제' : 'ANSAN FESTIVAL' : project.name[locale]}</button>)}
              </div>
            </div>
          </div>
          <div className={styles.heroBottom} aria-hidden="true"><span>STRATEGY</span><i /><span>DESIGN</span><i /><span>DEVELOPMENT</span><i /><span>AI TRANSFORMATION</span><ArrowDown size={15} /></div>
        </div>
      </section>

      <section className={styles.scope} aria-labelledby="development-scope-title">
        <div className={styles.container}>
          <div className={styles.scopeHeading}><p className={styles.eyebrow}>{copy.scopeEyebrow}</p><h2 id="development-scope-title">{copy.scopeTitle}</h2></div>
          <div className={styles.scopeGrid}>
            {copy.scopes.map((scope, index) => {
              const Icon = SCOPE_ICONS[scope.icon];
              return <div key={scope.icon} className={styles.scopeItem}><div className={styles.scopeItemTop}><Icon size={25} strokeWidth={1.3} aria-hidden="true" /><span>0{index + 1}</span></div><h3>{scope.title}</h3><p>{scope.description}</p></div>;
            })}
          </div>
        </div>
      </section>

      <section id="development-work" className={styles.work} aria-labelledby="development-work-title">
        <div className={styles.container}>
          <div className={styles.workHeading}>
            <div><p className={styles.eyebrow}>{copy.workEyebrow}</p><h2 id="development-work-title" tabIndex={-1}>{copy.workTitle}</h2></div>
            <div className={styles.workIntroduction}><p>{copy.workDescription}</p></div>
          </div>

          <div ref={filterAnchorRef} aria-hidden="true" />
          <div ref={filterBarRef} className={styles.filterBar}>
            <div className={styles.filters} role="group" aria-label={copy.filterLabel}>
              {CATEGORIES.map((item) => {
                const count = item === 'all' ? DEVELOPMENT_PROJECTS.length : DEVELOPMENT_PROJECTS.filter((project) => project.category === item).length;
                return <button key={item} disabled={!hydrated} onClick={() => changeCategory(item)} aria-pressed={category === item}>{copy.categories[item]}<span aria-hidden="true">{String(count).padStart(2, '0')}</span></button>;
              })}
            </div>
            <span className={styles.filterCount} role="status" aria-live="polite">{copy.visibleCount(visibleProjects.length, DEVELOPMENT_PROJECTS.length)}</span>
          </div>

          <div className={styles.projectGrid}>
            {visibleProjects.map((project) => <article key={project.id} className={styles.projectCard} data-development-project={project.id}>
              <button className={styles.cardVisual} disabled={!hydrated} onClick={() => setPreview(project)} aria-label={project.name[locale] + ' ' + copy.previewSuffix} style={{ '--project-accent': project.accent } as CSSProperties}>
                <div className={styles.cardBrowser}>
                  <div className={styles.cardToolbar} aria-hidden="true"><span className={styles.browserDots}><i /><i /><i /></span><span>{new URL(project.url).hostname}</span><ArrowUpRight size={12} /></div>
                  <div className={styles.cardScreen}><ProjectImage project={project} locale={locale} /></div>
                </div>
                <span className={styles.previewPill}><Play size={11} fill="currentColor" aria-hidden="true" />{copy.preview}</span>
              </button>
              <div className={styles.cardMeta}><p>{copy.categories[project.category]}</p><span>{String(DEVELOPMENT_PROJECTS.indexOf(project) + 1).padStart(2, '0')} / {String(DEVELOPMENT_PROJECTS.length).padStart(2, '0')}</span></div>
              <div className={styles.cardTitleRow}><h3><button disabled={!hydrated} onClick={() => setPreview(project)}>{project.name[locale]}</button></h3><a href={project.url} target="_blank" rel="noopener noreferrer" aria-label={project.name[locale] + ' ' + copy.visitSuffix} className={styles.cardExternal}><ArrowUpRight size={22} aria-hidden="true" /></a></div>
              <p className={styles.cardDescription}>{project.description[locale]}</p>
              <ul className={styles.projectTags} aria-label={locale === 'ko' ? '프로젝트 키워드' : 'Project keywords'}>{project.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>
            </article>)}
          </div>
          <p className={styles.workNote}><span className={styles.statusDot} />{copy.workNote}</p>
        </div>
      </section>

      <section className={styles.process} aria-labelledby="development-process-title">
        <div className={styles.container}>
          <div className={styles.processLayout}>
            <div className={styles.processIntro}><p className={styles.eyebrow}>{copy.processEyebrow}</p><h2 id="development-process-title">{copy.processTitle}</h2><p>{copy.processDescription}</p><div className={styles.processSignature} aria-hidden="true"><span>{'{'}<span>n</span>{'}'}</span><span>YOUR IDEA.<br />OUR NEXT COMMIT.</span></div></div>
            <ol className={styles.processSteps}>{copy.steps.map((step, index) => <li key={step.label}><span className={styles.stepNumber}>0{index + 1}</span><div><p className={styles.stepLabel}>{step.label}</p><h3>{step.title}</h3><p className={styles.stepDescription}>{step.description}</p></div><ArrowDown size={17} aria-hidden="true" /></li>)}</ol>
          </div>
        </div>
      </section>

      <section className={styles.cta} aria-labelledby="development-cta-title">
        <div className={styles.container}><div className={styles.ctaLayout}><div><p className={styles.eyebrow}>{copy.ctaEyebrow}</p><h2 id="development-cta-title">{copy.ctaTitle}</h2></div><div className={styles.ctaActions}><p>{copy.ctaDescription}</p><Link href={CONTACT_HREF} className={styles.primaryButton}>{copy.consult}<ArrowUpRight size={19} aria-hidden="true" /></Link><a href={'mailto:' + CONTACT.email + '?subject=' + encodeURIComponent(locale === 'ko' ? '[프로그램 개발 / AX] 프로젝트 상담' : '[Development / AX] Project inquiry')} className={styles.emailLink} aria-label={copy.emailLabel + ' ' + CONTACT.email}>{CONTACT.email}<ArrowRight size={16} aria-hidden="true" /></a></div></div></div>
      </section>

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

  return (
    <dialog ref={dialogRef} className={styles.previewDialog} data-preview-mode={mode === 'live' && !externalOnly ? 'live' : 'overview'} aria-labelledby="development-preview-title" aria-describedby="development-preview-description" onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }} data-lenis-prevent>
      <div className={styles.previewPanel}>
        <div className={styles.previewHeader}>
          <div><p>{copy.categories[project.category]}</p><h2 id="development-preview-title">{project.name[locale]}</h2></div>
          <div className={styles.previewHeaderActions}><a href={project.url} target="_blank" rel="noopener noreferrer" className={styles.previewVisit}>{copy.visit}<ExternalLink size={15} aria-hidden="true" /></a><button onClick={onClose} aria-label={copy.close} className={styles.previewClose} autoFocus><X size={22} aria-hidden="true" /></button></div>
        </div>
        <div className={styles.previewControls}>
          <div role="group" aria-label={locale === 'ko' ? '프로젝트 보기 방식' : 'Preview mode'} className={styles.previewMode}><button aria-pressed={mode === 'overview'} onClick={() => setMode('overview')}>{project.image ? copy.overview : locale === 'ko' ? '프로젝트 소개' : 'Project overview'}</button><button aria-pressed={mode === 'live'} onClick={() => { if (mode !== 'live') { setLoading(true); setMode('live'); } }}><span className={styles.statusDot} />{copy.live}</button></div>
          {mode === 'live' && !externalOnly && <div role="group" aria-label={locale === 'ko' ? '미리보기 기기' : 'Preview device'} className={styles.deviceControls}><button aria-pressed={!mobile} aria-label={copy.desktop} onClick={() => setMobile(false)}><Monitor size={17} aria-hidden="true" /></button><button aria-pressed={mobile} aria-label={copy.mobile} onClick={() => setMobile(true)}><Smartphone size={17} aria-hidden="true" /></button></div>}
        </div>
        <div className={styles.previewBody}>
          {mode === 'overview' || externalOnly ? <div className={styles.overviewFrame}><ProjectImage project={project} locale={locale} sizes="90vw" /><span className={styles.overviewLabel}>{project.image ? copy.screenshotLabel : copy.fallback}</span>{mode === 'live' && externalOnly && <div className={styles.externalNotice}><p>{copy.liveUnavailable}</p><span>{copy.liveUnavailableDescription}</span><a href={project.url} target="_blank" rel="noopener noreferrer" className={styles.primaryButton}>{copy.visit}<ArrowUpRight size={18} aria-hidden="true" /></a></div>}</div> : <div className={styles.liveFrame} data-mobile={mobile}>
            {loading && <div className={styles.liveLoading} role="status"><span className={styles.loader} /><p>{copy.loading}</p><span>{copy.loadingDescription}</span></div>}
            <iframe src={project.url} title={project.name[locale] + ' — ' + copy.liveTitle} className={styles.liveIframe} onLoad={() => setLoading(false)} sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads" referrerPolicy="no-referrer" />
          </div>}
        </div>
        <div className={styles.previewFooter}><p id="development-preview-description">{mode === 'overview' ? project.description[locale] : copy.liveHint}</p><a href={project.url} target="_blank" rel="noopener noreferrer">{new URL(project.url).hostname}<ArrowUpRight size={13} aria-hidden="true" /></a></div>
      </div>
    </dialog>
  );
}
