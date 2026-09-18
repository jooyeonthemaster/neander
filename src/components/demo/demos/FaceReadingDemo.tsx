'use client';

import { motion } from 'motion/react';
import type { DemoAnswers, DemoResultProps } from '@/types/demo';
import {
  FACE_POINTS,
  InfoGrid,
  Panel,
  ProcessedPhoto,
  ResultShell,
  ScoreBars,
  answersSeed,
  cameraStep,
  choiceStep,
  clamp,
  defineDemo,
  getCapture,
  getChoice,
  seededInt,
  seededPick,
  type PhotoLook,
} from '../kit';

/* ── Data ──────────────────────────────────────────────── */

type FaceType = 'moon' | 'tiger' | 'crane' | 'deer' | 'dragon' | 'owl';

const FACE_TYPES: Record<FaceType, { name: string; emoji: string; desc: string; keywords: string[]; match: FaceType }> = {
  moon: {
    name: '복을 부르는 보름달상',
    emoji: '🌕',
    desc: '둥글고 원만한 기운이 사람과 재물을 함께 끌어당기는 관상이에요. 어디서든 분위기를 편안하게 만드는 힘이 있어요.',
    keywords: ['원만함', '인복', '포용력'],
    match: 'tiger',
  },
  tiger: {
    name: '앞장서는 호랑이상',
    emoji: '🐯',
    desc: '또렷한 눈빛과 힘 있는 턱선에 리더의 기운이 담겨 있어요. 결정적인 순간에 판을 이끄는 타입이에요.',
    keywords: ['추진력', '카리스마', '결단력'],
    match: 'deer',
  },
  crane: {
    name: '고고한 학상',
    emoji: '🪶',
    desc: '가늘고 긴 선이 섬세한 감각을 드러내요. 기획·예술처럼 안목이 필요한 일에서 특히 빛나요.',
    keywords: ['섬세함', '안목', '품격'],
    match: 'owl',
  },
  deer: {
    name: '맑은 눈의 사슴상',
    emoji: '🦌',
    desc: '맑은 눈매와 부드러운 인상이 첫 만남부터 신뢰를 줘요. 주변에 좋은 사람이 모이는 타입이에요.',
    keywords: ['다정함', '신뢰', '공감력'],
    match: 'moon',
  },
  dragon: {
    name: '큰 뜻을 품은 용상',
    emoji: '🐉',
    desc: '시원한 이마와 곧은 중심선이 큰 그릇을 뜻해요. 늦게 피어도 크게 피는 대기만성형이에요.',
    keywords: ['포부', '대기만성', '배짱'],
    match: 'crane',
  },
  owl: {
    name: '지혜로운 부엉이상',
    emoji: '🦉',
    desc: '차분한 눈매와 단정한 입매에서 깊은 생각이 느껴져요. 한 번 믿으면 끝까지 함께하는 참모형이에요.',
    keywords: ['통찰력', '신중함', '꾸준함'],
    match: 'dragon',
  },
};

const TYPE_ORDER: FaceType[] = ['moon', 'tiger', 'crane', 'deer', 'dragon', 'owl'];

type FeatureKey = 'forehead' | 'eyes' | 'nose' | 'lips' | 'chin';

