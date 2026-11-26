import Image from 'next/image';
import type { ReactNode } from 'react';
import { Title } from '@/components/site/Title';
import { PhotoTag } from '@/components/site/ui';
import { cn } from '@/lib/utils';

/* ─────────────────────────────────────────────────────────
   안쪽 페이지 첫 화면 — 영어 큰 제목 + 작은 한국어(h1 안에 함께 둔다) + 짧은 설명.
   사진이 있으면 머리글 뒤까지 사진이 올라가고, 없으면 옅은 빛만 깐다.
   글자는 서버 HTML 그대로 보이고 CSS 로만 올라온다.
   ───────────────────────────────────────────────────────── */

interface PageHeroProps {
  /** 작은 영어 라벨 (PORTFOLIO · 46 PROJECTS) */
  label: string;
  /** 영어 큰 제목 — 줄 단위 */
  en: ReactNode[];
  /** 작은 한국어 제목 (영어판에서는 영어 부제나 undefined) */
  ko?: string;
  lead?: ReactNode;
  image?: string;
  imageAlt?: string;
  imagePosition?: string;
  /** 사진 출처 표시 */
  caption?: string;
  align?: 'left' | 'center';
  size?: 'giant' | 'h1';
  /** 제목 아래에 놓을 것 (버튼 · 숫자 등) */
  children?: ReactNode;
  /** 오른쪽 아래에 놓을 것 (넓은 화면) */
  aside?: ReactNode;
  id?: string;
  className?: string;
  titleClassName?: string;
}

export function PageHero({ label, en, ko, lead, image, imageAlt = '', imagePosition, caption, align = 'left', size = 'giant', children, aside, id, className, titleClassName }: PageHeroProps) {
  const center = align === 'center';
  return (
    <section
      className={cn('under-header relative isolate flex flex-col justify-end overflow-hidden bg-ink', image ? 'min-h-[min(46rem,88svh)]' : 'min-h-[min(34rem,70svh)]', className)}
      aria-labelledby={id}
    >
      <div className="absolute inset-0 -z-10" aria-hidden={imageAlt ? undefined : true}>
        {image ? (
          <>
            <Image src={image} alt={imageAlt} fill priority sizes="100vw" className="zoom-settle object-cover" style={imagePosition ? { objectPosition: imagePosition } : undefined} />
            <div className="absolute inset-0 bg-gradient-to-b from-ink/80 via-ink/50 to-ink" />
          </>
        ) : (
          <div className="absolute inset-0" style={{ background: 'radial-gradient(60% 90% at 88% 0%, rgba(125,149,255,0.2), transparent 62%)' }} />
        )}
      </div>
      {caption && <PhotoTag className="absolute right-4 top-24 lg:right-8 lg:top-28">{caption}</PhotoTag>}

      <div className={cn('wrap pb-[clamp(2.5rem,6vw,5rem)] pt-36 lg:pt-44', center && 'text-center')}>
        <p className="t-label rise text-paper/65">{label}</p>
        <div className={cn('mt-6 grid items-end gap-x-16 gap-y-8', aside && 'lg:grid-cols-[minmax(0,1fr)_auto]')}>
          <div>
            <Title as="h1" id={id} en={en} ko={ko} size={size} immediate delay={100} className={titleClassName} koClassName="text-paper/85" />
            {lead && <p className={cn('rise mt-6 max-w-2xl text-[clamp(1rem,1.25vw,1.2rem)] leading-relaxed text-paper/65', center && 'mx-auto')} style={{ '--i': en.length + 3 } as React.CSSProperties}>{lead}</p>}
            {children && <div className={cn('rise mt-8', center && 'flex justify-center')} style={{ '--i': en.length + 4 } as React.CSSProperties}>{children}</div>}
          </div>
          {aside && <div className="fade-in" style={{ '--i': 6 } as React.CSSProperties}>{aside}</div>}
        </div>
      </div>
    </section>
  );
}
