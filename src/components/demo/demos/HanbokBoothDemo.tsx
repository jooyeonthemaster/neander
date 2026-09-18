'use client';

import { useId, useState } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import type { DemoAnswers, DemoResultProps } from '@/types/demo';
import {
  InfoGrid,
  Panel,
  ProcessedPhoto,
  ResultShell,
  answersSeed,
  cameraStep,
  choiceStep,
  defineDemo,
  getCapture,
  getChoice,
  seededInt,
  type PhotoLook,
} from '../kit';

/* ── Data ──────────────────────────────────────────────── */

type StyleId = 'king' | 'queen' | 'scholar' | 'modern';

interface HanbokStyle {
  label: string;
  name: string;
  hanja: string;
  emoji: string;
  desc: string;
  swatch: string;
  /** 겉감 · 그늘 · 깃 · 동정 · 고름/포인트 · 치마 */
  robe: string;
  robeDark: string;
  collar: string;
  accent: string;
  skirt?: string;
  ko: string;
  en: string;
}

const STYLES: Record<StyleId, HanbokStyle> = {
  king: {
    label: '왕',
    name: '곤룡포',
    hanja: '袞龍袍',
    emoji: '👑',
    desc: '붉은 비단 위 금빛 용보',
    swatch: 'radial-gradient(circle at 50% 55%, #fbbf24 0 22%, transparent 23%), linear-gradient(135deg, #dc2626, #7f1d1d)',
    robe: '#c81e1e',
    robeDark: '#7f1d1d',
    collar: '#6b1212',
    accent: '#e0a91b',
    ko: '조선의 임금이 평소 나랏일을 볼 때 입던 붉은 옷이에요. 가슴과 어깨에 붙인 금빛 용무늬 보(補)가 왕의 권위를 상징해요.',
    en: 'The red dragon robe Joseon kings wore for everyday royal duties.',
  },
  queen: {
    label: '왕비',
    name: '적의',
    hanja: '翟衣',
    emoji: '👸',
    desc: '짙은 청색 비단과 금박',
    swatch: 'radial-gradient(circle at 30% 40%, #fcd34d 0 8%, transparent 9%), radial-gradient(circle at 70% 65%, #fcd34d 0 8%, transparent 9%), linear-gradient(135deg, #1d4ed8, #172554)',
    robe: '#1e3a8a',
    robeDark: '#0f1d4a',
    collar: '#b91c1c',
    accent: '#e0a91b',
    ko: '왕비가 가장 격식 있는 의식에서 입던 대례복이에요. 짙은 청색 바탕에 꿩(翟) 무늬를 수놓아 왕실의 품격을 드러냈어요.',
    en: "The Queen's most formal ceremonial robe, deep blue with pheasant motifs.",
  },
  scholar: {
    label: '선비',
    name: '도포와 갓',
    hanja: '道袍',
    emoji: '🎩',
    desc: '단정한 옥색 도포와 흑립',
    swatch: 'linear-gradient(180deg, #111827 0 22%, #e2ebe0 22% 100%)',
    robe: '#e4ece1',
    robeDark: '#a9b8a5',
    collar: '#1f2937',
    accent: '#7f1d1d',
    ko: '조선 선비들이 외출할 때 입던 겉옷이에요. 말총으로 엮은 검은 갓과 함께 곧고 단정한 선비 정신을 보여줘요.',
    en: 'The outer robe Joseon scholars wore with a black horsehair gat hat.',
  },
  modern: {
    label: '현대 한복',
    name: '모던 한복',
    hanja: '韓服',
    emoji: '🌸',
    desc: '파스텔 저고리 · 데일리 한복',
    swatch: 'linear-gradient(180deg, #f9a8d4 0 55%, #0d9488 55% 62%, #1e1b4b 62% 100%)',
    robe: '#f7a8cd',
    robeDark: '#d9739f',
    collar: '#0d9488',
    accent: '#7c3aed',
    skirt: '#1e1b4b',
    ko: '전통의 선과 색은 살리고 요즘 옷처럼 편하게 입도록 만든 한복이에요. 고궁 나들이의 필수 아이템이 되었어요.',
    en: 'Modern hanbok keeps the classic lines but is comfortable enough for daily wear.',
  },
};

type BackdropId = 'palace' | 'village' | 'garden';

