// ============================================================
// 온라인 견적 행동 분석 — quote_actions 묶음을 여정으로 모으고 통계를 낸다
// 기록 형식은 quote-journey.ts, 저장은 /api/track, 화면은 /admin/quote-analytics
// ============================================================

import { QUOTE_PRESETS } from '@/lib/quote/presets'
import { SERVICE_TEXT, type ServiceKey } from '@/lib/quote/catalog'

export const QUOTE_ACTIONS_COLLECTION = 'quote_actions'
/** 한 묶음 JSON 문자열의 상한 (기록기·서버·규칙이 같은 값을 쓴다) */
export const MAX_ACTIONS_CHARS = 12_000
/** 한 여정에서 보내는 최대 묶음 수 (탭을 켜 둔 채 방치된 경우 대비) */
export const MAX_BATCHES = 200
/** 아무 행동 없이 이보다 오래 지난 시간은 이만큼만 머문 것으로 센다 (자리 비움) */
export const IDLE_CAP_MS = 3 * 60 * 1000

export type QuoteActionKind =
  | 'v' | 'o' | 'oc' | 'p' | '+' | '-' | 's' | 'e' | 'c' | 'h' | 'i' | 'f' | 'x' | '$' | 'hide' | 'show' | 'end'
export type QuoteAction = [number, QuoteActionKind, (string | number)?, (string | number)?]

/** 견적 화면 단계 */
export const QUOTE_SCREENS = ['start', 'templates', 'cond1', 'cond2', 'experiences', 'form', 'done'] as const
export type QuoteScreen = (typeof QUOTE_SCREENS)[number]

export const SCREEN_LABELS: Record<QuoteScreen, string> = {
  start: '1. 시작 방법',
  templates: '1. 템플릿 고르기',
  cond1: '2. 행사 정보 (유형·인원·기간·지역)',
  cond2: '2. 행사 정보 (날짜·운영 방식)',
  experiences: '3. 체험 선택',
  form: '4. 견적서 받기',
  done: '완료',
}

/** 퍼널 단계 — 여정이 도달한 가장 깊은 단계까지 모두 지난 것으로 센다 */
export const FUNNEL = [
  { key: 'open', label: '견적 화면 열람', hint: '/quote 를 열었다' },
  { key: 'chose', label: '시작 방법 선택', hint: '템플릿 또는 직접 골라보기를 눌렀다' },
  { key: 'conditions', label: '행사 정보 입력', hint: '2단계 행사 정보 화면에 들어왔다' },
  { key: 'experiences', label: '체험 선택 화면', hint: '3단계에 들어왔다' },
  { key: 'options', label: '옵션 살펴봄', hint: '체험 옵션 창을 한 번 이상 열었다' },
  { key: 'form', label: '견적서 받기 화면', hint: '4단계에 들어왔다' },
  { key: 'contact', label: '연락처 입력 시작', hint: '이름·이메일 등 칸을 눌렀다' },
  { key: 'submit', label: '발급·요청 완료', hint: '가견적서를 받거나 상담을 요청했다' },
] as const
export type FunnelKey = (typeof FUNNEL)[number]['key']

export interface QuoteActionBatch {
  jid: string
  seq: number
  ts: Date
  actions: QuoteAction[]
  vid: string
  sid: string
  internal: boolean
  device: string
  channel: string
  source: string
  browser: string
  locale: string
}

export interface JourneyRecord {
  jid: string
  vid: string
  sid: string
  internal: boolean
  device: string
  channel: string
  source: string
  browser: string
  locale: string
  /** 여정을 시작한 대략의 시각 (첫 묶음 기록 시각 − 그 묶음 마지막 행동의 경과 시간) */
  startedAt: Date
  actions: QuoteAction[]
  /** 도달한 가장 깊은 퍼널 단계 (FUNNEL 의 순서) */
  depth: number
  submitted: 'pdf' | 'request' | null
  /** 실제로 보고 있던 시간 (탭 숨김 제외, 자리 비움은 IDLE_CAP_MS 까지) */
  activeMs: number
  lastScreen: QuoteScreen | null
  /** 이탈 직전 옵션 창 (서비스 · 페이지) */
  lastOptionPage: string | null
  lastAction: string | null
  finalTotal: number
  preset: string | null
  services: string[]
}

