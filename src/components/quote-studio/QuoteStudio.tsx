'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Select } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';
import { Checkbox } from '@/components/ui/Checkbox';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { AnimatePresence, MotionConfig, animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react';
import { ArrowDown, ArrowLeft, ArrowRight, Check as CheckIcon, ChevronDown, ChevronRight, FileDown, FileText, LayoutTemplate, Plus, ShieldCheck, SlidersHorizontal, Sparkles, Trash2, X } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics/tracker';
import { createInquiry } from '@/lib/firebase/inquiries';
import { experiences, getExperienceBySlug } from '@/data/experiences';
import { PRODUCTS } from '@/data/products';
import { QUOTE_PRESET_IMAGES } from '@/data/quote-preset-images';
import {
  ESTIMATE_DISCLAIMER, EVENT_TYPES, REGION_NOTE, REGIONS, SERVICE_ORDER, SERVICE_TEXT,
  type Lang, type RegionKey, type ServiceKey,
} from '@/lib/quote/catalog';
import {
  calculateQuote, defaultOptions, sanitizeInput, serviceForExperience, startingPrice,
  type QuoteInput, type QuoteItem,
} from '@/lib/quote/engine';
import { QUOTE_PRESETS } from '@/lib/quote/presets';
import { QUOTE_COPY } from './copy';
import { Check, Field, Segmented, Stepper, inputClass } from './QuoteControls';
import { QuoteOptions, type QuoteOptionsSetter } from './QuoteOptions';
import { optionSummary } from './option-summary';
import { QUOTE_STORAGE_KEY, addEstimateHistory, estimateHref, loadEstimateHistory, type EstimateHistoryItem } from './history';

/* ─────────────────────────────────────────────────────────
   온라인 견적 (/quote)
   왼쪽: 시작 방법 → 행사 조건 → 체험 담기 → 견적서 받기
   오른쪽: 가견적서 미리보기 (실시간, 연락처 없이 금액 공개)
   단계별 이용 기록: quote_view · quote_preset · quote_step(conditions · add_서비스 · form) · quote_pdf · quote_request
   ───────────────────────────────────────────────────────── */

const STORAGE_KEY = QUOTE_STORAGE_KEY;

const BLANK: QuoteInput = {
  eventType: 'popup', eventDate: '', days: 1, hoursPerDay: 6, attendees: 100, region: 'capital', extraStaff: 0, items: [],
};

function loadSaved(): QuoteInput | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? sanitizeInput(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

const won = (n: number, lang: Lang) => (lang === 'ko' ? `${n.toLocaleString('ko-KR')}원` : `KRW ${n.toLocaleString('en-US')}`);
const manwon = (n: number, lang: Lang) => (lang === 'ko' ? `${(n / 10000).toLocaleString('ko-KR')}만원` : `KRW ${n.toLocaleString('en-US')}`);

/** 담은 체험 카드 바로 아래에 겹쳐 열리는 옵션 팝오버 (그리드 너비, 꼬리로 카드를 가리킨다) */
function OptionsPopover({ itemKey, top, caretLeft, reducedMotion, onClose, onHeight, children }: {
  itemKey: ServiceKey; top: number; caretLeft: number; reducedMotion: boolean; onClose: () => void; onHeight: (height: number) => void; children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(() => onHeight(el.offsetHeight));
    observer.observe(el);
    return () => { observer.disconnect(); onHeight(0); };
  }, [onHeight]);
  useEffect(() => {
    // 팝오버·해당 카드·드롭다운 목록·설명 말풍선 밖을 누르면 닫는다
    const onDown = (event: PointerEvent) => {
      const target = event.target as Element | null;
      if (!target || ref.current?.contains(target)) return;
      if (target.closest(`[data-card-key="${itemKey}"], [data-site-select], [role="tooltip"]`)) return;
      onClose();
    };
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('pointerdown', onDown); document.removeEventListener('keydown', onKey); };
  }, [itemKey, onClose]);
  useEffect(() => {
    // 열린 팝오버가 화면 아래로 잘리면 보이도록 살짝 내려 준다
    const timer = window.setTimeout(() => ref.current?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'nearest' }), 320);
    return () => window.clearTimeout(timer);
  }, [reducedMotion]);
  return (
    <motion.div ref={ref} id={`quote-options-${itemKey}`} data-testid={`quote-options-${itemKey}`} role="region"
      initial={{ opacity: 0, y: reducedMotion ? 0 : -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reducedMotion ? 0 : 0.22, ease: softEase }}
      style={{ top }}
      className="absolute inset-x-0 z-30 scroll-mb-6 rounded-[20px] border border-teal-200 bg-white p-4 shadow-2xl shadow-slate-900/20 sm:p-5">
      <span aria-hidden="true" style={{ left: caretLeft }} className="absolute -top-[7px] size-3 -translate-x-1/2 rotate-45 border-t border-l border-teal-200 bg-white" />
      {children}
    </motion.div>
  );
}

const PRODUCT_BY_KEY = Object.fromEntries(PRODUCTS.map((p) => [p.key, p])) as Record<ServiceKey, (typeof PRODUCTS)[number]>;
const softEase = [0.22, 1, 0.36, 1] as const;
const primaryButton = 'inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-teal-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-teal-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400';

function AnimatedAmount({ value, lang, className, testId }: { value: number; lang: Lang; className?: string; testId?: string }) {
  const reducedMotion = useReducedMotion();
  const amount = useMotionValue(value);
  const formatted = useTransform(amount, (v) => won(Math.round(v), lang));
  useEffect(() => {
    const control = animate(amount, value, { duration: reducedMotion ? 0 : 0.45, ease: softEase });
    return () => control.stop();
  }, [amount, value, reducedMotion]);
  return (
    <span className={cn('tabular-nums tracking-tight', className)} data-testid={testId} data-amount={value}>
      <span className="sr-only">{won(value, lang)}</span>
      <motion.span aria-hidden="true">{formatted}</motion.span>
    </span>
  );
}

/* ── 본체 ───────────────────────────────────────────── */

