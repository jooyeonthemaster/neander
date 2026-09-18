'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import type { DemoAnswers, DemoResultProps } from '@/types/demo';
import {
  InfoGrid,
  Panel,
  ResultShell,
  TraitChips,
  cameraStep,
  choiceStep,
  defineDemo,
  getCapture,
  getChoice,
  renderLook,
  seededPick,
  type PhotoLook,
} from '../kit';

/* ── Data ──────────────────────────────────────────────── */

type StyleId = 'ink' | 'minhwa' | 'dancheong' | 'bluewhite';
type FormatId = 'scroll' | 'screen';

interface PaintStyle {
  label: string;
  hanja: string;
  emoji: string;
  desc: string;
  swatch: string;
  look: PhotoLook;
  /** 족자·병풍 비단 장황 */
  silk: string;
  silkLine: string;
  paper: string;
  history: string;
  tip: string;
  techniques: string[];
}

const STYLES: Record<StyleId, PaintStyle> = {
  ink: {
    label: '수묵화',
    hanja: '水墨畫',
    emoji: '🖌️',
    desc: '먹의 농담과 번짐',
    swatch: 'linear-gradient(135deg, #f3ecdc 0 35%, #8a847a 60%, #1c1917)',
    look: { adjust: { contrast: 1.1 }, effect: { kind: 'ink', paper: '#efe6d2' }, grain: 10 },
    silk: '#b9ab8b',
    silkLine: '#8c7b58',
    paper: '#efe6d2',
    history:
      '먹과 물의 번짐만으로 대상의 정신까지 담아내는 그림이에요. 조선 후기 겸재 정선은 우리 산천을 직접 보고 그린 ‘진경산수화’로 수묵화를 가장 한국적인 화풍으로 꽃피웠어요.',
    tip: '비워 둔 여백도 그림의 일부예요. 여백이 먹빛을 더 깊어 보이게 해요.',
    techniques: ['발묵(潑墨) 번짐', '갈필 외곽선', '한지 질감', '여백 구성'],
  },
  minhwa: {
    label: '민화',
    hanja: '民畫',
    emoji: '🐯',
    desc: '선명한 오방색 채색',
    swatch: 'linear-gradient(135deg, #dc2626, #f59e0b 40%, #16a34a 70%, #1d4ed8)',
    look: {
      adjust: { saturation: 1.6, contrast: 1.12, brightness: 1.05, warmth: 0.3 },
      effect: { kind: 'posterize', levels: 5 },
      tint: { color: '#f59e0b', alpha: 0.18, blend: 'soft-light' },
      grain: 8,
    },
    silk: '#1e3a5f',
    silkLine: '#d4a64a',
    paper: '#f4e7c8',
    history:
      '조선 후기 서민들이 집을 꾸미고 복을 빌기 위해 그린 생활 그림이에요. 까치호랑이, 책거리, 모란도처럼 강렬한 색과 대담하고 해학적인 구성이 특징이에요.',
    tip: '민화의 색은 복을 부르는 오방색(청·적·황·백·흑)에서 왔어요.',
    techniques: ['포스터 톤 분리', '오방색 채색', '따뜻한 호분 톤', '장지 질감'],
  },
  dancheong: {
    label: '단청',
    hanja: '丹靑',
    emoji: '🏯',
    desc: '붉은 석간주 × 녹청',
    swatch: 'linear-gradient(135deg, #14532d 0 45%, #e8846b 45% 100%)',
    look: {
      adjust: { contrast: 1.18, brightness: 1.04 },
      effect: { kind: 'duotone', dark: '#123c2e', light: '#f08a6c' },
      grain: 6,
      vignette: 0.15,
    },
    silk: '#14532d',
    silkLine: '#e0a91b',
    paper: '#f6e3cf',
    history:
      '목조 건축에 청·적·황·백·흑 오방색을 칠해 나무를 보호하고 위엄을 더하는 전통 기법이에요. 궁궐과 사찰의 처마 아래 붉은 석간주와 푸른 뇌록이 대표 색이에요.',
    tip: '단청은 칠하는 사람을 ‘화원’이 아니라 ‘단청장’이라 부르며 국가무형유산으로 전해져요.',
    techniques: ['듀오톤 매핑', '석간주 레드', '뇌록 그린', '고색 비네팅'],
  },
  bluewhite: {
    label: '청화백자',
    hanja: '靑華白磁',
    emoji: '🏺',
    desc: '순백 위 코발트 청색',
    swatch: 'radial-gradient(circle at 50% 50%, #1e40af 0 18%, transparent 19%), linear-gradient(135deg, #f8fafc, #dbeafe)',
    look: {
      adjust: { contrast: 1.15, brightness: 1.08 },
      effect: { kind: 'duotone', dark: '#1e3a8a', light: '#f8fafc' },
      vignette: 0.08,
    },
    silk: '#c7d4e6',
    silkLine: '#1e3a8a',
    paper: '#f8fafc',
    history:
      '순백의 백자 위에 코발트 안료로 푸른 무늬를 그려 구운 조선 도자기예요. 15세기 무렵부터 왕실을 중심으로 만들어졌고, 수입 안료가 귀해 ‘회회청’이라 부르며 아껴 썼어요.',
    tip: '청화의 푸른빛은 1,250℃가 넘는 가마 불에서 유약 아래로 스며들어 완성돼요.',
    techniques: ['코발트 듀오톤', '백자 유약광', '청화 발색', '도자 곡면 비네팅'],
  },
};

