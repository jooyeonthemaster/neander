'use client';

import { useCallback, useEffect, useId, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/lib/utils';
import type { DemoAnswers, DemoResultProps, DemoStepProps } from '@/types/demo';
import {
  ProcessedPhoto,
  ResultShell,
  answersSeed,
  cameraStep,
  choiceStep,
  defineDemo,
  getCapture,
  getChoice,
  seededInt,
  seededRandom,
  type DemoStepDef,
  type PhotoLook,
} from '../kit';

/* ── Data ──────────────────────────────────────────────── */

type SiteId = 'gyeongbok' | 'bulguk' | 'hwaseong' | 'cheomseong';
type SkyId = 'dawn' | 'day' | 'sunset' | 'night';

interface Era {
  id: string;
  year: string;
  label: string;
  sky: SkyId;
  desc: string;
}

interface Hotspot {
  x: number;
  y: number;
  title: string;
  fact: string;
}

interface Site {
  label: string;
  hanja: string;
  emoji: string;
  desc: string;
  intro: string;
  eras: Era[];
  hotspots: Hotspot[];
  timeline: { year: string; text: string; era?: string }[];
}

const SITES: Record<SiteId, Site> = {
  gyeongbok: {
    label: '경복궁',
    hanja: '景福宮',
    emoji: '🏯',
    desc: '조선의 법궁 · 1395',
    intro: '경복궁은 조선을 세운 태조가 1395년에 지은 조선의 첫 번째 궁궐이자 으뜸 궁궐이에요.',
    eras: [
      { id: 'gb-1395', year: '1395', label: '창건', sky: 'dawn', desc: '새 왕조의 법궁이 막 완성된 새벽이에요. 정도전이 궁궐과 전각의 이름을 지었어요.' },
      { id: 'gb-1443', year: '1443', label: '세종의 시대', sky: 'day', desc: '세종이 궁궐 안 집현전 학자들과 함께 훈민정음을 만든 해예요. 궁궐이 가장 활기찼던 시절이에요.' },
      { id: 'gb-1867', year: '1867', label: '중건', sky: 'sunset', desc: '임진왜란 때 불탄 뒤 270여 년 동안 비어 있던 궁궐을 흥선대원군이 다시 세웠어요.' },
    ],
    hotspots: [
      { x: 50, y: 40, title: '근정전 勤政殿', fact: '왕의 즉위식과 큰 조회가 열린 정전이에요. 이름에는 ‘부지런히 정치하라’는 뜻이 담겨 있어요.' },
      { x: 25, y: 44, title: '잡상 雜像', fact: '지붕 끝에 줄지어 앉은 작은 흙 인형이에요. 나쁜 기운을 막아 준다고 믿었고, 서유기 인물을 본떴다고 전해져요.' },
      { x: 36, y: 91, title: '품계석 品階石', fact: '신하들이 벼슬 순서대로 줄지어 서던 돌 표지예요. 조회 때 이 앞에 서서 왕을 맞이했어요.' },
    ],
    timeline: [
      { year: '1395', text: '태조, 경복궁 창건', era: 'gb-1395' },
      { year: '1443', text: '세종, 훈민정음 창제', era: 'gb-1443' },
      { year: '1592', text: '임진왜란으로 소실' },
      { year: '1867', text: '흥선대원군, 경복궁 중건', era: 'gb-1867' },
      { year: '1990', text: '본격적인 복원 사업 시작' },
    ],
  },
  bulguk: {
    label: '불국사',
    hanja: '佛國寺',
    emoji: '🛕',
    desc: '신라 불교 예술의 정수 · 751',
    intro: '불국사는 부처님의 나라를 이 땅에 옮겨 놓으려 한 신라 사람들의 꿈이 담긴 절이에요.',
    eras: [
      { id: 'bg-751', year: '751', label: '창건', sky: 'dawn', desc: '신라의 재상 김대성이 불국사를 짓기 시작한 해예요. 삼국유사에 그 이야기가 전해져요.' },
      { id: 'bg-774', year: '774', label: '통일신라 전성기', sky: 'day', desc: '20여 년의 공사 끝에 석가탑과 다보탑이 나란히 선 불국사가 모습을 드러냈어요.' },
      { id: 'bg-1995', year: '1995', label: '세계유산 등재', sky: 'sunset', desc: '석굴암과 함께 유네스코 세계유산이 되어 온 세계가 그 가치를 인정했어요.' },
    ],
    hotspots: [
      { x: 24, y: 36, title: '석가탑 釋迦塔', fact: '군더더기 없이 단정한 3층 석탑이에요. 탑 안에서 세계에서 가장 오래된 목판 인쇄물 중 하나인 무구정광대다라니경이 발견됐어요.' },
      { x: 76, y: 32, title: '다보탑 多寶塔', fact: '돌을 나무처럼 다듬어 쌓은 화려한 탑이에요. 10원짜리 동전 앞면에 새겨진 바로 그 탑이에요.' },
      { x: 50, y: 72, title: '청운교·백운교', fact: '속세에서 부처님의 나라로 오르는 33계단 돌다리예요. 33은 불교에서 말하는 하늘의 수예요.' },
    ],
    timeline: [
      { year: '751', text: '김대성, 불국사 창건 시작', era: 'bg-751' },
      { year: '774', text: '불국사 완공', era: 'bg-774' },
      { year: '1593', text: '임진왜란으로 목조 건물 소실' },
      { year: '1973', text: '대대적인 복원 공사 완료' },
      { year: '1995', text: '유네스코 세계유산 등재', era: 'bg-1995' },
    ],
  },
  hwaseong: {
    label: '수원화성',
    hanja: '水原華城',
    emoji: '🏰',
    desc: '정조의 계획 신도시 · 1796',
    intro: '수원화성은 정조가 아버지 사도세자를 기리며 새로운 개혁 도시로 계획한 성곽이에요.',
    eras: [
      { id: 'hs-1794', year: '1794', label: '축성 시작', sky: 'dawn', desc: '정조의 명으로 성 쌓기가 시작됐어요. 정약용이 설계한 거중기가 무거운 돌을 들어 올렸어요.' },
      { id: 'hs-1795', year: '1795', label: '을묘원행', sky: 'day', desc: '정조가 어머니 혜경궁 홍씨의 회갑 잔치를 화성 행궁에서 성대하게 열었어요.' },
      { id: 'hs-1796', year: '1796', label: '완공', sky: 'sunset', desc: '착공 2년 9개월 만에 성곽이 완성됐어요. 모든 과정은 화성성역의궤에 꼼꼼히 기록됐어요.' },
    ],
    hotspots: [
      { x: 50, y: 30, title: '팔달문 八達門', fact: '화성의 남쪽 정문이에요. ‘사방팔방으로 통한다’는 뜻으로, 지금도 수원의 중심에 서 있어요.' },
      { x: 34, y: 78, title: '옹성 甕城', fact: '성문 앞을 항아리처럼 둥글게 감싼 성벽이에요. 적이 성문으로 곧장 달려들지 못하게 막았어요.' },
      { x: 19, y: 50, title: '거중기 擧重器', fact: '도르래의 원리로 무거운 돌을 적은 힘으로 들어 올린 기계예요. 공사 기간을 크게 줄여 줬어요.' },
    ],
    timeline: [
      { year: '1794', text: '화성 축성 시작', era: 'hs-1794' },
      { year: '1795', text: '정조, 을묘원행', era: 'hs-1795' },
      { year: '1796', text: '화성 완공', era: 'hs-1796' },
      { year: '1975', text: '의궤를 바탕으로 복원 시작' },
      { year: '1997', text: '유네스코 세계유산 등재' },
    ],
  },
  cheomseong: {
    label: '첨성대',
    hanja: '瞻星臺',
    emoji: '🔭',
    desc: '동아시아 최고(最古) 천문대 · 7세기',
    intro: '첨성대는 신라 선덕여왕 때 세워진, 현존하는 동아시아에서 가장 오래된 천문대로 알려져 있어요.',
    eras: [
      { id: 'cs-7c', year: '7세기', label: '선덕여왕 시대', sky: 'night', desc: '선덕여왕 때 서라벌 한가운데 별을 살피는 돌탑이 세워졌어요.' },
      { id: 'cs-8c', year: '8세기', label: '통일신라 서라벌', sky: 'sunset', desc: '천문 관리들이 해·달·별의 움직임을 기록해 농사 달력과 나라의 앞날을 살폈어요.' },
      { id: 'cs-1962', year: '1962', label: '국보 지정', sky: 'day', desc: '1,300년 넘게 제자리를 지켜 온 가치를 인정받아 국보로 지정됐어요.' },
    ],
    hotspots: [
      { x: 50, y: 32, title: '정자석 井字石', fact: '맨 위에 ‘우물 정(井)’ 모양으로 짠 돌이에요. 방위를 가늠하는 기준이었다는 해석이 있어요.' },
      { x: 50, y: 57, title: '남쪽 창', fact: '남쪽을 향한 네모난 창이에요. 사다리를 걸고 이 창으로 드나들었을 것으로 추정돼요.' },
      { x: 57, y: 71, title: '27단의 돌', fact: '몸통은 27단, 돌은 약 362개예요. 선덕여왕이 27대 왕이라는 점, 음력 1년의 날수와 연결 짓는 해석이 있어요.' },
    ],
    timeline: [
      { year: '632', text: '선덕여왕 즉위' },
      { year: '7세기', text: '첨성대 건립', era: 'cs-7c' },
      { year: '8세기', text: '통일신라 천문 관측', era: 'cs-8c' },
      { year: '1962', text: '국보 지정', era: 'cs-1962' },
      { year: '2000', text: '경주역사유적지구 세계유산 등재' },
    ],
  },
};

const SKIES: Record<SkyId, { stops: string[]; label: string; tone: string | null; toneOpacity: number; look: PhotoLook }> = {
  dawn: {
    stops: ['#312e81', '#a855f7', '#f9a8d4', '#fed7aa'],
    label: '새벽',
    tone: '#c084fc',
    toneOpacity: 0.22,
    look: { adjust: { sepia: 0.25, saturation: 0.9, warmth: 0.1 }, tint: { color: '#f9a8d4', alpha: 0.25, blend: 'soft-light' }, vignette: 0.3, grain: 10 },
  },
  day: {
    stops: ['#0369a1', '#38bdf8', '#bae6fd', '#e0f2fe'],
    label: '한낮',
    tone: null,
    toneOpacity: 0,
    look: { adjust: { sepia: 0.2, saturation: 1.05, brightness: 1.05 }, vignette: 0.25, grain: 8 },
  },
  sunset: {
    stops: ['#1e1b4b', '#be185d', '#f97316', '#fde68a'],
    label: '노을',
    tone: '#f97316',
    toneOpacity: 0.3,
    look: { adjust: { sepia: 0.3, warmth: 0.3 }, tint: { color: '#f97316', alpha: 0.28, blend: 'soft-light' }, vignette: 0.35, grain: 10 },
  },
  night: {
    stops: ['#020617', '#0f172a', '#1e1b4b', '#312e81'],
    label: '밤',
    tone: '#1e3a8a',
    toneOpacity: 0.55,
    look: { adjust: { brightness: 0.85, saturation: 0.7, sepia: 0.15 }, tint: { color: '#1d4ed8', alpha: 0.35, blend: 'soft-light' }, vignette: 0.45, grain: 12 },
  },
};

const STARS = Array.from({ length: 34 }, (_, i) => ({
  x: Math.round(seededRandom(42, `sx${i}`) * 400),
  y: Math.round(seededRandom(42, `sy${i}`) * 130),
  r: 0.6 + seededRandom(42, `sr${i}`) * 1.3,
}));

function getSite(answers: DemoAnswers): Site {
  return SITES[(getChoice(answers, 'site') as SiteId | undefined) ?? 'gyeongbok'] ?? SITES.gyeongbok;
}

function getEra(answers: DemoAnswers): Era {
  const site = getSite(answers);
  return site.eras.find((e) => e.id === getChoice(answers, 'era')) ?? site.eras[0]!;
}

/* ── Scene drawings (viewBox 400×240) ─────────────────── */

function GyeongbokDrawing() {
  return (
    <>
      <path d="M0 150 C60 124 110 72 170 62 C222 54 262 92 302 110 C342 124 372 118 400 130 V200 H0 Z" fill="#4d7c5a" />
      <rect x="0" y="194" width="400" height="46" fill="#d6d3d1" />
      <g stroke="#a8a29e" strokeWidth="0.8" opacity="0.7">
        {[0, 60, 120, 180, 240, 300, 360].map((x) => (
          <line key={x} x1={x} y1="194" x2={x - 24} y2="240" />
        ))}
        <line x1="0" y1="214" x2="400" y2="214" />
      </g>
      {/* 행각 */}
      <rect x="0" y="160" width="400" height="34" fill="#f5f5f4" />
      <path d="M-4 166 L2 152 H398 L404 166 Z" fill="#52525b" />
      <g fill="#b91c1c">
        {Array.from({ length: 17 }, (_, i) => (
          <rect key={i} x={4 + i * 24} y="166" width="3" height="28" />
        ))}
      </g>
      {/* 월대 */}
      <rect x="96" y="178" width="208" height="18" fill="#d6d3d1" stroke="#a8a29e" />
      <rect x="116" y="166" width="168" height="13" fill="#e7e5e4" stroke="#a8a29e" />
      <rect x="186" y="166" width="28" height="30" fill="#e7e5e4" stroke="#a8a29e" />
      {/* 1층 */}
      <rect x="126" y="118" width="148" height="48" fill="#fde7c3" />
      <g fill="#b91c1c">
        {[126, 154, 182, 212, 240, 268].map((x) => (
          <rect key={x} x={x} y="118" width="6" height="48" />
        ))}
      </g>
      <g fill="#7c2d12" opacity="0.28">
        {[134, 162, 190, 220, 248].map((x) => (
          <rect key={x} x={x} y="126" width="18" height="36" />
        ))}
      </g>
      <rect x="120" y="112" width="160" height="8" fill="#15803d" />
      <g fill="#1d4ed8">
        {[126, 146, 166, 186, 206, 226, 246, 266].map((x) => (
          <rect key={x} x={x} y="114" width="8" height="4" />
        ))}
      </g>
      <path d="M74 121 Q104 112 118 96 H282 Q296 112 326 121 Q200 108 74 121 Z" fill="#3f3f46" />
      {/* 잡상 */}
      <g fill="#27272a">
        {[
          [110, 101],
          [104, 105],
          [98, 108.5],
          [92, 112],
        ].map(([x, y]) => (
          <circle key={x} cx={x} cy={y} r="2.4" />
        ))}
      </g>
      {/* 2층 */}
      <rect x="146" y="72" width="108" height="26" fill="#fde7c3" />
      <g fill="#b91c1c">
        {[146, 172, 198, 224, 248].map((x) => (
          <rect key={x} x={x} y="72" width="5" height="26" />
        ))}
      </g>
      <rect x="140" y="67" width="120" height="6" fill="#15803d" />
      <path d="M110 77 Q136 68 148 52 H252 Q264 68 290 77 Q200 64 110 77 Z" fill="#3f3f46" />
      <path d="M150 52 H250" stroke="#27272a" strokeWidth="6" strokeLinecap="round" />
      <path d="M146 54 Q144 44 152 46 M254 54 Q256 44 248 46" stroke="#27272a" strokeWidth="4" fill="none" strokeLinecap="round" />
      {/* 품계석 */}
      <g fill="#a8a29e">
        {[118, 136, 154, 172, 228, 246, 264, 282].map((x) => (
          <rect key={x} x={x} y="214" width="6" height="11" rx="1" />
        ))}
      </g>
    </>
  );
}

function StonePagoda({ x }: { x: number }) {
  return (
    <g fill="#d6d3d1" stroke="#78716c" strokeWidth="0.8">
      <rect x={x - 18} y="118" width="36" height="14" />
      <rect x={x - 12} y="104" width="24" height="14" />
      <rect x={x - 20} y="100" width="40" height="5" />
      <rect x={x - 10} y="90" width="20" height="10" />
      <rect x={x - 18} y="86" width="36" height="4.5" />
      <rect x={x - 8} y="78" width="16" height="8" />
      <rect x={x - 15} y="74" width="30" height="4.5" />
      <line x1={x} y1="74" x2={x} y2="58" stroke="#57534e" strokeWidth="2" />
      <circle cx={x} cy="66" r="2.5" fill="#a8a29e" />
    </g>
  );
}

function BulgukDrawing() {
  return (
    <>
      <path d="M0 120 C70 70 150 52 220 58 C300 64 350 90 400 100 V200 H0 Z" fill="#3f6212" />
      <rect x="0" y="194" width="400" height="46" fill="#a3a37a" />
      {/* 대웅전 지붕 (뒤) */}
      <path d="M140 92 Q160 84 168 70 H232 Q240 84 260 92 Q200 82 140 92 Z" fill="#3f3f46" />
      {/* 회랑 */}
      <rect x="18" y="116" width="364" height="16" fill="#fde7c3" />
      <path d="M12 120 L18 110 H382 L388 120 Z" fill="#52525b" />
      {/* 석축 */}
      <rect x="18" y="132" width="364" height="62" fill="#d6cfc0" />
      <g fill="none" stroke="#a8a29e" strokeWidth="0.9">
        {[146, 160, 174, 188].map((y) => (
          <line key={y} x1="18" y1={y} x2="382" y2={y} />
        ))}
        {Array.from({ length: 18 }, (_, i) => (
          <line key={i} x1={28 + i * 20 + (i % 2) * 6} y1="132" x2={28 + i * 20 + (i % 2) * 6} y2="194" opacity="0.5" />
        ))}
      </g>
      {/* 자하문 */}
      <rect x="164" y="96" width="72" height="22" fill="#fde7c3" />
      <g fill="#b91c1c">
        {[164, 186, 208, 230].map((x) => (
          <rect key={x} x={x} y="96" width="5" height="22" />
        ))}
      </g>
      <path d="M150 100 Q168 92 174 82 H226 Q232 92 250 100 Q200 90 150 100 Z" fill="#3f3f46" />
      {/* 청운교·백운교 */}
      <path d="M176 194 L186 132 H214 L224 194 Z" fill="#e7e5e4" stroke="#a8a29e" />
      <g stroke="#a8a29e" strokeWidth="0.8">
        {Array.from({ length: 11 }, (_, i) => (
          <line key={i} x1={177 + i * 0.9} y1={188 - i * 5.4} x2={223 - i * 0.9} y2={188 - i * 5.4} />
        ))}
      </g>
      <path d="M180 194 Q200 176 220 194" fill="#57534e" />
      <StonePagoda x={96} />
      {/* 다보탑 */}
      <g fill="#d6d3d1" stroke="#78716c" strokeWidth="0.8">
        <rect x="284" y="120" width="42" height="12" />
        <rect x="292" y="104" width="26" height="16" />
        <line x1="298" y1="104" x2="298" y2="120" />
        <line x1="312" y1="104" x2="312" y2="120" />
        <rect x="282" y="100" width="46" height="5" />
        <rect x="292" y="91" width="26" height="9" />
        <g stroke="#78716c">
          {[295, 300, 305, 310, 315].map((x) => (
            <line key={x} x1={x} y1="91" x2={x} y2="100" />
          ))}
        </g>
        <path d="M296 91 L300 81 H310 L314 91 Z" />
        <ellipse cx="305" cy="80" rx="14" ry="3" />
        <line x1="305" y1="78" x2="305" y2="58" stroke="#57534e" strokeWidth="2" />
        <circle cx="305" cy="70" r="2.5" fill="#a8a29e" />
        <circle cx="305" cy="63" r="2" fill="#a8a29e" />
      </g>
    </>
  );
}

function HwaseongDrawing() {
  return (
    <>
      <path d="M0 132 C80 96 140 90 200 100 C270 110 330 84 400 104 V200 H0 Z" fill="#4d7c0f" />
      <rect x="0" y="194" width="400" height="46" fill="#86a35c" />
      {/* 성벽 */}
      <rect x="0" y="138" width="400" height="56" fill="#cbbfa8" />
      <g stroke="#a89c84" strokeWidth="0.8">
        {[152, 166, 180].map((y) => (
          <line key={y} x1="0" y1={y} x2="400" y2={y} />
        ))}
      </g>
      <g fill="#b8ab93">
        {Array.from({ length: 21 }, (_, i) => (
          <rect key={i} x={i * 20} y="128" width="14" height="11" />
        ))}
      </g>
      {/* 깃발 */}
      {[
        [26, '#dc2626'],
        [66, '#2563eb'],
        [334, '#facc15'],
        [374, '#16a34a'],
      ].map(([x, c]) => (
        <g key={x as number}>
          <line x1={x as number} y1="128" x2={x as number} y2="92" stroke="#57534e" strokeWidth="1.5" />
          <path d={`M${x} 92 L${(x as number) + 18} 98 L${x} 106 Z`} fill={c as string} />
        </g>
      ))}
      {/* 팔달문 */}
      <rect x="150" y="104" width="100" height="90" fill="#bfb39b" stroke="#a89c84" />
      <path d="M184 194 V160 Q200 142 216 160 V194 Z" fill="#292524" />
      <rect x="162" y="84" width="76" height="22" fill="#fde7c3" />
      <g fill="#b91c1c">
        {[162, 186, 210, 233].map((x) => (
          <rect key={x} x={x} y="84" width="5" height="22" />
        ))}
      </g>
      <path d="M138 90 Q158 82 166 70 H234 Q242 82 262 90 Q200 80 138 90 Z" fill="#3f3f46" />
      <rect x="174" y="60" width="52" height="14" fill="#fde7c3" />
      <path d="M154 64 Q170 58 178 46 H222 Q230 58 246 64 Q200 56 154 64 Z" fill="#3f3f46" />
      {/* 옹성 */}
      <path d="M118 194 Q120 166 200 162 Q262 164 270 180 L258 194 Q250 176 200 174 Q134 176 132 194 Z" fill="#b8ab93" stroke="#a89c84" />
      {/* 거중기 */}
      <g stroke="#78350f" strokeWidth="3" strokeLinecap="round">
        <line x1="56" y1="194" x2="76" y2="118" />
        <line x1="96" y1="194" x2="76" y2="118" />
        <line x1="64" y1="164" x2="88" y2="164" />
      </g>
      <line x1="76" y1="122" x2="76" y2="172" stroke="#a16207" strokeWidth="1.2" />
      <circle cx="76" cy="124" r="4" fill="#92400e" />
      <circle cx="76" cy="150" r="3" fill="#92400e" />
      <rect x="66" y="172" width="20" height="14" fill="#a8a29e" stroke="#78716c" />
    </>
  );
}

function CheomseongDrawing() {
  return (
    <>
      <path d="M0 168 C80 146 150 150 210 158 C290 166 340 150 400 160 V200 H0 Z" fill="#365314" />
      <rect x="0" y="190" width="400" height="50" fill="#65a30d" />
      <g stroke="#3f6212" strokeWidth="1" opacity="0.6">
        {Array.from({ length: 26 }, (_, i) => (
          <line key={i} x1={i * 16} y1={206 + (i % 3) * 9} x2={i * 16 + 3} y2={200 + (i % 3) * 9} />
        ))}
      </g>
      <defs>
        <linearGradient id="cs-stone" x1="0" x2="1">
          <stop offset="0" stopColor="#a8987a" />
          <stop offset="0.45" stopColor="#dccfb2" />
          <stop offset="1" stopColor="#9c8c6e" />
        </linearGradient>
      </defs>
      <rect x="160" y="184" width="80" height="8" fill="#b8ab93" />
      <rect x="166" y="176" width="68" height="8" fill="#c8bca4" />
      <path d="M172 176 C170 150 178 120 186 92 L214 92 C222 120 230 150 228 176 Z" fill="url(#cs-stone)" />
      <g stroke="#6b5d45" strokeWidth="0.6" opacity="0.55">
        {Array.from({ length: 27 }, (_, i) => {
          const y = 176 - i * 3.1;
          const t = i / 27;
          const half = 28 - t * 14;
          return <line key={i} x1={200 - half} y1={y} x2={200 + half} y2={y} />;
        })}
      </g>
      <rect x="193" y="128" width="14" height="14" fill="#292524" />
      <rect x="182" y="84" width="36" height="8" fill="#c8bca4" stroke="#6b5d45" strokeWidth="0.8" />
      <rect x="186" y="78" width="28" height="6" fill="#c8bca4" stroke="#6b5d45" strokeWidth="0.8" />
      <line x1="194" y1="78" x2="194" y2="92" stroke="#6b5d45" strokeWidth="0.8" />
      <line x1="206" y1="78" x2="206" y2="92" stroke="#6b5d45" strokeWidth="0.8" />
    </>
  );
}

/** 400×240 복원 장면 (결과 화면 · 출력물 공용) */
function SiteSceneArt({ siteId, sky, uid }: { siteId: SiteId; sky: SkyId; uid: string }) {
  const s = SKIES[sky];
  return (
    <>
      <defs>
        <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
          {s.stops.map((c, i) => (
            <stop key={c} offset={i / (s.stops.length - 1)} stopColor={c} />
          ))}
        </linearGradient>
        <radialGradient id={`${uid}-glow`}>
          <stop offset="0" stopColor="#fff7ed" stopOpacity="0.9" />
          <stop offset="1" stopColor="#fff7ed" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="240" fill={`url(#${uid}-sky)`} />
      {sky === 'night' ? (
        <>
          {STARS.map((st, i) => (
            <circle key={i} cx={st.x} cy={st.y} r={st.r} fill="#f8fafc" opacity={0.5 + (i % 3) * 0.2} />
          ))}
          <circle cx="330" cy="46" r="16" fill="#fef9c3" />
          <circle cx="337" cy="41" r="14" fill="#1e1b4b" opacity="0.9" />
        </>
      ) : (
        <>
          <circle cx={sky === 'day' ? 332 : sky === 'dawn' ? 330 : 70} cy={sky === 'day' ? 42 : 128} r="46" fill={`url(#${uid}-glow)`} />
          <circle cx={sky === 'day' ? 332 : sky === 'dawn' ? 330 : 70} cy={sky === 'day' ? 42 : 128} r={sky === 'sunset' ? 20 : 14} fill="#fff7ed" />
        </>
      )}
      <g>
        {siteId === 'gyeongbok' && <GyeongbokDrawing />}
        {siteId === 'bulguk' && <BulgukDrawing />}
        {siteId === 'hwaseong' && <HwaseongDrawing />}
        {siteId === 'cheomseong' && <CheomseongDrawing />}
        {s.tone && <rect width="400" height="240" fill={s.tone} opacity={s.toneOpacity} style={{ mixBlendMode: 'multiply' }} />}
      </g>
    </>
  );
}

function SiteScene({ siteId, sky, uid }: { siteId: SiteId; sky: SkyId; uid: string }) {
  return (
    <svg viewBox="0 0 400 240" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <SiteSceneArt siteId={siteId} sky={sky} uid={uid} />
    </svg>
  );
}

/* ── Print overlay (300×400) ──────────────────────────── */

/**
 * 복원된 장면을 인물 뒤 배경으로 합성한다.
 * 기념사진처럼 인물은 가운데, 문화재(장면 x=200)는 오른편에 오도록 장면의 x 50–230 구간을 3:4로 잘라 쓴다.
 * 카메라 상반신 가이드(머리 타원 · 어깨선) 자리는 흐린 마스크로 비운다.
 */
function TravelerBackdrop({ siteId, sky }: { siteId: SiteId; sky: SkyId }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400">
      <defs>
        <filter id="htp-blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <mask id="htp-person">
          <rect width="300" height="400" fill="white" />
          <g filter="url(#htp-blur)" fill="black">
            <ellipse cx="150" cy="134" rx="63" ry="82" />
            <rect x="124" y="196" width="52" height="90" />
            <path d="M34 400 C40 306 94 268 150 266 C206 268 260 306 266 400 Z" />
          </g>
        </mask>
      </defs>
      <g mask="url(#htp-person)" opacity="0.95">
        <svg width="300" height="400" viewBox="50 0 180 240" preserveAspectRatio="xMidYMid slice">
          <SiteSceneArt siteId={siteId} sky={sky} uid="htp" />
        </svg>
      </g>
    </svg>
  );
}

