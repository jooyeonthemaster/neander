'use client';

/* ─────────────────────────────────────────────────────────
   NEANDERco.  |  Demo Kit — camera capture step
   웹캠 권한 요청 → 라이브 프리뷰 + 가이드 → 촬영 → "AI 스캔" 연출.
   촬영 이미지는 브라우저 메모리에서만 쓰고 전송하지 않는다.
   ───────────────────────────────────────────────────────── */

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import type { DemoAnswers, DemoStepProps } from '@/types/demo';
import { getCapture, type CaptureData } from './core';
import { captureFrom, createSampleCapture } from './photo';
import {
  FINGERS,
  PALM_CENTER,
  PALM_PATH,
  WRIST,
  fingerRect,
  handPose,
  isThumbLeft,
  nailRect,
  type HandSide,
  type HandWhich,
} from './hand';

/** face: 얼굴 타원 · hand: 손바닥 · handBack: 손등(네일) · portrait: 상반신 */
export type CameraMode = 'face' | 'hand' | 'handBack' | 'portrait';

export interface CameraStepOptions {
  id: string;
  /** 가이드 모양 — 얼굴(타원), 손바닥, 손등, 상반신 */
  mode?: CameraMode;
  /** 손 모드에서 처음 선택할 손 (이전 스텝 답으로 정할 때). 없으면 오른손 */
  hand?: (answers: DemoAnswers) => HandWhich | undefined;
  /** 촬영 대상 (안내 문구용, 예: '얼굴', '손바닥') */
  subject?: string;
  /** 스캔 연출 중 순서대로 체크되는 문구 */
  scanLabels?: string[];
  /** 스캔 완료 후 보여줄 측정값 */
  readouts?: (capture: CaptureData) => { label: string; value: string }[];
  /** 포토부스처럼 3-2-1 카운트다운 후 촬영 */
  countdown?: boolean;
}

type Phase = 'idle' | 'starting' | 'live' | 'countdown' | 'scanning' | 'done' | 'error';

const SCAN_MS = 2800;

const DEFAULT_SCAN_LABELS: Record<CameraMode, string[]> = {
  face: ['얼굴 영역 감지', '랜드마크 68개 추출', '피부·조명 보정', '특징 벡터 생성'],
  hand: ['손 영역 감지', '손가락 관절 추적', '주요 선 윤곽 추출', '패턴 벡터 생성'],
  handBack: ['손 영역 감지', '손가락 끝마디 5개 추적', '손톱 윤곽 추출', '패턴 벡터 생성'],
  portrait: ['인물 영역 분리', '자세·비율 측정', '조명·색감 보정', '스타일 특징 추출'],
};

/* 좌표는 3:4 프레임 기준 % — photo.ts의 FACE_POINTS와 같은 좌표계 */
type Mesh = { points: [number, number][]; lines: [number, number][] };

const MESH: Record<'face' | 'portrait', Mesh> = {
  face: {
    points: [
      [50, 22], [38, 36], [62, 36], [39, 41], [61, 41], [50, 52], [32, 53], [68, 53],
      [43, 62], [50, 63], [57, 62], [50, 73], [24, 44], [27, 57], [36, 68], [76, 44], [73, 57], [64, 68],
    ],
    lines: [
      [0, 1], [0, 2], [1, 3], [2, 4], [3, 5], [4, 5], [5, 8], [5, 10], [8, 9], [9, 10], [8, 11], [10, 11],
      [12, 13], [13, 14], [14, 11], [15, 16], [16, 17], [17, 11], [1, 12], [2, 15], [3, 6], [4, 7], [6, 8], [7, 10],
    ],
  },
  portrait: {
    points: [
      [50, 16], [44, 31], [56, 31], [50, 37], [50, 44], [50, 51], [50, 59], [22, 69], [78, 69], [50, 82], [12, 94], [88, 94],
    ],
    lines: [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [6, 8], [7, 9], [8, 9], [7, 10], [8, 11]],
  },
};

/** 손 메시 — 손목·손바닥 중심·손가락 뿌리·손끝 (가이드와 같은 손 모양) */
function handMesh(thumbLeft: boolean): Mesh {
  const pose = handPose(thumbLeft);
  const points: [number, number][] = [
    [WRIST.x, WRIST.y],
    [PALM_CENTER.x, PALM_CENTER.y],
    ...pose.map((f) => [f.base.x, f.base.y] as [number, number]),
    ...pose.map((f) => [f.tip.x, f.tip.y] as [number, number]),
  ];
  const lines: [number, number][] = [[0, 1], [2, 3], [3, 4], [4, 5], [5, 6]];
  pose.forEach((_, i) => lines.push([1, 2 + i], [2 + i, 7 + i]));
  return { points, lines };
}

