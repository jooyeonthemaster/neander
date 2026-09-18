'use client';

import { motion } from 'motion/react';
import type { DemoAnswers, DemoResultProps } from '@/types/demo';
import {
  Panel,
  ProcessedPhoto,
  ResultShell,
  cameraStep,
  choiceStep,
  defineDemo,
  getCapture,
  getChoice,
  hashString,
  seededInt,
  seededRandom,
  type CaptureStats,
} from '../kit';

/* ── Data ──────────────────────────────────────────────── */

type Tone = 'warm' | 'cool' | 'neutral';
type TpoId = 'work' | 'date' | 'travel' | 'party';
type StyleId = 'minimal' | 'casual' | 'street' | 'classic' | 'feminine' | 'sporty';
type FitId = 'slim' | 'regular' | 'over';
type Item = readonly [name: string, emoji: string];

const TONES: Record<Tone, { name: string; palette: string; tip: string; colors: { n: string; h: string }[] }> = {
  warm: {
    name: '웜 톤',
    palette: '어스 & 캐멀 팔레트',
    tip: '골드 액세서리가 웜톤 피부를 더 화사하게 살려줘요.',
    colors: [
      { n: '카멜', h: '#c19a6b' },
      { n: '올리브', h: '#708238' },
      { n: '테라코타', h: '#c8674a' },
      { n: '크림', h: '#f3e5c8' },
      { n: '브라운', h: '#5c3a21' },
      { n: '머스타드', h: '#d4a017' },
    ],
  },
  cool: {
    name: '쿨 톤',
    palette: '쿨 모노 & 파스텔 팔레트',
    tip: '실버 액세서리로 쿨톤의 맑은 느낌을 이어가세요.',
    colors: [
      { n: '네이비', h: '#1f2a44' },
      { n: '차콜', h: '#4b5563' },
      { n: '아이스 블루', h: '#bfdbfe' },
      { n: '라벤더', h: '#c4b5fd' },
      { n: '블랙', h: '#111111' },
      { n: '화이트', h: '#f8fafc' },
    ],
  },
  neutral: {
    name: '뉴트럴 톤',
    palette: '소프트 뉴트럴 팔레트',
    tip: '톤온톤 레이어링이 뉴트럴 톤에서 가장 세련돼 보여요.',
    colors: [
      { n: '베이지', h: '#d6c3a5' },
      { n: '토프', h: '#8b7d6b' },
      { n: '세이지', h: '#9caf88' },
      { n: '데님 블루', h: '#4a6fa5' },
      { n: '아이보리', h: '#f5f0e1' },
      { n: '차콜', h: '#374151' },
    ],
  },
};

const TPOS: Record<TpoId, { label: string; emoji: string; desc: string; looks: string[]; tip: string }> = {
  work: { label: '출근', emoji: '💼', desc: '오피스 · 미팅', looks: ['시티 커뮤터', '미팅 데이 룩', '프라이데이 캐주얼'], tip: '가방과 신발 색을 맞추면 단정한 인상을 줘요.' },
  date: { label: '데이트', emoji: '💕', desc: '설레는 약속', looks: ['첫 데이트 룩', '카페 투어 룩', '디너 데이트 룩'], tip: '포인트 컬러는 한 곳에만! 시선이 얼굴로 모여요.' },
  travel: { label: '여행', emoji: '✈️', desc: '많이 걷는 날', looks: ['공항 패션', '시티 워킹 룩', '선셋 스냅 룩'], tip: '많이 걷는 날엔 쿠션감 있는 신발이 필수예요.' },
  party: { label: '파티', emoji: '🎉', desc: '주목받는 자리', looks: ['루프탑 파티 룩', '생일 파티 룩', '애프터 파티 룩'], tip: '조명 아래서는 광택 소재 하나가 존재감을 키워요.' },
};

const STYLES: Record<StyleId, { label: string; emoji: string; desc: string }> = {
  minimal: { label: '미니멀', emoji: '🤍', desc: '군더더기 없이' },
  casual: { label: '캐주얼', emoji: '👟', desc: '편하고 자연스럽게' },
  street: { label: '스트릿', emoji: '🛹', desc: '힙하고 자유롭게' },
  classic: { label: '클래식', emoji: '🎩', desc: '단정하고 품격 있게' },
  feminine: { label: '페미닌', emoji: '🎀', desc: '부드럽고 사랑스럽게' },
  sporty: { label: '스포티', emoji: '🏃', desc: '활동적이고 가볍게' },
};

