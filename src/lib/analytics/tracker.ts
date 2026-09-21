// ============================================================
// 유입 분석 - 공개 사이트용 방문 기록기 (브라우저 전용)
// 페이지뷰·체류시간·행동 이벤트를 /api/track 으로 보낸다.
// 개인 식별 정보는 보내지 않고, 브라우저마다 무작위 방문자 ID만 둔다.
// ============================================================

import type { SessionOrigin } from './sources'

const ENDPOINT = '/api/track'
const VISITOR_KEY = 'neander:analytics-vid'
const SESSION_KEY = 'neander:analytics-session'
const OPT_OUT_KEY = 'neander:analytics-optout'
const INTERNAL_KEY = 'neander:analytics-internal'
const MIGRATED_KEY = 'neander:analytics-internal-migrated'
const DEBUG_KEY = 'neander:analytics-debug'
/** 이 값이 붙은 주소로 한 번 들어오면 그 기기를 내부 방문으로 표시한다 */
const INTERNAL_PARAM = 'nd_internal'

/** 30분 동안 활동이 없으면 새 방문(세션)으로 센다 */
const SESSION_IDLE_MS = 30 * 60 * 1000
/** 한 페이지 체류시간 상한 (탭을 켜 둔 채 자리를 비운 경우) */
const MAX_PAGE_MS = 30 * 60 * 1000

/** 운영 도메인에서만 기록한다 (로컬·미리보기 배포 제외) */
const TRACKED_HOSTS = ['neander.co.kr', 'www.neander.co.kr']
const LOCALES = ['ko', 'en']

interface StoredSession {
  id: string
  /** 마지막 활동 시각 */
  last: number
  /** 이 세션에서 본 페이지 수 */
  seq: number
  /** 이 브라우저의 첫 방문인지 */
  nv: boolean
  origin: SessionOrigin
}

interface CurrentPage {
  id: string
  path: string
  locale: string
  visibleSince: number | null
  accumulated: number
  scroll: number
  sentDur: number
  sentScroll: number
}

let current: CurrentPage | null = null
let lastPathname: string | null = null
let firstPageOfLoad = true
// 저장소를 못 쓰는 환경(일부 인앱·사생활 보호 모드)에서 쓰는 대체값
let memoryVisitor: string | null = null
let memorySession: StoredSession | null = null

function local(): Storage | null {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

function randomId(length: number): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('')
}

export function isAnalyticsOptedOut(): boolean {
  try {
    return local()?.getItem(OPT_OUT_KEY) === '1'
  } catch {
    return false
  }
}

/** 이 브라우저가 내부(팀) 기기로 표시돼 있는지 */
export function isInternalBrowser(): boolean {
  try {
    return local()?.getItem(INTERNAL_KEY) === '1'
  } catch {
    return false
  }
}

/** 내부 기기 표시를 켜거나 끈다 */
export function setInternalBrowser(internal: boolean) {
  try {
    local()?.setItem(INTERNAL_KEY, internal ? '1' : '0')
  } catch {
    // 저장소를 쓸 수 없으면 무시한다
  }
}

/** 이 브라우저의 방문을 기록에서 빼거나(1) 다시 넣는다(0) */
export function setAnalyticsOptOut(optOut: boolean) {
  try {
    local()?.setItem(OPT_OUT_KEY, optOut ? '1' : '0')
  } catch {
    // 저장소를 쓸 수 없으면 무시한다
  }
}

/**
 * 관리자로 로그인한 브라우저는 내부 기기로 표시한다.
 * 기록은 남기되 '내부' 꼬리표를 달아 대시보드에서 빼고 보는 것이 기본이다.
 * (예전에는 아예 기록하지 않았기 때문에, 그때 자동으로 켜진 제외 설정은 한 번만 풀어준다)
 */
export function markAdminBrowserInternal() {
  try {
    const storage = local()
    if (!storage) return
    if (storage.getItem(INTERNAL_KEY) == null) storage.setItem(INTERNAL_KEY, '1')
    if (storage.getItem(MIGRATED_KEY) == null) {
      if (storage.getItem(OPT_OUT_KEY) === '1') storage.setItem(OPT_OUT_KEY, '0')
      storage.setItem(MIGRATED_KEY, '1')
    }
  } catch {
    // 무시
  }
}

/**
 * ?nd_internal=1 로 들어오면 이 기기를 내부로 표시하고 짧게 알려준다.
 * (팀원이 휴대폰에서 링크 한 번만 누르면 되도록)
 */
function applyInternalParam() {
  const value = new URLSearchParams(window.location.search).get(INTERNAL_PARAM)
  if (value == null) return
  const internal = value !== '0' && value !== 'false'
  setInternalBrowser(internal)
  showNotice(internal ? '이 기기의 방문은 내부 방문으로 표시됩니다.' : '이 기기의 내부 방문 표시를 해제했습니다.')
}

