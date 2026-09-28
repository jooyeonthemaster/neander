'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { History, MessageCircle } from 'lucide-react';
import { withParticle } from '@/lib/korean';
import type { DemoAnswers, DemoResultProps, DemoStepProps } from '@/types/demo';
import {
  InfoGrid,
  Panel,
  ResultShell,
  answersSeed,
  choiceStep,
  clamp,
  defineDemo,
  getChoice,
  hashString,
  requestDemoAi,
  seededInt,
  seededPick,
  seededRandom,
  type DemoStepDef,
} from '../kit';
import {
  PRODUCTS,
  PRODUCT_ORDER,
  PURPOSES,
  QUESTIONS,
  type AiProductPick,
  type Option,
  type Product,
  type ProductId,
  type Question,
} from '@/data/demo-ai/product-experience';
import '../demo-review-learning.css';

/* ── Data ──────────────────────────────────────────────── */

// 제품·질문 데이터는 생성 API와 함께 쓰려고 src/data/demo-ai/product-experience.ts 로 옮겼다

const CLOSING = '답변을 바탕으로 비교해 볼 예시 제품을 골랐어요. 결과에서 선택 이유와 확인할 점을 살펴보세요.';

/* ── Chat state ────────────────────────────────────────── */

interface ChatValue {
  picks: Record<string, string>;
  free: Record<string, string>;
  done: boolean;
}

const EMPTY_CHAT: ChatValue = { picks: {}, free: {}, done: false };

function getChat(answers: DemoAnswers): ChatValue {
  const value = answers.chat as ChatValue | undefined;
  return value && typeof value === 'object' && value.picks ? value : EMPTY_CHAT;
}

function answeredCount(chat: ChatValue): number {
  let n = 0;
  while (n < QUESTIONS.length && chat.picks[QUESTIONS[n]!.id]) n++;
  return n;
}

function optionOf(q: Question, chat: ChatValue): Option | undefined {
  return q.options.find((o) => o.id === chat.picks[q.id]);
}

/** 자유 입력을 가장 가까운 선택지로 해석한다 (키워드가 없으면 문장 해시로 고른다) */
function interpret(q: Question, text: string): string {
  const hit = q.options.find((o) => o.keywords.some((k) => text.includes(k)));
  return hit ? hit.id : q.options[hashString(text) % q.options.length]!.id;
}

/* ── Chat step UI ──────────────────────────────────────── */

const CHAR_DELAY = 0.016;

function TypeText({ text, animate }: { text: string; animate: boolean }) {
  if (!animate) return <>{text}</>;
  return (
    <>
      {Array.from(text).map((ch, i) => (
        <motion.span key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.05, delay: i * CHAR_DELAY }}>
          {ch}
        </motion.span>
      ))}
    </>
  );
}

function AiBubble({ text, animate }: { text: string; animate: boolean }) {
  return (
    <motion.div
      initial={animate ? { opacity: 0, y: 8 } : false}
      animate={{ opacity: 1, y: 0 }}
      className="product-chat-ai flex items-end gap-2"
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-cyan-600 text-xs font-bold text-white shadow-lg shadow-teal-500/30">
        N
      </span>
      <p className="max-w-[80%] rounded-2xl rounded-bl-sm bg-slate-800 px-3.5 py-2.5 text-left text-[13px] leading-relaxed text-slate-100 [word-break:keep-all]">
        <TypeText text={text} animate={animate} />
      </p>
    </motion.div>
  );
}

function UserBubble({ text, animate }: { text: string; animate: boolean }) {
  return (
    <motion.div initial={animate ? { opacity: 0, x: 12 } : false} animate={{ opacity: 1, x: 0 }} className="product-chat-user flex justify-end">
      <p className="max-w-[78%] rounded-2xl rounded-br-sm bg-gradient-to-r from-teal-500 to-cyan-500 px-3.5 py-2 text-left text-[13px] font-medium text-white [word-break:keep-all]">
        {text}
      </p>
    </motion.div>
  );
}

function TypingBubble() {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-end gap-2">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-cyan-600 text-xs font-bold text-white">
        N
      </span>
      <span className="flex gap-1 rounded-2xl rounded-bl-sm bg-slate-800 px-4 py-3" aria-label="입력 중">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-slate-400"
            animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </span>
    </motion.div>
  );
}