export function parseActions(raw: unknown): QuoteAction[] {
  if (typeof raw !== 'string') return []
  try {
    const value: unknown = JSON.parse(raw)
    if (!Array.isArray(value)) return []
    return value.filter((a): a is QuoteAction => Array.isArray(a) && typeof a[0] === 'number' && typeof a[1] === 'string')
  } catch {
    return []
  }
}

// ── 이름표 ───────────────────────────────────────────────

export const serviceName = (key: string) => SERVICE_TEXT[key as ServiceKey]?.name.ko ?? key
export const presetName = (id: string) =>
  id === 'blank' ? '직접 골라보기' : QUOTE_PRESETS.find((p) => p.id === id)?.title.ko ?? id

const TARGET_LABELS: Record<string, string> = {
  'quote-next': '다음',
  'quote-prev': '이전',
  'quote-start-blank': '시작: 직접 골라보기',
  'quote-start-templates': '시작: 템플릿 선택',
  'quote-back-to-start': '시작 방법 다시 고르기',
  'quote-clear': '견적 비우기 (요약)',
  'quote-preview-clear': '견적 비우고 처음으로',
  'option-page-next': '옵션 창: 다음 페이지',
  'option-page-previous': '옵션 창: 이전 페이지',
  'quote-options-close': '옵션 창 닫기 (X)',
  'quote-options-done': '옵션 창: 선택 완료',
  'event-preview-overview': '미리보기: 전체 행사 공간',
  'event-preview-detail': '미리보기: 선택한 체험 자세히',
  'event-custom-details': '미리보기: 태블릿 맞춤 콘텐츠 자세히',
  'preview-zoom-in': '미리보기: 확대',
  'preview-zoom-out': '미리보기: 축소',
  'preview-zoom-reset': '미리보기: 전체 보기',
  consent: '개인정보 수집 동의',
}

/** 클릭·머무름 대상 이름을 사람이 읽는 이름으로 바꾼다 */
export function targetLabel(name: string): string {
  if (TARGET_LABELS[name]) return TARGET_LABELS[name]
  const rules: [RegExp, (m: RegExpMatchArray) => string][] = [
    [/^quote-preset-(.+)$/, (m) => `템플릿 카드: ${presetName(m[1])}`],
    [/^quote-add-(.+)$/, (m) => `체험 카드 담기: ${serviceName(m[1])}`],
    [/^quote-edit-(.+)$/, (m) => `체험 카드 (담은 것): ${serviceName(m[1])}`],
    [/^quote-remove-(.+)$/, (m) => `체험 빼기: ${serviceName(m[1])}`],
    [/^perfume-space-(.+)$/, (m) => `향수 부스 공간: ${m[1] === 'none' ? '준비된 공간' : m[1]}`],
    [/^preview-view-(.+)$/, (m) => `미리보기 보기: ${m[1]}`],
    [/^service-preview-view-(.+)$/, (m) => `체험 미리보기 보기: ${m[1]}`],
    [/^event-focus-(.+)$/, (m) => `미리보기 체험 선택: ${serviceName(m[1])}`],
    [/^preview-photo-template-(.+)$/, (m) => `포토부스 스타일: ${m[1]}`],
    [/^option-tab-(.+)$/, (m) => `옵션 창 탭: ${m[1]}`],
  ]
  for (const [pattern, format] of rules) {
    const match = name.match(pattern)
    if (match) return format(match)
  }
  return name
}

const FIELD_LABELS: Record<string, string> = {
  name: '이름', email: '이메일', company: '회사·단체', phone: '연락처', note: '요청사항',
  eventType: '행사 유형', attendees: '예상 인원', days: '진행 일수', region: '행사 지역',
  eventDate: '행사 날짜', hoursPerDay: '하루 운영 시간', extraStaff: '도와줄 인력', setupDayBefore: '전날 설치',
}
export const fieldLabel = (key: string) => FIELD_LABELS[key] ?? key

// ── 여정 만들기 ──────────────────────────────────────────

const stageOf = (kind: QuoteActionKind, a: unknown): number => {
  if (kind === 'p') return 1
  if (kind === 'v') {
    if (a === 'templates') return 1
    if (a === 'cond1' || a === 'cond2') return 2
    if (a === 'experiences') return 3
    if (a === 'form') return 5
    if (a === 'done') return 7
  }
  if (kind === 'o') return 4
  if (kind === 'f') return 6
  if (kind === 'x' && (a === 'pdf' || a === 'request')) return 7
  return 0
}