const FEATURES: {
  key: FeatureKey;
  label: string;
  palace: string;
  points: { x: number; y: number }[];
  side: 'left' | 'right';
  readings: { head: string; text: string }[];
}[] = [
  {
    key: 'forehead',
    label: '이마',
    palace: '관록궁',
    points: [FACE_POINTS.forehead],
    side: 'right',
    readings: [
      { head: '넓고 시원한 이마', text: '생각의 폭이 넓고 초년운이 밝아요. 새 일을 시작할 때 윗사람의 도움이 따라요.' },
      { head: '둥글고 매끈한 이마', text: '머리 회전이 빠르고 아이디어가 샘솟아요. 기획하는 일에서 두각을 나타내요.' },
      { head: '반듯하고 단정한 이마', text: '원칙을 지키는 성실함이 보여요. 차곡차곡 쌓아 올려 인정받는 타입이에요.' },
    ],
  },
  {
    key: 'eyes',
    label: '눈',
    palace: '감찰관',
    points: [FACE_POINTS.eyeL, FACE_POINTS.eyeR],
    side: 'left',
    readings: [
      { head: '또렷하고 맑은 눈', text: '눈빛에 힘이 있어 첫인상이 강렬해요. 사람을 알아보는 안목이 뛰어나요.' },
      { head: '부드럽게 휘는 눈매', text: '웃을 때 눈이 먼저 웃는 호감형이에요. 사람을 통해 복이 들어와요.' },
      { head: '깊고 차분한 눈매', text: '감정을 쉽게 흔들리지 않는 신중함이 있어요. 중요한 순간의 판단력이 좋아요.' },
    ],
  },
  {
    key: 'nose',
    label: '코',
    palace: '재백궁',
    points: [FACE_POINTS.nose],
    side: 'right',
    readings: [
      { head: '곧게 뻗은 콧대', text: '자존감과 추진력이 강해요. 스스로 재물을 일구는 자수성가형 코예요.' },
      { head: '도톰한 콧방울', text: '재물을 담는 곳간이 넉넉한 코예요. 들어온 돈을 잘 지키는 알뜰한 운이에요.' },
      { head: '균형 잡힌 코', text: '얼굴의 중심이 안정돼 중년운이 탄탄해요. 꾸준히 불어나는 재물운이에요.' },
    ],
  },
  {
    key: 'lips',
    label: '입',
    palace: '출납관',
    points: [FACE_POINTS.lips],
    side: 'left',
    readings: [
      { head: '살짝 올라간 입꼬리', text: '긍정 에너지가 넘쳐 말에 복이 붙어요. 말 한마디로 기회를 만드는 타입이에요.' },
      { head: '단정한 입매', text: '말에 신뢰가 실려 약속을 잘 지키는 사람으로 보여요. 협상 자리에서 강해요.' },
      { head: '도톰한 입술', text: '정이 많고 표현이 풍부해요. 먹을 복과 사람 복이 함께 따라요.' },
    ],
  },
  {
    key: 'chin',
    label: '턱',
    palace: '지각',
    points: [FACE_POINTS.chin],
    side: 'right',
    readings: [
      { head: '둥근 턱선', text: '말년운이 편안하고 주변 사람을 품는 힘이 있어요. 가정운이 좋아요.' },
      { head: '힘 있는 턱', text: '끈기와 실행력이 강해요. 한번 마음먹은 일은 끝까지 해내요.' },
      { head: '갸름한 턱선', text: '감각이 섬세하고 변화에 빨리 적응해요. 흐름을 읽는 눈이 있어요.' },
    ],
  },
];

const MARKER_COLORS = ['#f59e0b', '#38bdf8', '#34d399', '#f472b6', '#a78bfa'];

type FortuneId = 'wealth' | 'love' | 'career' | 'health';

const FORTUNES: Record<
  FortuneId,
  { label: string; emoji: string; desc: string; texts: [string, string, string]; items: string[] }