function aiText(index: number, answers: DemoAnswers, chat: ChatValue, compact = false): string {
  if (index >= QUESTIONS.length) {
    if (compact) return CLOSING;
    const last = optionOf(QUESTIONS[QUESTIONS.length - 1]!, chat);
    return `${last ? `${last.reply} ` : ''}${CLOSING}`;
  }
  const q = QUESTIONS[index]!;
  if (compact) return index === 0 ? '요즘 가장 더 좋아졌으면 하는 순간은 언제예요?' : q.text;
  if (index === 0) {
    const purpose = PURPOSES.find((p) => p.id === getChoice(answers, 'purpose'));
    return `${purpose ? `${purpose.intro} ` : ''}${q.text}`;
  }
  const prev = optionOf(QUESTIONS[index - 1]!, chat);
  return `${prev ? `${prev.reply} ` : ''}${q.text}`;
}

function ChatStep({ answers, onUpdate }: DemoStepProps) {
  const chat = getChat(answers);
  const answered = answeredCount(chat);
  const total = QUESTIONS.length;
  // 답변할 때마다 다음 타이핑 단계로 이동하고 마지막에 마무리 멘트를 보여준다.
  const target = answered + 1;
  // 이미 지나간 대화(뒤로 갔다 돌아온 경우)는 타이핑 연출 없이 바로 보여준다
  const [instant, setInstant] = useState(() => (chat.done ? total + 1 : answered));
  const [shown, setShown] = useState(instant);
  const [draft, setDraft] = useState('');
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const [compose, setCompose] = useState(false);
  const typing = shown < target;
  const current = answered < total && !typing ? QUESTIONS[answered]! : null;
  const currentText = current ? aiText(answered, answers, chat, true) : '';
  const historyQuestion = historyIndex === null ? undefined : QUESTIONS[historyIndex];
  const historyOption = historyQuestion ? optionOf(historyQuestion, chat) : undefined;

  useEffect(() => {
    if (shown >= target) return;
    const timer = window.setTimeout(() => {
      setShown(target);
      if (target > total) onUpdate('chat', { ...chat, done: true });
    }, 1100);
    return () => window.clearTimeout(timer);
  }, [shown, target, total, chat, onUpdate]);

  const answer = (optionId: string, freeText?: string) => {
    const q = QUESTIONS[answered];
    if (!q) return;
    onUpdate('chat', {
      picks: { ...chat.picks, [q.id]: optionId },
      free: freeText ? { ...chat.free, [q.id]: freeText } : chat.free,
      done: false,
    } satisfies ChatValue);
    setDraft('');
    setCompose(false);
  };

  const reset = () => {
    onUpdate('chat', undefined);
    setInstant(0);
    setShown(0);
    setDraft('');
    setHistoryIndex(null);
    setCompose(false);
  };

  const chipDelay = current && answered >= instant ? Array.from(currentText).length * CHAR_DELAY + 0.1 : 0;

  return (
    <div className="product-chat mx-auto w-full max-w-md overflow-hidden rounded-3xl border border-slate-700 bg-slate-950/80 shadow-2xl shadow-black/40" data-chat-view={historyIndex === null ? 'current' : 'history'}>
      {/* Kiosk header */}
      <div className="product-chat-header flex items-center justify-between gap-3 border-b border-slate-800 bg-gradient-to-r from-teal-500/15 to-transparent px-4 py-2">
        <div><span className="product-chat-count text-xs font-semibold text-slate-300" aria-live="polite">{chat.done ? '✓ 상담 완료' : `답변 ${answered}/${total}개 완료`}</span>
          <ol className="product-chat-completion" aria-label="문항별 답변 상태">{QUESTIONS.map((question, index) => <li key={question.id} data-done={!!chat.picks[question.id]}>{chat.picks[question.id] ? '✓' : '○'} {index + 1}번</li>)}</ol>
        </div>
        <div className="product-chat-tools flex items-center gap-3">
          {current && historyIndex === null && <button type="button" className="product-chat-compose-toggle text-xs font-medium text-teal-300" aria-pressed={compose} onClick={() => setCompose(!compose)}>{compose ? '선택지 보기' : '직접 입력'}</button>}
        </div>
      </div>

      {/* A single turn keeps the kiosk in view; past answers remain available in history. */}
      <div className="product-chat-turn space-y-3 px-4 py-4" aria-live="polite">
        {historyQuestion && historyOption && historyIndex !== null ? <>
          <AiBubble key={`history-ai-${historyQuestion.id}`} text={aiText(historyIndex, answers, chat)} animate={false} />
          <UserBubble key={`history-me-${historyQuestion.id}`} text={chat.free[historyQuestion.id] || `${historyOption.emoji} ${historyOption.label}`} animate={false} />
        </> : <>
          {!typing && <AiBubble key={`ai-${answered}`} text={aiText(answered, answers, chat, true)} animate={answered >= instant} />}
          <AnimatePresence>{typing && <TypingBubble key="typing" />}</AnimatePresence>
        </>}
      </div>

      {/* Quick replies */}
      <div className="product-chat-replies border-t border-slate-800 bg-slate-900/70 px-4 py-3">
        {historyIndex !== null ? <nav className="product-chat-history-nav flex items-center justify-between gap-3" aria-label="이전 대화 탐색">
          <button type="button" disabled={historyIndex === 0} onClick={() => setHistoryIndex(Math.max(0, historyIndex - 1))} className="rounded-full border border-teal-500/40 px-3 py-2 text-xs text-teal-100 disabled:opacity-30">이전 대화</button>
          <span className="text-xs text-slate-300" aria-live="polite">{historyIndex + 1} / {answered}</span>
          <button type="button" disabled={historyIndex >= answered - 1} onClick={() => setHistoryIndex(Math.min(answered - 1, historyIndex + 1))} className="rounded-full border border-teal-500/40 px-3 py-2 text-xs text-teal-100 disabled:opacity-30">다음 대화</button>
        </nav> : current ? (
          <motion.div key={current.id} initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { delayChildren: chipDelay, staggerChildren: 0.05 } } }}>
            {!compose && <div className="product-chat-options flex flex-wrap gap-2">
              {current.options.map((option) => (
                <motion.button
                  key={option.id}
                  type="button"
                  variants={{ hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0 } }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => answer(option.id)}
                  className="rounded-full border border-teal-500/40 bg-teal-500/10 px-3 py-1.5 text-xs font-medium text-teal-100 transition-colors hover:bg-teal-500/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
                >
                  {option.emoji} {option.label}
                </motion.button>
              ))}
            </div>}
            {compose && <form
              className="product-chat-compose flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const text = draft.trim();
                if (text) answer(interpret(current, text), text);
              }}
            >
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                maxLength={40}
                placeholder="직접 입력해도 돼요"
                aria-label="답변 직접 입력"
                className="min-w-0 flex-1 rounded-full border border-slate-700 bg-slate-950/60 px-4 py-2 text-xs text-white placeholder:text-slate-600 focus:border-teal-400 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!draft.trim()}
                className="rounded-full bg-teal-500 px-4 text-xs font-semibold text-white transition-opacity disabled:opacity-30"
              >
                전송
              </button>
            </form>}
          </motion.div>
        ) : answered >= total && !typing ? (
          <div className="flex items-center justify-between text-xs">
            <span className="text-teal-300">✓ 대화 완료 · 추천 준비 끝</span>
            <button type="button" onClick={reset} className="text-slate-400 underline-offset-4 hover:text-white hover:underline">
              처음부터 다시 대화
            </button>
          </div>
        ) : (
          <p className="py-1 text-center text-xs text-slate-500">네오가 답변을 준비하고 있어요…</p>
        )}
      </div>
      {answered > 0 && <div className="product-chat-history-dock">
        <span className="text-xs">답변 기록 {answered}개</span>
        <button type="button" className="product-chat-history-toggle inline-flex items-center gap-2 text-xs font-medium" aria-pressed={historyIndex !== null} onClick={() => setHistoryIndex(historyIndex === null ? answered - 1 : null)}>
          {historyIndex === null ? <History size={18} aria-hidden="true" /> : <MessageCircle size={18} aria-hidden="true" />}{historyIndex === null ? '대화 기록' : '상담으로'}
        </button>
      </div>}
    </div>
  );
}