const FITS: Record<FitId, { label: string; emoji: string; desc: string; top: string; bottom: string; tip: string }> = {
  slim: { label: '슬림핏', emoji: '📏', desc: '몸에 맞게 깔끔하게', top: '슬림핏 ', bottom: '슬림 ', tip: '상의를 살짝 넣어 입어 허리 라인을 살려보세요.' },
  regular: { label: '레귤러핏', emoji: '👌', desc: '편안한 기본 핏', top: '', bottom: '', tip: '소매를 한 번 롤업하면 한결 경쾌해 보여요.' },
  over: { label: '오버사이즈', emoji: '🫧', desc: '여유로운 실루엣', top: '오버사이즈 ', bottom: '루즈핏 ', tip: '상의가 크면 하의는 발목이 보이게 떨어뜨려 균형을 맞추세요.' },
};

const TOPS: Record<StyleId, Item[]> = {
  minimal: [['크루넥 니트', '🧶'], ['오버셔츠', '👔'], ['실크 블라우스', '👚'], ['테일러드 블레이저', '🧥']],
  casual: [['스트라이프 티셔츠', '👕'], ['옥스퍼드 셔츠', '👔'], ['스웨트셔츠', '👕'], ['데님 재킷', '🧥']],
  street: [['그래픽 후디', '👕'], ['바시티 재킷', '🧥'], ['박시 티셔츠', '👕'], ['나일론 윈드브레이커', '🧥']],
  classic: [['트위드 재킷', '🧥'], ['케이블 니트', '🧶'], ['버튼다운 셔츠', '👔'], ['더블 블레이저', '🧥']],
  feminine: [['퍼프 소매 블라우스', '👚'], ['크롭 카디건', '🧶'], ['레이스 톱', '👚'], ['리본 니트', '🧶']],
  sporty: [['트랙 재킷', '🧥'], ['아노락', '🧥'], ['카라 폴로 셔츠', '👕'], ['크롭 스웨트셔츠', '👕']],
};

const BOTTOMS: Record<StyleId, Item[]> = {
  minimal: [['와이드 슬랙스', '👖'], ['스트레이트 데님', '👖'], ['플리츠 미디 스커트', '👗'], ['크롭 팬츠', '👖']],
  casual: [['치노 팬츠', '👖'], ['워싱 데님', '👖'], ['코튼 A라인 스커트', '👗'], ['조거 팬츠', '👖']],
  street: [['카고 팬츠', '👖'], ['와이드 데님', '👖'], ['파라슈트 팬츠', '👖'], ['나일론 쇼츠', '🩳']],
  classic: [['울 트라우저', '👖'], ['펜슬 스커트', '👗'], ['플리츠 슬랙스', '👖'], ['인디고 데님', '👖']],
  feminine: [['플레어 스커트', '👗'], ['새틴 슬립 스커트', '👗'], ['하이웨이스트 부츠컷', '👖'], ['플리츠 롱스커트', '👗']],
  sporty: [['트랙 팬츠', '👖'], ['바이커 쇼츠', '🩳'], ['테니스 스커트', '👗'], ['나일론 조거', '👖']],
};

const SHOES: Record<StyleId, Item[]> = {
  minimal: [['레더 로퍼', '👞'], ['미니멀 스니커즈', '👟'], ['슬링백 펌프스', '👠']],
  casual: [['캔버스 스니커즈', '👟'], ['스웨이드 로퍼', '👞'], ['플랫 샌들', '🩴']],
  street: [['청키 스니커즈', '👟'], ['하이탑 스니커즈', '👟'], ['컴뱃 부츠', '🥾']],
  classic: [['페니 로퍼', '👞'], ['앵클 부츠', '👢'], ['더비 슈즈', '👞']],
  feminine: [['메리제인 슈즈', '👠'], ['발레 플랫', '🥿'], ['스트랩 힐', '👠']],
  sporty: [['러닝화', '👟'], ['코트 스니커즈', '👟'], ['슬라이드', '🩴']],
};

