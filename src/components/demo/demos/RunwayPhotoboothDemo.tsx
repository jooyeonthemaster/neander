'use client';

import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import type { DemoAnswers, DemoResultProps } from '@/types/demo';
import {
  Panel,
  ProcessedPhoto,
  ResultShell,
  TraitChips,
  answersSeed,
  cameraStep,
  choiceStep,
  defineDemo,
  getCapture,
  getChoice,
  seededInt,
  seededPick,
  seededRandom,
  type PhotoLook,
} from '../kit';

/* ── Data ──────────────────────────────────────────────── */

type ConceptId = 'paris' | 'milan' | 'seoul' | 'ny';
type PoseId = 'walk' | 'shoulder' | 'power' | 'close';

interface Concept {
  label: string;
  emoji: string;
  desc: string;
  swatch: string;
  city: string;
  kicker: string;
  headline: string;
  sub: string;
  lines: string[];
  outfit: string;
  hair: string;
  makeup: string;
  masthead: string;
  accent: string;
  serif: boolean;
  look: PhotoLook;
}

const CONCEPTS: Record<ConceptId, Concept> = {
  paris: {
    label: '파리 오트쿠튀르',
    emoji: '🗼',
    desc: '실크와 레이스의 우아한 쿠튀르',
    swatch: 'linear-gradient(135deg, #1c1917, #b08d57 55%, #f5e6d3)',
    city: 'PARIS',
    kicker: 'HAUTE COUTURE',
    headline: 'THE NEW MUSE',
    sub: '파리가 주목한 새 얼굴',
    lines: ['실크와 레이스로 쓴 새 시즌', '쿠튀르 백스테이지 24시'],
    outfit: '아이보리 실크 드레이프 가운',
    hair: '로우 시뇽 번',
    makeup: '누드 글로우 + 버건디 립',
    masthead: '#f7ecd9',
    accent: '#d4af37',
    serif: true,
    look: {
      adjust: { contrast: 1.12, saturation: 0.85, warmth: 0.12, brightness: 1.04 },
      tint: { color: '#f5d0c5', alpha: 0.3, blend: 'soft-light' },
      vignette: 0.4,
      grain: 8,
    },
  },
  milan: {
    label: '밀라노 미니멀',
    emoji: '🏛️',
    desc: '흑백 톤의 절제된 테일러링',
    swatch: 'linear-gradient(135deg, #0a0a0a, #737373 55%, #fafafa)',
    city: 'MILANO',
    kicker: 'THE MINIMAL ISSUE',
    headline: 'LESS IS MORE',
    sub: '밀라노의 절제된 우아함',
    lines: ['블랙 & 화이트 테일러링', '구조적인 실루엣 연구'],
    outfit: '블랙 울 테일러드 수트',
    hair: '슬릭 백 포니테일',
    makeup: '매트 스킨 + 샤프 브로우',
    masthead: '#ffffff',
    accent: '#e5e5e5',
    serif: true,
    look: { adjust: { saturation: 0, contrast: 1.3, brightness: 1.06 }, vignette: 0.25, grain: 12 },
  },
  seoul: {
    label: '서울 스트릿',
    emoji: '🏙️',
    desc: '네온 조명 아래 힙한 스트릿',
    swatch: 'linear-gradient(135deg, #7c3aed, #ec4899 55%, #22d3ee)',
    city: 'SEOUL',
    kicker: 'STREET NOW',
    headline: 'NEON NIGHTS',
    sub: '성수동에서 만난 스트릿 아이콘',
    lines: ['오버사이즈 레이어링 공식', '네온 아래 스냅 12컷'],
    outfit: '오버사이즈 바시티 재킷 + 카고 팬츠',
    hair: '웻 텍스처 레이어드 컷',
    makeup: '글리터 언더 + 체리 틴트',
    masthead: '#f0abfc',
    accent: '#22d3ee',
    serif: false,
    look: {
      adjust: { saturation: 1.3, contrast: 1.15 },
      paints: [
        { x: 0, y: 30, rx: 50, ry: 42, color: '#ec4899', alpha: 0.55, blend: 'screen' },
        { x: 0, y: 30, rx: 50, ry: 42, color: '#ec4899', alpha: 0.35, blend: 'multiply' },
        { x: 100, y: 70, rx: 50, ry: 42, color: '#22d3ee', alpha: 0.5, blend: 'screen' },
        { x: 100, y: 70, rx: 50, ry: 42, color: '#22d3ee', alpha: 0.35, blend: 'multiply' },
      ],
      tint: { color: '#7c3aed', alpha: 0.25, blend: 'soft-light' },
      grain: 14,
    },
  },
  ny: {
    label: '뉴욕 모던',
    emoji: '🗽',
    desc: '도시적인 모던 시크',
    swatch: 'linear-gradient(135deg, #0f172a, #0ea5e9 55%, #f97316)',
    city: 'NEW YORK',
    kicker: 'MODERN CITY',
    headline: 'CITY OF ICONS',
    sub: '맨해튼 스타일의 새 공식',
    lines: ['트렌치코트의 재발견', '출근길 런웨이 룩북'],
    outfit: '카멜 더블 트렌치코트',
    hair: '볼륨 웨이브 로브',
    makeup: '브론즈 섀도 + 누드 립',
    masthead: '#ef4444',
    accent: '#fb923c',
    serif: false,
    look: {
      adjust: { contrast: 1.2, saturation: 1.05, warmth: -0.12 },
      tint: { color: '#0ea5e9', alpha: 0.22, blend: 'soft-light' },
      paints: [{ x: 85, y: 15, rx: 40, ry: 30, color: '#fb923c', alpha: 0.35, blend: 'screen' }],
      vignette: 0.3,
    },
  },
};

