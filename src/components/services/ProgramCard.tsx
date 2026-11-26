'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { getExperienceImage } from '@/data/experience-images';
import { getProgramPreview, getProgramSteps } from '@/data/program-previews';
import { cn } from '@/lib/utils';
import { BoothFrame, KioskFrame } from './DeviceFrame';

/* ─────────────────────────────────────────────────────────
   체험 프로그램 카드 (체험 서비스 목록 · 관련 체험)
   · 사진은 실제 운영 사진이면 「운영 사례 · 행사명」, 생성 이미지면 「체험 콘셉트 이미지」를 붙인다 (기존 규칙 그대로)
   · 실제 프로그램 화면이 있는 체험은 그 첫 화면이 켜진 기기(키오스크 · 포토부스)가 늘 구석에 서 있고,
     마우스를 올리면 화면이 1.5초마다 다음 단계로 넘어가 프로그램이 도는 것처럼 보인다 (2026-11-23)
     (화면 순서 — src/data/program-previews.ts 의 getProgramSteps)
   ───────────────────────────────────────────────────────── */

/** 단계 화면이 넘어가는 간격 */
const STEP_MS = 1500;

interface ProgramCardProps {
  slug: string;
  name: string;
  /** 영어 이름 — 한국어판에서 작은 라벨로 쓴다 */
  nameEn?: string;
  oneLiner: string;
  /** 분류 (AI 진단 체험 등) */
  tag?: string;
  className?: string;
}

export function ProgramCard({ slug, name, nameEn, oneLiner, tag, className }: ProgramCardProps) {
  const t = useTranslations('services');
  const locale = useLocale();
  const ko = locale !== 'en';
  const image = getExperienceImage(slug);
  const preview = getProgramPreview(slug);
  const steps = useMemo(() => getProgramSteps(slug), [slug]);
  const screens = useMemo(() => steps.map((src) => ({ src })), [steps]);
  const [playing, setPlaying] = useState(false);
  const [step, setStep] = useState(0);

  // 올려 둔 동안만 단계를 넘긴다. 내리면 첫 화면으로 돌아간다. 움직임 줄이기 설정이면 넘기지 않는다
  useEffect(() => {
    if (!playing || steps.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = setInterval(() => setStep((i) => (i + 1) % steps.length), STEP_MS);
    return () => clearInterval(timer);
  }, [playing, steps.length]);
  const play = () => setPlaying(true);
  const stop = () => { setPlaying(false); setStep(0); };
  const caption = image ? (image.kind === 'case' ? `${t('photoCase')} · ${ko ? image.eventKo : image.eventEn}` : t('photoConcept')) : '';
  const alt = image ? (image.kind === 'case' ? `${name} — ${caption}` : `${name} — ${ko ? image.altKo : image.altEn} (${caption})`) : name;

  return (
    <Link href={`/services/${slug}`} data-cursor="VIEW" onMouseEnter={play} onMouseLeave={stop} onFocus={play} onBlur={stop} className={cn('group relative flex h-full flex-col focus-visible:outline-2 focus-visible:outline-offset-4', className)}>
      <div className="relative aspect-[16/10] overflow-hidden bg-ink-2">
        {image && (
          <Image
            src={image.src}
            alt={alt}
            fill
            sizes="(min-width: 1280px) 24vw, (min-width: 768px) 46vw, 92vw"
            className="rd-zoom object-cover transition-[transform,filter] duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.07] group-hover:brightness-[0.55]"
          />
        )}
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
        {/* 사진 표시는 왼쪽 위 — 아래쪽은 기기가 서 있어 가린다 */}
        {caption && (
          <>
            <div aria-hidden="true" className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-ink/60 to-transparent" />
            <span className="absolute left-3 top-2.5 text-[11px] font-medium text-paper/85">{caption}</span>
          </>
        )}
        {/* 실제 프로그램 화면이 켜진 기기(키오스크 · 포토부스) — 늘 서 있고, 올리면 살짝 올라오며 화면이 단계별로 넘어간다.
            기기 아랫부분(흐려지는 자리)은 카드 밑으로 잘려 바닥에 서 있는 것처럼 보인다 */}
        {preview && (
          <span
            aria-hidden="true"
            className={cn(
              'pointer-events-none absolute bottom-0 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]',
              preview.device === 'kiosk'
                ? 'right-[6%] w-[30%] translate-y-[14%] group-hover:translate-y-[11.5%] group-focus-visible:translate-y-[11.5%]'
                : 'right-[4%] w-[56%] translate-y-[19%] group-hover:translate-y-[16.5%] group-focus-visible:translate-y-[16.5%]',
            )}
          >
            {preview.device === 'kiosk' ? (
              <KioskFrame screens={screens} active={step} sizes="140px" />
            ) : (
              <BoothFrame screens={screens} active={step} sizes="240px" />
            )}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col border-b border-paper/15 pb-5 pt-4 transition-colors duration-500 group-hover:border-paper/60">
        <p className="t-label flex items-center gap-3 !text-[0.64rem] text-paper/45">
          {tag && <span className="text-accent">{tag}</span>}
          {ko && nameEn && <span className="truncate">{nameEn}</span>}
        </p>
        <h3 className="t-kr-title mt-2 text-[1.2rem] text-paper">{name}</h3>
        <p className="mt-1.5 line-clamp-2 text-[0.92rem] leading-relaxed text-paper/55">{oneLiner}</p>
      </div>
    </Link>
  );
}
