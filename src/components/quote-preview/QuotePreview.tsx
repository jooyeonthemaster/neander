'use client';

import { useState } from 'react';
import { Box, Check, FlaskConical, Grid2X2, Info, Layers3 } from 'lucide-react';
import type { Lang } from '@/lib/quote/catalog';
import type { QuoteInput } from '@/lib/quote/engine';
import { resolvePreview, type PreviewView } from '@/lib/quote-preview/model';
import { cn } from '@/lib/utils';
import { PerfumeScene } from './PerfumeScene';
import { SpaceIllustration } from './illustrations/SpaceIllustration';
import { PerfumeBottleGlyph } from './illustrations/VectorPrimitives';

/** A presentation-only preview: quote state and pricing remain owned by its caller. */
export function QuotePreview({ input, lang, initialView = 'combined' }: { input: QuoteInput; lang: Lang; initialView?: PreviewView }) {
  const perfume = input.items.find((item) => item.key === 'acscent');
  const space = input.items.find((item) => item.key === 'spatialDesign');
  const sceneSelection = [perfume?.options.analysisKiosks ?? 0, perfume?.options.extraTeams ?? 0, space?.options.size ?? 'existing', space?.options.photoZone, space?.options.lighting].join(':');
  const [requested, setRequested] = useState({ view: initialView, selection: sceneSelection });
  const hasSceneViews = Boolean(space && space.options.size !== 'large');
  // A perfume option change returns to the composed scene so its new equipment
  // and staffing are visible even after inspecting the empty space or floorplan.
  const view: PreviewView = hasSceneViews
    ? initialView === 'combined' && requested.selection !== sceneSelection ? 'combined' : requested.view
    : 'combined';
  const preview = resolvePreview(input, view, lang);
  const packaging = perfume?.options.customBox ? 'custom' : perfume?.options.premiumPackaging ? 'brand' : 'none';
  const views = [
    { value: 'combined' as const, label: lang === 'ko' ? '함께 보기' : 'Together', Icon: Layers3 },
    { value: 'space' as const, label: lang === 'ko' ? '공간만' : 'Space', Icon: Box },
    { value: 'top' as const, label: lang === 'ko' ? '위에서 보기' : 'From above', Icon: Grid2X2 },
  ];

  return (
    <section aria-label={lang === 'ko' ? '선택한 체험 미리보기' : 'Your experience preview'} className="min-w-0 space-y-4">
      <div className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_12px_50px_-30px_rgba(15,23,42,0.18)] sm:rounded-[32px]">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-teal-500 ring-4 ring-teal-50" />
            <h2 className="text-sm font-semibold text-slate-800">{lang === 'ko' ? '우리 행사의 모습' : 'Picture your event'}</h2>
          </div>
          {hasSceneViews && (
            <div role="group" aria-label={lang === 'ko' ? '미리보기 방향' : 'Preview view'}
              className="flex max-w-full gap-1 rounded-full bg-slate-100/80 p-1">
              {views.map(({ value, label, Icon }) => (
                <button key={value} type="button" aria-pressed={view === value} onClick={() => setRequested({ view: value, selection: sceneSelection })}
                  data-testid={`preview-view-${value}`}
                  className={cn('inline-flex min-h-9 items-center justify-center gap-1.5 rounded-full px-3 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 motion-reduce:transition-none',
                    view === value ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-500 hover:bg-white/60 hover:text-slate-800')}>
                  <Icon size={13} aria-hidden="true" className="hidden min-[380px]:block" />{label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div data-testid="preview-scene" data-view={view} data-space={space?.options.size ?? 'existing'} data-photozone={Boolean(space?.options.photoZone)} data-lighting={Boolean(space?.options.lighting)}>
          {perfume && view === 'combined'
            ? <PerfumeScene input={input} lang={lang} />
            : <SpaceIllustration options={space?.options} view={view === 'top' ? 'top' : 'space'} lang={lang} />}
        </div>

        <div className="space-y-3 px-4 py-4 sm:px-6 sm:py-5">
          <p className="text-sm font-semibold leading-relaxed text-slate-800" data-testid="preview-scene-label">{preview.scene.label}</p>
          {preview.badges.length > 0 && (
            <ul aria-label={lang === 'ko' ? '현재 선택한 구성' : 'Selected configuration'} className="flex flex-wrap gap-1.5">
              {preview.badges.map((badge) => (
                <li key={badge} className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-medium leading-relaxed text-teal-800">
                  <Check size={11} aria-hidden="true" />{badge}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {preview.product && (
        <figure className="flex min-w-0 overflow-hidden rounded-3xl border border-slate-200/80 bg-white">
          <div data-testid="preview-product" data-volume={perfume?.options.volume ?? '10ml'} data-packaging={packaging} className="flex min-h-36 w-[40%] shrink-0 items-center justify-center bg-[#f0f3e9] sm:min-h-40">
            <svg viewBox="-92 -150 184 174" role="img" aria-label={preview.product.label} className="h-auto w-full max-w-52"><PerfumeBottleGlyph volume={perfume?.options.volume ?? '10ml'} packaging={packaging} /></svg>
          </div>
          <figcaption className="flex min-w-0 flex-1 flex-col justify-center px-4 py-5 sm:px-5">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-teal-700">
              <FlaskConical size={13} aria-hidden="true" />{lang === 'ko' ? '체험 후 가져가는 향수' : 'Your take-home perfume'}
            </span>
            <p className="mt-2 text-base font-bold leading-snug text-slate-900" data-testid="preview-product-label">{preview.product.label}</p>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              {perfume && !perfume.options.premiumPackaging && !perfume.options.customBox
                ? (lang === 'ko' ? '나만의 향수와 기본 무지 패키지를 함께 가져가요.' : 'Take home your own perfume with its plain package.')
                : (lang === 'ko' ? '나에게 맞는 향을 직접 조향하고, 완성한 향수를 가져가요.' : 'Blend a scent that feels like you, then take your finished perfume home.')}
            </p>
            {perfume && <p className="mt-2 text-[11px] font-medium text-slate-500">{lang === 'ko' ? `참여자 ${perfume.options.guests.toLocaleString('ko-KR')}명 기준` : `For ${perfume.options.guests.toLocaleString('en-US')} participants`}</p>}
          </figcaption>
        </figure>
      )}

      {preview.extras.map((asset) => (
        <figure key={asset.id} className="flex min-w-0 overflow-hidden rounded-3xl border border-slate-200/80 bg-white">
          <div data-testid="preview-extra" className="flex min-h-28 w-[35%] shrink-0 items-center bg-[#f8ede5]">
            <svg viewBox="-90 -155 180 180" role="img" aria-label={asset.label} className="w-full"><PerfumeBottleGlyph volume={perfume?.options.volume ?? '10ml'} packaging={packaging} /><path d="M-56-60q-28-42-10-49q27 8 21 39" fill="#b9d8c4" /><path d="M-51-58-65-100" fill="none" stroke="#739b83" strokeWidth="2" /></svg>
          </div>
          <figcaption className="flex flex-col justify-center px-4 py-4">
            <p className="text-sm font-semibold text-slate-800">{asset.label}</p>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{lang === 'ko' ? '브랜드에 맞는 향을 함께 개발하는 과정이에요.' : 'A collaborative process to develop a scent for your brand.'}</p>
          </figcaption>
        </figure>
      ))}

      <div className="flex gap-2.5 px-1 text-[11px] leading-relaxed text-slate-500">
        <Info size={14} aria-hidden="true" className="mt-0.5 shrink-0 text-slate-400" />
        <div className="space-y-1.5">
          <p>{lang === 'ko' ? '선택한 구성을 쉽게 살펴보는 일러스트예요. 최종 디자인과 배치는 행사장에 맞춰 정해요.' : 'An illustration to help you explore your choices. Final design and layout are planned for your venue.'}</p>
          {preview.notes.map((note) => <p key={note}>{note}</p>)}
        </div>
      </div>
    </section>
  );
}
