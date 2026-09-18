'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import type { DemoAnswers, DemoResultProps } from '@/types/demo';
import {
  InfoGrid,
  Panel,
  ResultShell,
  ScoreBars,
  TraitChips,
  choiceStep,
  defineDemo,
  getChoice,
  getVoice,
  micStep,
} from '../kit';

/* ── Data ──────────────────────────────────────────────── */

type VoiceType = 'bass' | 'baritone' | 'tenor' | 'alto' | 'soprano';

const VOICE_TYPES: Record<VoiceType, { name: string; range: string; desc: string; genres: string[]; singers: string }> = {
  bass: {
    name: '울림 있는 저음 보이스',
    range: '80–120Hz',
    desc: '낮고 묵직한 울림이 신뢰감을 주는 목소리예요. 내레이션과 발라드 저음 파트에서 빛나요.',
    genres: ['R&B 발라드', '재즈 보컬', '내레이션'],
    singers: '깊은 저음이 매력인 발라드 보컬 스타일',
  },
  baritone: {
    name: '부드러운 중저음 보이스',
    range: '110–160Hz',
    desc: '따뜻하고 안정적인 중저음이에요. 편안하게 귀에 감기는 라디오 DJ형 음색이에요.',
    genres: ['어쿠스틱', '시티팝', '라디오 DJ'],
    singers: '담백하게 이야기하듯 부르는 싱어송라이터 스타일',
  },
  tenor: {
    name: '청량한 미성 보이스',
    range: '150–220Hz',
    desc: '맑고 가볍게 뻗는 목소리예요. 고음 애드리브와 밝은 팝 장르에 잘 어울려요.',
    genres: ['K-POP 보컬', '밴드 록', '뮤지컬'],
    singers: '시원하게 고음을 뽑는 아이돌 메인보컬 스타일',
  },
  alto: {
    name: '매력적인 허스키 알토',
    range: '180–250Hz',
    desc: '적당한 두께감과 호소력을 가진 목소리예요. 감성적인 곡에서 존재감이 커요.',
    genres: ['인디 팝', '소울', 'OST'],
    singers: '짙은 감성으로 드라마 OST를 부르는 보컬 스타일',
  },
  soprano: {
    name: '반짝이는 하이 톤 보이스',
    range: '240Hz 이상',
    desc: '밝고 경쾌하게 튀는 고음역 목소리예요. 에너지가 필요한 곡과 광고 보이스에 잘 맞아요.',
    genres: ['댄스 팝', '애니메이션 OST', '광고 CM송'],
    singers: '밝고 통통 튀는 걸그룹 보컬 스타일',
  },
};

function classify(pitchHz: number): VoiceType {
  if (pitchHz < 115) return 'bass';
  if (pitchHz < 155) return 'baritone';
  if (pitchHz < 200) return 'tenor';
  if (pitchHz < 245) return 'alto';
  return 'soprano';
}

/* ── Voice filter player ───────────────────────────────── */

type FilterId = 'original' | 'robot' | 'chipmunk' | 'deep' | 'echo' | 'hall';

const FILTERS: { id: FilterId; label: string; emoji: string }[] = [
  { id: 'original', label: '원본', emoji: '🎙️' },
  { id: 'robot', label: '로봇', emoji: '🤖' },
  { id: 'chipmunk', label: '다람쥐', emoji: '🐿️' },
  { id: 'deep', label: '저음 괴물', emoji: '👹' },
  { id: 'echo', label: '에코', emoji: '⛰️' },
  { id: 'hall', label: '콘서트홀', emoji: '🏟️' },
];

/** 잔향용 임펄스 응답 (감쇠하는 노이즈) */
function createImpulse(ctx: AudioContext, seconds: number): AudioBuffer {
  const length = Math.floor(ctx.sampleRate * seconds);
  const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let channel = 0; channel < 2; channel++) {
    const data = impulse.getChannelData(channel);
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.5);
  }
  return impulse;
}

