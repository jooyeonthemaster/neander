'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import type { DemoAnswers, DemoResultProps } from '@/types/demo';
import {
  Panel,
  ProcessedPhoto,
  ResultShell,
  answersSeed,
  cameraStep,
  choiceStep,
  defineDemo,
  getCapture,
  getChoice,
  seededRandom,
  type PhotoLook,
} from '../kit';

/* ── Data ──────────────────────────────────────────────── */

type EraId = 'samguk' | 'goryeo' | 'joseon' | 'modern';
type Headwear = 'feather' | 'goldcrown' | 'bokdu' | 'veil' | 'gat' | 'jokduri' | 'fedora' | 'cloche';

interface Outfit {
  role: string;
  headwear: Headwear;
  headLabel: string;
  robe: string;
  /** 밝은 옷은 곱하기 합성 대신 그대로 덮는다 */
  light?: boolean;
  trim: string;
  neck: 'v' | 'round';
  extra?: 'bowtie' | 'pearls' | 'goreum';
}

interface Era {
  label: string;
  emoji: string;
  desc: string;
  swatch: string;
  hanja: string;
  title: string;
  period: string;
  scene: string;
  look: PhotoLook;
  frame: { bg: string; border: string; ink: string; accent: string };
  outfits: [Outfit, Outfit];
  summary: string;
  clothing: string;
  event: { year: string; text: string };
  quiz: { q: string; options: string[]; answer: number; explain: string };
}

