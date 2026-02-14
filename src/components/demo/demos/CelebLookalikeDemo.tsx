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

const FACE_SHAPES = [
  { id: 'oval', label: '계란형', vx: 50, vy: 55, rx: 38, ry: 50, isRect: false, isHeart: false },
  { id: 'round', label: '둥근형', vx: 50, vy: 50, rx: 44, ry: 44, isRect: false, isHeart: false },
  { id: 'square', label: '각진형', vx: 50, vy: 50, rx: 0, ry: 0, isRect: true, isHeart: false },
  { id: 'heart', label: '하트형', vx: 50, vy: 52, rx: 0, ry: 0, isRect: false, isHeart: true },
  { id: 'oblong', label: '긴형', vx: 50, vy: 55, rx: 32, ry: 55, isRect: false, isHeart: false },
] as const;

const FEATURES = [
  { id: 'eyes', emoji: '\uD83D\uDC40', label: '눈', desc: '깊고 매력적인 눈매' },
  { id: 'nose', emoji: '\uD83D\uDC43', label: '코', desc: '뚜렷한 콧날' },
  { id: 'lips', emoji: '\uD83D\uDC44', label: '입술', desc: '매력적인 입술 라인' },
  { id: 'jawline', emoji: '\uD83D\uDDFF', label: '턱라인', desc: '선명한 페이스라인' },
] as const;

const VIBES = [
  { id: 'cute', emoji: '\uD83D\uDC30', label: '큐트', desc: '사랑스럽고 밝은 에너지', from: 'from-pink-400', to: 'to-rose-300' },
  { id: 'cool', emoji: '\uD83D\uDE0E', label: '시크', desc: '도도하고 세련된 카리스마', from: 'from-slate-500', to: 'to-zinc-700' },
  { id: 'elegant', emoji: '\uD83E\uDDA2', label: '우아', desc: '고급스럽고 기품 있는 무드', from: 'from-amber-200', to: 'to-rose-300' },
  { id: 'charismatic', emoji: '\uD83D\uDD25', label: '카리스마', desc: '강렬하고 압도적인 존재감', from: 'from-red-500', to: 'to-orange-600' },
] as const;

type ResultKey = 'idol-visual' | 'actor-chic' | 'nation-sweetheart' | 'hiphop-icon'
  | 'action-star' | 'model-face' | 'classic-beauty' | 'runway-model';

const RESULTS: Record<ResultKey, {
  name: string; traits: string[]; desc: string;
  scores: { face: number; feature: number; vibe: number };
}> = {
  'idol-visual': { name: '아이돌 비주얼', traits: ['균형 잡힌 이목구비', '맑은 피부톤', '사랑스러운 매력', '무대 위 존재감'], desc: '카메라가 사랑하는 완벽한 비율의 비주얼! K-POP 아이돌 센터를 닮은 화사한 매력이 돋보입니다.', scores: { face: 92, feature: 88, vibe: 95 } },
  'actor-chic': { name: '배우 시크', traits: ['깊은 눈매', '시크한 분위기', '카메라 장악력', '분위기 전환 능력'], desc: '어떤 장르든 소화하는 배우형 비주얼! 깊이 있는 눈빛과 시크한 무드가 스크린을 지배합니다.', scores: { face: 87, feature: 91, vibe: 89 } },
  'nation-sweetheart': { name: '국민 첫사랑', traits: ['동안 외모', '밝은 미소', '친근한 매력', '호감형 얼굴'], desc: '보는 것만으로도 미소 짓게 되는 국민 첫사랑 타입! 누구에게나 사랑받는 친근한 매력의 소유자.', scores: { face: 89, feature: 85, vibe: 93 } },
  'hiphop-icon': { name: '힙합 아이콘', traits: ['개성 강한 분위기', '자신감 넘치는 표정', '트렌디한 무드', 'swag'], desc: '무대를 지배하는 힙한 카리스마! 자신만의 스타일로 트렌드를 이끄는 아이콘형 비주얼.', scores: { face: 85, feature: 87, vibe: 94 } },
  'action-star': { name: '액션 스타', traits: ['강인한 인상', '선명한 턱라인', '파워풀한 존재감', '신뢰감'], desc: '강렬한 카리스마로 액션 장르를 지배하는 타입! 듬직한 인상과 파워풀한 무드가 매력입니다.', scores: { face: 90, feature: 86, vibe: 92 } },
  'model-face': { name: '모델 페이스', traits: ['뚜렷한 이목구비', '균형 잡힌 골격', '포토제닉', '시선 집중'], desc: '런웨이를 걸으면 모든 시선이 향하는 모델형 비주얼! 어떤 각도에서도 빛나는 뚜렷한 이목구비.', scores: { face: 91, feature: 93, vibe: 88 } },
  'classic-beauty': { name: '클래식 뷰티', traits: ['단아한 분위기', '우아한 눈빛', '고급스러운 무드', '시대를 초월한 매력'], desc: '시대를 초월하는 클래식 뷰티! 단아하고 우아한 분위기가 고급스러운 매력을 발산합니다.', scores: { face: 88, feature: 90, vibe: 96 } },
  'runway-model': { name: '런웨이 모델', traits: ['독특한 비율', '아티스틱한 무드', '하이패션 감성', '특별한 존재감'], desc: '하이패션 브랜드가 찾는 독특한 매력의 소유자! 개성 있는 비율과 아티스틱한 무드가 런웨이를 빛냅니다.', scores: { face: 86, feature: 89, vibe: 91 } },
};