const BACKDROPS: Record<BackdropId, { label: string; en: string; hanja: string; emoji: string; desc: string; swatch: string; ko: string; enDesc: string }> = {
  palace: {
    label: '경복궁',
    en: 'Gyeongbokgung Palace',
    hanja: '景福宮',
    emoji: '🏯',
    desc: '노을 진 궁궐 앞마당',
    swatch: 'linear-gradient(180deg, #fde68a, #fb923c 55%, #3f3f46 56%, #3f3f46 70%, #9f1239 71%)',
    ko: '1395년 조선의 으뜸 궁궐(법궁)로 지어졌어요. 이름에는 “새 왕조가 큰 복을 누리라”는 뜻이 담겨 있어요.',
    enDesc: "Joseon's main royal palace, built in 1395 — its name wishes the kingdom great blessings.",
  },
  village: {
    label: '한옥마을',
    en: 'Hanok Village',
    hanja: '韓屋村',
    emoji: '🏘️',
    desc: '기와지붕이 이어진 골목',
    swatch: 'linear-gradient(180deg, #bae6fd, #e0f2fe 45%, #334155 46%, #334155 58%, #f5f5f4 59%, #a8a29e)',
    ko: '기와지붕과 돌담이 이어진 전통 가옥 마을이에요. 하늘로 살짝 들린 처마 곡선이 한옥의 멋이에요.',
    enDesc: 'A neighborhood of tiled-roof houses whose eaves curve gently toward the sky.',
  },
  garden: {
    label: '전통 정원',
    en: 'Traditional Garden',
    hanja: '庭園',
    emoji: '🪷',
    desc: '연못과 정자가 있는 봄 정원',
    swatch: 'linear-gradient(180deg, #fce7f3, #fef9c3 50%, #4d7c0f 51%, #0e7490 75%, #155e75)',
    ko: '자연을 거스르지 않고 그대로 끌어들인 한국식 정원이에요. 연못가 정자에 앉아 계절을 감상했어요.',
    enDesc: 'Korean gardens borrow nature as it is — a lotus pond, willows and a pavilion.',
  },
};

const GREETINGS = [
  { id: 'ko', label: '한국어', text: '한복이 정말 잘 어울려요!' },
  { id: 'en', label: 'English', text: 'You look wonderful in hanbok!' },
  { id: 'zh', label: '中文', text: '你穿韩服真好看！' },
  { id: 'ja', label: '日本語', text: '韓服がとてもお似合いです！' },
];

const WARM_LOOK: PhotoLook = {
  adjust: { brightness: 1.06, contrast: 1.04, saturation: 1.12, warmth: 0.22 },
  tint: { color: '#fbbf24', alpha: 0.12, blend: 'soft-light' },
  vignette: 0.2,
};

/* ── Backdrop scenes (300×400, 인물 영역은 마스크로 비운다) ── */

function PalaceScene() {
  return (
    <>
      <rect width="300" height="400" fill="url(#hb-sky-palace)" />
      <circle cx="238" cy="72" r="22" fill="#fff7ed" opacity="0.7" />
      <path d="M0 150 C40 108 78 98 118 124 C160 88 214 78 300 128 V400 H0 Z" fill="#7c5a4a" opacity="0.45" />
      {/* 상층 지붕 */}
      <path d="M36 128 Q56 112 72 96 H228 Q244 112 264 128 Z" fill="#374151" />
      <path d="M64 98 H236" stroke="#1f2937" strokeWidth="7" strokeLinecap="round" />
      {/* 하층 지붕 — 처마 곡선 */}
      <path d="M-14 176 Q14 158 34 130 H266 Q286 158 314 176 Q150 162 -14 176 Z" fill="#3f3f46" />
      <path d="M-14 176 Q150 162 314 176" stroke="#18181b" strokeWidth="3" fill="none" />
      {/* 단청 띠 */}
      <rect x="12" y="176" width="276" height="10" fill="#15803d" />
      <g fill="#1d4ed8">
        {[24, 64, 104, 144, 184, 224, 264].map((x) => (
          <rect key={x} x={x} y="178" width="14" height="6" rx="1" />
        ))}
      </g>
      <rect x="12" y="186" width="276" height="4" fill="#b91c1c" />
      {/* 기둥 */}
      <g fill="#9f1239">
        {[26, 84, 206, 264].map((x) => (
          <rect key={x} x={x} y="190" width="10" height="118" />
        ))}
      </g>
      <rect x="0" y="306" width="300" height="16" fill="#d6d3d1" />
      <rect x="0" y="322" width="300" height="78" fill="#e7e5e4" />
      <g stroke="#a8a29e" strokeWidth="1" opacity="0.6">
        {[0, 50, 100, 150, 200, 250].map((x) => (
          <line key={x} x1={x} y1="322" x2={x - 30} y2="400" />
        ))}
      </g>
    </>
  );
}

