// ============================================================
// 유입 분석 - 원본 이벤트 → 요약 집계
// 하루치 이벤트를 요약(Summary)으로 만들고, 요약끼리 합쳐 월·연 단위를 계산한다.
// 순수 함수만 두어 관리자 화면과 테스트에서 그대로 쓸 수 있게 한다.
// ============================================================

import type { Channel, DeviceType } from './sources'
import { kstHour } from './period'

export const EVENTS_COLLECTION = 'analytics_events'
export const DAILY_COLLECTION = 'analytics_daily'

/** 요약 구조가 바뀌면 올려서 저장된 일별 요약을 다시 계산하게 한다 */
export const SUMMARY_VERSION = 2

/** 한 페이지만 보고 10초 안에 아무 행동 없이 떠난 세션을 이탈로 본다 */
export const BOUNCE_MAX_MS = 10_000

/** analytics_events 문서 (관리자 화면에서 읽은 형태) */
export interface AnalyticsEvent {
  id: string
  type: 'pageview' | 'event'
  name: string | null
  label: string | null
  path: string
  locale: string | null
  vid: string
  sid: string
  new_visitor: boolean
  entry: boolean
  channel: Channel
  source: string
  medium: string | null
  campaign: string | null
  keyword: string | null
  referrer: string | null
  landing: string | null
  device: DeviceType
  browser: string
  os: string
  inapp: string | null
  country: string | null
  /** 시·도 코드 (ISO 3166-2, 예: 서울 '11') */
  region: string | null
  city: string | null
  lang: string | null
  /** 페이지를 보고 있던 시간(ms). 페이지를 떠날 때 채워진다 */
  dur: number | null
  /** 최대 스크롤 깊이(%) */
  scroll: number | null
  ts: Date
}

export type Counter = Record<string, number>

export interface PageStat {
  /** 조회수 */
  pv: number
  /** 체류시간 합계(ms)와 표본 수 */
  dur: number
  durN: number
  /** 스크롤 깊이 합계(%)와 표본 수 */
  scroll: number
  scrollN: number
  /** 이 페이지로 시작한 세션 수 */
  entries: number
}

export interface HourStat {
  pv: number
  ss: number
  uv: number
}

export interface Summary {
  pageviews: number
  sessions: number
  /** 방문자(브라우저) 식별값. 기간을 합칠 때 중복 없이 세기 위해 보관한다 */
  vids: string[]
  /** 이 기간에 처음 방문한 방문자 */
  newVids: string[]
  bounces: number
  /** 페이지 체류시간 합계(ms) */
  engagedMs: number
  /** 문의·견적을 접수한 세션 수 */
  convSessions: number
  // 아래 카운터는 모두 세션 수 기준 (pages·locales·events 제외)
  channels: Counter
  /** `${channel}\t${source}` */
  sources: Counter
  convByChannel: Counter
  campaigns: Counter
  keywords: Counter
  landings: Counter
  devices: Counter
  browsers: Counter
  os: Counter
  countries: Counter
  /** `${country}\t${region}` */
  regions: Counter
  /** `${country}\t${region}\t${city}` */
  cities: Counter
  /** 페이지뷰 기준 */
  locales: Counter
  /** 이벤트 이름별 발생 수 */
  events: Counter
  /** 접수된 문의 종류 (contact / quote) */
  inquiries: Counter
  /** 외부 링크 클릭 대상 */
  outbound: Counter
  pages: Record<string, PageStat>
  /** KST 0~23시 */
  hours: HourStat[]
}

export function emptySummary(): Summary {
  return {
    pageviews: 0,
    sessions: 0,
    vids: [],
    newVids: [],
    bounces: 0,
    engagedMs: 0,
    convSessions: 0,
    channels: {},
    sources: {},
    convByChannel: {},
    campaigns: {},
    keywords: {},
    landings: {},
    devices: {},
    browsers: {},
    os: {},
    countries: {},
    regions: {},
    cities: {},
    locales: {},
    events: {},
    inquiries: {},
    outbound: {},
    pages: {},
    hours: Array.from({ length: 24 }, () => ({ pv: 0, ss: 0, uv: 0 })),
  }
}

