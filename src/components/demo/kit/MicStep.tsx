'use client';

/* ─────────────────────────────────────────────────────────
   NEANDERco.  |  Demo Kit — microphone capture step
   마이크 권한 요청 → 실시간 파형 → 녹음 → 음높이·성량·억양 측정.
   녹음은 브라우저 메모리(object URL)에만 두고 전송하지 않는다.
   ───────────────────────────────────────────────────────── */

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import type { DemoStepProps } from '@/types/demo';
import { clamp, getVoice, hashString, seededRandom, type VoiceData } from './core';

export interface MicStepOptions {
  id: string;
  /** 읽어달라고 보여줄 문장 */
  script: string;
  /** 녹음 길이 (초) */
  durationSec?: number;
  /** 녹음 후 분석 연출 문구 */
  scanLabels?: string[];
}

type Phase = 'idle' | 'starting' | 'ready' | 'recording' | 'analyzing' | 'done' | 'error';

const BAR_COUNT = 48;
const DEFAULT_SCAN_LABELS = ['음역대 측정', '음색 스펙트럼 분석', '발성 패턴 추출'];

/** 자기상관으로 기본 주파수를 추정한다 (사람 목소리 70–500Hz 범위) */
function detectPitch(buffer: Float32Array, sampleRate: number): number | null {
  let rms = 0;
  for (let i = 0; i < buffer.length; i++) rms += buffer[i]! * buffer[i]!;
  rms = Math.sqrt(rms / buffer.length);
  if (rms < 0.015) return null;

  const minLag = Math.floor(sampleRate / 500);
  const maxLag = Math.min(buffer.length - 1, Math.floor(sampleRate / 70));
  let bestLag = -1;
  let best = 0;
  for (let lag = minLag; lag <= maxLag; lag++) {
    let sum = 0;
    for (let i = 0; i < buffer.length - lag; i++) sum += buffer[i]! * buffer[i + lag]!;
    if (sum > best) {
      best = sum;
      bestLag = lag;
    }
  }
  return bestLag > 0 ? sampleRate / bestLag : null;
}

function micErrorMessage(error: unknown): string {
  const name = error instanceof DOMException ? error.name : '';
  if (name === 'NotAllowedError' || name === 'SecurityError') {
    return '마이크 권한이 거부되었어요. 주소창의 권한 설정에서 허용하거나, 샘플 음성으로 체험해 보세요.';
  }
  if (name === 'NotFoundError') return '사용할 수 있는 마이크를 찾지 못했어요. 샘플 음성으로 체험해 보세요.';
  return '마이크를 시작하지 못했어요. 샘플 음성으로 체험해 보세요.';
}

