'use client';

import { motion } from 'motion/react';
import type { DemoAnswers, DemoResultProps } from '@/types/demo';
import {
  ProcessedPhoto,
  ResultShell,
  TraitChips,
  cameraStep,
  choiceStep,
  clamp,
  defineDemo,
  getCapture,
  getChoices,
  seededInt,
  type CaptureData,
  type PhotoLook,
} from '../kit';

/* ── Data ──────────────────────────────────────────────── */

type EraId = 'e1920' | 'e1950' | 'e1970' | 'e1990' | 'y2k' | 'e2080';

interface Era {
  year: string;
  start: number;
  label: string;
  emoji: string;
  desc: string;
  swatch: string;
  blurb: string;
  hair: string;
  makeup: string;
  item: string;
  look: PhotoLook;
}

/* 초상 모드 좌표 — 입 50/44, 눈 44/31 · 56/31 */
const ERAS: Record<EraId, Era> = {
  e1920: {
    year: '1920s',
    start: 1920,
    label: '재즈 에이지',
    emoji: '🎷',
    desc: '플래퍼 드레스와 찰스턴',
    swatch: 'linear-gradient(135deg, #1c1917, #a16207 60%, #fde68a)',
    blurb: '코르셋에서 벗어난 여성들이 무릎길이 드레스로 찰스턴을 추던 시대예요.',
    hair: '핑거 웨이브 단발',
    makeup: '가는 아치 눈썹 + 다크 체리 립',
    item: '프린지 드레스 · 진주 롱 네크리스',
    look: {
      adjust: { saturation: 0, contrast: 1.25, sepia: 0.9, brightness: 1.02 },
      paints: [{ x: 50, y: 44, rx: 4.5, ry: 1.8, color: '#3b0a0a', alpha: 0.5, blend: 'multiply' }],
      grain: 38,
      vignette: 0.55,
    },
  },
  e1950: {
    year: '1950s',
    start: 1950,
    label: '레트로 핀업',
    emoji: '💃',
    desc: '폴카 도트와 스윙 스커트',
    swatch: 'linear-gradient(135deg, #fecdd3, #ef4444 55%, #7dd3fc)',
    blurb: '전후의 풍요 속에서 잘록한 허리와 풍성한 스커트가 거리를 채웠어요.',
    hair: '볼륨 핀업 컬',
    makeup: '캣 아이 라인 + 레드 립',
    item: '폴카 도트 스윙 드레스',
    look: {
      adjust: { saturation: 1.25, contrast: 1.05, brightness: 1.06, warmth: 0.08 },
      paints: [
        { x: 50, y: 44, rx: 4.5, ry: 1.9, color: '#d0142c', alpha: 0.55, blend: 'multiply' },
        { x: 43, y: 40, rx: 5, ry: 3.5, color: '#f472b6', alpha: 0.4, blend: 'soft-light' },
        { x: 57, y: 40, rx: 5, ry: 3.5, color: '#f472b6', alpha: 0.4, blend: 'soft-light' },
      ],
      tint: { color: '#fbcfe8', alpha: 0.25, blend: 'soft-light' },
      vignette: 0.2,
    },
  },
  e1970: {
    year: '1970s',
    start: 1970,
    label: '디스코 피버',
    emoji: '🪩',
    desc: '미러볼과 벨보텀',
    swatch: 'linear-gradient(135deg, #7c2d12, #f59e0b 55%, #fde047)',
    blurb: '미러볼 아래 반짝이는 소재와 나팔바지가 밤의 무대를 지배했어요.',
    hair: '페더 컷 · 볼륨 웨이브',
    makeup: '블루 섀도 + 글로시 립',
    item: '벨보텀 팬츠 · 플랫폼 슈즈',
    look: {
      adjust: { contrast: 0.88, saturation: 0.8, warmth: 0.35, brightness: 1.05 },
      paints: [
        { x: 44, y: 29.5, rx: 4, ry: 1.6, color: '#38bdf8', alpha: 0.45, blend: 'soft-light' },
        { x: 56, y: 29.5, rx: 4, ry: 1.6, color: '#38bdf8', alpha: 0.45, blend: 'soft-light' },
      ],
      tint: { color: '#f59e0b', alpha: 0.35, blend: 'soft-light' },
      grain: 22,
      vignette: 0.3,
    },
  },
  e1990: {
    year: '1990s',
    start: 1990,
    label: '힙합 스트리트',
    emoji: '🧢',
    desc: '오버사이즈와 스냅백',
    swatch: 'linear-gradient(135deg, #1e3a8a, #0891b2 55%, #facc15)',
    blurb: '스트리트 문화가 처음으로 패션의 중심 무대에 올라온 시대예요.',
    hair: '스냅백 · 브레이드',
    makeup: '브라운 립 라이너 + 매트 스킨',
    item: '오버사이즈 데님 · 바람막이',
    look: {
      adjust: { contrast: 1.25, saturation: 1.1, brightness: 0.98 },
      paints: [{ x: 50, y: 44, rx: 4.5, ry: 1.8, color: '#7c2d12', alpha: 0.4, blend: 'multiply' }],
      tint: { color: '#0891b2', alpha: 0.15, blend: 'soft-light' },
      grain: 16,
    },
  },
  y2k: {
    year: 'Y2K',
    start: 2000,
    label: '밀레니엄 팝',
    emoji: '💿',
    desc: '반짝이와 로우라이즈',
    swatch: 'linear-gradient(135deg, #f0abfc, #c4b5fd 50%, #67e8f9)',
    blurb: '밀레니엄의 설렘이 반짝이 소재와 로우라이즈 진으로 폭발했어요.',
    hair: '집게핀 반묶음',
    makeup: '글리터 섀도 + 립글로스',
    item: '로우라이즈 진 · 베이비 티',
    look: {
      adjust: { saturation: 1.35, brightness: 1.12, contrast: 1.05 },
      paints: [
        { x: 50, y: 44, rx: 4, ry: 1.6, color: '#fb7185', alpha: 0.45, blend: 'multiply' },
        { x: 50, y: 44.4, rx: 2.4, ry: 0.7, color: '#ffffff', alpha: 0.5, blend: 'screen' },
      ],
      tint: { color: '#f0abfc', alpha: 0.3, blend: 'overlay' },
    },
  },
  e2080: {
    year: '2080',
    start: 2080,
    label: '퓨처 사이버',
    emoji: '🚀',
    desc: '스마트 패브릭과 AR 바이저',
    swatch: 'linear-gradient(135deg, #020617, #6366f1 50%, #a5f3fc)',
    blurb: 'AI가 체온과 기분에 맞춰 옷의 색과 형태를 바꾸는 미래예요.',
    hair: '메탈릭 실버 숏컷',
    makeup: '홀로그램 하이라이터',
    item: '스마트 패브릭 수트 · AR 바이저',
    look: {
      adjust: { contrast: 1.15 },
      effect: { kind: 'duotone', dark: '#0b1026', light: '#a5f3fc' },
      tint: { color: '#a855f7', alpha: 0.22, blend: 'screen' },
      vignette: 0.35,
    },
  },
};

