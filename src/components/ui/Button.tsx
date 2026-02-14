'use client';

import {
  forwardRef,
  cloneElement,
  isValidElement,
  type ButtonHTMLAttributes,
  type ReactNode,
  type ReactElement,
} from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'dark';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /**
   * If true, merges button styles onto the immediate child element
   * instead of rendering a <button>. Useful for wrapping Next.js <Link>.
   */
  asChild?: boolean;
  /** Shows a loading spinner and disables the button */
  loading?: boolean;
  children: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-teal-600 text-white hover:bg-teal-500 focus-visible:ring-teal-400',
  secondary:
    'border-2 border-teal-600 text-teal-600 hover:bg-teal-600 hover:text-white focus-visible:ring-teal-400',
  ghost:
    'text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-400',
  dark:
    'bg-slate-900 text-white hover:bg-slate-800 focus-visible:ring-slate-500',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-5 text-sm gap-2',
  lg: 'h-12 px-7 text-base gap-2.5',
};

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      asChild = false,
      loading = false,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    const classes = cn(
      'inline-flex items-center justify-center font-medium rounded-lg',
      'transition-colors duration-150',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      'disabled:pointer-events-none disabled:opacity-50',
      'select-none cursor-pointer',
      variantStyles[variant],
      sizeStyles[size],
      className
    );

    // asChild: merge styles and props onto the child element
    if (asChild && isValidElement(children)) {
      const child = children as ReactElement<Record<string, unknown>>;
      return cloneElement(child, {
        ...props,
        className: cn(classes, child.props.className as string | undefined),
        ref,
      });
    }

    return (
      <motion.button
        ref={ref}
        whileHover={isDisabled ? undefined : { scale: 1.02 }}
        whileTap={isDisabled ? undefined : { scale: 0.97 }}
        transition={{ duration: 0.15 }}
        disabled={isDisabled}
        className={classes}
        aria-busy={loading || undefined}
        {...(props as Record<string, unknown>)}
      >
        {loading && <Spinner />}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export { Button, type ButtonProps, type ButtonVariant, type ButtonSize };