const isHandMode = (mode: CameraMode) => mode === 'hand' || mode === 'handBack';

const MODE_HINT: Record<CameraMode, string> = {
  face: '얼굴을 가이드 안에 맞춰주세요',
  hand: '손바닥이 보이게 손가락을 쫙 펴서 맞춰주세요',
  handBack: '손등이 보이게 손가락을 쫙 펴서 맞춰주세요',
  portrait: '상반신이 가이드 안에 들어오게 서주세요',
};

/** 받침 유무에 맞춰 목적격 조사(을/를)를 붙인다 */
function withObjectParticle(word: string): string {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  if (code < 0 || code > 11171) return `${word}을(를)`;
  return `${word}${code % 28 === 0 ? '를' : '을'}`;
}

function cameraErrorMessage(error: unknown): string {
  const name = error instanceof DOMException ? error.name : '';
  if (name === 'NotAllowedError' || name === 'SecurityError') {
    return '카메라 권한이 거부되었어요. 주소창의 카메라 아이콘에서 권한을 허용하거나, 아래 방법으로 체험해 보세요.';
  }
  if (name === 'NotFoundError' || name === 'OverconstrainedError') {
    return '사용할 수 있는 카메라를 찾지 못했어요. 사진을 올리거나 샘플로 체험해 보세요.';
  }
  if (name === 'NotReadableError') {
    return '다른 앱이 카메라를 사용 중이에요. 해당 앱을 닫고 다시 시도해 주세요.';
  }
  return '카메라를 시작하지 못했어요. 사진을 올리거나 샘플로 체험해 보세요.';
}

/* ── Overlays ─────────────────────────────────────────── */

/** 손 가이드 — 손 윤곽(엄지 방향 포함)과, 손등 모드면 손톱 자리를 표시한다 */
function HandGuide({ side, thumbLeft }: { side: HandSide; thumbLeft: boolean }) {
  const maskId = `hand-hole-${useId().replace(/:/g, '')}`;
  const flip = thumbLeft ? undefined : 'translate(300 0) scale(-1 1)';
  const thumbTip = handPose(thumbLeft)[0]!.tip;
  const shapes = (props: React.SVGProps<SVGPathElement> & React.SVGProps<SVGRectElement>) => (
    <>
      <path d={PALM_PATH} {...props} />
      {FINGERS.map((f) => (
        <rect key={f.name} {...fingerRect(f)} {...props} />
      ))}
    </>
  );

  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 300 400" aria-hidden="true">
      <defs>
        <mask id={maskId}>
          <rect width="300" height="400" fill="white" />
          <g transform={flip}>{shapes({ fill: 'black' })}</g>
        </mask>
      </defs>
      {/* 손 바깥은 어둡게 */}
      <rect width="300" height="400" fill="rgba(2,6,23,0.55)" mask={`url(#${maskId})`} />
      {/* 손 윤곽 — 도형마다 테두리를 그리고 손 안쪽 절반은 가려 하나의 외곽선으로 보이게 한다 */}
      <g mask={`url(#${maskId})`}>
        <g transform={flip} fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="5">
          {shapes({})}
        </g>
      </g>
      {side === 'back' && (
        <g transform={flip}>
          {FINGERS.map((f) => (
            <rect
              key={f.name}
              {...nailRect(f)}
              fill="rgba(45,212,191,0.18)"
              stroke="#5eead4"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
          ))}
        </g>
      )}
      <g transform={`translate(${thumbTip.x * 3} ${thumbTip.y * 4 - 20})`}>
        <rect x="-17" y="-9" width="34" height="18" rx="9" fill="rgba(13,148,136,0.9)" />
        <text y="4" textAnchor="middle" fontSize="10" fontWeight="700" fill="white">
          엄지
        </text>
      </g>
    </svg>
  );
}

