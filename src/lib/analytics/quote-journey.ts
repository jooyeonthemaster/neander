// ============================================================
// 온라인 견적(/quote) 행동 기록기
// 견적 화면 안에서 무엇을 보고, 누르고, 오래 머물렀는지를 브라우저에 모아 두었다가
// 15초마다·탭을 숨기거나 떠날 때 한 묶음으로 /api/track 에 보낸다 (Firestore quote_actions).
// 연락처 입력값은 기록하지 않는다 — 어떤 칸에 들어갔는지만 남긴다.
// ============================================================

import { sendQuoteActions } from './tracker'
import { MAX_ACTIONS_CHARS, MAX_BATCHES, type QuoteAction, type QuoteActionKind, type QuoteScreen } from './quote-behavior'

// 행동 하나 = [시작 후 경과 ms, 종류, a?, b?]
// 종류(kind)
//  v  화면 진입        a=화면 키 (QUOTE_SCREENS)
//  o  옵션 페이지 진입  a=체험 키, b=페이지 이름
//  oc 옵션 창 닫기      a=체험 키
//  p  시작 구성 선택    a=템플릿 id | 'blank'
//  +  체험 담기 / -  체험 빼기   a=체험 키
//  s  옵션 변경        a=체험 키, b='필드=값'
//  e  행사 정보 변경    a=필드, b=값
//  c  클릭             a=대상 이름
//  h  1초 이상 머묾     a=대상 이름, b=ms
//  i  안내(i) 열람      a=안내 문구 앞부분
//  f  연락처 칸 진입    a=칸 이름
//  x  제출 결과        a='pdf' | 'request' | 'invalid' | 'error'
//  $  견적 금액 변화    a=부가세 포함 합계(원)
//  hide / show        탭 숨김·다시 보임
//  end                페이지 떠남

const FLUSH_MS = 15_000
const MAX_BATCH = 80
const HOVER_MIN_MS = 1000

interface Journey {
  id: string
  startedAt: number
  seq: number
  buffer: QuoteAction[]
  screen: QuoteScreen | null
  total: number | null
  timer: ReturnType<typeof setInterval> | null
  detach: (() => void) | null
}

let journey: Journey | null = null

function randomId(length: number): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('')
}

const clip = (value: string | number | undefined, max = 60) =>
  typeof value === 'string' ? value.replace(/\s+/g, ' ').trim().slice(0, max) : value

/** 행동 하나를 남긴다. 기록 중인 여정이 없으면(실험 페이지 등) 아무것도 하지 않는다 */
export function recordQuote(kind: QuoteActionKind, a?: string | number, b?: string | number) {
  if (!journey) return
  const action: QuoteAction = [Date.now() - journey.startedAt, kind]
  if (a !== undefined) action.push(clip(a))
  if (b !== undefined) action.push(clip(b, 80))
  journey.buffer.push(action)
  if (journey.buffer.length >= MAX_BATCH) flushQuoteJourney()
}

/** 화면(단계)이 바뀔 때 — 같은 화면이 다시 그려지는 것은 무시한다 */
export function recordQuoteScreen(screen: QuoteScreen) {
  if (!journey || journey.screen === screen) return
  journey.screen = screen
  recordQuote('v', screen)
}

/** 견적 합계가 바뀔 때 — 이탈 시점 금액을 알 수 있게 남긴다 */
export function recordQuoteTotal(total: number) {
  if (!journey || journey.total === total) return
  journey.total = total
  recordQuote('$', total)
}

/** 모은 행동을 보낸다. 한 묶음이 너무 크면 나눠 보낸다 */
export function flushQuoteJourney() {
  if (!journey || journey.buffer.length === 0) return
  const pending = journey.buffer
  journey.buffer = []
  let batch: QuoteAction[] = []
  let size = 2
  const send = () => {
    if (!journey || batch.length === 0 || journey.seq >= MAX_BATCHES) return
    sendQuoteActions(journey.id, journey.seq++, JSON.stringify(batch))
    batch = []
    size = 2
  }
  for (const action of pending) {
    const length = JSON.stringify(action).length + 1
    if (size + length > MAX_ACTIONS_CHARS) send()
    batch.push(action)
    size += length
  }
  send()
}

