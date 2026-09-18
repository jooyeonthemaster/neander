'use client';

import { motion } from 'motion/react';
import type { DemoAnswers, DemoResultProps } from '@/types/demo';
import {
  InfoGrid,
  Panel,
  RadarChart,
  ResultShell,
  answersSeed,
  choiceStep,
  clamp,
  defineDemo,
  getChoice,
  getChoices,
  seededInt,
} from '../kit';

/* ── Data ──────────────────────────────────────────────── */

type Axis = 'floral' | 'citrus' | 'fresh' | 'woody' | 'musk' | 'amber';
type Weights = Partial<Record<Axis, number>>;

const AXES: { id: Axis; label: string }[] = [
  { id: 'floral', label: '플로럴' },
  { id: 'citrus', label: '시트러스' },
  { id: 'fresh', label: '프레시' },
  { id: 'woody', label: '우디' },
  { id: 'musk', label: '머스크' },
  { id: 'amber', label: '앰버' },
];

const SCENT_TYPES: Record<Axis, string> = {
  floral: '꽃잎 같은 로맨티스트',
  citrus: '햇살 같은 에너자이저',
  fresh: '바람 같은 자유 여행자',
  woody: '숲을 닮은 사색가',
  musk: '포근한 코튼 힐러',
  amber: '촛불 같은 매혹가',
};

interface Option {
  id: string;
  label: string;
  desc?: string;
  emoji?: string;
  swatch?: string;
  w: Weights;
}

const PERSONA: Option[] = [
  { id: 'calm', emoji: '🌙', label: '차분한', desc: '혼자만의 시간이 좋아요', w: { musk: 2, woody: 1 } },
  { id: 'passion', emoji: '🔥', label: '열정적인', desc: '하고 싶은 건 바로 해요', w: { amber: 2, citrus: 1 } },
  { id: 'kind', emoji: '🤍', label: '다정한', desc: '주변을 잘 챙겨요', w: { floral: 2, musk: 1 } },
  { id: 'free', emoji: '🍃', label: '자유로운', desc: '즉흥 여행 환영이에요', w: { fresh: 2, citrus: 1 } },
  { id: 'smart', emoji: '📚', label: '지적인', desc: '생각이 깊은 편이에요', w: { woody: 2, amber: 1 } },
  { id: 'playful', emoji: '🎈', label: '장난스러운', desc: '분위기 메이커예요', w: { citrus: 2, floral: 1 } },
];

const PLACES: Option[] = [
  { id: 'forest', emoji: '🌲', label: '비 갠 숲길', desc: '젖은 흙과 초록 잎', w: { fresh: 2, woody: 2 } },
  { id: 'beach', emoji: '🏖️', label: '햇살 가득한 해변', desc: '바닷바람과 레몬에이드', w: { citrus: 2, fresh: 2 } },
  { id: 'library', emoji: '🕰️', label: '오래된 서재', desc: '책장과 가죽 소파', w: { woody: 3, amber: 1 } },
  { id: 'garden', emoji: '🌷', label: '꽃이 핀 정원', desc: '장미와 작약 사이', w: { floral: 3, fresh: 1 } },
  { id: 'jazz', emoji: '🎷', label: '한밤의 재즈 바', desc: '촛불과 위스키', w: { amber: 3, woody: 1 } },
  { id: 'bed', emoji: '🛏️', label: '포근한 이불 속', desc: '갓 세탁한 코튼', w: { musk: 3, floral: 1 } },
];

const SEASONS: Option[] = [
  { id: 'spring', emoji: '🌸', label: '봄', w: { floral: 2, fresh: 1 } },
  { id: 'summer', emoji: '🌊', label: '여름', w: { citrus: 2, fresh: 2 } },
  { id: 'autumn', emoji: '🍂', label: '가을', w: { woody: 2, amber: 1 } },
  { id: 'winter', emoji: '❄️', label: '겨울', w: { amber: 2, musk: 2 } },
];