function bump(counter: Counter, key: string | null | undefined, amount = 1) {
  if (!key) return
  counter[key] = (counter[key] ?? 0) + amount
}

function page(pages: Record<string, PageStat>, path: string): PageStat {
  pages[path] ??= { pv: 0, dur: 0, durN: 0, scroll: 0, scrollN: 0, entries: 0 }
  return pages[path]
}

export function sourceKey(channel: string, source: string): string {
  return `${channel}\t${source}`
}

export function splitSourceKey(key: string): { channel: Channel; source: string } {
  const [channel, source] = key.split('\t')
  return { channel: channel as Channel, source: source ?? '' }
}

/** 세션 단위로 묶은 방문 기록 (방문 로그 화면용) */
export interface SessionRecord {
  sid: string
  vid: string
  first: AnalyticsEvent
  start: Date
  end: Date
  newVisitor: boolean
  pageviews: AnalyticsEvent[]
  actions: AnalyticsEvent[]
  timeline: AnalyticsEvent[]
  engagedMs: number
  converted: boolean
  bounced: boolean
}

export function groupSessions(events: AnalyticsEvent[]): SessionRecord[] {
  const bySession = new Map<string, AnalyticsEvent[]>()
  for (const event of [...events].sort((a, b) => a.ts.getTime() - b.ts.getTime())) {
    const list = bySession.get(event.sid)
    if (list) list.push(event)
    else bySession.set(event.sid, [event])
  }

  return [...bySession.entries()].map(([sid, timeline]) => {
    const first = timeline.find((e) => e.type === 'pageview') ?? timeline[0]
    const pageviews = timeline.filter((e) => e.type === 'pageview')
    const actions = timeline.filter((e) => e.type === 'event')
    const engagedMs = pageviews.reduce((sum, e) => sum + (e.dur ?? 0), 0)
    const converted = actions.some((e) => e.name === 'inquiry_submit')
    return {
      sid,
      vid: first.vid,
      first,
      start: timeline[0].ts,
      end: timeline[timeline.length - 1].ts,
      newVisitor: timeline.some((e) => e.new_visitor),
      pageviews,
      actions,
      timeline,
      engagedMs,
      converted,
      bounced: pageviews.length <= 1 && engagedMs < BOUNCE_MAX_MS && actions.length === 0,
    }
  })
}

/** 원본 이벤트(보통 하루치)를 요약한다 */
export function summarize(events: AnalyticsEvent[]): Summary {
  const summary = emptySummary()
  const vids = new Set<string>()
  const newVids = new Set<string>()
  const hourVisitors = Array.from({ length: 24 }, () => new Set<string>())

  for (const event of events) {
    vids.add(event.vid)
    if (event.type === 'pageview') {
      const hour = kstHour(event.ts)
      summary.pageviews += 1
      summary.hours[hour].pv += 1
      hourVisitors[hour].add(event.vid)
      bump(summary.locales, event.locale)
      const stat = page(summary.pages, event.path)
      stat.pv += 1
      if (event.dur && event.dur > 0) {
        stat.dur += event.dur
        stat.durN += 1
        summary.engagedMs += event.dur
      }
      if (event.scroll != null) {
        stat.scroll += event.scroll
        stat.scrollN += 1
      }
    } else if (event.name) {
      bump(summary.events, event.name)
      if (event.name === 'inquiry_submit') bump(summary.inquiries, event.label ?? 'contact')
      if (event.name === 'click_outbound') bump(summary.outbound, event.label)
    }
  }

  for (const session of groupSessions(events)) {
    const { first } = session
    summary.sessions += 1
    summary.hours[kstHour(session.start)].ss += 1
    if (session.newVisitor) newVids.add(session.vid)
    if (session.bounced) summary.bounces += 1
    if (session.converted) {
      summary.convSessions += 1
      bump(summary.convByChannel, first.channel)
    }
    bump(summary.channels, first.channel)
    bump(summary.sources, sourceKey(first.channel, first.source))
    bump(summary.campaigns, first.campaign)
    bump(summary.keywords, first.keyword)
    bump(summary.devices, first.device)
    bump(summary.browsers, first.browser)
    bump(summary.os, first.os)
    bump(summary.countries, first.country)
    bump(summary.regions, first.region ? `${first.country ?? ''}\t${first.region}` : null)
    bump(summary.cities, first.city ? `${first.country ?? ''}\t${first.region ?? ''}\t${first.city}` : null)

    const entry = session.pageviews[0]
    if (entry) {
      bump(summary.landings, entry.path)
      page(summary.pages, entry.path).entries += 1
    }
  }

  summary.vids = [...vids]
  summary.newVids = [...newVids]
  summary.hours.forEach((hour, i) => {
    hour.uv = hourVisitors[i].size
  })
  return summary
}

