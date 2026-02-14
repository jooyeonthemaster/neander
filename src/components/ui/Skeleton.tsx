import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  /** Width as CSS value, e.g. "100%" or "200px" */
  width?: string;
  /** Height as CSS value, e.g. "20px" or "1rem" */
  height?: string;
}

export function Skeleton({ className, width, height }: SkeletonProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        'animate-pulse rounded-lg bg-slate-200',
        className
      )}
      style={{
        width: width || undefined,
        height: height || undefined,
      }}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