function VoiceFilterPlayer({ audioUrl, color }: { audioUrl: string; color: string }) {
  const ctxRef = useRef<AudioContext | null>(null);
  const bufferRef = useRef<AudioBuffer | null>(null);
  const stopRef = useRef<(() => void) | null>(null);
  const [playing, setPlaying] = useState<FilterId | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    return () => {
      stopRef.current?.();
      ctxRef.current?.close().catch(() => {});
    };
  }, []);

  const play = useCallback(
    async (filter: FilterId) => {
      stopRef.current?.();
      try {
        const ctx = ctxRef.current ?? new AudioContext();
        ctxRef.current = ctx;
        if (ctx.state === 'suspended') await ctx.resume();
        if (!bufferRef.current) {
          const data = await (await fetch(audioUrl)).arrayBuffer();
          bufferRef.current = await ctx.decodeAudioData(data);
        }

        const source = ctx.createBufferSource();
        source.buffer = bufferRef.current;
        const output = ctx.createGain();
        output.connect(ctx.destination);
        const extra: AudioScheduledSourceNode[] = [];

        if (filter === 'chipmunk') source.playbackRate.value = 1.5;
        if (filter === 'deep') source.playbackRate.value = 0.7;

        if (filter === 'robot') {
          // 링 모듈레이션: 60Hz 사인파로 음량을 흔들어 금속성 음색을 만든다
          const ring = ctx.createGain();
          ring.gain.value = 0;
          const osc = ctx.createOscillator();
          osc.frequency.value = 60;
          osc.connect(ring.gain);
          osc.start();
          extra.push(osc);
          source.connect(ring).connect(output);
          output.gain.value = 1.6;
        } else if (filter === 'echo') {
          const delay = ctx.createDelay(1);
          delay.delayTime.value = 0.28;
          const feedback = ctx.createGain();
          feedback.gain.value = 0.45;
          source.connect(output);
          source.connect(delay);
          delay.connect(feedback).connect(delay);
          delay.connect(output);
        } else if (filter === 'hall') {
          const convolver = ctx.createConvolver();
          convolver.buffer = createImpulse(ctx, 2.8);
          const wet = ctx.createGain();
          wet.gain.value = 0.8;
          source.connect(output);
          source.connect(convolver).connect(wet).connect(output);
        } else {
          source.connect(output);
        }

        const stop = () => {
          try {
            source.stop();
          } catch {
            /* 이미 끝난 소스 */
          }
          extra.forEach((node) => {
            try {
              node.stop();
            } catch {
              /* noop */
            }
          });
          output.disconnect();
          setPlaying(null);
        };
        source.onended = () => {
          if (stopRef.current === stop) stop();
        };
        stopRef.current = stop;
        source.start();
        setPlaying(filter);
      } catch {
        setFailed(true);
      }
    },
    [audioUrl]
  );

  if (failed) return <p className="text-xs text-slate-500">이 브라우저에서는 필터 미리듣기를 재생할 수 없어요.</p>;

  return (
    <div className="grid grid-cols-3 gap-2">
      {FILTERS.map((f) => (
        <motion.button
          key={f.id}
          type="button"
          whileTap={{ scale: 0.95 }}
          onClick={() => (playing === f.id ? stopRef.current?.() : play(f.id))}
          className={cn(
            'flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-xs transition-colors',
            playing === f.id ? 'text-white' : 'border-slate-700 bg-slate-950/40 text-slate-300 hover:border-slate-500'
          )}
          style={playing === f.id ? { borderColor: color, backgroundColor: `${color}25` } : undefined}
          aria-pressed={playing === f.id}
        >
          <span className="text-xl">{f.emoji}</span>
          {playing === f.id ? '■ 정지' : f.label}
        </motion.button>
      ))}
    </div>
  );
}

/* ── Result ────────────────────────────────────────────── */

