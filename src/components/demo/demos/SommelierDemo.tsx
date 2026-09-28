'use client';

import type { DemoAnswers, DemoResultProps } from '@/types/demo';
import {
  InfoGrid,
  Panel,
  RadarChart,
  ResultShell,
  choiceStep,
  defineDemo,
  getChoice,
  getFields,
  requestDemoAi,
  sliderStep,
} from '../kit';
import {
  SOMMELIER_KINDS,
  SOMMELIER_OCCASIONS,
  SOMMELIER_PAIRINGS,
  SOMMELIER_STYLES,
  SOMMELIER_TASTE_SLIDERS,
  type AiSommelier,
} from '@/data/demo-ai/sommelier';

/* ── Data ──────────────────────────────────────────────── */

interface Drink {
  name: string;
  origin: string;
  kind: 'wine' | 'korean';
  profile: { sweet: number; acid: number; body: number; bitter: number };
  nose: string;
  palate: string;
  finish: string;
  temp: string;
  premium: boolean;
}

const DRINKS: Record<string, Drink> = {
  pinot: {
    name: '부르고뉴 피노 누아',
    origin: '프랑스 · 레드 와인',
    kind: 'wine',
    profile: { sweet: 20, acid: 70, body: 35, bitter: 35 },
    nose: '체리, 라즈베리, 젖은 흙',
    palate: '가볍고 실키한 질감에 산뜻한 산미',
    finish: '은은한 버섯·향신료 여운',
    temp: '14–16°C',
    premium: true,
  },
  cabernet: {
    name: '나파 밸리 카베르네 소비뇽',
    origin: '미국 · 레드 와인',
    kind: 'wine',
    profile: { sweet: 15, acid: 50, body: 90, bitter: 85 },
    nose: '블랙커런트, 삼나무, 바닐라',
    palate: '묵직한 바디와 단단한 탄닌',
    finish: '길게 이어지는 오크·초콜릿',
    temp: '16–18°C',
    premium: true,
  },
  sauvignon: {
    name: '말보로 소비뇽 블랑',
    origin: '뉴질랜드 · 화이트 와인',
    kind: 'wine',
    profile: { sweet: 15, acid: 90, body: 30, bitter: 10 },
    nose: '패션프루트, 라임, 막 자른 풀',
    palate: '톡 쏘는 산미와 청량감',
    finish: '깔끔하고 짧은 미네랄 여운',
    temp: '7–9°C',
    premium: false,
  },
  chardonnay: {
    name: '오크 숙성 샤르도네',
    origin: '미국 · 화이트 와인',
    kind: 'wine',
    profile: { sweet: 25, acid: 50, body: 70, bitter: 15 },
    nose: '구운 사과, 버터, 바닐라',
    palate: '크리미하고 둥근 질감',
    finish: '고소한 견과류 여운',
    temp: '10–12°C',
    premium: true,
  },
  moscato: {
    name: '모스카토 다스티',
    origin: '이탈리아 · 스파클링',
    kind: 'wine',
    profile: { sweet: 85, acid: 55, body: 20, bitter: 0 },
    nose: '복숭아, 오렌지 꽃, 꿀',
    palate: '달콤하고 가볍게 톡 튀는 기포',
    finish: '상큼한 과일 여운',
    temp: '6–8°C',
    premium: false,
  },
  makgeolli: {
    name: '프리미엄 생막걸리',
    origin: '한국 · 탁주',
    kind: 'korean',
    profile: { sweet: 55, acid: 60, body: 65, bitter: 15 },
    nose: '쌀 누룩, 요거트, 배',
    palate: '부드러운 탄산과 크리미한 곡물감',
    finish: '새콤달콤하게 떨어지는 여운',
    temp: '4–6°C',
    premium: false,
  },
  cheongju: {
    name: '전통 약주',
    origin: '한국 · 청주',
    kind: 'korean',
    profile: { sweet: 40, acid: 40, body: 50, bitter: 25 },
    nose: '국화, 꿀, 은은한 누룩',
    palate: '맑고 부드러운 단맛',
    finish: '깔끔한 곡물 향',
    temp: '8–10°C',
    premium: true,
  },
  bokbunja: {
    name: '고창 복분자주',
    origin: '한국 · 과실주',
    kind: 'korean',
    profile: { sweet: 75, acid: 45, body: 55, bitter: 30 },
    nose: '산딸기, 자두, 검붉은 베리',
    palate: '진한 과실 단맛과 은근한 떫음',
    finish: '달콤한 베리 여운',
    temp: '10–12°C',
    premium: false,
  },
  andong: {
    name: '안동 증류식 소주',
    origin: '한국 · 증류주',
    kind: 'korean',
    profile: { sweet: 20, acid: 15, body: 80, bitter: 55 },
    nose: '누룽지, 배꽃, 은은한 스모크',
    palate: '강렬하지만 둥글게 퍼지는 곡물 향',
    finish: '따뜻하고 긴 여운',
    temp: '상온 또는 온더록',
    premium: true,
  },
};