function GuideOverlay({ mode, thumbLeft = true }: { mode: CameraMode; thumbLeft?: boolean }) {
  if (isHandMode(mode)) {
    return (
      <>
        <HandGuide side={mode === 'handBack' ? 'back' : 'palm'} thumbLeft={thumbLeft} />
        <CornerBrackets />
      </>
    );
  }
  return (
    <>
      <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 300 400" aria-hidden="true">
        <defs>
          <mask id={`guide-hole-${mode}`}>
            <rect width="300" height="400" fill="white" />
            {mode === 'face' && <ellipse cx="150" cy="180" rx="88" ry="115" fill="black" />}
            {mode === 'portrait' && (
              <>
                <ellipse cx="150" cy="130" rx="60" ry="76" fill="black" />
                <path d="M28 400 C34 300 90 262 150 260 C210 262 266 300 272 400 Z" fill="black" />
              </>
            )}
          </mask>
        </defs>
        <rect width="300" height="400" fill="rgba(2,6,23,0.5)" mask={`url(#guide-hole-${mode})`} />
        <g fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeDasharray="6 6">
          {mode === 'face' && <ellipse cx="150" cy="180" rx="88" ry="115" />}
          {mode === 'portrait' && (
            <>
              <ellipse cx="150" cy="130" rx="60" ry="76" />
              <path d="M28 400 C34 300 90 262 150 260 C210 262 266 300 272 400" />
            </>
          )}
        </g>
      </svg>
      <CornerBrackets />
    </>
  );
}

function CornerBrackets() {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 300 400" aria-hidden="true">
      <g stroke="#2dd4bf" strokeWidth="3" fill="none" strokeLinecap="round">
        <path d="M14 44 V14 H44" />
        <path d="M256 14 H286 V44" />
        <path d="M14 356 V386 H44" />
        <path d="M256 386 H286 V356" />
      </g>
    </svg>
  );
}

function MeshOverlay({
  mode,
  thumbLeft,
  animate,
  faded,
}: {
  mode: CameraMode;
  thumbLeft: boolean;
  animate: boolean;
  faded?: boolean;
}) {
  const mesh = mode === 'face' || mode === 'portrait' ? MESH[mode] : handMesh(thumbLeft);
  return (
    <svg
      className={cn('pointer-events-none absolute inset-0 h-full w-full', faded && 'opacity-40')}
      viewBox="0 0 300 400"
      aria-hidden="true"
    >
      {mesh.lines.map(([a, b], i) => {
        const [x1, y1] = mesh.points[a]!;
        const [x2, y2] = mesh.points[b]!;
        return (
          <motion.line
            key={`l${i}`}
            x1={x1 * 3}
            y1={y1 * 4}
            x2={x2 * 3}
            y2={y2 * 4}
            stroke="#5eead4"
            strokeWidth="1"
            strokeOpacity="0.7"
            initial={animate ? { pathLength: 0, opacity: 0 } : { pathLength: 1, opacity: 1 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.5 + i * 0.04 }}
          />
        );
      })}
      {mesh.points.map(([x, y], i) => (
        <motion.circle
          key={`p${i}`}
          cx={x * 3}
          cy={y * 4}
          fill="#99f6e4"
          initial={{ r: animate ? 0 : 3 }}
          animate={{ r: 3 }}
          transition={{ duration: 0.25, delay: 0.2 + i * 0.06 }}
        />
      ))}
    </svg>
  );
}

/* ── Camera capture ───────────────────────────────────── */