/**
 * 누르거나 머문 대상의 이름 — 누를 수 있는 요소(버튼·링크·선택지)만 대상으로 하고,
 * 이름은 테스트 id → 접근성 이름 → 보이는 글자 순으로 찾는다
 */
export function targetName(element: Element): string | null {
  const labelled = element.closest<HTMLElement>('[data-track],button,a[href],[role=button],label,summary')
  if (!labelled) return null
  const track = labelled.dataset.track ?? labelled.dataset.testid
  if (track) return track
  const aria = labelled.getAttribute('aria-label')
  if (aria) return aria
  const text = labelled.textContent?.replace(/\s+/g, ' ').trim()
  return text ? text.slice(0, 40) : null
}

/** 견적 화면과, body 에 포털로 뜨는 옵션 창 안에서 일어난 일만 본다 */
function inScope(root: HTMLElement, target: EventTarget | null): target is Element {
  return target instanceof Element && (root.contains(target) || !!target.closest('[data-testid=quote-options-popover]'))
}

/** 견적 화면의 클릭·머무름·연락처 칸 진입을 기록한다 */
function attach(root: HTMLElement): () => void {
  const onClick = (event: MouseEvent) => {
    const target = event.target
    if (!inScope(root, target) || target.closest('input[type=text],input[type=email],input[type=tel],textarea')) return
    const name = targetName(target)
    if (name) recordQuote('c', name)
  }

  // 마우스가 한 대상 위에 1초 이상 머물면 '유심히 봄'으로 센다 (터치 기기는 해당 없음)
  let hovered: { name: string; since: number } | null = null
  const endHover = () => {
    if (hovered) {
      const ms = Date.now() - hovered.since
      if (ms >= HOVER_MIN_MS) recordQuote('h', hovered.name, Math.min(ms, 120_000))
    }
    hovered = null
  }
  const onOver = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return
    const name = inScope(root, event.target) ? targetName(event.target) : null
    if (name === hovered?.name) return
    endHover()
    if (name) hovered = { name, since: Date.now() }
  }

  const onFocus = (event: FocusEvent) => {
    if (!inScope(root, event.target)) return
    const field = event.target.closest<HTMLInputElement | HTMLTextAreaElement>('form input[name],form textarea[name]')
    if (field && field.type !== 'submit' && field.type !== 'checkbox') recordQuote('f', field.name)
  }

  document.addEventListener('click', onClick, { capture: true })
  document.addEventListener('pointerover', onOver)
  document.addEventListener('focusin', onFocus)
  return () => {
    endHover()
    document.removeEventListener('click', onClick, { capture: true })
    document.removeEventListener('pointerover', onOver)
    document.removeEventListener('focusin', onFocus)
  }
}

function onVisibility() {
  if (document.visibilityState === 'hidden') {
    recordQuote('hide')
    flushQuoteJourney()
  } else {
    recordQuote('show')
  }
}

function onPageHide() {
  recordQuote('end')
  flushQuoteJourney()
}

/** 견적 화면이 열릴 때 새 여정을 시작한다. 돌려주는 함수로 끝낸다 */
export function startQuoteJourney(root: HTMLElement): () => void {
  stopQuoteJourney()
  const detach = attach(root)
  document.addEventListener('visibilitychange', onVisibility)
  window.addEventListener('pagehide', onPageHide)
  journey = {
    id: randomId(20),
    startedAt: Date.now(),
    seq: 0,
    buffer: [],
    screen: null,
    total: null,
    timer: setInterval(flushQuoteJourney, FLUSH_MS),
    detach: () => {
      detach()
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pagehide', onPageHide)
    },
  }
  return stopQuoteJourney
}

export function stopQuoteJourney() {
  if (!journey) return
  // 사이트 안의 다른 페이지로 옮겨 견적 화면이 사라질 때도 떠난 시점을 남긴다
  if (journey.buffer.at(-1)?.[1] !== 'end') recordQuote('end')
  flushQuoteJourney()
  if (journey.timer) clearInterval(journey.timer)
  journey.detach?.()
  journey = null
}