const POSES: Record<PoseId, { label: string; emoji: string; desc: string; zoom: number; origin: string; note: string }> = {
  walk: { label: '캣워크', emoji: '🚶', desc: '런웨이를 걷는 순간', zoom: 1, origin: '50% 50%', note: '걸음의 리듬이 살아 있어요. 어깨 라인이 조명에 딱 맞았어요.' },
  shoulder: { label: '오버 더 숄더', emoji: '💁', desc: '어깨 너머로 보내는 시선', zoom: 1.12, origin: '45% 30%', note: '돌아보는 시선이 표지 컷으로 완벽해요. 목선이 길어 보여요.' },
  power: { label: '파워 포즈', emoji: '🦸', desc: '당당한 정면 응시', zoom: 1.05, origin: '50% 40%', note: '정면 응시가 강렬해요. 커버 스타의 에너지가 느껴져요.' },
  close: { label: '뷰티 클로즈업', emoji: '👁️', desc: '얼굴에 집중한 컷', zoom: 1.4, origin: '50% 20%', note: '눈빛에 집중한 뷰티 컷이에요. 피부 결이 조명을 잘 받았어요.' },
};

const PHOTOGRAPHERS = ['포토그래퍼 J.', '포토그래퍼 M.', '포토그래퍼 S.', '포토그래퍼 R.'];

function getConcept(answers: DemoAnswers): ConceptId {
  const id = getChoice(answers, 'concept');
  return id && id in CONCEPTS ? (id as ConceptId) : 'paris';
}

function getPose(answers: DemoAnswers): PoseId {
  const id = getChoice(answers, 'pose');
  return id && id in POSES ? (id as PoseId) : 'walk';
}

/** 표지 번호·포토그래퍼 — 결과 화면과 출력물이 같은 값을 쓴다 */
function coverOf(answers: DemoAnswers) {
  const seed = answersSeed(answers);
  return {
    seed,
    vol: seededInt(seed, 'vol', 21, 48),
    photographer: seededPick(seed, 'photographer', PHOTOGRAPHERS),
    looksCount: seededInt(seed, 'looks', 12, 36),
  };
}

