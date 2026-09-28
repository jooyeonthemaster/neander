'use client';

import { motion } from 'motion/react';
import { withParticle } from '@/lib/korean';
import type { DemoAnswers, DemoResultProps } from '@/types/demo';
import {
  FACE_POINTS,
  InfoGrid,
  Panel,
  ProcessedPhoto,
  ResultShell,
  answersSeed,
  cameraStep,
  choiceStep,
  clamp,
  defineDemo,
  getCapture,
  getChoice,
  requestDemoAi,
  seededInt,
  seededPick,
  type PhotoLook,
} from '../kit';
import { FACE_FEATURE_KEYS, FACE_FORTUNE_IDS, FACE_TYPE_IDS } from '@/data/demo-ai/face-reading';
import type { AiFaceReading, FaceFortuneId, FaceType } from '@/data/demo-ai/face-reading';
import { isNotObserved } from '@/data/demo-ai/photo-reading';

/* ── Data ──────────────────────────────────────────────── */

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

const TYPE_ORDER: FaceType[] = [...FACE_TYPE_IDS];

const FEATURES: {
  key: (typeof FACE_FEATURE_KEYS)[number];
  label: string;
  palace: string;
  points: { x: number; y: number }[];
  side: 'left' | 'right';
  readings: { head: string; text: string }[];
}[] = [
  {
    key: 'forehead',
    label: '이마',
    palace: '관록궁(전통 관상에서 이마를 부르는 말)',
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
    palace: '감찰관(전통 관상에서 눈을 부르는 말)',
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
    palace: '재백궁(전통 관상에서 코를 부르는 말)',
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
    palace: '출납관(전통 관상에서 입을 부르는 말)',
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
    palace: '지각(전통 관상에서 턱을 부르는 말)',
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

type FortuneId = FaceFortuneId;

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

const FORTUNE_ORDER: FortuneId[] = [...FACE_FORTUNE_IDS];
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

/* ── AI 결과 ──────────────────────────────────────────── */

function isAiFace(v: unknown): v is AiFaceReading {
  const o = v as AiFaceReading | null;
  return (
    !!o && o.observed === true && (FACE_TYPE_IDS as readonly string[]).includes(o.type) && typeof o.summary === 'string'
    && Array.isArray(o.keywords) && !!o.features && FACE_FEATURE_KEYS.every((k) => typeof o.features[k]?.head === 'string')
    && !!o.scores && FACE_FORTUNE_IDS.every((id) => typeof o.scores[id] === 'number') && typeof o.focusText === 'string' && !!o.lucky
  );
}

/** 화면·출력물이 그리는 관상 — AI 결과가 있으면 그것, 없으면(실패·얼굴 미인식) 사진 시드 기반 고정 풀이 */
function faceView(answers: DemoAnswers, generated: unknown) {
  const base = read(answers);
  const ai = isAiFace(generated) ? generated : null;
  const choices = (answers.experienceProfile ?? {}) as Record<string, string>;
  const roles: Record<string, FaceType> = { explorer: 'dragon', keeper: 'deer', maker: 'owl' };
  const type = ai?.type ?? roles[choices.role] ?? 'moon';
  const face = FACE_TYPES[type];
  const scores = ai ? ai.scores : base.scores;
  const total = ai
    ? Math.round(FORTUNE_ORDER.reduce((s, id) => s + scores[id], 0) / FORTUNE_ORDER.length + 3)
    : base.total;
  const focusBase = focusReading(answers, base.seed, scores);
  return {
    type,
    face,
    desc: ai?.summary ?? `${face.emoji} ${withParticle(face.name, '을/를')} 모티프로 고른 창작 이야기입니다. 사진은 초상을 꾸미는 데 사용하며 성격이나 미래의 근거가 아닙니다.`,
    keywords: ai?.keywords ?? face.keywords,
    readings: FEATURES.map((f) => ai?.features[f.key] ?? ({ head: `${f.label}에 더한 이야기`, text: '사진의 윤곽 위에 고전적인 상징을 얹었습니다. 이 부위의 모양으로 성격이나 능력을 판단하지 않으며, 직접 고른 역할이 이야기의 중심입니다.' })),
    scores,
    total: Math.min(total, 99),
    balance: ai?.balance ?? base.balance,
    harmony: ai?.harmony ?? base.harmony,
    ...focusBase,
    focusText: ai?.focusText ?? `${withParticle(focusBase.focus.label, '을/를')} 소재로 한 오늘의 작은 질문입니다. 지금 바꿀 수 있는 행동 한 가지를 정하고 5분만 시도해 보세요. 결과를 예언하는 대신 직접 만드는 장면을 남겨보세요.`,
    lucky: ai
      ? [
          { label: '행운의 색', value: ai.lucky.color },
          { label: '행운의 숫자', value: String(ai.lucky.number) },
          { label: '행운 아이템', value: ai.lucky.item },
        ]
      : focusBase.lucky,
    motto: ai?.motto ?? '웃는 얼굴이 최고의 관상',
    ai: !!ai,
    /** 카메라로 찍었는데 AI가 얼굴을 못 찾은 경우 — 다시 찍기 안내 */
    retake: isNotObserved(generated) && getCapture(answers, 'face')?.source !== 'sample',
  };
}

function Result({ answers, onRestart, pillarColor, generated }: DemoResultProps) {
  const capture = getCapture(answers, 'face');
  const v = faceView(answers, generated);
  const { face, focus, lucky } = v;
  const match = FACE_TYPES[face.match];

  return (
    <ResultShell
      eyebrow="상징으로 읽는 창작 초상"
      title={`${face.emoji} ${face.name}`}
      description={v.desc}
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
            alt="상징 그래픽을 더한 초상 사진"
            delayMs={900}
          >
            <FaceMap />
          </ProcessedPhoto>
        )}
        <div className="flex w-full flex-1 flex-col justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 text-left">
          <div>
            <p className="text-xs text-slate-400">오늘의 이야기 모티프</p>
            <p className="mt-2 text-xl font-bold" style={{ color: pillarColor }}>{face.name}</p>
          </div>
          <p className="text-xs leading-relaxed text-slate-400">전통적 상징을 빌린 캐릭터 이야기입니다. 외모로 성격이나 운명을 판단하지 않습니다.</p>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-0.5 text-[11px] text-slate-500">캐릭터 키워드</span>
            {v.keywords.map((k) => (
              <span key={k} className="rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ backgroundColor: `${pillarColor}22`, color: pillarColor }}>
                #{k}
              </span>
            ))}
          </div>
        </div>
      </div>

      <Panel title="초상에 담은 상징 이야기">
        <ol className="space-y-4">
          {FEATURES.map((f, i) => {
            const reading = v.readings[i]!;
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

      <div
        className="w-full max-w-md rounded-2xl border p-5 text-left"
        style={{ borderColor: `${pillarColor}66`, background: `linear-gradient(135deg, ${pillarColor}1f, transparent 70%)` }}
      >
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-white">
            {focus.emoji} {focus.label} 집중 풀이
          </p>
          <span className="demo-accent-surface rounded-full px-2.5 py-0.5 text-[11px] font-bold text-white" style={{ backgroundColor: pillarColor }}>
            오락용 이야기
          </span>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-slate-200 [word-break:keep-all]">{v.focusText}</p>
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
          { emoji: match.emoji, label: '함께 등장할 캐릭터', value: match.name, desc: '이야기 속 상징을 조합한 창작 설정이에요' },
          { emoji: '🗝️', label: '오늘의 한마디', value: v.motto, desc: '마음에 드는 문장을 가볍게 간직하세요' },
        ]}
      />

      {v.ai && <p className="text-xs text-slate-500">사진을 참고하고 직접 고른 주제로 쓴 창작 이야기예요</p>}
      {v.retake && (
        <p className="max-w-md text-xs text-slate-500 [word-break:keep-all]">
          얼굴이 또렷하게 보이지 않아 기본 풀이를 보여드렸어요. 밝은 곳에서 정면으로 다시 찍으면 초상 사진을 더 선명하게 담을 수 있어요.
        </p>
      )}

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
    analyzeMessages: ['초상과 선택한 주제 확인 중', '전통적 상징으로 창작 이야기 구성 중', '사진 카드와 응원 문장 준비 중'],
  },
  steps: [
    cameraStep({
      id: 'face',
      title: '정면 얼굴을 보여주세요',
      subtitle: '편안한 표정으로 카메라를 바라봐 주세요',
      mode: 'face',
      subject: '얼굴',
      scanLabels: ["초상 사진 준비","선택한 이야기 확인","상징 모티프 준비","창작 카드 구성"],
      readouts: () => [{"label":"사진","value":"초상 카드에 사용"},{"label":"이야기","value":"오락용 상징 해석"}],
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
  // AI 결과가 오면 결과 화면·출력물은 AI가 고른 유형으로 그린다 (resultKey는 고정 결과용)
  computeResult: (answers) => read(answers).type,
  Result,
  generate: (answers) => {
    const photo = getCapture(answers, 'face')?.image;
    if (!photo) return Promise.resolve(null);
    return requestDemoAi<unknown>(
      'face-reading',
      { experienceProfile: answers.experienceProfile, photo, fortune: getChoice(answers, 'fortune') ?? 'wealth' },
      { validate: (d): d is unknown => isAiFace(d) || isNotObserved(d) }
    );
  },
  print: (answers, _resultKey, generated) => {
    const capture = getCapture(answers, 'face');
    const { face, readings, keywords, focus, focusText, lucky, motto } = faceView(
      answers,
      generated
    );
    return {
      kind: 'receipt',
      eyebrow: '오락용 창작 초상 카드',
      title: face.name,
      photo: capture ? { src: capture.image } : undefined,
      sections: [
        { type: 'text', text: '전통적 상징을 차용한 창작입니다. 외모로 성격이나 실제 미래를 판단하지 않습니다.' },
        {
          type: 'rows',
          title: '관상 요약',
          rows: [
            { label: '키워드', value: keywords.map((k) => `#${k}`).join(' ') },
            { label: '이야기 속 동료', value: FACE_TYPES[face.match].name },
          ],
        },
        {
          type: 'rows',
          title: '부위별 풀이',
          rows: FEATURES.map((f, i) => ({ label: `${f.label} · ${f.palace}`, value: readings[i]!.head })),
        },
        { type: 'text', title: `${focus.label} · 창작 이야기`, text: focusText },
        { type: 'rows', title: '행운 포인트', rows: lucky },
      ],
      footer: motto,
    };
  },
});