function describe(action: QuoteAction): string {
  const [, kind, a, b] = action
  switch (kind) {
    case 'v': return `화면: ${SCREEN_LABELS[a as QuoteScreen] ?? a}`
    case 'o': return `옵션 창: ${serviceName(String(a))} · ${b ?? ''}`
    case 'oc': return `옵션 창 닫음: ${serviceName(String(a))}`
    case 'p': return `시작 구성: ${presetName(String(a))}`
    case '+': return `체험 담기: ${serviceName(String(a))}`
    case '-': return `체험 빼기: ${serviceName(String(a))}`
    case 's': return `옵션 변경: ${serviceName(String(a))} · ${b ?? ''}`
    case 'e': return `행사 정보 변경: ${fieldLabel(String(a))} = ${b ?? ''}`
    case 'c': return `클릭: ${targetLabel(String(a))}`
    case 'h': return `머묾: ${targetLabel(String(a))} (${Math.round(Number(b) / 100) / 10}초)`
    case 'i': return `안내 열람: ${a}`
    case 'f': return `연락처 칸: ${fieldLabel(String(a))}`
    case 'x': return a === 'pdf' ? '가견적서 발급' : a === 'request' ? '상담 요청' : a === 'invalid' ? '제출 실패 (입력 누락)' : '제출 오류'
    case '$': return `견적 금액: ${Number(a).toLocaleString('ko-KR')}원`
    case 'hide': return '탭 숨김'
    case 'show': return '탭 다시 봄'
    case 'end': return '페이지 떠남'
  }
}
export const describeAction = describe

/** 묶음들을 여정(jid)별로 모은다 */
export function buildJourneys(batches: QuoteActionBatch[]): JourneyRecord[] {
  const groups = new Map<string, QuoteActionBatch[]>()
  for (const batch of batches) {
    const list = groups.get(batch.jid)
    if (list) list.push(batch)
    else groups.set(batch.jid, [batch])
  }

  const journeys: JourneyRecord[] = []
  for (const [jid, list] of groups) {
    list.sort((x, y) => x.seq - y.seq)
    const first = list[0]
    const actions = list.flatMap((b) => b.actions).sort((x, y) => x[0] - y[0])
    const firstBatchEnd = first.actions.length ? Math.max(...first.actions.map((a) => a[0])) : 0

    let depth = 0
    let submitted: JourneyRecord['submitted'] = null
    let lastScreen: QuoteScreen | null = null
    let optionPage: string | null = null
    let lastOptionPage: string | null = null
    let lastAction: string | null = null
    let finalTotal = 0
    let preset: string | null = null
    const services = new Set<string>()
    for (const action of actions) {
      const [, kind, a, b] = action
      depth = Math.max(depth, stageOf(kind, a))
      if (kind === 'x' && (a === 'pdf' || a === 'request')) submitted = a
      if (kind === 'v') { lastScreen = a as QuoteScreen; optionPage = null }
      if (kind === 'o') optionPage = `${serviceName(String(a))} · ${b ?? ''}`
      if (kind === 'oc') optionPage = null
      if (kind === '$') finalTotal = Number(a) || 0
      if (kind === 'p') preset = String(a)
      if (kind === '+') services.add(String(a))
      if (kind === '-') services.delete(String(a))
      if (kind !== 'hide' && kind !== 'show' && kind !== 'end' && kind !== '$' && kind !== 'h') {
        lastAction = describe(action)
        lastOptionPage = optionPage
      }
    }

    journeys.push({
      jid,
      vid: first.vid,
      sid: first.sid,
      internal: first.internal,
      device: first.device,
      channel: first.channel,
      source: first.source,
      browser: first.browser,
      locale: first.locale,
      startedAt: new Date(first.ts.getTime() - firstBatchEnd),
      actions,
      depth,
      submitted,
      activeMs: dwell(actions).total,
      lastScreen,
      lastOptionPage,
      lastAction,
      finalTotal,
      preset,
      services: [...services],
    })
  }
  return journeys.sort((x, y) => y.startedAt.getTime() - x.startedAt.getTime())
}