const ERAS: Record<EraId, Era> = {
  samguk: {
    label: '삼국시대 화랑',
    emoji: '🏹',
    desc: '신라 서라벌의 청년 수련단',
    swatch: 'linear-gradient(135deg,#78350f,#b45309,#fcd34d)',
    hanja: '三國 · 花郞',
    title: '삼국시대 · 신라 화랑',
    period: '기원전 1세기 ~ 7세기',
    scene: '서라벌 남산 수련터',
    look: {
      adjust: { sepia: 0.45, contrast: 1.15, saturation: 0.7, warmth: 0.15 },
      tint: { color: '#92400e', alpha: 0.35, blend: 'soft-light' },
      grain: 20,
      vignette: 0.5,
    },
    frame: { bg: '#1c1208', border: '#b45309', ink: '#fcd34d', accent: '#b45309' },
    outfits: [
      { role: '화랑', headwear: 'feather', headLabel: '깃털 관모(조우관)', robe: '#9f1239', trim: '#fbbf24', neck: 'v' },
      { role: '신라 귀족', headwear: 'goldcrown', headLabel: '금관 장식', robe: '#1e3a8a', trim: '#fbbf24', neck: 'v' },
    ],
    summary:
      '고구려·백제·신라 세 나라가 한반도와 만주에서 경쟁하며 발전한 시대예요. 신라의 화랑은 귀족 자제로 이루어진 청소년 수련 단체로, 명산을 다니며 몸과 마음을 닦고 나라를 지키는 인재로 자랐어요.',
    clothing:
      '저고리(유)와 바지(고) 위에 두루마기 같은 포를 입고 허리띠를 맸어요. 새 깃털을 꽂은 관모(조우관)는 삼국시대 벽화에도 보이는 장식이에요. 신라 무덤에서 나온 금관과 금귀걸이는 신라의 뛰어난 금속 공예 솜씨를 보여 줘요.',
    event: { year: '676년', text: '신라가 당나라 군대를 몰아내고 삼국 통일을 완성했어요.' },
    quiz: {
      q: '화랑이 지켜야 했던 다섯 가지 계율은 무엇일까요?',
      options: ['세속오계', '삼강오륜', '훈민정음', '경국대전'],
      answer: 0,
      explain: '원광 법사가 만든 세속오계에는 "싸움에 나아가 물러서지 않는다(임전무퇴)" 같은 가르침이 담겨 있어요.',
    },
  },
  goryeo: {
    label: '고려 귀족',
    emoji: '🏺',
    desc: '청자처럼 우아한 개경의 귀족',
    swatch: 'linear-gradient(135deg,#1f3b33,#5b8a72,#cfe3d4)',
    hanja: '高麗 · 貴族',
    title: '고려 · 문벌 귀족',
    period: '918년 ~ 1392년',
    scene: '개경 귀족의 사랑채',
    look: { effect: { kind: 'duotone', dark: '#1f3b33', light: '#e3efe2' }, grain: 12, vignette: 0.3 },
    frame: { bg: '#d7e7d9', border: '#5b8a72', ink: '#1f3b33', accent: '#5b8a72' },
    outfits: [
      { role: '고려 관리', headwear: 'bokdu', headLabel: '복두', robe: '#581c87', trim: '#e7e5e4', neck: 'round' },
      { role: '귀족 부인', headwear: 'veil', headLabel: '몽수(너울)', robe: '#f5f5f4', light: true, trim: '#5b8a72', neck: 'v' },
    ],
    summary:
      '왕건이 세운 고려는 불교를 숭상하고 문화를 꽃피운 나라예요. 대대로 높은 벼슬을 이어 온 문벌 귀족이 정치를 이끌었고, 국제 무역항 벽란도에는 아라비아 상인까지 드나들며 "코리아"라는 이름이 서양에 알려졌어요.',
    clothing:
      '관리들은 광종 때 정한 공복 제도에 따라 벼슬 등급별로 자주·붉은·다홍·초록 옷을 입었어요. 귀족 여성은 흰 모시옷을 즐겨 입었고, 외출할 때는 몽수라는 검은 너울을 머리에 써서 얼굴을 가리기도 했어요.',
    event: { year: '1251년', text: '몽골의 침입 속에서 나라를 지키려는 마음을 담아 팔만대장경을 완성했어요.' },
    quiz: {
      q: '고려를 대표하는, 은은한 비취색 도자기는?',
      options: ['고려청자', '백자', '분청사기', '토기'],
      answer: 0,
      explain: '고려청자는 "비색"이라 불린 푸른 빛깔로 유명해요. 12세기에는 무늬를 파내고 다른 흙을 메워 넣는 상감 기법이 발달했어요.',
    },
  },
  joseon: {
    label: '조선 선비·규수',
    emoji: '📜',
    desc: '한지에 먹으로 그린 초상화',
    swatch: 'linear-gradient(135deg,#1c1917,#78716c,#efe6d2)',
    hanja: '朝鮮 · 肖像',
    title: '조선 · 선비와 규수',
    period: '1392년 ~ 1897년',
    scene: '한옥 서재 앞마당',
    look: { effect: { kind: 'ink', paper: '#efe6d2' }, grain: 8, vignette: 0.15 },
    frame: { bg: '#efe6d2', border: '#3f2a1d', ink: '#292524', accent: '#b91c1c' },
    outfits: [
      { role: '선비', headwear: 'gat', headLabel: '갓', robe: '#dbeafe', light: true, trim: '#1c1917', neck: 'v' },
      { role: '규수', headwear: 'jokduri', headLabel: '족두리', robe: '#fef3c7', light: true, trim: '#7e22ce', neck: 'v', extra: 'goreum' },
    ],
    summary:
      '이성계가 세운 조선은 유교를 바탕으로 500년 넘게 이어진 나라예요. 선비는 학문과 예절을 닦으며 올곧은 삶을 추구했고, 세종 때에는 한글이 만들어지고 과학 기술도 크게 발전했어요.',
    clothing:
      '선비는 흰색이나 옥색 도포를 입고, 말총과 대나무로 만든 검은 갓을 썼어요. 규수는 저고리와 풍성한 치마를 입었고, 혼례 같은 큰 날에는 머리에 족두리를 썼어요.',
    event: { year: '1446년', text: '세종대왕이 백성을 위해 만든 훈민정음을 세상에 반포했어요.' },
    quiz: {
      q: '세종대왕이 만든 한글의 처음 이름은?',
      options: ['훈민정음', '이두', '향찰', '구결'],
      answer: 0,
      explain: '훈민정음은 "백성을 가르치는 바른 소리"라는 뜻이에요. 1443년에 만들고 1446년에 반포했어요.',
    },
  },
  modern: {
    label: '개화기 모던보이·모던걸',
    emoji: '🎩',
    desc: '전차가 달리는 경성 거리',
    swatch: 'linear-gradient(135deg,#292524,#a16207,#f5e6c8)',
    hanja: '京城寫眞館',
    title: '개화기 · 모던보이와 모던걸',
    period: '1876년 개항 ~ 1930년대',
    scene: '경성 사진관',
    look: { adjust: { saturation: 0, sepia: 0.85, contrast: 1.12, brightness: 1.05 }, grain: 30, vignette: 0.55 },
    frame: { bg: '#f5efe2', border: '#a8a29e', ink: '#44403c', accent: '#a16207' },
    outfits: [
      { role: '모던보이', headwear: 'fedora', headLabel: '중절모', robe: '#292524', trim: '#f5f5f4', neck: 'v', extra: 'bowtie' },
      { role: '모던걸', headwear: 'cloche', headLabel: '클로슈 모자', robe: '#1e3a8a', trim: '#f5f5f4', neck: 'round', extra: 'pearls' },
    ],
    summary:
      '나라의 문을 연 뒤 전기·철도·전차 같은 새 문물이 빠르게 들어온 시대예요. 1920~30년대 경성 거리에는 양복과 양장을 차려입고 유행을 이끈 "모던보이·모던걸"이 등장했어요.',
    clothing:
      '모던보이는 양복에 나비넥타이를 매고 중절모와 둥근 안경으로 멋을 냈어요. 모던걸은 짧은 단발머리에 종 모양의 클로슈 모자를 쓰고, 무릎길이 양장에 굽 있는 구두를 신었어요.',
    event: { year: '1899년', text: '노량진과 제물포를 잇는 우리나라 최초의 철도, 경인선이 개통했어요.' },
    quiz: {
      q: '1899년에 개통한 우리나라 최초의 철도는?',
      options: ['경인선', '경부선', '경의선', '호남선'],
      answer: 0,
      explain: '경인선은 처음에 노량진~제물포 구간으로 개통했고, 이듬해 한강 철교가 놓이며 서울 도심까지 이어졌어요.',
    },
  },
};