/* ── Config ─────────────────────────────────────────────── */

const config: DemoConfig = {
  id: 'celeb-lookalike',
  targetSlug: 'ai-celeb-lookalike',
  industryId: 'entertainment' as IndustryId,
  analyzeEmoji: '\uD83C\uDF1F',
  analyzeDurationMs: 3000,
  steps: [
    {
      id: 'faceShape',
      titleKey: '얼굴형을 선택해 주세요',
      subtitleKey: '거울을 보고 가장 비슷한 형태를 골라주세요',
      canProceed: (a) => !!a['faceShape'],
    },
    {
      id: 'feature',
      titleKey: '가장 자신 있는 이목구비는?',
      subtitleKey: '주변에서 칭찬받는 부분을 골라주세요',
      canProceed: (a) => !!a['feature'],
    },
    {
      id: 'vibe',
      titleKey: '당신에게서 느껴지는 분위기는?',
      subtitleKey: '친구들이 말하는 당신의 첫인상은?',
      canProceed: (a) => !!a['vibe'],
    },
  ],
};

/* ── Face Shape SVG ────────────────────────────────────── */

function FaceShapeSvg({ shape }: { shape: (typeof FACE_SHAPES)[number] }) {
  return (
    <svg viewBox="0 0 100 110" className="h-16 w-16" fill="none">
      {shape.isRect ? (
        <rect
          x="14" y="10" width="72" height="80" rx="14"
          stroke="currentColor" strokeWidth="2.5"
        />
      ) : shape.isHeart ? (
        <path
          d="M50 95 C20 65 8 45 14 28 C20 12 35 10 50 26 C65 10 80 12 86 28 C92 45 80 65 50 95Z"
          stroke="currentColor" strokeWidth="2.5"
        />
      ) : (
        <ellipse
          cx={shape.vx} cy={shape.vy} rx={shape.rx} ry={shape.ry}
          stroke="currentColor" strokeWidth="2.5"
        />
      )}
    </svg>
  );
}

/* ── Step 1 : Face Shape ───────────────────────────────── */

function StepFaceShape({ answers, onUpdate }: DemoStepProps) {
  const selected = answers['faceShape'] as string | undefined;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {FACE_SHAPES.map((s) => (
        <motion.button
          key={s.id}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => onUpdate('faceShape', s.id)}
          className={cn(
            'flex flex-col items-center gap-3 rounded-2xl border p-4 transition-colors',
            selected === s.id
              ? 'border-teal-400 bg-teal-500/10 text-teal-400'
              : 'border-slate-700 bg-slate-900/50 text-slate-500 hover:border-slate-600',
          )}
        >
          <FaceShapeSvg shape={s} />
          <span className="text-sm font-semibold text-slate-200">{s.label}</span>
        </motion.button>
      ))}
    </div>
  );
}

/* ── Step 2 : Feature ──────────────────────────────────── */

function StepFeature({ answers, onUpdate }: DemoStepProps) {
  const selected = answers['feature'] as string | undefined;
  return (
    <div className="grid grid-cols-2 gap-4">
      {FEATURES.map((f) => (
        <motion.button
          key={f.id}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => onUpdate('feature', f.id)}
          className={cn(
            'flex flex-col items-center gap-2 rounded-2xl border p-5 transition-colors',
            selected === f.id
              ? 'border-teal-400 bg-teal-500/10'
              : 'border-slate-700 bg-slate-900/50 hover:border-slate-600',
          )}
        >
          <span className="text-3xl">{f.emoji}</span>
          <p className="text-base font-semibold text-slate-100">{f.label}</p>
          <p className="text-xs text-slate-400">{f.desc}</p>
        </motion.button>
      ))}
    </div>
  );
}