/** 화면·옵션 페이지별로 실제 머문 시간 */
export function dwell(actions: QuoteAction[]) {
  const screens = new Map<string, number>()
  const options = new Map<string, number>()
  let total = 0
  let screen: string | null = null
  let option: string | null = null
  let hidden = false
  for (let i = 0; i < actions.length; i++) {
    const [at, kind, a, b] = actions[i]
    if (kind === 'v') { screen = String(a); option = null }
    if (kind === 'o') option = `${a}|${b ?? ''}`
    if (kind === 'oc') option = null
    if (kind === 'hide') hidden = true
    if (kind === 'show') hidden = false
    if (kind === 'end') break
    const next = actions[i + 1]
    if (!next || hidden) continue
    const gap = Math.min(Math.max(0, next[0] - at), IDLE_CAP_MS)
    total += gap
    if (screen) screens.set(screen, (screens.get(screen) ?? 0) + gap)
    if (option) options.set(option, (options.get(option) ?? 0) + gap)
  }
  return { total, screens, options }
}

// ── 통계 ────────────────────────────────────────────────

export interface CountRow {
  key: string
  label: string
  /** 전체 횟수 */
  count: number
  /** 한 번이라도 한 여정 수 */
  journeys: number
  /** 머문 시간 합 (ms) — 머무름·체류 통계에서만 */
  ms?: number
}

class Counter {
  private rows = new Map<string, { label: string; count: number; journeys: Set<string>; ms: number }>()
  add(key: string, label: string, jid: string, ms = 0) {
    const row = this.rows.get(key) ?? { label, count: 0, journeys: new Set<string>(), ms: 0 }
    row.count += 1
    row.journeys.add(jid)
    row.ms += ms
    this.rows.set(key, row)
  }
  list(sort: 'count' | 'journeys' | 'ms' = 'journeys'): CountRow[] {
    return [...this.rows]
      .map(([key, r]) => ({ key, label: r.label, count: r.count, journeys: r.journeys.size, ms: r.ms }))
      .sort((x, y) => (y[sort] ?? 0) - (x[sort] ?? 0) || y.count - x.count)
  }
}

export interface DwellRow {
  key: string
  label: string
  /** 들어온 여정 수 */
  journeys: number
  /** 머문 시간 중앙값·평균 (ms) */
  median: number
  mean: number
  /** 여기서 끝난 (발급·요청 없이 떠난) 여정 수 */
  exits: number
}

export interface QuoteBehaviorStats {
  journeys: number
  visitors: number
  submitted: number
  pdf: number
  request: number
  medianActiveMs: number
  meanFinalTotal: number
  funnel: { key: FunnelKey; label: string; hint: string; value: number }[]
  screens: DwellRow[]
  optionPages: DwellRow[]
  exitPoints: CountRow[]
  exitActions: CountRow[]
  exitTotals: { label: string; value: number }[]
  clicks: CountRow[]
  hovers: CountRow[]
  infos: CountRow[]
  presets: CountRow[]
  added: CountRow[]
  removed: CountRow[]
  optionChanges: CountRow[]
  conditionChanges: CountRow[]
  contactFields: CountRow[]
  devices: CountRow[]
  channels: CountRow[]
}

const median = (values: number[]) => {
  if (!values.length) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}
const mean = (values: number[]) => (values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0)

const EXIT_TOTAL_BUCKETS: [number, string][] = [
  [0, '금액 없음 (체험 안 담음)'],
  [1_000_000, '100만원 미만'],
  [3_000_000, '100만~300만원'],
  [5_000_000, '300만~500만원'],
  [10_000_000, '500만~1,000만원'],
  [Infinity, '1,000만원 이상'],
]