const FORMATS: Record<FormatId, { label: string; hanja: string; emoji: string; desc: string }> = {
  scroll: { label: '족자', hanja: '簇子', emoji: '📜', desc: '비단으로 꾸민 세로 두루마리' },
  screen: { label: '병풍', hanja: '屛風', emoji: '🏞️', desc: '세 폭으로 접히는 병풍' },
};

/** 호(號) 생성용 글자 */
const HO_FIRST: [string, string, string][] = [
  ['송', '松', '사철 푸른 소나무처럼 곧은'],
  ['운', '雲', '구름처럼 자유로운'],
  ['청', '靑', '늘 푸르고 싱그러운'],
  ['매', '梅', '눈 속의 매화처럼 강인한'],
  ['난', '蘭', '난초처럼 기품 있는'],
  ['죽', '竹', '대나무처럼 올곧은'],
  ['월', '月', '달빛처럼 은은한'],
  ['해', '海', '바다처럼 너그러운'],
  ['학', '鶴', '학처럼 고고한'],
  ['연', '蓮', '연꽃처럼 맑은'],
  ['산', '山', '산처럼 듬직한'],
];
const HO_SECOND: [string, string, string][] = [
  ['암', '巖', '바위'],
  ['재', '齋', '서재'],
  ['당', '堂', '집'],
  ['헌', '軒', '처마'],
  ['정', '亭', '정자'],
  ['원', '園', '뜰'],
  ['곡', '谷', '골짜기'],
  ['계', '溪', '시냇가'],
  ['촌', '村', '마을'],
];

function makeHo(seed: number) {
  const [k1, h1, trait] = seededPick(seed, 'ho1', HO_FIRST);
  const [k2, h2, place] = seededPick(seed, 'ho2', HO_SECOND);
  return { ko: `${k1}${k2}`, hanja: `${h1}${h2}`, h1, h2, meaning: `${trait} ${place}의 주인` };
}

/* ── Render hook (한 번 변환해 여러 폭에 재사용) ─────────── */

function useRenderedLook(src: string | undefined, look: PhotoLook, delayMs = 1100) {
  const lookKey = JSON.stringify(look);
  const [out, setOut] = useState<{ src: string; lookKey: string; url: string } | null>(null);

  useEffect(() => {
    if (!src) return;
    let alive = true;
    const started = performance.now();
    renderLook(src, JSON.parse(lookKey) as PhotoLook)
      .catch(() => src)
      .then((url) => {
        const wait = Math.max(0, delayMs - (performance.now() - started));
        window.setTimeout(() => alive && setOut({ src, lookKey, url }), wait);
      });
    return () => {
      alive = false;
    };
  }, [src, lookKey, delayMs]);

  return out && out.src === src && out.lookKey === lookKey ? out.url : null;
}

