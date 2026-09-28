'use client';

import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type InputHTMLAttributes,
  type KeyboardEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { CalendarDays, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';

type DateMode = 'date' | 'datetime-local' | 'month';
type CalendarView = 'days' | 'months' | 'years';

interface DatePickerProps extends Pick<InputHTMLAttributes<HTMLInputElement>,
  'id' | 'name' | 'disabled' | 'required' | 'aria-label' | 'aria-labelledby' | 'aria-describedby'> {
  value: string;
  onChange: (value: string) => void;
  mode?: DateMode;
  min?: string;
  max?: string;
  locale?: string;
  className?: string;
  inputClassName?: string;
}

const pad = (value: number) => String(value).padStart(2, '0');
const dayKey = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
// Construct local calendar dates from their parts; never parse ISO dates as UTC.
const calendarDate = (year: number, month: number, day = 1) => new Date(year, month, day, 12);
const dateFromValue = (value: string) => {
  const match = /^(\d{4})-(\d{2})(?:-(\d{2}))?/.exec(value);
  if (!match) return null;
  const [, year, month, day = '01'] = match;
  const date = calendarDate(Number(year), Number(month) - 1, Number(day));
  return date.getFullYear() === Number(year) && date.getMonth() === Number(month) - 1 && date.getDate() === Number(day) ? date : null;
};
const validValue = (value: string, mode: DateMode, min?: string, max?: string) => {
  if (!value) return true;
  const expression = mode === 'month' ? /^\d{4}-\d{2}$/ : mode === 'datetime-local' ? /^\d{4}-\d{2}-\d{2}T([01]\d|2[0-3]):[0-5]\d$/ : /^\d{4}-\d{2}-\d{2}$/;
  return expression.test(value) && !!dateFromValue(value) && (!min || value >= min) && (!max || value <= max);
};
const focusChoice = (panel: HTMLDivElement | null) => {
  (panel?.querySelector<HTMLButtonElement>('[data-active="true"]:not(:disabled)') ?? panel?.querySelector<HTMLButtonElement>('[data-choice]:not(:disabled)'))?.focus({ preventScroll: true });
};

function TimeField({ label, value, max, onChange }: { label: string; value: number; max: number; onChange: (value: number) => void }) {
  const [draft, setDraft] = useState<string | null>(null);
  return (
    <input
      type="text"
      inputMode="numeric"
      aria-label={label}
      role="spinbutton"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      maxLength={2}
      value={draft ?? pad(value)}
      onChange={(event) => {
        const text = event.target.value;
        if (!/^\d{0,2}$/.test(text)) return;
        setDraft(text);
        if (text && Number(text) <= max) onChange(Number(text));
      }}
      onBlur={() => {
        if (draft) onChange(Math.min(max, Number(draft)));
        setDraft(null);
      }}
      onKeyDown={(event) => {
        if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
        event.preventDefault();
        setDraft(null);
        onChange(Math.max(0, Math.min(max, value + (event.key === 'ArrowUp' ? 1 : -1))));
      }}
      className="w-14 rounded-xl border border-slate-200 bg-white px-2 py-2 text-center text-sm font-semibold tabular-nums text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15"
    />
  );
}

/** A locale-aware calendar. The editable text field keeps ISO form values intact. */
const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(function DatePicker({
  id, value, onChange, mode = 'date', min, max, disabled, required, name, locale = 'ko', className, inputClassName,
  'aria-label': ariaLabel, 'aria-labelledby': labelledBy, 'aria-describedby': describedBy,
}, forwardedRef) {
  const generatedId = useId();
  const inputId = id ?? `date-${generatedId}`;
  const dialogId = `${inputId}-calendar`;
  const errorId = `${inputId}-error`;
  const ko = locale.startsWith('ko');
  const reduceMotion = useReducedMotion();
  const language = ko ? 'ko-KR' : 'en-US';
  const inputRef = useRef<HTMLInputElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const focusCalendar = useRef(false);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<CalendarView>(mode === 'month' ? 'months' : 'days');
  const [displayDate, setDisplayDate] = useState(() => dateFromValue(value) ?? new Date());
  const [activeDay, setActiveDay] = useState(() => dayKey(dateFromValue(value) ?? new Date()));
  const [sourceValue, setSourceValue] = useState(value);
  const [draft, setDraft] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  // Parent resets should also discard any incomplete manual edit.
  if (sourceValue !== value) {
    setSourceValue(value);
    setDraft(null);
  }

  useImperativeHandle(forwardedRef, () => inputRef.current!, []);

  const textValue = draft ?? value;
  const invalid = !validValue(textValue, mode, min, max);
  const format = mode === 'month' ? 'YYYY-MM' : mode === 'datetime-local' ? 'YYYY-MM-DDTHH:mm' : 'YYYY-MM-DD';
  const error = ko ? `올바른 날짜를 ${format} 형식으로 입력해 주세요.` : `Enter a valid date in ${format} format.`;

  useEffect(() => { inputRef.current?.setCustomValidity(invalid ? error : ''); }, [invalid, error]);

  const close = (restoreFocus = false) => {
    setOpen(false);
    if (restoreFocus) inputRef.current?.focus({ preventScroll: true });
  };

  const show = (moveFocus = false) => {
    if (disabled) return;
    let initial = dateFromValue(value) ?? new Date();
    if (min && dayKey(initial).slice(0, mode === 'month' ? 7 : 10) < min.slice(0, mode === 'month' ? 7 : 10)) initial = dateFromValue(min) ?? initial;
    if (max && dayKey(initial).slice(0, mode === 'month' ? 7 : 10) > max.slice(0, mode === 'month' ? 7 : 10)) initial = dateFromValue(max) ?? initial;
    setDisplayDate(initial);
    setActiveDay(dayKey(initial));
    setView(mode === 'month' ? 'months' : 'days');
    focusCalendar.current = moveFocus;
    if (open && moveFocus) focusChoice(panelRef.current);
    setOpen(true);
  };

  useLayoutEffect(() => {
    if (!open || !anchorRef.current || !panelRef.current) return;
    const position = () => {
      const anchor = anchorRef.current;
      const panel = panelRef.current;
      if (!anchor || !panel) return;
      const viewport = window.visualViewport;
      const leftEdge = viewport?.offsetLeft ?? 0;
      const topEdge = viewport?.offsetTop ?? 0;
      const viewportWidth = viewport?.width ?? window.innerWidth;
      const viewportHeight = viewport?.height ?? window.innerHeight;
      const width = Math.min(328, viewportWidth - 24);
      panel.style.width = `${width}px`;
      panel.style.maxHeight = `${Math.max(100, viewportHeight - 24)}px`;
      const bounds = anchor.getBoundingClientRect();
      const height = panel.getBoundingClientRect().height;
      const fitsBelow = bounds.bottom + 8 + height <= topEdge + viewportHeight - 12;
      panel.style.left = `${Math.max(leftEdge + 12, Math.min(bounds.left, leftEdge + viewportWidth - width - 12))}px`;
      panel.style.top = `${Math.max(topEdge + 12, Math.min(fitsBelow ? bounds.bottom + 8 : bounds.top - height - 8, topEdge + viewportHeight - height - 12))}px`;
    };
    position();
    const observer = new ResizeObserver(position);
    observer.observe(panelRef.current);
    window.addEventListener('resize', position);
    window.addEventListener('scroll', position, true);
    window.visualViewport?.addEventListener('resize', position);
    window.visualViewport?.addEventListener('scroll', position);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', position);
      window.removeEventListener('scroll', position, true);
      window.visualViewport?.removeEventListener('resize', position);
      window.visualViewport?.removeEventListener('scroll', position);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const outside = (event: Event) => {
      const target = event.target as Node;
      if (!anchorRef.current?.contains(target) && !panelRef.current?.contains(target)) setOpen(false);
    };
    const escape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      // Consume this dismissal before an enclosing dialog handles Escape.
      event.stopPropagation();
      setOpen(false);
      inputRef.current?.focus({ preventScroll: true });
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('focusin', outside);
    document.addEventListener('keydown', escape, true);
    const frame = requestAnimationFrame(() => {
      if (!focusCalendar.current) return;
      focusChoice(panelRef.current);
      focusCalendar.current = false;
    });
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('focusin', outside);
      document.removeEventListener('keydown', escape, true);
    };
  }, [open]);

  const dayAllowed = (date: Date) => {
    const key = dayKey(date);
    return date.getFullYear() >= 1000 && date.getFullYear() <= 9999 && (!min || key >= min.slice(0, 10)) && (!max || key <= max.slice(0, 10));
  };
  const monthAllowed = (year: number, month: number) => {
    const key = `${year}-${pad(month + 1)}`;
    return year >= 1000 && year <= 9999 && (!min || key >= min.slice(0, 7)) && (!max || key <= max.slice(0, 7));
  };
  const selectValue = (next: string, dismiss = true) => {
    if (!validValue(next, mode, min, max)) return;
    setDraft(null);
    setTouched(false);
    onChange(next);
    if (dismiss) close(true);
  };
  const selectedDate = dateFromValue(value);
  const time = /^\d{4}-\d{2}-\d{2}T(\d{2}):(\d{2})/.exec(value);
  const hours = time ? Number(time[1]) : 9;
  const minutes = time ? Number(time[2]) : 0;
  const selectDateTime = (date: Date, hour = hours, minute = minutes) => {
    let next = `${dayKey(date)}T${pad(hour)}:${pad(minute)}`;
    if (min && next < min) next = min;
    if (max && next > max) next = max;
    selectValue(next, false);
  };
  const chooseDay = (date: Date) => {
    setActiveDay(dayKey(date));
    if (mode === 'datetime-local') selectDateTime(date);
    else selectValue(dayKey(date));
  };

  const handleDayKey = (event: KeyboardEvent<HTMLButtonElement>, date: Date) => {
    let next: Date;
    if (event.key === 'ArrowLeft') next = calendarDate(date.getFullYear(), date.getMonth(), date.getDate() - 1);
    else if (event.key === 'ArrowRight') next = calendarDate(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    else if (event.key === 'ArrowUp') next = calendarDate(date.getFullYear(), date.getMonth(), date.getDate() - 7);
    else if (event.key === 'ArrowDown') next = calendarDate(date.getFullYear(), date.getMonth(), date.getDate() + 7);
    else if (event.key === 'Home') next = calendarDate(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay());
    else if (event.key === 'End') next = calendarDate(date.getFullYear(), date.getMonth(), date.getDate() + 6 - date.getDay());
    else if (event.key === 'PageUp' || event.key === 'PageDown') {
      const direction = event.key === 'PageUp' ? -1 : 1;
      const target = calendarDate(date.getFullYear(), date.getMonth() + direction * (event.shiftKey ? 12 : 1));
      const lastDay = calendarDate(target.getFullYear(), target.getMonth() + 1, 0).getDate();
      next = calendarDate(target.getFullYear(), target.getMonth(), Math.min(date.getDate(), lastDay));
    } else return;
    event.preventDefault();
    if (!dayAllowed(next)) return;
    setDisplayDate(next);
    const key = dayKey(next);
    setActiveDay(key);
    requestAnimationFrame(() => panelRef.current?.querySelector<HTMLButtonElement>(`[data-date="${key}"]`)?.focus());
  };

  const year = displayDate.getFullYear();
  const month = displayDate.getMonth();
  const yearStart = Math.floor(year / 12) * 12;
  const firstWeekday = calendarDate(year, month).getDay();
  const today = dayKey(new Date());
  const selectedKey = selectedDate ? dayKey(selectedDate) : '';
  const title = view === 'years' ? `${yearStart} – ${yearStart + 11}` : view === 'months' ? `${year}${ko ? '년' : ''}` : displayDate.toLocaleDateString(language, { year: 'numeric', month: 'long' });
  const iconButton = 'flex size-9 shrink-0 items-center justify-center rounded-xl text-slate-500 outline-none transition-colors hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-teal-500/40 disabled:cursor-not-allowed disabled:opacity-30 motion-reduce:transition-none';
  const shiftPeriod = (direction: number) => {
    const next = calendarDate(year + (view === 'years' ? direction * 12 : view === 'months' ? direction : 0), month + (view === 'days' ? direction : 0));
    setDisplayDate(next);
    setActiveDay(min && dayKey(next) < min.slice(0, 10) ? min.slice(0, 10) : dayKey(next));
  };
  const canShift = (direction: number) => {
    if (view === 'days') {
      const next = calendarDate(year, month + direction);
      return monthAllowed(next.getFullYear(), next.getMonth());
    }
    const nextStart = view === 'years' ? yearStart + direction * 12 : year + direction;
    const nextEnd = view === 'years' ? nextStart + 11 : nextStart;
    return nextEnd >= 1000 && nextStart <= 9999 && (!min || nextEnd >= Number(min.slice(0, 4))) && (!max || nextStart <= Number(max.slice(0, 4)));
  };

  return (
    <div className={cn('w-full', className)}>
      <div ref={anchorRef} className="relative">
        <input
          ref={inputRef}
          id={inputId}
          name={name}
          type="text"
          role="combobox"
          aria-autocomplete="none"
          value={textValue}
          required={required}
          disabled={disabled}
          autoComplete="off"
          spellCheck={false}
          placeholder={format}
          aria-label={ariaLabel ?? (!labelledBy ? (ko ? '날짜' : 'Date') : undefined)}
          aria-labelledby={labelledBy}
          aria-describedby={[describedBy, touched && invalid ? errorId : undefined].filter(Boolean).join(' ') || undefined}
          aria-invalid={invalid || undefined}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={open ? dialogId : undefined}
          onClick={() => { if (!open) show(); }}
          onBlur={() => setTouched(true)}
          onChange={(event) => {
            const next = event.target.value;
            setDraft(next);
            if (validValue(next, mode, min, max)) {
              onChange(next);
              const date = dateFromValue(next);
              if (date) { setDisplayDate(date); setActiveDay(dayKey(date)); }
            }
          }}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown') { event.preventDefault(); show(true); }
          }}
          className={cn('w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 hover:border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-50 motion-reduce:transition-none', inputClassName, 'pr-12')}
        />
        <button
          type="button"
          disabled={disabled}
          aria-label={ko ? '달력 열기' : 'Open calendar'}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={open ? dialogId : undefined}
          onClick={() => open ? close(true) : show(true)}
          className={cn(iconButton, 'absolute right-2 top-1/2 -translate-y-1/2')}
        ><CalendarDays className="size-4" /></button>
      </div>
      {touched && invalid && <p id={errorId} className="mt-1.5 text-xs text-rose-600" role="alert">{error}</p>}
      {open && createPortal(
        <motion.div
          ref={panelRef}
          id={dialogId}
          role="dialog"
          data-lenis-prevent
          aria-label={ko ? '날짜 선택' : 'Choose a date'}
          style={{ position: 'fixed' }}
          initial={reduceMotion ? false : { opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.16, ease: 'easeOut' }}
          className="z-[150] overflow-auto rounded-2xl border border-slate-200 bg-white p-4 text-slate-800 shadow-[0_16px_48px_rgba(15,23,42,0.16)]"
        >
          <div className="mb-3 flex items-center justify-between gap-1">
            <button type="button" className={iconButton} aria-label={ko ? '이전' : 'Previous'} disabled={!canShift(-1)} onClick={() => shiftPeriod(-1)}><ChevronLeft className="size-4" /></button>
            <button type="button" className="rounded-lg px-3 py-2 text-sm font-bold outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-teal-500/40" aria-live="polite" onClick={() => setView(view === 'days' ? 'months' : view === 'months' ? 'years' : mode === 'month' ? 'months' : 'days')}>{title}</button>
            <button type="button" className={iconButton} aria-label={ko ? '다음' : 'Next'} disabled={!canShift(1)} onClick={() => shiftPeriod(1)}><ChevronRight className="size-4" /></button>
          </div>
          {view === 'days' ? (
            <div role="grid" aria-label={title}>
              <div role="row" className="mb-1 grid grid-cols-7">
                {(ko ? ['일', '월', '화', '수', '목', '금', '토'] : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']).map((weekday) => <span role="columnheader" key={weekday} className="py-2 text-center text-[11px] font-medium text-slate-400">{weekday}</span>)}
              </div>
              {Array.from({ length: 6 }, (_, week) => (
                <div role="row" key={week} className="grid grid-cols-7 gap-y-0.5">
                  {Array.from({ length: 7 }, (_, weekday) => {
                    const date = calendarDate(year, month, week * 7 + weekday - firstWeekday + 1);
                    const key = dayKey(date);
                    const selected = key === selectedKey;
                    const isActive = key === activeDay;
                    return <div role="gridcell" key={key} aria-selected={selected}>
                      <button type="button" data-choice data-date={key} data-active={isActive} tabIndex={isActive ? 0 : -1} disabled={!dayAllowed(date)} aria-label={date.toLocaleDateString(language, { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })} aria-current={key === today ? 'date' : undefined} onClick={() => chooseDay(date)} onKeyDown={(event) => handleDayKey(event, date)}
                        className={cn('flex aspect-square w-full items-center justify-center rounded-xl text-[13px] font-medium tabular-nums outline-none transition-colors focus-visible:ring-2 focus-visible:ring-teal-500/50 focus-visible:ring-inset disabled:pointer-events-none disabled:opacity-25 motion-reduce:transition-none', selected ? 'bg-teal-600 font-bold text-white' : 'hover:bg-teal-50 hover:text-teal-700', !selected && date.getMonth() !== month && 'text-slate-300', !selected && key === today && 'bg-slate-100 font-bold text-teal-700')}>{date.getDate()}</button>
                    </div>;
                  })}
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 12 }, (_, index) => {
                const candidateYear = view === 'years' ? yearStart + index : year;
                const candidateMonth = view === 'months' ? index : month;
                const selected = !!selectedDate && selectedDate.getFullYear() === candidateYear && (view === 'years' || selectedDate.getMonth() === candidateMonth);
                const allowed = view === 'months' ? monthAllowed(candidateYear, candidateMonth) : candidateYear >= 1000 && candidateYear <= 9999 && (!min || candidateYear >= Number(min.slice(0, 4))) && (!max || candidateYear <= Number(max.slice(0, 4)));
                const label = view === 'years' ? `${candidateYear}${ko ? '년' : ''}` : calendarDate(year, index).toLocaleDateString(language, { month: 'short' });
                return <button type="button" data-choice data-active={selected} aria-pressed={selected} key={index} disabled={!allowed} className={cn('rounded-xl px-2 py-3 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-teal-500/40 disabled:opacity-25 motion-reduce:transition-none', selected ? 'bg-teal-600 text-white' : 'bg-slate-50 hover:bg-teal-50 hover:text-teal-700')} onClick={() => {
                  setDisplayDate(calendarDate(candidateYear, candidateMonth));
                  if (view === 'years') {
                    setView('months');
                    requestAnimationFrame(() => focusChoice(panelRef.current));
                  }
                  else if (mode === 'month') selectValue(`${candidateYear}-${pad(candidateMonth + 1)}`);
                  else {
                    setView('days');
                    const firstDay = dayKey(calendarDate(candidateYear, candidateMonth));
                    setActiveDay(min && firstDay < min.slice(0, 10) ? min.slice(0, 10) : firstDay);
                    requestAnimationFrame(() => focusChoice(panelRef.current));
                  }
                }}>{label}</button>;
              })}
            </div>
          )}
          {mode === 'datetime-local' && <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
            <span className="text-xs font-semibold text-slate-500">{ko ? '시간 · 24시간 기준' : 'Time · 24-hour'}</span>
            <div className="flex items-center gap-1.5"><TimeField label={ko ? '시' : 'Hour'} value={hours} max={23} onChange={(hour) => selectDateTime(selectedDate ?? displayDate, hour, minutes)} /><span className="text-slate-400">:</span><TimeField label={ko ? '분' : 'Minute'} value={minutes} max={59} onChange={(minute) => selectDateTime(selectedDate ?? displayDate, hours, minute)} /></div>
          </div>}
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
            <button type="button" className="rounded-lg px-2 py-1.5 text-xs font-medium text-slate-500 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-teal-500/40" onClick={() => selectValue('')}>{ko ? '날짜 지우기' : 'Clear date'}</button>
            {mode === 'datetime-local' ? <button type="button" className="flex items-center gap-1 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white outline-none hover:bg-teal-700 focus-visible:ring-2 focus-visible:ring-teal-500/40 focus-visible:ring-offset-2" onClick={() => close(true)}><Check className="size-3" />{ko ? '선택 완료' : 'Done'}</button> : <button type="button" disabled={mode === 'month' ? !monthAllowed(new Date().getFullYear(), new Date().getMonth()) : !dayAllowed(new Date())} className="rounded-lg px-2 py-1.5 text-xs font-semibold text-teal-700 outline-none hover:bg-teal-50 focus-visible:ring-2 focus-visible:ring-teal-500/40 disabled:opacity-30" onClick={() => selectValue(mode === 'month' ? today.slice(0, 7) : today)}>{ko ? (mode === 'month' ? '이번 달' : '오늘') : (mode === 'month' ? 'This month' : 'Today')}</button>}
          </div>
        </motion.div>, document.body,
      )}
    </div>
  );
});

export { DatePicker, type DatePickerProps };
