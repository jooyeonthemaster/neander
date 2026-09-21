'use client'

import { useEffect, useState } from 'react'
import { FirebaseError } from 'firebase/app'
import {
  emptySummary,
  groupSessions,
  mergeSummaries,
  splitInternal,
  summarize,
  type AnalyticsEvent,
  type SessionRecord,
  type Summary,
} from '@/lib/analytics/aggregate'
import {
  fetchEvents,
  loadDailySummaries,
  subscribeEvents,
  summarizeDay,
  type DaySummaries,
} from '@/lib/analytics/admin'
import {
  comparisonOf,
  dayEnd,
  dayKeyOf,
  dayStart,
  daysBetween,
  kstHour,
  periodOf,
  shortDayLabel,
  todayKey,
  type Comparison,
  type Period,
  type PeriodMode,
} from '@/lib/analytics/period'

/** 이 일수 이하의 기간은 원본을 직접 읽어 방문 기록까지 보여준다 */
const RAW_LOG_MAX_DAYS = 7
/** 요일·시간대 분포는 이 일수 이상일 때만 의미가 있다 */
const HEATMAP_MIN_DAYS = 7
const ACTIVE_WINDOW_MS = 30 * 60 * 1000

export type Granularity = 'hour' | 'day' | 'week' | 'month'

/** 내부(팀) 방문을 어떻게 다룰지 */
export type VisitorFilter = 'external' | 'all' | 'internal'

export const VISITOR_FILTERS: { value: VisitorFilter; label: string; hint: string }[] = [
  { value: 'external', label: '내부 제외', hint: '내부 기기로 표시된 방문을 뺀 수치 (기본)' },
  { value: 'all', label: '전체', hint: '내부 방문까지 모두 포함한 수치' },
  { value: 'internal', label: '내부만', hint: '내부 기기로 표시된 방문만' },
]

/** 하루치 요약에서 보고 싶은 쪽을 고른다 */
function pickSummary(day: DaySummaries, filter: VisitorFilter): Summary {
  if (filter === 'external') return day.external
  if (filter === 'internal') return day.internal
  return mergeSummaries([day.external, day.internal])
}

function pickDays(days: Map<string, DaySummaries>, filter: VisitorFilter): Map<string, Summary> {
  return new Map([...days].map(([key, value]) => [key, pickSummary(value, filter)]))
}

export interface DrillTarget {
  mode: PeriodMode
  anchor: string
  rangeEnd?: string
}

export interface Bucket {
  key: string
  /** 축 라벨 */
  label: string
  /** 툴팁 제목 */
  title: string
  pv: number
  ss: number
  uv: number
  /** 아직 오지 않은 구간 (막대를 그리지 않는다) */
  future: boolean
  /** 막대를 누르면 이동할 기간 */
  drill: DrillTarget | null
}

export interface Report {
  period: Period
  comparison: Comparison
  current: Summary
  previous: Summary | null
  granularity: Granularity
  buckets: Bucket[]
  /** 날짜별 요약 (CSV 내보내기·요일 분포용, 최신 데이터 포함) */
  days: Map<string, Summary>
  /** 요일(0=일) × 시간(0~23) 방문 수. 기간이 짧으면 null */
  heatmap: number[][] | null
  /** 기간이 짧을 때만 채운다 (최신 방문이 앞) */
  sessions: SessionRecord[] | null
  /** 내부(팀) 방문 수 - 기본 화면에서 빠진 양을 알려주기 위해 따로 센다 */
  internalSessions: number
  /** 오늘이 포함되어 실시간으로 갱신되는 중인지 */
  live: boolean
  /** 최근 30분 안에 페이지를 본 방문자 수 (오늘이 포함될 때만) */
  activeNow: number | null
}

function describeError(error: unknown): string {
  if (error instanceof FirebaseError && error.code === 'permission-denied') {
    return 'Firestore 규칙(analytics_events·analytics_daily)이 배포되지 않았거나 관리자 권한이 없습니다. firebase deploy --only firestore:rules 를 실행했는지 확인해 주세요.'
  }
  return '분석 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.'
}

function weekdayOf(day: string): number {
  const [y, m, d] = day.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay()
}

/** 기간 길이에 맞는 막대 단위 */
function granularityOf(period: Period): Granularity {
  if (period.mode === 'day') return 'hour'
  if (period.mode === 'month') return 'day'
  if (period.mode === 'year') return 'month'
  const length = daysBetween(period.start, period.end).length
  if (length <= 1) return 'hour'
  if (length <= 45) return 'day'
  if (length <= 400) return 'week'
  return 'month'
}

function summaryOf(days: Map<string, Summary>, keys: string[]): Summary {
  return mergeSummaries(keys.map((key) => days.get(key)).filter((s): s is Summary => !!s))
}

