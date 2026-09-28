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
  audioUrlToBase64,
  choiceStep,
  defineDemo,
  getChoice,
  getVoice,
  micStep,
  requestDemoAi,
} from '../kit';
import { VOICE_TYPE_IDS, audioFormatOf } from '@/data/demo-ai/voice';
import type { AiVoice, VoiceType } from '@/data/demo-ai/voice';
import { isNotObserved } from '@/data/demo-ai/photo-reading';

/* ── Data ──────────────────────────────────────────────── */

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
    desc: '맑고 가볍게 뻗는 목소리예요. 편안한 높이에서 밝은 팝의 짧은 구절을 시도해 볼 수 있어요.',
    genres: ['K-POP 보컬', '밴드 록', '뮤지컬'],
    singers: '편안한 높이에서 짧은 팝 구절을 읽는 스타일',
  },
  alto: {
    name: '편안한 미드 톤 보이스',
    range: '180–250Hz',
    desc: '적당한 두께감과 호소력을 가진 목소리예요. 감성적인 곡에서 존재감이 커요.',
    genres: ['인디 팝', '소울', 'OST'],
    singers: '짙은 감성으로 드라마 OST를 부르는 보컬 스타일',
  },
  soprano: {
    name: '반짝이는 하이 톤 보이스',
    range: '240Hz 이상',
    desc: '이번 녹음에서 비교적 높은 음높이가 관찰된 타입이에요. 에너지가 필요한 곡과 광고 보이스에 잘 맞아요.',
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

/* ── AI 결과 ──────────────────────────────────────────── */

function isAiVoice(v: unknown): v is AiVoice {
  const o = v as AiVoice | null;
  return (
    !!o && o.observed === true && (VOICE_TYPE_IDS as readonly string[]).includes(o.type) && typeof o.title === 'string'
    && typeof o.desc === 'string' && typeof o.style === 'string' && !!o.scores && typeof o.scores.delivery === 'number'
    && typeof o.scores.expression === 'number' && typeof o.scores.stability === 'number' && Array.isArray(o.genres)
  );
}

/** 화면·출력물이 그리는 음색 리포트 — AI 결과가 있으면 그것, 없으면(실패·목소리 미인식) 측정 음높이 기반 고정 결과 */
function voiceView(answers: DemoAnswers, resultKey: string, generated: unknown) {
  const voice = getVoice(answers, 'voice');
  const pitch = voice?.pitchHz ?? 160;
  const volume = voice?.volume ?? 60;
  const variation = voice?.variation ?? 50;
  const ai = isAiVoice(generated) ? generated : null;
  const type = VOICE_TYPES[ai?.type ?? (resultKey as VoiceType)] ?? VOICE_TYPES.baritone;
  return {
    voice,
    pitch,
    range: type.range,
    title: ai?.title ?? type.name,
    desc: ai?.desc ?? type.desc,
    style: ai?.style ?? (variation > 55 ? '억양 변화형' : '차분한 억양형'),
    scores: ai
      ? ai.scores
      : { delivery: Math.max(35, volume), expression: Math.max(30, variation), stability: Math.max(40, 100 - Math.round(variation / 2)) },
    genres: ai?.genres ?? type.genres,
    reference: ai?.reference ?? type.singers,
    heardNote: ai?.heardNote ?? null,
    transcript: ai?.listened ? ai.transcript : '',
    ai: ai ? (ai.listened ? 'listened' : 'stats') : null,
    retake: isNotObserved(generated) && voice?.source === 'mic',
  };
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

function Result({ resultKey, answers, onRestart, pillarColor, generated }: DemoResultProps) {
  const v = voiceView(answers, resultKey, generated);
  const { voice } = v;
  const goal = getChoice(answers, 'goal');

  return (
    <ResultShell eyebrow="AI 음색 분석 결과" title={v.title} description={v.desc} pillarColor={pillarColor} onRestart={onRestart} restartLabel="다시 녹음하기">
      <InfoGrid
        columns={3}
        items={[
          { label: '평균 음높이', value: `${v.pitch}Hz` },
          { label: '참고 음높이 구간', value: v.range },
          { label: '보컬 스타일', value: v.style },
        ]}
      />

      {v.heardNote && (
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-left">
          <p className="text-xs text-slate-400">{v.ai === 'listened' ? 'AI가 들은 내 목소리' : 'AI가 읽은 측정값'}</p>
          <p className="mt-1 text-sm leading-relaxed text-slate-200 [word-break:keep-all]">{v.heardNote}</p>
          {v.transcript && <p className="mt-2 text-[11px] text-slate-500 [word-break:keep-all]">🎧 &ldquo;{v.transcript}&rdquo;</p>}
        </div>
      )}

      <p className="max-w-md text-xs leading-relaxed text-slate-400">음높이는 이번 녹음의 추정값이고 음역 전체를 뜻하지 않아요. 마이크·거리·주변 소음에 따라 달라지며, 아래 지표는 연습을 위한 참고예요.</p>
      <ScoreBars
        color={pillarColor}
        items={[
          { label: '녹음 크기 · 참고값', value: v.scores.delivery },
          { label: '음높이 변화 · 참고값', value: v.scores.expression },
          { label: '연출 안정감 · 참고값', value: v.scores.stability },
        ]}
      />

      <Panel title={goal === 'sing' ? '추천 장르 & 레퍼런스' : '이런 곳에서 빛나요'}>
        <TraitChips items={v.genres} />
        <p className="mt-3 text-center text-xs text-slate-400">{v.reference}</p>
      </Panel>

      <Panel title="보이스 필터 미리듣기">
        {voice?.audioUrl ? (
          <VoiceFilterPlayer audioUrl={voice.audioUrl} color={pillarColor} />
        ) : (
          <p className="text-center text-xs text-slate-500">샘플 모드에서는 필터 미리듣기가 제공되지 않아요. 마이크로 녹음하면 내 목소리에 필터를 입혀볼 수 있어요.</p>
        )}
      </Panel>

      {v.ai && (
        <p className="text-xs text-slate-500">
          {v.ai === 'listened' ? 'AI가 방금 녹음한 목소리를 직접 듣고 쓴 분석이에요' : 'AI가 측정한 음높이·성량·억양으로 쓴 분석이에요'}
        </p>
      )}
      {v.retake && (
        <p className="max-w-md text-xs text-slate-500 [word-break:keep-all]">
          목소리가 잘 들리지 않아 측정값 기반 결과를 보여드렸어요. 마이크 가까이에서 또렷하게 다시 녹음해 보세요.
        </p>
      )}
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
    analyzeMessages: ['이번 테이크의 녹음값 살펴보는 중', '선택한 연습 목표 확인 중', '다음 테이크에 쓸 표현 팁 준비 중'],
  },
  steps: [
    choiceStep({
      id: 'goal',
      title: '목소리로 무엇을 알고 싶나요?',
      columns: 2,
      options: [
        { id: 'sing', emoji: '🎵', label: '노래 스타일', desc: '어울리는 장르와 보컬 타입' },
        { id: 'speak', emoji: '🗣️', label: '말하는 목소리', desc: '발표·내레이션 연습 팁' },
      ],
    }),
    micStep({
      id: 'voice',
      title: '문장을 소리 내어 읽어주세요',
      subtitle: '조용한 곳에서 편한 목소리로 10초 동안 읽어요 · 한 문장 뒤 짧게 쉬어 주세요',
      script: '안녕하세요. 오늘은 제 목소리로 이야기를 전해 보려고 해요. 잠깐 쉬었다가, 가장 전하고 싶은 말을 또박또박 읽어볼게요.',
      durationSec: 10,
      scanLabels: ['녹음의 음높이 추정', '소리 크기의 변화 확인', '다음 테이크 연습 노트 준비'],
    }),
  ],
  computeResult,
  Result,
  generate: async (answers) => {
    const voice = getVoice(answers, 'voice');
    if (!voice) return null;
    // 녹음(webm 등)을 그대로 보내 AI가 직접 듣게 한다. 샘플 모드·변환 실패·너무 큰 파일이면 측정값만 보낸다
    const recorded = voice.audioUrl ? await audioUrlToBase64(voice.audioUrl) : null;
    const format = recorded ? audioFormatOf(recorded.mime) : null;
    const audio = recorded && format && recorded.data.length <= 1_500_000 ? { data: recorded.data, format } : null;
    return requestDemoAi<unknown>(
      'voice-lab',
      {
        experienceProfile: answers.experienceProfile,
        goal: getChoice(answers, 'goal') === 'sing' ? 'sing' : 'speak',
        pitchHz: voice.pitchHz,
        volume: voice.volume,
        variation: voice.variation,
        audio,
      },
      { validate: (d): d is unknown => isAiVoice(d) || isNotObserved(d) }
    );
  },
  print: (answers, resultKey, generated) => {
    const v = voiceView(answers, resultKey, generated);
    return {
      kind: 'receipt',
      eyebrow: 'AI 음색 분석 결과',
      title: v.title,
      sections: [
        { type: 'waveform', title: '녹음 파형', values: v.voice?.waveform ?? [] },
        {
          type: 'rows',
          title: '측정값',
          rows: [
            { label: '평균 음높이', value: `${v.pitch}Hz` },
            { label: '참고 음높이 구간', value: v.range },
            { label: '보컬 스타일', value: v.style },
          ],
        },
        ...(v.heardNote ? [{ type: 'text' as const, title: 'AI 코멘트', text: v.heardNote }] : []),
        {
          type: 'bars',
          title: '이번 녹음의 참고 지표',
          bars: [
            { label: '녹음 크기', value: v.scores.delivery },
            { label: '음높이 변화', value: v.scores.expression },
            { label: '연출 안정감', value: v.scores.stability },
          ],
        },
        { type: 'list', title: getChoice(answers, 'goal') === 'sing' ? '추천 장르' : '빛나는 자리', items: v.genres },
      ],
      footer: `${v.reference} · 짧은 녹음의 참고값이며 전체 음역·실력·건강 진단이 아니에요.`,
    };
  },
});