function pickEra(answers: DemoAnswers): EraId {
  return (getChoice(answers, 'era') as EraId | undefined) ?? 'joseon';
}

/* ── Costume overlays (viewBox 300x400 = 3:4 프레임, portrait 좌표) ── */

const BODY_V = 'M20 400 C28 316 72 280 120 268 L150 312 L180 268 C228 280 272 316 280 400 Z';
const BODY_ROUND = 'M20 400 C28 316 72 280 118 268 Q150 298 182 268 C228 280 272 316 280 400 Z';

function HeadwearArt({ kind }: { kind: Headwear }) {
  switch (kind) {
    case 'feather':
      return (
        <g>
          <path d="M140 54 C124 36 116 16 121 2 C132 16 142 34 147 52 Z" fill="#f5f5f4" stroke="#78716c" strokeWidth="1" />
          <path d="M160 54 C176 36 184 16 179 2 C168 16 158 34 153 52 Z" fill="#f5f5f4" stroke="#78716c" strokeWidth="1" />
          <path d="M116 78 Q150 30 184 78 Z" fill="#7f1d1d" />
          <rect x="112" y="72" width="76" height="10" rx="4" fill="#451a03" />
        </g>
      );
    case 'goldcrown':
      return (
        <g fill="#fbbf24" stroke="#b45309" strokeWidth="1">
          {[112, 150, 188].map((x) => (
            <g key={x}>
              <rect x={x - 3} y="22" width="6" height="52" />
              <rect x={x - 14} y="34" width="28" height="4" />
              <rect x={x - 14} y="50" width="28" height="4" />
              <rect x={x - 17} y="30" width="4" height="8" />
              <rect x={x + 13} y="30" width="4" height="8" />
              <rect x={x - 17} y="46" width="4" height="8" />
              <rect x={x + 13} y="46" width="4" height="8" />
            </g>
          ))}
          <path d="M92 86 Q150 62 208 86 L208 74 Q150 50 92 74 Z" />
          {[100, 125, 150, 175, 200].map((x) => (
            <circle key={x} cx={x} cy={x === 150 ? 92 : 90} r="3" fill={x % 50 === 0 ? '#16a34a' : '#fde68a'} />
          ))}
        </g>
      );
    case 'bokdu':
      return (
        <g fill="#1c1917">
          <rect x="30" y="58" width="80" height="6" rx="3" />
          <rect x="190" y="58" width="80" height="6" rx="3" />
          <path d="M104 86 L104 50 Q104 34 126 34 L174 34 Q196 34 196 50 L196 86 Z" />
          <path d="M112 50 Q150 40 188 50" stroke="#57534e" strokeWidth="2" fill="none" />
        </g>
      );
    case 'veil':
      return (
        <path
          d="M84 130 C80 62 114 30 150 30 C186 30 220 62 216 130 L236 320 L198 320 L188 156 C182 106 168 86 150 86 C132 86 118 106 112 156 L102 320 L64 320 Z"
          fill="#0c0a09"
          opacity="0.72"
        />
      );
    case 'gat':
      return (
        <g>
          <path d="M112 84 Q104 160 138 214" stroke="#1c1917" strokeWidth="2" fill="none" />
          <path d="M188 84 Q196 160 162 214" stroke="#1c1917" strokeWidth="2" fill="none" />
          <ellipse cx="150" cy="80" rx="120" ry="15" fill="#0c0a09" opacity="0.7" />
          <ellipse cx="150" cy="80" rx="120" ry="15" fill="none" stroke="#0c0a09" strokeWidth="1.5" />
          <path d="M114 80 L120 22 Q150 14 180 22 L186 80 Z" fill="#0c0a09" opacity="0.88" />
          <rect x="116" y="66" width="68" height="8" fill="#292524" />
        </g>
      );
    case 'jokduri':
      return (
        <g>
          <path d="M120 66 L128 38 L172 38 L180 66 Z" fill="#111827" />
          <path d="M128 38 L150 26 L172 38 Z" fill="#1f2937" />
          <circle cx="150" cy="30" r="4" fill="#ef4444" />
          <circle cx="136" cy="52" r="3.5" fill="#3b82f6" />
          <circle cx="164" cy="52" r="3.5" fill="#3b82f6" />
          <circle cx="150" cy="54" r="4" fill="#fbbf24" />
          <path d="M120 66 Q150 74 180 66" stroke="#b91c1c" strokeWidth="3" fill="none" />
        </g>
      );
    case 'fedora':
      return (
        <g>
          <ellipse cx="150" cy="78" rx="100" ry="14" fill="#1c1917" />
          <path d="M100 78 C100 34 118 20 150 26 C182 20 200 34 200 78 Z" fill="#292524" />
          <path d="M136 28 Q150 42 164 28" stroke="#0c0a09" strokeWidth="3" fill="none" />
          <rect x="100" y="60" width="100" height="12" fill="#0c0a09" />
        </g>
      );
    case 'cloche':
      return (
        <g>
          <path d="M86 106 C82 50 114 28 150 28 C186 28 218 50 214 106 C192 96 170 92 150 92 C130 92 108 96 86 106 Z" fill="#7f1d1d" />
          <path d="M88 96 C110 86 130 84 150 84 C170 84 190 86 212 96" stroke="#450a0a" strokeWidth="6" fill="none" />
          <circle cx="198" cy="84" r="9" fill="#fda4af" />
          <circle cx="198" cy="84" r="4" fill="#be123c" />
        </g>
      );
  }
}

