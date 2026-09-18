'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
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
  seededInt,
  seededPick,
  seededRandom,
  type DemoStepDef,
} from '../kit';

/* ── Data ──────────────────────────────────────────────── */

type ProductId = 'air' | 'buds' | 'watch' | 'robot' | 'coffee';

interface Product {
  name: string;
  category: string;
  emoji: string;
  tagline: string;
  benefit: string;
  specs: string[];
  color: string;
  price: number;
}

const PRODUCTS: Record<ProductId, Product> = {
  air: {
    name: '에어 퓨어 X',
    category: '공기청정기',
    emoji: '🌬️',
    tagline: '숨 쉬는 모든 순간을 깨끗하게',
    benefit: '잠들기 전 공기까지 알아서 관리해 쉬는 시간의 질을 높여줘요.',
    specs: ['H13 헤파 필터', '수면 모드 22dB', '50㎡ 커버', 'AI 미세먼지 예측'],
    color: '#38bdf8',
    price: 389000,
  },
  buds: {
    name: '사운드핏 프로',
    category: '무선 이어폰',
    emoji: '🎧',
    tagline: '나만의 조용한 방을 귀에 담다',
    benefit: '적응형 노이즈 캔슬링이 어디서든 나만의 몰입 공간을 만들어줘요.',
    specs: ['적응형 노이즈 캔슬링', '최대 32시간 재생', 'IPX5 방수', '공간 음향'],
    color: '#a78bfa',
    price: 219000,
  },
  watch: {
    name: '핏 워치 S',
    category: '스마트워치',
    emoji: '⌚',
    tagline: '몸의 신호를 먼저 알아채는 코치',
    benefit: '심박·수면·활동량을 24시간 읽어 오늘 필요한 운동량을 알려줘요.',
    specs: ['24시간 심박·수면 분석', 'GPS 러닝 코치', '14일 배터리', '5ATM 방수'],
    color: '#34d399',
    price: 299000,
  },
  robot: {
    name: '로보클린 360',
    category: '로봇청소기',
    emoji: '🤖',
    tagline: '집안일은 로봇에게, 시간은 나에게',
    benefit: '3D 맵핑으로 집 구조를 기억해 외출한 사이 청소를 끝내 둬요.',
    specs: ['라이다 3D 맵핑', '흡입·물걸레 올인원', '자동 먼지 비움', '반려동물 털 모드'],
    color: '#f59e0b',
    price: 899000,
  },
  coffee: {
    name: '바리스타 원',
    category: '커피머신',
    emoji: '☕',
    tagline: '버튼 하나로 완성되는 카페 한 잔',
    benefit: '원터치 라떼와 예약 추출로 하루의 시작과 쉼표를 만들어줘요.',
    specs: ['19바 추출 압력', '원터치 라떼', '레시피 20종', '예약 추출'],
    color: '#fb923c',
    price: 459000,
  },
};

const PRODUCT_ORDER: ProductId[] = ['air', 'buds', 'watch', 'robot', 'coffee'];

interface Option {
  id: string;
  emoji: string;
  label: string;
  /** 다음 질문 앞에 붙는 AI의 맞장구 */
  reply: string;
  /** 추천 리포트용 한 줄 근거 */
  why?: string;
  keywords: string[];
  points: Partial<Record<ProductId, number>>;
}

interface Question {
  id: string;
  text: string;
  options: Option[];
}

