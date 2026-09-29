'use client';

import { useRef, useState } from 'react';
import { Info, Minus, Plus } from 'lucide-react';
import type { Lang } from '@/lib/quote/catalog';
import type { SpaceOptions } from '@/lib/quote/engine';
import {
  SPACE_AREA_LIMITS, convertAreaFromPyeong, convertAreaToPyeong,
  formatSpaceAreaEquivalent, normalizePyeong, type AreaUnit,
} from '@/lib/quote/space-area';
import { cn } from '@/lib/utils';
import { HoverInfo } from './QuoteControls';

const roundDisplay = (value: number) => Math.round(value * 100) / 100;

/** Both space editors share the canonical area and the user's preferred unit.
 * Display rounding is never written back just by focusing or changing units. */
export function SpaceAreaInput({ id, pyeong, areaUnit = 'pyeong', lang, onChange, hint, info }: {
  id: string;
  pyeong: number;
  areaUnit?: AreaUnit;
  lang: Lang;
  onChange: (patch: Partial<Pick<SpaceOptions, 'pyeong' | 'areaUnit'>>) => void;
  hint?: string;
  info?: string;
}) {
  const ko = lang === 'ko';
  const [draft, setDraft] = useState<string | null>(null);
  const dirty = useRef(false);
  const value = roundDisplay(convertAreaFromPyeong(pyeong, areaUnit));
  const min = roundDisplay(convertAreaFromPyeong(SPACE_AREA_LIMITS.minPyeong, areaUnit));
  const max = roundDisplay(convertAreaFromPyeong(SPACE_AREA_LIMITS.maxPyeong, areaUnit));
  const unitLabel = areaUnit === 'sqm' ? (ko ? '㎡' : 'm²') : (ko ? '평' : 'pyeong');
  const label = ko ? '공간 넓이' : 'Floor area';
  const commit = (number: number) => {
    const next = Number.isFinite(number) ? number : min;
    onChange({ pyeong: normalizePyeong(convertAreaToPyeong(roundDisplay(next), areaUnit)) });
  };
  const step = (amount: number) => {
    const current = draft !== null && draft.trim() !== '' && Number.isFinite(Number(draft)) ? Number(draft) : value;
    dirty.current = false;
    setDraft(null);
    commit(current + amount);
  };

  return <div className="min-w-0 space-y-2.5" data-testid={`${id}-field`}>
    <div className="flex items-center gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold leading-relaxed text-slate-700">{label}</label>
      {info && <HoverInfo info={info}><button type="button" aria-label={ko ? '공간 넓이 안내' : 'About floor area'} className="flex size-5 items-center justify-center rounded-full text-slate-400 focus-visible:outline-2 focus-visible:outline-teal-600"><Info size={13} /></button></HoverInfo>}
    </div>
    <div role="group" aria-label={ko ? '넓이 단위' : 'Area unit'} className="flex max-w-xs gap-1 rounded-xl bg-slate-100/80 p-1">
      {(['pyeong', 'sqm'] as const).map((unit) => <button key={unit} type="button" data-testid={`${id}-unit-${unit}`} aria-pressed={areaUnit === unit} aria-controls={id}
        onClick={() => { dirty.current = false; setDraft(null); if (areaUnit !== unit) onChange({ areaUnit: unit }); }}
        className={cn('min-h-9 flex-1 rounded-lg px-3 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 motion-reduce:transition-none', areaUnit === unit ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-800')}>
        {unit === 'pyeong' ? (ko ? '평' : 'Pyeong') : (ko ? '제곱미터 (㎡)' : 'Square metres (m²)')}
      </button>)}
    </div>
    <div className="flex h-[52px] max-w-xs items-center rounded-2xl border border-slate-200 bg-white p-1 transition-shadow focus-within:border-teal-500 focus-within:ring-4 focus-within:ring-teal-500/10">
      <button type="button" aria-label={`${label} −`} onClick={() => step(-1)} disabled={value <= min}
        className="flex size-10 shrink-0 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-teal-600 disabled:opacity-25"><Minus size={16} /></button>
      <input id={id} type="number" inputMode="decimal" min={min} max={max} step="0.01" value={draft ?? value}
        aria-label={`${label} (${unitLabel})`} aria-describedby={`${id}-conversion${hint ? ` ${id}-hint` : ''}`}
        onFocus={() => { dirty.current = false; setDraft(String(value)); }}
        onChange={(event) => {
          const next = event.target.value;
          dirty.current = true;
          setDraft(next);
          const number = Number(next);
          if (next !== '' && Number.isFinite(number) && number >= min && number <= max) commit(number);
        }}
        onBlur={() => { if (dirty.current && draft !== null) commit(Number(draft || min)); dirty.current = false; setDraft(null); }}
        onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); event.currentTarget.blur(); } }}
        className="h-full w-full min-w-0 bg-transparent text-center text-base font-bold tabular-nums text-slate-900 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
      <span className="shrink-0 pr-2 text-sm text-slate-500">{unitLabel}</span>
      <button type="button" aria-label={`${label} +`} onClick={() => step(1)} disabled={value >= max}
        className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-teal-600 disabled:opacity-25"><Plus size={16} /></button>
    </div>
    <p id={`${id}-conversion`} data-testid={`${id}-conversion`} aria-live="polite" className="text-xs font-medium tabular-nums text-teal-700">{ko ? '약 ' : 'Approx. '}{formatSpaceAreaEquivalent({ pyeong, areaUnit }, lang)}</p>
    {hint && <p id={`${id}-hint`} className="text-xs leading-relaxed text-slate-500">{hint}</p>}
  </div>;
}