const ERA_IDS = Object.keys(ERAS) as EraId[];

/* ── Analysis ─────────────────────────────────────────── */

/** 촬영 이미지 톤으로 시대별 싱크로율을 만든다 — 같은 사진이면 같은 결과 */
function synchro(capture: CaptureData | undefined, eras: EraId[]) {
  const s = capture?.stats ?? { brightness: 55, warmth: 55, saturation: 40, contrast: 40 };
  const seed = capture?.seed ?? 3;
  const bias: Record<EraId, number> = {
    e1920: s.contrast * 0.12,
    e1950: (s.warmth - 50) * 0.15 + 3,
    e1970: (s.warmth - 50) * 0.2,
    e1990: (s.contrast - 40) * 0.1 + 2,
    y2k: s.saturation * 0.1,
    e2080: (100 - s.warmth) * 0.08,
  };
  return eras
    .map((id) => ({ id, score: Math.round(clamp(78 + bias[id] + seededInt(seed, id, -6, 8), 71, 98)) }))
    .sort((a, b) => b.score - a.score);
}

function sortedEras(answers: DemoAnswers): EraId[] {
  const picked = getChoices(answers, 'eras').filter((id): id is EraId => id in ERAS);
  const list = picked.length ? picked : (['e1920', 'e1970', 'e2080'] as EraId[]);
  return [...list].sort((a, b) => ERAS[a].start - ERAS[b].start);
}