const COLORS: Option[] = [
  { id: 'pink', label: '파우더 핑크', swatch: 'linear-gradient(135deg, #fde2e8, #f4a7bb)', w: { floral: 2, musk: 1 } },
  { id: 'yellow', label: '시트러스 옐로', swatch: 'linear-gradient(135deg, #fef9c3, #facc15)', w: { citrus: 3 } },
  { id: 'sage', label: '세이지 그린', swatch: 'linear-gradient(135deg, #e3ecd6, #8fae7a)', w: { fresh: 2, woody: 1 } },
  { id: 'ocean', label: '오션 블루', swatch: 'linear-gradient(135deg, #e0f2fe, #38bdf8)', w: { fresh: 2, citrus: 1 } },
  { id: 'burgundy', label: '딥 버건디', swatch: 'linear-gradient(135deg, #b4536a, #4c0519)', w: { amber: 3, floral: 1 } },
  { id: 'beige', label: '샌달우드 베이지', swatch: 'linear-gradient(135deg, #f1e7d8, #b89b77)', w: { woody: 2, musk: 2 } },
];

interface Perfume {
  name: string;
  en: string;
  family: string;
  emoji: string;
  profile: Record<Axis, number>;
  notes: { top: string[]; middle: string[]; base: string[] };
  mood: string;
  keywords: string[];
  colors: [string, string];
}

const PERFUMES: Record<string, Perfume> = {
  petal: {
    name: '페탈 레터',
    en: 'Petal Letter',
    family: '파우더리 플로럴',
    emoji: '🌸',
    profile: { floral: 92, citrus: 30, fresh: 28, woody: 30, musk: 70, amber: 32 },
    notes: { top: ['핑크 페퍼', '리치'], middle: ['불가리안 로즈', '피오니'], base: ['화이트 머스크', '캐시미어 우드'] },
    mood: '손편지에 스민 꽃잎처럼 다정하고 포근한 향이에요.',
    keywords: ['다정한', '로맨틱', '포근한'],
    colors: ['#fbcfe8', '#db2777'],
  },
  sunshine: {
    name: '선샤인 포스트카드',
    en: 'Sunshine Postcard',
    family: '시트러스 콜로뉴',
    emoji: '🍊',
    profile: { floral: 42, citrus: 95, fresh: 55, woody: 30, musk: 28, amber: 18 },
    notes: { top: ['유자', '베르가못', '만다린'], middle: ['네롤리', '오렌지 블라썸'], base: ['베티버', '앰버그리스'] },
    mood: '여름 오후의 햇살을 엽서에 담은 듯 밝고 경쾌한 향이에요.',
    keywords: ['경쾌한', '에너지', '산뜻한'],
    colors: ['#fef08a', '#ea580c'],
  },
  forest: {
    name: '포레스트 애프터 레인',
    en: 'Forest After Rain',
    family: '그린 우디',
    emoji: '🌿',
    profile: { floral: 20, citrus: 35, fresh: 90, woody: 72, musk: 30, amber: 15 },
    notes: { top: ['갈바넘', '바이올렛 잎'], middle: ['무화과 잎', '이끼'], base: ['시더우드', '베티버'] },
    mood: '비 갠 숲길의 젖은 흙과 초록 잎사귀처럼 맑고 차분한 향이에요.',
    keywords: ['차분한', '내추럴', '맑은'],
    colors: ['#bbf7d0', '#15803d'],
  },
  library: {
    name: '라이브러리 누아',
    en: 'Library Noir',
    family: '스모키 우디',
    emoji: '📖',
    profile: { floral: 15, citrus: 18, fresh: 20, woody: 94, musk: 45, amber: 62 },
    notes: { top: ['카다멈', '핑크 페퍼'], middle: ['파피루스', '레더'], base: ['샌달우드', '통카빈'] },
    mood: '오래된 책장과 가죽 소파가 있는 서재처럼 지적이고 깊은 향이에요.',
    keywords: ['지적인', '깊은', '클래식'],
    colors: ['#e7d3b0', '#78350f'],
  },
  bluehour: {
    name: '블루 아워',
    en: 'Blue Hour',
    family: '아쿠아 머스크',
    emoji: '🌊',
    profile: { floral: 35, citrus: 55, fresh: 88, woody: 38, musk: 60, amber: 12 },
    notes: { top: ['씨솔트', '라임'], middle: ['워터 릴리', '로즈마리'], base: ['앰브레트', '드리프트우드'] },
    mood: '해 질 녘 바닷바람처럼 시원하면서도 여운이 긴 향이에요.',
    keywords: ['자유로운', '시원한', '청량한'],
    colors: ['#bae6fd', '#1d4ed8'],
  },
  velvet: {
    name: '벨벳 미드나잇',
    en: 'Velvet Midnight',
    family: '앰버 구르망',
    emoji: '🕯️',
    profile: { floral: 40, citrus: 15, fresh: 10, woody: 52, musk: 55, amber: 96 },
    notes: { top: ['블랙커런트', '사프란'], middle: ['튜베로즈', '자스민'], base: ['바닐라', '앰버', '통카빈'] },
    mood: '재즈 바의 촛불처럼 관능적이고 달콤한 밤의 향이에요.',
    keywords: ['관능적인', '달콤한', '매혹적인'],
    colors: ['#fda4af', '#7f1d1d'],
  },
  cotton: {
    name: '코튼 클라우드',
    en: 'Cotton Cloud',
    family: '클린 머스크',
    emoji: '☁️',
    profile: { floral: 50, citrus: 30, fresh: 48, woody: 22, musk: 95, amber: 28 },
    notes: { top: ['알데하이드', '배'], middle: ['코튼 플라워', '아이리스'], base: ['화이트 머스크', '앰브레트'] },
    mood: '갓 세탁한 이불처럼 깨끗하고 포근한 살냄새 향이에요.',
    keywords: ['깨끗한', '포근한', '편안한'],
    colors: ['#e2e8f0', '#6366f1'],
  },
};