/* ── Cover parts ───────────────────────────────────────── */

function barcodeBars(seed: number) {
  return Array.from({ length: 30 }, (_, i) => ({ w: 1 + Math.floor(seededRandom(seed, `bar${i}`) * 3), dark: i % 2 === 0 }));
}

/** CSS 막대로 만든 장식용 바코드 */
function Barcode({ seed }: { seed: number }) {
  const bars = barcodeBars(seed);
  return (
    <div className="flex h-7 items-stretch" aria-hidden="true">
      {bars.map((b, i) => (
        <span key={i} className={b.dark ? 'bg-black' : 'bg-transparent'} style={{ width: b.w }} />
      ))}
    </div>
  );
}

function RunwayLights({ color }: { color: string }) {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full mix-blend-screen" viewBox="0 0 300 400" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="runway-beam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="runway-flash">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      <polygon points="40,0 70,0 150,400 20,400" fill="url(#runway-beam)" opacity="0.35" />
      <polygon points="230,0 260,0 280,400 150,400" fill="url(#runway-beam)" opacity="0.3" />
      {[
        [18, 300, 10],
        [34, 330, 6],
        [270, 290, 9],
        [285, 340, 5],
        [8, 360, 7],
      ].map(([x, y, r]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill="url(#runway-flash)" />
      ))}
    </svg>
  );
}

/* ── Print cover (정적 SVG, 300×400) ──────────────────── */

const SERIF = 'Didot, "Bodoni 72", Georgia, "Times New Roman", serif';
const SANS = 'Pretendard, "Apple SD Gothic Neo", "Malgun Gothic", "Noto Sans KR", "Helvetica Neue", Arial, sans-serif';

