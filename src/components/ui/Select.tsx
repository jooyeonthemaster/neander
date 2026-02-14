'use client';

import {
  forwardRef,
  useState,
  type SelectHTMLAttributes,
} from 'react';
import { cn } from '@/lib/utils';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  /** Dropdown options */
  options: SelectOption[];
  /** Floating label text */
  label?: string;
  /** Error message */
  error?: string;
  /** Placeholder shown when no value selected */
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ options, label, error, placeholder, className, id, value, onFocus, onBlur, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = value !== undefined && value !== '';
    const isFloating = isFocused || hasValue;

    const selectId = id || (label ? `select-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);
    const errorId = error && selectId ? `${selectId}-error` : undefined;

    return (
      <div className={cn('relative w-full', className)}>
        <select
          ref={ref}
          id={selectId}
          value={value}
          aria-invalid={!!error || undefined}
          aria-describedby={errorId}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          className={cn(
            'peer w-full appearance-none rounded-lg border bg-white px-4 pt-5 pb-2 pr-10 text-sm',
            'outline-none transition-all duration-200 cursor-pointer',
            isFocused
              ? 'border-teal-500 ring-2 ring-teal-500/20'
              : 'border-slate-300 hover:border-slate-400',
            error && 'border-rose-500 ring-2 ring-rose-500/20',
            !hasValue && !isFocused && 'text-transparent',
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50'
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>

        {/* Custom chevron icon */}
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M4 6L8 10L12 6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {label && (
          <label
            htmlFor={selectId}
            className={cn(
              'absolute left-4 transition-all duration-200 pointer-events-none',
              'text-slate-500',
              isFloating
                ? 'top-1.5 text-[11px] font-medium'
                : 'top-1/2 -translate-y-1/2 text-sm',
              isFocused && !error && 'text-teal-600',
              error && 'text-rose-500'
            )}
          >
            {label}
          </label>
        )}

        {error && (
          <p id={errorId} className="mt-1.5 text-xs text-rose-500" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select, type SelectProps, type SelectOption };
