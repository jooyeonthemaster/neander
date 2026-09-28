'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;

/** Keeps native form semantics while drawing the control with our design tokens. */
const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, disabled, ...props }, ref) => (
    <span className={cn('relative inline-flex size-5 shrink-0 align-middle', className)}>
      <input
        {...props}
        ref={ref}
        type="checkbox"
        disabled={disabled}
        className="peer absolute inset-0 z-10 m-0 size-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none flex size-full items-center justify-center rounded-md border border-slate-300 bg-white text-transparent transition-colors duration-150 peer-checked:border-teal-600 peer-checked:bg-teal-600 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-teal-500/40 peer-focus-visible:ring-offset-2 peer-disabled:opacity-40 motion-reduce:transition-none"
      >
        <Check className="size-3.5" strokeWidth={3} />
      </span>
    </span>
  ),
);

Checkbox.displayName = 'Checkbox';

export { Checkbox, type CheckboxProps };