const chatStep: DemoStepDef = {
  meta: {
    id: 'chat',
    titleKey: '네오와 대화해요',
    subtitleKey: '',
    canProceed: (a) => getChat(a).done,
    getBlockedReason: (a) => {
      const count = answeredCount(getChat(a));
      return count < QUESTIONS.length ? `답변 ${count}/${QUESTIONS.length}개 완료 · ${QUESTIONS.length - count}개 질문에 더 답해 주세요.` : '답변을 정리하고 있어요. 잠시만 기다려 주세요.';
    },
  },
  Component: ChatStep,
};

/* ── Recommendation ────────────────────────────────────── */

function recommend(answers: DemoAnswers) {
  const chat = getChat(answers);
  const seed = answersSeed(answers);
  const scores = Object.fromEntries(PRODUCT_ORDER.map((id) => [id, seededRandom(seed, id) * 0.5])) as Record<ProductId, number>;
  for (const q of QUESTIONS) {
    const option = optionOf(q, chat);
    for (const [id, pts] of Object.entries(option?.points ?? {})) scores[id as ProductId] += pts;
  }
  if (getChoice(answers, 'purpose') === 'family') {
    scores.air += 1;
    scores.robot += 1;
  }
  const ranked = [...PRODUCT_ORDER].sort((a, b) => scores[b] - scores[a]);
  const best = ranked[0]!;
  const gap = scores[best] - scores[ranked[1]!];
  const match = Math.round(clamp(84 + gap * 2 + seededInt(seed, 'match', 0, 3), 80, 97));
  const runnerUps = ranked.slice(1, 3).map((id, i) => ({
    id,
    match: Math.round(clamp(match - 9 - i * 7 - seededInt(seed, `ru${i}`, 0, 4), 55, 95)),
  }));
  return { seed, chat, best, match, runnerUps };
}

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function couponCode(seed: number): string {
  const part = (salt: string) =>
    Array.from({ length: 4 }, (_, i) => CODE_CHARS[seededInt(seed, `${salt}${i}`, 0, CODE_CHARS.length - 1)]).join('');
  return `NL-${part('a')}-${part('b')}`;
}