function Roof({ x, y, w, fill = '#334155' }: { x: number; y: number; w: number; fill?: string }) {
  return (
    <g>
      <path d={`M${x - 10} ${y + 18} Q${x + 2} ${y + 8} ${x + 8} ${y} H${x + w - 8} Q${x + w - 2} ${y + 8} ${x + w + 10} ${y + 18} Q${x + w / 2} ${y + 11} ${x - 10} ${y + 18} Z`} fill={fill} />
      <rect x={x + 6} y={y + 16} width={w - 12} height="30" fill="#f5f5f4" />
      <rect x={x + 6} y={y + 16} width={w - 12} height="4" fill="#78350f" />
      <rect x={x + w / 2 - 7} y={y + 26} width="14" height="20" fill="#92400e" opacity="0.8" />
    </g>
  );
}

function VillageScene() {
  return (
    <>
      <rect width="300" height="400" fill="url(#hb-sky-village)" />
      <path d="M0 170 C60 128 110 140 150 150 C200 120 250 128 300 150 V400 H0 Z" fill="#65a30d" opacity="0.45" />
      <Roof x={-8} y={176} w={86} />
      <Roof x={214} y={170} w={96} />
      <Roof x={40} y={226} w={70} fill="#475569" />
      <Roof x={196} y={232} w={78} fill="#475569" />
      {/* 돌담 */}
      <rect x="0" y="300" width="300" height="100" fill="#d6d3d1" />
      <g fill="#a8a29e" opacity="0.75">
        {Array.from({ length: 24 }, (_, i) => (
          <ellipse key={i} cx={(i % 8) * 40 + (Math.floor(i / 8) % 2) * 20} cy={314 + Math.floor(i / 8) * 26} rx="17" ry="10" />
        ))}
      </g>
      <path d="M0 300 H300" stroke="#44403c" strokeWidth="6" />
      {/* 청사초롱 */}
      <g>
        <line x1="28" y1="0" x2="28" y2="46" stroke="#44403c" strokeWidth="1.5" />
        <rect x="16" y="46" width="24" height="34" rx="6" fill="#dc2626" />
        <rect x="16" y="58" width="24" height="10" fill="#2563eb" />
        <line x1="272" y1="0" x2="272" y2="58" stroke="#44403c" strokeWidth="1.5" />
        <rect x="260" y="58" width="24" height="34" rx="6" fill="#dc2626" />
        <rect x="260" y="70" width="24" height="10" fill="#2563eb" />
      </g>
    </>
  );
}

function GardenScene() {
  return (
    <>
      <rect width="300" height="400" fill="url(#hb-sky-garden)" />
      <path d="M0 200 C70 170 120 186 170 180 C220 170 260 176 300 190 V400 H0 Z" fill="#4d7c0f" opacity="0.7" />
      {/* 정자 */}
      <g>
        <path d="M204 176 L238 150 L272 176 Q238 170 204 176 Z" fill="#292524" />
        <path d="M200 178 Q238 168 276 178" stroke="#15803d" strokeWidth="4" fill="none" />
        {[212, 230, 246, 264].map((x) => (
          <rect key={x} x={x - 2} y="180" width="4" height="46" fill="#9f1239" />
        ))}
        <rect x="204" y="224" width="68" height="6" fill="#78350f" />
      </g>
      {/* 연못 */}
      <path d="M-10 262 C60 244 240 244 310 262 V400 H-10 Z" fill="#0e7490" />
      <path d="M-10 262 C60 244 240 244 310 262" stroke="#67e8f9" strokeWidth="2" fill="none" opacity="0.6" />
      <g fill="#65a30d">
        <ellipse cx="34" cy="300" rx="22" ry="7" />
        <ellipse cx="72" cy="336" rx="18" ry="6" />
        <ellipse cx="248" cy="318" rx="24" ry="7" />
        <ellipse cx="270" cy="360" rx="18" ry="6" />
        <ellipse cx="22" cy="372" rx="20" ry="6" />
      </g>
      <g fill="#f9a8d4" stroke="#db2777" strokeWidth="0.8">
        {[
          [36, 292],
          [250, 309],
          [74, 328],
        ].map(([x, y]) => (
          <g key={`${x}-${y}`}>
            <ellipse cx={x! - 5} cy={y} rx="4" ry="8" transform={`rotate(-25 ${x! - 5} ${y})`} />
            <ellipse cx={x! + 5} cy={y} rx="4" ry="8" transform={`rotate(25 ${x! + 5} ${y})`} />
            <ellipse cx={x} cy={y! - 2} rx="4" ry="9" />
          </g>
        ))}
      </g>
      {/* 버드나무 */}
      <g stroke="#65a30d" strokeWidth="2" fill="none" opacity="0.9">
        {[6, 18, 30, 42, 54, 66].map((x, i) => (
          <path key={x} d={`M${x} -4 C${x + 8} ${50 + i * 6} ${x - 6} ${100 + i * 10} ${x + 4} ${150 + i * 12}`} />
        ))}
      </g>
      <g fill="#f9a8d4" opacity="0.8">
        {[
          [120, 40],
          [180, 30],
          [230, 90],
          [96, 120],
          [260, 40],
          [150, 16],
        ].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="3" />
        ))}
      </g>
    </>
  );
}