const QUESTIONS: Question[] = [
  {
    id: 'moment',
    text: '저는 NEANDER LIFE 체험관의 AI 컨시어지 네오예요 👋 요즘 가장 더 좋아졌으면 하는 순간은 언제예요?',
    options: [
      { id: 'rest', emoji: '🛋️', label: '집에서 쉬는 시간', reply: '쉬는 시간이 제일 소중하죠 🙂', keywords: ['집', '휴식', '쉬', '잠', '수면'], points: { air: 3, coffee: 2 } },
      { id: 'work', emoji: '💻', label: '일·공부하는 시간', reply: '집중력이 곧 경쟁력이죠 💪', keywords: ['일', '공부', '회사', '업무', '집중'], points: { buds: 2, coffee: 3 } },
      { id: 'move', emoji: '🚇', label: '출퇴근·이동 시간', reply: '이동 시간도 내 시간으로 만들 수 있어요 🚀', keywords: ['출퇴근', '이동', '지하철', '버스', '운전'], points: { buds: 4, watch: 1 } },
      { id: 'health', emoji: '🏃', label: '운동·건강 관리', reply: '건강 챙기는 분, 멋져요 👍', keywords: ['운동', '건강', '헬스', '러닝', '다이어트'], points: { watch: 4, air: 1 } },
      { id: 'chores', emoji: '🧺', label: '집안일 줄이기', reply: '집안일은 줄일수록 행복해지죠 😄', keywords: ['청소', '집안일', '빨래', '정리', '설거지'], points: { robot: 4 } },
    ],
  },
  {
    id: 'priority',
    text: '제품을 고를 때 가장 중요하게 보는 건 뭐예요?',
    options: [
      { id: 'design', emoji: '✨', label: '디자인', reply: '감각적인 안목이시네요 ✨', why: '미니멀한 디자인이라 어느 공간에 두어도 인테리어가 돼요.', keywords: ['디자인', '예쁜', '감성', '색'], points: { coffee: 1, watch: 1, buds: 1 } },
      { id: 'performance', emoji: '⚡', label: '강력한 성능', reply: '역시 성능이 기본이죠 ⚡', why: '동급 제품 대비 높은 성능 지표를 갖춘 플래그십 라인이에요.', keywords: ['성능', '빠른', '파워', '강력'], points: { robot: 2, air: 1, buds: 1 } },
      { id: 'auto', emoji: '🪄', label: '알아서 해주는 자동화', reply: '신경 안 써도 되는 게 최고죠 🪄', why: '앱과 AI가 사용 패턴을 학습해 알아서 최적 모드로 맞춰줘요.', keywords: ['자동', '편한', '스마트', '알아서'], points: { robot: 2, air: 2, watch: 1 } },
      { id: 'value', emoji: '💸', label: '가성비', reply: '현명한 소비, 좋아요 💡', why: '체험관 전용 쿠폰까지 더하면 가격 부담이 확 줄어요.', keywords: ['가격', '가성비', '저렴', '할인'], points: { buds: 2, coffee: 1 } },
    ],
  },
  {
    id: 'home',
    text: '함께 지내는 가족이나 반려동물이 있나요?',
    options: [
      { id: 'solo', emoji: '🙋', label: '혼자 살아요', reply: '1인 라이프 맞춤으로 볼게요 🏡', why: '1인 가구에 딱 맞는 크기와 사용량으로 설계됐어요.', keywords: ['혼자', '자취', '1인'], points: { buds: 1, coffee: 1 } },
      { id: 'family', emoji: '👨‍👩‍👧', label: '가족과 함께', reply: '온 가족이 함께 쓰면 더 좋죠 🏡', why: '가족 모두가 함께 쓰기 좋은 넉넉한 성능이에요.', keywords: ['가족', '아이', '부모', '엄마', '아빠'], points: { air: 2, robot: 1 } },
      { id: 'pet', emoji: '🐶', label: '반려동물이 있어요', reply: '귀여운 가족이 있군요 🐾', why: '반려동물 털과 냄새까지 고려한 전용 모드가 있어요.', keywords: ['강아지', '고양이', '반려', '펫'], points: { robot: 2, air: 2 } },
      { id: 'roommate', emoji: '🏠', label: '룸메이트와 함께', reply: '서로 배려하는 게 중요하죠 🤝', why: '저소음 설계라 함께 사는 사람을 방해하지 않아요.', keywords: ['룸메', '친구', '셰어'], points: { buds: 2 } },
    ],
  },
  {
    id: 'time',
    text: '마지막 질문이에요! 하루 중 나만의 여유 시간은 언제인가요?',
    options: [
      { id: 'morning', emoji: '🌅', label: '아침', reply: '아침형 인간이시군요 🌅', keywords: ['아침', '새벽', '출근 전'], points: { coffee: 2, watch: 1 } },
      { id: 'lunch', emoji: '☀️', label: '점심', reply: '점심의 짧은 쉼표, 소중하죠 🌞', keywords: ['점심', '낮'], points: { buds: 1, watch: 1 } },
      { id: 'evening', emoji: '🌙', label: '저녁·밤', reply: '하루를 마무리하는 시간이네요 🌙', keywords: ['저녁', '밤', '퇴근', '자기 전'], points: { air: 1, buds: 1 } },
      { id: 'weekend', emoji: '📅', label: '주말에만', reply: '주말을 알차게 보내시는군요 📅', keywords: ['주말', '휴일', '토요일', '일요일'], points: { robot: 1, coffee: 1 } },
    ],
  },
];

