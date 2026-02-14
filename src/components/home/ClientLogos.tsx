'use client';

import { Marquee } from '@/components/ui';
import { cn } from '@/lib/utils';

/* ─────────────────────────────────────────────────────────
   Two rows of artists/brands, scrolling in opposite
   directions with fade-edge masks on left and right.
   ───────────────────────────────────────────────────────── */

const ROW_1 = [
  '하현상',
  '더킹덤 무진',
  'TOXIC',
  '청하',
  '뉴진스',
  '태양',
  '영탁',
  '려욱',
  'DAY6 도윤',
  'SF9 인성',
];

const ROW_2 = [
  'STACY 수민',
  '아이들 미연',
  '트와이스 다현',
  '케플러 샤오팅',
  '김채현',
  '이승윤',
  '몬스타엑스 셔누',
  '우주소녀 설아',
  '프로미스나인 노지선',
];

function LogoItem({ name }: { name: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-6 py-3',
        'text-sm sm:text-base font-semibold text-neutral-400 whitespace-nowrap',
        'select-none'
      )}
    >
      {name}
    </span>
  );
}

export function ClientLogos() {
  return (
    <section className="min-h-[40vh] flex flex-col justify-center py-24 bg-white overflow-hidden" aria-label="Trusted partners">
      <div className="container-wide mb-8">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.15em] text-neutral-400">
          Trusted by leading artists &amp; brands
        </p>
      </div>

      {/* Fade-edge mask wrapper */}
      <div className="relative">
        {/* Left fade */}
        <div
          className="pointer-events-none absolute left-0 top-0 bottom-0 w-20 sm:w-32 z-10"
          style={{
            background: 'linear-gradient(to right, white, transparent)',
          }}
          aria-hidden="true"
        />
        {/* Right fade */}
        <div
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-20 sm:w-32 z-10"
          style={{
            background: 'linear-gradient(to left, white, transparent)',
          }}
          aria-hidden="true"
        />

        {/* Row 1 - left */}
        <Marquee speed={40} direction="left" pauseOnHover className="mb-2">
          {ROW_1.map((name) => (
            <LogoItem key={name} name={name} />
          ))}
        </Marquee>

        {/* Row 2 - right */}
        <Marquee speed={35} direction="right" pauseOnHover>
          {ROW_2.map((name) => (
            <LogoItem key={name} name={name} />
          ))}
        </Marquee>
      </div>
    </section>
  );
}
