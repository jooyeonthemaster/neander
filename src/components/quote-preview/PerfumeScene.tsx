'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Monitor, UsersRound } from 'lucide-react';
import type { Lang } from '@/lib/quote/catalog';
import type { QuoteInput } from '@/lib/quote/engine';
import { resolvePerfumeScene } from '@/lib/quote-preview/perfume-scene';
import { PreviewCanvas } from './PreviewCanvas';
import { KioskGlyph, TeamGlyph } from './illustrations/VectorPrimitives';
import { EventPerfumeCounterGlyph } from './illustrations/EventSceneGlyphs';
import { BoothEnvironment } from './illustrations/SpaceIllustration';

/** Every object shares the SVG's floor, projection and scale. No photographic layers. */
export function PerfumeScene({ input, lang }: { input: QuoteInput; lang: Lang }) {
  const model = resolvePerfumeScene(input);
  const reduced = useReducedMotion();
  const L = (ko: string, en: string) => lang === 'ko' ? ko : en;
  if (!model) return null;
  const duration = reduced ? 0 : .28;
  const built = model.footprint !== null;
  const closeUp = !built && model.kiosks.length === 0 && !model.photoZone && !model.lighting;
  const camera = built ? '0 110 800 365' : closeUp ? '100 170 600 305' : '0 170 800 305';
  const label = model.footprint ? `${model.footprint.width} × 3 m` : model.size === 'large'
    ? L('맞춤 공간', 'Custom space') : L('준비된 행사장', 'Existing venue');
  const description = L(`조향대 ${model.rackCount}개, 조향 ${model.totalTeams}팀, ${model.staff}명과 분석 키오스크 ${model.kiosks.length}대가 있는 체험 구성 일러스트`, `Perfume experience with ${model.rackCount} scent racks, ${model.totalTeams} teams, ${model.staff} staff and ${model.kiosks.length} analysis kiosks`);
  return <section data-testid="perfumery-scene" data-illustration="vector" data-kiosks={model.kiosks.length} data-teams={model.totalTeams}
    data-staff={model.staff} data-space={model.size} data-visible-teams={model.teams.length} data-overflow-teams={model.overflowTeams.length}
    aria-label={description} className="overflow-hidden bg-[#f7f5f0]">
    <div className="flex items-center justify-between gap-3 px-5 pt-4 text-[11px] font-medium text-slate-500">
      <span>{label}</span><span className="text-slate-500">{L('우리 행사 구성', 'Your event setup')}</span>
    </div>
    <PreviewCanvas lang={lang} label={description}>
    <motion.svg viewBox={camera} animate={{ viewBox: camera }} transition={{ duration }} role="img" aria-label={description} preserveAspectRatio="xMidYMid meet" className="block h-full w-full">
      <title>{description}</title>
      <BoothEnvironment size={model.size} photoZone={model.photoZone} lighting={model.lighting} build={model.build} />
      <AnimatePresence initial={false}>
        {model.teams.map((team) => <motion.g key={team.id} data-testid="scene-team" data-instance={team.id} data-placement="scene" data-variant={team.variant}
          transform={`translate(${team.x} ${team.y}) scale(${team.scale})`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration }}>
          <TeamGlyph variant={team.variant} />
        </motion.g>)}
      </AnimatePresence>
      <g data-testid="scene-counter" data-instance="counter" data-placement="scene">{[...model.counters].reverse().map(counter => <g key={counter.id} transform={`translate(${counter.x} ${counter.y}) scale(${counter.scale})`}><EventPerfumeCounterGlyph racks={counter.racks} /></g>)}</g>
      <AnimatePresence initial={false}>
        {model.kiosks.map((kiosk) => <motion.g key={kiosk.id} data-testid="scene-kiosk" data-instance={kiosk.id} data-placement="scene"
          transform={`translate(${kiosk.x} ${kiosk.y}) scale(${kiosk.scale})`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration }}>
          <KioskGlyph />
        </motion.g>)}
      </AnimatePresence>
    </motion.svg>
    </PreviewCanvas>
    <p className="px-5 pb-4 text-center text-[11px] leading-relaxed text-[#638277]">{model.kiosks.length === 0 ? L('휴대폰으로 분석하고, 나만의 향을 만들어요', 'Discover your scent on your phone, then blend it') : L('취향 분석부터 향수 완성까지', 'From scent discovery to your own perfume')}</p>
    <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-[#e7e9df] bg-white/50 px-5 py-3.5 text-xs text-slate-600" aria-live="polite" aria-atomic="true">
      <span className="inline-flex items-center gap-2"><UsersRound size={14} className="text-teal-600" aria-hidden="true" />{L(`조향 ${model.totalTeams}팀 · ${model.staff}명`, `${model.totalTeams} teams · ${model.staff} staff`)}</span>
      <span>{L(`조향대 ${model.rackCount}개 · 50명당 1개`, `${model.rackCount} scent racks · 1 per 50 guests`)}</span>
      <span className="inline-flex items-center gap-2"><Monitor size={14} className="text-teal-600" aria-hidden="true" />{model.kiosks.length ? L(`키오스크 ${model.kiosks.length}대`, `${model.kiosks.length} kiosks`) : L('휴대폰 QR 분석', 'Phone QR analysis')}</span>
    </div>
    {model.overflowTeams.length > 0 && <div data-testid="scene-overflow" className="border-t border-[#e0e5da] bg-[#eff2e9] p-5">
      <p className="text-xs font-semibold text-slate-700">{L('함께하는 조향팀', 'Your perfumer teams')}</p>
      <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">{L('각 팀의 작업 위치는 행사장에 맞춰 함께 정해요.', 'We will plan each team’s workspace to suit your venue.')}</p>
      <div className="mt-4 grid grid-cols-3 gap-x-3 gap-y-4 sm:grid-cols-4">
        {model.overflowTeams.map((team, index) => <figure key={team.id} data-testid="scene-team" data-instance={team.id} data-placement="overflow" data-variant={team.variant}>
          <svg viewBox="-70 -165 140 175" role="img" aria-label={L('조향사와 보조, 2명', 'A perfumer and an assistant')} className="w-full"><TeamGlyph variant={team.variant} /></svg>
          <figcaption className="mt-1 text-center text-[10px] text-slate-500">{L(`${model.teams.length + index + 1}팀 · 2명`, `Team ${model.teams.length + index + 1} · 2 staff`)}</figcaption>
        </figure>)}
      </div>
      {model.totalTeams > model.teams.length + model.overflowTeams.length && <p data-testid="scene-team-summary" className="mt-3 text-xs font-medium text-slate-700">{L(`총 ${model.totalTeams}팀 중 ${model.teams.length + model.overflowTeams.length}팀을 대표로 표시했어요. 전체 팀 배치는 상담에서 정해요.`, `Showing ${model.teams.length + model.overflowTeams.length} representative teams out of ${model.totalTeams}. The full layout will be planned during consultation.`)}</p>}
    </div>}
    {model.needsPlacement && <p data-testid="scene-placement-note" className="border-t border-[#e0e5da] px-5 py-3 text-[11px] leading-relaxed text-slate-500">{L('선택한 장비와 인원을 보여주는 구성도예요. 실제 작업 공간과 동선은 행사장에 맞춰 정해요.', 'This illustration shows your equipment and team. We will plan the actual layout and visitor paths for your venue.')}</p>}
  </section>;
}
