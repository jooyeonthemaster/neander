'use client';

import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import type { IndustryId } from '@/data/experiences';
import type {
  DemoAnswers,
  DemoConfig,
  DemoModule,
  DemoStepProps,
  DemoResultProps,
} from '@/types/demo';

/* ── Data ──────────────────────────────────────────────── */

const DESTINATIONS = [
  { id: 'city', emoji: '\u{1F3D9}\uFE0F', label: '도시', desc: '화려한 도시의 에너지', gradient: 'from-slate-700 to-blue-900' },
  { id: 'nature', emoji: '\u{1F332}', label: '자연', desc: '자연 속의 힐링', gradient: 'from-emerald-700 to-green-900' },
  { id: 'culture', emoji: '\u{1F3DB}\uFE0F', label: '문화', desc: '역사와 예술의 감동', gradient: 'from-amber-700 to-orange-900' },
  { id: 'beach', emoji: '\u{1F3D6}\uFE0F', label: '해변', desc: '바다와 태양의 여유', gradient: 'from-cyan-600 to-blue-800' },
  { id: 'adventure', emoji: '\u{1F9D7}', label: '모험', desc: '스릴 넘치는 도전', gradient: 'from-red-700 to-orange-800' },
] as const;

const PACES = [
  { id: 'packed', emoji: '\u23F0', label: '빡빡한 일정', desc: '하루에 5곳 이상! 놓치는 건 못 참아' },
  { id: 'balanced', emoji: '\u2696\uFE0F', label: '균형잡힌', desc: '적당히 보고 적당히 쉬기' },
  { id: 'slow', emoji: '\u{1F40C}', label: '슬로우 트래블', desc: '한 곳에서 오래 머물며 느끼기' },
] as const;

const MUST_HAVES = [
  { id: 'food', emoji: '\u{1F35C}', label: '맛집 탐방' },
  { id: 'photo', emoji: '\u{1F4F8}', label: '인생샷' },
  { id: 'shopping', emoji: '\u{1F6CD}\uFE0F', label: '쇼핑' },
  { id: 'local', emoji: '\u{1F3AD}', label: '로컬 체험' },
] as const;

type ResultKey =
  | 'urban-explorer' | 'city-flaneur' | 'nature-wanderer' | 'culture-pilgrim'
  | 'beach-soul' | 'coastal-drifter' | 'adrenaline-junkie' | 'trailblazer';

interface ResultData {
  name: string; emoji: string; destination: string; tip: string;
  packing: string[]; desc: string;
}

const RESULTS: Record<ResultKey, ResultData> = {
  'urban-explorer': {
    name: '어반 익스플로러', emoji: '\u{1F303}', destination: '도쿄 & 뉴욕',
    tip: '구글맵에 가고 싶은 곳을 미리 저장해 두세요. 효율적인 동선이 핵심!',
    packing: ['편한 운동화', '보조배터리', '폴딩 에코백'],
    desc: '도시의 모든 것을 경험하고 싶은 탐험가! 효율적인 동선으로 숨겨진 명소까지 정복합니다.',
  },
  'city-flaneur': {
    name: '시티 플라뇌르', emoji: '\u{1F6B6}', destination: '파리 & 리스본',
    tip: '계획 없이 걸어보세요. 골목에서 만나는 예상치 못한 발견이 최고의 여행입니다.',
    packing: ['가죽 노트', '필름 카메라', '편안한 로퍼'],
    desc: '느린 걸음으로 도시의 감성을 흡수하는 플라뇌르! 일상처럼 여행하는 것이 당신의 스타일.',
  },
  'nature-wanderer': {
    name: '네이처 원더러', emoji: '\u{1F33F}', destination: '뉴질랜드 & 스위스',
    tip: '국립공원 연간 패스를 확인해 보세요. 자연은 아침이 가장 아름답습니다.',
    packing: ['트레킹 부츠', '경량 방수 재킷', '쌍안경'],
    desc: '자연 속에서 진정한 자유를 느끼는 방랑자! 산과 숲이 당신에게 최고의 힐링을 선물합니다.',
  },
  'culture-pilgrim': {
    name: '컬처 필그림', emoji: '\u{1FAFE}', destination: '로마 & 교토',
    tip: '현지 가이드 투어를 추천해요. 역사적 맥락을 알면 감동이 배가 됩니다.',
    packing: ['여행 가이드북', '접이식 우산', '스케치북'],
    desc: '역사와 문화의 깊이를 탐구하는 순례자! 박물관과 유적지에서 시간을 초월한 감동을 느낍니다.',
  },
  'beach-soul': {
    name: '비치 소울', emoji: '\u{1F41A}', destination: '몰디브 & 발리',
    tip: '해먹에 누워 책 한 권. 아무것도 안 하는 게 최고의 여행이에요.',
    packing: ['선크림 SPF50', '해먹', '블루투스 스피커'],
    desc: '바다가 부르면 떠나는 해변의 영혼! 파도 소리와 함께하는 느긋한 시간이 삶을 충전합니다.',
  },
  'coastal-drifter': {
    name: '코스탈 드리프터', emoji: '\u26F5', destination: '산토리니 & 아말피',
    tip: '해안 드라이브 코스를 찾아보세요. 바다를 따라 달리는 로드트립은 최고!',
    packing: ['스노클링 장비', '드론', '방수 파우치'],
    desc: '해안선을 따라 자유롭게 떠도는 여행자! 새로운 해변을 발견하는 것이 인생의 즐거움입니다.',
  },
  'adrenaline-junkie': {
    name: '아드레날린 정키', emoji: '\u{1FA82}', destination: '퀸즈타운 & 코스타리카',
    tip: '현지 어드벤처 투어를 미리 예약하세요. 인기 액티비티는 금방 마감됩니다!',
    packing: ['액션캠', '스포츠 선글라스', '드라이핏 의류'],
    desc: '스릴과 도전을 사랑하는 모험가! 번지점프든 래프팅이든, 심장이 뛰는 곳에 당신이 있습니다.',
  },
  trailblazer: {
    name: '트레일블레이저', emoji: '\u{1F9ED}', destination: '파타고니아 & 네팔',
    tip: '체력 관리가 핵심! 출발 전 한 달간 트레이닝을 추천합니다.',
    packing: ['65L 백팩', '헤드랜턴', '에너지바'],
    desc: '아무도 가지 않은 길을 개척하는 탐험가! 극한의 환경에서도 빛나는 도전 정신의 소유자.',
  },
};

