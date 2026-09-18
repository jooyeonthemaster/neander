'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import type { DemoAnswers, DemoResultProps } from '@/types/demo';
import {
  Panel,
  ResultShell,
  answersSeed,
  cameraStep,
  choiceStep,
  defineDemo,
  getCapture,
  getChoice,
  getFields,
  renderLook,
  seededInt,
  textStep,
  type PhotoLook,
} from '../kit';

/* ── Data ──────────────────────────────────────────────── */

type StyleId = 'mono' | 'pop' | 'corporate' | 'pastel';

interface BrandStyle {
  label: string;
  emoji: string;
  desc: string;
  swatch: string;
  look: PhotoLook;
  /** 명함·프로필 카드 배경 */
  card: string;
  /** 카드 위 글자색 */
  ink: string;
  /** 카드 위 보조 글자색 */
  sub: string;
  /** 포인트 컬러 (링·배지·버튼) */
  accent: string;
  /** 아바타 링 그라디언트 */
  ring: string;
}

const STYLES: Record<StyleId, BrandStyle> = {
  mono: {
    label: '미니멀 모노',
    emoji: '⚫',
    desc: '흑백 포스터라이즈의 절제된 무드',
    swatch: 'linear-gradient(135deg, #0a0a0a 0 50%, #e7e5e4 50% 100%)',
    look: { adjust: { saturation: 0, contrast: 1.35, brightness: 1.05 }, effect: { kind: 'posterize', levels: 4 }, grain: 8 },
    card: '#fafaf9',
    ink: '#0a0a0a',
    sub: '#57534e',
    accent: '#171717',
    ring: 'conic-gradient(#0a0a0a, #a8a29e, #0a0a0a)',
  },
  pop: {
    label: '비비드 팝',
    emoji: '💥',
    desc: '망점 팝아트 + 쨍한 브랜드 컬러',
    swatch: 'linear-gradient(135deg, #db2777, #fde047 60%, #22d3ee)',
    look: { adjust: { contrast: 1.2 }, effect: { kind: 'popart', dark: '#be185d', light: '#fde047', dot: 7 } },
    card: '#fde047',
    ink: '#831843',
    sub: '#be185d',
    accent: '#db2777',
    ring: 'conic-gradient(#db2777, #22d3ee, #fde047, #db2777)',
  },
  corporate: {
    label: '코퍼레이트 블루',
    emoji: '🔷',
    desc: '신뢰감을 주는 블루 듀오톤',
    swatch: 'linear-gradient(135deg, #0b1f4b, #2563eb 55%, #bfdbfe)',
    look: { adjust: { contrast: 1.12 }, effect: { kind: 'duotone', dark: '#0b1f4b', light: '#bfdbfe' } },
    card: '#0b1f4b',
    ink: '#ffffff',
    sub: '#93c5fd',
    accent: '#2563eb',
    ring: 'conic-gradient(#2563eb, #bfdbfe, #1e3a8a, #2563eb)',
  },
  pastel: {
    label: '파스텔 소프트',
    emoji: '🌸',
    desc: '부드럽고 친근한 파스텔 듀오톤',
    swatch: 'linear-gradient(135deg, #6d5a9c, #fbcfe8 60%, #ffe4ec)',
    look: { adjust: { brightness: 1.08, contrast: 0.95 }, effect: { kind: 'duotone', dark: '#6d5a9c', light: '#ffe4ec' } },
    card: '#fdf2f8',
    ink: '#4c1d95',
    sub: '#a78bfa',
    accent: '#a78bfa',
    ring: 'conic-gradient(#f9a8d4, #c4b5fd, #a5f3fc, #f9a8d4)',
  },
};

const STYLE_ORDER: StyleId[] = ['mono', 'pop', 'corporate', 'pastel'];

const TEAMMATES = [
  { name: '박서연', role: '팀장' },
  { name: '이준호', role: '디자이너' },
  { name: '최다은', role: '마케터' },
  { name: '정우진', role: '개발자' },
];

/* ── Helpers ───────────────────────────────────────────── */

function profileOf(answers: DemoAnswers) {
  const fields = getFields<string>(answers, 'profile');
  const name = (fields.name ?? '').trim() || '네안더';
  const title = (fields.title ?? '').trim() || '브랜드 매니저';
  const style = (getChoice(answers, 'brand') as StyleId | undefined) ?? 'corporate';
  const seed = answersSeed(answers);
  return { name, title, style: STYLES[style] ? style : 'corporate', seed, empNo: `NDR-${seededInt(seed, 'emp', 1000, 9999)}` };
}