const PURPOSES = [
  { id: 'me', emoji: '🙋', label: '나를 위해', desc: '내 생활을 업그레이드', intro: '오늘은 나를 위한 제품을 찾고 계시군요!' },
  { id: 'family', emoji: '🏡', label: '가족을 위해', desc: '함께 쓰는 제품', intro: '가족을 위한 제품을 찾고 계시군요!' },
  { id: 'gift', emoji: '🎁', label: '선물용', desc: '소중한 사람에게', intro: '선물을 고르고 계시군요! 받는 분을 떠올리며 답해 주세요.' },
  { id: 'browse', emoji: '👀', label: '그냥 둘러보기', desc: '신제품이 궁금해요', intro: '편하게 둘러보세요! 가볍게 몇 가지만 여쭤볼게요.' },
];

const CLOSING = '대화 고마워요! 답변을 분석해서 딱 맞는 제품을 찾았어요 ✨ 아래 결과 보기를 눌러 체험 리포트와 쿠폰을 받아 가세요.';

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
      className="flex items-end gap-2"
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
    <motion.div initial={animate ? { opacity: 0, x: 12 } : false} animate={{ opacity: 1, x: 0 }} className="flex justify-end">
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

function aiText(index: number, answers: DemoAnswers, chat: ChatValue): string {
  if (index >= QUESTIONS.length) {
    const last = optionOf(QUESTIONS[QUESTIONS.length - 1]!, chat);
    return `${last ? `${last.reply} ` : ''}${CLOSING}`;
  }
  const q = QUESTIONS[index]!;
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
  // AI 말풍선은 (답한 질문 수 + 1)개까지 — 마지막엔 마무리 멘트
  const target = answered + 1;
  // 이미 지나간 대화(뒤로 갔다 돌아온 경우)는 타이핑 연출 없이 바로 보여준다
  const [instant, setInstant] = useState(() => (chat.done ? total + 1 : answered));
  const [shown, setShown] = useState(instant);
  const [draft, setDraft] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  const typing = shown < target;
  const current = answered < total && !typing ? QUESTIONS[answered]! : null;
  const currentText = current ? aiText(answered, answers, chat) : '';

  useEffect(() => {
    if (shown >= target) return;
    const timer = window.setTimeout(() => {
      setShown(target);
      if (target > total) onUpdate('chat', { ...chat, done: true });
    }, 1100);
    return () => window.clearTimeout(timer);
  }, [shown, target, total, chat, onUpdate]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const timer = window.setTimeout(() => el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' }), 60);
    return () => window.clearTimeout(timer);
  }, [shown, answered, typing]);

  const answer = (optionId: string, freeText?: string) => {
    const q = QUESTIONS[answered];
    if (!q) return;
    onUpdate('chat', {
      picks: { ...chat.picks, [q.id]: optionId },
      free: freeText ? { ...chat.free, [q.id]: freeText } : chat.free,
      done: false,
    } satisfies ChatValue);
    setDraft('');
  };

  const reset = () => {
    onUpdate('chat', undefined);
    setInstant(0);
    setShown(0);
    setDraft('');
  };

  const bubbles: React.ReactNode[] = [];
  for (let i = 0; i < total; i++) {
    if (i >= shown) break;
    const q = QUESTIONS[i]!;
    bubbles.push(<AiBubble key={`ai-${i}`} text={aiText(i, answers, chat)} animate={i >= instant} />);
    const option = optionOf(q, chat);
    if (option) {
      const free = chat.free[q.id];
      bubbles.push(<UserBubble key={`me-${i}`} text={free ? free : `${option.emoji} ${option.label}`} animate={i >= instant} />);
    }
  }
  if (shown > total) bubbles.push(<AiBubble key="ai-closing" text={aiText(total, answers, chat)} animate={total >= instant} />);

  const chipDelay = current && answered >= instant ? Array.from(currentText).length * CHAR_DELAY + 0.1 : 0;

  return (
    <div className="mx-auto w-full max-w-md overflow-hidden rounded-3xl border border-slate-700 bg-slate-950/80 shadow-2xl shadow-black/40">
      {/* Kiosk header */}
      <div className="flex items-center gap-3 border-b border-slate-800 bg-gradient-to-r from-teal-500/15 to-transparent px-4 py-3">
        <div className="relative">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-cyan-600 text-sm font-bold text-white">
            N
          </span>
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-slate-950 bg-emerald-400" />
        </div>
        <div className="min-w-0 flex-1 text-left">
          <p className="text-sm font-semibold text-white">네오 · AI 컨시어지</p>
          <p className="text-[11px] text-teal-300">{typing ? '입력 중…' : '체험관 키오스크 · 온라인'}</p>
        </div>
        <div className="flex items-center gap-1" aria-label={`질문 ${Math.min(answered, total)} / ${total}`}>
          {QUESTIONS.map((q, i) => (
            <span key={q.id} className={cn('h-1.5 w-4 rounded-full', i < answered ? 'bg-teal-400' : 'bg-slate-700')} />
          ))}
        </div>
      </div>

      {/* Conversation */}
      <div ref={listRef} className="h-[360px] space-y-3 overflow-y-auto px-4 py-4 sm:h-[380px]" aria-live="polite">
        {bubbles}
        <AnimatePresence>{typing && <TypingBubble key="typing" />}</AnimatePresence>
      </div>

      {/* Quick replies */}
      <div className="border-t border-slate-800 bg-slate-900/70 px-4 py-3">
        {current ? (
          <motion.div key={current.id} initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { delayChildren: chipDelay, staggerChildren: 0.05 } } }}>
            <div className="flex flex-wrap gap-2">
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
            </div>
            <form
              className="mt-3 flex gap-2"
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
            </form>
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
    </div>
  );
}

