'use client';

import {
  Children, cloneElement, createContext, isValidElement, useContext, useEffect, useId, useRef, useState,
  type CSSProperties, type ReactElement, type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { Check as CheckIcon, Info, Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * 마우스를 올리거나 키보드로 들어오면 옵션 설명을 띄운다.
 * 옵션 묶음(MoreOptions)이 overflow-hidden 이라 잘리지 않도록 body 에 고정 위치로 그린다.
 */
export function HoverInfo({ info, className, children }: { info?: string; className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<CSSProperties | null>(null);
  const tipId = useId();

  useEffect(() => {
    if (!style) return;
    const hide = () => setStyle(null);
    window.addEventListener('scroll', hide, true);
    window.addEventListener('resize', hide);
    return () => { window.removeEventListener('scroll', hide, true); window.removeEventListener('resize', hide); };
  }, [style]);

  if (!info) return <div className={className}>{children}</div>;

  const show = () => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const width = Math.min(300, window.innerWidth - 24);
    const left = Math.min(Math.max(12, rect.left), window.innerWidth - width - 12);
    // 위쪽 공간이 넉넉하면 위에, 아니면 아래에
    setStyle(rect.top > 150
      ? { position: 'fixed', left, width, bottom: window.innerHeight - rect.top + 8 }
      : { position: 'fixed', left, width, top: rect.bottom + 8 });
  };

  return (
    <div ref={ref} className={className} aria-describedby={style ? tipId : undefined}
      onPointerEnter={(event) => { if (event.pointerType === 'mouse') show(); }}
      onPointerLeave={() => setStyle(null)}
      onFocus={(event) => { if (event.target.matches(':focus-visible')) show(); }}
      onBlur={() => setStyle(null)}>
      {children}
      {style && createPortal(
        <div id={tipId} role="tooltip" style={style}
          className="pointer-events-none z-[90] rounded-xl bg-slate-900 px-3.5 py-3 text-xs leading-relaxed text-white shadow-xl shadow-slate-900/20 motion-safe:animate-[quote-info-in_150ms_ease-out]">
          {info}
        </div>,
        document.body,
      )}
    </div>
  );
}

/** 설명이 있는 옵션임을 알리는 작은 표시 */
const InfoMark = () => <Info size={13} aria-hidden="true" className="shrink-0 text-slate-400" />;

const FieldContext = createContext<{ label: string; labelId: string; hintId?: string } | null>(null);

export function Field({ label, hint, info, children }: { label: string; hint?: string; info?: string; children: ReactNode }) {
  const id = useId();
  const labelId = `${id}-label`;
  const hintId = hint ? `${id}-hint` : undefined;
  const controls = Children.toArray(children);
  const firstControl = controls.find((child) => isValidElement<{ id?: string }>(child) && child.props.id);
  const controlId = isValidElement<{ id?: string }>(firstControl) ? firstControl.props.id : undefined;

  return (
    <FieldContext.Provider value={{ label, labelId, hintId }}>
      <HoverInfo info={info} className="flex min-w-0 flex-col gap-2.5">
        <label id={labelId} htmlFor={controlId} className="flex items-center gap-1.5 text-sm font-semibold leading-relaxed text-slate-700">{label}{info && <InfoMark />}</label>
        {Children.map(children, (child) => {
          if (isValidElement<{ id?: string }>(child) && (child.props.id || ['input', 'select', 'textarea'].includes(String(child.type)))) {
            return cloneElement(child as ReactElement<{ 'aria-labelledby'?: string; 'aria-describedby'?: string }>, {
              'aria-labelledby': labelId,
              'aria-describedby': hintId,
            });
          }
          return child;
        })}
        {hint && <p id={hintId} className="text-xs leading-relaxed text-slate-500">{hint}</p>}
      </HoverInfo>
    </FieldContext.Provider>
  );
}

export function Stepper({ id, value, min, max, step = 1, onChange, suffix }: {
  id: string; value: number; min: number; max: number; step?: number; onChange: (value: number) => void; suffix?: string;
}) {
  const field = useContext(FieldContext);
  const [draft, setDraft] = useState<string | null>(null);
  const set = (next: number) => onChange(Math.min(max, Math.max(min, Math.round(Number.isFinite(next) ? next : min))));

  return (
    <div className="flex h-[52px] w-full items-center rounded-2xl border border-slate-200 bg-white p-1 transition-shadow focus-within:border-teal-500 focus-within:ring-4 focus-within:ring-teal-500/10">
      <button type="button" aria-label={`${field?.label ?? id} −`} onClick={() => { setDraft(null); set(value - step); }} disabled={value <= min}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-teal-600 disabled:opacity-25 motion-reduce:transition-none">
        <Minus size={16} aria-hidden="true" />
      </button>
      <input id={id} type="number" inputMode="numeric" value={draft ?? value} min={min} max={max} step={1}
        aria-labelledby={field?.labelId} aria-describedby={field?.hintId}
        onFocus={() => setDraft(String(value))}
        onChange={(event) => {
          const next = event.target.value;
          setDraft(next);
          const number = Number(next);
          if (next !== '' && Number.isFinite(number) && number >= min && number <= max) set(number);
        }}
        onBlur={() => { if (draft !== null) set(Number(draft || min)); setDraft(null); }}
        onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); event.currentTarget.blur(); } }}
        className="h-full w-full min-w-0 bg-transparent text-center text-base font-bold tabular-nums text-slate-900 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
      {suffix && <span className="shrink-0 pr-2 text-sm text-slate-500">{suffix}</span>}
      <button type="button" aria-label={`${field?.label ?? id} +`} onClick={() => { setDraft(null); set(value + step); }} disabled={value >= max}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-teal-600 disabled:opacity-25 motion-reduce:transition-none">
        <Plus size={16} aria-hidden="true" />
      </button>
    </div>
  );
}