function bucketOf(keys: string[], days: Map<string, Summary>, today: string, label: string, title: string, drill: DrillTarget | null): Bucket {
  const merged = summaryOf(days, keys)
  return {
    key: keys[0],
    label,
    title,
    pv: merged.pageviews,
    ss: merged.sessions,
    uv: merged.vids.length,
    future: keys[0] > today,
    drill: keys[0] > today ? null : drill,
  }
}

function buildBuckets(period: Period, granularity: Granularity, days: Map<string, Summary>): Bucket[] {
  const today = todayKey()

  if (granularity === 'hour') {
    const summary = days.get(period.start) ?? emptySummary()
    const currentHour = kstHour(new Date())
    return summary.hours.map((hour, i) => ({
      key: String(i),
      label: `${i}시`,
      title: `${i}시 ~ ${i + 1}시`,
      pv: hour.pv,
      ss: hour.ss,
      uv: hour.uv,
      future: period.start > today || (period.start === today && i > currentHour),
      drill: null,
    }))
  }

  const keys = daysBetween(period.start, period.end)

  if (granularity === 'day') {
    return keys.map((day) =>
      bucketOf([day], days, today, String(Number(day.slice(8))), shortDayLabel(day), { mode: 'day', anchor: day })
    )
  }

  if (granularity === 'week') {
    const weeks: string[][] = []
    for (const day of keys) {
      // 월요일에 새 주를 연다
      if (weeks.length === 0 || weekdayOf(day) === 1) weeks.push([day])
      else weeks[weeks.length - 1].push(day)
    }
    return weeks.map((week) => {
      const first = week[0]
      const last = week[week.length - 1]
      return bucketOf(
        week,
        days,
        today,
        `${Number(first.slice(5, 7))}/${Number(first.slice(8))}`,
        `${shortDayLabel(first)} ~ ${shortDayLabel(last)}`,
        { mode: 'range', anchor: first, rangeEnd: last }
      )
    })
  }

  const months = new Map<string, string[]>()
  for (const day of keys) {
    const month = day.slice(0, 7)
    const list = months.get(month)
    if (list) list.push(day)
    else months.set(month, [day])
  }
  return [...months.entries()].map(([month, monthDays]) =>
    bucketOf(
      monthDays,
      days,
      today,
      `${Number(month.slice(5))}월`,
      `${month.slice(0, 4)}년 ${Number(month.slice(5))}월`,
      { mode: 'month', anchor: `${month}-01` }
    )
  )
}

/** 요일 × 시간대 방문 분포 */
function buildHeatmap(period: Period, days: Map<string, Summary>): number[][] | null {
  if (daysBetween(period.start, period.end).length < HEATMAP_MIN_DAYS) return null
  const grid = Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => 0))
  for (const [day, summary] of days) {
    if (day < period.start || day > period.end) continue
    const weekday = weekdayOf(day)
    summary.hours.forEach((hour, i) => {
      grid[weekday][i] += hour.ss
    })
  }
  return grid
}

function activeVisitors(events: AnalyticsEvent[]): number {
  const since = Date.now() - ACTIVE_WINDOW_MS
  return new Set(events.filter((e) => e.ts.getTime() >= since).map((e) => e.vid)).size
}

/** 원본 이벤트를 날짜별 요약(외부·내부)으로 나눈다 */
function summarizeByDay(events: AnalyticsEvent[]): Map<string, DaySummaries> {
  const byDay = new Map<string, AnalyticsEvent[]>()
  for (const event of events) {
    const key = dayKeyOf(event.ts)
    const list = byDay.get(key)
    if (list) list.push(event)
    else byDay.set(key, [event])
  }
  return new Map([...byDay].map(([day, list]) => [day, summarizeDay(list)]))
}

async function loadPrevious(comparison: Comparison, filter: VisitorFilter): Promise<Summary> {
  if (comparison.until) {
    const { external, internal } = splitInternal(await fetchEvents(dayStart(comparison.start), comparison.until))
    return summarize(filter === 'internal' ? internal : filter === 'all' ? [...external, ...internal] : external)
  }
  const days = await loadDailySummaries(comparison.start, comparison.end)
  return mergeSummaries([...days.values()].map((day) => pickSummary(day, filter)))
}

/**
 * 선택한 기간(일·월·연·직접 선택)의 분석 데이터를 불러온다.
 * 기간이 짧으면 원본 이벤트로 방문 기록까지 만들고, 길면 저장된 일별 요약을 합친다.
 * 오늘이 포함된 기간은 오늘 기록을 실시간으로 구독해 계속 갱신한다.
 */