> = {
  wealth: {
    label: '재물운',
    emoji: '💰',
    desc: '돈이 모이는 흐름',
    texts: [
      '코의 재백궁이 튼튼해 돈이 모이는 흐름이에요. 크게 벌이기보다 꾸준히 모을 때 복이 더 커져요.',
      '들어오는 만큼 나가는 흐름이지만 새는 곳은 없어요. 작은 저축 습관 하나가 곳간을 두 배로 키워요.',
      '지금은 씨앗을 심는 시기예요. 배움과 경험에 쓰는 돈이 나중에 큰 재물로 돌아와요.',
    ],
    items: ['황금색 지갑', '작은 저금통', '동전 키링'],
  },
  love: {
    label: '연애운',
    emoji: '💘',
    desc: '인연과 설렘',
    texts: [
      '눈가의 도화 기운이 활짝 살아 있어요. 새로운 모임에 나가면 좋은 인연을 만날 확률이 높아요.',
      '은은하게 스며드는 인연운이에요. 오래 알던 사람에게서 뜻밖의 설렘이 찾아올 수 있어요.',
      '지금은 나를 가꾸면 인연이 따라오는 시기예요. 웃는 얼굴이 가장 강력한 부적이에요.',
    ],
    items: ['분홍 손수건', '향기 좋은 핸드크림', '꽃 한 송이'],
  },
  career: {
    label: '직업운',
    emoji: '💼',
    desc: '일과 성장',
    texts: [
      '이마의 관록궁이 밝게 빛나요. 맡은 일에서 인정받고 반가운 승진·이직 소식이 들려올 수 있어요.',
      '차근차근 실력이 쌓이는 흐름이에요. 지금 배우는 것이 곧 나만의 무기가 돼요.',
      '방향을 다듬는 준비의 시기예요. 새 프로젝트에 손을 들면 숨은 재능이 드러나요.',
    ],
    items: ['새 노트', '파란 볼펜', '가죽 명함 지갑'],
  },
  health: {
    label: '건강운',
    emoji: '🍀',
    desc: '몸과 마음 컨디션',
    texts: [
      '턱과 입가의 혈색이 좋아 기초 체력이 탄탄해요. 가벼운 산책 습관이 운을 더 끌어올려요.',
      '컨디션이 안정적인 흐름이에요. 물 한 잔과 스트레칭이 활력을 채워줘요.',
      '잠깐 쉬어가라는 신호예요. 충분한 잠과 따뜻한 차 한 잔이 최고의 보약이에요.',
    ],
    items: ['텀블러', '초록 식물', '편안한 운동화'],
  },
};

const FORTUNE_ORDER: FortuneId[] = ['wealth', 'love', 'career', 'health'];
const LUCKY_COLORS = ['골드', '로즈 핑크', '스카이 블루', '민트 그린', '라벤더', '코랄'];

/* ── Reading ──────────────────────────────────────────── */

function read(answers: DemoAnswers) {
  const capture = getCapture(answers, 'face');
  // 같은 얼굴이면 같은 풀이가 나오도록 사진 시드를 쓴다
  const seed = capture?.seed ?? answersSeed(answers);
  const warmth = capture?.stats.warmth ?? 50;
  const brightness = capture?.stats.brightness ?? 55;

  const featureIdx = FEATURES.map((f) => seededInt(seed, `feature-${f.key}`, 0, f.readings.length - 1));
  const typeIndex = (featureIdx[1]! * 2 + featureIdx[4]! + (warmth >= 50 ? 1 : 0) + seededInt(seed, 'type', 0, 5)) % 6;
  const type = TYPE_ORDER[typeIndex]!;

  const scores = Object.fromEntries(
    FORTUNE_ORDER.map((id) => [id, seededInt(seed, `fortune-${id}`, 64, 93) + (brightness > 60 ? 2 : 0)])
  ) as Record<FortuneId, number>;
  const total = Math.round(FORTUNE_ORDER.reduce((s, id) => s + scores[id], 0) / FORTUNE_ORDER.length + 3);
  const balance = clamp(82 + seededInt(seed, 'balance', 0, 15), 0, 98);
  const harmony = seededInt(seed, 'harmony', 3, 5);

  return { seed, type, featureIdx, scores, total, balance, harmony };
}

/* ── Photo overlay ─────────────────────────────────────── */

const LOOK: PhotoLook = {
  adjust: { saturation: 0.65, sepia: 0.3, contrast: 1.08, brightness: 1.02 },
  tint: { color: '#f5e6c8', alpha: 0.25, blend: 'soft-light' },
  vignette: 0.4,
  grain: 10,
};