/** 스타일별 인화지 — 명함 바탕색과 가장 가까운 종이 */
const PRINT_PAPER: Record<StyleId, 'white' | 'cream' | 'black'> = {
  mono: 'white',
  pop: 'cream',
  corporate: 'black',
  pastel: 'white',
};

/** 캡처 사진에 브랜드 룩을 입힌 결과 URL (스타일이 바뀌면 다시 렌더링) */
function useBrandedPhoto(src: string | undefined, styleId: StyleId) {
  const [state, setState] = useState<{ src: string; styleId: StyleId; url: string } | null>(null);

  useEffect(() => {
    if (!src) return;
    let alive = true;
    renderLook(src, STYLES[styleId].look)
      .catch(() => src)
      .then((url) => {
        if (alive) setState({ src, styleId, url });
      });
    return () => {
      alive = false;
    };
  }, [src, styleId]);

  // 스타일을 바꾸면 새 렌더링이 끝날 때까지 로딩 상태로 보인다
  return state && state.src === src && state.styleId === styleId ? state.url : null;
}

function Avatar({
  url,
  style,
  name,
  className,
  ringWidth = 3,
}: {
  url: string | null;
  style: BrandStyle;
  name: string;
  className?: string;
  ringWidth?: number;
}) {
  return (
    <div className={cn('relative shrink-0 rounded-full', className)} style={{ background: style.ring, padding: ringWidth }}>
      <div className="relative h-full w-full overflow-hidden rounded-full bg-slate-800">
        {url ? (
          <motion.img
            key={url}
            src={url}
            alt={`${name} 브랜드 아바타`}
            initial={{ opacity: 0, filter: 'blur(10px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.6 }}
            className="h-full w-full scale-[1.3] object-cover object-[50%_32%]"
            style={{ transformOrigin: '50% 38%' }}
          />
        ) : (
          <motion.div
            className="flex h-full w-full items-center justify-center text-[10px] text-slate-400"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          >
            AI
          </motion.div>
        )}
      </div>
    </div>
  );
}

/* ── Result ────────────────────────────────────────────── */

function Result({ answers, onRestart, pillarColor }: DemoResultProps) {
  const capture = getCapture(answers, 'face');
  const profile = profileOf(answers);
  const [styleId, setStyleId] = useState<StyleId>(profile.style);
  const style = STYLES[styleId];
  const url = useBrandedPhoto(capture?.image, styleId);
  const { empNo } = profile;

  return (
    <ResultShell
      eyebrow="AI 브랜드 아바타 완성"
      title={`${profile.name} 님의 ${style.label} 아바타`}
      description="브랜드 CI 컬러와 톤을 학습한 AI가 프로필 사진을 브랜드 스타일로 다시 그렸어요. 명함과 사내 메신저에 바로 적용해 보세요."
      pillarColor={pillarColor}
      onRestart={onRestart}
      restartLabel="다시 촬영하기"
    >
      {/* Hero avatar */}
      <div className="relative flex flex-col items-center">
        <motion.div
          className="absolute -inset-4 rounded-full opacity-50 blur-2xl"
          style={{ background: style.ring }}
          animate={{ rotate: 360 }}
          transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
          aria-hidden="true"
        />
        <Avatar url={url} style={style} name={profile.name} className="h-44 w-44" ringWidth={5} />
        <span
          className="absolute bottom-1 right-1 flex h-10 w-10 items-center justify-center rounded-full border-4 border-slate-950 font-display text-sm font-extrabold text-white"
          style={{ backgroundColor: style.accent }}
          aria-hidden="true"
        >
          N
        </span>
      </div>

      {/* Style switcher */}
      <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="브랜드 스타일 바꾸기">
        {STYLE_ORDER.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setStyleId(id)}
            aria-pressed={id === styleId}
            className={cn(
              'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
              id === styleId ? 'border-white/60 bg-white/10 text-white' : 'border-slate-700 text-slate-400 hover:border-slate-500'
            )}
          >
            <span className="h-3 w-3 rounded-full border border-white/20" style={{ background: STYLES[id].swatch }} />
            {STYLES[id].label}
          </button>
        ))}
      </div>

      {/* Business card */}
      <Panel title="프로필 명함">
        <motion.div
          key={styleId}
          initial={{ opacity: 0, rotateX: 25, y: 10 }}
          animate={{ opacity: 1, rotateX: 0, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative mx-auto flex aspect-[9/5] w-full max-w-sm overflow-hidden rounded-xl shadow-2xl shadow-black/50"
          style={{ backgroundColor: style.card, color: style.ink }}
        >
          <div className="absolute inset-y-0 left-0 w-2" style={{ backgroundColor: style.accent }} aria-hidden="true" />
          <div className="flex w-full items-center gap-4 p-5 pl-6">
            <Avatar url={url} style={style} name={profile.name} className="h-20 w-20 sm:h-24 sm:w-24" />
            <div className="min-w-0 flex-1 text-left">
              <p className="text-[9px] font-bold tracking-[0.35em]" style={{ color: style.sub }}>
                NEANDER
              </p>
              <p className="mt-1 truncate font-display text-xl font-extrabold">{profile.name}</p>
              <p className="truncate text-xs font-medium" style={{ color: style.sub }}>
                {profile.title}
              </p>
              <div className="mt-3 space-y-0.5 text-[10px] opacity-80">
                <p>사번 {empNo}</p>
                <p>Brand Launch TF</p>
              </div>
            </div>
          </div>
          <div className="absolute bottom-3 right-4 flex gap-1" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <span key={i} className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: style.accent, opacity: 1 - i * 0.3 }} />
            ))}
          </div>
        </motion.div>
      </Panel>

      {/* Messenger mock */}
      <Panel title="사내 메신저 적용 미리보기">
        <div className="overflow-hidden rounded-xl border border-slate-800">
          <div className="flex items-center gap-2 border-b border-slate-800 bg-slate-950/70 px-4 py-2.5">
            <span className="flex gap-1" aria-hidden="true">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
            </span>
            <span className="ml-2 text-xs font-semibold text-slate-200"># 브랜드-런칭-TF</span>
            <span className="ml-auto text-[10px] text-slate-500">NEANDER Talk</span>
          </div>

          {/* 내 프로필 팝오버 */}
          <div className="flex items-center gap-3 border-b border-slate-800 bg-slate-900/80 px-4 py-3">
            <div className="relative">
              <Avatar url={url} style={style} name={profile.name} className="h-12 w-12" ringWidth={2} />
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-slate-900 bg-emerald-400" />
            </div>
            <div className="min-w-0 text-left">
              <p className="truncate text-sm font-semibold text-white">
                {profile.name} <span className="text-xs font-normal text-slate-400">· {profile.title}</span>
              </p>
              <p className="text-[11px] text-emerald-400">● 온라인 · 브랜드 런칭 준비 중</p>
            </div>
          </div>

          <div className="space-y-3.5 bg-slate-900/40 px-4 py-4">
            <MessageRow avatar={<Initial name={TEAMMATES[0]!.name} color="#64748b" />} name={TEAMMATES[0]!.name} role={TEAMMATES[0]!.role} time="오전 10:02">
              오늘부터 사내 프로필 사진 브랜드 아바타로 통일해요!
            </MessageRow>
            <MessageRow
              avatar={<Avatar url={url} style={style} name={profile.name} className="h-8 w-8" ringWidth={1.5} />}
              name={profile.name}
              role={profile.title}
              time="오전 10:04"
              highlight={style.accent}
              delay={0.3}
            >
              저 방금 바꿨어요! 어때요? 😎
            </MessageRow>
            <MessageRow avatar={<Initial name={TEAMMATES[1]!.name} color="#0ea5e9" />} name={TEAMMATES[1]!.name} role={TEAMMATES[1]!.role} time="오전 10:05" delay={0.6}>
              와 완전 우리 브랜드 느낌이에요 👏 명함도 이걸로 뽑아요!
            </MessageRow>
            <div className="flex gap-1.5 pl-10">
              {['👍 5', '🔥 3', '💯 2'].map((r) => (
                <span key={r} className="rounded-full border border-slate-700 bg-slate-800/60 px-2 py-0.5 text-[10px] text-slate-300">
                  {r}
                </span>
              ))}
            </div>
          </div>
          <div className="border-t border-slate-800 bg-slate-950/60 px-4 py-2.5 text-left text-[11px] text-slate-600">메시지 보내기…</div>
        </div>
      </Panel>

      {/* Team avatars */}
      <Panel title="팀 단체 아바타 미리보기">
        <div className="flex items-end justify-center gap-2 sm:gap-3">
          {TEAMMATES.slice(0, 2).map((t) => (
            <TeamSilhouette key={t.name} style={style} label={t.name} />
          ))}
          <div className="flex flex-col items-center gap-1.5">
            <Avatar url={url} style={style} name={profile.name} className="h-16 w-16" />
            <span className="text-[10px] font-semibold text-white">{profile.name}</span>
          </div>
          {TEAMMATES.slice(2, 4).map((t) => (
            <TeamSilhouette key={t.name} style={style} label={t.name} />
          ))}
        </div>
        <p className="mt-4 text-center text-[11px] text-slate-500 [word-break:keep-all]">
          행사 현장에선 팀원 전체를 같은 브랜드 스타일로 한 번에 만들어 드려요
        </p>
      </Panel>
    </ResultShell>
  );
}

