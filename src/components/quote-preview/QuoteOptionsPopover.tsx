'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, ArrowRight, Check, Trash2, X } from 'lucide-react';
import { SERVICE_TEXT, type Lang, type ServiceKey } from '@/lib/quote/catalog';
import { QuoteOptionFlowProvider, useQuoteOptionFlow } from '@/components/quote-studio/QuoteOptionFlowContext';
import { TotalDelta } from '@/components/quote-studio/TotalDelta';
import { recordQuote } from '@/lib/analytics/quote-journey';
import { smoothScrollTo } from '@/lib/smooth-scroll';

/** An anchored, non-modal speech bubble. The page and its live preview remain
 * usable; only this bubble's longer option lists scroll independently. */
interface QuoteOptionsPopoverProps {
  open: boolean;
  service: ServiceKey | null;
  lang: Lang;
  /** 전체 합계 (부가세 포함) */
  total: number;
  /** 전체 합계의 부가세 별도 금액 — 옵션 가격(부가세 별도)과 같은 기준으로 나란히 보여 준다 */
  supply: number;
  children: ReactNode;
  onClose: () => void;
  onRemove: () => void;
  /** A demo can temporarily take focus while these options stay mounted. */
  suspended?: boolean;
}

/** 말풍선의 최대 높이 — 내용이 짧으면 내용만큼만, 화면이 낮으면 화면 안쪽까지만 */
const MAX_HEIGHT = 640;
const MIN_HEIGHT = 120;
/** 열어 둔 채 화면을 굴려 자리가 모자라져도 이보다 작게 줄이지는 않는다 (옵션을 계속 쓸 수 있는 크기) */
const USABLE_HEIGHT = 320;
/**
 * 자리가 남으면 가장 긴 주제보다 이만큼 여유를 둔다 — 열어 둔 동안에는 높이를 바꾸지 않으므로,
 * 옵션을 고르다 안내 문구가 한두 줄 늘어도(자동 조정 안내 등) 안쪽 스크롤이 생기지 않게.
 */
const HEADROOM = 32;
const GAP = 12;
/** 내용 높이를 재는 동안(화면에 그리기 전) 잠깐 쓰는 말풍선 높이 — 헤더·탭·아래 버튼이 다 들어가면 된다 */
const MEASURE_HEIGHT = 480;

type Side = 'top' | 'bottom' | 'overlay';
/** 열 때 한 번 정하는 배치 — 열려 있는 동안 위·아래와 높이를 바꾸지 않는다 */
interface Hold { service: ServiceKey; side: Side; height: number }
interface Placement { left: number; top: number; width: number; height: number; arrow: number; side: Side; service: ServiceKey | null; settled: boolean }

/**
 * 말풍선을 둘 수 있는 화면 안쪽 범위 — 위는 헤더를 실제로 재서 뺀다.
 * 아래 고정 합계 바(모바일)는 말풍선이 열려 있는 동안 숨기므로 빼지 않는다: 말풍선에도 합계와 '다음'이 있어
 * 둘이 위아래로 겹쳐 보이면 어느 '다음'인지 헷갈린다.
 */
function safeArea() {
  const viewport = window.visualViewport;
  const vTop = viewport?.offsetTop ?? 0;
  const vHeight = viewport?.height ?? window.innerHeight;
  const headerBottom = document.querySelector('header')?.getBoundingClientRect().bottom ?? 80;
  return { top: Math.max(vTop + GAP, Math.min(headerBottom + GAP, vTop + 100)), bottom: vTop + vHeight - GAP };
}

/** 지금 보이는 체험의 옵션 스크롤 영역 — 담은 체험마다 하나씩 있고, 다른 체험 것은 숨겨져 있다 */
function visibleOptionArea(panel: HTMLElement | null): HTMLElement | undefined {
  return [...(panel?.querySelectorAll<HTMLElement>('[data-testid="option-page-scroll"]') ?? [])].find((area) => area.offsetParent !== null);
}

