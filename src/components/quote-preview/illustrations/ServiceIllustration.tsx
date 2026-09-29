'use client';

import { motion, useReducedMotion } from 'motion/react';
import { SERVICE_TEXT, type Lang, type ServiceKey } from '@/lib/quote/catalog';
import { defaultOptions, type QuoteItem } from '@/lib/quote/engine';
import { getKioskAssignments, getKioskExperience } from '@/lib/quote/kiosk-experiences';
import { getExperienceBySlug } from '@/data/experiences';
import { cn } from '@/lib/utils';
import { CounterGlyph, KioskGlyph, PerfumeBottleGlyph, PersonGlyph, PhotoBoothGlyph, PhotoFrameGlyph, PlantGlyph, TeamGlyph, palette } from './VectorPrimitives';

export function SceneStage() {
  return <g aria-hidden="true">
    <rect width="600" height="400" fill={palette.background} />
    <path d="M36 292 292 229 566 292 314 377Z" fill={palette.paper} />
    <path d="M36 292 314 356 566 292 566 307 314 377 36 308Z" fill="#e9e5dc" />
    <path d="M84 274 300 220 517 270" fill="none" stroke={palette.line} strokeWidth="2" />
    <g><rect x="62" y="82" width="110" height="58" rx="14" fill={palette.tealLight} /><path d="M84 105H148M84 118H127" stroke={palette.teal} strokeWidth="5" strokeLinecap="round" /></g>
  </g>;
}

function FlowArrow({ x, y }: { x: number; y: number }) {
  return <g transform={`translate(${x} ${y})`} fill="none" stroke={palette.teal} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M-21 0H20M11-9 21 0 11 9" /></g>;
}

function ContentScreen({ x, y, wide = false, index = 0 }: { x: number; y: number; wide?: boolean; index?: number }) {
  const width = wide ? 230 : 142;
  return <g transform={`translate(${x} ${y})`}>
    <rect x={-width / 2} y="-188" width={width} height="169" rx="15" fill={palette.navy} /><rect x={-width / 2 + 9} y="-178" width={width - 18} height="145" rx="9" fill={index % 2 ? palette.tealLight : palette.paper} />
    <rect x={-width / 2 + 24} y="-162" width="49" height="7" rx="3.5" fill={palette.teal} /><circle cy="-108" r="29" fill={index % 2 ? palette.paper : palette.tealLight} />
    <path d="M0-130 7-115 23-108 7-101 0-85-7-101-23-108-7-115Z" fill={index % 2 ? palette.coral : palette.teal} /><path d="M-34-63H34M-24-52H24" stroke={palette.line} strokeWidth="5" strokeLinecap="round" />
    <path d="M-10-19V0H10V-19" fill={palette.navy} /><rect x="-38" y="-1" width="76" height="8" rx="4" fill={palette.navy} />
  </g>;
}

function kioskScreenKind(slug: string) {
  if (!getKioskExperience(slug)) return 'pending';
  if (slug.includes('color')) return 'color';
  if (slug.includes('palm')) return 'palm';
  if (/face|skin|celeb/.test(slug)) return 'face';
  if (slug.includes('scent')) return 'scent';
  if (/sommelier|cocktail|barista|taste/.test(slug)) return 'drink';
  if (/style-profiler|coord/.test(slug)) return 'fashion';
  if (/music|voice|movie/.test(slug)) return 'music';
  if (/career|business/.test(slug)) return 'work';
  if (/travel|heritage/.test(slug)) return 'travel';
  if (getExperienceBySlug(slug)?.pillar === 'ai-fortune') return 'fortune';
  return getExperienceBySlug(slug)?.pillar === 'ai-creative' ? 'creative' : 'analysis';
}