/** 시간 여행 구간 문구 — 포스터와 출력물이 같이 쓴다 */
function timelineOf(eras: EraId[]): string {
  const first = ERAS[eras[0]!];
  const last = ERAS[eras[eras.length - 1]!];
  return eras.length > 1 ? `${first.start} → ${last.start} · ${last.start - first.start}년의 시간 여행` : `${first.start}년대로의 시간 여행`;
}

/* ── Era frames (사진 위 오버레이) ──────────────────────── */

/* 아래 정적 SVG 조각은 90×120(3:4) 좌표 — 화면 오버레이와 출력물 오버레이가 함께 쓴다 */

/** 1920s 아르데코 금색 모서리 + 필름 스크래치 */
function Deco1920({ seed }: { seed: number }) {
  return (
    <>
      <g stroke="#e9c46a" strokeWidth="1.2" fill="none">
        <path d="M4 16 V4 H16 M8 12 V8 H12" />
        <path d="M86 16 V4 H74 M82 12 V8 H78" />
        <path d="M4 104 V116 H16 M8 108 V112 H12" />
        <path d="M86 104 V116 H74 M82 108 V112 H78" />
      </g>
      <line x1={20 + (seed % 30)} y1="0" x2={22 + (seed % 30)} y2="120" stroke="#fff" strokeOpacity="0.25" strokeWidth="0.4" />
      <line x1={60 + (seed % 17)} y1="0" x2={59 + (seed % 17)} y2="120" stroke="#fff" strokeOpacity="0.18" strokeWidth="0.3" />
    </>
  );
}

/** 2080 홀로 그리드 + AR 바이저 */
function Visor2080() {
  return (
    <>
      <defs>
        <linearGradient id="visor" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#22d3ee" stopOpacity="0.75" />
          <stop offset="1" stopColor="#e879f9" stopOpacity="0.75" />
        </linearGradient>
      </defs>
      <g stroke="#67e8f9" strokeOpacity="0.2" strokeWidth="0.3">
        {[20, 40, 60, 80, 100].map((y) => (
          <line key={y} x1="0" y1={y} x2="90" y2={y} />
        ))}
      </g>
      <rect x="29" y="34" width="32" height="6" rx="3" fill="url(#visor)" />
      <text x="4" y="8" fontSize="5" fill="#a5f3fc" fontFamily="monospace">
        ID SYNC
      </text>
    </>
  );
}

/** 네 갈래 반짝이 (✦) */
function Sparkle({ x, y, r, color }: { x: number; y: number; r: number; color: string }) {
  const k = r * 0.22;
  return <path d={`M${x} ${y - r} Q${x + k} ${y - k} ${x + r} ${y} Q${x + k} ${y + k} ${x} ${y + r} Q${x - k} ${y + k} ${x - r} ${y} Q${x - k} ${y - k} ${x} ${y - r} Z`} fill={color} stroke="rgba(0,0,0,0.3)" strokeWidth={r * 0.08} />;
}