function Initial({ name, color }: { name: string; color: string }) {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: color }}>
      {name.slice(0, 1)}
    </span>
  );
}

function MessageRow({
  avatar,
  name,
  role,
  time,
  children,
  highlight,
  delay = 0,
}: {
  avatar: React.ReactNode;
  name: string;
  role: string;
  time: string;
  children: React.ReactNode;
  highlight?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 + delay }}
      className="flex gap-2 text-left"
    >
      {avatar}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] text-slate-400">
          <span className="font-semibold text-slate-200">{name}</span> · {role} <span className="ml-1 text-slate-600">{time}</span>
        </p>
        <p
          className="mt-1 inline-block rounded-xl rounded-tl-sm px-3 py-1.5 text-xs text-slate-100 [word-break:keep-all]"
          style={{ backgroundColor: highlight ? `${highlight}33` : 'rgba(51,65,85,0.6)', border: highlight ? `1px solid ${highlight}88` : undefined }}
        >
          {children}
        </p>
      </div>
    </motion.div>
  );
}

function TeamSilhouette({ style, label }: { style: BrandStyle; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 opacity-80">
      <div className="h-12 w-12 rounded-full" style={{ background: style.ring, padding: 2 }}>
        <div className="flex h-full w-full items-end justify-center overflow-hidden rounded-full" style={{ backgroundColor: style.card }}>
          <svg viewBox="0 0 40 40" className="h-10 w-10" aria-hidden="true">
            <circle cx="20" cy="15" r="8" fill={style.accent} opacity="0.85" />
            <path d="M5 40 C7 28 14 25 20 25 C26 25 33 28 35 40 Z" fill={style.accent} opacity="0.85" />
          </svg>
        </div>
      </div>
      <span className="text-[10px] text-slate-500">{label}</span>
    </div>
  );
}