/**
 * 가장 긴 옵션 주제를 스크롤 없이 다 보여주는 말풍선 높이 (헤더·탭·아래 버튼 포함).
 * 주제마다 높이가 다르면 주제를 옮길 때 제목과 탭이 위아래로 튀므로, 열 때 가장 긴 주제에 맞춘다.
 * 줄바꿈이 실제와 같아야 하므로 말풍선을 실제 폭(width)으로 맞춰 놓고 잰다 (폭은 그대로 둔다 — 곧 같은 값으로 다시 그려진다).
 * 숨겨 둔 주제는 잠깐 펼쳐서 재고 같은 프레임 안에서 되돌린다 (화면에는 그려지지 않는다).
 */
function tallestTopicHeight(panel: HTMLElement | null, width: number): number | null {
  const area = visibleOptionArea(panel);
  const pages = [...(area?.querySelectorAll<HTMLElement>(':scope > [role="tabpanel"]') ?? [])];
  if (!panel || !area || !pages.length || panel.offsetHeight === 0) return null;
  // '동작 줄이기' 환경은 모든 전환을 0.01ms 로 줄여 둔다 — 그래도 전환이라, 값을 바꾼 직후에는 바꾸기 전 크기가 읽힌다.
  // 재는 동안에는 전환을 끈다.
  for (const element of [panel, area]) element.style.setProperty('transition', 'none', 'important');
  const panelHeight = panel.style.height;
  panel.style.width = `${width}px`;
  // 말풍선이 잠시 줄어든 상태여도 헤더·탭·아래 버튼 높이를 제대로 재도록 넉넉한 높이에서 잰다
  panel.style.height = `${MEASURE_HEIGHT}px`;
  const chrome = panel.offsetHeight - area.offsetHeight;
  const hidden = pages.map((page) => page.hidden);
  const { flex, height } = area.style;
  // 스크롤 영역을 납작하게 눌러야 스크롤 높이가 곧 내용 높이다 (마지막 요소의 바깥 여백까지 들어간다)
  area.style.flex = 'none';
  area.style.height = '0px';
  let content = 0;
  for (const page of pages) {
    for (const other of pages) other.hidden = other !== page;
    content = Math.max(content, area.scrollHeight);
  }
  pages.forEach((page, index) => { page.hidden = hidden[index]; });
  area.style.flex = flex;
  area.style.height = height;
  panel.style.height = panelHeight;
  // 되돌린 크기를 먼저 반영한 뒤에 전환을 다시 켠다 (되돌리는 동작이 전환으로 잡히지 않게)
  void panel.offsetHeight;
  for (const element of [panel, area]) element.style.removeProperty('transition');
  return chrome + content;
}

/** 말풍선의 가로 자리 — 카드 목록 폭에 맞추고, 꼬리는 카드 이름 한가운데를 가리킨다 */
function frame(service: ServiceKey | null) {
  const button = service ? document.getElementById(`preview-trigger-${service}`) : null;
  if (!button) return null;
  // The card's name is the visible attachment point, even when the bubble
  // opens above the card's illustration.
  const anchor = (button.querySelector('[data-options-anchor]') ?? button).getBoundingClientRect();
  const grid = button.closest('[data-options-card-grid]')?.getBoundingClientRect();
  const viewport = window.visualViewport;
  const vLeft = viewport?.offsetLeft ?? 0;
  const vWidth = viewport?.width ?? window.innerWidth;
  const width = Math.min(480, vWidth >= 1024 ? grid?.width ?? 480 : 480, vWidth - 24);
  const left = Math.max(vLeft + 12, Math.min(grid?.left ?? anchor.left, vLeft + vWidth - width - 12));
  // 꼬리는 말풍선 테두리(1px) 안쪽 기준으로 놓이므로 그만큼 빼야 카드 이름 한가운데를 가리킨다
  const arrow = Math.max(22, Math.min(width - 22, anchor.left + anchor.width / 2 - left - 1));
  return { button, anchor, left, width, arrow };
}

/** Tab 으로 갈 수 있는 요소를 문서 순서대로 */
function tabbable(root: HTMLElement): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>('a[href], button, input, select, textarea, summary, [tabindex]')].filter((element) => (
    element.tabIndex >= 0 && !element.hasAttribute('disabled') && !element.closest('[inert], [hidden]') && element.getClientRects().length > 0
  ));
}