/** 출력물용 오버레이 — 화면의 CSS 오버레이(1950·1970·1990·Y2K)를 같은 위치의 정적 SVG로 옮겼다 */
function EraPrintOverlay({ id, seed }: { id: EraId; seed: number }) {
  const mono = 'ui-monospace, Menlo, monospace';
  const shadow = { stroke: 'rgba(0,0,0,0.45)', strokeWidth: 0.6, paintOrder: 'stroke' } as const;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" width={1200} height={1600}>
      <svg viewBox="0 0 90 120" width="300" height="400" preserveAspectRatio="none">
        {id === 'e1920' && <Deco1920 seed={seed} />}
        {id === 'e1950' && (
          <>
            <defs>
              <pattern id="polka" width="5" height="5" patternUnits="userSpaceOnUse">
                <circle cx="2.5" cy="2.5" r="1" fill="#ffffff" />
              </pattern>
            </defs>
            <rect y="108.6" width="90" height="11.4" fill="#ef4444" />
            <rect y="108.6" width="90" height="11.4" fill="url(#polka)" />
          </>
        )}
        {id === 'e1970' && (
          <>
            <defs>
              <radialGradient id="glow-tr" gradientUnits="userSpaceOnUse" cx="90" cy="0" r="150">
                <stop offset="0" stopColor="#fb923c" stopOpacity="0.75" />
                <stop offset="0.45" stopColor="#fb923c" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="glow-bl" gradientUnits="userSpaceOnUse" cx="0" cy="120" r="150">
                <stop offset="0" stopColor="#f43f5e" stopOpacity="0.4" />
                <stop offset="0.4" stopColor="#f43f5e" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="90" height="120" fill="url(#glow-tr)" />
            <rect width="90" height="120" fill="url(#glow-bl)" />
            <Sparkle x={6.5} y={7.5} r={3.6} color="#fef3c7" />
          </>
        )}
        {id === 'e1990' && (
          <>
            <defs>
              <pattern id="scan" width="90" height="2.1" patternUnits="userSpaceOnUse">
                <rect width="90" height="0.6" fill="#000000" fillOpacity="0.14" />
              </pattern>
            </defs>
            <rect width="90" height="120" fill="url(#scan)" />
            <g fontFamily={mono} fontSize="5.7" fontWeight="700" fill="#ffffff" {...shadow}>
              <text x="4.3" y="8.5">▶ PLAY</text>
              <text x="85.7" y="117" textAnchor="end" fontWeight="400">{`SP 0:${19 + (seed % 40)}:96`}</text>
            </g>
          </>
        )}
        {id === 'y2k' && (
          <>
            <Sparkle x={84} y={6.5} r={3.4} color="#ffffff" />
            <Sparkle x={7.5} y={17} r={2.6} color="#fce7f3" />
            <text x="85.7" y="117" textAnchor="end" fontFamily={mono} fontSize="6.4" fontWeight="700" fill="#fb923c" {...shadow}>
              {`'02 08 ${10 + (seed % 19)}`}
            </text>
          </>
        )}
        {id === 'e2080' && <Visor2080 />}
      </svg>
    </svg>
  );
}

function EraOverlay({ id, seed }: { id: EraId; seed: number }) {
  if (id === 'e1920') {
    return (
      <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 90 120" preserveAspectRatio="none" aria-hidden="true">
        <Deco1920 seed={seed} />
      </svg>
    );
  }
  if (id === 'e1950') {
    return (
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-4"
        style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1.4px, transparent 1.6px)', backgroundSize: '7px 7px', backgroundColor: '#ef4444' }}
        aria-hidden="true"
      />
    );
  }
  if (id === 'e1970') {
    return (
      <>
        <div
          className="pointer-events-none absolute inset-0 mix-blend-screen"
          style={{ background: 'radial-gradient(circle at 100% 0%, rgba(251,146,60,0.75), transparent 45%), radial-gradient(circle at 0% 100%, rgba(244,63,94,0.4), transparent 40%)' }}
          aria-hidden="true"
        />
        <span className="pointer-events-none absolute left-1.5 top-1 text-sm text-amber-100 drop-shadow" aria-hidden="true">
          ✦
        </span>
      </>
    );
  }
  if (id === 'e1990') {
    return (
      <>
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.5) 0 1px, transparent 1px 3px)' }}
          aria-hidden="true"
        />
        <span className="absolute left-1.5 top-1 font-mono text-[8px] font-bold text-white drop-shadow">▶ PLAY</span>
        <span className="absolute bottom-1 right-1.5 font-mono text-[8px] text-white drop-shadow">SP 0:{19 + (seed % 40)}:96</span>
      </>
    );
  }
  if (id === 'y2k') {
    return (
      <>
        <span className="pointer-events-none absolute right-1.5 top-1 text-xs text-white drop-shadow" aria-hidden="true">
          ✧
        </span>
        <span className="pointer-events-none absolute left-2 top-5 text-[10px] text-pink-100 drop-shadow" aria-hidden="true">
          ✦
        </span>
        <span className="absolute bottom-1 right-1.5 font-mono text-[9px] font-bold text-orange-400 drop-shadow">&apos;02 08 {10 + (seed % 19)}</span>
      </>
    );
  }
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 90 120" preserveAspectRatio="none" aria-hidden="true">
      <Visor2080 />
    </svg>
  );
}