function showNotice(message: string) {
  const box = document.createElement('div')
  box.textContent = message
  box.setAttribute('role', 'status')
  box.style.cssText =
    'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:2147483647;' +
    'max-width:calc(100vw - 32px);padding:12px 18px;border-radius:9999px;' +
    'background:#111827;color:#fff;font-size:14px;line-height:1.4;text-align:center;' +
    'box-shadow:0 8px 24px rgba(0,0,0,.25)'
  document.body.appendChild(box)
  setTimeout(() => box.remove(), 4000)
}

function isEnabled(): boolean {
  if (typeof window === 'undefined' || isAnalyticsOptedOut()) return false
  try {
    if (local()?.getItem(DEBUG_KEY) === '1') return true
  } catch {
    // 무시
  }
  if (navigator.webdriver) return false
  return TRACKED_HOSTS.includes(window.location.hostname)
}

/** '/en/services/acscent/' → { path: '/services/acscent', locale: 'en' } */
export function normalizePath(pathname: string): { path: string; locale: string } {
  let decoded = pathname
  try {
    decoded = decodeURIComponent(pathname)
  } catch {
    // 잘못 인코딩된 주소는 그대로 둔다
  }
  const segments = decoded.split('/').filter(Boolean)
  let locale = 'ko'
  if (segments[0] && LOCALES.includes(segments[0])) locale = segments.shift()!
  return { path: `/${segments.join('/')}`.slice(0, 300), locale }
}

function readVisitor(): { id: string; created: boolean } {
  try {
    const saved = local()?.getItem(VISITOR_KEY)
    if (saved) return { id: saved, created: false }
  } catch {
    // 아래에서 새로 만든다
  }
  if (memoryVisitor) return { id: memoryVisitor, created: false }
  const id = randomId(16)
  memoryVisitor = id
  try {
    local()?.setItem(VISITOR_KEY, id)
  } catch {
    // 메모리 값만 쓴다
  }
  return { id, created: true }
}

function readSession(): StoredSession | null {
  try {
    const raw = local()?.getItem(SESSION_KEY)
    if (raw) return JSON.parse(raw) as StoredSession
  } catch {
    // 손상된 값은 새 세션으로 대체
  }
  return memorySession
}

function saveSession(session: StoredSession) {
  memorySession = session
  try {
    local()?.setItem(SESSION_KEY, JSON.stringify(session))
  } catch {
    // 메모리 값만 쓴다
  }
}

function readUtm(): SessionOrigin['utm'] {
  const params = new URLSearchParams(window.location.search)
  const utm: SessionOrigin['utm'] = {}
  for (const key of ['source', 'medium', 'campaign', 'term', 'content'] as const) {
    const value = params.get(`utm_${key}`)?.trim()
    if (value) utm[key] = value.slice(0, 100)
  }
  return utm
}

function externalReferrer(): string {
  const ref = document.referrer
  if (!ref) return ''
  try {
    if (new URL(ref).host === window.location.host) return ''
  } catch {
    return ''
  }
  return ref.slice(0, 500)
}

/**
 * 현재 세션을 이어가거나(30분 이내 활동) 새로 시작한다.
 * 새 캠페인 링크(utm)로 다시 들어온 경우에도 새 세션으로 본다.
 */
function resolveSession(landingPath: string): StoredSession {
  const now = Date.now()
  // 리퍼러와 UTM은 페이지를 처음 불러왔을 때만 의미가 있다 (사이트 안 이동은 SPA 전환)
  const utm = firstPageOfLoad ? readUtm() : {}
  const saved = readSession()
  const newCampaign =
    !!utm.source && (saved?.origin.utm.source !== utm.source || saved?.origin.utm.campaign !== utm.campaign)

  if (saved && now - saved.last < SESSION_IDLE_MS && !newCampaign) {
    return saved
  }

  const visitor = readVisitor()
  return {
    id: randomId(16),
    last: now,
    seq: 0,
    nv: visitor.created,
    origin: { ref: firstPageOfLoad ? externalReferrer() : '', utm, landing: landingPath },
  }
}

function send(payload: Record<string, unknown>) {
  const body = JSON.stringify(payload)
  try {
    // text/plain Blob은 사전 요청(preflight) 없이 보낼 수 있고, 페이지를 떠나는 중에도 전송된다
    if (navigator.sendBeacon?.(ENDPOINT, new Blob([body], { type: 'text/plain' }))) return
  } catch {
    // fetch로 대신 보낸다
  }
  fetch(ENDPOINT, { method: 'POST', body, keepalive: true, headers: { 'Content-Type': 'text/plain' } }).catch(
    () => {}
  )
}

function clientHints() {
  return {
    lang: (navigator.language || '').slice(0, 20),
    tp: navigator.maxTouchPoints || 0,
  }
}