/* ── Era step (선택한 문화재에 따라 시대가 바뀐다) ───────── */

function EraStep({ answers, onUpdate }: DemoStepProps) {
  const site = getSite(answers);
  const selected = getChoice(answers, 'era');

  return (
    <div>
      <p className="mb-4 text-center text-sm text-slate-400">
        {site.emoji} <span className="font-semibold text-white">{site.label}</span> 의 시간표
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        {site.eras.map((era) => {
          const isSelected = selected === era.id;
          const sky = SKIES[era.sky];
          return (
            <motion.button
              key={era.id}
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onUpdate('era', era.id)}
              aria-pressed={isSelected}
              className={cn(
                'relative overflow-hidden rounded-2xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400',
                isSelected ? 'border-teal-400 ring-1 ring-teal-400/40' : 'border-slate-700 hover:border-slate-600'
              )}
              style={{ background: `linear-gradient(160deg, ${sky.stops[0]}, ${sky.stops[2]}66 70%, #0f172a)` }}
            >
              <p className="font-display text-2xl font-extrabold text-white">{era.year}</p>
              <p className="mt-0.5 text-sm font-semibold text-white">{era.label}</p>
              <p className="mt-2 text-xs leading-relaxed text-white/75 [word-break:keep-all]">{era.desc}</p>
              <span className="mt-3 inline-block rounded-full bg-black/30 px-2 py-0.5 text-[10px] text-white/80">🕰️ {sky.label}의 장면</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

const eraStep: DemoStepDef = {
  meta: {
    id: 'era',
    titleKey: '어느 시대로 떠나볼까요?',
    subtitleKey: '고른 시대의 모습으로 AI가 문화유산을 복원해요',
    canProceed: (a) => getSite(a).eras.some((e) => e.id === getChoice(a, 'era')),
  },
  Component: EraStep,
};

/* ── Narration (Web Speech API) ───────────────────────── */

type VoiceState = 'idle' | 'speaking' | 'unsupported';

function Narration({ text, color, onPlayed }: { text: string; color: string; onPlayed: () => void }) {
  const [state, setState] = useState<VoiceState>('idle');
  const [charIndex, setCharIndex] = useState(0);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, []);

  const toggle = useCallback(() => {
    const synth = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
    if (!synth || typeof SpeechSynthesisUtterance === 'undefined') {
      setState('unsupported');
      return;
    }
    if (state === 'speaking') {
      synth.cancel();
      setState('idle');
      return;
    }
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.rate = 1;
    const korean = synth.getVoices().find((v) => v.lang.toLowerCase().startsWith('ko'));
    if (korean) utterance.voice = korean;
    setNote(korean ? null : '한국어 음성이 설치되지 않은 기기에서는 기본 음성으로 읽어요.');
    utterance.onboundary = (e) => setCharIndex(e.charIndex);
    utterance.onend = () => {
      setState('idle');
      setCharIndex(text.length);
    };
    utterance.onerror = () => setState('idle');
    setCharIndex(0);
    synth.speak(utterance);
    setState('speaking');
    onPlayed();
  }, [onPlayed, state, text]);

  const spoken = state === 'speaking' ? text.slice(0, charIndex) : '';
  const rest = state === 'speaking' ? text.slice(charIndex) : text;

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/60 p-5 text-left">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">AI 음성 해설</p>
        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          onClick={toggle}
          disabled={state === 'unsupported'}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
          style={{ backgroundColor: color }}
        >
          {state === 'speaking' ? (
            <>
              <span className="flex h-3 items-end gap-[2px]" aria-hidden="true">
                {[0, 1, 2, 3].map((i) => (
                  <motion.span
                    key={i}
                    className="w-[3px] rounded-full bg-white"
                    animate={{ height: ['30%', '100%', '45%', '80%', '30%'] }}
                    transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.12 }}
                  />
                ))}
              </span>
              해설 멈추기
            </>
          ) : (
            <>🔊 해설 듣기</>
          )}
        </motion.button>
      </div>
      <p className="mt-4 text-sm leading-relaxed [word-break:keep-all]">
        <span className="text-white">{spoken}</span>
        <span className={state === 'speaking' ? 'text-slate-500' : 'text-slate-300'}>{rest}</span>
      </p>
      {state === 'unsupported' && (
        <p className="mt-3 rounded-xl bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
          이 브라우저는 음성 해설을 지원하지 않아요. 위 자막으로 해설을 읽어 보세요.
        </p>
      )}
      {note && state === 'speaking' && <p className="mt-3 text-[11px] text-slate-500">{note}</p>}
    </div>
  );
}

/* ── Result ────────────────────────────────────────────── */

/** 결과 화면과 출력물이 함께 쓰는 여행 정보 */
function tripOf(answers: DemoAnswers) {
  const picked = getChoice(answers, 'site') as SiteId | undefined;
  const siteId: SiteId = picked && SITES[picked] ? picked : 'gyeongbok';
  const era = getEra(answers);
  return {
    siteId,
    site: SITES[siteId],
    era,
    sky: SKIES[era.sky],
    capture: getCapture(answers, 'photo'),
    serial: String(seededInt(answersSeed(answers), 'cert', 1000, 9999)),
    /** '1443년' · '7세기' */
    when: `${era.year}${/^\d+$/.test(era.year) ? '년' : ''}`,
  };
}

function Result({ answers, onRestart, pillarColor }: DemoResultProps) {
  const uid = useId().replace(/:/g, '');
  const { siteId, site, era, sky, capture, serial, when } = tripOf(answers);

  const [restored, setRestored] = useState(true);
  const [active, setActive] = useState<number | null>(null);
  const [visited, setVisited] = useState<number[]>([]);
  const [listened, setListened] = useState(false);
  const markListened = useCallback(() => setListened(true), []);

  const explore = (i: number) => {
    setActive(i);
    setVisited((v) => (v.includes(i) ? v : [...v, i]));
  };

  const complete = visited.length === site.hotspots.length;
  const narration = `${site.intro} 지금 우리는 ${when}, ${era.label}의 ${site.label}에 와 있어요. ${era.desc} 시간 여행자인 당신도 이 장면 속에 함께 서 있어요.`;
  const hotspot = active === null ? null : site.hotspots[active];

  return (
    <ResultShell
      eyebrow="AI 문화유산 타임머신"
      title={`${era.year} · ${site.label}`}
      description={`${era.label}의 모습을 AI가 복원하고, 그 시대에 당신을 배치했어요.`}
      pillarColor={pillarColor}
      onRestart={onRestart}
      restartLabel="다른 시대로 떠나기"
    >
      {/* 복원 장면 */}
      <div className="w-full max-w-md">
        <div className="relative aspect-[5/3] w-full overflow-hidden rounded-3xl border border-slate-700 shadow-2xl shadow-black/50">
          <SiteScene siteId={siteId} sky={era.sky} uid={`${uid}a`} />

          {/* 복원 전 (빛바랜 기록) — 스캔 라인이 지나가며 벗겨진다 */}
          <motion.div
            className="absolute inset-0"
            initial={{ clipPath: 'inset(0 0 0 0%)' }}
            animate={{ clipPath: restored ? 'inset(0 0 0 100%)' : 'inset(0 0 0 0%)' }}
            transition={{ duration: 2.2, ease: 'easeInOut', delay: restored ? 0.4 : 0 }}
            style={{ filter: 'grayscale(1) sepia(0.45) contrast(0.8) brightness(0.85)' }}
            aria-hidden="true"
          >
            <SiteScene siteId={siteId} sky="day" uid={`${uid}b`} />
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(90deg, transparent 0 37px, rgba(255,255,255,0.35) 37px 38px, transparent 38px 91px), radial-gradient(circle at 30% 40%, rgba(0,0,0,0.25), transparent 50%)',
              }}
            />
            <span className="absolute bottom-3 left-3 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-semibold text-stone-200">
              빛바랜 기록
            </span>
          </motion.div>
          <motion.div
            className="pointer-events-none absolute inset-y-0 w-1 bg-teal-300 shadow-[0_0_18px_6px_rgba(94,234,212,0.7)]"
            initial={{ left: '0%', opacity: 1 }}
            animate={{ left: restored ? '100%' : '0%', opacity: [1, 1, 0] }}
            transition={{ duration: 2.2, ease: 'easeInOut', delay: restored ? 0.4 : 0 }}
            aria-hidden="true"
          />

          {/* 시대 라벨 */}
          <div className="absolute left-3 top-3 rounded-full bg-black/55 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
            {site.emoji} {site.label} · {era.year} {era.label}
          </div>
          <button
            type="button"
            onClick={() => setRestored((r) => !r)}
            className="absolute right-3 top-3 rounded-full bg-black/55 px-3 py-1 text-[11px] font-medium text-teal-200 backdrop-blur-sm transition-colors hover:bg-black/75"
          >
            {restored ? '복원 전 보기' : 'AI 복원 보기'}
          </button>

          {/* 시간 여행자 */}
          {capture && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 2.4, type: 'spring', stiffness: 120, damping: 14 }}
              className="absolute bottom-3 right-3 w-[19%]"
            >
              <ProcessedPhoto
                src={capture.image}
                look={sky.look}
                className="aspect-[3/4] w-full rounded-t-full border-2 border-amber-200/90 shadow-lg shadow-black/60"
                alt="시간 여행자로 배치된 내 사진"
                delayMs={2600}
              />
              <p className="mt-1 rounded-full bg-amber-200 px-1 py-0.5 text-center text-[9px] font-bold text-amber-950">시간 여행자</p>
            </motion.div>
          )}

          {/* 핫스팟 */}
          {site.hotspots.map((h, i) => (
            <button
              key={h.title}
              type="button"
              onClick={() => explore(i)}
              aria-label={`${h.title} 탐험하기`}
              aria-pressed={active === i}
              className="absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center focus-visible:outline-none"
              style={{ left: `${h.x}%`, top: `${h.y}%` }}
            >
              <motion.span
                className="absolute inset-1 rounded-full border-2 border-white"
                animate={{ scale: [1, 1.7], opacity: [0.8, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.3 }}
              />
              <span
                className={cn(
                  'relative flex h-5 w-5 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold shadow-md',
                  visited.includes(i) ? 'bg-teal-400 text-slate-950' : 'bg-rose-500 text-white'
                )}
              >
                {visited.includes(i) ? '✓' : i + 1}
              </span>
            </button>
          ))}
        </div>

        {/* 핫스팟 설명 */}
        <div className="mt-3 min-h-[76px] rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-left">
          <AnimatePresence mode="wait">
            {hotspot ? (
              <motion.div key={hotspot.title} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                <p className="text-sm font-semibold text-white">📌 {hotspot.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-300 [word-break:keep-all]">{hotspot.fact}</p>
              </motion.div>
            ) : (
              <motion.p key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs leading-relaxed text-slate-400">
                👆 장면 속 빛나는 점을 눌러 탐험해 보세요. 세 곳을 모두 찾으면 교육 인증 도장이 찍혀요.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Narration text={narration} color={pillarColor} onPlayed={markListened} />

      {/* 연표 */}
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/60 p-5 text-left">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-400">{site.label} 연표</p>
        <ol className="relative space-y-3 border-l border-slate-700 pl-5">
          {site.timeline.map((t) => {
            const current = t.era === era.id;
            return (
              <li key={`${t.year}${t.text}`} className="relative">
                <span
                  className={cn('absolute -left-[26px] top-1 h-3 w-3 rounded-full border-2', current ? 'border-white' : 'border-slate-600 bg-slate-900')}
                  style={current ? { backgroundColor: pillarColor, boxShadow: `0 0 0 4px ${pillarColor}40` } : undefined}
                />
                <p className={cn('text-sm', current ? 'font-semibold text-white' : 'text-slate-400')}>
                  <span className="mr-2 font-mono text-xs" style={current ? { color: pillarColor } : undefined}>
                    {t.year}
                  </span>
                  {t.text}
                  {current && (
                    <span className="ml-2 rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ backgroundColor: pillarColor }}>
                      지금 여기
                    </span>
                  )}
                </p>
              </li>
            );
          })}
        </ol>
      </div>

      {/* 교육 인증 */}
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl border-4 border-double p-5 text-left"
        style={{ borderColor: '#d4a64a', background: 'linear-gradient(160deg, #1c1917, #0f172a)' }}
      >
        <p className="text-[10px] font-bold tracking-[0.3em] text-amber-300/80">NEANDER HERITAGE ACADEMY</p>
        <p className="mt-1 text-lg font-bold text-white">🎓 시간 여행 교육 인증</p>
        <p className="mt-1 text-xs text-slate-400">
          {site.label} {site.hanja} · {era.year} {era.label} 탐험 과정 · No. HT-{serial}
        </p>
        <ul className="mt-4 space-y-1.5 text-xs">
          <li className={cn(complete ? 'text-teal-300' : 'text-slate-400')}>
            {complete ? '✅' : '⬜'} 탐험 포인트 {visited.length}/{site.hotspots.length}
          </li>
          <li className={cn(listened ? 'text-teal-300' : 'text-slate-400')}>{listened ? '✅' : '⬜'} AI 음성 해설 듣기 (선택)</li>
          <li className="text-teal-300">✅ 시대 장면 속 인물 배치</li>
        </ul>
        <AnimatePresence>
          {complete ? (
            <motion.div
              key="stamp"
              initial={{ scale: 2.4, opacity: 0, rotate: -30 }}
              animate={{ scale: 1, opacity: 1, rotate: -14 }}
              transition={{ type: 'spring', stiffness: 220, damping: 12 }}
              className="absolute bottom-4 right-4 flex h-20 w-20 flex-col items-center justify-center rounded-full border-[3px] border-red-500 text-center font-bold text-red-500"
            >
              <span className="text-[10px] leading-none">NEANDER</span>
              <span className="text-sm leading-tight">인증<br />완료</span>
            </motion.div>
          ) : (
            <motion.span key="pending" exit={{ opacity: 0 }} className="absolute bottom-5 right-5 rounded-full border border-dashed border-slate-600 px-3 py-1 text-[10px] text-slate-500">
              도장 대기 중
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </ResultShell>
  );
}

/* ── Export ─────────────────────────────────────────────── */

function computeResult(answers: DemoAnswers): string {
  return getEra(answers).id;
}

export default defineDemo({
  config: {
    id: 'heritage-timemachine',
    targetSlug: 'ai-heritage-timemachine',
    industryId: 'tourism',
    analyzeEmoji: '⏳',
    analyzeDurationMs: 3800,
    analyzeImageStepId: 'photo',
    analyzeMessages: ['시간 좌표 설정 중', '사료·의궤 기반 원형 복원 중', '시대 하늘과 빛 재현 중', '시간 여행자 배치 중'],
  },
  steps: [
    choiceStep({
      id: 'site',
      title: '어떤 문화유산을 복원해 볼까요?',
      subtitle: 'AI가 사료를 바탕으로 옛 모습을 되살려요',
      columns: 2,
      options: (Object.keys(SITES) as SiteId[]).map((id) => ({
        id,
        emoji: SITES[id].emoji,
        label: SITES[id].label,
        desc: SITES[id].desc,
      })),
    }),
    eraStep,
    cameraStep({
      id: 'photo',
      title: '시간 여행자로 변신할게요',
      subtitle: '그 시대 장면 속에 당신을 배치해요',
      mode: 'portrait',
      subject: '모습',
      countdown: true,
      scanLabels: ['인물 영역 분리', '시대 조명 방향 맞춤', '빛바랜 필름 톤 매칭', '시간 좌표 고정'],
    }),
  ],
  computeResult,
  Result,
  print: (answers) => {
    const { siteId, site, era, sky, capture, serial, when } = tripOf(answers);
    return {
      kind: 'photo',
      photos: capture
        ? [{ src: capture.image, look: sky.look, label: `${site.label} · ${era.year} ${era.label}`, overlay: <TravelerBackdrop siteId={siteId} sky={era.sky} /> }]
        : [],
      title: `${era.year} · ${site.label}`,
      caption: `${site.label} ${site.hanja} · ${when} ${era.label} · ${sky.label}의 장면`,
      badge: `HT-${serial}`,
      paper: 'cream',
    };
  },
});