/* ── Config ─────────────────────────────────────────────── */

const config: DemoConfig = {
  id: 'travel-style',
  targetSlug: 'ai-travel-style',
  industryId: 'tourism' as IndustryId,
  analyzeEmoji: '\u2708\uFE0F',
  analyzeDurationMs: 2500,
  steps: [
    {
      id: 'destination',
      titleKey: '끌리는 여행지 분위기는?',
      subtitleKey: '가장 마음이 가는 곳을 골라주세요',
      canProceed: (a) => typeof a['destination'] === 'string',
    },
    {
      id: 'pace',
      titleKey: '여행 페이스는?',
      subtitleKey: '여행 일정을 어떻게 짜시나요?',
      canProceed: (a) => typeof a['pace'] === 'string',
    },
    {
      id: 'mustHave',
      titleKey: '여행에서 빠질 수 없는 건?',
      subtitleKey: '최대 2개를 골라주세요',
      canProceed: (a) => Array.isArray(a['mustHave']) && (a['mustHave'] as string[]).length > 0,
    },
  ],
};

/* ── Step 1 : Destination Vibe ─────────────────────────── */

function StepDestination({ answers, onUpdate }: DemoStepProps) {
  const selected = answers['destination'] as string | undefined;
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      {DESTINATIONS.map((d, i) => {
        const isSel = selected === d.id;
        const isLast = i === DESTINATIONS.length - 1;
        return (
          <motion.button
            key={d.id}
            type="button"
            onClick={() => onUpdate('destination', d.id)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            animate={isSel ? { scale: 1.03 } : { scale: 1, opacity: selected && !isSel ? 0.5 : 1 }}
            className={cn(
              'relative flex flex-col justify-end overflow-hidden rounded-2xl h-32 p-4 text-left transition-all duration-300',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
              `bg-gradient-to-br ${d.gradient}`,
              isSel ? 'shadow-2xl ring-2 ring-white/50' : 'shadow-lg',
              isLast && 'col-span-2 sm:col-span-1',
            )}
            aria-pressed={isSel}
          >
            <span className="absolute top-3 left-3 text-2xl drop-shadow-md">{d.emoji}</span>
            <div className="relative z-10" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
              <p className="text-lg font-bold text-white">{d.label}</p>
              <p className="text-xs text-white/80">{d.desc}</p>
            </div>
            {isSel && (
              <motion.div
                layoutId="dest-check"
                className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-blue-600 shadow"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

/* ── Step 2 : Travel Pace ──────────────────────────────── */

function StepPace({ answers, onUpdate }: DemoStepProps) {
  const selected = answers['pace'] as string | undefined;
  return (
    <div className="space-y-4">
      {PACES.map((p) => {
        const isSel = selected === p.id;
        return (
          <motion.button
            key={p.id}
            type="button"
            onClick={() => onUpdate('pace', p.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              'flex w-full items-center gap-4 rounded-2xl border p-5 text-left transition-all duration-300',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
              isSel
                ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10'
                : 'border-slate-700 bg-slate-900/50 hover:border-slate-600 hover:bg-slate-800/50',
            )}
            aria-pressed={isSel}
          >
            <span className="text-3xl shrink-0">{p.emoji}</span>
            <div className="min-w-0">
              <p className={cn('text-base font-semibold', isSel ? 'text-blue-300' : 'text-slate-100')}>
                {p.label}
              </p>
              <p className="mt-0.5 text-sm text-slate-400 leading-snug">{p.desc}</p>
            </div>
            {isSel && (
              <motion.div
                layoutId="pace-check"
                className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white shadow"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

/* ── Step 3 : Must-Have ────────────────────────────────── */

function StepMustHave({ answers, onUpdate }: DemoStepProps) {
  const selected = (answers['mustHave'] as string[] | undefined) ?? [];

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onUpdate('mustHave', selected.filter((s) => s !== id));
    } else if (selected.length < 2) {
      onUpdate('mustHave', [...selected, id]);
    }
  };

  return (
    <div>
      <p className="mb-4 text-right text-sm font-medium text-slate-400">
        {selected.length}/2
      </p>
      <div className="grid grid-cols-2 gap-4">
        {MUST_HAVES.map((item) => {
          const active = selected.includes(item.id);
          return (
            <motion.button
              key={item.id}
              type="button"
              onClick={() => toggle(item.id)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className={cn(
                'flex flex-col items-center justify-center gap-3 rounded-2xl border p-6 transition-all duration-300',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
                active
                  ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10'
                  : 'border-slate-700 bg-slate-900/50 hover:border-slate-600 hover:bg-slate-800/50',
              )}
              aria-pressed={active}
            >
              <span className="text-4xl">{item.emoji}</span>
              <span className={cn('text-sm font-medium', active ? 'text-blue-300' : 'text-slate-300')}>
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Compute Result ────────────────────────────────────── */

function computeResult(answers: DemoAnswers): string {
  const dest = answers['destination'] as string | undefined;
  const pace = answers['pace'] as string | undefined;

  if (dest === 'city' && pace === 'packed') return 'urban-explorer';
  if (dest === 'city' && pace === 'slow') return 'city-flaneur';
  if (dest === 'city') return 'urban-explorer';
  if (dest === 'nature') return 'nature-wanderer';
  if (dest === 'culture') return 'culture-pilgrim';
  if (dest === 'beach' && pace === 'slow') return 'beach-soul';
  if (dest === 'beach') return 'coastal-drifter';
  if (dest === 'adventure' && pace === 'packed') return 'adrenaline-junkie';
  if (dest === 'adventure') return 'trailblazer';
  return 'urban-explorer';
}

/* ── Result Component ──────────────────────────────────── */

function TravelResult({ resultKey, onRestart, pillarColor }: DemoResultProps) {
  const data = RESULTS[resultKey as ResultKey] ?? RESULTS['urban-explorer'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center gap-7 text-center"
    >
      {/* Emoji */}
      <span className="text-6xl">{data.emoji}</span>

      {/* Label */}
      <p className="text-sm font-medium tracking-widest text-slate-400 uppercase">
        당신의 여행 페르소나
      </p>

      {/* Persona name */}
      <h2 className="text-3xl font-bold" style={{ color: pillarColor }}>
        {data.name}
      </h2>

      {/* Description */}
      <p className="max-w-sm text-sm leading-relaxed text-slate-300">{data.desc}</p>

      {/* Ideal destination */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-sm rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-950/50 to-slate-900/50 p-5"
      >
        <p className="mb-2 text-xs font-semibold tracking-wide text-blue-400 uppercase">
          이상적인 여행지
        </p>
        <p className="text-lg font-bold text-white">{data.destination}</p>
      </motion.div>

      {/* Travel tip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="space-y-2"
      >
        <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
          여행 팁
        </p>
        <p className="mx-auto max-w-sm text-sm text-slate-400 leading-relaxed">{data.tip}</p>
      </motion.div>

      {/* Packing style */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-3 w-full"
      >
        <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
          패킹 스타일
        </p>
        <div className="flex justify-center gap-3">
          {data.packing.map((item) => (
            <div
              key={item}
              className="flex-1 max-w-[120px] rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-3 text-center"
            >
              <p className="text-xs font-medium text-slate-300">{item}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.65 }}
        className="flex gap-3 pt-2"
      >
        <button
          type="button"
          onClick={onRestart}
          className="rounded-xl border border-slate-700 px-6 py-3 text-sm font-medium text-slate-300 transition-colors hover:border-slate-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          다시 진단하기
        </button>
        <button
          type="button"
          className="rounded-xl px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: pillarColor }}
        >
          체험 상담 신청
        </button>
      </motion.div>
    </motion.div>
  );
}

/* ── Export ─────────────────────────────────────────────── */

const TravelStyleDemo: DemoModule = {
  config,
  StepComponents: [StepDestination, StepPace, StepMustHave],
  ResultComponent: TravelResult,
  computeResult,
};

export default TravelStyleDemo;