/** 의상·모자 그림 (300×400 좌표) — 화면 오버레이와 출력물이 같이 쓴다 */
function CostumeArt({ outfit }: { outfit: Outfit }) {
  const body = outfit.neck === 'v' ? BODY_V : BODY_ROUND;
  return (
    <>
      {outfit.light ? (
        <path d={body} fill={outfit.robe} opacity="0.88" />
      ) : (
        <>
          <path d={body} fill={outfit.robe} opacity="0.9" style={{ mixBlendMode: 'multiply' }} />
          <path d={body} fill={outfit.robe} opacity="0.5" />
        </>
      )}
      {outfit.neck === 'v' ? (
        <>
          {/* 깃 (오른쪽 섶이 위로 여미는 우임) */}
          <path d="M120 268 L150 312 L160 298 L130 262 Z" fill={outfit.trim} />
          <path d="M180 268 L150 312 L138 330 L172 262 Z" fill={outfit.trim} />
          <path d="M126 264 L150 300 L174 264" stroke="#ffffff" strokeWidth="3" fill="none" opacity="0.85" />
        </>
      ) : (
        <path d="M118 268 Q150 298 182 268" stroke={outfit.trim} strokeWidth="7" fill="none" />
      )}
      {outfit.extra === 'bowtie' && (
        <g fill="#7f1d1d">
          <path d="M150 278 L130 268 L130 290 Z" />
          <path d="M150 278 L170 268 L170 290 Z" />
          <circle cx="150" cy="279" r="5" />
        </g>
      )}
      {outfit.extra === 'pearls' &&
        Array.from({ length: 11 }, (_, i) => {
          const t = i / 10;
          const x = 122 + t * 56;
          const y = 280 + Math.sin(t * Math.PI) * 22;
          return <circle key={i} cx={x} cy={y} r="4" fill="#fafaf9" stroke="#d6d3d1" strokeWidth="0.8" />;
        })}
      {outfit.extra === 'goreum' && (
        <g fill="#be123c">
          <path d="M156 318 L150 380 L160 380 L164 318 Z" />
          <path d="M160 318 L176 372 L184 368 L166 316 Z" />
          <ellipse cx="160" cy="318" rx="10" ry="6" />
        </g>
      )}
      <HeadwearArt kind={outfit.headwear} />
    </>
  );
}

