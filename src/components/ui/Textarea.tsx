'use client';

import {
  forwardRef,
  useState,
  type TextareaHTMLAttributes,
} from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Floating label text */
  label?: string;
  /** Error message displayed below the textarea */
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, onFocus, onBlur, value, defaultValue, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = value !== undefined ? String(value).length > 0 : false;
    const isFloating = isFocused || hasValue || !!defaultValue;

    const textareaId = id || (label ? `textarea-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);
    const errorId = error && textareaId ? `${textareaId}-error` : undefined;

    return (
      <div className={cn('relative w-full', className)}>
        <textarea
          ref={ref}
          id={textareaId}
          value={value}
          defaultValue={defaultValue}
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
            'peer w-full rounded-lg border bg-white px-4 pt-6 pb-2 text-sm',
            'outline-none transition-all duration-200 resize-y min-h-[120px]',
            'placeholder:text-transparent',
            isFocused
              ? 'border-teal-500 ring-2 ring-teal-500/20'
              : 'border-slate-300 hover:border-slate-400',
            error && 'border-rose-500 ring-2 ring-rose-500/20',
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50'
          )}
          placeholder={label}
          {...props}
        />
        {label && (
          <label
            htmlFor={textareaId}
            className={cn(
              'absolute left-4 transition-all duration-200 pointer-events-none',
              'text-slate-500',
              isFloating
                ? 'top-2 text-[11px] font-medium'
                : 'top-4 text-sm',
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

Textarea.displayName = 'Textarea';

export { Textarea, type TextareaProps };