/* ── Result ────────────────────────────────────────────── */

function Result({ answers, onRestart, pillarColor }: DemoResultProps) {
  const capture = getCapture(answers, 'portrait');
  const eras = sortedEras(answers);
  const ranking = synchro(capture, eras);
  const best = ranking[0]!;
  const scoreOf = (id: EraId) => ranking.find((r) => r.id === id)?.score ?? 80;
  const seed = capture?.seed ?? 3;

  return (
    <ResultShell
      eyebrow="AI 패션 타임머신"
      title={`${ERAS[best.id].year} ${ERAS[best.id].label} 룩이 인생 룩!`}
      description={`고른 ${eras.length}개 시대의 패션·헤어·메이크업을 입혀 시간 여행 타임라인 포스터로 출력했어요.`}
      pillarColor={pillarColor}
      onRestart={onRestart}
      restartLabel="다른 시대로 떠나기"
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md rounded-sm bg-[#f4efe6] p-5 text-left text-stone-900 shadow-[0_24px_60px_rgba(0,0,0,0.55)]"
      >
        <div className="border-b-2 border-stone-900 pb-3">
          <p className="text-[9px] font-bold tracking-[0.35em] text-stone-500">NEANDER FASHION MUSEUM</p>
          <p className="font-display text-2xl font-extrabold leading-tight">MY FASHION TIMELINE</p>
          <p className="mt-0.5 font-mono text-xs text-stone-600">{timelineOf(eras)}</p>
        </div>

        <ol className="relative mt-4 space-y-5 pl-5">
          <span className="absolute bottom-2 left-[5px] top-2 w-px bg-stone-400" aria-hidden="true" />
          {eras.map((id, i) => {
            const era = ERAS[id];
            const isBest = id === best.id;
            return (
              <motion.li
                key={id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.2 }}
                className="relative flex gap-3"
              >
                <span
                  className="absolute -left-5 top-3 h-3 w-3 rounded-full border-2 border-[#f4efe6]"
                  style={{ background: isBest ? pillarColor : '#57534e' }}
                  aria-hidden="true"
                />
                <div className="w-28 shrink-0 sm:w-32">
                  {capture ? (
                    <ProcessedPhoto
                      src={capture.image}
                      look={era.look}
                      className="aspect-[3/4] rounded-sm shadow-md ring-1 ring-stone-900/20"
                      alt={`${era.year} 스타일로 변환한 사진`}
                      delayMs={700 + i * 450}
                    >
                      <EraOverlay id={id} seed={seed} />
                    </ProcessedPhoto>
                  ) : (
                    <div className="aspect-[3/4] rounded-sm" style={{ background: era.swatch }} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2">
                    <p className="font-display text-2xl font-extrabold leading-none">{era.year}</p>
                    {isBest && (
                      <span className="rounded-full px-2 py-0.5 text-[9px] font-bold text-white" style={{ backgroundColor: pillarColor }}>
                        BEST
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs font-semibold text-stone-600">
                    {era.emoji} {era.label} · 싱크로율 {scoreOf(id)}%
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-stone-700 [word-break:keep-all]">{era.blurb}</p>
                  <dl className="mt-2 space-y-0.5 text-[11px] leading-snug text-stone-600">
                    <div className="flex gap-1.5">
                      <dt className="shrink-0 font-bold text-stone-900">헤어</dt>
                      <dd className="[word-break:keep-all]">{era.hair}</dd>
                    </div>
                    <div className="flex gap-1.5">
                      <dt className="shrink-0 font-bold text-stone-900">메이크업</dt>
                      <dd className="[word-break:keep-all]">{era.makeup}</dd>
                    </div>
                    <div className="flex gap-1.5">
                      <dt className="shrink-0 font-bold text-stone-900">아이템</dt>
                      <dd className="[word-break:keep-all]">{era.item}</dd>
                    </div>
                  </dl>
                </div>
              </motion.li>
            );
          })}
        </ol>

        <div className="mt-5 flex items-center justify-between border-t border-stone-300 pt-2 font-mono text-[9px] text-stone-500">
          <span>TIME TRAVEL POSTER</span>
          <span>No.{String(seededInt(seed, 'poster', 1, 9999)).padStart(4, '0')}</span>
        </div>
      </motion.div>

      <TraitChips title="자동 적용된 시대 스타일" items={eras.flatMap((id) => [ERAS[id].hair, ERAS[id].makeup.split(' + ')[0]!])} />
    </ResultShell>
  );
}

/* ── Export ─────────────────────────────────────────────── */

export default defineDemo({
  config: {
    id: 'fashion-timemachine',
    targetSlug: 'ai-fashion-timemachine',
    industryId: 'fashion',
    analyzeEmoji: '⏳',
    analyzeDurationMs: 3800,
    analyzeImageStepId: 'portrait',
    analyzeMessages: ['타임머신 좌표 설정 중', '시대별 의상 고증 불러오는 중', '헤어·메이크업 입히는 중', '타임라인 포스터 인쇄 중'],
  },
  steps: [
    choiceStep({
      id: 'eras',
      title: '어느 시대로 떠나볼까요?',
      subtitle: '최대 3개 시대를 고르면 한 장의 타임라인 포스터로 만들어요',
      columns: 3,
      multi: { min: 1, max: 3 },
      options: ERA_IDS.map((id) => ({
        id,
        emoji: ERAS[id].emoji,
        label: `${ERAS[id].year} ${ERAS[id].label}`,
        desc: ERAS[id].desc,
        swatch: ERAS[id].swatch,
      })),
    }),
    cameraStep({
      id: 'portrait',
      title: '타임머신 포토 스팟에 섰어요',
      subtitle: '셔터를 누르면 3초 뒤 촬영돼요 · 상반신이 보이게 서주세요',
      mode: 'portrait',
      subject: '모습',
      countdown: true,
      scanLabels: ['인물 영역 분리', '헤어 라인·얼굴형 측정', '의상 실루엣 추출', '시대별 스타일 매핑'],
      readouts: (c) => [
        { label: '얼굴형', value: ['계란형', '하트형', '둥근형', '각진형'][c.seed % 4]! },
        { label: '헤어 볼륨', value: c.stats.contrast > 45 ? '풍성' : '차분' },
        { label: '컬러 톤', value: c.stats.warmth > 55 ? '웜' : c.stats.warmth < 45 ? '쿨' : '뉴트럴' },
        { label: '시간 여행', value: '준비 완료' },
      ],
    }),
  ],
  computeResult: (answers) => synchro(getCapture(answers, 'portrait'), sortedEras(answers))[0]!.id,
  Result,
  print: (answers) => {
    const capture = getCapture(answers, 'portrait');
    const eras = sortedEras(answers);
    const best = synchro(capture, eras)[0]!;
    const seed = capture?.seed ?? 3;
    return {
      kind: 'photo',
      // 고른 시대마다 한 칸 (포스터와 같은 연대순)
      photos: capture
        ? eras.map((id) => ({
            src: capture.image,
            look: ERAS[id].look,
            label: `${ERAS[id].year} ${ERAS[id].label}`,
            overlay: <EraPrintOverlay id={id} seed={seed} />,
          }))
        : [],
      title: `인생 룩은 ${ERAS[best.id].year} ${ERAS[best.id].label}`,
      caption: `싱크로율 ${best.score}% · ${timelineOf(eras)}`,
      badge: `BEST ${ERAS[best.id].year}`,
      paper: 'cream',
    };
  },
});