/* ── Hanbok overlay (portrait 랜드마크 기준) ─────────────── */

function Roundel({ cx, cy, r, color }: { cx: number; cy: number; r: number; color: string }) {
  const s = r / 20;
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={color} stroke="#78350f" strokeWidth="1.5" />
      <circle cx={cx} cy={cy} r={r * 0.78} fill="none" stroke="#78350f" strokeWidth="1" opacity="0.7" />
      <path
        d={`M${cx - 10 * s} ${cy + 6 * s} C${cx - 12 * s} ${cy - 8 * s} ${cx + 6 * s} ${cy - 12 * s} ${cx + 8 * s} ${cy - 2 * s} C${cx + 10 * s} ${cy + 6 * s} ${cx} ${cy + 8 * s} ${cx - 1 * s} ${cy + 1 * s} C${cx - 2 * s} ${cy - 4 * s} ${cx + 4 * s} ${cy - 4 * s} ${cx + 3 * s} ${cy}`}
        fill="none"
        stroke="#7c2d12"
        strokeWidth={1.6 * s}
        strokeLinecap="round"
      />
      <circle cx={cx + 7 * s} cy={cy - 8 * s} r={1.8 * s} fill="#7c2d12" />
    </g>
  );
}

const ROBE_V =
  'M-6 400 L-6 322 C12 292 46 274 88 265 C108 260 121 250 127 236 L146 292 L175 236 C181 250 194 260 214 265 C256 274 290 292 306 322 L306 400 Z';
const ROBE_ROUND =
  'M-6 400 L-6 322 C12 292 46 274 88 265 C108 260 118 252 122 240 C128 264 172 264 178 240 C182 252 192 260 212 265 C254 274 290 292 306 322 L306 400 Z';