/** 정해 둔 쪽에 말풍선이 더는 다 들어가지 않는지 (화면이 정한 자리에서 벗어났는지) */
function isCrowded(held: Hold | null): boolean {
  const at = held && held.side !== 'overlay' ? frame(held.service) : null;
  if (!held || !at) return false;
  const { top: safeTop, bottom: safeBottom } = safeArea();
  const room = held.side === 'bottom' ? safeBottom - at.anchor.bottom - GAP : at.anchor.top - safeTop - GAP;
  return room < held.height - 1;
}

export function QuoteOptionsPopover(props: QuoteOptionsPopoverProps) {
  return <QuoteOptionFlowProvider><QuoteOptionsBubble {...props} /></QuoteOptionFlowProvider>;
}

function QuoteOptionsBubble({ open, service, lang, total, supply, children, onClose, onRemove, suspended = false }: QuoteOptionsPopoverProps) {
  const panel = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotion();
  const ko = lang === 'ko';
  const flow = useQuoteOptionFlow();
  // 견적 행동 기록: 어떤 체험의 몇 번째 옵션 페이지를 봤는지, 언제 닫았는지
  const flowPage = open && service && flow ? `${flow.index + 1}/${flow.total} ${flow.label}` : null;
  useEffect(() => { if (service && flowPage) recordQuote('o', service, flowPage); }, [service, flowPage]);
  const openService = open ? service : null;
  useEffect(() => (openService ? () => recordQuote('oc', openService) : undefined), [openService]);
  const [position, setPosition] = useState<Placement>({ left: 0, top: 0, width: 360, height: 440, arrow: 40, side: 'bottom', service: null, settled: false });
  const hold = useRef<Hold | null>(null);
  // 여는 순간 화면을 맞추는 동안의 목표 스크롤 위치 — 그동안 말풍선은 카드에 붙은 채 함께 움직인다
  const aligning = useRef<number | null>(null);
  const alignTimer = useRef<number | undefined>(undefined);
  // 여는 순간에 다른 화면 이동(단계 전환 스크롤, 관성 스크롤 등)이 끼어들면 멈춘 뒤 다시 맞출 수 있는 짧은 시간과 횟수
  const opening = useRef<{ until: number; retries: number } | null>(null);
  const retryTimer = useRef<number | undefined>(undefined);
  // 여는 순간 ①: 먼저 자리를 정하지 않은 채 그린다 — 가장 긴 주제의 높이를 잴 수 있게 (카드를 바꾸거나 다시 열 때마다)
  const openKey = open ? service : null;
  const [seenKey, setSeenKey] = useState<ServiceKey | null>(null);
  if (seenKey !== openKey) {
    setSeenKey(openKey);
    if (openKey) setPosition((current) => ({ ...current, service: openKey, settled: false }));
  }

  /**
   * 정해 둔 배치(위·아래와 높이)대로 카드 이름 옆에 놓는다.
   * 사용자가 화면을 굴리면 카드를 따라가고, 그쪽 자리가 모자라면 그만큼만 잠시 줄어든다. 위·아래는 바꾸지 않는다.
   */
  const place = useCallback(() => {
    const held = hold.current;
    const at = frame(service);
    if (!at || !held || held.service !== service) return;
    trigger.current = at.button;
    const { anchor } = at;
    const { top: safeTop, bottom: safeBottom } = safeArea();
    let height = Math.min(held.height, Math.max(MIN_HEIGHT, safeBottom - safeTop));
    let top: number;
    if (held.side === 'overlay') top = Math.max(safeTop, Math.min(anchor.bottom + GAP, safeBottom - height));
    else if (aligning.current !== null) top = held.side === 'bottom' ? anchor.bottom + GAP : anchor.top - GAP - height;
    else {
      // 자리가 많이 모자라면 더 줄이지 않고 카드 위로 겹친다 (화면 안쪽에 머문다)
      const room = held.side === 'bottom' ? safeBottom - anchor.bottom - GAP : anchor.top - safeTop - GAP;
      height = Math.min(height, Math.max(MIN_HEIGHT, Math.min(height, USABLE_HEIGHT), room));
      top = held.side === 'bottom'
        ? Math.max(safeTop, Math.min(anchor.bottom + GAP, safeBottom - height))
        : Math.max(safeTop, anchor.top - GAP - height);
    }
    const next: Placement = { left: at.left, top, width: at.width, height, arrow: at.arrow, side: held.side, service, settled: true };
    setPosition((current) => (Object.keys(next) as (keyof Placement)[]).every((key) => current[key] === next[key]) ? current : next);
  }, [service]);

  /**
   * 말풍선을 여는 순간 한 번만: 높이(가장 긴 주제)와 위·아래를 정하고, 필요하면 화면을 그만큼만 굴린다.
   * - 굴릴 수 있는 범위: 카드 이름은 늘 보이고, 미리보기와 카드가 나란히 있으면 미리보기도 잘리지 않는 만큼.
   * - 그 안에서 말풍선이 카드 아래에 다 들어가면 아래, 안 되면 위(오른쪽 카드 칸 — 미리보기를 가리지 않는다),
   *   둘 다 안 되면 더 넓은 쪽을 만들고 말풍선 안에서 스크롤한다. 가능한 것 중 화면이 덜 움직이는 쪽.
   * 그 뒤로는 옵션을 고르거나 주제를 옮겨도 화면과 배치를 건드리지 않는다 — 늘어난 내용은 말풍선 안에서 스크롤한다.
   * 다만 여는 순간에 화면이 아직 움직이고 있었다면(단계를 넘긴 직후, 관성 스크롤 중) 방금 정한 자리가 금세 틀어지므로,
   * 연 직후 잠깐 동안만 화면이 멈췄는데도 정한 쪽에 다 안 들어가면 다시 맞춘다 (opening).
   * scroll 이 false 면(창 크기가 바뀌었을 때) 화면은 그대로 두고, 되도록 같은 쪽에서 배치만 다시 정한다.
   */
  const settle = useCallback(function settle(scroll: boolean) {
    const at = frame(service);
    if (!at || !service) return;
    const { anchor, button } = at;
    const { top: safeTop, bottom: safeBottom } = safeArea();
    const safeHeight = Math.max(MIN_HEIGHT, safeBottom - safeTop);
    const wanted = Math.min(MAX_HEIGHT, safeHeight, Math.max(MIN_HEIGHT, tallestTopicHeight(panel.current, at.width) ?? MAX_HEIGHT));
    const roomy = Math.min(MAX_HEIGHT, safeHeight, wanted + HEADROOM);
    const clampRange = (value: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, value));

    // d = 아래로 굴릴 양(음수면 위로). 굴릴 수 있는 범위는 두 가지를 차례로 본다:
    // (가) 카드 이름과 옆의 미리보기가 모두 화면 안에 남는 범위, (나) 카드 이름만 화면 안에 남는 범위.
    // (가)에서 말풍선이 다 들어가면 그쪽을 쓰고, 안 되면 (나)까지 넓힌다 — 창이 낮은 노트북에서도
    // 말풍선이 자기 카드를 덮지 않고(꼬리가 가리키는 이름이 보인다) 안쪽 스크롤 없이 열리게.
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const column = button.closest('[data-testid="quote-preview-experience-editor"]')?.querySelector('[data-preview-column]');
    const preview = column?.getBoundingClientRect();
    const beside = preview && preview.right <= anchor.left + 1 ? preview : null;
    // (나)에서는 미리보기 가운데 그림(행사 공간)이 잘리지 않는 쪽을 먼저 고른다 — 아래의 설명 줄은 잘려도 그림은 보이게
    const scene = beside ? column?.querySelector('[data-testid="preview-canvas"]')?.getBoundingClientRect() ?? beside : null;
    const ranges: { lo: number; hi: number }[] = [];
    if (scroll) {
      // 문서가 더 굴러갈 수 없는 만큼은 뺀다
      const within = (lo: number, hi: number) => {
        const range = { lo: Math.max(lo, -window.scrollY), hi: Math.min(hi, maxScroll - window.scrollY) };
        if (range.lo <= range.hi) ranges.push(range);
      };
      // 카드 이름은 화면 가장자리(헤더 바로 아래·화면 맨 아래)에 거의 닿아도 된다 — 말풍선 자리를 그만큼 더 번다
      const lo = anchor.bottom - (safeBottom + GAP - 4);
      const hi = anchor.top - (safeTop - GAP + 4);
      // 미리보기가 화면보다 크면 (가)는 건너뛴다
      if (beside && beside.height <= safeBottom - safeTop) within(Math.max(lo, beside.bottom - safeBottom), Math.min(hi, beside.top - safeTop));
      within(lo, hi);
    }
    if (!ranges.length) ranges.push({ lo: 0, hi: 0 });
    /** 그만큼 굴렸을 때 화면 밖으로 잘리는 미리보기 그림의 높이 */
    const cutPreview = (delta: number) => scene ? Math.max(0, safeTop - (scene.top - delta)) + Math.max(0, scene.bottom - delta - safeBottom) : 0;

    // 범위마다 여유를 둔 높이로 먼저 맞춰 보고, 안 되면 꼭 필요한 높이로 맞춰 본다
    const fits: { side: Side; delta: number; cut: number; height: number }[] = [];
    for (const { lo, hi } of ranges) {
      for (const tall of roomy > wanted ? [roomy, wanted] : [wanted]) {
        const needBelow = anchor.bottom + GAP + tall - safeBottom; // 이만큼 이상 굴리면 아래에 다 들어간다
        const needAbove = anchor.top - GAP - tall - safeTop;      // 이만큼 이하로 굴리면 위에 다 들어간다
        if (needBelow <= hi) { const delta = clampRange(0, Math.max(needBelow, lo), hi); fits.push({ side: 'bottom', delta, cut: cutPreview(delta), height: tall }); }
        if (needAbove >= lo) { const delta = clampRange(0, lo, Math.min(needAbove, hi)); fits.push({ side: 'top', delta, cut: cutPreview(delta), height: tall }); }
        if (fits.length) break;
      }
      if (fits.length) break;
    }
    let side: Side;
    let delta: number;
    let height: number;
    const kept = scroll ? undefined : fits.find((option) => option.side === hold.current?.side);
    if (kept) ({ side, delta, height } = kept);
    // 다 들어가는 자리 가운데 미리보기를 덜 가리는 쪽, 그다음 화면이 덜 움직이는 쪽
    else if (fits.length) ({ side, delta, height } = fits.reduce((best, option) => (option.cut < best.cut - 1 || (option.cut <= best.cut + 1 && Math.abs(option.delta) < Math.abs(best.delta)) ? option : best)));
    else {
      // 어느 쪽에도 다 안 들어가면 가장 넓게 만들 수 있는 쪽으로 (넓이가 비슷하면 미리보기를 덜 가리는 쪽)
      const { lo, hi } = ranges[ranges.length - 1];
      const roomBelow = safeBottom - (anchor.bottom - hi) - GAP;
      const roomAbove = anchor.top - lo - GAP - safeTop;
      side = Math.abs(roomBelow - roomAbove) <= 40 ? (cutPreview(lo) <= cutPreview(hi) ? 'top' : 'bottom') : roomBelow > roomAbove ? 'bottom' : 'top';
      delta = side === 'bottom' ? hi : lo;
      const room = side === 'bottom' ? roomBelow : roomAbove;
      // 카드에 붙인 채(꼬리 유지) 말풍선 안에서 스크롤한다. 옵션을 쓸 수 없을 만큼 좁을 때만
      // 방금 누른 카드 위로 겹쳐 화면 높이를 다 쓴다 (꼬리는 숨긴다)
      if (room < Math.min(wanted, USABLE_HEIGHT) && safeHeight > room + GAP) { side = 'overlay'; height = wanted; }
      else height = Math.max(MIN_HEIGHT, Math.min(roomy, room));
    }

    hold.current = { service, side, height };
    window.clearTimeout(alignTimer.current);
    aligning.current = null;
    if (scroll && Math.abs(delta) > 2) {
      const target = clampRange(window.scrollY + delta, 0, Math.max(0, maxScroll));
      aligning.current = target;
      smoothScrollTo(target);
      // 동작 줄이기면 이미 옮겨졌다. 아니면 다 굴러갈 때까지(중간에 멈춰도 잠시 뒤에는) 카드에 붙여 둔다
      if (Math.abs(window.scrollY - target) < 1) aligning.current = null;
      else alignTimer.current = window.setTimeout(() => {
        aligning.current = null;
        place();
        // 다 굴러가지 못했다면(다른 화면 이동에 밀렸다면) 한 번 더 맞춘다
        if (opening.current && opening.current.retries > 0 && isCrowded(hold.current)) { opening.current.retries -= 1; settle(true); }
      }, 1300);
    } else if (scroll) {
      // 굴릴 필요가 없어도, 단계를 넘기며 시작된 화면 이동이 아직 진행 중일 수 있다 —
      // 그대로 두면 방금 정한 자리에서 카드가 달아나므로 지금 위치에 세운다
      smoothScrollTo(window.scrollY, { immediate: true });
    }
    place();
  }, [service, place]);

  // 여는 순간 ②: 방금 그린 내용을 재서 배치를 정한다 — 브라우저가 화면에 그리기 전에 끝나므로 자리 잡기 전 모습은 보이지 않는다.
  // (visibility 로 숨기지 않는다: 동작 줄이기 환경의 0에 가까운 전환 때문에 한 프레임 늦게 풀려 포커스를 받지 못한다)
  const measuring = open && position.service === service && !position.settled;
  useLayoutEffect(() => {
    if (!measuring) return;
    opening.current = { until: performance.now() + 1500, retries: 2 };
    settle(true);
  }, [measuring, settle]);

  useLayoutEffect(() => {
    if (!open) return;
    const observer = new ResizeObserver(place);
    const button = document.getElementById(`preview-trigger-${service}`);
    if (button) observer.observe(button);
    const grid = button?.closest('[data-options-card-grid]');
    if (grid) observer.observe(grid);
    const editor = button?.closest('[data-testid="quote-preview-experience-editor"]');
    if (editor) observer.observe(editor);
    const scroll = (event: Event) => {
      if (panel.current?.inert) return;
      if (event.target instanceof Element && (panel.current?.contains(event.target) || event.target.closest('[data-site-select]'))) return;
      if (aligning.current !== null) {
        if (Math.abs(window.scrollY - aligning.current) < 1) { aligning.current = null; window.clearTimeout(alignTimer.current); }
      } else if (opening.current && performance.now() < opening.current.until) {
        // 연 직후의 화면 이동: 멈추면 자리를 다시 확인한다
        window.clearTimeout(retryTimer.current);
        retryTimer.current = window.setTimeout(() => {
          if (opening.current && opening.current.retries > 0 && aligning.current === null && isCrowded(hold.current)) { opening.current.retries -= 1; settle(true); }
        }, 150);
      } else {
        const anchor = trigger.current?.getBoundingClientRect();
        if (anchor && (anchor.bottom < 80 || anchor.top > window.innerHeight - 80)) { onClose(); return; }
      }
      place();
    };
    const resize = () => settle(false);
    window.addEventListener('resize', resize);
    window.addEventListener('scroll', scroll, true);
    window.visualViewport?.addEventListener('resize', place);
    window.visualViewport?.addEventListener('scroll', place);
    return () => {
      window.clearTimeout(alignTimer.current);
      window.clearTimeout(retryTimer.current);
      aligning.current = null;
      opening.current = null;
      observer.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', scroll, true);
      window.visualViewport?.removeEventListener('resize', place);
      window.visualViewport?.removeEventListener('scroll', place);
    };
  }, [open, service, place, settle, onClose]);

  const dismiss = useCallback(() => {
    trigger.current?.focus({ preventScroll: true });
    onClose();
  }, [onClose]);

  // 화면에 그려 둔 상태(mounted)와 배치까지 끝나 쓸 수 있는 상태(ready)
  const mounted = open && position.service === service;
  const ready = mounted && position.settled;

  useEffect(() => {
    if (!ready) return;
    const request = requestAnimationFrame(() => {
      if (!panel.current?.inert) closeButton.current?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(request);
  }, [ready, service]);

  useEffect(() => {
    if (!ready || suspended) return;
    const isInside = (target: EventTarget | null) => target instanceof Element && (
      panel.current?.contains(target) || trigger.current?.contains(target) || target.closest('[data-site-select], [role="tooltip"], [data-testid="preview-canvas"]')
    );
    const outside = (event: PointerEvent) => { if (!panel.current?.inert && !isInside(event.target)) onClose(); };
    const focusOutside = (event: FocusEvent) => { if (!panel.current?.inert && !isInside(event.target)) onClose(); };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !event.defaultPrevented && !document.querySelector('[data-site-select]')) {
        event.preventDefault();
        dismiss();
        return;
      }
      // 말풍선은 문서 맨 끝(body)에 그려져 있어, 마지막 버튼에서 Tab 을 누르면 포커스가 문서 밖을 돌아 사이트 헤더로 간다.
      // 카드 바로 뒤에 놓인 것처럼 이어 준다: 끝에서 Tab → 닫고 카드 다음 요소로, 처음에서 Shift+Tab → 닫고 카드로.
      if (event.key !== 'Tab' || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || !panel.current?.contains(document.activeElement)) return;
      const inside = tabbable(panel.current);
      if (event.shiftKey ? document.activeElement !== inside[0] : document.activeElement !== inside[inside.length - 1]) return;
      event.preventDefault();
      const card = trigger.current;
      const outside = tabbable(document.body).filter((element) => !panel.current?.contains(element));
      const next = card && !event.shiftKey ? outside[outside.indexOf(card) + 1] : undefined;
      (next ?? card)?.focus({ preventScroll: true });
      onClose();
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('focusin', focusOutside);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('focusin', focusOutside);
      document.removeEventListener('keydown', onKey);
    };
  }, [ready, suspended, service, onClose, dismiss]);

  const title = service ? SERVICE_TEXT[service].name[lang] : '';
  const money = (value: number) => (ko ? `${value.toLocaleString('ko-KR')}원` : `KRW ${value.toLocaleString('en-US')}`);
  // 자리(left·top·width·height)는 전환 없는 바깥 상자에 두고, 안쪽 motion 요소는 나타나는 효과만 맡는다.
  // '동작 줄이기' 환경은 모든 전환을 0.01ms 로 줄이는데, 그래도 전환이라 값이 한 프레임 늦게 반영된다 —
  // 전환을 끄지 않으면 자리를 잡기 전 위치(화면 왼쪽 위)에 말풍선이 한 프레임 보인다.
  return createPortal(<div ref={panel} id="preview-options-popover" hidden={!mounted} inert={!ready || suspended} aria-hidden={suspended || undefined} role="dialog" aria-modal="false"
    aria-label={`${title} ${ko ? '옵션' : 'options'}`} data-testid="quote-options-popover" data-side={position.side} data-anchor-service={service}
    data-lenis-prevent style={{ left: position.left, top: position.top, width: position.width, height: position.height }}
    className="fixed z-[80] transition-none [&_[data-option-navigation]]:hidden">
    <motion.div initial={false} animate={{ opacity: open ? 1 : 0, y: open || reducedMotion ? 0 : position.side === 'bottom' ? -5 : 5 }} transition={{ duration: reducedMotion ? 0 : .16 }}
      className="relative h-full rounded-[22px] border border-teal-200 bg-white shadow-[0_12px_40px_-8px_rgba(15,23,42,0.2)]">
    <span data-testid="quote-options-arrow" aria-hidden="true" hidden={position.side === 'overlay'} style={{ left: position.arrow, ...(position.side === 'bottom' ? { top: -8 } : { bottom: -8 }) }}
      className={`absolute size-3.5 -translate-x-1/2 rotate-45 bg-white ${position.side === 'bottom' ? 'border-t border-l' : 'border-r border-b'} border-teal-200`} />
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-[22px] bg-white">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-100 px-4 py-2">
        <h2 className="flex min-w-0 items-center gap-2 text-sm font-bold text-slate-900"><span className="size-1.5 shrink-0 rounded-full bg-teal-500" aria-hidden="true" />{title}</h2>
        <button ref={closeButton} type="button" data-testid="quote-options-close" onClick={dismiss} aria-label={ko ? '옵션 닫기' : 'Close options'} className="flex size-8 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-slate-50 touch:size-11 focus-visible:outline-2 focus-visible:outline-teal-600"><X size={17} /></button>
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-3 sm:px-4">{children}</div>
      <div className="relative shrink-0 border-t border-slate-100 px-4 py-2.5">
        {/* 증감 표시는 윗선에 걸쳐 띄운다 — 줄이 꺾여 아래 버튼이 밀리지 않게 */}
        <TotalDelta value={total} lang={lang} className="absolute -top-2.5 right-4 shadow-sm ring-2 ring-white" />
        <div className="mb-2 flex items-center justify-between gap-2 text-[10px] text-slate-500">
          <span className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5">
            <span>{ko ? '전체 합계 · 부가세 포함' : 'Event total · incl. VAT'} <strong className="ml-1 text-xs tabular-nums text-teal-700" data-testid="options-total" data-amount={total}>{money(total)}</strong></span>
            <span data-testid="options-total-supply" data-amount={supply} className="tabular-nums">{ko ? `(별도 ${money(supply)})` : `(${money(supply)} before VAT)`}</span>
          </span>
          <button type="button" data-testid="quote-options-remove" onClick={() => { dismiss(); onRemove(); }} aria-label={ko ? '이 체험 빼기' : 'Remove this experience'} className="flex size-6 shrink-0 items-center justify-center rounded-md text-slate-500 hover:bg-rose-50 touch:size-11 hover:text-rose-600 focus-visible:outline-2 focus-visible:outline-teal-600"><Trash2 size={13} /></button>
        </div>
        <div className="flex items-center justify-between gap-2">
          <button type="button" data-testid="option-page-previous" disabled={!flow || flow.index === 0} onClick={() => flow?.goPrevious()} className="inline-flex min-h-9 items-center gap-1 rounded-xl px-2 text-xs font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-30 touch:min-h-11 touch:px-3 focus-visible:outline-2 focus-visible:outline-teal-600"><ArrowLeft size={14} />{ko ? '이전' : 'Back'}</button>
          <span className="shrink-0 text-[11px] tabular-nums text-slate-500" aria-live="polite" data-testid="option-flow-progress">{flow ? `${flow.index + 1} / ${flow.total}` : ''}</span>
          {flow && (flow.index < flow.total - 1 || !flow.allVisited)
            ? <button type="button" data-testid="option-page-next" onClick={() => flow.index < flow.total - 1 ? flow.goNext() : flow.goFirstUnvisited()} className="inline-flex min-h-9 max-w-[65%] items-center justify-center gap-1 rounded-xl bg-teal-700 touch:min-h-11 px-3 text-xs font-semibold text-white hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"><span>{flow.index < flow.total - 1 ? (ko ? `다음 · ${flow.nextLabel}` : `Next · ${flow.nextLabel}`) : (ko ? '남은 옵션 확인' : 'Review remaining')}</span><ArrowRight size={14} className="shrink-0" /></button>
            : <button type="button" data-testid="quote-options-done" disabled={!flow || !flow.allVisited} onClick={() => { if (flow?.allVisited) dismiss(); }} className="inline-flex min-h-9 items-center gap-1 rounded-xl bg-teal-700 touch:min-h-11 px-3 text-xs font-semibold text-white hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"><Check size={14} />{ko ? '선택 완료' : 'Finish options'}</button>}
        </div>
      </div>
    </div>
    </motion.div>
  </div>, document.body);
}