/** 결과 화면의 매거진 표지(마스트헤드·스티커·커버 라인·바코드)를 출력물 위에 그대로 얹는다 */
function CoverPrint({ concept, seed, vol, looksCount }: { concept: Concept; seed: number; vol: number; looksCount: number }) {
  // 화면 바코드(px 막대)를 표지 좌표로 옮긴다 — 1px ≈ 0.9
  const raw = barcodeBars(seed);
  const bars = raw.map((b, i) => ({ ...b, x: raw.slice(0, i).reduce((sum, p) => sum + p.w * 0.9, 0) }));
  const barW = raw.reduce((sum, p) => sum + p.w * 0.9, 0);
  const boxW = barW + 10;
  const boxX = 300 - 10 - boxW;

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" width={1200} height={1600}>
      <defs>
        <linearGradient id="cover-top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000000" stopOpacity="0.6" />
          <stop offset="1" stopColor="#000000" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="cover-bottom" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#000000" stopOpacity="0.85" />
          <stop offset="0.5" stopColor="#000000" stopOpacity="0.4" />
          <stop offset="1" stopColor="#000000" stopOpacity="0" />
        </linearGradient>
      </defs>
      <RunwayLights color={concept.accent} />
      <rect width="300" height="133" fill="url(#cover-top)" />
      <rect y="180" width="300" height="220" fill="url(#cover-bottom)" />

      {/* 마스트헤드 */}
      <g fontFamily={SANS} fontSize="7" fontWeight="600" letterSpacing="1.75" fill="#ffffff" fillOpacity="0.8">
        <text x="10.5" y="14">THE RUNWAY ISSUE</text>
        <text x="289.5" y="14" textAnchor="end">
          FW 2026
        </text>
      </g>
      <text
        x="150"
        y="70"
        textAnchor="middle"
        textLength="272"
        lengthAdjust="spacingAndGlyphs"
        fontSize="61"
        fontWeight={concept.serif ? 700 : 900}
        fontFamily={concept.serif ? SERIF : SANS}
        fill={concept.masthead}
      >
        NEANDER
      </text>
      <g fontFamily={SANS} fontSize="7" fontWeight="700" letterSpacing="1.4" fill={concept.accent}>
        <text x="10.5" y="84">{`${concept.city} EDITION`}</text>
        <text x="289.5" y="84" textAnchor="end">{`VOL.${vol}`}</text>
      </g>

      {/* AI 커버 스타 스티커 */}
      <g transform="translate(261 156) rotate(12)" fontFamily={SANS} fontWeight="700" textAnchor="middle" fill="#020617">
        <circle r="28" fill={concept.accent} />
        <text y="-7" fontSize="7" letterSpacing="1.4">AI</text>
        <text y="3" fontSize="9">COVER</text>
        <text y="13" fontSize="9">STAR</text>
      </g>

      {/* 커버 라인 */}
      <text x="10.5" y="297" fontFamily={SANS} fontSize="8" fontWeight="700" letterSpacing="2.4" fill={concept.accent}>
        {concept.kicker}
      </text>
      <text
        x="10.5"
        y="321"
        fontFamily={concept.serif ? SERIF : SANS}
        fontSize="23"
        fontWeight={concept.serif ? 700 : 900}
        fontStyle={concept.serif ? 'italic' : 'normal'}
        fill="#ffffff"
      >
        {concept.headline}
      </text>
      <text x="10.5" y="339" fontFamily={SANS} fontSize="10.5" fontWeight="600" fill="#ffffff" fillOpacity="0.9">
        {concept.sub}
      </text>
      <g fontFamily={SANS} fontSize="8" fontWeight="500" fill="#ffffff" fillOpacity="0.8">
        {[...concept.lines, `${concept.label} 룩 ${looksCount}선`].map((line, i) => (
          <text key={line} x="10.5" y={362 + i * 12}>{`+ ${line}`}</text>
        ))}
      </g>

      {/* 바코드 */}
      <g transform={`translate(${boxX} 352)`}>
        <rect width={boxW} height="38" rx="1.5" fill="#ffffff" />
        {bars.map((b, i) => (b.dark ? <rect key={i} x={5 + b.x} y="4" width={b.w * 0.9} height="23" fill="#000000" /> : null))}
        <g fontFamily="ui-monospace, Menlo, monospace" fontSize="6" fill="#000000">
          <text x="5" y="34.5">₩15,000</text>
          <text x={boxW - 5} y="34.5" textAnchor="end">{`${String(vol).padStart(3, '0')}09`}</text>
        </g>
      </g>
    </svg>
  );
}

const PAPER: Record<ConceptId, 'white' | 'cream' | 'black'> = { paris: 'cream', milan: 'white', seoul: 'black', ny: 'white' };

/* ── Result ────────────────────────────────────────────── */