function CameraCapture({ opts, answers, onUpdate }: { opts: CameraStepOptions } & DemoStepProps) {
  const mode = opts.mode ?? 'face';
  const subject =
    opts.subject ?? (mode === 'hand' ? '손바닥' : mode === 'handBack' ? '손등' : mode === 'portrait' ? '모습' : '얼굴');
  const scanLabels = opts.scanLabels ?? DEFAULT_SCAN_LABELS[mode];

  const existing = getCapture(answers, opts.id);
  const isHand = isHandMode(mode);
  const handSide: HandSide = mode === 'handBack' ? 'back' : 'palm';
  // 앞 스텝에서 이미 손을 고른 데모는 그 손으로 고정하고 토글을 숨긴다
  const presetHand = opts.hand?.(answers);
  const [whichHand, setWhichHand] = useState<HandWhich>(() => presetHand ?? existing?.hand?.which ?? 'right');
  const thumbLeft = isThumbLeft(handSide, whichHand);
  const [phase, setPhase] = useState<Phase>(existing ? 'done' : 'idle');
  const [capture, setCapture] = useState<CaptureData | null>(existing ?? null);
  const [error, setError] = useState<string | null>(null);
  // 오류가 카메라에서 났는지, 사진 업로드에서 났는지 (제목·다시 시도 버튼이 달라진다)
  const [errorSource, setErrorSource] = useState<'camera' | 'upload'>('camera');
  const [count, setCount] = useState(3);
  const [scanIndex, setScanIndex] = useState(existing ? scanLabels.length : 0);
  const [videoReady, setVideoReady] = useState(false);
  const [flash, setFlash] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const timersRef = useRef<number[]>([]);
  const mountedRef = useRef(true);
  // 진행 중인 카메라 권한 요청 번호. 업로드·샘플·취소로 요청을 버리면 값이 바뀌어,
  // 뒤늦게 허용돼도 그 스트림은 쓰지 않고 닫는다.
  const requestRef = useRef(0);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
  }, []);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setVideoReady(false);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      clearTimers();
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, [clearTimers]);

  const attachVideo = useCallback((el: HTMLVideoElement | null) => {
    videoRef.current = el;
    if (el && streamRef.current && el.srcObject !== streamRef.current) {
      el.srcObject = streamRef.current;
      el.play().catch(() => {});
    }
  }, []);

  const startCamera = useCallback(async () => {
    setError(null);
    setErrorSource('camera');
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setError('이 브라우저(또는 비보안 연결)에서는 카메라를 쓸 수 없어요. 사진을 올리거나 샘플로 체험해 보세요.');
      setPhase('error');
      return;
    }
    const request = ++requestRef.current;
    setPhase('starting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      });
      if (!mountedRef.current || request !== requestRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current = stream;
      setPhase('live');
    } catch (err) {
      if (!mountedRef.current || request !== requestRef.current) return;
      setError(cameraErrorMessage(err));
      setPhase('error');
    }
  }, []);

  /** 응답 없는 권한 요청을 버리고 처음 화면으로 (인앱 브라우저는 팝업을 띄우지 않기도 한다) */
  const cancelRequest = useCallback(() => {
    requestRef.current++;
    setPhase('idle');
  }, []);

  const beginScan = useCallback(
    (raw: CaptureData) => {
      // 손 촬영은 가이드 방향(어느 손·엄지 위치)을 함께 저장해 결과 오버레이가 손에 맞게 놓이게 한다
      const data: CaptureData = isHand ? { ...raw, hand: { which: whichHand, side: handSide, thumbLeft } } : raw;
      requestRef.current++;
      stopStream();
      clearTimers();
      setCapture(data);
      setScanIndex(0);
      setPhase('scanning');
      const tick = SCAN_MS / (scanLabels.length + 1);
      scanLabels.forEach((_, i) => {
        timersRef.current.push(window.setTimeout(() => setScanIndex(i + 1), tick * (i + 1)));
      });
      timersRef.current.push(
        window.setTimeout(() => {
          setPhase('done');
          onUpdate(opts.id, data);
        }, SCAN_MS)
      );
    },
    [clearTimers, handSide, isHand, onUpdate, opts.id, scanLabels, stopStream, thumbLeft, whichHand]
  );

  const snap = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    setFlash(true);
    timersRef.current.push(window.setTimeout(() => setFlash(false), 350));
    beginScan(captureFrom(video, video.videoWidth, video.videoHeight, { mirror: true, origin: 'camera' }));
  }, [beginScan]);

  const shoot = useCallback(() => {
    if (!opts.countdown) {
      snap();
      return;
    }
    setPhase('countdown');
    setCount(3);
    [2, 1].forEach((n, i) => {
      timersRef.current.push(window.setTimeout(() => setCount(n), 800 * (i + 1)));
    });
    timersRef.current.push(window.setTimeout(snap, 2400));
  }, [opts.countdown, snap]);

  const handleFile = useCallback(
    (file: File | undefined) => {
      if (!file) return;
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const data = captureFrom(img, img.naturalWidth, img.naturalHeight, { mirror: false, origin: 'upload' });
        URL.revokeObjectURL(url);
        beginScan(data);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        requestRef.current++;
        setErrorSource('upload');
        setError('이미지를 불러오지 못했어요. 다른 사진을 선택해 주세요.');
        setPhase('error');
      };
      img.src = url;
    },
    [beginScan]
  );

  const trySample = useCallback(
    () => beginScan(createSampleCapture(mode, thumbLeft)),
    [beginScan, mode, thumbLeft]
  );

  const retake = useCallback(() => {
    clearTimers();
    onUpdate(opts.id, undefined);
    const wasCamera = capture?.source === 'camera';
    setCapture(null);
    if (wasCamera) startCamera();
    else setPhase('idle');
  }, [capture?.source, clearTimers, onUpdate, opts.id, startCamera]);

  const showVideo = phase === 'live' || phase === 'countdown';
  const showCapture = (phase === 'scanning' || phase === 'done') && capture;
  const readouts = phase === 'done' && capture && opts.readouts ? opts.readouts(capture) : [];

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-center sm:max-w-xl">
      {/* Frame — 모바일은 폭 기준, 태블릿 이상은 화면 높이에 맞춰 한 화면에 들어오게 키운다 */}
      <div className="relative aspect-[3/4] w-full max-w-[340px] overflow-hidden sm:w-[clamp(240px,calc((100dvh_-_600px)*0.75),500px)] sm:max-w-full rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl shadow-black/40">
        {showVideo && (
          <>
            <video
              ref={attachVideo}
              autoPlay
              playsInline
              muted
              onLoadedMetadata={() => setVideoReady(true)}
              className="absolute inset-0 h-full w-full -scale-x-100 object-cover"
            />
            <GuideOverlay mode={mode} thumbLeft={thumbLeft} />
            <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-bold tracking-widest text-white">
              <motion.span
                className="h-1.5 w-1.5 rounded-full bg-red-500"
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
              LIVE
            </div>
            <p className="absolute inset-x-0 bottom-4 text-center text-xs font-medium text-white drop-shadow">
              {MODE_HINT[mode]}
            </p>
            <AnimatePresence>
              {phase === 'countdown' && (
                <motion.span
                  key={count}
                  initial={{ scale: 1.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center font-display text-8xl font-extrabold text-white drop-shadow-lg"
                >
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </>
        )}

        {showCapture && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={capture.image} alt={`촬영한 ${subject}`} className="absolute inset-0 h-full w-full object-cover" />
            <MeshOverlay
              mode={mode}
              thumbLeft={capture.hand?.thumbLeft ?? thumbLeft}
              animate={phase === 'scanning'}
              faded={phase === 'done'}
            />
            {phase === 'scanning' && (
              <>
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage:
                      'linear-gradient(to right, rgba(45,212,191,0.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(45,212,191,0.35) 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                  }}
                  aria-hidden="true"
                />
                <motion.div
                  className="absolute inset-x-0 h-20 bg-gradient-to-b from-transparent via-teal-300/40 to-transparent"
                  initial={{ top: '-20%' }}
                  animate={{ top: ['-20%', '100%'] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
                  aria-hidden="true"
                />
              </>
            )}
            {phase === 'done' && (
              <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-teal-500/90 px-3 py-1 text-xs font-bold text-white">
                <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
                스캔 완료
              </div>
            )}
          </>
        )}

        {(phase === 'idle' || phase === 'starting' || phase === 'error') && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
            <GuideOverlay mode={mode} thumbLeft={thumbLeft} />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-500/15 text-teal-300">
              {phase === 'starting' ? (
                <motion.div
                  className="h-7 w-7 rounded-full border-2 border-teal-300 border-t-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                />
              ) : (
                <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z" />
                  <circle cx="12" cy="13" r="3.5" />
                </svg>
              )}
            </div>
            {/* 점선 가이드 위에서도 읽히도록 문구 뒤에 반투명 배경 */}
            <div className="relative max-w-xs space-y-1.5 rounded-xl bg-slate-950/70 px-4 py-3 backdrop-blur-sm">
              <p className="relative text-sm font-semibold text-white">
                {phase === 'starting'
                  ? '카메라 권한을 요청하고 있어요'
                  : phase === 'error'
                    ? errorSource === 'upload'
                      ? '사진을 불러올 수 없어요'
                      : '카메라를 사용할 수 없어요'
                    : `카메라로 ${withObjectParticle(subject)} 스캔해요`}
              </p>
              <p className="relative text-xs leading-relaxed text-slate-300">
                {phase === 'starting'
                  ? "브라우저 팝업에서 '허용'을 눌러주세요"
                  : phase === 'error'
                    ? error
                    : 'AI가 촬영 이미지를 분석해 결과를 만들어 드려요'}
              </p>
            </div>
          </div>
        )}

        {/* Shutter flash */}
        <AnimatePresence>
          {flash && (
            <motion.div
              className="absolute inset-0 bg-white"
              initial={{ opacity: 0.9 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="mt-6 flex w-full flex-col items-center gap-3">
        {isHand && !presetHand && phase !== 'scanning' && phase !== 'done' && (
          <div
            role="radiogroup"
            aria-label="촬영할 손"
            className="inline-flex rounded-full border border-slate-700 bg-slate-900/70 p-1 text-xs font-semibold"
          >
            {(['left', 'right'] as const).map((which) => (
              <button
                key={which}
                type="button"
                role="radio"
                aria-checked={whichHand === which}
                disabled={phase === 'countdown'}
                onClick={() => setWhichHand(which)}
                className={cn(
                  'rounded-full px-4 py-1.5 transition-colors disabled:opacity-50',
                  whichHand === which ? 'bg-teal-500 text-white' : 'text-slate-400 hover:text-white'
                )}
              >
                {which === 'left' ? '왼손' : '오른손'}
              </button>
            ))}
          </div>
        )}
        {(phase === 'idle' || phase === 'error' || phase === 'starting') && (
          <>
            {phase === 'starting' ? (
              <button
                type="button"
                onClick={cancelRequest}
                className="rounded-xl border border-slate-600 px-6 py-3 text-sm font-semibold text-slate-200 transition-colors hover:border-slate-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
              >
                취소
              </button>
            ) : (
              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={
                  phase === 'error' && errorSource === 'upload'
                    ? () => fileRef.current?.click()
                    : startCamera
                }
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m22 8-6 4 6 4V8Z" />
                  <rect x="2" y="6" width="14" height="12" rx="2" />
                </svg>
                {phase === 'error'
                  ? errorSource === 'upload'
                    ? '다른 사진 선택'
                    : '다시 시도'
                  : '카메라 켜기'}
              </motion.button>
            )}
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="underline-offset-4 transition-colors hover:text-white hover:underline"
              >
                사진 업로드
              </button>
              <span className="h-3 w-px bg-slate-700" aria-hidden="true" />
              <button
                type="button"
                onClick={trySample}
                className="underline-offset-4 transition-colors hover:text-white hover:underline"
              >
                샘플로 체험
              </button>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="user"
              className="hidden"
              onChange={(e) => {
                handleFile(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
          </>
        )}

        {showVideo && (
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => {
                clearTimers();
                stopStream();
                setPhase('idle');
              }}
              disabled={phase === 'countdown'}
              className="text-xs text-slate-400 transition-colors hover:text-white disabled:opacity-40"
            >
              취소
            </button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={shoot}
              disabled={!videoReady || phase === 'countdown'}
              aria-label={`${subject} 촬영하기`}
              className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white/80 bg-white/10 transition-opacity disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
            >
              <span className="h-11 w-11 rounded-full bg-white" />
            </motion.button>
            <span className="w-6" aria-hidden="true" />
          </div>
        )}

        {phase === 'scanning' && (
          <ul className="w-full max-w-[340px] space-y-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-left">
            {scanLabels.map((label, i) => {
              const done = i < scanIndex;
              const active = i === scanIndex;
              return (
                <li key={label} className="flex items-center justify-between text-xs">
                  <span className={cn(done ? 'text-slate-200' : active ? 'text-teal-300' : 'text-slate-600')}>
                    {label}
                  </span>
                  <span className={cn('font-mono', done ? 'text-teal-400' : 'text-slate-600')}>
                    {done ? 'OK' : active ? '...' : ''}
                  </span>
                </li>
              );
            })}
          </ul>
        )}

        {phase === 'done' && (
          <>
            {readouts.length > 0 && (
              <div className="grid w-full max-w-[340px] grid-cols-2 gap-2">
                {readouts.map((r) => (
                  <div key={r.label} className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-left">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">{r.label}</p>
                    <p className="text-sm font-semibold text-teal-300">{r.value}</p>
                  </div>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={retake}
              className="text-xs text-slate-400 underline-offset-4 transition-colors hover:text-white hover:underline"
            >
              다시 촬영하기
            </button>
          </>
        )}

        <p className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
          <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
          </svg>
          촬영 이미지는 이 브라우저 안에서만 쓰이고 저장·전송되지 않아요
        </p>
      </div>
    </div>
  );
}

/** 카메라 촬영 스텝 컴포넌트를 만든다 */
export function createCameraStep(opts: CameraStepOptions) {
  function CameraStepComponent(props: DemoStepProps) {
    return <CameraCapture opts={opts} {...props} />;
  }
  CameraStepComponent.displayName = `CameraStep(${opts.id})`;
  return CameraStepComponent;
}