function CostumeOverlay({ outfit }: { outfit: Outfit }) {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 300 400" aria-hidden="true">
      <CostumeArt outfit={outfit} />
    </svg>
  );
}

/** 오래된 사진 얼룩 (왼쪽 아래 · 오른쪽 위) */
const STAINS = [
  { cx: 20, cy: 85, reach: 40, alpha: 0.25 },
  { cx: 85, cy: 15, reach: 35, alpha: 0.18 },
] as const;
const STAIN_RGB = '120,80,30';

/** 출력물용 정적 오버레이 — 의상 + 옛 사진 얼룩 + (조선) 낙관 */
function PrintOverlay({ eraId, outfit }: { eraId: EraId; outfit: Outfit }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" width="900" height="1200">
      <defs>
        {STAINS.map((st, i) => (
          <radialGradient key={i} id={`stain-${i}`} cx={st.cx * 3} cy={st.cy * 4} r={st.reach * 4} gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor={`rgb(${STAIN_RGB})`} stopOpacity={st.alpha} />
            <stop offset="1" stopColor={`rgb(${STAIN_RGB})`} stopOpacity="0" />
          </radialGradient>
        ))}
      </defs>
      <CostumeArt outfit={outfit} />
      {STAINS.map((_, i) => (
        <rect key={i} width="300" height="400" fill={`url(#stain-${i})`} />
      ))}
      {eraId === 'joseon' && (
        <g>
          <rect x="242" y="342" width="44" height="44" fill="#b91c1c" fillOpacity="0.85" stroke="#b91c1c" strokeWidth="2.5" />
          <text x="264" y="372" textAnchor="middle" fontSize="24" fontWeight="700" fontFamily="serif" fill="#f5e6c8">
            我
          </text>
        </g>
      )}
    </svg>
  );
}

const ERA_PAPER: Record<EraId, 'white' | 'cream' | 'black'> = {
  samguk: 'black',
  goryeo: 'white',
  joseon: 'cream',
  modern: 'cream',
};

/* ── Photo card ────────────────────────────────────────── */

function HistoryCard({ era, eraId, outfit, image }: { era: Era; eraId: EraId; outfit: Outfit; image: string }) {
  const f = era.frame;
  const modern = eraId === 'modern';
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, rotate: 2 }}
      animate={{ opacity: 1, y: 0, rotate: -1 }}
      transition={{ duration: 0.6 }}
      className="relative w-[272px] p-3 shadow-2xl shadow-black/50"
      style={{ backgroundColor: f.bg, border: eraId === 'joseon' ? `8px solid ${f.border}` : `2px solid ${f.border}` }}
    >
      {eraId === 'samguk' && (
        <div
          className="pointer-events-none absolute inset-1.5 border-2 border-dashed opacity-60"
          style={{ borderColor: f.border }}
          aria-hidden="true"
        />
      )}
      <div className="relative mb-2 flex items-center justify-between">
        <p className="font-serif text-lg font-bold tracking-[0.2em]" style={{ color: f.ink }}>
          {era.hanja}
        </p>
        <span className="text-[10px] font-medium tracking-widest" style={{ color: f.ink, opacity: 0.7 }}>
          역사 속 나
        </span>
      </div>

      <div
        className={cn('relative aspect-[3/4] w-full overflow-hidden', modern && 'rounded-sm')}
        style={modern ? { boxShadow: `0 0 0 6px #fffdf7, 0 0 0 7px ${f.border}` } : { boxShadow: `0 0 0 1px ${f.border}` }}
      >
        <ProcessedPhoto src={image} look={era.look} className="absolute inset-0 h-full w-full" alt={`${era.title} 역사 사진`} delayMs={1000}>
          <AnimatePresence mode="wait">
            <motion.div
              key={outfit.role}
              className="absolute inset-0"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45 }}
            >
              <CostumeOverlay outfit={outfit} />
            </motion.div>
          </AnimatePresence>
          {/* 오래된 사진 얼룩 */}
          <div
            className="pointer-events-none absolute inset-0 mix-blend-multiply"
            style={{
              background: STAINS.map((st) => `radial-gradient(ellipse at ${st.cx}% ${st.cy}%, rgba(${STAIN_RGB},${st.alpha}), transparent ${st.reach}%)`).join(', '),
            }}
          />
        </ProcessedPhoto>
        {eraId === 'joseon' && (
          <span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center border-2 border-red-700 bg-red-700/85 font-serif text-lg font-bold text-[#f5e6c8]">
            我
          </span>
        )}
      </div>

      <div className="relative mt-2.5 flex items-end justify-between gap-2">
        <div className="min-w-0 text-left">
          <p className="text-sm font-bold" style={{ color: f.ink }}>
            {outfit.role}
          </p>
          <p className="truncate text-[10px]" style={{ color: f.ink, opacity: 0.7 }}>
            {era.scene}
          </p>
        </div>
        <span className="shrink-0 rounded-sm border px-1.5 py-0.5 font-serif text-[9px] font-bold tracking-widest" style={{ borderColor: f.accent, color: f.accent }}>
          NEANDER 歷史寫眞
        </span>
      </div>
    </motion.div>
  );
}

