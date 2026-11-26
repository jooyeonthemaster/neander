import type { ComponentProps, ReactNode } from 'react';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

/* 2026-11 개편에서 함께 쓰는 작은 부품 — 버튼 · 화살표 링크 · 구역 라벨 */

type LinkHref = ComponentProps<typeof Link>['href'];

const BTN_BASE =
  'group/btn relative isolate inline-flex min-h-[3.25rem] items-center justify-center gap-3 overflow-hidden border px-7 text-[0.95rem] font-semibold leading-none transition-colors duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ' +
  'before:absolute before:inset-0 before:-z-10 before:origin-bottom before:scale-y-0 before:transition-transform before:duration-500 before:ease-[cubic-bezier(0.22,1,0.36,1)] hover:before:scale-y-100 focus-visible:outline-2 focus-visible:outline-offset-4';

const BTN_VARIANT = {
  /** 흰 면 — 올리면 강조색이 아래에서 차오른다 */
  fill: 'border-paper bg-paper text-ink before:bg-accent hover:border-accent',
  /** 흰 테두리 — 올리면 흰 면이 차오른다 */
  outline: 'border-paper/70 text-paper before:bg-paper hover:border-paper hover:text-ink',
  /** 밝은 종이 위에 놓는 검은 버튼 */
  ink: 'border-ink bg-ink text-paper before:bg-accent hover:border-accent hover:text-ink',
  /** 밝은 종이 위의 검은 테두리 */
  'ink-outline': 'border-ink/70 text-ink before:bg-ink hover:text-paper',
} as const;

interface BtnProps {
  href: LinkHref;
  children: ReactNode;
  variant?: keyof typeof BTN_VARIANT;
  /** 오른쪽 화살표 */
  arrow?: boolean;
  className?: string;
  external?: boolean;
  'aria-label'?: string;
  onClick?: () => void;
}

export function Btn({ href, children, variant = 'outline', arrow = false, className, external, ...rest }: BtnProps) {
  const classes = cn(BTN_BASE, BTN_VARIANT[variant], className);
  const inner = (
    <>
      <span>{children}</span>
      {arrow && <span aria-hidden="true" className="font-display transition-transform duration-500 group-hover/btn:translate-x-1.5">→</span>}
    </>
  );
  if (external && typeof href === 'string') {
    return (
      <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noopener noreferrer' : undefined} className={classes} {...rest}>
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} className={classes} {...rest}>
      {inner}
    </Link>
  );
}

/** 밑줄이 그려지는 작은 영어 링크 (ALL PROJECTS →) */
export function ArrowLink({ href, children, className, external }: { href: LinkHref; children: ReactNode; className?: string; external?: boolean }) {
  const classes = cn(
    'group/al t-label relative inline-flex items-center gap-3 pb-2 text-paper after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-right after:scale-x-100 after:bg-paper/50 after:transition-transform after:duration-500 hover:after:origin-left',
    'before:absolute before:inset-x-0 before:bottom-0 before:h-px before:origin-left before:scale-x-0 before:bg-accent before:transition-transform before:duration-500 hover:before:scale-x-100',
    className,
  );
  const inner = (
    <>
      <span>{children}</span>
      <span aria-hidden="true" className="transition-transform duration-500 group-hover/al:translate-x-1.5">→</span>
    </>
  );
  if (external && typeof href === 'string') {
    return <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>{inner}</a>;
  }
  return <Link href={href} className={classes}>{inner}</Link>;
}

/** 01 — WHO WE ARE */
export function SectionLabel({ no, children, className }: { no?: string; children: ReactNode; className?: string }) {
  return (
    <p className={cn('t-label flex items-center gap-4 text-paper/55', className)}>
      {no && <span className="text-accent">{no}</span>}
      <span>{children}</span>
    </p>
  );
}

/** 사진 위 작은 표시 (운영 사례 · 체험 콘셉트 이미지 등) */
export function PhotoTag({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-block bg-ink/65 px-2.5 py-1.5 text-[11px] font-medium leading-none text-paper/90 backdrop-blur-md', className)}>
      {children}
    </span>
  );
}
