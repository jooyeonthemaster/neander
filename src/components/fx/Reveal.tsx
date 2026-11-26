'use client';

import type { CSSProperties, ElementType, ReactNode } from 'react';
import { useRevealed } from '@/components/animations/useRevealed';
import { cn } from '@/lib/utils';

/* ─────────────────────────────────────────────────────────
   스크롤로 화면에 들어올 때 한 번 나타나는 묶음.
   움직임은 CSS(theme-redesign.css 의 [data-reveal])가 맡고, 여기서는 '들어왔다'만 알려 준다.
   - up   : 아래에서 살짝 올라오며 나타남 (기본)
   - clip : 위에서 아래로 열리는 사진 (안쪽 .rd-zoom 은 함께 줌이 풀린다)
   - fade / scale
   스크립트가 꺼진 브라우저에서는 layout 의 <noscript> 스타일이 모두 보이게 한다.
   ───────────────────────────────────────────────────────── */

type Variant = 'up' | 'clip' | 'fade' | 'scale';

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** 지연 (ms) */
  delay?: number;
  variant?: Variant;
  as?: ElementType;
  /** 화면 안으로 이만큼 들어와야 나타난다 */
  margin?: string;
  style?: CSSProperties;
}

export function Reveal({ children, className, delay = 0, variant = 'up', as: Tag = 'div', margin = '-70px', style }: RevealProps) {
  const [ref, shown] = useRevealed<HTMLElement>(margin);
  return (
    <Tag
      ref={ref as never}
      data-reveal={variant}
      data-shown={shown ? '' : undefined}
      className={className}
      style={{ ...style, '--rd': `${delay}ms` } as CSSProperties}
    >
      {/* 잘라 여는 효과는 안쪽 상자에 건다 — 바깥 상자까지 잘리면 브라우저가 '화면에 들어왔다'를 알려 주지 않는다 */}
      {variant === 'clip' ? <div className="rd-clip relative h-full w-full">{children}</div> : children}
    </Tag>
  );
}

/* ─────────────────────────────────────────────────────────
   줄마다 아래에서 밀려 올라오는 큰 제목.
   immediate: 첫 화면용 — 스크롤을 기다리지 않고 CSS 애니메이션으로 바로 올라온다
   (글자는 서버 HTML 에 그대로 있어 스크립트가 늦어도 비어 보이지 않는다).
   ───────────────────────────────────────────────────────── */

interface LinesProps {
  lines: ReactNode[];
  className?: string;
  lineClassName?: string;
  delay?: number;
  immediate?: boolean;
  as?: ElementType;
}

export function Lines({ lines, className, lineClassName, delay = 0, immediate = false, as: Tag = 'span' }: LinesProps) {
  const [ref, shown] = useRevealed<HTMLElement>('-40px');
  return (
    <Tag
      ref={ref as never}
      data-lines={immediate ? 'now' : ''}
      data-shown={shown || immediate ? '' : undefined}
      className={cn('block', className)}
      style={{ '--rd': `${delay}ms` } as CSSProperties}
    >
      {lines.map((line, i) => (
        // 줄 높이가 낮은 큰 글자의 위·아래가 잘리지 않게 안쪽 여백을 주고 그만큼 당긴다
        <span key={i} className="-my-[0.1em] block overflow-hidden py-[0.1em]">
          <span data-line className={cn('block', lineClassName)} style={{ '--i': i } as CSSProperties}>
            {line}
          </span>
        </span>
      ))}
    </Tag>
  );
}