function KioskExperienceMark({ slug, light = false }: { slug: string; light?: boolean }) {
  const ink = light ? palette.paper : palette.tealDark;
  const accent = light ? palette.tealLight : palette.coral;
  const kind = kioskScreenKind(slug);
  return <g strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.4">
    {kind === 'pending' && <g fill={palette.silverDark}><circle cx="-6" r="2" /><circle r="2" /><circle cx="6" r="2" /></g>}
    {kind === 'color' && <><circle r="9" fill={accent} /><path d="M0-9A9 9 0 0 1 9 0H0Z" fill={palette.ochre} /><path d="M0 0H9A9 9 0 0 1 0 9Z" fill={ink} /><path d="M0 0V9A9 9 0 0 1-9 0Z" fill={palette.teal} /></>}
    {kind === 'face' && <><path d="M-6-9Q0-13 6-9L8-2Q8 8 0 10-8 8-8-2Z" fill={accent} /><path d="M-4-1H-2M2-1H4M-3 5Q0 7 3 5M-10-8V-11H-7M10-8V-11H7" fill="none" stroke={ink} /></>}
    {kind === 'palm' && <path d="M-4 10Q-8 7-8 2V-2Q-8-5-5-3L-3 0V-8Q-3-11-1-10V-3-11Q1-13 2-10V-3-9Q4-11 5-8V-2-6Q8-8 8-5V3Q8 10 2 11Z" fill={accent} stroke={ink} />}
    {kind === 'scent' && <><rect x="-6" y="-5" width="12" height="15" rx="2" fill={accent} stroke={ink} /><rect x="-3.5" y="-10" width="7" height="5" rx="1" fill={ink} /><path d="M-3 1H3M-3 4H2" stroke={ink} /></>}
    {kind === 'drink' && <><path d="M-7-7H6L5 5Q-1 10-6 5Z" fill={accent} stroke={ink} /><path d="M6-5H10Q13 1 5 2M-3-11V-14M2-11V-14M-8 10H8" fill="none" stroke={ink} /></>}
    {kind === 'fashion' && <path d="m-4-9-7 4 3 6 4-2v12H5V-1l4 2 3-6-7-4Q0-4-4-9Z" fill={accent} stroke={ink} />}
    {kind === 'music' && <><path d="M-2 6V-8L8-11V3M-2-3 8-6" fill="none" stroke={ink} strokeWidth="2" /><ellipse cx="-5" cy="7" rx="4" ry="3" fill={accent} /><ellipse cx="5" cy="4" rx="4" ry="3" fill={accent} /></>}
    {kind === 'work' && <><rect x="-9" y="-5" width="18" height="14" rx="2" fill={accent} stroke={ink} /><path d="M-4-5V-9H4V-5M-9 0H9M-2 0V3H2V0" fill="none" stroke={ink} /></>}
    {kind === 'travel' && <><path d="M0 12Q-10 2-9-4-7-13 0-13T9-4Q10 2 0 12Z" fill={accent} /><circle cy="-4" r="4" fill="none" stroke={ink} /><path d="M-10 12H10" stroke={ink} /></>}
    {kind === 'fortune' && <><path d="M3-10A10 10 0 1 0 10 7 10 10 0 0 1 3-10Z" fill={accent} /><path d="m7-9 1 3 4 1-4 1-1 4-1-4-4-1 4-1Z" fill={ink} /></>}
    {kind === 'creative' && <><path d="m-8 6 13-16 5 4L-3 9Z" fill={accent} stroke={ink} /><path d="M-3 9Q-8 13-11 8L-8 6" fill={ink} /><path d="m2-6 5 4" stroke={ink} /></>}
    {kind === 'analysis' && <><path d="M-9 8V-2M-3 8V-8M3 8V-4M9 8V-11" stroke={accent} strokeWidth="3" /><path d="M-11 12H11" stroke={ink} /></>}
  </g>;
}

/** The same hardware, with an illustrative screen for its assigned experience. */
export function KioskExperienceGlyph({ slug, x = 0, y = 0, scale = 1, branded = false }: { slug: string; x?: number; y?: number; scale?: number; branded?: boolean }) {
  return <g data-screen-kind={kioskScreenKind(slug)} data-branded={branded}>
    <KioskGlyph x={x} y={y} scale={scale} screen={branded ? 'brand' : 'analysis'} />
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <rect x="-15" y="-144" width="27" height="62" rx="1.5" fill={branded ? palette.tealDark : palette.paper} />
      <path d="M-10-137H6" stroke={branded ? palette.tealLight : palette.teal} strokeWidth="2" strokeLinecap="round" />
      <g transform="translate(-1.5 -118) scale(.82)"><KioskExperienceMark slug={slug} light={branded} /></g>
      <path d="M-10-100H7M-10-95H2" stroke={branded ? palette.tealLight : palette.line} strokeWidth="1.2" strokeLinecap="round" opacity=".7" />
      <rect x="-10" y="-89" width="17" height="3" rx="1.5" fill={branded ? palette.paper : palette.tealLight} />
    </g>
  </g>;
}