const ACCESSORIES: Record<TpoId, Item[]> = {
  work: [['가죽 토트백', '👜'], ['메탈 시계', '⌚'], ['실버 이어링', '💍'], ['카드 지갑', '💳']],
  date: [['미니 숄더백', '👛'], ['진주 귀걸이', '💎'], ['실크 스카프', '🧣'], ['레이어드 목걸이', '📿']],
  travel: [['크로스백', '👝'], ['버킷햇', '👒'], ['선글라스', '🕶️'], ['캔버스 토트', '🛍️']],
  party: [['체인 클러치', '👛'], ['볼드 이어링', '💎'], ['스터드 벨트', '⛓️'], ['벨벳 헤어밴드', '🎀']],
};

/* ── Styling engine ────────────────────────────────────── */

function toneOf(stats?: CaptureStats): Tone {
  const warmth = stats?.warmth ?? 52;
  if (warmth >= 56) return 'warm';
  if (warmth <= 46) return 'cool';
  return 'neutral';
}

function pick<T extends string>(answers: DemoAnswers, id: string, table: Record<T, unknown>, fallback: T): T {
  const value = getChoice(answers, id);
  return value && value in table ? (value as T) : fallback;
}

interface Piece {
  slot: string;
  name: string;
  emoji: string;
  color: { n: string; h: string };
}

function styleOutfits(answers: DemoAnswers) {
  const capture = getCapture(answers, 'tone');
  const tone = toneOf(capture?.stats);
  const tpo = pick<TpoId>(answers, 'tpo', TPOS, 'date');
  const style = pick<StyleId>(answers, 'style', STYLES, 'minimal');
  const fit = pick<FitId>(answers, 'fit', FITS, 'regular');
  const seed = hashString(`${capture?.seed ?? 5}-${tpo}-${style}-${fit}`);
  const colors = TONES[tone].colors;
  const f = FITS[fit];
  const s = (salt: string, n: number) => seededInt(seed, salt, 0, n - 1);
  const [t0, b0, sh0, a0, c0] = [s('top', 4), s('bottom', 4), s('shoes', 3), s('acc', 4), s('color', 6)];

  const outfits = [0, 1, 2].map((k) => {
    const top = TOPS[style][(t0 + k) % 4]!;
    const bottom = BOTTOMS[style][(b0 + k * 3) % 4]!;
    const shoes = SHOES[style][(sh0 + k) % 3]!;
    const acc = ACCESSORIES[tpo][(a0 + k) % 4]!;
    const ci = c0 + k * 2;
    const pieces: Piece[] = [
      { slot: '상의', name: `${f.top}${top[0]}`, emoji: top[1], color: colors[ci % 6]! },
      { slot: '하의', name: `${bottom[1] === '👗' ? '' : f.bottom}${bottom[0]}`, emoji: bottom[1], color: colors[(ci + 3) % 6]! },
      { slot: '슈즈', name: shoes[0], emoji: shoes[1], color: colors[(ci + 4) % 6]! },
      { slot: '액세서리', name: acc[0], emoji: acc[1], color: colors[(ci + 1) % 6]! },
    ];
    const tip = [f.tip, TONES[tone].tip, TPOS[tpo].tip][k]!;
    const match = 96 - k * 3 + seededInt(seed, `match${k}`, -1, 1);
    return { name: TPOS[tpo].looks[k]!, pieces, tip, match };
  });

  return { tone, tpo, style, fit, seed, outfits };
}

/* ── Result parts ──────────────────────────────────────── */

/** 장식용 QR 패턴 (실제 링크 아님) */
function DecorativeQR({ seed, className }: { seed: number; className?: string }) {
  const size = 21;
  const finder = (x: number, y: number) => {
    for (const [fx, fy] of [[0, 0], [size - 7, 0], [0, size - 7]] as const) {
      const dx = x - fx;
      const dy = y - fy;
      if (dx >= -1 && dx <= 7 && dy >= -1 && dy <= 7) {
        if (dx < 0 || dy < 0 || dx > 6 || dy > 6) return 0;
        return Math.min(dx, dy, 6 - dx, 6 - dy) === 1 ? 0 : 1;
      }
    }
    return -1;
  };
  const cells: [number, number][] = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const v = finder(x, y);
      if (v === 1 || (v === -1 && seededRandom(seed, `${x}.${y}`) > 0.52)) cells.push([x, y]);
    }
  }
  return (
    <svg viewBox={`-1 -1 ${size + 2} ${size + 2}`} className={className} shapeRendering="crispEdges" aria-hidden="true">
      <rect x="-1" y="-1" width={size + 2} height={size + 2} fill="#ffffff" />
      {cells.map(([x, y]) => (
        <rect key={`${x}.${y}`} x={x} y={y} width="1" height="1" fill="#0f172a" />
      ))}
    </svg>
  );
}