export function useAnalyticsReport(
  mode: PeriodMode,
  anchor: string,
  rangeEnd: string,
  visitorFilter: VisitorFilter,
  reloadKey: number
) {
  const requestKey = `${mode}|${anchor}|${rangeEnd}|${visitorFilter}|${reloadKey}`
  // 결과마다 어떤 요청의 것인지 기록해 두고, 새 요청이 끝나기 전에는 이전 화면을 그대로 보여준다
  const [result, setResult] = useState<{ key: string; report: Report | null; error: string | null }>({
    key: '',
    report: null,
    error: null,
  })
  const [progress, setProgress] = useState<{ key: string; text: string } | null>(null)

  useEffect(() => {
    let cancelled = false
    let unsubscribe: (() => void) | null = null
    const period = periodOf(mode, anchor, rangeEnd)
    const comparison = comparisonOf(period)
    const granularity = granularityOf(period)
    const today = todayKey()
    const live = period.start <= today && today <= period.end
    const spanDays = daysBetween(period.start, period.end).length
    const withLog = spanDays <= RAW_LOG_MAX_DAYS

    const publish = (report: Report) => {
      if (!cancelled) setResult({ key: requestKey, report, error: null })
    }

    const fail = (err: unknown) => {
      if (cancelled) return
      console.error('[analytics] 불러오기 실패:', err)
      setResult((prev) => ({ key: requestKey, report: prev.report, error: describeError(err) }))
    }

    function build(
      dayMap: Map<string, DaySummaries>,
      sessions: SessionRecord[] | null,
      previous: Summary | null,
      liveEvents: AnalyticsEvent[]
    ): Report {
      const keys = daysBetween(period.start, period.end)
      const days = pickDays(dayMap, visitorFilter)
      const internalSessions = keys.reduce((sum, key) => sum + (dayMap.get(key)?.internal.sessions ?? 0), 0)
      return {
        period,
        comparison,
        current: summaryOf(days, keys),
        previous,
        granularity,
        buckets: buildBuckets(period, granularity, days),
        days,
        heatmap: buildHeatmap(period, days),
        sessions,
        internalSessions,
        live,
        activeNow: live ? activeVisitors(liveEvents) : null,
      }
    }

    async function run() {
      const previousPromise = loadPrevious(comparison, visitorFilter)
      // 아래에서 await 할 때 오류가 전달된다. 그 전에 실패해도 처리되지 않은 거부로 남지 않게 한다
      previousPromise.catch(() => {})

      if (withLog) {
        // 짧은 기간: 원본을 직접 읽어 요약과 방문 기록을 함께 만든다
        const rawEnd = live ? dayStart(today) : dayEnd(period.end)
        const past = rawEnd > dayStart(period.start) ? await fetchEvents(dayStart(period.start), rawEnd) : []
        const previous = await previousPromise
        if (cancelled) return

        const render = (todayEvents: AnalyticsEvent[]) => {
          const events = [...past, ...todayEvents]
          const shown =
            visitorFilter === 'all' ? events : events.filter((e) => e.internal === (visitorFilter === 'internal'))
          const sessions = groupSessions(shown).sort((a, b) => b.start.getTime() - a.start.getTime())
          publish(build(summarizeByDay(events), sessions, previous, todayEvents))
        }

        if (live) {
          unsubscribe = subscribeEvents(dayStart(today), dayEnd(today), (events) => render(events), fail)
        } else {
          render([])
        }
        return
      }

      const days = await loadDailySummaries(period.start, period.end, (done, total) => {
        if (!cancelled && total > 3) {
          setProgress({ key: requestKey, text: `지난 기록을 정리하는 중 (${done}/${total}일)` })
        }
      })
      const previous = await previousPromise
      if (cancelled) return
      setProgress(null)

      if (live) {
        unsubscribe = subscribeEvents(
          dayStart(today),
          dayEnd(today),
          (events) => publish(build(new Map(days).set(today, summarizeDay(events)), null, previous, events)),
          fail
        )
      } else {
        publish(build(days, null, previous, []))
      }
    }

    run().catch(fail)

    return () => {
      cancelled = true
      unsubscribe?.()
    }
  }, [mode, anchor, rangeEnd, visitorFilter, requestKey])

  return {
    report: result.report,
    loading: result.key !== requestKey,
    error: result.key === requestKey ? result.error : null,
    progress: progress?.key === requestKey ? progress.text : null,
  }
}

/** 기간 안에서 오늘까지의 날짜만 (CSV에서 빈 미래 날짜를 빼기 위해) */
export function pastDays(period: Period): string[] {
  const today = todayKey()
  const end = period.end < today ? period.end : today
  return period.start > end ? [] : daysBetween(period.start, end)
}