function FaceMap() {
  return (
    <>
      <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 300 400" aria-hidden="true">
        {/* 삼정(三停) 격자 + 중심선 */}
        <g stroke="#fde68a" strokeOpacity="0.35" strokeWidth="1" strokeDasharray="3 5">
          {[14, 35, 56, 80].map((y) => (
            <motion.line
              key={y}
              x1="45"
              x2="255"
              y1={y * 4}
              y2={y * 4}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            />
          ))}
          <motion.line
            x1="150"
            x2="150"
            y1="40"
            y2="330"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.9, delay: 0.4 }}
          />
        </g>
        {FEATURES.map((f, i) => {
          const color = MARKER_COLORS[i]!;
          const anchor = f.points[0]!;
          const lineEnd = f.side === 'right' ? 240 : 60;
          return (
            <g key={f.key}>
              <motion.line
                x1={anchor.x * 3}
                y1={anchor.y * 4}
                x2={lineEnd}
                y2={anchor.y * 4}
                stroke={color}
                strokeWidth="1.2"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.9 }}
                transition={{ duration: 0.4, delay: 0.6 + i * 0.15 }}
              />
              {f.points.map((p, j) => (
                <g key={j}>
                  <motion.circle
                    cx={p.x * 3}
                    cy={p.y * 4}
                    fill="none"
                    stroke={color}
                    strokeWidth="1.5"
                    initial={{ r: 4, opacity: 0.9 }}
                    animate={{ r: [4, 14], opacity: [0.9, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity, delay: 0.6 + i * 0.15 }}
                  />
                  <motion.circle
                    cx={p.x * 3}
                    cy={p.y * 4}
                    fill={color}
                    stroke="white"
                    strokeWidth="1.5"
                    initial={{ r: 0 }}
                    animate={{ r: 4.5 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.4 + i * 0.15 }}
                  />
                </g>
              ))}
            </g>
          );
        })}
      </svg>
      {FEATURES.map((f, i) => {
        const anchor = f.points[0]!;
        return (
          <motion.span
            key={f.key}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 + i * 0.15 }}
            className="absolute flex items-center gap-1 whitespace-nowrap rounded-full px-1.5 py-0.5 text-[10px] font-bold text-slate-950 shadow-md"
            style={{
              backgroundColor: MARKER_COLORS[i],
              top: `${anchor.y}%`,
              left: f.side === 'right' ? '80%' : '20%',
              translate: f.side === 'right' ? '0 -50%' : '-100% -50%',
            }}
          >
            <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-slate-950/80 text-[8px] text-white">{i + 1}</span>
            {f.label}
          </motion.span>
        );
      })}
      <span className="absolute bottom-2 left-2 rounded bg-black/55 px-1.5 py-0.5 text-[9px] font-semibold tracking-wider text-amber-200">
        三停 · 五官 MAP
      </span>
    </>
  );
}

/* ── Result ────────────────────────────────────────────── */

function tierOf(score: number): 0 | 1 | 2 {
  return score >= 84 ? 0 : score >= 74 ? 1 : 2;
}

const TIER_LABEL = ['상승운', '안정운', '준비운'] as const;

/** 고른 운(관심운) 집중 풀이 + 행운 아이템 */
function focusReading(answers: DemoAnswers, seed: number, scores: Record<FortuneId, number>) {
  const focusId = (getChoice(answers, 'fortune') as FortuneId | undefined) ?? 'wealth';
  const focus = FORTUNES[focusId] ?? FORTUNES.wealth;
  const focusScore = scores[focusId] ?? 80;
  const tier = tierOf(focusScore);
  const lucky = [
    { label: '행운의 색', value: seededPick(seed, `color-${focusId}`, LUCKY_COLORS) },
    { label: '행운의 숫자', value: String(seededInt(seed, `num-${focusId}`, 1, 9)) },
    { label: '행운 아이템', value: seededPick(seed, `item-${focusId}`, focus.items) },
  ];
  return { focusId, focus, focusScore, tier, lucky };
}