/* ── Result ────────────────────────────────────────────── */

function Result({ answers, onRestart, pillarColor }: DemoResultProps) {
  const capture = getCapture(answers, 'tone');
  const { tone, tpo, style, fit, seed, outfits } = styleOutfits(answers);
  const toneData = TONES[tone];
  const ring = `conic-gradient(${toneData.colors.map((c, i) => `${c.h} ${(i * 100) / 6}% ${((i + 1) * 100) / 6}%`).join(', ')})`;

  return (
    <ResultShell
      eyebrow="AI 스타일리스트의 코디 추천"
      title={`${TPOS[tpo].label} ${STYLES[style].label} 코디 3벌`}
      description={`${toneData.palette}에서 ${FITS[fit].label}으로 맞춘 조합이에요. 마음에 드는 룩은 QR로 바로 쇼핑할 수 있어요.`}
      pillarColor={pillarColor}
      onRestart={onRestart}
      restartLabel="다른 TPO로 추천받기"
    >
      {/* 퍼스널 톤 드레이프 */}
      <Panel className="flex items-center gap-4">
        <div className="relative h-24 w-24 shrink-0 rounded-full p-1" style={{ background: ring }}>
          {capture ? (
            <ProcessedPhoto
              src={capture.image}
              look={{ adjust: { brightness: 1.04, saturation: 1.05 } }}
              className="h-full w-full rounded-full border-2 border-slate-900"
              imgClassName="object-top"
              alt="퍼스널 톤 분석 사진"
            />
          ) : (
            <div className="h-full w-full rounded-full bg-slate-800" />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-slate-500">퍼스널 톤</p>
          <p className="text-lg font-bold text-white">{toneData.name}</p>
          <p className="text-xs text-slate-400">{toneData.palette}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {toneData.colors.map((c) => (
              <span key={c.n} className="h-4 w-4 rounded-full border border-white/20" style={{ background: c.h }} title={c.n} />
            ))}
          </div>
        </div>
      </Panel>

      {/* 코디 카드 3벌 */}
      <div className="grid w-full max-w-md gap-4">
        {outfits.map((look, k) => (
          <motion.div
            key={look.name}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 + k * 0.15 }}
            className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-[10px] font-bold tracking-widest" style={{ color: pillarColor }}>
                  LOOK 0{k + 1}
                </p>
                <p className="text-base font-bold text-white">{look.name}</p>
              </div>
              <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs font-semibold text-teal-300">매칭 {look.match}%</span>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {look.pieces.map((p) => (
                <div
                  key={p.slot}
                  className="flex aspect-square items-center justify-center rounded-xl border border-white/10 text-3xl shadow-inner"
                  style={{ background: `radial-gradient(circle at 30% 25%, #ffffff55, transparent 60%), ${p.color.h}` }}
                  aria-hidden="true"
                >
                  {p.emoji}
                </div>
              ))}
            </div>
            <ul className="mt-3 space-y-1.5 text-xs">
              {look.pieces.map((p) => (
                <li key={p.slot} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full border border-white/20" style={{ background: p.color.h }} />
                  <span className="w-12 shrink-0 text-slate-500">{p.slot}</span>
                  <span className="text-slate-200 [word-break:keep-all]">
                    {p.color.n} {p.name}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 rounded-lg bg-slate-950/60 px-3 py-2 text-xs leading-relaxed text-slate-400 [word-break:keep-all]">💡 {look.tip}</p>
          </motion.div>
        ))}
      </div>

      {/* 구매 QR */}
      <Panel title="코디 카드 · 구매 QR">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-white p-2">
            <DecorativeQR seed={seed} className="h-24 w-24" />
          </div>
          <div className="min-w-0 text-sm">
            <p className="font-semibold text-white">추천 아이템 12개 한 번에 담기</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-400 [word-break:keep-all]">
              현장에서는 코디 카드와 함께 출력돼 스캔하면 브랜드 상품 페이지로 바로 이어져요.
            </p>
            <p className="mt-1 text-[11px] text-slate-600">데모용 장식 이미지예요</p>
          </div>
        </div>
      </Panel>
    </ResultShell>
  );
}

