'use client';

import { motion } from 'motion/react';
import type { DemoAnswers, DemoResultProps } from '@/types/demo';
import {
  ProcessedPhoto,
  ResultShell,
  TraitChips,
  answersSeed,
  cameraStep,
  choiceStep,
  defineDemo,
  getCapture,
  getChoice,
  seededPick,
  type PhotoLook,
} from '../kit';

/* ── Data ──────────────────────────────────────────────── */

type StyleId = 'webtoon' | 'popart' | 'pixel' | 'sketch' | 'watercolor';

const STYLES: Record<StyleId, { label: string; emoji: string; desc: string; artist: string; look: PhotoLook }> = {
  webtoon: {
    label: '웹툰',
    emoji: '💥',
    desc: '선명한 선과 셀 채색',
    artist: '웹툰 작가 모드',
    look: { adjust: { saturation: 1.35, contrast: 1.1, brightness: 1.05 }, effect: { kind: 'cartoon', levels: 6, edge: 0.16 } },
  },
  popart: {
    label: '팝아트',
    emoji: '🎨',
    desc: '앤디 워홀풍 망점 포스터',
    artist: '팝아트 스튜디오 모드',
    look: { adjust: { contrast: 1.2 }, effect: { kind: 'popart', dark: '#1e1b4b', light: '#fde047', dot: 8 } },
  },
  pixel: {
    label: '픽셀아트',
    emoji: '👾',
    desc: '8비트 게임 캐릭터',
    artist: '레트로 게임 모드',
    look: { adjust: { saturation: 1.4, contrast: 1.15 }, effect: { kind: 'pixelate', block: 14 } },
  },
  sketch: {
    label: '연필 스케치',
    emoji: '✏️',
    desc: '거리 화가의 크로키',
    artist: '몽마르트 화가 모드',
    look: { effect: { kind: 'sketch' }, grain: 18 },
  },
  watercolor: {
    label: '수채화',
    emoji: '🖌️',
    desc: '맑게 번지는 물감',
    artist: '수채화가 모드',
    look: {
      adjust: { saturation: 1.3, brightness: 1.12, contrast: 0.9 },
      effect: { kind: 'posterize', levels: 8 },
      tint: { color: '#fef3c7', alpha: 0.35, blend: 'soft-light' },
      vignette: 0.15,
    },
  },
};

type FrameId = 'postcard' | 'poster' | 'sticker';

const COMMENTS = [
  '눈매의 생기를 살리려고 하이라이트를 한 번 더 올렸어요.',
  '자신감 있는 표정이라 선을 조금 더 굵게 가져갔어요.',
  '부드러운 인상이 돋보여서 곡선 위주로 그렸어요.',
  '조명이 만든 음영이 좋아서 입체감을 살렸어요.',
  '웃는 입꼬리를 살짝 과장해서 캐리커처 느낌을 더했어요.',
];

/* ── Frames ────────────────────────────────────────────── */

function Framed({ frame, children }: { frame: FrameId; children: React.ReactNode }) {
  if (frame === 'poster') {
    return (
      <div className="relative w-64 overflow-hidden rounded-md border-8 border-slate-950 bg-slate-950 shadow-2xl">
        {children}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent px-4 pb-4 pt-10 text-left">
          <p className="font-display text-lg font-extrabold leading-tight text-white">
            MY
            <br />
            CARICATURE
          </p>
          <p className="mt-1 text-[10px] tracking-[0.3em] text-white/70">NEANDER FESTIVAL 2026</p>
        </div>
      </div>
    );
  }
  if (frame === 'sticker') {
    return (
      <motion.div
        initial={{ rotate: 0 }}
        animate={{ rotate: -4 }}
        className="w-56 overflow-hidden rounded-[2rem] border-[6px] border-white shadow-[0_12px_40px_rgba(0,0,0,0.5)]"
      >
        {children}
      </motion.div>
    );
  }
  return (
    <div className="w-64 rounded-sm bg-[#fdfbf6] p-3 pb-12 shadow-2xl">
      <div className="relative">{children}</div>
      <div className="mt-3 flex items-end justify-between px-1">
        <p className="font-display text-sm font-bold text-slate-800">Greetings from the Festival</p>
        <span className="rounded border-2 border-dashed border-rose-400 px-1.5 py-0.5 text-[9px] font-bold text-rose-500">
          AI ART
        </span>
      </div>
    </div>
  );
}