function Result({ answers, onRestart, pillarColor }: DemoResultProps) {
  const capture = getCapture(answers, 'face');
  const { seed, type, featureIdx, scores, total, balance, harmony } = read(answers);
  const face = FACE_TYPES[type];
  const match = FACE_TYPES[face.match];
  const { focusId, focus, focusScore, tier, lucky } = focusReading(answers, seed, scores);

  return (
    <ResultShell
      eyebrow="AI 관상 리포트"
      title={`${face.emoji} ${face.name}`}
      description={face.desc}
      pillarColor={pillarColor}
      onRestart={onRestart}
      restartLabel="다시 관상 보기"
    >
      <div className="flex w-full max-w-md flex-col items-center gap-4 sm:flex-row sm:items-stretch">
        {capture && (
          <ProcessedPhoto
            src={capture.image}
            look={LOOK}
            className="aspect-[3/4] w-60 shrink-0 rounded-2xl border border-amber-200/20"
            alt="관상 분석 사진"
            delayMs={900}
          >
            <FaceMap />
          </ProcessedPhoto>
        )}
        <div className="flex w-full flex-1 flex-col justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 text-left">
          <div>
            <p className="text-xs text-slate-400">관상 총운</p>
            <p className="font-display text-5xl font-extrabold" style={{ color: pillarColor }}>
              {total}
              <span className="ml-1 text-base font-semibold text-slate-500">점</span>
            </p>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>삼정 균형</span>
              <span className="font-semibold text-amber-300">{balance}%</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>오관 조화</span>
              <span className="font-semibold text-amber-300">{harmony} / 5</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-0.5 text-[11px] text-slate-500">성격 키워드</span>
            {face.keywords.map((k) => (
              <span key={k} className="rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ backgroundColor: `${pillarColor}22`, color: pillarColor }}>
                #{k}
              </span>
            ))}
          </div>
        </div>
      </div>

      <Panel title="부위별 관상 풀이">
        <ol className="space-y-4">
          {FEATURES.map((f, i) => {
            const reading = f.readings[featureIdx[i]!]!;
            return (
              <motion.li
                key={f.key}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.12 }}
                className="flex gap-3"
              >
                <span
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-slate-950"
                  style={{ backgroundColor: MARKER_COLORS[i] }}
                >
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {f.label} · {reading.head}
                    <span className="ml-1.5 text-[11px] font-normal text-slate-500">{f.palace}</span>
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-400 [word-break:keep-all]">{reading.text}</p>
                </div>
              </motion.li>
            );
          })}
        </ol>
      </Panel>

      <Panel title="올해의 운세 점수">
        <ScoreBars
          color={pillarColor}
          suffix="점"
          items={FORTUNE_ORDER.map((id) => ({
            label: `${FORTUNES[id].emoji} ${FORTUNES[id].label}${id === focusId ? ' · 관심운' : ''}`,
            value: scores[id],
          }))}
        />
      </Panel>

      <div
        className="w-full max-w-md rounded-2xl border p-5 text-left"
        style={{ borderColor: `${pillarColor}66`, background: `linear-gradient(135deg, ${pillarColor}1f, transparent 70%)` }}
      >
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-white">
            {focus.emoji} {focus.label} 집중 풀이
          </p>
          <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold text-white" style={{ backgroundColor: pillarColor }}>
            {TIER_LABEL[tier]} · {focusScore}점
          </span>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-slate-200 [word-break:keep-all]">{focus.texts[tier]}</p>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          {lucky.map((item) => (
            <div key={item.label} className="rounded-xl bg-slate-950/50 px-2 py-2.5">
              <p className="text-[10px] text-slate-500">{item.label}</p>
              <p className="mt-0.5 text-xs font-semibold text-white [word-break:keep-all]">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <InfoGrid
        items={[
          { emoji: match.emoji, label: '찰떡 궁합 관상', value: match.name, desc: '함께하면 서로의 운을 끌어올려요' },
          { emoji: '🗝️', label: '관상 한마디', value: '웃는 얼굴이 최고의 관상', desc: '표정이 바뀌면 관상도 바뀌어요' },
        ]}
      />

      <p className="max-w-md text-[11px] leading-relaxed text-slate-500 [word-break:keep-all]">
        재미로 보는 관상 풀이예요. 얼굴이 운명을 정하지는 않으니 좋은 말만 기억해 주세요 🙂
      </p>
    </ResultShell>
  );
}