export function QuoteStudio() {
  const locale = useLocale();
  const lang: Lang = locale === 'en' ? 'en' : 'ko';
  const c = QUOTE_COPY[lang];
  const tServices = useTranslations('services');
  const searchParams = useSearchParams();

  const [input, setInput] = useState<QuoteInput>(BLANK);
  const [presetId, setPresetId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const tracked = useRef(new Set<string>());
  const topRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [startView, setStartView] = useState<'choose' | 'templates'>('choose');
  // 행사 정보 단계의 두 쪽: 0 = 유형·인원·기간·지역, 1 = 날짜·운영 시간·인력·전날 설치
  const [conditionsPage, setConditionsPage] = useState<0 | 1>(0);
  const [activeOptions, setActiveOptions] = useState<ServiceKey | null>(null);
  const activeItem = input.items.find((i) => i.key === activeOptions) ?? null;
  // 옵션 팝오버: 고른 카드 바로 아래에 겹쳐 띄운다 (아래 내용을 밀지 않음)
  // 단계 전환 애니메이션 뒤에 카드 목록이 붙으므로, 붙는 순간을 알 수 있게 state 로 받는다
  const [cardGrid, setCardGrid] = useState<HTMLDivElement | null>(null);
  const [popoverPos, setPopoverPos] = useState<{ top: number; caret: number; gridHeight: number } | null>(null);
  const [popoverHeight, setPopoverHeight] = useState(0);
  // 팝오버가 카드 목록 아래로 넘치면 그만큼만 아래(다음 버튼 등)를 띄워 가리지 않게 한다 — 카드는 밀지 않는다
  const popoverOverflow = popoverPos ? Math.max(0, popoverPos.top + popoverHeight + 16 - popoverPos.gridHeight) : 0;
  useEffect(() => {
    const grid = cardGrid;
    if (!activeOptions || !grid) { setPopoverPos(null); return; }
    const place = () => {
      const card = grid.querySelector<HTMLElement>(`[data-card-key="${activeOptions}"]`);
      if (card) setPopoverPos({ top: card.offsetTop + card.offsetHeight + 12, caret: card.offsetLeft + card.offsetWidth / 2, gridHeight: grid.offsetHeight });
    };
    place();
    const observer = new ResizeObserver(place);
    observer.observe(grid);
    return () => observer.disconnect();
  }, [activeOptions, cardGrid, input.items.length]);
  const [furthestStep, setFurthestStep] = useState(0);
  const [contact, setContact] = useState({ name: '', email: '', company: '', phone: '', note: '', consent: false });
  const summaryRef = useRef<HTMLElement>(null);
  const focusStep = useRef<number | null>(null);
  const clearedSearch = useRef<string | null>(null);
  const reducedMotion = useReducedMotion();

  const track = useCallback((name: string, label?: string) => {
    const key = `${name}:${label ?? ''}`;
    if (tracked.current.has(key)) return;
    tracked.current.add(key);
    trackEvent(name, label);
  }, []);

  // 처음: ?preset= → ?service= → 저장된 견적 순으로 불러온다
  useEffect(() => {
    // 비우기로 주소만 정리했을 때는 이전 저장값을 다시 불러오지 않는다.
    if (clearedSearch.current === searchParams.toString()) {
      clearedSearch.current = null;
      return;
    }
    const presetParam = searchParams.get('preset');
    const serviceParam = searchParams.get('service');
    const itemParam = searchParams.get('item') as ServiceKey | null;
    const preset = QUOTE_PRESETS.find((p) => p.id === presetParam);
    let next: QuoteInput = loadSaved() ?? BLANK;
    if (preset) {
      next = structuredClone(preset.input);
      setPresetId(preset.id);
    } else if (itemParam && itemParam in SERVICE_TEXT) {
      // 홈·서비스 소개의 상품 카드에서 '견적에 담기'로 들어온 경우
      if (!next.items.some((i) => i.key === itemParam)) next = { ...next, items: [...next.items, defaultOptions(itemParam, next.attendees)] };
    } else if (serviceParam) {
      const exp = getExperienceBySlug(serviceParam);
      const key = serviceForExperience(serviceParam, exp?.pillar);
      if (key && !next.items.some((i) => i.key === key)) {
        const item = defaultOptions(key, next.attendees);
        if (item.key === 'rental') item.options.experienceSlug = serviceParam;
        next = { ...next, items: [...next.items, item] };
      } else if (key === 'rental') {
        // 이미 AI 키오스크가 담겨 있으면 들어온 체험으로 바꿔 준다
        next = { ...next, items: next.items.map((i) => (i.key === 'rental' ? { ...i, options: { ...i.options, experienceSlug: serviceParam } } : i)) };
      }
    }
    setInput(next);
    // 시나리오·상품·체험을 들고 왔으면 행사 조건(2단계)부터, 아니면 처음부터
    const initialStep = preset || serviceParam || itemParam ? 1 : 0;
    setStep(initialStep);
    setStartView('choose');
    setFurthestStep(initialStep);
    setActiveOptions(next.items[0]?.key ?? null);
    setReady(true);
    track('quote_view', preset ? `preset:${preset.id}` : itemParam ? `item:${itemParam}` : serviceParam ? `service:${serviceParam}` : undefined);
  }, [searchParams, track]);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(input));
    } catch {
      // 저장할 수 없는 환경이면 무시한다
    }
  }, [input, ready]);

  const quote = useMemo(() => calculateQuote(input, lang), [input, lang]);

  const STEP_KEYS = ['scenario', 'conditions', 'experiences', 'form'] as const;
  const goTo = (next: number) => {
    const target = Math.max(0, Math.min(3, next));
    // 뒤 단계에서 돌아오면 행사 정보의 둘째 쪽으로, 앞에서 들어오면 첫째 쪽으로
    if (target === 1) setConditionsPage(step > 1 ? 1 : 0);
    focusStep.current = target;
    setStep(target);
    setFurthestStep((previous) => Math.max(previous, target));
    if (target > 0) track('quote_step', STEP_KEYS[target]);
    // 새 단계의 맨 위가 보이게 한다
    requestAnimationFrame(() => {
      const el = topRef.current;
      if (el) el.scrollIntoView({ behavior: reducedMotion ? 'instant' : 'smooth', block: 'start' });
    });
  };
  const update = (patch: Partial<QuoteInput>) => {
    setInput((prev) => ({ ...prev, ...patch }));
    setStatus('idle');
  };
  const applyPreset = (id: string | null) => {
    const preset = QUOTE_PRESETS.find((p) => p.id === id);
    setPresetId(id);
    setInput(preset ? structuredClone(preset.input) : { ...BLANK });
    setActiveOptions(preset?.input.items[0]?.key ?? null);
    setStatus('idle');
    trackEvent('quote_preset', id ?? 'blank');
    goTo(1);
  };
  const showStartView = (view: 'choose' | 'templates') => {
    focusStep.current = 0;
    setStartView(view);
  };
  const toEstimate = () => goTo(input.items.length > 0 ? 3 : 2);
  const hasItem = (key: ServiceKey) => input.items.some((i) => i.key === key);
  const toggleItem = (key: ServiceKey) => {
    const removing = hasItem(key);
    setInput((prev) => prev.items.some((item) => item.key === key)
      ? { ...prev, items: prev.items.filter((i) => i.key !== key) }
      : { ...prev, items: [...prev.items, defaultOptions(key, prev.attendees)] });
    setActiveOptions(removing ? null : key);
    setStatus('idle');
    if (!removing) track('quote_step', `add_${key}`);
  };
  const setOptions: QuoteOptionsSetter = (key, patch) => {
    setStatus('idle');
    setInput((prev) => ({
      ...prev,
      items: prev.items.map((i) => (i.key === key ? ({ ...i, options: { ...i.options, ...patch } } as QuoteItem) : i)),
    }));
  };

  const kioskExperiences = useMemo(
    () => experiences
      .filter((e) => serviceForExperience(e.slug, e.pillar) === 'rental')
      .map((e) => ({ value: e.slug, label: tServices(e.nameKey) })),
    [tServices],
  );

  /* ── 폼 ── */
  const [status, setStatus] = useState<'idle' | 'pdf' | 'request' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');
  // 이 브라우저에서 발급한 가견적서 (다시 보기 링크)
  const [history, setHistory] = useState<EstimateHistoryItem[]>([]);
  const [doneLink, setDoneLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  useEffect(() => { setHistory(loadEstimateHistory()); }, []);
  const canClearQuote = input.items.length > 0 || input.eventType !== BLANK.eventType
    || input.eventDate !== BLANK.eventDate || input.days !== BLANK.days
    || input.hoursPerDay !== BLANK.hoursPerDay || input.attendees !== BLANK.attendees
    || input.region !== BLANK.region || input.extraStaff !== BLANK.extraStaff
    || input.setupDayBefore === true;

  const clearQuote = () => {
    if (!canClearQuote || status === 'pdf' || status === 'request') return;
    const empty = { ...BLANK, items: [] };
    setInput(empty);
    setPresetId(null);
    setStartView('choose');
    setActiveOptions(null);
    setConditionsPage(0);
    setFurthestStep(0);
    setStatus('idle');
    setMessage('');
    setDoneLink(null);
    setCopied(false);

    // 주소 변경보다 먼저 비운 내용을 저장해 새로고침해도 다시 담기지 않게 한다.
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(empty));
    } catch {
      // 저장이 막혀 있어도 현재 화면은 비울 수 있다.
    }
    const url = new URL(window.location.href);
    const previousSearch = url.search;
    for (const key of ['preset', 'item', 'service']) url.searchParams.delete(key);
    if (url.search !== previousSearch) {
      clearedSearch.current = url.searchParams.toString();
      window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
    }
    goTo(0);
    if (step === 0 && startView === 'choose') {
      requestAnimationFrame(() => {
        document.getElementById('q-step1')?.focus({ preventScroll: true });
        focusStep.current = null;
      });
    }
  };

  async function saveInquiry(form: { name: string; email: string; company: string; phone: string; note: string }, subject: string, estimate?: { no: string; token: string | null }) {
    // 담당자가 보는 수신함은 한국어로 남긴다 (영문 화면에서 보낸 견적도)
    const ko = calculateQuote(input, 'ko');
    const expName = (slug: string) => kioskExperiences.find((e) => e.value === slug)?.label;
    const items = input.items.map((item) => ({ name: SERVICE_TEXT[item.key].name.ko, options: optionSummary(item, 'ko', expName) }));
    const lines = ko.lines.map((l) => ({ label: l.label, detail: l.detail, amount: l.amount, ...(l.tbd ? { tbd: true } : {}) }));
    const services = ko.lines.map((l) => `${l.label} ${l.tbd ? '(상담 후 산정)' : won(l.amount, 'ko')}`);
    const eventLabel = EVENT_TYPES.find((e) => e.key === input.eventType)?.label.ko ?? input.eventType;
    const summary = [
      `${eventLabel} · ${input.eventDate || '일자 미정'} · ${input.days}일 × 1일 ${input.hoursPerDay}시간 · ${input.attendees}명 · ${REGIONS.find((r) => r.key === input.region)?.label.ko}`
        + `${input.setupDayBefore ? ' · 전날 설치' : ''}${input.extraStaff ? ` · 추가 인력 ${input.extraStaff}명` : ''}`,
      '',
      ...items.map((i) => `[${i.name}] ${i.options.join(' · ')}`),
      '',
      ...ko.lines.map((l) => `- ${l.label}: ${l.detail ? `${l.detail} = ` : ''}${l.tbd ? '상담 후 산정' : won(l.amount, 'ko')}`),
      `공급가 ${won(ko.supply, 'ko')} / VAT ${won(ko.vat, 'ko')} / 합계 ${won(ko.total, 'ko')}`,
      ...ko.warnings.map((w) => `※ ${w}`),
      form.note ? `\n요청사항: ${form.note}` : '',
    ].join('\n');
    await createInquiry({
      kind: 'quote',
      name: form.name,
      email: form.email,
      phone: form.phone || undefined,
      company: form.company || undefined,
      subject,
      message: summary.slice(0, 4900),
      locale,
      quote: {
        eventType: eventLabel,
        eventDate: input.eventDate || undefined,
        duration: input.days,
        hoursPerDay: input.hoursPerDay,
        expectedAttendees: input.attendees,
        location: REGIONS.find((r) => r.key === input.region)?.label.ko,
        setupDayBefore: input.setupDayBefore === true,
        extraStaff: input.extraStaff,
        services: services.slice(0, 30),
        addOns: [],
        items,
        lines: lines.slice(0, 40),
        supply: ko.supply,
        vat: ko.vat,
        estimatedTotal: ko.total,
        estimateNo: estimate?.no || undefined,
        estimateToken: estimate?.token || undefined,
      },
    });
  }

  // 발급한 가견적서를 이 브라우저 목록에 남기고, 완료 화면에 다시 보기 링크를 띄운다
  const rememberEstimate = (no: string, token: string | null) => {
    if (!token) return;
    const names = input.items.map((i) => SERVICE_TEXT[i.key].name[lang]).join(' · ');
    addEstimateHistory({ no, issuedAt: new Date().toISOString(), total: quote.total, token, summary: names });
    setHistory(loadEstimateHistory());
    setDoneLink(estimateHref(token));
  };

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const action = submitter?.value === 'request' ? 'request' : 'pdf';
    const fd = new FormData(e.currentTarget);
    const form = {
      name: String(fd.get('name') ?? '').trim(),
      email: String(fd.get('email') ?? '').trim(),
      company: String(fd.get('company') ?? '').trim(),
      phone: String(fd.get('phone') ?? '').trim(),
      note: String(fd.get('note') ?? '').trim(),
    };
    if (input.items.length === 0) { setStatus('error'); setMessage(c.needItems); return; }
    if (!form.name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email) || fd.get('consent') !== 'on') {
      setStatus('error'); setMessage(c.required); return;
    }
    setStatus(action);
    try {
      if (action === 'pdf') {
        const res = await fetch('/api/quote-pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ input, lang, recipient: { name: form.name, email: form.email, company: form.company, phone: form.phone } }),
        });
        if (!res.ok) throw new Error(String(res.status));
        const no = res.headers.get('X-Estimate-No') ?? '';
        const token = res.headers.get('X-Estimate-Token');
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `neander-estimate-${no || 'draft'}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 30_000);
        trackEvent('quote_pdf', no);
        // 수신함 기록은 PDF 발급을 막지 않는다
        saveInquiry(form, `가견적서 발급 ${no}`, { no, token }).then(() => trackEvent('inquiry_submit', 'quote')).catch(() => {});
        rememberEstimate(no, token);
        setStatus('done'); setMessage(c.pdfDone(no));
      } else {
        // 담당자가 수신함에서 같은 견적서를 볼 수 있게 견적번호·링크를 함께 남긴다 (실패해도 요청은 보낸다)
        const issued = await fetch('/api/quote-pdf?mode=token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ input, lang, recipient: { name: form.name, email: form.email, company: form.company, phone: form.phone } }),
        }).then((r) => (r.ok ? (r.json() as Promise<{ no: string; token: string | null }>) : null)).catch(() => null);
        await saveInquiry(form, issued?.no ? `확정 견적 요청 ${issued.no}` : '확정 견적 요청', issued ?? undefined);
        if (issued?.no) rememberEstimate(issued.no, issued.token);
        trackEvent('quote_request');
        trackEvent('inquiry_submit', 'quote');
        setStatus('done'); setMessage(c.requestDone);
      }
    } catch {
      setStatus('error'); setMessage(c.error);
    }
  }

  const selectedPreset = QUOTE_PRESETS.find((preset) => preset.id === presetId);
  const selectedPresetImage = selectedPreset ? QUOTE_PRESET_IMAGES[selectedPreset.id] : undefined;
  const selectedImage = selectedPresetImage?.src || PRODUCT_BY_KEY[input.items[0]?.key ?? 'acscent'].image;
  const stepHeadings = [startView === 'templates' ? c.templateTitle : c.step1, conditionsPage === 1 ? c.step2b : c.step2, c.step3, c.step4];
  const stepHints = [startView === 'templates' ? c.templateHint : c.step1Hint, conditionsPage === 1 ? c.step2bHint : (lang === 'ko' ? '아직 정해지지 않았다면 대략 선택해도 괜찮아요.' : 'An approximate answer is fine. You can change it later.'), c.step3Hint, c.step4Hint];
  const scrollToTop = () => requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: reducedMotion ? 'instant' : 'smooth', block: 'start' }));
  const moveForward = () => {
    if (step === 0) return;
    if (step === 1 && conditionsPage === 0) {
      focusStep.current = 1;
      setConditionsPage(1);
      track('quote_step', 'conditions_detail');
      scrollToTop();
      return;
    }
    if (step < 3) goTo(step + 1);
    else topRef.current?.scrollIntoView({ behavior: reducedMotion ? 'instant' : 'smooth', block: 'start' });
  };
  const nextLabel = step === 1
    ? (conditionsPage === 0 ? c.next : (lang === 'ko' ? '체험 고르기' : 'Choose experiences'))
    : step === 2 ? (lang === 'ko' ? '이 구성으로 견적 받기' : 'Continue with these experiences') : c.next;
  const nav = (canNext = true) => (
    <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-6">
      <button type="button" data-testid="quote-prev" onClick={() => { if (step === 1 && conditionsPage === 1) { focusStep.current = 1; setConditionsPage(0); scrollToTop(); } else goTo(step - 1); }} className="inline-flex min-h-12 items-center gap-2 rounded-xl px-3 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800">
        <ArrowLeft className="size-4" aria-hidden="true" />{c.prev}
      </button>
      <button type="button" data-testid="quote-next" disabled={!canNext} onClick={moveForward} className={primaryButton}>
        {nextLabel}<ArrowRight className="size-4" aria-hidden="true" />
      </button>
      {!canNext && <p className="w-full text-right text-xs text-slate-500">{c.needItemsNext}</p>}
    </div>
  );

  if (!ready) return <div className="h-96 animate-pulse rounded-3xl bg-white motion-reduce:animate-none" aria-busy="true" />;

  return (
    <MotionConfig reducedMotion="user">
      <div data-testid="quote-studio" className={cn('grid min-w-0 grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-7 lg:pb-0', step > 0 && 'pb-28')}>
        <div ref={topRef} className="min-w-0 scroll-mt-28 rounded-[28px] bg-white p-5 shadow-[0_4px_32px_-16px_rgba(15,23,42,0.12)] sm:p-8">
          <nav aria-label={lang === 'ko' ? '견적 만들기 단계' : 'Estimate steps'}>
            <ol className="mb-9 grid grid-cols-4 gap-2 sm:gap-4">
              {c.stepLabels.map((label, index) => {
                const done = index < step;
                const current = index === step;
                const reachable = index <= furthestStep && (index !== 3 || input.items.length > 0);
                return (
                  <li key={index}>
                    <button type="button" disabled={!reachable} onClick={() => goTo(index)} aria-current={current ? 'step' : undefined}
                      className="group flex w-full flex-col items-start gap-2.5 rounded-sm text-left disabled:cursor-default">
                      <span className={cn('inline-flex size-7 items-center justify-center rounded-full text-[11px] font-bold transition-colors duration-300', current ? 'bg-teal-600 text-white' : done ? 'bg-teal-50 text-teal-700' : 'bg-slate-100 text-slate-400')}>
                        {done ? <CheckIcon className="size-3.5" aria-hidden="true" /> : index + 1}
                      </span>
                      <span className={cn('text-[11px] font-semibold sm:text-xs', current ? 'text-slate-900' : done ? 'text-slate-600' : 'text-slate-400')}>{label}</span>
                      <span className="relative h-1 w-full overflow-hidden rounded-full bg-slate-100">
                        <motion.span className="absolute inset-y-0 left-0 rounded-full bg-teal-500" animate={{ width: index <= step ? '100%' : '0%' }} transition={{ duration: reducedMotion ? 0 : 0.4, ease: softEase }} />
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>

          <AnimatePresence mode="wait" initial={false}>
            <motion.section key={step === 0 ? `start-${startView}` : step === 1 ? `1-${conditionsPage}` : step} data-quote-page={step === 1 ? conditionsPage + 1 : undefined} data-quote-step={step} data-quote-start-view={step === 0 ? startView : undefined} aria-labelledby={`q-step${step + 1}`}
              initial={{ opacity: 0, y: reducedMotion ? 0 : 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reducedMotion ? 0 : -6 }}
              transition={{ duration: reducedMotion ? 0 : 0.22, ease: softEase }}
              onAnimationComplete={(definition) => {
                if (typeof definition === 'object' && 'opacity' in definition && definition.opacity === 1 && focusStep.current === step) {
                  document.getElementById(`q-step${step + 1}`)?.focus({ preventScroll: true });
                  focusStep.current = null;
                }
              }}>
              <div className="mb-7">
                <p className="mb-2 text-xs font-semibold text-teal-600">{c.stepCount(step + 1, 4)}</p>
                <h2 id={`q-step${step + 1}`} tabIndex={-1} style={{ outline: 'none' }} className="text-2xl font-bold leading-snug tracking-tight text-slate-900 sm:text-[28px]">{stepHeadings[step]}</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-500 [word-break:keep-all]">{stepHints[step]}</p>
              </div>

              {step === 0 && (
                <>
                  {history.length > 0 && (
                    <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4">
                      <p className="text-sm font-semibold text-slate-800">{c.recentTitle}</p>
                      <ul className="mt-2 divide-y divide-slate-100">
                        {history.slice(0, 3).map((h) => (
                          <li key={h.no} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                            <span className="min-w-0 text-slate-600"><b className="text-slate-800">{h.no}</b> · {h.issuedAt.slice(0, 10)} · {h.summary}</span>
                            <span className="flex items-center gap-3">
                              <span className="tabular-nums font-semibold text-slate-900">{won(h.total, lang)}</span>
                              <a href={estimateHref(h.token)} className="text-sm font-semibold text-teal-700 underline underline-offset-4">{c.viewSaved}</a>
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {input.items.length > 0 && (
                    <button type="button" onClick={() => goTo(2)} className="mb-5 flex w-full items-center justify-between gap-3 rounded-2xl bg-teal-50 px-4 py-3 text-left text-sm font-medium text-teal-800">
                      <span>{lang === 'ko' ? `담아 둔 체험 ${input.items.length}개가 있어요. 이어서 만들어 볼까요?` : `You have ${input.items.length} saved experiences. Continue editing.`}</span><ArrowRight className="size-4 shrink-0" aria-hidden="true" />
                    </button>
                  )}
                  {startView === 'choose' ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <motion.button type="button" data-testid="quote-start-blank" onClick={() => applyPreset(null)} whileHover={reducedMotion ? undefined : { y: -3 }} whileTap={reducedMotion ? undefined : { scale: 0.985 }}
                        className="group grid h-full grid-cols-[48px_1fr] gap-x-4 rounded-[24px] border border-slate-200/80 bg-slate-50/70 p-5 text-left transition-colors hover:border-teal-200 hover:bg-teal-50/40 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-600 sm:flex sm:flex-col sm:p-7">
                        <span className="row-span-2 flex size-12 items-center justify-center rounded-[18px] bg-white text-slate-600 shadow-sm sm:mb-6 sm:size-14"><SlidersHorizontal className="size-6" aria-hidden="true" /></span>
                        <span className="flex w-full items-center justify-between gap-3 text-lg font-bold tracking-tight text-slate-900">{c.startBlank}<ArrowRight className="size-5 shrink-0 text-slate-400 transition-transform group-hover:translate-x-1 motion-reduce:transform-none" aria-hidden="true" /></span>
                        <span className="mt-2 block text-sm leading-relaxed text-slate-500 [word-break:keep-all]">{c.startBlankHint}</span>
                      </motion.button>
                      <motion.button type="button" data-testid="quote-start-templates" onClick={() => showStartView('templates')} whileHover={reducedMotion ? undefined : { y: -3 }} whileTap={reducedMotion ? undefined : { scale: 0.985 }}
                        className="group grid h-full grid-cols-[48px_1fr] gap-x-4 rounded-[24px] border border-teal-100 bg-teal-50/60 p-5 text-left transition-colors hover:border-teal-300 hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-600 sm:flex sm:flex-col sm:p-7">
                        <span className="row-span-2 flex size-12 items-center justify-center rounded-[18px] bg-white text-teal-600 shadow-sm sm:mb-6 sm:size-14"><LayoutTemplate className="size-6" aria-hidden="true" /></span>
                        <span className="flex w-full items-center justify-between gap-3 text-lg font-bold tracking-tight text-slate-900">{c.startTemplates}<ArrowRight className="size-5 shrink-0 text-teal-500 transition-transform group-hover:translate-x-1 motion-reduce:transform-none" aria-hidden="true" /></span>
                        <span className="mt-2 block text-sm leading-relaxed text-slate-500 [word-break:keep-all]">{c.startTemplatesHint}</span>
                      </motion.button>
                    </div>
                  ) : (
                    <>
                    <button type="button" data-testid="quote-back-to-start" onClick={() => showStartView('choose')} className="mb-4 inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600">
                      <ArrowLeft className="size-4" aria-hidden="true" />{c.backToStart}
                    </button>
                    <div className="grid gap-4 sm:grid-cols-2">
                    {QUOTE_PRESETS.map((preset) => {
                      const thumbnail = QUOTE_PRESET_IMAGES[preset.id];
                      return (
                        <motion.button key={preset.id} type="button" data-testid={`quote-preset-${preset.id}`} onClick={() => applyPreset(preset.id)} aria-pressed={presetId === preset.id}
                          whileHover={reducedMotion ? undefined : { y: -3 }} whileTap={reducedMotion ? undefined : { scale: 0.985 }}
                          className="group overflow-hidden rounded-[20px] bg-slate-50 text-left ring-1 ring-slate-100 transition-shadow hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-600">
                          <span className="relative block aspect-[2.2/1] overflow-hidden bg-slate-100">
                            <Image src={thumbnail.src} alt={thumbnail.caption[lang]} fill sizes="(min-width: 1280px) 360px, (min-width: 640px) 40vw, 90vw" style={{ objectPosition: thumbnail.objectPosition }} className="object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transform-none" />
                            <span className="absolute bottom-2 left-3 rounded-full bg-black/60 px-2 py-1 text-[9px] text-white">{thumbnail.caption[lang]}</span>
                          </span>
                          <span className="block p-4">
                            <span className="flex items-center justify-between gap-2 text-base font-bold text-slate-900">{preset.title[lang]}<ChevronRight className="size-4 shrink-0 text-slate-400" aria-hidden="true" /></span>
                            <span className="mt-1.5 block min-h-[2lh] text-xs leading-relaxed text-slate-500">{preset.caption[lang]}</span>
                            <span className="mt-3 block text-sm font-bold tabular-nums text-teal-700">{manwon(calculateQuote(preset.input, lang).supply, lang)} <span className="text-[10px] font-normal text-slate-400">{lang === 'ko' ? '부가세 별도' : 'excl. VAT'}</span></span>
                          </span>
                        </motion.button>
                      );
                    })}
                    </div>
                    </>
                  )}
                  <p className="mt-5 flex items-center gap-2 text-xs text-slate-400"><ShieldCheck className="size-4 shrink-0" aria-hidden="true" />{lang === 'ko' ? '연락처를 입력하지 않아도 금액을 확인할 수 있어요.' : 'See prices without sharing your contact details.'}</p>
                </>
              )}

              {step === 1 && (
                <>
                  {input.items.length > 0 && (
                    <div className="mb-7 flex items-center gap-4 rounded-2xl bg-slate-50 p-3">
                      <div className="relative size-16 shrink-0 overflow-hidden rounded-xl"><Image src={selectedImage} alt="" fill sizes="64px" style={{ objectPosition: selectedPresetImage?.objectPosition }} className="object-cover" /></div>
                      <div className="min-w-0"><p className="text-xs text-slate-500">{lang === 'ko' ? '이 구성으로 시작해요' : 'Your starting point'}</p><p className="mt-1 text-sm font-semibold text-slate-800">{selectedPreset?.title[lang] ?? input.items.map((item) => SERVICE_TEXT[item.key].name[lang]).join(' · ')}</p></div>
                    </div>
                  )}
                  <p className="mb-6 text-xs font-semibold text-teal-700">{lang === 'ko' ? `행사 정보 ${conditionsPage + 1}/2` : `Event details ${conditionsPage + 1}/2`}</p>
                  {conditionsPage === 0 ? (
                  <div className="grid gap-x-5 gap-y-7 sm:grid-cols-2">
                    <Field label={c.eventType}><Select id="q-type" aria-label={c.eventType} value={input.eventType} onValueChange={(value) => update({ eventType: value })} triggerClassName={inputClass} options={EVENT_TYPES.map((event) => ({ value: event.key, label: event.label[lang] }))} /></Field>
                    <Field label={c.attendees} hint={lang === 'ko' ? '행사 전체 기간에 방문할 인원이에요.' : 'Total guests across all event days.'}><Stepper id="q-attendees" value={input.attendees} min={1} max={100000} step={50} suffix={lang === 'ko' ? '명' : 'guests'} onChange={(value) => update({ attendees: value })} /></Field>
                    <Field label={c.days}><Stepper id="q-days" value={input.days} min={1} max={60} suffix={lang === 'ko' ? '일' : 'days'} onChange={(value) => update({ days: value })} /></Field>
                    <Field label={c.region} hint={REGION_NOTE[lang]}><Segmented name={c.region} value={input.region} onChange={(value) => update({ region: value as RegionKey })} options={REGIONS.map((region) => ({ value: region.key, label: region.label[lang] }))} /></Field>
                  </div>
                  ) : (
                  <div className="grid gap-x-5 gap-y-7 sm:grid-cols-2">
                    <Field label={c.eventDate} hint={lang === 'ko' ? '정해지지 않았다면 비워 두어도 괜찮아요.' : 'Leave blank if not decided yet.'}><DatePicker id="q-date" locale={lang} value={input.eventDate} onChange={(value) => update({ eventDate: value })} inputClassName={inputClass} /></Field>
                    <Field label={c.hours} hint={c.hoursHint}><Stepper id="q-hours" value={input.hoursPerDay} min={1} max={14} onChange={(value) => update({ hoursPerDay: value })} /></Field>
                    <Field label={c.staff} hint={c.staffHint}><Stepper id="q-staff" value={input.extraStaff} min={0} max={30} onChange={(value) => update({ extraStaff: value })} /></Field>
                    <Field label={c.setup} hint={c.setupHint}><Check id="q-setup" checked={input.setupDayBefore === true} onChange={(value) => update({ setupDayBefore: value })} label={c.setupLabel} /></Field>
                  </div>
                  )}
                  {nav()}
                </>
              )}

              {step === 2 && (
                <>
                  <div ref={setCardGrid} style={{ marginBottom: popoverOverflow }} className="relative grid grid-cols-1 gap-4 min-[480px]:grid-cols-2">
                    {SERVICE_ORDER.map((key) => {
                      const product = PRODUCT_BY_KEY[key];
                      const selected = hasItem(key);
                      const expanded = selected && activeOptions === key;
                      return (
                        <div key={key} data-card-key={key} className="relative flex">
                        <motion.button type="button" data-testid={`quote-add-${key}`} aria-pressed={selected}
                          onClick={() => toggleItem(key)} whileTap={reducedMotion ? undefined : { scale: 0.985 }}
                          className={cn('group flex w-full overflow-hidden rounded-[20px] text-left ring-2 transition-[box-shadow,background-color] duration-200 min-[480px]:flex-col', selected ? 'bg-teal-50/50 ring-teal-500' : 'bg-slate-50/70 ring-transparent hover:ring-slate-200', expanded && 'shadow-lg shadow-teal-900/10')}>
                          <span className="relative block w-24 shrink-0 self-stretch overflow-hidden bg-slate-100 min-[480px]:aspect-[2/1] min-[480px]:w-full">
                            <Image src={product.image} alt={product.caption[lang]} fill sizes="(min-width: 1280px) 360px, (min-width: 480px) 42vw, 90vw" className="object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transform-none" />
                            <span className="absolute right-2 bottom-2 left-2 rounded-lg bg-black/60 px-2 py-1 text-[9px] text-white min-[480px]:right-auto min-[480px]:left-3 min-[480px]:rounded-full"><span className="line-clamp-2 min-[480px]:line-clamp-none">{product.caption[lang]}</span></span>
                            <span className={cn('absolute right-3 top-3 flex size-7 items-center justify-center rounded-full shadow-sm', selected ? 'bg-teal-500 text-white' : 'bg-white text-slate-500')}>
                              {selected
                                ? <><CheckIcon className="size-4 group-hover:hidden" aria-hidden="true" /><X className="hidden size-4 group-hover:block" aria-hidden="true" /></>
                                : <Plus className="size-4" aria-hidden="true" />}
                            </span>
                          </span>
                          <span className="flex min-w-0 flex-1 flex-col p-3.5 min-[480px]:p-4">
                            <span className="text-base font-bold tracking-tight text-slate-900">{SERVICE_TEXT[key].name[lang]}</span>
                            <span className="mt-1.5 line-clamp-2 flex-1 text-xs leading-relaxed text-slate-500 min-[480px]:line-clamp-none">{SERVICE_TEXT[key].summary[lang]}</span>
                            <span className="mt-4 flex flex-wrap items-center justify-between gap-2">
                              <span className="text-sm font-bold tabular-nums text-slate-800">{lang === 'en' && <span className="mr-1 text-xs font-normal text-slate-500">{c.from}</span>}{manwon(startingPrice(key), lang)}{lang === 'ko' && <span className="ml-1 text-xs font-normal text-slate-500">{c.from}</span>}</span>
                              {!selected && <span className="text-xs font-semibold text-slate-500">{c.add}</span>}
                            </span>
                          </span>
                        </motion.button>
                        {/* 담은 카드를 다시 누르면 빠지고, 옵션은 이 버튼으로 연다 (버튼 안에 버튼을 둘 수 없어 겹쳐 둔다) */}
                        {selected && (
                          <button type="button" data-testid={`quote-edit-${key}`} aria-expanded={expanded} aria-controls={`quote-options-${key}`}
                            onClick={() => setActiveOptions(expanded ? null : key)}
                            className="absolute right-2 bottom-2 inline-flex h-9 items-center gap-1 rounded-full px-2.5 text-xs font-semibold text-teal-700 hover:bg-teal-100/70 focus-visible:outline-2 focus-visible:outline-teal-600 min-[480px]:right-2.5 min-[480px]:bottom-2.5">
                            {expanded ? (lang === 'ko' ? '옵션 닫기' : 'Hide options') : (lang === 'ko' ? '옵션 정하기' : 'Set options')}
                            <ChevronDown className={cn('size-3.5 transition-transform duration-300 motion-reduce:transition-none', expanded && 'rotate-180')} aria-hidden="true" />
                          </button>
                        )}
                        </div>
                      );
                    })}
                        {activeItem && popoverPos && (
                          <OptionsPopover key={`options-${activeItem.key}`} itemKey={activeItem.key}
                            top={popoverPos.top} caretLeft={popoverPos.caret} onHeight={setPopoverHeight}
                            reducedMotion={!!reducedMotion}
                            onClose={() => setActiveOptions(null)}>
                            <div className="mb-5 flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-slate-900">{SERVICE_TEXT[activeItem.key].name[lang]} <span className="font-medium text-slate-500">{lang === 'ko' ? '· 수량과 추가 옵션' : '· quantities & extras'}</span></p>
                                <p className="mt-1 text-xs leading-relaxed text-slate-500">{lang === 'ko' ? '고르는 대로 견적 금액에 바로 반영돼요.' : 'Changes update your estimate right away.'}</p>
                              </div>
                              <div className="flex shrink-0 items-center gap-1">
                                <button type="button" data-testid={`quote-remove-${activeItem.key}`} onClick={() => toggleItem(activeItem.key)}
                                  className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-slate-500 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="size-3.5" aria-hidden="true" />{c.remove}</button>
                                <button type="button" aria-label={lang === 'ko' ? '옵션 닫기' : 'Close options'} onClick={() => setActiveOptions(null)}
                                  className="flex size-9 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X className="size-4" aria-hidden="true" /></button>
                              </div>
                            </div>
                            <QuoteOptions item={activeItem} lang={lang} c={c} kioskExperiences={kioskExperiences} setOptions={setOptions} />
                          </OptionsPopover>
                        )}
                  </div>
                  <p className="mt-3 text-xs text-slate-400">{lang === 'ko' ? '시작가는 부가세 별도예요. 담은 체험을 다시 누르면 빠지고, 옵션은 \'옵션 정하기\'에서 바꿀 수 있어요.' : 'Starting prices exclude VAT. Tap a selected experience again to remove it; use “Set options” to adjust it.'}</p>
                  {nav(input.items.length > 0)}
                </>
              )}

              {step === 3 && (
                <>
                  <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">{ESTIMATE_DISCLAIMER[lang]}</p>
                  <div className="mb-7 flex items-center gap-4 rounded-2xl bg-teal-50/80 p-4">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white text-teal-600"><FileText className="size-6" aria-hidden="true" /></span>
                    <div><p className="text-sm font-semibold text-teal-900">{lang === 'ko' ? '내부 검토용 견적서가 필요하신가요?' : 'Need an estimate to share with your team?'}</p><p className="mt-1 text-xs leading-relaxed text-teal-700">{lang === 'ko' ? '이름과 이메일을 적으면 PDF를 바로 받을 수 있어요.' : 'Enter your name and email to download a PDF.'}</p></div>
                  </div>
                  {status === 'done' ? (
                    <div className="rounded-2xl bg-teal-50 p-6 text-sm leading-relaxed text-teal-900" role="status">
                      <CheckIcon className="mb-3 size-7 text-teal-600" aria-hidden="true" />{message}
                      {doneLink && (
                        <div className="mt-4 space-y-2">
                          <p className="text-xs text-teal-800">{c.savedLinkHint}</p>
                          <div className="flex flex-wrap gap-2">
                            <a href={doneLink} target="_blank" rel="noopener" className="inline-flex h-10 items-center rounded-xl bg-teal-600 px-4 text-sm font-semibold text-white hover:bg-teal-500">{c.viewSaved}</a>
                            <button type="button" onClick={() => { navigator.clipboard?.writeText(`${window.location.origin}${doneLink}`).then(() => setCopied(true)).catch(() => {}); }}
                              className="inline-flex h-10 items-center rounded-xl bg-white px-4 text-sm font-semibold text-teal-800 ring-1 ring-teal-200 hover:bg-teal-50">{copied ? c.linkCopied : c.copyLink}</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <form onSubmit={onSubmit} noValidate className="space-y-5">
                      <div className="grid gap-5 sm:grid-cols-2">
                        <Field label={`${c.name} *`}><input id="q-name" name="name" autoComplete="name" required maxLength={60} value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} className={inputClass} /></Field>
                        <Field label={`${c.email} *`}><input id="q-email" name="email" type="email" autoComplete="email" required maxLength={200} value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} className={inputClass} /></Field>
                        <Field label={c.company}><input id="q-company" name="company" autoComplete="organization" maxLength={80} value={contact.company} onChange={(e) => setContact({ ...contact, company: e.target.value })} className={inputClass} /></Field>
                        <Field label={c.phone}><input id="q-phone" name="phone" type="tel" autoComplete="tel" maxLength={40} value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} className={inputClass} /></Field>
                      </div>
                      <Field label={c.message}><textarea id="q-note" name="note" rows={3} maxLength={1000} value={contact.note} onChange={(e) => setContact({ ...contact, note: e.target.value })} className={cn(inputClass, 'h-auto py-3')} /></Field>
                      <label className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4 text-xs leading-relaxed text-slate-500"><Checkbox name="consent" required checked={contact.consent} onChange={(e) => setContact({ ...contact, consent: e.target.checked })} className="mt-0.5 size-4" /><span>{c.consent} <Link href="/privacy" className="font-medium text-teal-700 underline underline-offset-2">{c.privacy}</Link></span></label>
                      {status === 'error' && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600" role="alert">{message}</p>}
                      <div className="flex flex-col gap-3">
                        <button type="submit" value="pdf" disabled={status === 'pdf' || status === 'request'} className={primaryButton}><FileDown className="size-4" aria-hidden="true" />{status === 'pdf' ? c.pdfBusy : c.pdf}</button>
                        <button type="submit" value="request" disabled={status === 'pdf' || status === 'request'} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-slate-100 px-5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-200 disabled:opacity-60">{status === 'request' ? c.requestBusy : c.request}<ArrowRight className="size-4" aria-hidden="true" /></button>
                      </div>
                    </form>
                  )}
                  <button type="button" data-testid="quote-prev" onClick={() => goTo(2)} className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm font-medium text-slate-500 hover:bg-slate-50"><ArrowLeft className="size-4" aria-hidden="true" />{lang === 'ko' ? '체험 구성 다시 보기' : 'Review experiences'}</button>
                </>
              )}
            </motion.section>
          </AnimatePresence>
        </div>

        <aside ref={summaryRef} className="min-w-0 scroll-mt-28 lg:sticky lg:top-28" aria-label={c.sheetTitle}>
          <div className="overflow-hidden rounded-[28px] bg-white p-6 shadow-[0_4px_32px_-16px_rgba(15,23,42,0.12)]">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-base font-bold text-slate-800">{c.sheetTitle}</h2>
                <span className="mt-1 inline-flex items-center gap-1.5 text-[10px] font-medium text-teal-600"><span className="size-1.5 rounded-full bg-teal-500" />{lang === 'ko' ? '실시간 반영' : 'Updates live'}</span>
              </div>
              <button type="button" data-testid="quote-clear" onClick={clearQuote} disabled={!canClearQuote || status === 'pdf' || status === 'request'}
                className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-xl px-2.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 disabled:cursor-default disabled:text-slate-300 disabled:hover:bg-transparent motion-reduce:transition-none">
                <Trash2 className="size-3.5" aria-hidden="true" />{c.clearQuote}
              </button>
            </div>
            {input.items.length === 0 ? (
              <div className="py-8 text-center">
                <div className="mb-5 flex justify-center -space-x-3" aria-hidden="true">{(['acscent', 'photoBooth', 'rental'] as const).map((key, index) => <div key={key} className={cn('relative size-20 overflow-hidden rounded-2xl border-4 border-white shadow-sm', index === 0 ? '-rotate-12' : index === 2 ? 'rotate-12' : 'z-10 -translate-y-2')}><Image src={PRODUCT_BY_KEY[key].image} alt="" fill sizes="80px" className="object-cover" /></div>)}</div>
                <p className="text-sm font-semibold text-slate-700">{lang === 'ko' ? '어떤 경험을 함께 만들까요?' : 'What will you create?'}</p><p className="mx-auto mt-2 max-w-52 text-xs leading-relaxed text-slate-400">{c.sheetEmpty}</p>
              </div>
            ) : (
              <ul className="my-5 space-y-4">
                {input.items.map((item) => {
                  const lines = quote.lines.filter((line) => line.service === item.key);
                  const amount = lines.reduce((sum, line) => sum + (line.tbd ? 0 : line.amount), 0);
                  const tbd = lines.some((line) => line.tbd);
                  return <li key={item.key} className="flex items-start gap-3"><span className="relative size-11 shrink-0 overflow-hidden rounded-xl"><Image src={PRODUCT_BY_KEY[item.key].image} alt="" fill sizes="44px" className="object-cover" /></span><div className="min-w-0 flex-1"><p className="text-xs font-medium text-slate-600">{SERVICE_TEXT[item.key].name[lang]}</p><p className="mt-1 text-sm font-bold tabular-nums text-slate-800">{amount > 0 ? won(amount, lang) : c.tbd}</p><p className="mt-1 text-[11px] leading-relaxed text-slate-400">{optionSummary(item, lang, (slug) => kioskExperiences.find((e) => e.value === slug)?.label).join(' · ')}</p>{tbd && amount > 0 && <p className="mt-1 text-[10px] text-amber-700">+ {c.tbd}</p>}</div><button type="button" aria-label={`${SERVICE_TEXT[item.key].name[lang]} ${lang === 'ko' ? '옵션 수정' : 'edit options'}`} onClick={() => { setActiveOptions(item.key); goTo(2); }} className="flex size-9 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-50 hover:text-teal-600"><ChevronRight className="size-4" aria-hidden="true" /></button></li>;
                })}
              </ul>
            )}
            <div className="rounded-2xl bg-slate-50 p-4">
              <dl className="space-y-2 text-xs text-slate-500"><div className="flex flex-wrap justify-between gap-2"><dt>{c.supply}</dt><dd className="tabular-nums">{won(quote.supply, lang)}</dd></div><div className="flex flex-wrap justify-between gap-2"><dt>{c.vat}</dt><dd className="tabular-nums">{won(quote.vat, lang)}</dd></div></dl>
              <div className="mt-4 border-t border-slate-200/60 pt-4"><p className="text-xs font-semibold text-slate-600">{c.mobileTotal}</p><p className="mt-1.5 break-words text-[26px] font-bold leading-tight text-slate-900"><AnimatedAmount value={quote.total} lang={lang} testId="quote-total" /></p><p className="mt-2 text-[10px] text-slate-400">{lang === 'ko' ? '부가세 포함 · 선택한 옵션 기준' : 'Including VAT · based on your selections'}</p><p data-testid="quote-disclaimer" className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-[11px] leading-relaxed text-amber-900">{ESTIMATE_DISCLAIMER[lang]}</p></div>
            </div>
            {quote.lines.length > 0 && <details className="group mt-4"><summary className="flex min-h-10 cursor-pointer list-none items-center justify-between gap-2 text-xs font-medium text-slate-500 [&::-webkit-details-marker]:hidden">{lang === 'ko' ? '상세 금액 보기' : 'Price breakdown'}<ChevronDown className="size-3.5 transition-transform group-open:rotate-180" aria-hidden="true" /></summary><ul className="max-h-72 space-y-4 overflow-y-auto border-t border-slate-100 py-4" data-lenis-prevent>{quote.lines.map((line, index) => <li key={index} className="text-xs"><div className="flex flex-wrap justify-between gap-1.5"><p className="text-slate-600">{line.label}</p><span className="font-semibold tabular-nums text-slate-800">{line.tbd ? c.tbd : won(line.amount, lang)}</span></div>{line.detail && <p className="mt-1 text-[11px] leading-relaxed text-slate-400">{line.detail}</p>}</li>)}</ul></details>}
            {quote.warnings.length > 0 && <ul className="mt-4 space-y-2 rounded-xl bg-amber-50 p-3 text-[11px] leading-relaxed text-amber-800" role="status">{quote.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul>}
            {quote.notes.length > 0 && <details className="group mt-2"><summary className="flex min-h-10 cursor-pointer list-none items-center justify-between text-xs text-slate-400 [&::-webkit-details-marker]:hidden">{lang === 'ko' ? '이 구성의 안내사항' : 'Notes for this estimate'}<ChevronDown className="size-3.5 group-open:rotate-180" aria-hidden="true" /></summary><div className="space-y-2 pb-3 text-[11px] leading-relaxed text-slate-500">{quote.notes.map((note) => <p key={note}>{note}</p>)}</div></details>}
            <button type="button" onClick={toEstimate} disabled={input.items.length === 0} className={cn(primaryButton, 'mt-5 w-full')}><FileDown className="size-4" aria-hidden="true" />{c.toForm}</button>
            <p className="mt-3 text-center text-[10px] leading-relaxed text-slate-400">{lang === 'ko' ? '선택 내용은 이 브라우저에 자동으로 저장돼요.' : 'Your selections are saved in this browser.'}</p>
          </div>
          <div className="mt-4 flex items-start gap-2.5 px-3 text-xs leading-relaxed text-slate-400"><Sparkles className="mt-0.5 size-4 shrink-0 text-teal-500" aria-hidden="true" /><p>{lang === 'ko' ? '아직 고민 중이어도 괜찮아요. 체험과 옵션은 언제든 바꿀 수 있어요.' : 'Still deciding? You can change any experience or option as you go.'}</p></div>
        </aside>

        {step > 0 && <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-100 bg-white/95 px-5 pb-[calc(env(safe-area-inset-bottom,0px)+12px)] pt-3 backdrop-blur-xl lg:hidden">
          <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
            <button type="button" onClick={() => summaryRef.current?.scrollIntoView({ behavior: reducedMotion ? 'instant' : 'smooth', block: 'start' })} className="min-w-0 text-left" aria-label={c.mobileSee}>
              <span className="flex items-center gap-1 text-[10px] text-slate-500">{c.mobileTotal}<ArrowDown className="size-3" aria-hidden="true" /><span className="text-slate-400">{lang === 'ko' ? '부가세 포함' : 'incl. VAT'}</span></span>
              <AnimatedAmount value={quote.total} lang={lang} className="mt-0.5 block break-words text-base font-bold text-slate-900" />
            </button>
            <button type="button" onClick={moveForward} disabled={step === 2 && input.items.length === 0} className={cn(primaryButton, 'min-h-11 shrink-0 px-5 text-xs')}>{step === 3 ? c.toForm : c.next}<ArrowRight className="size-3.5" aria-hidden="true" /></button>
          </div>
        </div>}
      </div>
    </MotionConfig>
  );
}