/** 받침 유무에 맞춰 목적격 조사(을/를)를 붙인다 */
function withObject(word: string): string {
  return withParticle(word, '을/를');
}

function won(n: number): string {
  return `${n.toLocaleString('ko-KR')}원`;
}

/** 체험관 쿠폰 — 할인율·코드·적용가 */
function couponOf(seed: number, product: Product) {
  const discount = seededPick(seed, 'discount', [10, 12, 15, 18, 20]);
  return {
    discount,
    code: couponCode(seed),
    salePrice: Math.round((product.price * (100 - discount)) / 100 / 100) * 100,
  };
}

/** 대화에서 고른 답으로 만든 추천 근거 */
function reasonsOf(chat: ChatValue, product: Product): string[] {
  const [moment, priority, home] = QUESTIONS.map((q) => optionOf(q, chat));
  return [
    moment && `${withObject(moment.label)} 더 좋게 만들고 싶다고 하셨죠. ${product.benefit}`,
    priority?.why,
    home?.why,
  ].filter(Boolean) as string[];
}

/* ── AI 추천 ───────────────────────────────────────────── */

function isProductId(v: unknown): v is ProductId {
  return typeof v === 'string' && (PRODUCT_ORDER as string[]).includes(v);
}

function isAiProductPick(v: unknown): v is AiProductPick {
  const o = v as AiProductPick | null;
  return (
    !!o &&
    isProductId(o.best) &&
    typeof o.match === 'number' &&
    Array.isArray(o.reasons) &&
    o.reasons.length > 0 &&
    o.reasons.every((r) => typeof r === 'string') &&
    Array.isArray(o.runnerUps) &&
    o.runnerUps.every((r) => isProductId(r?.id) && typeof r.match === 'number')
  );
}

/** 화면·출력물이 그리는 추천 — AI 결과가 있으면 그것, 없으면 답변 점수 계산 결과 */
function recommendView(answers: DemoAnswers, generated: unknown) {
  const base = recommend(answers);
  if (isAiProductPick(generated)) {
    const product = PRODUCTS[generated.best];
    return {
      ...base,
      best: generated.best,
      match: Math.round(clamp(generated.match, 0, 100)),
      runnerUps: generated.runnerUps.map((r) => ({ id: r.id, match: Math.round(clamp(r.match, 0, 100)) })),
      product,
      reasons: generated.reasons,
      coupon: couponOf(base.seed, product),
      ai: true,
    };
  }
  const product = PRODUCTS[base.best];
  return { ...base, product, reasons: reasonsOf(base.chat, product), coupon: couponOf(base.seed, product), ai: false };
}

function generate(answers: DemoAnswers): Promise<AiProductPick | null> {
  const chat = getChat(answers);
  return requestDemoAi<AiProductPick>(
    'product-experience',
    { experienceProfile: answers.experienceProfile, purpose: getChoice(answers, 'purpose') ?? 'me', picks: chat.picks, free: chat.free },
    { validate: isAiProductPick }
  );
}

/* ── Result ────────────────────────────────────────────── */