/* ── Export ─────────────────────────────────────────────── */

export default defineDemo({
  config: {
    id: 'brand-avatar',
    targetSlug: 'ai-brand-avatar',
    industryId: 'corporate',
    analyzeEmoji: '🧑‍💼',
    analyzeDurationMs: 3400,
    analyzeImageStepId: 'face',
    analyzeMessages: ['배경 분리 마스크 다듬는 중', '브랜드 CI 컬러 매핑 중', '아바타 톤 렌더링 중', '명함·메신저 프로필 적용 중'],
  },
  steps: [
    cameraStep({
      id: 'face',
      title: '프로필 사진을 촬영해요',
      subtitle: '어깨가 살짝 보이게, 정면을 바라봐 주세요',
      mode: 'face',
      subject: '얼굴',
      scanLabels: ['얼굴 영역 분리', '배경 제거 마스크 생성', '조명·피부톤 보정', '브랜드 스타일 매핑 준비'],
      readouts: (c) => [
        { label: '조명 상태', value: c.stats.brightness > 45 ? '양호' : '어두움 · 자동 보정' },
        { label: '배경 분리 정확도', value: `${93 + (c.seed % 6)}%` },
      ],
    }),
    choiceStep({
      id: 'brand',
      title: '어떤 브랜드 스타일로 만들까요?',
      subtitle: '행사에선 우리 회사 CI/BI 컬러로 맞춤 제작돼요',
      columns: 2,
      options: STYLE_ORDER.map((id) => ({ id, label: STYLES[id].label, desc: STYLES[id].desc, swatch: STYLES[id].swatch })),
    }),
    textStep({
      id: 'profile',
      title: '명함에 들어갈 정보를 알려주세요',
      fields: [
        { id: 'name', label: '이름', placeholder: '예: 김네안', maxLength: 10 },
        { id: 'title', label: '직함', placeholder: '예: 브랜드 매니저', maxLength: 18 },
      ],
    }),
  ],
  computeResult: (answers) => profileOf(answers).style,
  Result,
  print: (answers) => {
    const capture = getCapture(answers, 'face');
    const { name, title, style, empNo } = profileOf(answers);
    const brand = STYLES[style];
    return {
      kind: 'photo',
      photos: capture ? [{ src: capture.image, look: brand.look }] : [],
      title: name,
      caption: `${title} · ${brand.label} 브랜드 아바타`,
      badge: empNo,
      paper: PRINT_PAPER[style],
    };
  },
});