/* ── Result ────────────────────────────────────────────── */

function Result({ answers, onRestart, pillarColor }: DemoResultProps) {
  const capture = getCapture(answers, 'face');
  const style = STYLES[(getChoice(answers, 'style') as StyleId) ?? 'webtoon'] ?? STYLES.webtoon;
  const frame = (getChoice(answers, 'frame') as FrameId) ?? 'postcard';
  const seed = answersSeed(answers);
  const comment = seededPick(seed, 'comment', COMMENTS);

  return (
    <ResultShell
      eyebrow={style.artist}
      title={`${style.label} 캐리커처 완성!`}
      description={`AI 화가의 한마디: "${comment}"`}
      pillarColor={pillarColor}
      onRestart={onRestart}
      restartLabel="다른 스타일로 그리기"
    >
      {capture && (
        <Framed frame={frame}>
          <ProcessedPhoto src={capture.image} look={style.look} className="aspect-[3/4] w-full" alt={`${style.label} 캐리커처`} delayMs={1200} />
        </Framed>
      )}
      <TraitChips
        title="적용된 AI 변환"
        items={['얼굴 비율 과장', `${style.label} 필터`, '배경 단순화', frame === 'postcard' ? '엽서 레이아웃' : frame === 'poster' ? '포스터 레이아웃' : '스티커 커팅']}
      />
    </ResultShell>
  );
}

/* ── Export ─────────────────────────────────────────────── */

function computeResult(answers: DemoAnswers): string {
  return getChoice(answers, 'style') ?? 'webtoon';
}

export default defineDemo({
  config: {
    id: 'caricature-artist',
    targetSlug: 'ai-caricature-artist',
    industryId: 'festival',
    analyzeEmoji: '🎨',
    analyzeDurationMs: 3200,
    analyzeImageStepId: 'face',
    analyzeMessages: ['얼굴 특징 과장 포인트 찾는 중', '붓 터치 생성 중', '색 채우는 중', '서명 넣는 중'],
  },
  steps: [
    cameraStep({
      id: 'face',
      title: 'AI 화가 앞에 앉아주세요',
      subtitle: '재미있는 표정일수록 캐리커처가 살아나요',
      mode: 'face',
      countdown: true,
      scanLabels: ['얼굴 윤곽 추출', '이목구비 비율 측정', '표정 특징 분석', '과장 포인트 선정'],
      readouts: (c) => [
        { label: '표정 에너지', value: `${60 + (c.seed % 38)}%` },
        { label: '조명 대비', value: c.stats.contrast > 45 ? '드라마틱' : '부드러움' },
      ],
    }),
    choiceStep({
      id: 'style',
      title: '어떤 화풍으로 그려드릴까요?',
      columns: 3,
      options: (Object.keys(STYLES) as StyleId[]).map((id) => ({
        id,
        emoji: STYLES[id].emoji,
        label: STYLES[id].label,
        desc: STYLES[id].desc,
      })),
    }),
    choiceStep({
      id: 'frame',
      title: '어떤 형태로 받아볼까요?',
      columns: 3,
      options: [
        { id: 'postcard', emoji: '💌', label: '엽서', desc: '축제 기념 엽서' },
        { id: 'poster', emoji: '🖼️', label: '포스터', desc: '타이틀이 들어간 포스터' },
        { id: 'sticker', emoji: '🏷️', label: '스티커', desc: '다이컷 스티커' },
      ],
    }),
  ],
  computeResult,
  Result,
  print: (answers) => {
    const capture = getCapture(answers, 'face');
    const style = STYLES[(getChoice(answers, 'style') as StyleId) ?? 'webtoon'] ?? STYLES.webtoon;
    const frame = (getChoice(answers, 'frame') as FrameId) ?? 'postcard';
    return {
      kind: 'photo',
      photos: capture ? [{ src: capture.image, look: style.look }] : [],
      title: `${style.label} 캐리커처`,
      caption: `AI 화가의 한마디 · ${seededPick(answersSeed(answers), 'comment', COMMENTS)}`,
      paper: frame === 'poster' ? 'black' : frame === 'postcard' ? 'cream' : 'white',
    };
  },
});