const PAIRINGS: Record<string, { label: string; tip: string }> = {
  meat: { label: '스테이크·바비큐', tip: '육즙과 기름기를 산미와 탄닌이 정리해 줘요.' },
  seafood: { label: '회·해산물', tip: '비린 맛을 잡는 차가운 온도로 서빙하세요.' },
  cheese: { label: '치즈·샤퀴테리', tip: '짭짤한 치즈와 과실 향이 서로를 끌어올려요.' },
  korean: { label: '전·한식 안주', tip: '기름진 전에는 산미 있는 술이 잘 어울려요.' },
  dessert: { label: '디저트', tip: '디저트보다 조금 더 단 술을 고르면 실패가 없어요.' },
};

/* ── Matching ─────────────────────────────────────────── */

function match(answers: DemoAnswers) {
  const taste = getFields<number>(answers, 'taste');
  const occasion = getChoice(answers, 'occasion');
  const style = getChoice(answers, 'style');
  const profile = (answers.experienceProfile ?? {}) as Record<string, string>;
  const user = { sweet: taste.sweet ?? 50, acid: taste.acid ?? 50, body: taste.body ?? 50, bitter: taste.bitter ?? 50 };

  let bestKey = 'pinot';
  let bestScore = Infinity;
  for (const [key, drink] of Object.entries(DRINKS)) {
    const p = drink.profile;
    let distance = Math.hypot(p.sweet - user.sweet, p.acid - user.acid, p.body - user.body, p.bitter - user.bitter);
    if (style === 'wine' && drink.kind !== 'wine') distance += 35;
    if (style === 'korean' && drink.kind !== 'korean') distance += 35;
    if (occasion === 'gift' && drink.premium) distance -= 12;
    if (profile.tannin === 'soft' && (key === 'cabernet' || key === 'andong')) distance += 24;
    if (profile.tannin === 'firm' && key === 'cabernet') distance -= 18;
    if (profile.sauce === 'spicy' && (key === 'andong' || key === 'cabernet')) distance += 28;
    if (profile.sauce === 'sweet' && p.sweet < 40) distance += 20;
    if (profile.sauce === 'rich' && p.acid >= 65) distance -= 10;
    if (occasion === 'party' && drink.profile.body < 40) distance -= 8;
    if (distance < bestScore) {
      bestScore = distance;
      bestKey = key;
    }
  }
  const matchRate = Math.round(Math.min(98, Math.max(72, 100 - bestScore / 3)));
  return { key: bestKey, matchRate };
}

function userTaste(answers: DemoAnswers) {
  const t = getFields<number>(answers, 'taste');
  return { sweet: t.sweet ?? 50, acid: t.acid ?? 50, body: t.body ?? 50, bitter: t.bitter ?? 50 };
}

/* ── AI 결과 ──────────────────────────────────────────── */

const isPct = (n: unknown) => typeof n === 'number' && n >= 0 && n <= 100;

function isAiSommelier(v: unknown): v is AiSommelier {
  const o = v as AiSommelier | null;
  return !!o && typeof o.name === 'string' && typeof o.origin === 'string' && (SOMMELIER_KINDS as readonly string[]).includes(o.kind)
    && !!o.profile && isPct(o.profile.sweet) && isPct(o.profile.acid) && isPct(o.profile.body) && isPct(o.profile.bitter)
    && typeof o.nose === 'string' && typeof o.palate === 'string' && typeof o.finish === 'string' && typeof o.temp === 'string'
    && typeof o.matchRate === 'number' && !!o.pairing && typeof o.pairing.dish === 'string' && typeof o.pairing.tip === 'string';
}

/** 화면·출력물이 그리는 추천 — AI 결과가 있으면 그것, 없으면 고정 목록 매칭 */
function sommelierView(answers: DemoAnswers, resultKey: string, generated: unknown) {
  const pairingOpt = PAIRINGS[getChoice(answers, 'pairing') ?? 'meat'] ?? PAIRINGS.meat!;
  if (isAiSommelier(generated)) {
    const { matchRate, reason, pairing, ...drink } = generated;
    return { drink, matchRate, reason, pairing: { label: pairingOpt.label, dish: pairing.dish, tip: pairing.tip }, ai: true };
  }
  const drink = DRINKS[resultKey] ?? DRINKS.pinot!;
  return {
    drink,
    matchRate: match(answers).matchRate,
    reason: undefined as string | undefined,
    pairing: { label: pairingOpt.label, dish: undefined as string | undefined, tip: pairingOpt.tip },
    ai: false,
  };
}

/* ── Result ────────────────────────────────────────────── */

