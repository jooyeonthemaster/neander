'use client';

import { motion } from 'motion/react';
import type { IndustryId } from '@/data/experiences';
import type { DemoAnswers, DemoConfig, DemoModule, DemoResultProps } from '@/types/demo';
import { cameraStep, choiceStep, getCapture, getChoice, requestDemoAi, type PrintSpec } from '../kit';
import { CELEB_FACE_SHAPES, CELEB_FEATURES, CELEB_FIELDS, CELEB_VIBES, type AiCelebLookalike } from '@/data/demo-ai/celeb';
import { isNotObserved } from '@/data/demo-ai/photo-reading';

/* ── Data ──────────────────────────────────────────────── */

const FACE_SHAPES = CELEB_FACE_SHAPES;
const FEATURES = CELEB_FEATURES;
const VIBES = CELEB_VIBES;

type ResultKey = 'idol-visual' | 'actor-chic' | 'nation-sweetheart' | 'hiphop-icon'
  | 'action-star' | 'model-face' | 'classic-beauty' | 'runway-model';

type Scores = { face: number; feature: number; vibe: number };

/** 결과 화면 · 출력물이 같은 순서와 이름으로 보여 주는 3가지 점수 */
const SCORE_ITEMS: { key: keyof Scores; label: string }[] = [
  { key: 'face', label: '얼굴형 참고 지수' },
  { key: 'feature', label: '이목구비 참고 지수' },
  { key: 'vibe', label: '분위기 매칭' },
];