function HanbokOverlay({ styleId, uid }: { styleId: StyleId; uid: string }) {
  const s = STYLES[styleId];
  const fabric = `url(#${uid}-fabric)`;

  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 300 400" aria-hidden="true">
      <defs>
        <linearGradient id={`${uid}-fabric`} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor={s.robe} />
          <stop offset="0.55" stopColor={s.robe} />
          <stop offset="1" stopColor={s.robeDark} />
        </linearGradient>
        <pattern id={`${uid}-gold`} width="26" height="26" patternUnits="userSpaceOnUse">
          <circle cx="6" cy="6" r="2.2" fill="#fcd34d" opacity="0.75" />
          <circle cx="19" cy="19" r="1.6" fill="#fcd34d" opacity="0.6" />
        </pattern>
      </defs>

      {/* 겉옷 */}
      <path d={styleId === 'king' ? ROBE_ROUND : ROBE_V} fill={fabric} />
      {styleId === 'queen' && <path d={ROBE_V} fill={`url(#${uid}-gold)`} />}
      {/* 소매 경계 주름 */}
      <g stroke={s.robeDark} strokeWidth="2" fill="none" opacity="0.45" strokeLinecap="round">
        <path d="M54 282 C46 320 42 360 40 400" />
        <path d="M246 282 C254 320 258 360 260 400" />
      </g>
      {s.skirt && <path d="M-6 400 V356 Q150 376 306 356 V400 Z" fill={s.skirt} />}

      {styleId === 'king' ? (
        <>
          {/* 단령(둥근 깃) + 속깃 */}
          <path d="M134 246 L150 264 L166 246" stroke="#f8fafc" strokeWidth="5" fill="none" strokeLinejoin="round" />
          <path d="M118 237 C124 272 176 272 182 237" stroke={s.collar} strokeWidth="12" fill="none" strokeLinecap="round" />
          <Roundel cx={150} cy={332} r={34} color={s.accent} />
          <Roundel cx={62} cy={300} r={18} color={s.accent} />
          <Roundel cx={238} cy={300} r={18} color={s.accent} />
          {/* 옥대 */}
          <rect x="-6" y="384" width="312" height="12" fill="#111827" />
          {[40, 90, 150, 210, 260].map((x) => (
            <rect key={x} x={x - 6} y="386" width="12" height="8" rx="1.5" fill="#d9f99d" opacity="0.85" />
          ))}
        </>
      ) : (
        <>
          {/* 안깃 → 겉깃 순서로 겹친다 */}
          <line x1="127" y1="234" x2="152" y2="304" stroke={s.collar} strokeWidth="14" />
          <line x1="133" y1="233" x2="147" y2="271" stroke="#f8fafc" strokeWidth="5" />
          <line x1="176" y1="234" x2="104" y2="344" stroke={s.collar} strokeWidth="16" />
          <line x1="169" y1="231" x2="146" y2="267" stroke="#f8fafc" strokeWidth="5" />
          {/* 섶 선 */}
          <path d="M104 344 L96 400" stroke={s.robeDark} strokeWidth="2" opacity="0.6" />
          {styleId === 'queen' && <Roundel cx={180} cy={338} r={24} color={s.accent} />}
          {styleId === 'scholar' ? (
            <>
              {/* 세조대 */}
              <path d="M-6 352 Q150 364 306 352" stroke={s.accent} strokeWidth="5" fill="none" />
              <path d="M126 358 L118 400 M136 359 L134 400" stroke={s.accent} strokeWidth="4" />
              <circle cx="130" cy="360" r="6" fill={s.accent} />
            </>
          ) : (
            <>
              {/* 옷고름 */}
              <path d="M116 328 L96 400" stroke={s.accent} strokeWidth="12" strokeLinecap="round" />
              <path d="M120 330 L132 400" stroke={s.accent} strokeWidth="9" strokeLinecap="round" opacity="0.9" />
              <ellipse cx="116" cy="326" rx="12" ry="8" fill={s.accent} transform="rotate(-30 116 326)" />
              <circle cx="118" cy="328" r="5" fill={s.robeDark} opacity="0.35" />
            </>
          )}
        </>
      )}

      {/* 머리 장식 */}
      {styleId === 'king' && (
        <g>
          <ellipse cx="114" cy="46" rx="13" ry="19" fill="#111827" transform="rotate(-22 114 46)" />
          <ellipse cx="186" cy="46" rx="13" ry="19" fill="#111827" transform="rotate(22 186 46)" />
          <path d="M108 84 C106 40 194 40 192 84 Z" fill="#1f2937" />
          <path d="M112 60 C130 50 170 50 188 60" stroke="#4b5563" strokeWidth="2" fill="none" />
          <rect x="100" y="76" width="100" height="16" rx="7" fill="#0b0f19" />
        </g>
      )}
      {styleId === 'queen' && (
        <g>
          <path d="M98 90 Q150 58 202 90" stroke={s.accent} strokeWidth="6" fill="none" strokeLinecap="round" />
          {[
            [150, 50, 15],
            [114, 70, 10],
            [186, 70, 10],
          ].map(([x, y, r]) => (
            <g key={x}>
              {Array.from({ length: 6 }, (_, i) => (
                <ellipse
                  key={i}
                  cx={x}
                  cy={y! - r! * 0.6}
                  rx={r! * 0.35}
                  ry={r! * 0.6}
                  fill="#fcd34d"
                  stroke="#b45309"
                  strokeWidth="0.8"
                  transform={`rotate(${i * 60} ${x} ${y})`}
                />
              ))}
              <circle cx={x} cy={y} r={r! * 0.38} fill="#dc2626" stroke="#fef3c7" strokeWidth="1.2" />
              <line x1={x} y1={y! + r!} x2={x} y2={y! + r! + 10} stroke="#fcd34d" strokeWidth="1" />
              <circle cx={x} cy={y! + r! + 12} r="2.4" fill="#f8fafc" />
            </g>
          ))}
        </g>
      )}
      {styleId === 'scholar' && (
        <g>
          {/* 갓끈 (구슬) */}
          <path d="M112 78 C104 150 114 230 128 300" stroke="#fde68a" strokeWidth="3" strokeDasharray="0.1 6" strokeLinecap="round" fill="none" />
          <path d="M188 78 C196 150 186 230 172 300" stroke="#fde68a" strokeWidth="3" strokeDasharray="0.1 6" strokeLinecap="round" fill="none" />
          <ellipse cx="150" cy="74" rx="96" ry="15" fill="rgba(10,10,14,0.72)" />
          <ellipse cx="150" cy="74" rx="96" ry="15" fill="none" stroke="#111827" strokeWidth="1.5" />
          <path d="M122 74 L128 30 Q150 24 172 30 L178 74 Z" fill="rgba(10,10,14,0.88)" />
          <path d="M126 64 Q150 70 174 64" stroke="#374151" strokeWidth="3" fill="none" />
        </g>
      )}
      {styleId === 'modern' && (
        <g>
          {Array.from({ length: 5 }, (_, i) => (
            <ellipse key={i} cx="196" cy="66" rx="7" ry="12" fill="#f9a8d4" stroke="#db2777" strokeWidth="0.8" transform={`rotate(${i * 72} 196 78)`} />
          ))}
          <circle cx="196" cy="78" r="5" fill="#fcd34d" />
          <ellipse cx="214" cy="92" rx="9" ry="4" fill="#15803d" transform="rotate(30 214 92)" />
          <ellipse cx="180" cy="94" rx="8" ry="3.5" fill="#15803d" transform="rotate(-30 180 94)" />
        </g>
      )}
    </svg>
  );
}

