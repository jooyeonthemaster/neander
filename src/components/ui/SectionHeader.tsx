import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  /** Small category label above the title, e.g. "ABOUT US" */
  category?: string;
  /** Main section title */
  title: string;
  /** Supporting subtitle text */
  subtitle?: string;
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
  className?: string;
}

const alignmentStyles = {
  left: 'text-left',
  center: 'text-center mx-auto',
  right: 'text-right ml-auto',
} as const;

export function SectionHeader({
  category,
  title,
  subtitle,
  align = 'center',
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn('max-w-2xl', alignmentStyles[align], className)}>
      {category && (
        <span className="inline-block mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-teal-600">
          {category}
        </span>
      )}
      <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-base text-slate-600 leading-relaxed sm:text-lg">
          {subtitle}
        </p>
      )}
    </div>
  );
}

export type { SectionHeaderProps };