/** AI를 쓸 수 없을 때 보여 주는 기본 유형 */
const RESULTS: Record<ResultKey, {
  name: string; traits: string[]; desc: string;
  scores: Scores;
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

/* ── Steps ─────────────────────────────────────────────── */

const STEPS = [
  cameraStep({
    id: 'face',
    title: '정면 얼굴을 보여주세요',
    subtitle: '실존 인물 대신 헤어·의상·표정에서 셀럽 무드의 영감을 찾아요',
    mode: 'face',
    subject: '얼굴',
    scanLabels: ['촬영 사진 준비', '사진 밝기 확인', '선택한 캐스팅 무드 준비', '스타일 비교 준비'],
    readouts: (c) => [
      { label: '사진 색감', value: c.stats.warmth >= 50 ? '따뜻한 조명' : '차가운 조명' },
      { label: '참고 요소', value: '표정·헤어·스타일' },
    ],
  }),
  choiceStep({
    id: 'field',
    title: '어떤 분야의 무드로 연출할까요?',
    subtitle: '고른 분야에 어울리는 창작 캐스팅 콘셉트를 제안해요',
    columns: 2,
    options: CELEB_FIELDS.map((f) => ({ id: f.id, label: f.label, emoji: f.emoji, desc: f.desc })),
  }),
];

/* ── Config ─────────────────────────────────────────────── */

const config: DemoConfig = {
  id: 'celeb-lookalike',
  targetSlug: 'ai-celeb-lookalike',
  industryId: 'entertainment' as IndustryId,
  analyzeEmoji: '🌟',
  analyzeDurationMs: 3000,
  analyzeMessages: ['선택한 캐스팅 분위기 확인', '헤어·의상·표정의 연출 참고', '셀럽 무드 카드 구성'],
  analyzeImageStepId: 'face',
  steps: STEPS.map((step) => step.meta),
};

/* ── Compute Result ────────────────────────────────────── */

/** AI가 없을 때는 직접 고른 캐스팅 무드로 창작 유형을 정한다. */
function computeResult(answers: DemoAnswers): string {
  const profile = answers.experienceProfile as Record<string, string> | undefined;
  return profile?.castingMood === 'chic' ? 'runway-model' : profile?.castingMood === 'bright' ? 'idol-visual' : 'nation-sweetheart';
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

/* ── Result View ───────────────────────────────────────── */

function lookalikeFor(resultKey: string) {
  return RESULTS[resultKey as ResultKey] ?? RESULTS['idol-visual'];
}

const isScore = (n: unknown) => typeof n === 'number' && n >= 0 && n <= 100;

function isAiLookalike(v: unknown): v is AiCelebLookalike {
  const o = v as AiCelebLookalike | null;
  return !!o && o.observed === true && typeof o.name === 'string' && typeof o.desc === 'string' && !!o.scores
    && isScore(o.scores.face) && isScore(o.scores.feature) && isScore(o.scores.vibe)
    && Array.isArray(o.traits) && Array.isArray(o.celebs)
    && o.celebs.every((c) => typeof c.name === 'string' && isScore(c.similarity) && typeof c.point === 'string');
}

/** 화면·출력물이 그리는 닮은꼴 — AI 결과가 있으면 그것, 없으면 기본 유형 */
interface LookalikeView {
  name: string;
  desc: string;
  scores: Scores;
  traits: string[];
  celebs: AiCelebLookalike['celebs'];
  /** AI가 사진에서 읽은 얼굴형·돋보이는 이목구비·첫인상 (AI 결과에만) */
  reading: { faceShape: string; feature: string; vibe: string } | null;
  photo: string | undefined;
  ai: boolean;
  /** 카메라로 찍었는데 AI가 얼굴을 못 찾은 경우 — 다시 찍기 안내 */
  retake: boolean;
}

function lookalikeView(answers: DemoAnswers, resultKey: string, generated: unknown): LookalikeView {
  const capture = getCapture(answers, 'face');
  if (isAiLookalike(generated)) {
    return {
      name: generated.name,
      desc: generated.desc,
      scores: generated.scores,
      traits: generated.traits,
      celebs: generated.celebs,
      reading: {
        faceShape: FACE_SHAPES.find((f) => f.id === generated.faceShape)?.label ?? '-',
        feature: FEATURES.find((f) => f.id === generated.feature)?.label ?? '-',
        vibe: VIBES.find((v) => v.id === generated.vibe)?.label ?? '-',
      },
      photo: capture?.image,
      ai: true,
      retake: false,
    };
  }
  const d = lookalikeFor(resultKey);
  return {
    name: d.name,
    desc: `직접 고른 캐스팅 분위기로 구성한 ${d.name} 예시예요. 다음 촬영에서 헤어·의상·표정을 바꿔 보며 나에게 편한 연출을 찾아보세요.`,
    scores: d.scores,
    traits: d.traits,
    celebs: [],
    reading: null,
    photo: capture?.image,
    ai: false,
    retake: isNotObserved(generated) && capture?.source !== 'sample',
  };
}

/** 3가지 점수 평균 — 출력물 헤드라인 */
function overallMatch(scores: Scores): number {
  return Math.round(SCORE_ITEMS.reduce((sum, item) => sum + scores[item.key], 0) / SCORE_ITEMS.length);
}

/* ── Result Component ──────────────────────────────────── */

function ResultComponent({ answers, resultKey, onRestart, pillarColor, generated }: DemoResultProps) {
  const data = lookalikeView(answers, resultKey, generated);
  const top = data.celebs[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center gap-8 text-center"
    >
      <p className="text-sm font-medium tracking-widest text-slate-400 uppercase">
        당신의 셀럽 무드 캐스팅
      </p>

      {/* 내 사진 ↔ 가장 닮은 셀럽 */}
      {data.photo && (
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.photo}
            alt="방금 찍은 사진"
            className="h-24 w-24 rounded-full border-2 object-cover"
            style={{ borderColor: pillarColor }}
          />
          {top && (
            <>
              <span className="text-2xl font-bold tabular-nums" style={{ color: pillarColor }}>{top.similarity}%</span>
              <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full border-2 border-dashed border-slate-600 bg-slate-800/60 px-2">
                <span className="text-[10px] text-slate-400">추천 캐스팅 무드</span>
                <span className="text-sm font-bold leading-tight text-white [word-break:keep-all]">{top.name}</span>
              </div>
            </>
          )}
        </div>
      )}

      <h2 className="text-3xl font-bold" style={{ color: pillarColor }}>
        {data.name}
      </h2>

      <p className="max-w-sm text-sm leading-relaxed text-slate-300">{data.desc}</p>

      {/* 닮은 셀럽 TOP 3 — AI 결과에만 있다 */}
      {data.celebs.length > 0 && (
        <div className="w-full max-w-sm">
          <p className="mb-3 text-xs font-semibold tracking-wide text-slate-400 uppercase">
            셀럽 무드 제안 {data.celebs.length}가지
          </p>
          <div className="space-y-2">
            {data.celebs.map((c, i) => (
              <div key={c.name} className="rounded-xl border border-slate-700 bg-slate-800/40 px-4 py-3 text-left">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-100">
                    <span className="mr-1.5 text-slate-500">{i + 1}</span>
                    {c.name}
                  </p>
                  <span className="text-sm font-bold tabular-nums" style={{ color: pillarColor }}>{c.similarity}%</span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: pillarColor }}
                    initial={{ width: 0 }}
                    animate={{ width: `${c.similarity}%` }}
                    transition={{ type: 'spring', stiffness: 60, damping: 14, delay: 0.2 + i * 0.1 }}
                  />
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">{c.point}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="max-w-sm text-xs leading-relaxed text-slate-400">숫자는 스타일 비교를 위한 창작 참고 지수예요. 신원 판별이나 실제 닮을 확률을 의미하지 않아요.</p>
      {/* Score bars */}
      <div className="w-full max-w-sm space-y-4">
        {SCORE_ITEMS.map((item) => (
          <ScoreBar key={item.key} label={item.label} value={data.scores[item.key]} color={pillarColor} />
        ))}
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

      {data.reading && (
        <p className="text-xs text-slate-400">
          AI가 읽은 얼굴 · {data.reading.faceShape} · 돋보이는 {data.reading.feature} · {data.reading.vibe} 무드
        </p>
      )}

      {data.ai && (
        <p className="-mt-4 text-xs text-slate-500">헤어·의상·표정을 참고한 창작 무드예요. 실존 인물과의 닮음이나 신원을 판단하지 않아요.</p>
      )}
      {data.retake && (
        <p className="-mt-4 max-w-sm text-xs text-amber-300/80">
          사진의 연출 요소를 확인하기 어려워 선택한 분위기의 예시를 보여드렸어요. 밝은 곳에서 다시 찍어 무드 카드를 만들어 보세요.
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRestart}
          className="rounded-xl border border-slate-700 px-6 py-3 text-sm font-medium text-slate-300 transition-colors hover:border-slate-500"
        >
          다른 무드로 체험
        </motion.button>
      </div>
    </motion.div>
  );
}

/* ── Print ──────────────────────────────────────────────── */

function getPrint(answers: DemoAnswers, resultKey: string, generated?: unknown): PrintSpec {
  const data = lookalikeView(answers, resultKey, generated);
  const top = data.celebs[0];
  return {
    kind: 'receipt',
    eyebrow: '당신의 셀럽 무드 캐스팅',
    title: data.name,
    sections: [
      { type: 'big', text: top ? `${top.name} ${top.similarity}%` : `${overallMatch(data.scores)}% MATCH` },
      ...(data.celebs.length > 0
        ? [{ type: 'list' as const, title: `셀럽 무드 ${data.celebs.length}가지`, items: data.celebs.map((c) => `${c.name} · 창작 연출값 ${c.similarity}% · ${c.point}`) }]
        : []),
      {
        type: 'bars',
        title: '창작 무드 참고 지수',
        bars: SCORE_ITEMS.map((item) => ({ label: item.label, value: data.scores[item.key] })),
      },
      ...(data.reading
        ? [{
            type: 'rows' as const,
            title: 'AI가 읽은 얼굴',
            rows: [
              { label: '얼굴형', value: data.reading.faceShape },
              { label: '돋보이는 곳', value: data.reading.feature },
              { label: '첫인상', value: data.reading.vibe },
            ],
          }]
        : []),
      { type: 'list', title: '공통 특성', items: data.traits },
      { type: 'text', text: data.desc },
    ],
    footer: '숫자는 창작 스타일 참고 지수이며 신원 판별·실측 확률이 아니에요',
  };
}

/* ── AI 생성 ──────────────────────────────────────────── */

function generate(answers: DemoAnswers): Promise<unknown> {
  const photo = getCapture(answers, 'face')?.image;
  if (!photo) return Promise.resolve(null);
  return requestDemoAi<unknown>(
    config.id,
    { experienceProfile: answers.experienceProfile, photo, field: getChoice(answers, 'field') ?? 'all' },
    { validate: (d): d is unknown => isAiLookalike(d) || isNotObserved(d) }
  );
}

/* ── Export ─────────────────────────────────────────────── */

const CelebLookalikeDemo: DemoModule = {
  config,
  StepComponents: STEPS.map((step) => step.Component),
  ResultComponent,
  computeResult,
  getPrint,
  generate,
};

export default CelebLookalikeDemo;