/* ── Step 3 : Vibe ─────────────────────────────────────── */

function StepVibe({ answers, onUpdate }: DemoStepProps) {
  const selected = answers['vibe'] as string | undefined;
  return (
    <div className="grid grid-cols-2 gap-4">
      {VIBES.map((v) => (
        <motion.button
          key={v.id}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => onUpdate('vibe', v.id)}
          className={cn(
            'relative overflow-hidden rounded-2xl border p-5 text-left transition-colors',
            selected === v.id
              ? 'border-teal-400 ring-2 ring-teal-400/40'
              : 'border-slate-700 hover:border-slate-600',
          )}
        >
          <div className={cn('absolute inset-0 bg-gradient-to-br opacity-30', v.from, v.to)} />
          <div className="relative flex flex-col items-center gap-2 text-center">
            <span className="text-3xl">{v.emoji}</span>
            <p className="text-base font-semibold text-white">{v.label}</p>
            <p className="text-xs text-slate-300">{v.desc}</p>
          </div>
        </motion.button>
      ))}
    </div>
  );
}

/* ── Compute Result ────────────────────────────────────── */

function computeResult(answers: DemoAnswers): string {
  const face = answers['faceShape'] as string | undefined;
  const vibe = answers['vibe'] as string | undefined;

  if (face === 'oval') return vibe === 'cute' ? 'idol-visual' : 'actor-chic';
  if (face === 'round') return vibe === 'cute' ? 'nation-sweetheart' : 'hiphop-icon';
  if (face === 'square') return vibe === 'charismatic' ? 'action-star' : 'model-face';
  if (face === 'heart') return vibe === 'elegant' ? 'classic-beauty' : 'idol-visual';
  if (face === 'oblong') return vibe === 'elegant' ? 'runway-model' : 'actor-chic';
  return 'idol-visual';
}

/* ── Score Bar ─────────────────────────────────────────── */

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-300">{label}</span>
        <span className="font-semibold" style={{ color }}>{value}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}, ${color}cc)` }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ type: 'spring', stiffness: 60, damping: 14, delay: 0.3 }}
        />
      </div>
    </div>
  );
}

/* ── Result Component ──────────────────────────────────── */

function ResultComponent({ resultKey, onRestart, pillarColor }: DemoResultProps) {
  const data = RESULTS[resultKey as ResultKey] ?? RESULTS['idol-visual'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center gap-8 text-center"
    >
      <p className="text-sm font-medium tracking-widest text-slate-400 uppercase">
        당신의 셀럽 닮은꼴
      </p>

      <h2 className="text-3xl font-bold" style={{ color: pillarColor }}>
        {data.name}
      </h2>

      <p className="max-w-sm text-sm leading-relaxed text-slate-300">{data.desc}</p>

      {/* Score bars */}
      <div className="w-full max-w-sm space-y-4">
        <ScoreBar label="얼굴형 일치도" value={data.scores.face} color={pillarColor} />
        <ScoreBar label="이목구비 유사도" value={data.scores.feature} color={pillarColor} />
        <ScoreBar label="분위기 매칭" value={data.scores.vibe} color={pillarColor} />
      </div>

      {/* Traits */}
      <div>
        <p className="mb-3 text-xs font-semibold tracking-wide text-slate-400 uppercase">
          공통 특성
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {data.traits.map((t) => (
            <span
              key={t}
              className="rounded-full border border-slate-700 bg-slate-800/60 px-3 py-1 text-xs text-slate-300"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRestart}
          className="rounded-xl border border-slate-700 px-6 py-3 text-sm font-medium text-slate-300 transition-colors hover:border-slate-500"
        >
          다시 진단하기
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="rounded-xl px-6 py-3 text-sm font-semibold text-white"
          style={{ backgroundColor: pillarColor }}
        >
          체험 상담 신청
        </motion.button>
      </div>
    </motion.div>
  );
}

/* ── Export ─────────────────────────────────────────────── */

const CelebLookalikeDemo: DemoModule = {
  config,
  StepComponents: [StepFaceShape, StepFeature, StepVibe],
  ResultComponent,
  computeResult,
};

export default CelebLookalikeDemo;