const SEASON_LABEL: Record<string, string> = { spring: '봄', summer: '여름', autumn: '가을', winter: '겨울' };

/* ── Matching ─────────────────────────────────────────── */

function preference(answers: DemoAnswers): Record<Axis, number> {
  const raw: Record<Axis, number> = { floral: 1, citrus: 1, fresh: 1, woody: 1, musk: 1, amber: 1 };
  const add = (opt?: Option) => {
    if (!opt) return;
    for (const [axis, v] of Object.entries(opt.w) as [Axis, number][]) raw[axis] += v;
  };
  getChoices(answers, 'persona').forEach((id) => add(PERSONA.find((o) => o.id === id)));
  add(PLACES.find((o) => o.id === getChoice(answers, 'place')));
  add(SEASONS.find((o) => o.id === getChoice(answers, 'season')));
  add(COLORS.find((o) => o.id === getChoice(answers, 'color')));
  return raw;
}

function cosine(a: Record<Axis, number>, b: Record<Axis, number>): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (const { id } of AXES) {
    dot += a[id] * b[id];
    na += a[id] * a[id];
    nb += b[id] * b[id];
  }
  return dot / (Math.sqrt(na * nb) || 1);
}

function match(answers: DemoAnswers) {
  const pref = preference(answers);
  const seed = answersSeed(answers);
  const ranked = Object.entries(PERFUMES)
    .map(([id, p]) => ({ id, sim: cosine(pref, p.profile) }))
    .sort((a, b) => b.sim - a.sim);
  const rate = (sim: number, salt: string) => clamp(Math.round(52 + sim * 48) + seededInt(seed, salt, -1, 2), 72, 98);
  const best = ranked[0]!;
  const second = ranked[1]!;
  const bestRate = rate(best.sim, 'best');
  const secondRate = Math.min(bestRate - 3, rate(second.sim, 'second'));

  const max = Math.max(...AXES.map((a) => pref[a.id]));
  const radar = AXES.map((a) => ({ label: a.label, value: Math.round(18 + (pref[a.id] / max) * 82) }));
  const topAxis = AXES.reduce((acc, a) => (pref[a.id] > pref[acc.id] ? a : acc), AXES[0]!).id;
  return { best: best.id, bestRate, second: second.id, secondRate, radar, topAxis, cardNo: seededInt(seed, 'card', 1, 999) };
}