/* ── Pieces ────────────────────────────────────────────── */

function Painting({ url, alt, className, imgClassName, delay = 0 }: { url: string | null; alt: string; className?: string; imgClassName?: string; delay?: number }) {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      {url ? (
        <motion.img
          src={url}
          alt={alt}
          initial={{ opacity: 0, filter: 'blur(12px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1, delay, ease: 'easeOut' }}
          className={cn('h-full w-full object-cover', imgClassName)}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/10">
          <motion.span
            className="text-2xl"
            animate={{ rotate: [-12, 12, -12] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            aria-hidden="true"
          >
            🖌️
          </motion.span>
          <span className="text-[10px] text-stone-500">붓질 중…</span>
        </div>
      )}
    </div>
  );
}

/** 낙관 — 오른쪽 세로줄부터 읽는 2×2 백문인(白文印) */
function Seal({ ho, size = 44 }: { ho: ReturnType<typeof makeHo>; size?: number }) {
  return (
    <motion.div
      initial={{ scale: 2.2, opacity: 0, rotate: -12 }}
      animate={{ scale: 1, opacity: 1, rotate: -3 }}
      transition={{ delay: 1.6, type: 'spring', stiffness: 260, damping: 14 }}
      className="grid shrink-0 grid-flow-col grid-cols-2 grid-rows-2 place-items-center rounded-[3px] bg-[#b3261e] p-[3px] font-serif font-bold leading-none text-[#fde8e4] shadow-[0_0_0_1px_rgba(179,38,30,0.4)] [direction:rtl]"
      style={{ width: size, height: size, fontSize: size * 0.34 }}
      aria-label={`${ho.hanja}之印 낙관`}
    >
      {[ho.h1, ho.h2, '之', '印'].map((c, i) => (
        <span key={`${c}${i}`}>{c}</span>
      ))}
    </motion.div>
  );
}

function Inscription({ ho, styleHanja, className }: { ho: ReturnType<typeof makeHo>; styleHanja: string; className?: string }) {
  return (
    <p
      className={cn('font-serif text-[13px] leading-[1.35] tracking-[0.2em] text-stone-800 [writing-mode:vertical-rl]', className)}
      aria-label={`${ho.hanja} 선생 진영, 병오년 가을`}
    >
      {ho.hanja}先生眞影
      <span className="mt-2 block text-[10px] tracking-[0.25em] text-stone-600">
        {INSCRIPTION_DATE} {styleHanja}
      </span>
    </p>
  );
}

function silkBackground(style: PaintStyle) {
  return `repeating-linear-gradient(45deg, rgba(255,255,255,0.07) 0 2px, transparent 2px 9px), repeating-linear-gradient(-45deg, rgba(0,0,0,0.08) 0 2px, transparent 2px 9px), ${style.silk}`;
}

function HangingScroll({ url, style, ho }: { url: string | null; style: PaintStyle; ho: ReturnType<typeof makeHo> }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="flex flex-col items-center drop-shadow-[0_18px_30px_rgba(0,0,0,0.55)]"
    >
      {/* 걸이 끈 */}
      <svg width="140" height="34" viewBox="0 0 140 34" aria-hidden="true">
        <path d="M10 33 L70 4 L130 33" fill="none" stroke="#a16207" strokeWidth="2" />
        <circle cx="70" cy="4" r="3.5" fill="#78350f" />
      </svg>
      {/* 천간 (윗막대) */}
      <div className="h-3 w-[262px] rounded-full bg-gradient-to-b from-[#9a6a3a] to-[#4a2c14]" />
      <motion.div
        initial={{ scaleY: 0.05 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 1.1, ease: [0.3, 0.8, 0.4, 1], delay: 0.2 }}
        style={{ transformOrigin: 'top', background: silkBackground(style) }}
        className="relative w-[244px] px-[18px] pb-12 pt-11"
      >
        {/* 풍대 */}
        <span className="absolute left-[76px] top-0 h-9 w-[7px]" style={{ background: style.silkLine }} aria-hidden="true" />
        <span className="absolute right-[76px] top-0 h-9 w-[7px]" style={{ background: style.silkLine }} aria-hidden="true" />
        <div className="border-y-[3px] p-2" style={{ borderColor: style.silkLine, background: style.paper }}>
          <div className="flex gap-2">
            <Painting url={url} alt={`${style.label} 초상화`} className="aspect-[3/4] flex-1" />
            <div className="flex w-7 flex-col items-center justify-between py-1">
              <Inscription ho={ho} styleHanja={style.hanja} />
              <Seal ho={ho} size={28} />
            </div>
          </div>
        </div>
      </motion.div>
      {/* 축 (아랫막대) */}
      <div className="relative h-5 w-[268px] rounded-full bg-gradient-to-b from-[#8a5a2b] via-[#5c3a1a] to-[#3b230e]">
        <span className="absolute -left-2 top-1/2 h-7 w-4 -translate-y-1/2 rounded-md bg-gradient-to-b from-[#e7d3a1] to-[#a8864a]" />
        <span className="absolute -right-2 top-1/2 h-7 w-4 -translate-y-1/2 rounded-md bg-gradient-to-b from-[#e7d3a1] to-[#a8864a]" />
      </div>
    </motion.div>
  );
}

const SCREEN_PANELS = [
  { rotate: 16, caption: '傳神', img: 'scale-[1.7] [transform-origin:50%_42%]' },
  { rotate: -16, caption: '', img: '' },
  { rotate: 16, caption: '寫照', img: '-scale-x-100 object-[50%_30%] saturate-[0.85]' },
];

function FoldingScreen({ url, style, ho }: { url: string | null; style: PaintStyle; ho: ReturnType<typeof makeHo> }) {
  return (
    <div className="w-full max-w-md">
      <div className="flex items-stretch justify-center" style={{ perspective: 900 }}>
        {SCREEN_PANELS.map((panel, i) => (
          <motion.div
            key={i}
            initial={{ rotateY: i === 1 ? 0 : panel.rotate * 5, opacity: 0 }}
            animate={{ rotateY: panel.rotate, opacity: 1 }}
            transition={{ duration: 1, delay: 0.15 * i, ease: 'easeOut' }}
            className="relative w-[31%] rounded-[3px] bg-gradient-to-b from-[#3b2314] to-[#1f120a] p-[5px] shadow-xl"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* 경첩 */}
            {i > 0 && (
              <>
                <span className="absolute -left-[3px] top-[18%] h-3 w-[6px] rounded-sm bg-[#c9a24a]" aria-hidden="true" />
                <span className="absolute -left-[3px] bottom-[18%] h-3 w-[6px] rounded-sm bg-[#c9a24a]" aria-hidden="true" />
              </>
            )}
            <div className="h-full p-[5px]" style={{ background: silkBackground(style) }}>
              <div className="relative flex h-full flex-col p-1.5" style={{ background: style.paper }}>
                <Painting
                  url={url}
                  alt={i === 1 ? `${style.label} 초상화 병풍 가운데 폭` : `${style.label} 초상화 변주 ${i + 1}폭`}
                  className="aspect-[5/11] w-full"
                  imgClassName={panel.img}
                  delay={0.2 * i}
                />
                {panel.caption && (
                  <span
                    className="absolute left-2.5 top-2.5 rounded-sm px-0.5 py-1 font-serif text-sm font-bold tracking-[0.3em] text-stone-900 [writing-mode:vertical-rl]"
                    style={{ background: `${style.paper}dd` }}
                  >
                    {panel.caption}
                  </span>
                )}
                {i === 2 && (
                  <div className="absolute bottom-2 right-2 flex flex-col items-center gap-1.5 rounded-sm bg-white/60 px-1 py-1.5 backdrop-blur-[1px]">
                    <Inscription ho={ho} styleHanja={style.hanja} className="text-[10px]" />
                    <Seal ho={ho} size={24} />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      {/* 바닥 그림자 */}
      <div className="mx-auto mt-2 h-3 w-4/5 rounded-[50%] bg-black/50 blur-md" aria-hidden="true" />
    </div>
  );
}

/* ── Shared (결과 화면 · 출력물) ────────────────────────── */

/** 제문(題文)의 연기 — 병오년 가을 */
const INSCRIPTION_DATE = '丙午秋';
const SERIF_SVG = "'AppleMyungjo', 'Nanum Myeongjo', 'Batang', 'Noto Serif KR', serif";

function portraitOf(answers: DemoAnswers) {
  const capture = getCapture(answers, 'face');
  const pickedStyle = getChoice(answers, 'style') as StyleId | undefined;
  const pickedFormat = getChoice(answers, 'format') as FormatId | undefined;
  const formatId: FormatId = pickedFormat && FORMATS[pickedFormat] ? pickedFormat : 'scroll';
  return {
    capture,
    style: (pickedStyle && STYLES[pickedStyle]) || STYLES.ink,
    formatId,
    format: FORMATS[formatId],
    ho: makeHo(capture?.seed ?? 7),
  };
}

/** 출력물용 제문 + 낙관 (300×400, 그림 오른쪽 위 여백에 얹는다) */
function InscriptionOverlay({ ho, style }: { ho: ReturnType<typeof makeHo>; style: PaintStyle }) {
  const main = [...`${ho.hanja}先生眞影`];
  const side = [...INSCRIPTION_DATE, '', ...style.hanja];
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400">
      <rect x="244" y="12" width="46" height="178" rx="3" fill={style.paper} opacity="0.86" />
      <g fontFamily={SERIF_SVG} textAnchor="middle" dominantBaseline="central">
        {main.map((ch, i) => (
          <text key={`m${i}`} x="276" y={30 + i * 19} fontSize="16" fontWeight="700" fill="#292524">
            {ch}
          </text>
        ))}
        {side.map((ch, i) =>
          ch ? (
            <text key={`s${i}`} x="256" y={32 + i * 12} fontSize="10" fill="#57534e">
              {ch}
            </text>
          ) : null
        )}
      </g>
      {/* 낙관 — 오른쪽 세로줄부터 읽는 2×2 백문인 */}
      <g transform="rotate(-3 267 160)">
        <rect x="252" y="145" width="30" height="30" rx="2" fill="#b3261e" />
        <g fontFamily={SERIF_SVG} fontSize="10.5" fontWeight="700" fill="#fde8e4" textAnchor="middle" dominantBaseline="central">
          <text x="274.5" y="152.5">{ho.h1}</text>
          <text x="274.5" y="167.5">{ho.h2}</text>
          <text x="259.5" y="152.5">之</text>
          <text x="259.5" y="167.5">印</text>
        </g>
      </g>
    </svg>
  );
}

/* ── Result ────────────────────────────────────────────── */

function Result({ answers, onRestart, pillarColor }: DemoResultProps) {
  const { capture, style, formatId, format, ho } = portraitOf(answers);
  const url = useRenderedLook(capture?.image, style.look);

  return (
    <ResultShell
      eyebrow={`AI 전통 화가 · ${style.label} ${format.label}`}
      title={`${ho.ko}(${ho.hanja}) 선생의 초상`}
      description={`AI 화가가 ‘${ho.meaning}’이라는 뜻의 호를 지어 낙관을 찍었어요.`}
      pillarColor={pillarColor}
      onRestart={onRestart}
      restartLabel="다른 화풍으로 그리기"
    >
      {capture && (formatId === 'screen' ? <FoldingScreen url={url} style={style} ho={ho} /> : <HangingScroll url={url} style={style} ho={ho} />)}

      <InfoGrid
        items={[
          { emoji: style.emoji, label: '화풍', value: `${style.label} ${style.hanja}` },
          { emoji: format.emoji, label: '표구 형식', value: `${format.label} ${format.hanja}` },
          { emoji: '🔴', label: '호(號) · 낙관', value: `${ho.ko} ${ho.hanja}之印` },
          { emoji: '🖼️', label: '출력', value: formatId === 'screen' ? '3폭 미니 병풍' : '비단 족자 A3' },
        ]}
      />

      <Panel title={`한국 미술 이야기 · ${style.label}`}>
        <p className="text-sm leading-relaxed text-slate-300 [word-break:keep-all]">{style.history}</p>
        <p className="mt-3 rounded-xl bg-slate-950/60 px-3 py-2 text-xs leading-relaxed text-slate-400 [word-break:keep-all]">
          💡 {style.tip}
        </p>
        <p className="mt-3 border-t border-slate-800 pt-3 text-xs leading-relaxed text-slate-400 [word-break:keep-all]">
          🖋️ 조선의 초상화는 겉모습을 넘어 그 사람의 정신까지 옮겨 그린다는 ‘전신사조(傳神寫照)’를 가장 중요하게 여겼어요.
        </p>
      </Panel>

      <TraitChips title="AI 변환 기법" items={style.techniques} />
    </ResultShell>
  );
}

/* ── Export ─────────────────────────────────────────────── */

function computeResult(answers: DemoAnswers): string {
  return `${getChoice(answers, 'style') ?? 'ink'}-${getChoice(answers, 'format') ?? 'scroll'}`;
}

export default defineDemo({
  config: {
    id: 'traditional-painter',
    targetSlug: 'ai-traditional-painter',
    industryId: 'tourism',
    analyzeEmoji: '🖌️',
    analyzeDurationMs: 3600,
    analyzeImageStepId: 'face',
    analyzeMessages: ['먹을 갈고 붓을 고르는 중', '필선으로 윤곽 옮기는 중', '전통 안료 채색 중', '호를 짓고 낙관 새기는 중'],
  },
  steps: [
    cameraStep({
      id: 'face',
      title: '초상화를 그릴게요, 정면을 바라봐 주세요',
      subtitle: '옛 초상화처럼 단정한 표정이면 더 멋지게 그려져요',
      mode: 'face',
      subject: '얼굴',
      scanLabels: ['얼굴 윤곽 추출', '이목구비 필선 분석', '먹선 경로 계산', '전신(傳神) 포인트 선정'],
      readouts: (c) => [
        { label: '필선 대비', value: c.stats.contrast > 45 ? '굵고 힘찬 선' : '부드러운 선' },
        { label: '추천 농담', value: c.stats.brightness > 50 ? '담묵(옅은 먹)' : '농묵(짙은 먹)' },
      ],
    }),
    choiceStep({
      id: 'style',
      title: '어떤 화풍으로 그려드릴까요?',
      subtitle: '한국 전통 미술의 네 가지 스타일이에요',
      columns: 4,
      options: (Object.keys(STYLES) as StyleId[]).map((id) => ({
        id,
        label: STYLES[id].label,
        desc: STYLES[id].desc,
        swatch: STYLES[id].swatch,
      })),
    }),
    choiceStep({
      id: 'format',
      title: '어떤 형태로 표구할까요?',
      columns: 2,
      options: (Object.keys(FORMATS) as FormatId[]).map((id) => ({
        id,
        emoji: FORMATS[id].emoji,
        label: `${FORMATS[id].label} ${FORMATS[id].hanja}`,
        desc: FORMATS[id].desc,
      })),
    }),
  ],
  computeResult,
  Result,
  print: (answers) => {
    const { capture, style, format, ho } = portraitOf(answers);
    return {
      kind: 'photo',
      photos: capture ? [{ src: capture.image, look: style.look, overlay: <InscriptionOverlay ho={ho} style={style} /> }] : [],
      title: `${ho.ko}(${ho.hanja}) 선생의 초상`,
      caption: `${ho.hanja}之印 · ${ho.meaning} · ${style.label} ${format.label}`,
      paper: 'cream',
    };
  },
});