/* ── Export ─────────────────────────────────────────────── */

export default defineDemo({
  config: {
    id: 'coord-recommender',
    targetSlug: 'ai-coord-recommender',
    industryId: 'fashion',
    analyzeEmoji: '👗',
    analyzeDurationMs: 3400,
    analyzeImageStepId: 'tone',
    analyzeMessages: ['퍼스널 팔레트 적용 중', '브랜드 상품 DB 3,200개 탐색 중', 'TPO별 코디 조합 생성 중', '코디 카드 출력 중'],
  },
  steps: [
    cameraStep({
      id: 'tone',
      title: '퍼스널 톤부터 가볍게 볼게요',
      subtitle: '얼굴 톤으로 어울리는 옷 색을 골라요 · 카메라가 없다면 샘플로 넘어가도 돼요',
      mode: 'portrait',
      subject: '모습',
      scanLabels: ['인물 영역 분리', '피부 언더톤 측정', '명도·채도 대비 계산', '퍼스널 팔레트 매칭'],
      readouts: (c) => {
        const tone = toneOf(c.stats);
        return [
          { label: '퍼스널 톤', value: TONES[tone].name },
          { label: '추천 팔레트', value: tone === 'warm' ? '어스 & 캐멀' : tone === 'cool' ? '쿨 모노' : '소프트 뉴트럴' },
          { label: '명도', value: c.stats.brightness > 58 ? '라이트' : c.stats.brightness > 40 ? '미디엄' : '딥' },
          { label: '대비감', value: c.stats.contrast > 45 ? '하이 콘트라스트' : '로우 콘트라스트' },
        ];
      },
    }),
    choiceStep({
      id: 'tpo',
      title: '어떤 날 입을 옷인가요?',
      subtitle: 'TPO에 맞춰 아이템과 액세서리가 달라져요',
      columns: 4,
      options: (Object.keys(TPOS) as TpoId[]).map((id) => ({ id, emoji: TPOS[id].emoji, label: TPOS[id].label, desc: TPOS[id].desc })),
    }),
    choiceStep({
      id: 'style',
      title: '평소 끌리는 스타일은?',
      columns: 3,
      options: (Object.keys(STYLES) as StyleId[]).map((id) => ({ id, emoji: STYLES[id].emoji, label: STYLES[id].label, desc: STYLES[id].desc })),
    }),
    choiceStep({
      id: 'fit',
      title: '선호하는 핏을 골라주세요',
      columns: 3,
      options: (Object.keys(FITS) as FitId[]).map((id) => ({ id, emoji: FITS[id].emoji, label: FITS[id].label, desc: FITS[id].desc })),
    }),
  ],
  computeResult: (answers) => {
    const { tpo, style } = styleOutfits(answers);
    return `${tpo}-${style}`;
  },
  Result,
  print: (answers) => {
    const capture = getCapture(answers, 'tone');
    const { tone, tpo, style, fit, outfits } = styleOutfits(answers);
    const toneData = TONES[tone];
    return {
      kind: 'receipt',
      eyebrow: 'AI 스타일리스트 코디 추천',
      title: `${TPOS[tpo].label} ${STYLES[style].label} 코디 3벌`,
      photo: capture ? { src: capture.image } : undefined,
      sections: [
        { type: 'big', title: '베스트 코디 매칭', text: `${outfits[0]!.match}%` },
        {
          type: 'rows',
          title: '스타일 프로필',
          rows: [
            { label: '퍼스널 톤', value: toneData.name },
            { label: '팔레트', value: toneData.palette },
            { label: 'TPO', value: TPOS[tpo].label },
            { label: '핏', value: FITS[fit].label },
          ],
        },
        ...outfits.map((look, k) => ({
          type: 'list' as const,
          title: `LOOK 0${k + 1} · ${look.name} ${look.match}%`,
          items: look.pieces.map((p) => `${p.slot} · ${p.color.n} ${p.name}`),
        })),
      ],
      footer: toneData.tip,
    };
  },
});