function Result({ answers, onRestart, pillarColor, generated }: DemoResultProps) {
  const { chat, runnerUps, product, reasons, coupon, ai } = recommendView(answers, generated);
  const purpose = PURPOSES.find((p) => p.id === getChoice(answers, 'purpose')) ?? PURPOSES[0]!;
  const [moment, priority, home, time] = QUESTIONS.map((q) => optionOf(q, chat));
  const { discount, code, salePrice } = coupon;

  return (
    <ResultShell
      coreCount={2}
      eyebrow="AI 컨시어지 맞춤 추천"
      title={`${product.emoji} ${product.name}`}
      description={`NEANDER LIFE ${product.category} · ${product.tagline}`}
      pillarColor={pillarColor}
      onRestart={onRestart}
      restartLabel="다시 대화하기"
    >
      <p className="max-w-md text-xs leading-relaxed text-slate-400">가상의 예시 제품을 비교하는 체험입니다. 가격·성능·쿠폰은 실제 상품의 제공 조건이 아닙니다.</p>
      {/* Hero product */}
      <div
        className="demo-dark-surface relative w-full max-w-md overflow-hidden rounded-3xl border p-5 text-left"
        style={{ borderColor: `${product.color}55`, background: `radial-gradient(circle at 15% 20%, ${product.color}33, transparent 60%), #0f172a` }}
      >
        <div className="flex items-center gap-4">
          <motion.div
            className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl text-4xl"
            style={{ background: `linear-gradient(145deg, ${product.color}, ${product.color}55)`, boxShadow: `0 20px 40px -12px ${product.color}88` }}
            initial={{ rotate: -12, scale: 0.6, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 160, damping: 12 }}
          >
            <motion.span animate={{ y: [0, -5, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}>
              {product.emoji}
            </motion.span>
          </motion.div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold tracking-[0.25em] text-slate-400">NEANDER LIFE</p>
            <p className="mt-0.5 text-xl font-bold text-white [word-break:keep-all]">{product.name}</p>
            <p className="text-xs text-slate-400">{product.category}</p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between gap-4 border-t border-white/10 pt-4">
          <div>
            <p className="text-[11px] text-slate-400">대화 기반 추천 1순위</p>
            <p className="mt-1 text-lg font-bold" style={{ color: product.color }}>
              {won(product.price)}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-500">예시 할인 적용가 {won(salePrice)}</p>
          </div>
          <span className="rounded-full border border-white/20 px-3 py-2 text-xs font-semibold text-slate-200">비교 후보 1</span>
        </div>
      </div>

      <Panel title="이런 기준으로 비교해 보세요">
        <ul className="space-y-3">
          {reasons.map((reason, i) => (
            <motion.li
              key={reason}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.15 }}
              className="flex gap-2.5 text-sm leading-relaxed text-slate-200 [word-break:keep-all]"
            >
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-slate-950" style={{ backgroundColor: product.color }}>
                ✓
              </span>
              {reason}
            </motion.li>
          ))}
        </ul>
        {ai && <p className="mt-3 text-[11px] text-slate-500">AI 컨시어지가 당신과 나눈 대화로 고른 추천이에요</p>}
        <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-800 pt-4">
          {product.specs.map((spec) => (
            <span key={spec} className="rounded-full border border-slate-700 bg-slate-800/60 px-2.5 py-1 text-[11px] text-slate-300">
              {spec}
            </span>
          ))}
        </div>
      </Panel>

      <Panel title="체험 리포트">
        <div className="-m-1">
          <InfoGrid
            items={[
              { emoji: '🎯', label: '방문 목적', value: purpose.label },
              { emoji: '⏱️', label: '관심 순간', value: moment?.label ?? '-' },
              { emoji: '⚖️', label: '선호 기준', value: priority?.label ?? '-' },
              { emoji: '🏠', label: '생활 환경', value: `${home?.label ?? '-'} · ${time?.label ?? '-'}` },
            ]}
          />
        </div>
        <div className="mt-4 space-y-2">
          <p className="text-[11px] text-slate-500">함께 비교해 볼 만한 제품</p>
          {runnerUps.map((r) => (
            <div key={r.id} className="flex items-center gap-3 text-xs">
              <span className="text-base">{PRODUCTS[r.id].emoji}</span>
              <span className="w-24 shrink-0 truncate text-slate-300">{PRODUCTS[r.id].name}</span>
              <span className="ml-auto text-slate-400">{PRODUCTS[r.id].category} · 비교 후보</span>
            </div>
          ))}
        </div>
      </Panel>

      {/* Coupon */}
      <motion.div
        initial={{ opacity: 0, y: 20, rotate: -2 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ delay: 0.8, type: 'spring', stiffness: 120, damping: 14 }}
        className="demo-dark-surface relative flex w-full max-w-md overflow-hidden rounded-2xl text-left shadow-2xl shadow-black/40"
        style={{ background: `linear-gradient(120deg, color-mix(in srgb, ${pillarColor} 35%, #0f172a), color-mix(in srgb, ${product.color} 35%, #0f172a))` }}
      >
        <div className="flex-1 p-5 pr-4">
          <p className="text-[10px] font-bold tracking-[0.2em] text-white/80">구매 불가 · 예시 쿠폰 디자인</p>
          <p className="mt-1 whitespace-nowrap text-4xl font-black text-white">
            {discount}% <span className="text-base font-bold">OFF</span>
          </p>
          <p className="mt-1 text-xs text-white/90">
            {product.name} <span className="line-through opacity-70">{won(product.price)}</span> → <b>{won(salePrice)}</b>
          </p>
          <p className="mt-2 text-[10px] text-white/70">
            실제 구매·할인에 사용할 수 없는 체험용 샘플입니다.
          </p>
        </div>
        {/* 절취선 */}
        <div className="relative w-0 border-l-2 border-dashed border-white/60" aria-hidden="true">
          <span className="absolute -left-[11px] -top-2.5 h-5 w-5 rounded-full bg-slate-950" />
          <span className="absolute -bottom-2.5 -left-[11px] h-5 w-5 rounded-full bg-slate-950" />
        </div>
        <div className="flex w-28 shrink-0 flex-col items-center justify-center gap-1.5 bg-black/15 p-3 sm:w-32">
          <span className="text-2xl" aria-hidden="true">🎟️</span>
          <p className="text-[9px] text-white/80">쿠폰 코드</p>
          <p className="font-mono text-[11px] font-bold tracking-wider text-white">{code}</p>
        </div>
      </motion.div>
    </ResultShell>
  );
}