/* ── Export ─────────────────────────────────────────────── */

export default defineDemo({
  config: {
    id: 'face-reading',
    targetSlug: 'ai-face-reading',
    industryId: 'festival',
    analyzeEmoji: '🔮',
    analyzeDurationMs: 3600,
    analyzeImageStepId: 'face',
    analyzeMessages: ['이마와 눈썹의 기운 읽는 중', '눈매와 코의 조화 살피는 중', '입꼬리·턱선 해석 중', '관상 리포트 쓰는 중'],
  },
  steps: [
    cameraStep({
      id: 'face',
      title: '정면 얼굴을 보여주세요',
      subtitle: '편안한 표정으로 카메라를 바라봐 주세요',
      mode: 'face',
      subject: '얼굴',
      scanLabels: ['이마 넓이·높이 측정', '눈매 각도 분석', '콧대·콧방울 비율 계산', '입꼬리 방향 추적', '턱선 윤곽 추출'],
      readouts: (c) => [
        { label: '인상 온도', value: c.stats.warmth >= 50 ? '따뜻한 인상' : '시원한 인상' },
        { label: '안면 대칭도', value: `${88 + (c.seed % 10)}%` },
        { label: '혈색', value: c.stats.brightness > 50 ? '맑고 환함' : '차분함' },
        { label: '분석 부위', value: '오관 5부위' },
      ],
    }),
    choiceStep({
      id: 'fortune',
      title: '가장 궁금한 운은 무엇인가요?',
      subtitle: '선택한 운을 더 자세히 풀어드려요',
      columns: 4,
      options: FORTUNE_ORDER.map((id) => ({
        id,
        emoji: FORTUNES[id].emoji,
        label: FORTUNES[id].label,
        desc: FORTUNES[id].desc,
      })),
    }),
  ],
  computeResult: (answers) => read(answers).type,
  Result,
  print: (answers) => {
    const capture = getCapture(answers, 'face');
    const { seed, type, featureIdx, scores, total, balance, harmony } = read(answers);
    const face = FACE_TYPES[type];
    const { focus, focusScore, tier, lucky } = focusReading(answers, seed, scores);
    return {
      kind: 'receipt',
      eyebrow: 'AI 관상 리포트',
      title: face.name,
      photo: capture ? { src: capture.image } : undefined,
      sections: [
        { type: 'big', title: '관상 총운', text: `${total}점` },
        {
          type: 'rows',
          title: '관상 요약',
          rows: [
            { label: '키워드', value: face.keywords.map((k) => `#${k}`).join(' ') },
            { label: '삼정 균형', value: `${balance}%` },
            { label: '오관 조화', value: `${harmony} / 5` },
            { label: '찰떡 궁합', value: FACE_TYPES[face.match].name },
          ],
        },
        {
          type: 'rows',
          title: '부위별 풀이',
          rows: FEATURES.map((f, i) => ({ label: f.label, value: f.readings[featureIdx[i]!]!.head })),
        },
        {
          type: 'bars',
          title: '올해의 운세',
          bars: FORTUNE_ORDER.map((id) => ({ label: FORTUNES[id].label, value: scores[id] })),
        },
        { type: 'text', title: `${focus.label} · ${TIER_LABEL[tier]} ${focusScore}점`, text: focus.texts[tier] },
        { type: 'rows', title: '행운 포인트', rows: lucky },
      ],
      footer: '웃는 얼굴이 최고의 관상이에요',
    };
  },
});