/* ── Quiz ──────────────────────────────────────────────── */

function Quiz({ era, seed, color }: { era: Era; seed: number; color: string }) {
  const [picked, setPicked] = useState<number | null>(null);
  // 정답 위치가 늘 첫 번째가 되지 않게 시드로 섞는다
  const order = era.quiz.options.map((_, i) => i).sort((a, b) => seededRandom(seed, `q${a}`) - seededRandom(seed, `q${b}`));
  const correct = picked === era.quiz.answer;

  return (
    <div>
      <p className="text-sm font-semibold text-white [word-break:keep-all]">Q. {era.quiz.q}</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {order.map((i) => {
          const isAnswer = i === era.quiz.answer;
          const isPicked = picked === i;
          return (
            <motion.button
              key={i}
              type="button"
              whileTap={{ scale: 0.96 }}
              disabled={picked !== null}
              onClick={() => setPicked(i)}
              className={cn(
                'rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors',
                picked === null && 'border-slate-700 text-slate-200 hover:border-slate-500',
                picked !== null && isAnswer && 'border-emerald-400 bg-emerald-500/15 text-emerald-200',
                picked !== null && isPicked && !isAnswer && 'border-rose-400 bg-rose-500/15 text-rose-200',
                picked !== null && !isAnswer && !isPicked && 'border-slate-800 text-slate-500'
              )}
            >
              {picked !== null && isAnswer && '⭕ '}
              {picked !== null && isPicked && !isAnswer && '❌ '}
              {era.quiz.options[i]}
            </motion.button>
          );
        })}
      </div>
      <AnimatePresence>
        {picked !== null && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="overflow-hidden"
          >
            <p className="mt-3 text-sm font-bold" style={{ color: correct ? '#34d399' : color }}>
              {correct ? '정답이에요! 역사 박사 인정 🎉' : `아쉬워요! 정답은 "${era.quiz.options[era.quiz.answer]}"이에요`}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-300 [word-break:keep-all]">{era.quiz.explain}</p>
          </motion.div>
        )}
      </AnimatePresence>
      {picked === null && <p className="mt-2 text-center text-[11px] text-slate-500">답을 골라 정답을 확인해 보세요</p>}
    </div>
  );
}

/* ── Result ────────────────────────────────────────────── */