/** 결과 화면 · 출력물 공용 — 매칭 결과를 카드에 쓰는 값으로 */
function soulmate(answers: DemoAnswers) {
  const m = match(answers);
  const perfume = PERFUMES[m.best] ?? PERFUMES.petal!;
  const persona = getChoices(answers, 'persona')
    .map((id) => PERSONA.find((o) => o.id === id)?.label)
    .filter(Boolean) as string[];
  return {
    m,
    perfume,
    runner: PERFUMES[m.second] ?? PERFUMES.cotton!,
    season: SEASON_LABEL[getChoice(answers, 'season') ?? ''] ?? '사계절',
    keywords: [...new Set([...persona, ...perfume.keywords])].slice(0, 5),
    cardNo: `No.${String(m.cardNo).padStart(3, '0')}`,
    scentType: SCENT_TYPES[m.topAxis],
  };
}

const CONCENTRATION = '오 드 퍼퓸';

/* ── Result parts ──────────────────────────────────────── */

function Bottle({ colors, label }: { colors: [string, string]; label: string }) {
  const [light, deep] = colors;
  return (
    <svg viewBox="0 0 100 140" className="h-32 w-24 drop-shadow-[0_10px_20px_rgba(0,0,0,0.45)]" aria-hidden="true">
      <defs>
        <linearGradient id="scent-liquid" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={light} />
          <stop offset="1" stopColor={deep} />
        </linearGradient>
        <linearGradient id="scent-cap" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fde68a" />
          <stop offset="0.5" stopColor="#b45309" />
          <stop offset="1" stopColor="#fcd34d" />
        </linearGradient>
      </defs>
      <rect x="34" y="6" width="32" height="24" rx="4" fill="url(#scent-cap)" />
      <rect x="42" y="30" width="16" height="10" fill="#e2e8f0" opacity="0.8" />
      <rect x="12" y="40" width="76" height="94" rx="16" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.55)" strokeWidth="2" />
      <rect x="17" y="58" width="66" height="71" rx="12" fill="url(#scent-liquid)" opacity="0.92" />
      <rect x="22" y="46" width="8" height="70" rx="4" fill="#ffffff" opacity="0.35" />
      <rect x="30" y="78" width="40" height="26" rx="3" fill="#ffffff" opacity="0.9" />
      <text x="50" y="89" textAnchor="middle" fontSize="7" fontWeight="700" fill="#0f172a" letterSpacing="1">
        NEANDER
      </text>
      <text x="50" y="99" textAnchor="middle" fontSize="6" fill="#475569">
        {label}
      </text>
    </svg>
  );
}

const TIERS = [
  { key: 'top', label: 'TOP', time: '첫 15분', width: '62%', alpha: '55' },
  { key: 'middle', label: 'MIDDLE', time: '30분 ~ 2시간', width: '82%', alpha: '80' },
  { key: 'base', label: 'BASE', time: '2시간 이후', width: '100%', alpha: 'b0' },
] as const;

/* ── Result ────────────────────────────────────────────── */