export function summarizeJourneys(journeys: JourneyRecord[]): QuoteBehaviorStats {
  const funnel = FUNNEL.map((f) => ({ ...f, value: 0 }))
  const screenDwell = new Map<string, number[]>()
  const optionDwell = new Map<string, number[]>()
  const screenExits = new Map<string, number>()
  const optionExits = new Map<string, number>()
  const exitPoints = new Counter()
  const exitActions = new Counter()
  const exitTotals = EXIT_TOTAL_BUCKETS.map(([, label]) => ({ label, value: 0 }))
  const clicks = new Counter()
  const hovers = new Counter()
  const infos = new Counter()
  const presets = new Counter()
  const added = new Counter()
  const removed = new Counter()
  const optionChanges = new Counter()
  const conditionChanges = new Counter()
  const contactFields = new Counter()
  const devices = new Counter()
  const channels = new Counter()

  for (const j of journeys) {
    for (let i = 0; i <= j.depth && i < funnel.length; i++) funnel[i].value += 1
    devices.add(j.device, j.device, j.jid)
    channels.add(j.channel, j.channel, j.jid)

    const { screens, options } = dwell(j.actions)
    for (const [key, ms] of screens) screenDwell.set(key, [...(screenDwell.get(key) ?? []), ms])
    for (const [key, ms] of options) optionDwell.set(key, [...(optionDwell.get(key) ?? []), ms])

    if (!j.submitted) {
      const point = j.lastScreen ? SCREEN_LABELS[j.lastScreen] + (j.lastOptionPage ? ` › 옵션 창 ${j.lastOptionPage}` : '') : '(화면 기록 없음)'
      exitPoints.add(point, point, j.jid)
      if (j.lastScreen) screenExits.set(j.lastScreen, (screenExits.get(j.lastScreen) ?? 0) + 1)
      const lastOption = [...j.actions].reverse().find((a) => a[1] === 'o' || a[1] === 'oc' || a[1] === 'v')
      if (lastOption?.[1] === 'o') {
        const key = `${lastOption[2]}|${lastOption[3] ?? ''}`
        optionExits.set(key, (optionExits.get(key) ?? 0) + 1)
      }
      if (j.lastAction) exitActions.add(j.lastAction, j.lastAction, j.jid)
      const bucket = EXIT_TOTAL_BUCKETS.findIndex(([limit]) => (limit === 0 ? j.finalTotal === 0 : j.finalTotal < limit))
      exitTotals[bucket].value += 1
    }

    for (const [, kind, a, b] of j.actions) {
      const key = String(a ?? '')
      if (kind === 'c') clicks.add(key, targetLabel(key), j.jid)
      if (kind === 'h') hovers.add(key, targetLabel(key), j.jid, Number(b) || 0)
      if (kind === 'i') infos.add(key, key, j.jid)
      if (kind === 'p') presets.add(key, presetName(key), j.jid)
      if (kind === '+') added.add(key, serviceName(key), j.jid)
      if (kind === '-') removed.add(key, serviceName(key), j.jid)
      if (kind === 's') optionChanges.add(`${key}|${b}`, `${serviceName(key)} · ${b ?? ''}`, j.jid)
      if (kind === 'e') conditionChanges.add(`${key}=${b}`, `${fieldLabel(key)} = ${b ?? ''}`, j.jid)
      if (kind === 'f') contactFields.add(key, fieldLabel(key), j.jid)
    }
  }

  const dwellRows = (source: Map<string, number[]>, exits: Map<string, number>, label: (key: string) => string, order?: string[]): DwellRow[] => {
    const rows = [...source].map(([key, values]) => ({
      key, label: label(key), journeys: values.length, median: median(values), mean: mean(values), exits: exits.get(key) ?? 0,
    }))
    return order
      ? rows.sort((x, y) => order.indexOf(x.key) - order.indexOf(y.key))
      : rows.sort((x, y) => y.journeys - x.journeys)
  }
  const submittedJourneys = journeys.filter((j) => j.submitted)
  const withTotal = journeys.filter((j) => j.finalTotal > 0)

  return {
    journeys: journeys.length,
    visitors: new Set(journeys.map((j) => j.vid)).size,
    submitted: submittedJourneys.length,
    pdf: journeys.filter((j) => j.submitted === 'pdf').length,
    request: journeys.filter((j) => j.submitted === 'request').length,
    medianActiveMs: median(journeys.map((j) => j.activeMs)),
    meanFinalTotal: mean(withTotal.map((j) => j.finalTotal)),
    funnel,
    screens: dwellRows(screenDwell, screenExits, (k) => SCREEN_LABELS[k as QuoteScreen] ?? k, [...QUOTE_SCREENS]),
    optionPages: dwellRows(optionDwell, optionExits, (k) => { const [s, p] = k.split('|'); return `${serviceName(s)} · ${p}` }),
    exitPoints: exitPoints.list(),
    exitActions: exitActions.list(),
    exitTotals,
    clicks: clicks.list(),
    hovers: hovers.list('ms'),
    infos: infos.list(),
    presets: presets.list(),
    added: added.list(),
    removed: removed.list(),
    optionChanges: optionChanges.list(),
    conditionChanges: conditionChanges.list(),
    contactFields: contactFields.list(),
    devices: devices.list(),
    channels: channels.list(),
  }
}
