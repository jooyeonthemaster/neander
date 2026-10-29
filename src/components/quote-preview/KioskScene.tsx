'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Monitor, Printer } from 'lucide-react';
import type { Lang } from '@/lib/quote/catalog';
import type { KioskOptions } from '@/lib/quote/engine';
import { getKioskAssignments, getKioskExperience } from '@/lib/quote/kiosk-experiences';
import { PreviewCanvas } from './PreviewCanvas';
import { PlantGlyph, PrinterGlyph, palette } from './illustrations/VectorPrimitives';
import { KioskExperienceGlyph, SceneStage } from './illustrations/ServiceIllustration';

/** Every selected kiosk and printer uses the shared SVG equipment at one scale. */
export function KioskScene({ options, lang }: { options: KioskOptions; lang: Lang }) {
  const reducedMotion = useReducedMotion();
  const L = (ko: string, en: string) => lang === 'ko' ? ko : en;
  const positions = options.kiosks === 1 ? [276] : options.kiosks === 2 ? [214, 384] : options.kiosks === 3 ? [145, 304, 463] : [92, 229, 366, 503];
  const assignments = getKioskAssignments(options);
  const duration = reducedMotion ? 0 : 0.28;
  const printerCount = options.printer ? options.kiosks : 0;
  const description = L(`키오스크 ${options.kiosks}대와 프린터 ${printerCount}대 구성 일러스트`, `Illustration of ${options.kiosks} kiosks and ${printerCount} printers`);
  return <section data-testid="kiosk-scene" data-kiosks={options.kiosks} data-printers={printerCount} data-mode="event" data-renderer="svg" className="overflow-hidden bg-[#f5f2e9]">
    <div className="border-y border-white/75 bg-white/65 px-4 py-2.5 text-[10px] font-semibold text-slate-600 sm:px-5">{L('행사장에 설치한 모습', 'Setup at your event')}</div>
    <PreviewCanvas lang={lang} label={description}>
    <svg viewBox="0 0 600 400" role="img" aria-label={description} preserveAspectRatio="xMidYMid meet" className="block h-full w-full">
      <SceneStage />
      {options.kiosks === 1 && <PlantGlyph x={470} y={323} scale={1.1} />}
      <AnimatePresence initial={false}>{positions.map((x, index) => <motion.g key={`station-${index}`} data-testid="rental-scene-station" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration }}>
        <g data-testid="rental-scene-kiosk" data-instance={index + 1} data-experience-slug={assignments[index]}>
          <KioskExperienceGlyph x={x} y={330} scale={1.45} slug={assignments[index]} branded={options.custom === 'brand'} />
        </g>
        <AnimatePresence initial={false}>{options.printer && <motion.g key="printer" data-testid="rental-scene-printer" data-instance={index + 1} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration }}>
          <path d={`M${x + 35} 289V336M${x + 61} 289V336`} stroke={palette.navy} strokeWidth="3" /><rect x={x + 29} y="281" width="39" height="8" rx="3" fill={palette.paper} stroke={palette.line} strokeWidth="2" /><PrinterGlyph x={x + 48} y={281} scale={0.7} />
        </motion.g>}</AnimatePresence>
        <circle cx={x} cy="364" r="12" fill={palette.tealDark} />
        <text x={x} y="368" textAnchor="middle" fill={palette.paper} fontSize="12" fontWeight="600">{index + 1}</text>
      </motion.g>)}</AnimatePresence>
    </svg>
    </PreviewCanvas>
    <ol aria-label={L('기기별 체험', 'Experience on each kiosk')} className="grid gap-2 px-4 pb-4 sm:grid-cols-2 sm:px-5">
      {assignments.map((slug, index) => <li key={index} data-testid={`preview-kiosk-assignment-${index + 1}`} data-instance={index + 1} data-experience-slug={slug}
        className="flex min-w-0 items-center gap-2.5 rounded-xl border border-white bg-white/80 px-3 py-2.5">
        <span aria-hidden="true" className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-700 text-[11px] font-bold text-white">{index + 1}</span>
        <div className="min-w-0"><p className="text-[10px] font-medium text-slate-500">{L(`${index + 1}번 기기`, `Kiosk ${index + 1}`)}</p><p className="mt-0.5 text-xs font-semibold leading-relaxed text-slate-700">{getKioskExperience(slug)?.name[lang] ?? L('체험 미정', 'Choose later')}</p></div>
      </li>)}
    </ol>
    <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-white/80 bg-white/65 px-4 py-3.5 text-xs text-slate-600 sm:px-5" aria-live="polite" aria-atomic="true">
      <span className="inline-flex items-center gap-2"><Monitor size={14} className="text-teal-600" aria-hidden="true" />{L(`키오스크 ${options.kiosks}대`, `${options.kiosks} kiosk(s)`)}</span><span className="inline-flex items-center gap-2"><Printer size={14} className="text-teal-600" aria-hidden="true" />{options.printer ? L(`프린터 ${printerCount}대`, `${printerCount} printer(s)`) : L('화면에서 결과 확인', 'On-screen results')}</span>
    </div>
  </section>;
}