function Result({ answers, onRestart, pillarColor }: DemoResultProps) {
  const capture = getCapture(answers, 'photo');
  const eraId = pickEra(answers);
  const era = ERAS[eraId];
  const seed = answersSeed(answers);
  const [variant, setVariant] = useState<0 | 1>(0);
  const outfit = era.outfits[variant];

  return (
    <ResultShell
      eyebrow={`${era.emoji} ${era.title}`}
      title="역사 속으로 시간 여행 성공!"
      description={`${era.period}, ${era.scene}에서 ${outfit.role}의 모습으로 찍은 사진이에요.`}
      pillarColor={pillarColor}
      onRestart={onRestart}
      restartLabel="다른 시대로 떠나기"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="flex rounded-xl border border-slate-700 bg-slate-900/60 p-1" role="tablist" aria-label="의상 선택">
          {era.outfits.map((o, i) => (
            <button
              key={o.role}
              type="button"
              role="tab"
              aria-selected={variant === i}
              onClick={() => setVariant(i as 0 | 1)}
              className={cn('rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors', variant === i ? 'text-white' : 'text-slate-400 hover:text-slate-200')}
              style={variant === i ? { backgroundColor: pillarColor } : undefined}
            >
              {o.role}
            </button>
          ))}
        </div>
        {capture && <HistoryCard era={era} eraId={eraId} outfit={outfit} image={capture.image} />}
      </div>

      <Panel title="역사 교육 카드">
        <div className="space-y-4 text-sm">
          <div>
            <p className="mb-1 flex items-center justify-between">
              <span className="font-semibold text-white">🗺️ 어떤 시대였을까?</span>
              <span className="text-[11px] text-slate-500">{era.period}</span>
            </p>
            <p className="leading-relaxed text-slate-300 [word-break:keep-all]">{era.summary}</p>
          </div>
          <div className="border-t border-slate-800 pt-4">
            <p className="mb-1 font-semibold text-white">👘 의상 해설 · {outfit.headLabel}</p>
            <p className="leading-relaxed text-slate-300 [word-break:keep-all]">{era.clothing}</p>
          </div>
          <div className="flex gap-3 border-t border-slate-800 pt-4">
            <span className="h-fit shrink-0 rounded-lg px-2.5 py-1 font-mono text-xs font-bold" style={{ backgroundColor: `${pillarColor}22`, color: pillarColor }}>
              {era.event.year}
            </span>
            <div>
              <p className="font-semibold text-white">📌 이 시대의 주요 사건</p>
              <p className="mt-0.5 leading-relaxed text-slate-300 [word-break:keep-all]">{era.event.text}</p>
            </div>
          </div>
        </div>
      </Panel>

      <Panel title="오늘의 역사 퀴즈">
        <Quiz key={eraId} era={era} seed={seed} color={pillarColor} />
      </Panel>
    </ResultShell>
  );
}

/* ── Export ─────────────────────────────────────────────── */

export default defineDemo({
  config: {
    id: 'history-travel',
    targetSlug: 'ai-history-travel',
    industryId: 'education',
    analyzeEmoji: '⏳',
    analyzeDurationMs: 3500,
    analyzeImageStepId: 'photo',
    analyzeMessages: ['시대 고증 자료 찾는 중', '시대 의상 입히는 중', '옛 사진 질감 입히는 중', '역사 교육 카드 만드는 중'],
  },
  steps: [
    choiceStep({
      id: 'era',
      title: '어느 시대로 떠나 볼까요?',
      subtitle: '시대에 맞는 의상과 사진 질감으로 합성해 드려요',
      columns: 2,
      options: (Object.keys(ERAS) as EraId[]).map((id) => ({
        id,
        emoji: ERAS[id].emoji,
        label: ERAS[id].label,
        desc: ERAS[id].desc,
        swatch: ERAS[id].swatch,
      })),
    }),
    cameraStep({
      id: 'photo',
      title: '시간 여행 사진을 찍어요',
      subtitle: '정면을 보고 바르게 서 주세요. 3초 뒤에 찍혀요',
      mode: 'portrait',
      subject: '모습',
      countdown: true,
      scanLabels: ['인물 영역 분리', '머리·어깨 위치 측정', '시대 의상 치수 맞춤', '옛 사진 질감 준비'],
      readouts: (c) => [
        { label: '자세', value: c.stats.contrast > 42 ? '늠름함' : '단정함' },
        { label: '의상 핏', value: `${86 + (c.seed % 13)}%` },
      ],
    }),
  ],
  computeResult: (answers) => pickEra(answers),
  Result,
  print: (answers) => {
    const capture = getCapture(answers, 'photo');
    const eraId = pickEra(answers);
    const era = ERAS[eraId];
    // 결과 화면이 처음 보여주는 의상
    const outfit = era.outfits[0];
    return {
      kind: 'photo',
      photos: capture
        ? [{ src: capture.image, look: era.look, label: outfit.role, overlay: <PrintOverlay eraId={eraId} outfit={outfit} /> }]
        : [],
      title: era.title,
      caption: `${era.period} · ${era.scene}`,
      badge: era.hanja,
      paper: ERA_PAPER[eraId],
    };
  },
});