/** Native SVG scenes share the same equipment, people and palette. */
export function ServiceIllustration({ service, item, view = 'scene', lang = 'ko', className, testId = 'preview-service-scene', thumbnail = false, presetId }: {
  service: ServiceKey; item?: QuoteItem; view?: string; lang?: Lang; className?: string; testId?: string; thumbnail?: boolean; presetId?: string;
}) {
  const reducedMotion = useReducedMotion();
  const selected = item?.key === service ? item : defaultOptions(service);
  const duration = reducedMotion ? 0 : 0.26;
  const portraitStyle = selected.key === 'photoBooth' && (selected.options.customStyles ?? 0) > 0 ? 'custom' : 'ready';
  const kioskExperience = selected.key === 'rental' ? getKioskAssignments(selected.options)[0] : '';
  return <svg viewBox="0 0 600 400" role={thumbnail ? undefined : 'img'} aria-hidden={thumbnail || undefined}
    aria-label={thumbnail ? undefined : `${SERVICE_TEXT[service].name[lang]} ${lang === 'ko' ? '구성 일러스트' : 'configuration illustration'}`}
    data-testid={thumbnail ? undefined : testId} data-renderer="svg" data-service={service} data-view={view}
    data-wrapping={selected.key === 'photoBooth' ? selected.options.wrapping : undefined}
    className={cn('block h-auto w-full', className)}>
    <SceneStage />
    {selected.key === 'acscent' && <g><TeamGlyph x={280} y={307} scale={1.2} /><CounterGlyph x={280} y={342} scale={1.45} /><KioskGlyph x={465} y={328} scale={1.2} /><PerfumeBottleGlyph x={155} y={174} scale={1.05} /></g>}
    {selected.key === 'spatialDesign' && <g>
      <path d="M105 287V102L310 53 500 115V304L306 355Z" fill={palette.paper} stroke={palette.line} strokeWidth="3" /><path d="M105 102 310 53V283L105 337Z" fill="#e7eee8" /><path d="M310 53 500 115V304L310 283Z" fill="#f2eee4" /><path d="M105 337 310 283 500 304 306 355Z" fill="#e1dacf" />
      <rect x="345" y="110" width="105" height="120" rx="40" fill={palette.tealLight} /><circle cx="398" cy="154" r="22" fill={palette.coral} /><CounterGlyph x={255} y={325} scale={0.82} /><PlantGlyph x={459} y={307} scale={0.85} /><path d="M157 122 286 89M342 88 449 123" stroke={palette.teal} strokeWidth="7" strokeLinecap="round" />
    </g>}
    {selected.key === 'rental' && <g>
      <KioskExperienceGlyph x={view === 'experience' ? 240 : 284} y={335} scale={1.55} slug={kioskExperience} branded={selected.options.custom === 'brand'} /><PersonGlyph x={view === 'experience' ? 363 : 409} y={342} scale={1.3} variant={1} role="guest" gesture="touch" />
      {view === 'experience' && <g><rect x="395" y="121" width="143" height="101" rx="16" fill={palette.paper} stroke={palette.line} strokeWidth="2" /><g transform="translate(426 157) scale(1.4)"><KioskExperienceMark slug={kioskExperience} /></g><path d="M452 150H516M452 164H499M416 195H516" stroke={palette.teal} strokeWidth="6" strokeLinecap="round" /></g>}
      {presetId && <PlantGlyph x={122} y={306} scale={0.85} />}
    </g>}
    {selected.key === 'photoBooth' && view === 'scene' && <g>
      {(selected.options.booths === 1 ? [280] : selected.options.booths === 2 ? [218, 386] : [144, 300, 456]).map((x, index) => <motion.g key={index} data-testid={thumbnail ? undefined : 'scene-photo-booth'} data-instance={index + 1} data-wrapping={selected.options.wrapping} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration }}><PhotoBoothGlyph x={x} y={338} scale={1.42} wrapped={selected.options.wrapping} /></motion.g>)}
      {selected.options.booths === 1 && <PersonGlyph x={424} y={344} scale={1.2} role="guest" variant={2} gesture="wave" />}
    </g>}
    {selected.key === 'photoBooth' && view === 'style' && <g><PhotoFrameGlyph x={177} y={318} scale={1.5} style="source" /><FlowArrow x={302} y={216} /><PhotoFrameGlyph x={431} y={318} scale={1.5} style={portraitStyle} /></g>}
    {selected.key === 'photoBooth' && view === 'result' && <g>
      <g transform="rotate(-8 185 226)"><PhotoFrameGlyph x={185} y={319} scale={1.5} style={portraitStyle} /></g><FlowArrow x={302} y={219} /><rect x="357" y="77" width="160" height="270" rx="24" fill={palette.navy} /><rect x="366" y="91" width="142" height="237" rx="17" fill={palette.paper} /><rect x="409" y="98" width="55" height="7" rx="3.5" fill={palette.navy} /><PhotoFrameGlyph x={437} y={294} scale={1.03} style={portraitStyle} /><circle cx="437" cy="338" r="3.5" fill={palette.paper} />
    </g>}
    {selected.key === 'mediaArt' && <g>
      <rect x="122" y="66" width="392" height="232" rx="14" fill={palette.navy} /><rect x="133" y="77" width="370" height="211" rx="7" fill="#263c47" />
      <g data-testid={thumbnail ? undefined : 'scene-projection'} data-grade={selected.options.grade}>{Array.from({ length: selected.options.grade === 'standard' ? 3 : selected.options.grade === 'premium' ? 5 : 7 }, (_, index) => <motion.ellipse key={index} cx={245 + index * 14} cy={183} rx={53 + index * 18} ry={29 + index * 12} fill="none" stroke={index % 2 ? palette.coral : palette.tealLight} strokeWidth={selected.options.grade === 'standard' ? 3 : 4} animate={reducedMotion ? { opacity: 0.75 } : { opacity: [0.35, 0.9, 0.35] }} transition={{ duration: 4, delay: index * 0.22, repeat: Infinity, ease: 'easeInOut' }} />)}</g>
      <PersonGlyph x={331} y={355} scale={1.28} variant={2} role="guest" gesture="wave" /><PersonGlyph x={75} y={339} scale={1.04} variant={0} role="assistant" gesture="touch" />
      <g data-testid={thumbnail ? undefined : 'scene-projector'}><path d="M105 286 147 264 147 133Z" fill={palette.tealLight} opacity=".25" /><path d="M99 299V345M99 314 78 344M99 314 119 344" stroke={palette.navy} strokeWidth="4" /><rect x="75" y="279" width="47" height="23" rx="7" fill={palette.paper} stroke={palette.line} strokeWidth="2" /><circle cx="112" cy="291" r="5" fill={palette.teal} /></g>
      {Array.from({ length: 1 + selected.options.extraSensors }, (_, index) => <g key={index} data-testid={thumbnail ? undefined : 'scene-sensor'} transform={`translate(${163 + index * 31} 367)`}><path d="M0-7V3M-5 3H5" stroke={palette.navy} strokeWidth="2" /><rect x="-8" y="-14" width="16" height="9" rx="4" fill={palette.navy} /><circle cx={selected.options.sensorType === 'depth' ? -3 : 0} cy="-9.5" r="2" fill={palette.tealLight} />{selected.options.sensorType === 'depth' && <circle cx="4" cy="-9.5" r="2" fill={palette.teal} />}{view === 'case' && <path d="M0-20-12-36M0-20 12-36" stroke={palette.teal} strokeWidth="2" strokeDasharray="3 3" />}</g>)}
    </g>}
    {selected.key === 'custom' && <g data-testid={thumbnail ? undefined : 'scene-custom-content'} data-scope={selected.options.scope}>
      {selected.options.scope === 'large' ? <><ContentScreen x={166} y={290} index={0} /><ContentScreen x={323} y={271} index={1} /><ContentScreen x={469} y={304} index={2} /><path d="M162 319 324 332 470 330" fill="none" stroke={palette.teal} strokeWidth="3" strokeDasharray="7 6" /></> : <ContentScreen x={328} y={291} wide />}
      <PersonGlyph x={selected.options.scope === 'large' ? 100 : 174} y={349} scale={1.16} role="guest" variant={1} gesture="touch" />
      {selected.options.consulting && <g><rect x="392" y="37" width="102" height="54" rx="13" fill={palette.tealLight} /><path d="M410 57H474M410 70H450" stroke={palette.teal} strokeWidth="5" strokeLinecap="round" /></g>}
    </g>}
  </svg>;
}