function BackdropOverlay({ backdrop, uid }: { backdrop: BackdropId; uid: string }) {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 300 400" aria-hidden="true">
      <defs>
        <linearGradient id="hb-sky-palace" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fcd34d" />
          <stop offset="0.35" stopColor="#fb923c" />
          <stop offset="0.7" stopColor="#f472b6" />
        </linearGradient>
        <linearGradient id="hb-sky-village" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7dd3fc" />
          <stop offset="0.6" stopColor="#e0f2fe" />
        </linearGradient>
        <linearGradient id="hb-sky-garden" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbcfe8" />
          <stop offset="0.6" stopColor="#fef9c3" />
        </linearGradient>
        <filter id={`${uid}-blur`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
        <mask id={`${uid}-person`}>
          <rect width="300" height="400" fill="white" />
          <g filter={`url(#${uid}-blur)`}>
            <ellipse cx="150" cy="130" rx="70" ry="90" fill="black" />
            <path d="M16 400 C24 300 86 250 150 244 C214 250 276 300 284 400 Z" fill="black" />
          </g>
        </mask>
      </defs>
      <g mask={`url(#${uid}-person)`} opacity="0.94">
        {backdrop === 'palace' && <PalaceScene />}
        {backdrop === 'village' && <VillageScene />}
        {backdrop === 'garden' && <GardenScene />}
      </g>
    </svg>
  );
}

/* ── Frame ─────────────────────────────────────────────── */

const DANCHEONG_BORDER =
  'repeating-linear-gradient(45deg, #b91c1c 0 7px, #15803d 7px 14px, #facc15 14px 17px, #1d4ed8 17px 24px, #f8fafc 24px 27px)';

function CornerKnot({ className }: { className: string }) {
  return (
    <svg className={cn('absolute h-7 w-7', className)} viewBox="0 0 28 28" aria-hidden="true">
      <rect x="4" y="4" width="20" height="20" rx="3" fill="#14532d" stroke="#fde68a" strokeWidth="1.5" transform="rotate(45 14 14)" />
      <circle cx="14" cy="14" r="6" fill="#b91c1c" stroke="#fde68a" strokeWidth="1.2" />
      <circle cx="14" cy="14" r="2.2" fill="#fde68a" />
    </svg>
  );
}

/* ── Culture card ──────────────────────────────────────── */