function mergeCounter(target: Counter, source: Counter) {
  for (const [key, value] of Object.entries(source)) target[key] = (target[key] ?? 0) + value
}

const COUNTER_KEYS = [
  'channels',
  'sources',
  'convByChannel',
  'campaigns',
  'keywords',
  'landings',
  'devices',
  'browsers',
  'os',
  'countries',
  'regions',
  'cities',
  'locales',
  'events',
  'inquiries',
  'outbound',
] as const satisfies readonly (keyof Summary)[]

/** 여러 요약을 합친다. 방문자 수는 식별값을 합쳐 중복 없이 센다 */
export function mergeSummaries(list: Summary[]): Summary {
  const merged = emptySummary()
  const vids = new Set<string>()
  const newVids = new Set<string>()

  for (const summary of list) {
    merged.pageviews += summary.pageviews
    merged.sessions += summary.sessions
    merged.bounces += summary.bounces
    merged.engagedMs += summary.engagedMs
    merged.convSessions += summary.convSessions
    summary.vids.forEach((v) => vids.add(v))
    summary.newVids.forEach((v) => newVids.add(v))
    for (const key of COUNTER_KEYS) mergeCounter(merged[key], summary[key])
    for (const [path, stat] of Object.entries(summary.pages)) {
      const target = page(merged.pages, path)
      target.pv += stat.pv
      target.dur += stat.dur
      target.durN += stat.durN
      target.scroll += stat.scroll
      target.scrollN += stat.scrollN
      target.entries += stat.entries
    }
    summary.hours.forEach((hour, i) => {
      merged.hours[i].pv += hour.pv
      merged.hours[i].ss += hour.ss
      merged.hours[i].uv += hour.uv
    })
  }

  merged.vids = [...vids]
  merged.newVids = [...newVids]
  return merged
}

export interface Metrics {
  visitors: number
  newVisitors: number
  sessions: number
  pageviews: number
  /** 세션당 평균 체류시간(ms) */
  avgSessionMs: number
  pagesPerSession: number
  bounceRate: number
  conversions: number
  conversionRate: number
}

export function metricsOf(summary: Summary): Metrics {
  const { sessions } = summary
  return {
    visitors: summary.vids.length,
    newVisitors: summary.newVids.length,
    sessions,
    pageviews: summary.pageviews,
    avgSessionMs: sessions ? summary.engagedMs / sessions : 0,
    pagesPerSession: sessions ? summary.pageviews / sessions : 0,
    bounceRate: sessions ? summary.bounces / sessions : 0,
    conversions: summary.events.inquiry_submit ?? 0,
    conversionRate: sessions ? summary.convSessions / sessions : 0,
  }
}

function capCounter(counter: Counter, max: number): Counter {
  const entries = Object.entries(counter)
  if (entries.length <= max) return counter
  return Object.fromEntries(entries.sort((a, b) => b[1] - a[1]).slice(0, max))
}

/** 일별 요약 문서 크기를 제한한다 (긴 꼬리 항목은 잘라낸다) */
export function compactSummary(summary: Summary): Summary {
  const compact: Summary = { ...summary }
  for (const key of COUNTER_KEYS) compact[key] = capCounter(summary[key], 300)
  const pages = Object.entries(summary.pages)
  if (pages.length > 500) {
    compact.pages = Object.fromEntries(pages.sort((a, b) => b[1].pv - a[1].pv).slice(0, 500))
  }
  return compact
}