function scrollDepth(): number {
  const doc = document.documentElement
  const total = doc.scrollHeight
  if (!total) return 0
  return Math.min(100, Math.round(((window.scrollY + window.innerHeight) / total) * 100))
}

function context(session: StoredSession) {
  const visitor = readVisitor()
  return {
    vid: visitor.id,
    sid: session.id,
    nv: session.nv,
    s: session.origin,
    int: isInternalBrowser(),
    ...clientHints(),
  }
}

/** 보던 페이지의 체류시간·스크롤 깊이를 보낸다 (탭을 숨기거나 다른 페이지로 갈 때) */
export function flushEngagement() {
  if (!current) return
  const now = Date.now()
  if (current.visibleSince != null) {
    current.accumulated += now - current.visibleSince
    current.visibleSince = document.visibilityState === 'visible' ? now : null
  }
  // 스크롤 깊이는 스크롤 이벤트로만 갱신한다. 페이지 전환 중에는 이미 다음 페이지가 그려져 있어
  // 여기서 다시 재면 새 페이지 값이 섞인다
  const dur = Math.round(Math.min(current.accumulated, MAX_PAGE_MS))
  if (dur < 1000 || (dur === current.sentDur && current.scroll === current.sentScroll)) return
  current.sentDur = dur
  current.sentScroll = current.scroll
  send({ t: 'eng', id: current.id, dur, scroll: current.scroll })

  const session = readSession()
  if (session) saveSession({ ...session, last: now })
}

export function trackPageview(pathname: string) {
  if (!isEnabled() || pathname === lastPathname) return
  lastPathname = pathname
  flushEngagement()

  const { path, locale } = normalizePath(pathname)
  const session = resolveSession(path)
  firstPageOfLoad = false
  const entry = session.seq === 0
  saveSession({ ...session, seq: session.seq + 1, last: Date.now() })

  const id = randomId(20)
  send({ t: 'pv', id, path, locale, entry, ...context(session) })
  current = {
    id,
    path,
    locale,
    visibleSince: document.visibilityState === 'visible' ? Date.now() : null,
    accumulated: 0,
    scroll: scrollDepth(),
    sentDur: 0,
    sentScroll: 0,
  }
}

/** 문의 접수·전화 클릭 같은 행동을 기록한다 */
export function trackEvent(name: string, label?: string | null) {
  if (!isEnabled()) return
  const { path, locale } = current ?? normalizePath(window.location.pathname)
  const session = resolveSession(path)
  firstPageOfLoad = false
  saveSession({ ...session, last: Date.now() })
  send({
    t: 'ev',
    id: randomId(20),
    name,
    label: label ? label.slice(0, 200) : null,
    path,
    locale,
    entry: false,
    ...context(session),
  })
}

function handleVisibility() {
  if (!current) return
  if (document.visibilityState === 'hidden') {
    flushEngagement()
    current.visibleSince = null
  } else if (current.visibleSince == null) {
    current.visibleSince = Date.now()
  }
}

function handleScroll() {
  if (current) current.scroll = Math.max(current.scroll, scrollDepth())
}

function handleClick(e: MouseEvent) {
  const anchor = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null
  if (!anchor) return
  const href = anchor.getAttribute('href') ?? ''
  if (href.startsWith('tel:')) {
    trackEvent('click_tel', href.slice(4))
    return
  }
  if (href.startsWith('mailto:')) {
    trackEvent('click_email', href.slice(7).split('?')[0])
    return
  }
  try {
    const url = new URL(anchor.href)
    if ((url.protocol === 'http:' || url.protocol === 'https:') && url.host !== window.location.host) {
      trackEvent('click_outbound', `${url.host}${url.pathname === '/' ? '' : url.pathname}`)
    }
  } catch {
    // 잘못된 링크는 무시
  }
}

let listening = false

/** 페이지 공통 리스너를 한 번만 건다. 해제 함수를 돌려준다 */
export function startListeners(): () => void {
  if (listening || typeof window === 'undefined') return () => {}
  listening = true
  applyInternalParam()
  let ticking = false
  const onScroll = () => {
    if (ticking) return
    ticking = true
    requestAnimationFrame(() => {
      ticking = false
      handleScroll()
    })
  }
  document.addEventListener('visibilitychange', handleVisibility)
  window.addEventListener('pagehide', flushEngagement)
  window.addEventListener('scroll', onScroll, { passive: true })
  document.addEventListener('click', handleClick, { capture: true })
  return () => {
    listening = false
    document.removeEventListener('visibilitychange', handleVisibility)
    window.removeEventListener('pagehide', flushEngagement)
    window.removeEventListener('scroll', onScroll)
    document.removeEventListener('click', handleClick, { capture: true })
  }
}