function CultureCard({ styleId, backdrop, color }: { styleId: StyleId; backdrop: BackdropId; color: string }) {
  const [lang, setLang] = useState('en');
  const s = STYLES[styleId];
  const b = BACKDROPS[backdrop];
  const greeting = GREETINGS.find((g) => g.id === lang) ?? GREETINGS[1]!;

  return (
    <Panel title="한국 문화 카드 · Korean Culture Card">
      <div className="space-y-4">
        {[
          { emoji: s.emoji, title: `${s.name} ${s.hanja}`, ko: s.ko, en: s.en },
          { emoji: b.emoji, title: `${b.label} ${b.hanja}`, ko: b.ko, en: b.enDesc },
        ].map((item) => (
          <div key={item.title} className="flex gap-3">
            <span className="text-2xl leading-none">{item.emoji}</span>
            <div>
              <p className="text-sm font-semibold text-white">{item.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-300 [word-break:keep-all]">{item.ko}</p>
              <p className="mt-1 text-xs italic leading-relaxed text-slate-500">EN · {item.en}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 border-t border-slate-800 pt-4">
        <p className="mb-2 text-[11px] text-slate-500">관광객 다국어 인사말 미리보기</p>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="언어 선택">
          {GREETINGS.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => setLang(g.id)}
              aria-pressed={lang === g.id}
              className={cn(
                'rounded-full border px-3 py-1 text-xs transition-colors',
                lang === g.id ? 'text-white' : 'border-slate-700 text-slate-400 hover:border-slate-500'
              )}
              style={lang === g.id ? { borderColor: color, backgroundColor: `${color}25` } : undefined}
            >
              {g.label}
            </button>
          ))}
        </div>
        <motion.p key={lang} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-3 text-center text-base font-semibold text-white">
          “{greeting.text}”
        </motion.p>
      </div>
    </Panel>
  );
}

/* ── Shared (결과 화면 · 출력물) ────────────────────────── */

function boothOf(answers: DemoAnswers) {
  const picked = getChoice(answers, 'style') as StyleId | undefined;
  const pickedBackdrop = getChoice(answers, 'backdrop') as BackdropId | undefined;
  const styleId: StyleId = picked && STYLES[picked] ? picked : 'king';
  const backdrop: BackdropId = pickedBackdrop && BACKDROPS[pickedBackdrop] ? pickedBackdrop : 'palace';
  return {
    capture: getCapture(answers, 'photo'),
    styleId,
    backdrop,
    s: STYLES[styleId],
    b: BACKDROPS[backdrop],
    serial: String(seededInt(answersSeed(answers), 'no', 100, 999)),
  };
}

/** 사진 오른쪽 위 韓服 낙관 (결과 화면의 빨간 도장과 같은 자리) */
function HanbokSealMark() {
  return (
    <g>
      <rect x="250" y="9" width="41" height="41" rx="3" fill="rgba(185,28,28,0.9)" stroke="rgba(254,202,202,0.6)" strokeWidth="1" />
      <g fill="#fef2f2" fontSize="13" fontWeight="700" textAnchor="middle" fontFamily="'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', sans-serif">
        <text x="270.5" y="27">韓</text>
        <text x="270.5" y="43">服</text>
      </g>
    </g>
  );
}

/** 출력물용 정적 합성 — 배경 · 한복 · 낙관 (300×400) */
function HanbokPrintOverlay({ styleId, backdrop }: { styleId: StyleId; backdrop: BackdropId }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400">
      <BackdropOverlay backdrop={backdrop} uid="hbprint" />
      <HanbokOverlay styleId={styleId} uid="hbprint" />
      <HanbokSealMark />
    </svg>
  );
}

/* ── Result ────────────────────────────────────────────── */