function Result({ resultKey, answers, onRestart, pillarColor }: DemoResultProps) {
  const voice = getVoice(answers, 'voice');
  const type = VOICE_TYPES[resultKey as VoiceType] ?? VOICE_TYPES.baritone;
  const goal = getChoice(answers, 'goal');
  const pitch = voice?.pitchHz ?? 160;
  const volume = voice?.volume ?? 60;
  const variation = voice?.variation ?? 50;

  return (
    <ResultShell eyebrow="AI 음색 분석 결과" title={type.name} description={type.desc} pillarColor={pillarColor} onRestart={onRestart} restartLabel="다시 녹음하기">
      <InfoGrid
        columns={3}
        items={[
          { label: '평균 음높이', value: `${pitch}Hz` },
          { label: '주 음역대', value: type.range },
          { label: '보컬 스타일', value: variation > 55 ? '감정 표현형' : '안정 전달형' },
        ]}
      />

      <ScoreBars
        color={pillarColor}
        items={[
          { label: '성량 · 전달력', value: Math.max(35, volume) },
          { label: '억양 · 표현력', value: Math.max(30, variation) },
          { label: '음색 안정감', value: Math.max(40, 100 - Math.round(variation / 2)) },
        ]}
      />

      <Panel title={goal === 'sing' ? '추천 장르 & 레퍼런스' : '이런 곳에서 빛나요'}>
        <TraitChips items={type.genres} />
        <p className="mt-3 text-center text-xs text-slate-400">{type.singers}</p>
      </Panel>

      <Panel title="보이스 필터 미리듣기">
        {voice?.audioUrl ? (
          <VoiceFilterPlayer audioUrl={voice.audioUrl} color={pillarColor} />
        ) : (
          <p className="text-center text-xs text-slate-500">샘플 모드에서는 필터 미리듣기가 제공되지 않아요. 마이크로 녹음하면 내 목소리에 필터를 입혀볼 수 있어요.</p>
        )}
      </Panel>
    </ResultShell>
  );
}

/* ── Export ─────────────────────────────────────────────── */

function computeResult(answers: DemoAnswers): string {
  return classify(getVoice(answers, 'voice')?.pitchHz ?? 160);
}

export default defineDemo({
  config: {
    id: 'voice-lab',
    targetSlug: 'ai-voice-lab',
    industryId: 'entertainment',
    analyzeEmoji: '🎤',
    analyzeDurationMs: 3000,
    analyzeMessages: ['주파수 스펙트럼 분해 중', '음색 지문 생성 중', '어울리는 장르 찾는 중'],
  },
  steps: [
    choiceStep({
      id: 'goal',
      title: '목소리로 무엇을 알고 싶나요?',
      columns: 2,
      options: [
        { id: 'sing', emoji: '🎵', label: '노래 스타일', desc: '어울리는 장르와 보컬 타입' },
        { id: 'speak', emoji: '🗣️', label: '말하는 목소리', desc: '발표·내레이션 음색 진단' },
      ],
    }),
    micStep({
      id: 'voice',
      title: '문장을 소리 내어 읽어주세요',
      subtitle: '평소 말하는 톤으로, 5초 동안 녹음해요',
      script: '안녕하세요! 오늘 제 목소리를 AI가 분석해 준대요.',
      durationSec: 5,
      scanLabels: ['기본 주파수 추출', '배음 구조 분석', '발성 안정도 측정'],
    }),
  ],
  computeResult,
  Result,
  print: (answers, resultKey) => {
    const voice = getVoice(answers, 'voice');
    const type = VOICE_TYPES[resultKey as VoiceType] ?? VOICE_TYPES.baritone;
    const variation = voice?.variation ?? 50;
    return {
      kind: 'receipt',
      eyebrow: 'AI 음색 분석 결과',
      title: type.name,
      sections: [
        { type: 'waveform', title: '녹음 파형', values: voice?.waveform ?? [] },
        {
          type: 'rows',
          title: '측정값',
          rows: [
            { label: '평균 음높이', value: `${voice?.pitchHz ?? 160}Hz` },
            { label: '주 음역대', value: type.range },
            { label: '보컬 스타일', value: variation > 55 ? '감정 표현형' : '안정 전달형' },
          ],
        },
        {
          type: 'bars',
          title: '보이스 지표',
          bars: [
            { label: '성량', value: Math.max(35, voice?.volume ?? 60) },
            { label: '표현력', value: Math.max(30, variation) },
            { label: '안정감', value: Math.max(40, 100 - Math.round(variation / 2)) },
          ],
        },
        { type: 'list', title: '추천 장르', items: type.genres },
      ],
      footer: type.singers,
    };
  },
});