function Result({ resultKey, answers, onRestart, pillarColor, generated }: DemoResultProps) {
  const { drink, matchRate, reason, pairing, ai } = sommelierView(answers, resultKey, generated);

  return (
    <ResultShell
      coreCount={2}
      eyebrow={ai ? 'AI 소믈리에의 추천' : '답변으로 매칭한 테이스팅 예시'}
      title={drink.name}
      description={`${drink.origin} · 데모 취향 비교 ${matchRate}/100`}
      pillarColor={pillarColor}
      onRestart={onRestart}
      restartLabel="다시 테이스팅"
    >
      {reason && <p className="max-w-md text-sm leading-relaxed text-slate-300 [word-break:keep-all]">{reason}</p>}

      <RadarChart
        color={pillarColor}
        axes={[
          { label: '단맛', value: drink.profile.sweet },
          { label: '산미', value: drink.profile.acid },
          { label: '바디감', value: drink.profile.body },
          { label: '쌉쌀함', value: drink.profile.bitter },
        ]}
      />

      <Panel title="테이스팅 노트">
        <dl className="space-y-3 text-sm">
          {[
            { term: '👃 향', detail: drink.nose },
            { term: '👅 맛', detail: drink.palate },
            { term: '🌙 여운', detail: drink.finish },
          ].map((row) => (
            <div key={row.term} className="flex gap-4">
              <dt className="w-14 shrink-0 text-slate-500">{row.term}</dt>
              <dd className="text-slate-200">{row.detail}</dd>
            </div>
          ))}
        </dl>
      </Panel>

      <InfoGrid
        items={[
          { emoji: '🌡️', label: '서빙 온도', value: drink.temp },
          { emoji: '🍽️', label: `페어링 · ${pairing.label}`, value: pairing.dish ?? '추천 조합', desc: pairing.tip },
        ]}
      />

      {ai && <p className="text-xs text-slate-500">AI 소믈리에가 당신의 답변으로 고른 한 잔이에요 · 천천히 음미하며 즐겨 주세요</p>}
    </ResultShell>
  );
}

/* ── Export ─────────────────────────────────────────────── */

const DEMO_ID = 'sommelier';

export default defineDemo({
  config: {
    id: DEMO_ID,
    targetSlug: 'ai-sommelier',
    industryId: 'fnb',
    analyzeEmoji: '🍷',
    analyzeDurationMs: 3000,
    analyzeMessages: ['단맛·산미·떫은 느낌 선호 확인', '음식과 소스의 맛에 맞춰 후보 비교', '서빙과 테이스팅 노트 정리'],
  },
  steps: [
    sliderStep({
      id: 'taste',
      title: '평소 좋아하는 맛을 알려주세요',
      subtitle: '슬라이더를 움직여 취향을 표시해 주세요',
      sliders: SOMMELIER_TASTE_SLIDERS.map((o) => ({ ...o })),
    }),
    choiceStep({
      id: 'style',
      title: '어떤 술이 더 끌리나요?',
      columns: 3,
      options: SOMMELIER_STYLES.map((o) => ({ ...o })),
    }),
    choiceStep({
      id: 'occasion',
      title: '언제 마실 술인가요?',
      columns: 2,
      options: SOMMELIER_OCCASIONS.map((o) => ({ ...o })),
    }),
    choiceStep({
      id: 'pairing',
      title: '함께할 음식은?',
      columns: 3,
      options: SOMMELIER_PAIRINGS.map((o) => ({ ...o })),
    }),
  ],
  computeResult: (answers) => match(answers).key,
  Result,
  generate: (answers) =>
    requestDemoAi<AiSommelier>(
      DEMO_ID,
      { experienceProfile: answers.experienceProfile,
        taste: userTaste(answers),
        style: getChoice(answers, 'style'),
        occasion: getChoice(answers, 'occasion'),
        pairing: getChoice(answers, 'pairing'),
      },
      { validate: isAiSommelier }
    ),
  print: (answers, resultKey, generated) => {
    const { drink, matchRate, reason, pairing, ai } = sommelierView(answers, resultKey, generated);
    return {
      kind: 'receipt',
      eyebrow: ai ? 'AI 소믈리에 추천' : '답변으로 매칭한 테이스팅 예시',
      title: drink.name,
      sections: [
        { type: 'big', title: '데모 취향 비교 지표', text: `${matchRate}/100` },
        ...(reason ? [{ type: 'text' as const, text: reason }] : []),
        {
          type: 'bars',
          title: '맛 프로필',
          bars: [
            { label: '단맛', value: drink.profile.sweet },
            { label: '산미', value: drink.profile.acid },
            { label: '바디', value: drink.profile.body },
            { label: '쌉쌀', value: drink.profile.bitter },
          ],
        },
        {
          type: 'rows',
          title: '테이스팅 노트',
          rows: [
            { label: '종류', value: drink.origin },
            { label: '향', value: drink.nose },
            { label: '맛', value: drink.palate },
            { label: '여운', value: drink.finish },
            { label: '온도', value: drink.temp },
          ],
        },
        { type: 'text', title: pairing.dish ? `페어링 · ${pairing.dish}` : `페어링 · ${pairing.label}`, text: pairing.tip },
      ],
      footer: '행사 현장에서는 추천 주류를 바로 시음할 수 있어요',
    };
  },
});