function Result({ answers, onRestart, pillarColor }: DemoResultProps) {
  const uid = useId().replace(/:/g, '');
  const { capture, styleId, backdrop, s, b, serial } = boothOf(answers);

  return (
    <ResultShell
      eyebrow="AI 한복 포토부스"
      title={`${s.name} 포토 완성!`}
      description={`${b.label}을 배경으로 ${s.label} 한복을 입혀드렸어요. 전통 프레임으로 바로 인화돼요.`}
      pillarColor={pillarColor}
      onRestart={onRestart}
      restartLabel="다른 한복 입어보기"
    >
      {capture && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative w-72 rounded-md p-[10px] shadow-2xl shadow-black/60"
          style={{ background: DANCHEONG_BORDER, outline: '4px solid #14532d', outlineOffset: '-2px' }}
        >
          <div className="relative border-[3px] border-[#fde68a] bg-[#fef3c7]">
            <ProcessedPhoto src={capture.image} look={WARM_LOOK} className="aspect-[3/4] w-full" alt={`${s.name} 한복 합성 사진`} delayMs={1100}>
              <BackdropOverlay backdrop={backdrop} uid={uid} />
              <HanbokOverlay styleId={styleId} uid={uid} />
              <div className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-[3px] border border-red-200/60 bg-red-700/90 text-[11px] font-bold leading-tight text-red-50 shadow">
                <span className="text-center">
                  韓
                  <br />服
                </span>
              </div>
              <div className="absolute inset-x-0 bottom-2 flex justify-center">
                <span className="rounded-full bg-black/55 px-3 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
                  📍 {b.label} {b.hanja} · {b.en}
                </span>
              </div>
            </ProcessedPhoto>
            <div className="flex items-center justify-between px-2.5 py-1.5 text-[#7c2d12]">
              <span className="text-[11px] font-bold tracking-widest">{s.hanja} · {b.hanja}</span>
              <span className="text-[9px] font-semibold tracking-[0.2em]">NEANDER HANBOK · No.{serial}</span>
            </div>
          </div>
          <CornerKnot className="-left-3 -top-3" />
          <CornerKnot className="-right-3 -top-3" />
          <CornerKnot className="-bottom-3 -left-3" />
          <CornerKnot className="-bottom-3 -right-3" />
        </motion.div>
      )}

      <InfoGrid
        items={[
          { emoji: s.emoji, label: '한복 스타일', value: `${s.label} · ${s.name}` },
          { emoji: b.emoji, label: '전통 배경', value: b.label },
          { emoji: '🖼️', label: '출력', value: '단청 프레임 4×6 인화' },
          { emoji: '🌏', label: '다국어 안내', value: '한·영·중·일 4개 국어' },
        ]}
      />

      <CultureCard styleId={styleId} backdrop={backdrop} color={pillarColor} />
    </ResultShell>
  );
}

/* ── Export ─────────────────────────────────────────────── */

function computeResult(answers: DemoAnswers): string {
  return getChoice(answers, 'style') ?? 'king';
}

export default defineDemo({
  config: {
    id: 'hanbok-booth',
    targetSlug: 'ai-hanbok-booth',
    industryId: 'tourism',
    analyzeEmoji: '👘',
    analyzeDurationMs: 3600,
    analyzeImageStepId: 'photo',
    analyzeMessages: ['어깨선에 맞춰 한복 재단 중', '깃·동정 핏 맞추는 중', '전통 배경 합성 중', '단청 프레임 입히는 중'],
  },
  steps: [
    choiceStep({
      id: 'style',
      title: '어떤 한복을 입어볼까요?',
      subtitle: '왕부터 현대 한복까지, 입고 싶은 스타일을 골라주세요',
      columns: 4,
      options: (Object.keys(STYLES) as StyleId[]).map((id) => ({
        id,
        label: STYLES[id].label,
        desc: `${STYLES[id].name} · ${STYLES[id].desc}`,
        swatch: STYLES[id].swatch,
      })),
    }),
    choiceStep({
      id: 'backdrop',
      title: '어디에서 찍을까요?',
      subtitle: 'AI가 전통 배경을 합성해 드려요',
      columns: 3,
      options: (Object.keys(BACKDROPS) as BackdropId[]).map((id) => ({
        id,
        emoji: BACKDROPS[id].emoji,
        label: BACKDROPS[id].label,
        desc: BACKDROPS[id].desc,
        swatch: BACKDROPS[id].swatch,
      })),
    }),
    cameraStep({
      id: 'photo',
      title: '포토부스 앞에 서주세요',
      subtitle: '어깨까지 나오게 서면 AI가 한복을 입혀드려요',
      mode: 'portrait',
      subject: '상반신',
      countdown: true,
      scanLabels: ['인물 영역 분리', '어깨·목선 추적', '한복 핏 맞춤 계산', '전통 배경 합성 준비'],
      readouts: (c) => [
        { label: '어깨선', value: '정렬 완료' },
        { label: '조명 톤', value: c.stats.warmth > 52 ? '따뜻한 톤' : '차분한 톤' },
      ],
    }),
  ],
  computeResult,
  Result,
  print: (answers) => {
    const { capture, styleId, backdrop, s, b, serial } = boothOf(answers);
    return {
      kind: 'photo',
      photos: capture
        ? [{ src: capture.image, look: WARM_LOOK, label: `${b.label} ${b.hanja}`, overlay: <HanbokPrintOverlay styleId={styleId} backdrop={backdrop} /> }]
        : [],
      title: `${s.name} ${s.hanja}`,
      caption: `${s.label} 한복 · ${b.label} ${b.hanja} · ${b.en} · No.${serial}`,
      paper: 'cream',
    };
  },
});