function MicCapture({ opts, answers, onUpdate }: { opts: MicStepOptions } & DemoStepProps) {
  const duration = opts.durationSec ?? 5;
  const scanLabels = opts.scanLabels ?? DEFAULT_SCAN_LABELS;
  const existing = getVoice(answers, opts.id);

  const [phase, setPhase] = useState<Phase>(existing ? 'done' : 'idle');
  const [voice, setVoice] = useState<VoiceData | null>(existing ?? null);
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(duration);
  const [scanIndex, setScanIndex] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const rafRef = useRef<number>(0);
  const timersRef = useRef<number[]>([]);
  const recordingRef = useRef(false);
  const samplesRef = useRef<{ pitches: number[]; levels: number[] }>({ pitches: [], levels: [] });
  const mountedRef = useRef(true);
  // 진행 중인 마이크 권한 요청 번호. 샘플·취소로 요청을 버리면 값이 바뀌어,
  // 뒤늦게 허용돼도 그 스트림은 쓰지 않고 닫는다.
  const requestRef = useRef(0);

  const cleanup = useCallback(() => {
    requestRef.current++;
    cancelAnimationFrame(rafRef.current);
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
    analyserRef.current = null;
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, [cleanup]);

  /** 실시간 파형 그리기 + 녹음 중이면 음높이/성량 샘플 수집 */
  const draw = useCallback(() => {
    const analyser = analyserRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!analyser || !canvas || !ctx) return;

    const buffer = new Float32Array(analyser.fftSize);
    let frame = 0;
    const render = () => {
      analyser.getFloatTimeDomainData(buffer);
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = recordingRef.current ? '#f87171' : '#2dd4bf';
      ctx.beginPath();
      const step = buffer.length / width;
      for (let x = 0; x < width; x++) {
        const v = buffer[Math.floor(x * step)]!;
        const y = height / 2 + v * height * 1.6;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      if (recordingRef.current) {
        let rms = 0;
        for (let i = 0; i < buffer.length; i++) rms += buffer[i]! * buffer[i]!;
        samplesRef.current.levels.push(Math.sqrt(rms / buffer.length));
        if (frame % 4 === 0 && audioCtxRef.current) {
          const pitch = detectPitch(buffer.subarray(0, 1024), audioCtxRef.current.sampleRate);
          if (pitch) samplesRef.current.pitches.push(pitch);
        }
      }
      frame++;
      rafRef.current = requestAnimationFrame(render);
    };
    render();
  }, []);

  const startMic = useCallback(async () => {
    setError(null);
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setError('이 브라우저(또는 비보안 연결)에서는 마이크를 쓸 수 없어요. 샘플 음성으로 체험해 보세요.');
      setPhase('error');
      return;
    }
    const request = ++requestRef.current;
    setPhase('starting');
    // 오디오 엔진은 클릭 직후(권한 대기 전)에 만들어야 Safari가 '정지' 상태로 두지 않는다
    audioCtxRef.current?.close().catch(() => {});
    const audioCtx = new AudioContext();
    audioCtxRef.current = audioCtx;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      if (!mountedRef.current || request !== requestRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        audioCtx.close().catch(() => {});
        return;
      }
      streamRef.current = stream;
      if (audioCtx.state === 'suspended') await audioCtx.resume().catch(() => {});
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      audioCtx.createMediaStreamSource(stream).connect(analyser);
      analyserRef.current = analyser;
      setPhase('ready');
    } catch (err) {
      audioCtx.close().catch(() => {});
      if (audioCtxRef.current === audioCtx) audioCtxRef.current = null;
      if (!mountedRef.current || request !== requestRef.current) return;
      setError(micErrorMessage(err));
      setPhase('error');
    }
  }, []);

  // 캔버스가 화면에 붙은 뒤 파형 루프 시작
  useEffect(() => {
    if (phase === 'ready' || phase === 'recording') {
      cancelAnimationFrame(rafRef.current);
      draw();
    }
  }, [phase, draw]);

  const finish = useCallback(
    (data: VoiceData) => {
      setVoice(data);
      setScanIndex(0);
      setPhase('analyzing');
      const tick = 1800 / (scanLabels.length + 1);
      scanLabels.forEach((_, i) => {
        timersRef.current.push(window.setTimeout(() => setScanIndex(i + 1), tick * (i + 1)));
      });
      timersRef.current.push(
        window.setTimeout(() => {
          setPhase('done');
          onUpdate(opts.id, data);
        }, 1800)
      );
    },
    [onUpdate, opts.id, scanLabels]
  );

  const summarize = useCallback(
    (audioUrl: string | null): VoiceData => {
      const { pitches, levels } = samplesRef.current;
      const sorted = [...pitches].sort((a, b) => a - b);
      // 이상치를 피하려고 중앙값을 쓴다
      const median = sorted.length ? sorted[Math.floor(sorted.length / 2)]! : 180;
      const p10 = sorted.length ? sorted[Math.floor(sorted.length * 0.1)]! : median * 0.85;
      const p90 = sorted.length ? sorted[Math.floor(sorted.length * 0.9)]! : median * 1.15;
      const meanLevel = levels.length ? levels.reduce((s, v) => s + v, 0) / levels.length : 0.05;
      const peak = Math.max(0.0001, ...levels);
      const waveform = Array.from({ length: BAR_COUNT }, (_, i) => {
        const start = Math.floor((i / BAR_COUNT) * levels.length);
        const end = Math.max(start + 1, Math.floor(((i + 1) / BAR_COUNT) * levels.length));
        const slice = levels.slice(start, end);
        const avg = slice.length ? slice.reduce((s, v) => s + v, 0) / slice.length : 0;
        return Math.min(1, avg / peak);
      });
      return {
        audioUrl,
        pitchHz: Math.round(median),
        volume: Math.round(clamp(meanLevel * 700)),
        variation: Math.round(clamp(((p90 - p10) / median) * 160)),
        waveform,
        seed: hashString(`${Math.round(median)}|${levels.length}|${meanLevel.toFixed(4)}`),
        source: 'mic',
      };
    },
    []
  );

  const startRecording = useCallback(() => {
    const stream = streamRef.current;
    if (!stream) return;
    samplesRef.current = { pitches: [], levels: [] };
    chunksRef.current = [];
    recordingRef.current = true;
    setRemaining(duration);
    setPhase('recording');

    let recorder: MediaRecorder | null = null;
    if (typeof MediaRecorder !== 'undefined') {
      recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.start();
      recorderRef.current = recorder;
    }

    for (let s = 1; s <= duration; s++) {
      timersRef.current.push(window.setTimeout(() => setRemaining(duration - s), s * 1000));
    }
    timersRef.current.push(
      window.setTimeout(() => {
        recordingRef.current = false;
        const complete = (audioUrl: string | null) => {
          const data = summarize(audioUrl);
          cancelAnimationFrame(rafRef.current);
          streamRef.current?.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
          audioCtxRef.current?.close().catch(() => {});
          audioCtxRef.current = null;
          if (mountedRef.current) finish(data);
        };
        if (recorder && recorder.state === 'recording') {
          recorder.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: recorder!.mimeType || 'audio/webm' });
            complete(blob.size > 0 ? URL.createObjectURL(blob) : null);
          };
          recorder.stop();
        } else {
          complete(null);
        }
      }, duration * 1000)
    );
  }, [duration, finish, summarize]);

  const trySample = useCallback(() => {
    cleanup();
    const seed = hashString(`sample-${Date.now()}`);
    const pitch = 110 + Math.round(seededRandom(seed, 'pitch') * 150);
    finish({
      audioUrl: null,
      pitchHz: pitch,
      volume: 55 + Math.round(seededRandom(seed, 'vol') * 30),
      variation: 35 + Math.round(seededRandom(seed, 'var') * 45),
      waveform: Array.from({ length: BAR_COUNT }, (_, i) =>
        Math.max(0.08, Math.abs(Math.sin(i / 3.1)) * 0.7 + seededRandom(seed, i) * 0.3)
      ),
      seed,
      source: 'sample',
    });
  }, [cleanup, finish]);

  const retake = useCallback(() => {
    if (voice?.audioUrl) URL.revokeObjectURL(voice.audioUrl);
    onUpdate(opts.id, undefined);
    setVoice(null);
    startMic();
  }, [onUpdate, opts.id, startMic, voice?.audioUrl]);

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center lg:max-w-lg">
      <div className="relative w-full overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 p-6">
        {/* 읽을 문장 */}
        <div className="mb-5 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-center">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">Script</p>
          <p className="text-base font-medium leading-relaxed text-white">“{opts.script}”</p>
        </div>

        {/* 파형 영역 */}
        <div className="relative flex h-28 items-center justify-center">
          {(phase === 'ready' || phase === 'recording') && (
            <canvas ref={canvasRef} width={560} height={140} className="h-full w-full" aria-hidden="true" />
          )}
          {(phase === 'analyzing' || phase === 'done') && voice && (
            <div className="flex h-full w-full items-center justify-between gap-[3px]" aria-hidden="true">
              {voice.waveform.map((v, i) => (
                <motion.span
                  key={i}
                  className={cn('w-full rounded-full', phase === 'done' ? 'bg-teal-400' : 'bg-slate-600')}
                  initial={{ height: 4 }}
                  animate={{ height: `${Math.max(6, v * 100)}%` }}
                  transition={{ delay: i * 0.015, type: 'spring', stiffness: 120, damping: 14 }}
                />
              ))}
            </div>
          )}
          {(phase === 'idle' || phase === 'starting' || phase === 'error') && (
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500/15 text-teal-300">
                {phase === 'starting' ? (
                  <motion.div
                    className="h-6 w-6 rounded-full border-2 border-teal-300 border-t-transparent"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  />
                ) : (
                  <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="9" y="2" width="6" height="12" rx="3" />
                    <path d="M5 10a7 7 0 0 0 14 0M12 17v5M8 22h8" />
                  </svg>
                )}
              </div>
              <p className="text-xs leading-relaxed text-slate-400">
                {phase === 'starting'
                  ? "브라우저 팝업에서 '허용'을 눌러주세요"
                  : phase === 'error'
                    ? error
                    : '마이크를 켜고 위 문장을 읽어주세요'}
              </p>
            </div>
          )}
        </div>

        {phase === 'recording' && (
          <div className="mt-3 flex items-center justify-center gap-2 text-sm font-semibold text-red-400">
            <motion.span
              className="h-2 w-2 rounded-full bg-red-500"
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            녹음 중 · {remaining}초
          </div>
        )}

        {phase === 'analyzing' && (
          <ul className="mt-4 space-y-1.5">
            {scanLabels.map((label, i) => (
              <li key={label} className="flex items-center justify-between text-xs">
                <span className={i < scanIndex ? 'text-slate-200' : i === scanIndex ? 'text-teal-300' : 'text-slate-600'}>
                  {label}
                </span>
                <span className={cn('font-mono', i < scanIndex ? 'text-teal-400' : 'text-slate-600')}>
                  {i < scanIndex ? 'OK' : i === scanIndex ? '...' : ''}
                </span>
              </li>
            ))}
          </ul>
        )}

        {phase === 'done' && voice && (
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { label: '평균 음높이', value: `${voice.pitchHz}Hz` },
              { label: '성량', value: `${voice.volume}` },
              { label: '억양 변화', value: `${voice.variation}` },
            ].map((r) => (
              <div key={r.label} className="rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-center">
                <p className="text-[10px] text-slate-500">{r.label}</p>
                <p className="text-sm font-semibold text-teal-300">{r.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="mt-6 flex flex-col items-center gap-3">
        {(phase === 'idle' || phase === 'error' || phase === 'starting') && (
          <>
            {phase === 'starting' ? (
              // 응답 없는 권한 요청에서 빠져나올 수 있게 (인앱 브라우저는 팝업을 띄우지 않기도 한다)
              <button
                type="button"
                onClick={() => {
                  cleanup();
                  setPhase('idle');
                }}
                className="rounded-xl border border-slate-600 px-6 py-3 text-sm font-semibold text-slate-200 transition-colors hover:border-slate-400 hover:text-white"
              >
                취소
              </button>
            ) : (
              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={startMic}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-500/20"
              >
                {phase === 'error' ? '다시 시도' : '마이크 켜기'}
              </motion.button>
            )}
            <button
              type="button"
              onClick={trySample}
              className="text-xs text-slate-400 underline-offset-4 transition-colors hover:text-white hover:underline"
            >
              샘플 음성으로 체험
            </button>
          </>
        )}
        {phase === 'ready' && (
          <>
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={startRecording}
              className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-red-500/20"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-white" />
              녹음 시작 ({duration}초)
            </motion.button>
            <button
              type="button"
              onClick={trySample}
              className="text-xs text-slate-400 underline-offset-4 transition-colors hover:text-white hover:underline"
            >
              샘플 음성으로 체험
            </button>
          </>
        )}
        {phase === 'done' && (
          <button
            type="button"
            onClick={retake}
            className="text-xs text-slate-400 underline-offset-4 transition-colors hover:text-white hover:underline"
          >
            다시 녹음하기
          </button>
        )}
        <p className="text-[11px] text-slate-500">녹음은 이 브라우저 안에서만 쓰이고 저장·전송되지 않아요</p>
      </div>
    </div>
  );
}

/** 마이크 녹음 스텝 컴포넌트를 만든다 */
export function createMicStep(opts: MicStepOptions) {
  function MicStepComponent(props: DemoStepProps) {
    return <MicCapture opts={opts} {...props} />;
  }
  MicStepComponent.displayName = `MicStep(${opts.id})`;
  return MicStepComponent;
}