export function Segmented<T extends string>({ value, options, onChange, name }: {
  value: T; options: { value: T; label: string; info?: string }[]; onChange: (value: T) => void; name: string;
}) {
  const id = useId();
  const field = useContext(FieldContext);

  return (
    <div role="radiogroup" aria-label={name} aria-describedby={field?.hintId} className="flex flex-wrap gap-2">
      {options.map((option) => (
        <HoverInfo key={option.value} info={option.info} className="flex min-w-[110px] flex-1">
        <label className="relative w-full cursor-pointer">
          <input type="radio" name={id} value={option.value} checked={value === option.value} onChange={() => onChange(option.value)} className="peer absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0" />
          <span className={cn('flex h-full min-h-[52px] items-center justify-center rounded-2xl border px-3.5 py-3 text-center text-sm font-medium leading-snug transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-teal-600 motion-reduce:transition-none',
            value === option.value ? 'border-teal-500 bg-teal-50 text-teal-800' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50')}>
            {option.label}
          </span>
        </label>
        </HoverInfo>
      ))}
    </div>
  );
}

export function Check({ id, checked, onChange, label, info }: {
  id: string; checked: boolean; onChange: (value: boolean) => void; label: string; info?: string;
}) {
  return (
    <HoverInfo info={info}>
    <label htmlFor={id} className={cn('relative flex min-h-[52px] cursor-pointer items-center gap-3 rounded-2xl border px-3.5 py-3 text-sm leading-relaxed transition-colors motion-reduce:transition-none',
      checked ? 'border-teal-200 bg-teal-50/70 text-teal-900' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50')}>
      <input id={id} type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="peer absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0" />
      <span aria-hidden="true" className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-teal-600',
        checked ? 'border-teal-600 bg-teal-600 text-white' : 'border-slate-300 bg-white text-transparent')}>
        <CheckIcon size={13} strokeWidth={3} />
      </span>
      <span className="flex-1">{label}</span>
      {info && <InfoMark />}
    </label>
    </HoverInfo>
  );
}

export const inputClass = 'h-[52px] w-full min-w-0 rounded-2xl border border-slate-200 bg-white px-4 text-base text-slate-900 outline-none transition-shadow placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 motion-reduce:transition-none sm:text-sm';