function Result({ answers, onRestart, pillarColor }: DemoResultProps) {
  const { m, perfume, runner, season, keywords, cardNo, scentType } = soulmate(answers);
  const [light, deep] = perfume.colors;

  return (
    <ResultShell
      eyebrow="나의 향수 소울메이트"
      title={perfume.name}
      description={perfume.mood}
      pillarColor={pillarColor}
      onRestart={onRestart}
      restartLabel="다시 매칭하기"
    >
      {/* 향 프로필 카드 */}
      <motion.div
        initial={{ opacity: 0, y: 24, rotate: 2 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ duration: 0.7 }}
        className="relative w-full max-w-[340px] overflow-hidden rounded-3xl border border-white/10 bg-slate-950 p-5 text-left shadow-2xl shadow-black/50"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background: `radial-gradient(circle at 85% 15%, ${light}66, transparent 55%), radial-gradient(circle at 10% 95%, ${deep}88, transparent 60%)`,
          }}
          aria-hidden="true"
        />
        <div className="absolute inset-x-0 top-0 h-1" style={{ background: `linear-gradient(90deg, ${light}, ${deep}, ${light})` }} />
        <div className="relative">
          <div className="flex items-center justify-between text-[10px] font-semibold tracking-[0.25em] text-white/60">
            <span>SCENT PROFILE CARD</span>
            <span>{cardNo}</span>
          </div>
          <div className="mt-4 flex items-center gap-4">
            <Bottle colors={perfume.colors} label={perfume.en} />
            <div className="min-w-0">
              <p className="font-display text-xl font-bold leading-tight text-white">{perfume.en}</p>
              <p className="mt-1 text-xs text-white/70">
                {perfume.family} · {CONCENTRATION}
              </p>
              <p className="mt-3 font-display text-4xl font-extrabold leading-none text-white">
                {m.bestRate}
                <span className="text-lg">%</span>
              </p>
              <p className="mt-1 text-[10px] font-semibold tracking-[0.2em] text-white/60">SOULMATE MATCH</p>
            </div>
          </div>
          <div className="mt-5 rounded-2xl bg-white/10 p-3 backdrop-blur-sm">
            <p className="text-[10px] font-medium text-white/60">나의 향 타입</p>
            <p className="text-sm font-bold text-white">
              {perfume.emoji} {scentType}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {keywords.map((k) => (
                <span key={k} className="rounded-full bg-white/15 px-2 py-0.5 text-[11px] text-white">
                  #{k}
                </span>
              ))}
            </div>
          </div>
          <p className="mt-4 text-[9px] tracking-[0.3em] text-white/40">NEANDER SCENT LAB · 2026</p>
        </div>
      </motion.div>

      {/* 노트 피라미드 */}
      <Panel title="노트 피라미드">
        <div className="flex flex-col items-center gap-1.5">
          {TIERS.map((tier, i) => (
            <motion.div
              key={tier.key}
              initial={{ opacity: 0, scaleX: 0.6 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.15 }}
              className="rounded-xl px-3 py-2.5 text-center"
              style={{ width: tier.width, background: `linear-gradient(90deg, ${deep}${tier.alpha}, ${light}${tier.alpha})` }}
            >
              <p className="text-[10px] font-bold tracking-[0.2em] text-white/80">
                {tier.label} <span className="font-medium tracking-normal text-white/60">· {tier.time}</span>
              </p>
              <p className="mt-0.5 text-sm font-semibold text-white [word-break:keep-all]">{perfume.notes[tier.key].join(' · ')}</p>
            </motion.div>
          ))}
        </div>
      </Panel>

      {/* 나의 향 취향 레이더 */}
      <Panel title="나의 향 취향 레이더">
        <RadarChart color={pillarColor} axes={m.radar} size={250} />
        <p className="mt-1 text-center text-xs text-slate-400 [word-break:keep-all]">
          {AXES.find((a) => a.id === m.topAxis)?.label} 계열에 가장 크게 반응했어요. {perfume.name}의 향 구조와 {m.bestRate}% 겹쳐요.
        </p>
      </Panel>

      <InfoGrid
        items={[
          { emoji: '🥈', label: '2순위 소울메이트', value: `${runner.name} ${m.secondRate}%`, desc: runner.family },
          { emoji: '🗓️', label: '베스트 시즌', value: `${season} · 데일리`, desc: '오 드 퍼퓸 · 지속 6~8시간' },
        ]}
      />

      {/* 시향 팁 */}
      <Panel title="시향 가이드">
        <ol className="space-y-3 text-sm text-slate-300">
          {[
            '손목 안쪽에 한 번 뿌리고, 문지르지 말고 기다려 주세요.',
            `15분 뒤 올라오는 ${perfume.notes.middle[0]} 향이 이 향수의 진짜 첫인상이에요.`,
            `${perfume.notes.base[0]} 잔향은 두세 시간 뒤 옷깃에서 확인해 보세요.`,
          ].map((tip, i) => (
            <li key={tip} className="flex gap-3 [word-break:keep-all]">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-slate-950" style={{ backgroundColor: pillarColor }}>
                {i + 1}
              </span>
              {tip}
            </li>
          ))}
        </ol>
        <p className="mt-4 rounded-xl bg-slate-950/60 p-3 text-xs leading-relaxed text-slate-400 [word-break:keep-all]">
          💨 현장에서는 매칭된 향이 디퓨저로 분사돼 바로 시향할 수 있어요. {runner.name}을(를) 한 번 겹쳐 뿌리면 나만의 레이어링 향이 완성돼요.
        </p>
      </Panel>
    </ResultShell>
  );
}

