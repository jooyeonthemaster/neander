// ============================================================
// 유입 분석 - 원본 이벤트 → 요약 집계
// 하루치 이벤트를 요약(Summary)으로 만들고, 요약끼리 합쳐 월·연·임의 기간을 계산한다.
// 순수 함수만 두어 관리자 화면과 테스트에서 그대로 쓸 수 있게 한다.
// ============================================================

import type { Channel, DeviceType } from './sources'
import { kstHour } from './period'

export const EVENTS_COLLECTION = 'analytics_events'
export const DAILY_COLLECTION = 'analytics_daily'

/** 요약 구조가 바뀌면 올려서 저장된 일별 요약을 다시 계산하게 한다 */
export const SUMMARY_VERSION = 4

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
  /** 내부(팀) 기기로 표시된 브라우저의 방문 */
  internal: boolean
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

/** 한 분류(채널·소스·기기 등)의 방문 성과 */
export interface Stat {
  /** 방문(세션) 수 */
  ss: number
  /** 페이지뷰 */
  pv: number
  /** 이탈한 방문 수 */
  bounces: number
  /** 체류시간 합계(ms) */
  dur: number
  /** 문의·견적을 접수한 방문 수 */
  conv: number
}

export type StatMap = Record<string, Stat>

export interface PageStat {
  /** 조회수 */
  pv: number
  /** 체류시간 합계(ms)와 표본 수 */
  dur: number
  durN: number
  /** 스크롤 깊이 합계(%)와 표본 수 */
  scroll: number
  scrollN: number
  /** 이 페이지로 시작한 방문 수 */
  entries: number
  /** 이 페이지를 끝으로 떠난 방문 수 */
  exits: number
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
  /** 문의·견적을 접수한 방문 수 */
  convSessions: number
  /** 접수까지 본 페이지 수·체류시간 합계 (전환한 방문의 평균을 내기 위해) */
  convPageviews: number
  convMs: number
  // 아래 성과 지표는 방문(세션)의 첫 페이지 기준으로 분류한다
  channels: StatMap
  /** `${channel}\t${source}` */
  sources: StatMap
  campaigns: StatMap
  landings: StatMap
  devices: StatMap
  /** 'new' | 'returning' */
  visitorTypes: StatMap
  keywords: Counter
  browsers: Counter
  os: Counter
  countries: Counter
  /** `${country}\t${region}` */
  regions: Counter
  /** `${country}\t${region}\t${city}` */
  cities: Counter
  /** 브라우저 설정 언어 (방문 기준) */
  langs: Counter
  /** 사이트 언어 버전 (페이지뷰 기준) */
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

export function emptyStat(): Stat {
  return { ss: 0, pv: 0, bounces: 0, dur: 0, conv: 0 }
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
    convPageviews: 0,
    convMs: 0,
    channels: {},
    sources: {},
    campaigns: {},
    landings: {},
    devices: {},
    visitorTypes: {},
    keywords: {},
    browsers: {},
    os: {},
    countries: {},
    regions: {},
    cities: {},
    langs: {},
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

function addStat(map: StatMap, key: string | null | undefined, stat: Stat) {
  if (!key) return
  const target = (map[key] ??= emptyStat())
  target.ss += stat.ss
  target.pv += stat.pv
  target.bounces += stat.bounces
  target.dur += stat.dur
  target.conv += stat.conv
}

function page(pages: Record<string, PageStat>, path: string): PageStat {
  pages[path] ??= { pv: 0, dur: 0, durN: 0, scroll: 0, scrollN: 0, entries: 0, exits: 0 }
  return pages[path]
}

export function sourceKey(channel: string, source: string): string {
  return `${channel}\t${source}`
}

export function splitSourceKey(key: string): { channel: Channel; source: string } {
  const [channel, source] = key.split('\t')
  return { channel: channel as Channel, source: source ?? '' }
}

/** 내부(팀) 방문과 외부(실제 방문자) 기록을 나눈다 */
export function splitInternal(events: AnalyticsEvent[]): { external: AnalyticsEvent[]; internal: AnalyticsEvent[] } {
  const external: AnalyticsEvent[] = []
  const internal: AnalyticsEvent[] = []
  for (const event of events) (event.internal ? internal : external).push(event)
  return { external, internal }
}

/** 세션 단위로 묶은 방문 기록 (방문 로그 화면용) */
export interface SessionRecord {
  sid: string
  vid: string
  first: AnalyticsEvent
  start: Date
  end: Date
  newVisitor: boolean
  internal: boolean
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
      internal: timeline.some((e) => e.internal),
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
    const stat: Stat = {
      ss: 1,
      pv: session.pageviews.length,
      bounces: session.bounced ? 1 : 0,
      dur: session.engagedMs,
      conv: session.converted ? 1 : 0,
    }

    summary.sessions += 1
    summary.hours[kstHour(session.start)].ss += 1
    if (session.newVisitor) newVids.add(session.vid)
    if (session.bounced) summary.bounces += 1
    if (session.converted) {
      summary.convSessions += 1
      summary.convPageviews += stat.pv
      summary.convMs += stat.dur
    }

    addStat(summary.channels, first.channel, stat)
    addStat(summary.sources, sourceKey(first.channel, first.source), stat)
    addStat(summary.campaigns, first.campaign, stat)
    addStat(summary.devices, first.device, stat)
    addStat(summary.visitorTypes, session.newVisitor ? 'new' : 'returning', stat)
    bump(summary.keywords, first.keyword)
    bump(summary.browsers, first.browser)
    bump(summary.os, first.os)
    bump(summary.countries, first.country)
    bump(summary.regions, first.region ? `${first.country ?? ''}\t${first.region}` : null)
    bump(summary.cities, first.city ? `${first.country ?? ''}\t${first.region ?? ''}\t${first.city}` : null)
    bump(summary.langs, first.lang)

    const entry = session.pageviews[0]
    if (entry) {
      addStat(summary.landings, entry.path, stat)
      page(summary.pages, entry.path).entries += 1
    }
    const exit = session.pageviews[session.pageviews.length - 1]
    if (exit) page(summary.pages, exit.path).exits += 1
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

function mergeStatMap(target: StatMap, source: StatMap | undefined) {
  for (const [key, stat] of Object.entries(source ?? {})) addStat(target, key, stat)
}

const STAT_KEYS = [
  'channels',
  'sources',
  'campaigns',
  'landings',
  'devices',
  'visitorTypes',
] as const satisfies readonly (keyof Summary)[]

const COUNTER_KEYS = [
  'keywords',
  'browsers',
  'os',
  'countries',
  'regions',
  'cities',
  'langs',
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
    merged.convPageviews += summary.convPageviews
    merged.convMs += summary.convMs
    summary.vids.forEach((v) => vids.add(v))
    summary.newVids.forEach((v) => newVids.add(v))
    for (const key of STAT_KEYS) mergeStatMap(merged[key], summary[key])
    for (const key of COUNTER_KEYS) mergeCounter(merged[key], summary[key])
    for (const [path, stat] of Object.entries(summary.pages)) {
      const target = page(merged.pages, path)
      target.pv += stat.pv
      target.dur += stat.dur
      target.durN += stat.durN
      target.scroll += stat.scroll
      target.scrollN += stat.scrollN
      target.entries += stat.entries
      target.exits += stat.exits ?? 0
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
  returningVisitors: number
  sessions: number
  pageviews: number
  /** 방문당 평균 체류시간(ms) */
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
    returningVisitors: Math.max(0, summary.vids.length - summary.newVids.length),
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

function capStatMap(map: StatMap, max: number): StatMap {
  const entries = Object.entries(map)
  if (entries.length <= max) return map
  return Object.fromEntries(entries.sort((a, b) => b[1].ss - a[1].ss).slice(0, max))
}

/** 일별 요약 문서 크기를 제한한다 (긴 꼬리 항목은 잘라낸다) */
export function compactSummary(summary: Summary): Summary {
  const compact: Summary = { ...summary }
  for (const key of STAT_KEYS) compact[key] = capStatMap(summary[key], 300)
  for (const key of COUNTER_KEYS) compact[key] = capCounter(summary[key], 300)
  const pages = Object.entries(summary.pages)
  if (pages.length > 500) {
    compact.pages = Object.fromEntries(pages.sort((a, b) => b[1].pv - a[1].pv).slice(0, 500))
  }
  return compact
}