function Result({ answers, onRestart, pillarColor }: DemoResultProps) {
  const capture = getCapture(answers, 'portrait');
  const conceptId = getConcept(answers);
  const concept = CONCEPTS[conceptId];
  const pose = POSES[getPose(answers)];
  const { seed, vol, photographer, looksCount } = coverOf(answers);

  return (
    <ResultShell
      eyebrow={`${concept.city} RUNWAY · 패션지 커버`}
      title="커버 스타로 데뷔했어요!"
      description={`${concept.label} 컬렉션 무드로 ${pose.label} 컷을 담은 나만의 매거진 표지예요.`}
      pillarColor={pillarColor}
      onRestart={onRestart}
      restartLabel="다른 컨셉으로 촬영"
    >
      <motion.div
        initial={{ opacity: 0, y: 24, rotate: -2 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ duration: 0.7 }}
        className="relative aspect-[3/4] w-full max-w-[340px] overflow-hidden rounded-md bg-slate-900 text-left shadow-[0_24px_60px_rgba(0,0,0,0.6)]"
      >
        {capture && (
          <div className="absolute inset-0" style={{ transform: `scale(${pose.zoom})`, transformOrigin: pose.origin }}>
            <ProcessedPhoto src={capture.image} look={concept.look} className="h-full w-full" alt={`${concept.label} 커버 사진`} delayMs={1100} />
          </div>
        )}
        <RunwayLights color={concept.accent} />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-black/60 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

        {/* Masthead */}
        <div className="absolute inset-x-0 top-0 px-3 pt-2">
          <div className="flex justify-between text-[8px] font-semibold tracking-[0.25em] text-white/80">
            <span>THE RUNWAY ISSUE</span>
            <span>FW 2026</span>
          </div>
          <svg viewBox="0 0 300 64" className="w-full" aria-label="NEANDER">
            <text
              x="150"
              y="56"
              textAnchor="middle"
              textLength="292"
              lengthAdjust="spacingAndGlyphs"
              fontSize="66"
              fontWeight={concept.serif ? 700 : 900}
              fontFamily={concept.serif ? 'Didot, "Bodoni 72", Georgia, "Times New Roman", serif' : 'inherit'}
              fill={concept.masthead}
              className={concept.serif ? undefined : 'font-display'}
            >
              NEANDER
            </text>
          </svg>
          <div className="flex items-center justify-between text-[8px] font-bold tracking-[0.2em]" style={{ color: concept.accent }}>
            <span>{concept.city} EDITION</span>
            <span>VOL.{vol}</span>
          </div>
        </div>

        {/* AI cover star sticker */}
        <motion.div
          initial={{ scale: 0, rotate: -40 }}
          animate={{ scale: 1, rotate: 12 }}
          transition={{ type: 'spring', stiffness: 160, damping: 12, delay: 1.4 }}
          className="absolute right-3 top-[32%] flex h-16 w-16 flex-col items-center justify-center rounded-full text-center font-bold leading-tight text-slate-950 shadow-lg"
          style={{ backgroundColor: concept.accent }}
        >
          <span className="text-[8px] tracking-widest">AI</span>
          <span className="text-[10px]">COVER</span>
          <span className="text-[10px]">STAR</span>
        </motion.div>

        {/* Cover lines */}
        <div className="absolute bottom-3 left-3 right-3">
          <p className="text-[9px] font-bold tracking-[0.3em]" style={{ color: concept.accent }}>
            {concept.kicker}
          </p>
          <p
            className={cn('mt-0.5 text-[26px] font-extrabold leading-[0.95] text-white drop-shadow', concept.serif ? 'italic' : 'font-display')}
            style={concept.serif ? { fontFamily: 'Didot, "Bodoni 72", Georgia, serif' } : undefined}
          >
            {concept.headline}
          </p>
          <p className="mt-1 text-xs font-semibold text-white/90">{concept.sub}</p>
          <div className="mt-2 flex items-end justify-between gap-2">
            <ul className="space-y-0.5 text-[9px] font-medium text-white/80">
              {concept.lines.map((line) => (
                <li key={line}>+ {line}</li>
              ))}
              <li>+ {concept.label} 룩 {looksCount}선</li>
            </ul>
            <div className="shrink-0 rounded-sm bg-white px-1.5 pb-0.5 pt-1">
              <Barcode seed={seed} />
              <p className="mt-0.5 flex justify-between gap-2 font-mono text-[7px] text-black">
                <span>₩15,000</span>
                <span>{String(vol).padStart(3, '0')}09</span>
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <TraitChips title="적용된 AI 변환" items={['컬렉션 컬러 그레이딩', `${concept.city} 런웨이 조명`, '매거진 표지 레이아웃', `${pose.label} 크롭`]} />

      <Panel title="스타일링 크레딧">
        <dl className="space-y-3 text-sm">
          {[
            { term: '👗 착장', detail: `${concept.outfit} · NEANDER Atelier` },
            { term: '💇 헤어', detail: concept.hair },
            { term: '💄 메이크업', detail: concept.makeup },
            { term: `${pose.emoji} 포즈`, detail: pose.label },
          ].map((row) => (
            <div key={row.term} className="flex gap-4">
              <dt className="w-20 shrink-0 text-slate-500">{row.term}</dt>
              <dd className="text-slate-200 [word-break:keep-all]">{row.detail}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 rounded-xl bg-slate-950/60 p-3 text-xs leading-relaxed text-slate-300 [word-break:keep-all]">
          📸 {photographer}의 코멘트: &ldquo;{pose.note}&rdquo;
        </p>
        <p className="mt-3 text-[11px] text-slate-500 [word-break:keep-all]">현장 부스에서는 위 착장을 AI가 전신 사진에 직접 입혀 고화질로 출력해요.</p>
      </Panel>
    </ResultShell>
  );
}

/* ── Export ─────────────────────────────────────────────── */

export default defineDemo({
  config: {
    id: 'runway-photobooth',
    targetSlug: 'ai-runway-photobooth',
    industryId: 'fashion',
    analyzeEmoji: '📸',
    analyzeDurationMs: 3600,
    analyzeImageStepId: 'portrait',
    analyzeMessages: ['런웨이 조명 세팅 중', '컬렉션 의상 피팅 중', '런웨이 배경 합성 중', '매거진 표지 편집 중'],
  },
  steps: [
    choiceStep({
      id: 'concept',
      title: '어느 런웨이에 설까요?',
      subtitle: '컬렉션 컨셉에 따라 의상·배경·조명이 달라져요',
      columns: 2,
      options: (Object.keys(CONCEPTS) as ConceptId[]).map((id) => ({
        id,
        emoji: CONCEPTS[id].emoji,
        label: CONCEPTS[id].label,
        desc: CONCEPTS[id].desc,
        swatch: CONCEPTS[id].swatch,
      })),
    }),
    choiceStep({
      id: 'pose',
      title: '표지 포즈를 골라주세요',
      subtitle: '촬영할 때 이 포즈를 취해 주세요',
      columns: 2,
      options: (Object.keys(POSES) as PoseId[]).map((id) => ({ id, emoji: POSES[id].emoji, label: POSES[id].label, desc: POSES[id].desc })),
    }),
    cameraStep({
      id: 'portrait',
      title: '런웨이 조명 아래 섰어요',
      subtitle: '셔터를 누르면 3초 뒤 찰칵! 고른 포즈를 취해 주세요',
      mode: 'portrait',
      subject: '모습',
      countdown: true,
      scanLabels: ['인물 영역 분리', '포즈·실루엣 측정', '런웨이 조명 매칭', '의상 피팅 포인트 추출'],
      readouts: (c) => [
        { label: '실루엣', value: `${(7.4 + (c.seed % 9) / 10).toFixed(1)}등신` },
        { label: '포즈 점수', value: `${86 + (c.seed % 13)}점` },
        { label: '조명', value: c.stats.contrast > 45 ? '드라마틱' : '소프트' },
        { label: '베스트 앵글', value: seededPick(c.seed, 'angle', ['정면', '좌 15°', '우 15°']) },
      ],
    }),
  ],
  computeResult: (answers) => getConcept(answers),
  Result,
  print: (answers) => {
    const capture = getCapture(answers, 'portrait');
    const conceptId = getConcept(answers);
    const concept = CONCEPTS[conceptId];
    const pose = POSES[getPose(answers)];
    const { seed, vol, photographer, looksCount } = coverOf(answers);
    return {
      kind: 'photo',
      photos: capture
        ? [{ src: capture.image, look: concept.look, overlay: <CoverPrint concept={concept} seed={seed} vol={vol} looksCount={looksCount} /> }]
        : [],
      title: '커버 스타로 데뷔했어요!',
      caption: `${concept.label} · ${pose.label} 컷 · ${photographer}`,
      paper: PAPER[conceptId],
    };
  },
});
