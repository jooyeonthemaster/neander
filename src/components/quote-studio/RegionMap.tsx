'use client';

import type { ReactNode } from 'react';
import { REGIONS, type Lang, type RegionKey } from '@/lib/quote/catalog';
import { cn } from '@/lib/utils';

/*
 * 행사 지역을 고르는 약도.
 *
 * 좌표는 실제 위경도를 단순화해 옮겼다 — x = (경도 − 125.95) × 100,
 * y = (38.75 − 위도) × 125 (북위 36.5° 에서 위도 1° ≈ 경도 1.25° 라 눌러 맞춘다).
 * 권역은 catalog 의 REGIONS 여섯 개다 — 서울 / 경기·인천 / 충청·강원 영서 / 강원 영동 / 전라 / 경상.
 * 경계는 도 경계를 따르고, 강원은 태백 능선으로 영서·영동을 나눈다.
 * 제주·울릉도·독도는 운영하지 않는 지역이라 회색이고, 거리는 약도처럼 당겨 그렸다.
 *
 * 지도는 누르기 편한 보조 수단이다. 키보드·낭독기는 옆의 권역 버튼(children, 라디오)으로
 * 고르고, 그 버튼이 지도의 범례도 겸한다 — 그래서 지도 안에는 글자를 넣지 않는다.
 */
/** 그리는 순서가 곧 쌓이는 순서다 — 서울은 경기·인천 위에 얹어 따로 누를 수 있게 한다 */
const SHAPES: Record<RegionKey, { d: string }> = {
  gyeongin: { d: 'M25 121.2 L50 133.8 L65 162.5 L67 181.3 L75 203.8 L90 221.3 L115 228.7 L135 225 L160 212.5 L180 193.7 L175 181.3 L175 156.2 L160 125 L140 93.8 L120 58.7 L95 93.8 L70 106.3 Z' },
  seoul: { d: 'M85 146.3 L92 136.3 L103 131.2 L115 132.5 L123 143.7 L120 157.5 L110 165 L97 162.5 L87 157.5 Z' },
  central: { d: 'M90 221.3 L75 225 L50 221.3 L25 237.5 L17 256.2 L35 275 L40 293.8 L55 302.5 L65 331.2 L73 343.8 L105 337.5 L135 328.8 L165 337.5 L190 343.8 L200 331.2 L205 300 L210 262.5 L240 237.5 L265 215 L290 208.8 L300 207.5 L300 193.7 L290 162.5 L270 125 L250 81.2 L230 33.8 L215 52.5 L175 53.7 L120 58.7 L140 93.8 L160 125 L175 156.2 L175 181.3 L180 193.7 L160 212.5 L135 225 L115 228.7 Z' },
  eastGangwon: { d: 'M241 16.3 L230 33.8 L250 81.2 L270 125 L290 162.5 L300 193.7 L300 207.5 L315 206.2 L341 212.5 L325 175 L310 150 L295 118.8 L265 75 L250 37.5 Z' },
  jeolla: { d: 'M73 343.8 L55 387.5 L50 418.8 L40 450 L40 493.8 L50 537.5 L60 556.3 L95 543.8 L130 531.2 L155 518.7 L175 503.8 L195 481.3 L180 462.5 L175 431.3 L170 393.7 L190 343.8 L165 337.5 L135 328.8 L105 337.5 Z' },
  gyeongsang: { d: 'M195 481.3 L235 487.5 L265 487.5 L285 462.5 L310 458.8 L330 431.3 L345 400 L355 356.3 L363 333.8 L345 331.2 L347 281.2 L347 237.5 L341 212.5 L315 206.2 L300 207.5 L290 208.8 L265 215 L240 237.5 L210 262.5 L205 300 L200 331.2 L190 343.8 L170 393.7 L175 431.3 L180 462.5 Z' },
};
const DRAW_ORDER: RegionKey[] = ['gyeongin', 'central', 'eastGangwon', 'jeolla', 'gyeongsang', 'seoul'];

/** 한 권역 안의 도 경계 — 지도처럼 읽히게 옅게만 긋는다 (충북|강원 영서) */
const PROVINCE_LINES = 'M180 193.7 L210 193.7 L235 206.2 L265 215';
const JEJU = 'M20 636.3 L35 648.7 L65 645 L95 633.8 L100 617.5 L80 605 L50 611.2 L25 621.2 Z';

export function RegionMap({ value, onChange, lang, children, className }: {
  value: RegionKey;
  onChange: (value: RegionKey) => void;
  lang: Lang;
  /** 지도 옆에 세로로 놓을 권역 버튼 (범례 겸 키보드 입력) */
  children?: ReactNode;
  className?: string;
}) {
  const ko = lang === 'ko';
  return (
    // 입력칸과 같은 카드(rounded-2xl · slate-200 테두리 · 흰 바탕). 왼쪽 지도, 오른쪽 권역 버튼.
    // 카드가 좁으면(휴대폰) 버튼 글자가 세 줄로 꺾이므로 지도 아래로 버튼을 내린다
    <div className={cn('@container flex flex-1', className)}>
    <div className="grid w-full grid-cols-1 items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 @sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <svg viewBox="0 0 400 665" role="img" aria-label={ko ? `행사 지역 지도 — ${REGIONS.find((r) => r.key === value)?.label.ko} 선택됨` : `Event region map — ${REGIONS.find((r) => r.key === value)?.label.en}`}
        className="mx-auto h-auto max-h-[236px] w-full overflow-visible" data-testid="region-map" data-region={value}>
        {DRAW_ORDER.map((key) => {
          const selected = key === value;
          return (
            // 지도 면은 마우스 전용 보조 입력 — 같은 선택을 옆의 라디오가 키보드로 받는다
            <path key={key} d={SHAPES[key].d} data-region-shape={key} onClick={() => onChange(key)}
              className={cn('cursor-pointer stroke-white transition-colors duration-200 motion-reduce:transition-none [stroke-linejoin:round]', key === 'seoul' ? '[stroke-width:2]' : '[stroke-width:3]',
                selected ? 'fill-teal-500' : 'fill-slate-200 hover:fill-teal-100')} />
          );
        })}
        <path d={PROVINCE_LINES} fill="none" className="pointer-events-none stroke-white/70 [stroke-dasharray:4_5] [stroke-width:1.5]" />
        {/* 운영하지 않는 섬 — 제주, 울릉도·독도 */}
        <path d={JEJU} className="fill-slate-100 stroke-slate-300 [stroke-dasharray:3_3] [stroke-width:1.5]" />
        <text x="118" y="632" aria-hidden="true" className="select-none fill-slate-400 text-[24px]">{ko ? '제주' : 'Jeju'}</text>
        <circle cx="382" cy="150" r="5" className="fill-slate-100 stroke-slate-300 [stroke-width:1.5]" />
        <circle cx="396" cy="170" r="2.5" className="fill-slate-300" />
      </svg>
      {children}
    </div>
    </div>
  );
}