const chatStep: DemoStepDef = {
  meta: {
    id: 'chat',
    titleKey: 'AI 컨시어지와 대화해 보세요',
    subtitleKey: '질문에 답하면 나에게 딱 맞는 제품을 찾아드려요',
    canProceed: (a) => getChat(a).done,
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
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  if (code < 0 || code > 11171) return `${word}을(를)`;
  return `${word}${code % 28 === 0 ? '를' : '을'}`;
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

/* ── Result ────────────────────────────────────────────── */

function MatchRing({ value, color }: { value: number; color: string }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-24 w-24 shrink-0">
      <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="40" cy="40" r={r} fill="none" stroke="#1e293b" strokeWidth="7" />
        <motion.circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - value / 100) }}
          transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-extrabold text-white">{value}%</span>
        <span className="text-[9px] text-slate-400">매칭</span>
      </div>
    </div>
  );
}

function Result({ answers, onRestart, pillarColor }: DemoResultProps) {
  const { seed, chat, best, match, runnerUps } = recommend(answers);
  const product = PRODUCTS[best];
  const purpose = PURPOSES.find((p) => p.id === getChoice(answers, 'purpose')) ?? PURPOSES[0]!;
  const [moment, priority, home, time] = QUESTIONS.map((q) => optionOf(q, chat));
  const { discount, code, salePrice } = couponOf(seed, product);
  const reasons = reasonsOf(chat, product);

  return (
    <ResultShell
      eyebrow="AI 컨시어지 맞춤 추천"
      title={`${product.emoji} ${product.name}`}
      description={`NEANDER LIFE ${product.category} · ${product.tagline}`}
      pillarColor={pillarColor}
      onRestart={onRestart}
      restartLabel="다시 대화하기"
    >
      {/* Hero product */}
      <div
        className="relative w-full max-w-md overflow-hidden rounded-3xl border p-5 text-left"
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
            <p className="mt-0.5 text-[11px] text-slate-500">체험관 쿠폰 적용 시 {won(salePrice)}</p>
          </div>
          <MatchRing value={match} color={product.color} />
        </div>
      </div>

      <Panel title="이런 점이 딱 맞아요">
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
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800">
                <motion.div
                  className="h-full rounded-full bg-slate-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${r.match}%` }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                />
              </div>
              <span className="w-9 text-right text-slate-400">{r.match}%</span>
            </div>
          ))}
        </div>
      </Panel>

      {/* Coupon */}
      <motion.div
        initial={{ opacity: 0, y: 20, rotate: -2 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ delay: 0.8, type: 'spring', stiffness: 120, damping: 14 }}
        className="relative flex w-full max-w-md overflow-hidden rounded-2xl text-left shadow-2xl shadow-black/40"
        style={{ background: `linear-gradient(120deg, ${pillarColor}, ${product.color})` }}
      >
        <div className="flex-1 p-5 pr-4">
          <p className="text-[10px] font-bold tracking-[0.2em] text-white/80">NEANDER LIFE 체험관 쿠폰</p>
          <p className="mt-1 whitespace-nowrap text-4xl font-black text-white">
            {discount}% <span className="text-base font-bold">OFF</span>
          </p>
          <p className="mt-1 text-xs text-white/90">
            {product.name} <span className="line-through opacity-70">{won(product.price)}</span> → <b>{won(salePrice)}</b>
          </p>
          <p className="mt-2 text-[10px] text-white/70">
            {purpose.id === 'gift' ? '무료 선물 포장 포함 · ' : ''}발급일로부터 14일간 사용 가능
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
    analyzeMessages: ['대화 맥락 분석 중', '제품 DB 128종 비교 중', '맞춤 추천 점수 계산 중', '체험 리포트·쿠폰 발급 중'],
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
  print: (answers) => {
    const { seed, chat, best, match, runnerUps } = recommend(answers);
    const product = PRODUCTS[best];
    const purpose = PURPOSES.find((p) => p.id === getChoice(answers, 'purpose')) ?? PURPOSES[0]!;
    const { discount, code, salePrice } = couponOf(seed, product);
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
        { type: 'list', title: '이런 점이 딱 맞아요', items: reasonsOf(chat, product) },
        { type: 'text', title: '주요 스펙', text: product.specs.join(' · ') },
        {
          type: 'bars',
          title: '매칭 점수',
          bars: [{ label: product.name, value: match }, ...runnerUps.map((r) => ({ label: PRODUCTS[r.id].name, value: r.match }))],
        },
        { type: 'big', title: `체험관 쿠폰 · ${discount}% OFF`, text: code },
        {
          type: 'rows',
          rows: [
            { label: '정가', value: won(product.price) },
            { label: '쿠폰 적용가', value: won(salePrice) },
          ],
        },
      ],
      footer: '오늘 체험이 즐거우셨길 바라요',
    };
  },
});