/* ── Export ─────────────────────────────────────────────── */

const toChoice = ({ id, label, desc, emoji, swatch }: Option) => ({ id, label, desc, emoji, swatch });

export default defineDemo({
  config: {
    id: 'scent-soulmate',
    targetSlug: 'ai-scent-soulmate',
    industryId: 'beauty',
    analyzeEmoji: '🌸',
    analyzeDurationMs: 3400,
    analyzeMessages: ['취향 키워드를 향료로 번역하는 중', '향수 데이터베이스 200종 비교 중', '노트 피라미드 구성 중', '프로필 카드 인쇄 중'],
  },
  steps: [
    choiceStep({
      id: 'persona',
      title: '나를 표현하는 키워드는?',
      subtitle: '성격에 가까운 키워드를 최대 2개 골라주세요',
      columns: 3,
      multi: { min: 1, max: 2 },
      options: PERSONA.map(toChoice),
    }),
    choiceStep({
      id: 'place',
      title: '가장 끌리는 장소는 어디인가요?',
      subtitle: '떠올리기만 해도 기분 좋아지는 곳으로 골라주세요',
      columns: 3,
      options: PLACES.map(toChoice),
    }),
    choiceStep({
      id: 'season',
      title: '제일 좋아하는 계절은?',
      columns: 4,
      options: SEASONS.map(toChoice),
    }),
    choiceStep({
      id: 'color',
      title: '지금 끌리는 무드 컬러는?',
      subtitle: '직감적으로 눈이 가는 색을 골라주세요',
      columns: 3,
      options: COLORS.map(toChoice),
    }),
  ],
  computeResult: (answers) => match(answers).best,
  Result,
  print: (answers) => {
    const { m, perfume, runner, season, keywords, cardNo, scentType } = soulmate(answers);
    return {
      kind: 'receipt',
      eyebrow: `SCENT PROFILE CARD · ${cardNo}`,
      title: perfume.name,
      sections: [
        { type: 'big', text: `${m.bestRate}% MATCH` },
        { type: 'text', text: perfume.mood },
        {
          type: 'rows',
          title: '향수 프로필',
          rows: [
            { label: '향수', value: perfume.en },
            { label: '계열', value: `${perfume.family} · ${CONCENTRATION}` },
            { label: '나의 향 타입', value: scentType },
            { label: '베스트 시즌', value: `${season} · 데일리` },
            { label: '2순위', value: `${runner.name} ${m.secondRate}%` },
            { label: '키워드', value: keywords.map((k) => `#${k}`).join(' ') },
          ],
        },
        {
          type: 'rows',
          title: '노트 피라미드',
          rows: TIERS.map((tier) => ({ label: tier.label, value: perfume.notes[tier.key].join(' · ') })),
        },
        { type: 'bars', title: '나의 향 취향', bars: m.radar },
      ],
      footer: '손목 안쪽에 뿌리고 15분만 기다려 보세요',
    };
  },
});
