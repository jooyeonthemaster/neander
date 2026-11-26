import Image from 'next/image';
import type { ComponentProps, ReactNode } from 'react';
import { Link } from '@/i18n/navigation';
import { Title } from '@/components/site/Title';
import { Btn, PhotoTag } from '@/components/site/ui';
import { displayLines, displaySize } from './helpers';

/* 서비스 상세 첫 화면 — 실제 사진 위에 영어 큰 이름 + 한국어 이름, 오른쪽에 핵심 정보 칸 */

type LinkHref = ComponentProps<typeof Link>['href'];

export interface HeroFact {
  label: string;
  value: ReactNode;
  /** 가장 크게 보일 값 (시작가) */
  strong?: boolean;
}

interface ServiceHeroProps {
  /** 작은 라벨 (SERVICE 01 · AI 진단 체험 등) */
  eyebrow: string;
  /** 영어 이름 — 큰 제목 */
  nameEn: string;
  /** 한국어 이름 (한국어판에서만) */
  nameKo?: string;
  lead: string;
  image: string;
  imageAlt: string;
  /** 사진 출처 표시 (운영 사례 · 행사명 / 체험 콘셉트 이미지) */
  caption?: string;
  imagePosition?: string;
  crumbs: { label: string; href?: LinkHref }[];
  primary: { label: string; href: LinkHref };
  secondary?: { label: string; href: LinkHref };
  facts: HeroFact[];
}

export function ServiceHero({ eyebrow, nameEn, nameKo, lead, image, imageAlt, caption, imagePosition, crumbs, primary, secondary, facts }: ServiceHeroProps) {
  const lines = displayLines(nameEn);
  return (
    <section className="under-header relative isolate flex min-h-[min(58rem,100svh)] flex-col justify-end overflow-hidden bg-ink">
      <div className="absolute inset-0 -z-10" aria-hidden={imageAlt ? undefined : true}>
        <Image src={image} alt={imageAlt} fill priority sizes="100vw" className="zoom-settle object-cover" style={imagePosition ? { objectPosition: imagePosition } : undefined} />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/80 via-ink/45 to-ink" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/70 via-transparent to-transparent max-lg:hidden" />
      </div>

      <div className="wrap relative pb-[clamp(2.5rem,6vw,5rem)] pt-32 lg:pt-40">
        <nav aria-label="Breadcrumb" className="t-label fade-in mb-[clamp(2rem,6vw,5rem)] flex flex-wrap items-center gap-x-3 gap-y-1 text-paper/55">
          {crumbs.map((c, i) => (
            <span key={c.label} className="flex items-center gap-3">
              {i > 0 && <span aria-hidden="true">/</span>}
              {c.href ? <Link href={c.href} className="transition-colors hover:text-paper">{c.label}</Link> : <span className="text-paper" aria-current="page">{c.label}</span>}
            </span>
          ))}
        </nav>

        <div className="grid items-end gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-16 xl:grid-cols-[minmax(0,1fr)_24rem]">
          <div>
            <p className="t-label rise text-accent">{eyebrow}</p>
            <Title as="h1" en={lines} ko={nameKo} size={displaySize(lines)} fit immediate delay={100} className="mt-5" koClassName="!text-[clamp(1.25rem,2.2vw,2rem)] !font-bold text-paper" />
            <p className="rise mt-6 max-w-xl text-[clamp(1rem,1.25vw,1.2rem)] leading-relaxed text-paper/75" style={{ '--i': lines.length + 3 } as React.CSSProperties}>{lead}</p>
            <div className="rise mt-8 flex flex-wrap gap-3" data-cta-area="service_hero" style={{ '--i': lines.length + 4 } as React.CSSProperties}>
              <Btn href={primary.href} variant="fill" arrow>{primary.label}</Btn>
              {secondary && <Btn href={secondary.href}>{secondary.label}</Btn>}
            </div>
          </div>

          {facts.length > 0 && (
            <dl className="fade-in border border-paper/20 bg-ink/70 backdrop-blur-md" style={{ '--i': 6 } as React.CSSProperties}>
              {facts.map((f) => (
                <div key={f.label} className="border-b border-paper/12 px-6 py-4 last:border-b-0">
                  <dt className="t-label !text-[0.66rem] text-paper/50">{f.label}</dt>
                  <dd className={f.strong ? 'mt-1.5 font-display text-[1.9rem] font-extrabold leading-tight tracking-[-0.02em] text-paper' : 'mt-1.5 text-[1.05rem] font-semibold leading-snug tracking-[-0.02em] text-paper'}>{f.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>

      {caption && <PhotoTag className="absolute right-4 top-24 lg:right-8 lg:top-28">{caption}</PhotoTag>}
    </section>
  );
}
