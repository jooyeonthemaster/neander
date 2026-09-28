'use client';

import {
  forwardRef, useCallback, useEffect, useId, useImperativeHandle, useLayoutEffect, useRef, useState,
  type AriaAttributes, type FocusEventHandler, type KeyboardEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { motion, useReducedMotion } from 'motion/react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectOption { value: string; label: string; disabled?: boolean }
interface SelectProps extends AriaAttributes {
  options: readonly SelectOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onBlur?: FocusEventHandler<HTMLButtonElement>;
  onFocus?: FocusEventHandler<HTMLButtonElement>;
  id?: string;
  name?: string;
  form?: string;
  disabled?: boolean;
  required?: boolean;
  label?: string;
  error?: string;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
}

/** Site-styled selection on desktop and mobile, with native form values. */
const Select = forwardRef<HTMLButtonElement, SelectProps>(function Select({
  options, value, defaultValue, onValueChange, onBlur, onFocus, id, name, form,
  disabled, required, label, error, placeholder, className, triggerClassName,
  'aria-labelledby': labelledBy, 'aria-describedby': describedBy, ...aria
}, forwardedRef) {
  const generatedId = useId();
  const selectId = id ?? `select-${generatedId}`;
  const listId = `${selectId}-options`;
  const labelId = label ? `${selectId}-label` : undefined;
  const errorId = error ? `${selectId}-error` : undefined;
  const initialValue = defaultValue ?? (placeholder ? '' : options.find((option) => !option.disabled)?.value ?? '');
  const [internalValue, setInternalValue] = useState(initialValue);
  const selectedValue = value ?? internalValue;
  const selected = options.find((option) => option.value === selectedValue);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState(-1);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0, maxHeight: 320 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef({ text: '', time: 0 });
  const reducedMotion = useReducedMotion();
  const isOpen = open && !disabled;
  const floating = focused || isOpen || selectedValue !== '';
  const enabled = options.map((option, index) => option.disabled ? -1 : index).filter((index) => index >= 0);
  useImperativeHandle(forwardedRef, () => triggerRef.current!);

  useEffect(() => {
    const owner = inputRef.current?.form;
    const reset = () => { setInternalValue(initialValue); setOpen(false); };
    owner?.addEventListener('reset', reset);
    return () => owner?.removeEventListener('reset', reset);
  }, [initialValue]);

  const reposition = useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const viewport = window.visualViewport;
    const viewportTop = viewport?.offsetTop ?? 0;
    const viewportLeft = viewport?.offsetLeft ?? 0;
    const viewportWidth = viewport?.width ?? window.innerWidth;
    const viewportHeight = viewport?.height ?? window.innerHeight;
    const below = viewportTop + viewportHeight - rect.bottom - 16;
    const above = rect.top - viewportTop - 16;
    const placeAbove = below < 220 && above > below;
    const maxHeight = Math.max(80, Math.min(352, placeAbove ? above : below));
    const width = Math.min(Math.max(rect.width, 200), viewportWidth - 24);
    const naturalHeight = listRef.current?.scrollHeight ?? options.length * 48 + 16;
    setPosition({
      left: Math.max(viewportLeft + 12, Math.min(rect.left, viewportLeft + viewportWidth - width - 12)),
      top: placeAbove ? Math.max(viewportTop + 8, rect.top - Math.min(naturalHeight, maxHeight) - 8) : rect.bottom + 8,
      width, maxHeight,
    });
  }, [options.length]);

  useLayoutEffect(() => {
    if (!isOpen) return;
    const observer = new ResizeObserver(reposition);
    if (triggerRef.current) observer.observe(triggerRef.current);
    if (listRef.current) observer.observe(listRef.current);
    const outside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!triggerRef.current?.contains(target) && !listRef.current?.contains(target)) setOpen(false);
    };
    const scroll = (event: Event) => {
      if (event.target instanceof Node && !listRef.current?.contains(event.target)) reposition();
    };
    document.addEventListener('pointerdown', outside);
    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', scroll, true);
    window.visualViewport?.addEventListener('resize', reposition);
    window.visualViewport?.addEventListener('scroll', reposition);
    return () => {
      observer.disconnect();
      document.removeEventListener('pointerdown', outside);
      window.removeEventListener('resize', reposition);
      window.removeEventListener('scroll', scroll, true);
      window.visualViewport?.removeEventListener('resize', reposition);
      window.visualViewport?.removeEventListener('scroll', reposition);
    };
  }, [isOpen, reposition]);

  useEffect(() => {
    if (isOpen && active >= 0) document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: 'nearest' });
  }, [isOpen, active, listId]);

  function show(preferLast = false) {
    if (disabled || !enabled.length) return;
    reposition();
    const index = options.findIndex((option) => option.value === selectedValue && !option.disabled);
    setActive(index >= 0 ? index : preferLast ? enabled[enabled.length - 1] : enabled[0]);
    searchRef.current = { text: '', time: 0 };
    setOpen(true);
  }
  function choose(index: number) {
    const option = options[index];
    if (!option || option.disabled) return;
    if (value === undefined) setInternalValue(option.value);
    onValueChange?.(option.value);
    setOpen(false);
    triggerRef.current?.focus({ preventScroll: true });
  }
  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const { key } = event;
    if (key === 'Tab') { setOpen(false); return; }
    if (key === 'Escape' && isOpen) { event.preventDefault(); event.stopPropagation(); setOpen(false); return; }
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(key)) {
      event.preventDefault();
      if (!enabled.length) return;
      if (!isOpen) show(key === 'ArrowUp' || key === 'End');
      if (key === 'Home') setActive(enabled[0]);
      else if (key === 'End') setActive(enabled[enabled.length - 1]);
      else if (isOpen) {
        const next = enabled.indexOf(active) + (key === 'ArrowDown' ? 1 : -1);
        setActive(enabled[Math.max(0, Math.min(enabled.length - 1, next))]);
      }
      return;
    }
    if (key === 'Enter' || key === ' ') {
      event.preventDefault();
      if (isOpen) choose(active); else show();
      return;
    }
    if (key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      if (!isOpen) show();
      const now = Date.now();
      const previous = now - searchRef.current.time < 700 ? searchRef.current.text : '';
      const query = `${previous}${key}`.toLocaleLowerCase();
      searchRef.current = { text: query, time: now };
      const repeated = [...query].every((character) => character === query[0]);
      const prefix = repeated ? key.toLocaleLowerCase() : query;
      const after = repeated ? active + 1 : 0;
      const indices = [...enabled.filter((index) => index >= after), ...enabled.filter((index) => index < after)];
      const match = indices.find((index) => options[index].label.toLocaleLowerCase().startsWith(prefix));
      if (match !== undefined) setActive(match);
    }
  }

  return (
    <div className={cn('relative min-w-0 w-full', className)}>
      {name && <input ref={inputRef} type="hidden" name={name} form={form} value={selectedValue} disabled={disabled} />}
      <div className="relative">
        <button ref={triggerRef} id={selectId} type="button" role="combobox" disabled={disabled}
          aria-haspopup="listbox" aria-expanded={isOpen} aria-controls={isOpen ? listId : undefined}
          aria-activedescendant={isOpen && active >= 0 ? `${listId}-${active}` : undefined}
          aria-labelledby={labelledBy ?? labelId} aria-describedby={[describedBy, errorId].filter(Boolean).join(' ') || undefined}
          aria-invalid={!!error || undefined} aria-required={required || undefined} {...aria}
          onClick={() => isOpen ? setOpen(false) : show()} onKeyDown={handleKeyDown}
          onFocus={(event) => { setFocused(true); onFocus?.(event); }}
          onBlur={(event) => { setFocused(false); setOpen(false); onBlur?.(event); }}
          className={cn(
            'flex min-h-[52px] w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 text-left text-sm text-slate-900 outline-none transition-[border-color,box-shadow,background-color] duration-200',
            'hover:border-slate-300 focus-visible:border-teal-500 focus-visible:ring-4 focus-visible:ring-teal-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-50 motion-reduce:transition-none',
            label && 'pt-5 pb-2', isOpen && 'border-teal-500 ring-4 ring-teal-500/10',
            error && 'border-rose-500 focus-visible:border-rose-500 focus-visible:ring-rose-500/10', triggerClassName,
          )}>
          <span className={cn('min-w-0 flex-1 truncate', !selected && 'text-slate-400', label && !floating && 'invisible')}>
            {selected?.label ?? placeholder ?? '\u00a0'}
          </span>
          <ChevronDown aria-hidden="true" className={cn('size-4 shrink-0 text-slate-400 transition-transform duration-200 motion-reduce:transition-none', isOpen && 'rotate-180 text-teal-600')} />
        </button>
        {label && <label id={labelId} htmlFor={selectId} className={cn(
          'pointer-events-none absolute left-4 text-slate-500 transition-all duration-200 motion-reduce:transition-none',
          floating ? 'top-1.5 text-[11px] font-medium' : 'top-1/2 -translate-y-1/2 text-sm',
          (focused || isOpen) && 'text-teal-600', error && 'text-rose-500',
        )}>{label}</label>}
      </div>
      {error && <p id={errorId} className="mt-1.5 text-xs text-rose-500" role="alert">{error}</p>}
      {isOpen && createPortal(
        <motion.div ref={listRef} id={listId} role="listbox" aria-labelledby={labelledBy ?? labelId ?? selectId}
          data-site-select="" data-lenis-prevent="" style={position}
          initial={{ opacity: 0, y: reducedMotion ? 0 : -4 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.16, ease: [0.22, 1, 0.36, 1] }}
          onMouseDown={(event) => event.preventDefault()}
          className="fixed z-[1000] overflow-y-auto overscroll-contain rounded-2xl border border-slate-200/80 bg-white p-1.5 shadow-[0_12px_40px_-8px_rgba(15,23,42,0.22)]">
          {options.map((option, index) => (
            <div key={option.value} id={`${listId}-${index}`} role="option" aria-selected={option.value === selectedValue} aria-disabled={option.disabled || undefined}
              onPointerMove={(event) => { if (event.pointerType === 'mouse' && !option.disabled) setActive(index); }}
              onClick={() => choose(index)}
              className={cn('flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm leading-relaxed transition-colors motion-reduce:transition-none',
                option.value === selectedValue ? 'font-semibold text-teal-700' : 'text-slate-700',
                active === index ? 'bg-teal-50' : option.value === selectedValue ? 'bg-teal-50/60' : 'bg-white',
                option.disabled && 'cursor-not-allowed opacity-40')}>
              <span className="min-w-0 flex-1 [overflow-wrap:anywhere]">{option.label}</span>
              <Check aria-hidden="true" className={cn('size-4 shrink-0 text-teal-600', option.value !== selectedValue && 'invisible')} strokeWidth={2.5} />
            </div>
          ))}
        </motion.div>, document.body,
      )}
    </div>
  );
});

export { Select, type SelectProps, type SelectOption };