/* ── Export ─────────────────────────────────────────────── */

export default defineDemo({
  config: {
    id: 'product-experience',
    targetSlug: 'ai-product-experience',
    industryId: 'corporate',
    analyzeEmoji: '🛍️',
    analyzeDurationMs: 3200,
    analyzeMessages: ['대화 맥락 분석 중', 'AI 컨시어지가 제품 비교 중', '맞춤 추천 이유 정리 중', '제품 비교 카드 작성 중'],
  },
  steps: [
    choiceStep({
      id: 'purpose',
      title: 'NEANDER LIFE 체험관에 오신 걸 환영해요',
      subtitle: '오늘은 어떤 제품을 찾고 계신가요?',
      columns: 2,
      options: PURPOSES.map(({ id, emoji, label, desc }) => ({ id, emoji, label, desc })),
    }),
    chatStep,
  ],
  computeResult: (answers) => recommend(answers).best,
  Result,
  generate,
  print: (answers, _resultKey, generated) => {
    const { runnerUps, product, reasons, coupon } = recommendView(answers, generated);
    const purpose = PURPOSES.find((p) => p.id === getChoice(answers, 'purpose')) ?? PURPOSES[0]!;
    const { discount, code, salePrice } = coupon;
    return {
      kind: 'receipt',
      eyebrow: 'AI 컨시어지 맞춤 추천',
      title: product.name,
      sections: [
        {
          type: 'rows',
          rows: [
            { label: '제품군', value: product.category },
            { label: '방문 목적', value: purpose.label },
            { label: '한 줄 소개', value: product.tagline },
          ],
        },
        { type: 'list', title: '이런 점이 딱 맞아요', items: reasons },
        { type: 'text', title: '주요 스펙', text: product.specs.join(' · ') },
        {
          type: 'list',
          title: '함께 비교할 예시 제품',
          items: runnerUps.map((r) => `${PRODUCTS[r.id].name} · ${PRODUCTS[r.id].category}`),
        },
        { type: 'big', title: `예시 쿠폰 · ${discount}% OFF`, text: code },
        {
          type: 'rows',
          rows: [
            { label: '예시 가격', value: won(product.price) },
            { label: '예시 할인 적용가', value: won(salePrice) },
          ],
        },
      ],
      footer: '제품·가격·쿠폰은 체험용 예시입니다. 실제 구매나 할인은 제공하지 않습니다.',
    };
  },
});
