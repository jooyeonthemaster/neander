'use client';

import {
  forwardRef,
  useState,
  type InputHTMLAttributes,
} from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Floating label text */
  label?: string;
  /** Error message displayed below the input */
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, onFocus, onBlur, value, defaultValue, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    // 값이 있는지는 CSS(:placeholder-shown)로 판단한다.
    // react-hook-form의 register()처럼 value를 넘기지 않는 경우에도 동작한다.

    const inputId = id || (label ? `input-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);
    const errorId = error && inputId ? `${inputId}-error` : undefined;

    return (
      <div className={cn('relative w-full', className)}>
        {/* 라벨의 top-1/2 기준이 입력칸 높이가 되도록 오류 문구와 분리한다 */}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
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
              'peer w-full rounded-lg border bg-white px-4 pt-5 pb-2 text-sm',
              'outline-none transition-all duration-200',
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
              htmlFor={inputId}
              className={cn(
                'absolute left-4 transition-all duration-200 pointer-events-none',
                'text-slate-500',
                // 기본: 값이 있을 때(=placeholder가 보이지 않을 때)의 작은 라벨
                'top-1.5 text-[11px] font-medium',
                // 비어 있고 포커스도 없을 때만 입력칸 가운데로 내려온다
                'peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm',
                'peer-focus:top-1.5 peer-focus:translate-y-0 peer-focus:text-[11px] peer-focus:font-medium',
                isFocused && !error && 'text-teal-600',
                error && 'text-rose-500'
              )}
            >
              {label}
            </label>
          )}
        </div>
        {error && (
          <p id={errorId} className="mt-1.5 text-xs text-rose-500" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input, type InputProps };