export function ServiceThumbnail({ service, presetId, className }: { service: ServiceKey; presetId?: string; className?: string }) {
  return <ServiceIllustration service={service} presetId={presetId} thumbnail className={className} />;
}

export function ExperienceIllustration({ slug, label, className, branded = false }: { slug: string; label: string; className?: string; branded?: boolean }) {
  const item = defaultOptions('rental');
  if (item.key !== 'rental') return null;
  item.options.experienceSlugs = [slug];
  if (branded) item.options.custom = 'brand';
  return <div role="img" aria-label={label} data-experience-slug={slug} className={cn('overflow-hidden rounded-xl bg-[#f5f2e9]', className)}><ServiceIllustration service="rental" item={item} view="experience" thumbnail /></div>;
}

export function PortraitIllustration({ style, lang, testId }: { style: 'source' | 'ready' | 'custom'; lang: Lang; testId: string }) {
  return <svg viewBox="0 0 240 240" role="img" aria-label={lang === 'ko' ? '인물 스타일 일러스트' : 'Illustrated portrait style'} data-testid={testId} data-style={style} data-renderer="svg" className="aspect-square w-full rounded-2xl bg-[#f5f2e9]"><PhotoFrameGlyph x={120} y={225} scale={1.4} style={style} /></svg>;
}
