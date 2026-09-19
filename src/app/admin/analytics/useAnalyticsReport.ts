'use client'

import { useEffect, useState } from 'react'
import { FirebaseError } from 'firebase/app'
import {
  emptySummary,
  groupSessions,
  mergeSummaries,
  summarize,
  type AnalyticsEvent,
  type SessionRecord,
  type Summary,
} from '@/lib/analytics/aggregate'
import { fetchEvents, loadDailySummaries, subscribeEvents } from '@/lib/analytics/admin'
import {
  comparisonOf,
  dayEnd,
  dayStart,
  daysBetween,
  kstHour,
  periodOf,
  todayKey,
  type Comparison,
  type Period,
  type PeriodMode,
} from '@/lib/analytics/period'

export interface Bucket {
  key: string
  /** 축 라벨 */
  label: string
  /** 툴팁 제목 */
  title: string
  pv: number
  ss: number
  uv: number
  /** 아직 오지 않은 시간 (막대를 그리지 않는다) */
  future: boolean
  /** 막대를 누르면 이동할 기간 */
  drill: { mode: PeriodMode; anchor: string } | null
}

export interface Report {
  period: Period
  comparison: Comparison
  current: Summary
  previous: Summary | null
  buckets: Bucket[]
  /** 일 단위에서만 채운다 (최신 방문이 앞) */
  sessions: SessionRecord[] | null
  /** 오늘이 포함되어 실시간으로 갱신되는 중인지 */
  live: boolean
  /** 최근 30분 안에 페이지를 본 방문자 수 (오늘을 볼 때만) */
  activeNow: number | null
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']
const ACTIVE_WINDOW_MS = 30 * 60 * 1000

function describeError(error: unknown): string {
  if (error instanceof FirebaseError && error.code === 'permission-denied') {
    return 'Firestore 규칙(analytics_events·analytics_daily)이 배포되지 않았거나 관리자 권한이 없습니다. firebase deploy --only firestore:rules 를 실행했는지 확인해 주세요.'
  }
  return '분석 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.'
}

function dayTitle(key: string): string {
  const [y, m, d] = key.split('-').map(Number)
  return `${m}월 ${d}일 (${WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]})`
}

function hourBuckets(summary: Summary, period: Period): Bucket[] {
  const today = todayKey()
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

function dayBuckets(period: Period, days: Map<string, Summary>, todaySummary: Summary | null): Bucket[] {
  const today = todayKey()
  return daysBetween(period.start, period.end).map((day) => {
    const summary = day === today ? todaySummary ?? emptySummary() : days.get(day) ?? emptySummary()
    return {
      key: day,
      label: String(Number(day.slice(8))),
      title: dayTitle(day),
      pv: summary.pageviews,
      ss: summary.sessions,
      uv: summary.vids.length,
      future: day > today,
      drill: day > today ? null : { mode: 'day', anchor: day },
    }
  })
}

function monthBuckets(period: Period, days: Map<string, Summary>, todaySummary: Summary | null): Bucket[] {
  const today = todayKey()
  const year = period.start.slice(0, 4)
  return Array.from({ length: 12 }, (_, i) => {
    const month = `${year}-${String(i + 1).padStart(2, '0')}`
    const parts = [...days.entries()].filter(([day]) => day.startsWith(month)).map(([, s]) => s)
    if (todaySummary && today.startsWith(month)) parts.push(todaySummary)
    const merged = mergeSummaries(parts)
    const future = `${month}-01` > today
    return {
      key: month,
      label: `${i + 1}월`,
      title: `${year}년 ${i + 1}월`,
      pv: merged.pageviews,
      ss: merged.sessions,
      uv: merged.vids.length,
      future,
      drill: future ? null : { mode: 'month', anchor: `${month}-01` },
    }
  })
}

function activeVisitors(events: AnalyticsEvent[]): number {
  const since = Date.now() - ACTIVE_WINDOW_MS
  return new Set(events.filter((e) => e.ts.getTime() >= since).map((e) => e.vid)).size
}

async function loadPrevious(comparison: Comparison): Promise<Summary> {
  if (comparison.until) {
    return summarize(await fetchEvents(dayStart(comparison.start), comparison.until))
  }
  const days = await loadDailySummaries(comparison.start, comparison.end)
  return mergeSummaries([...days.values()])
}

/**
 * 선택한 기간(일·월·연)의 분석 데이터를 불러온다.
 * 오늘이 포함된 기간은 오늘 기록을 실시간으로 구독해 계속 갱신한다.
 */
export function useAnalyticsReport(mode: PeriodMode, anchor: string, reloadKey: number) {
  const requestKey = `${mode}|${anchor}|${reloadKey}`
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
    const period = periodOf(mode, anchor)
    const comparison = comparisonOf(period)
    const today = todayKey()
    const live = period.start <= today && today <= period.end

    const setReport = (report: Report) => {
      if (!cancelled) setResult({ key: requestKey, report, error: null })
    }

    const fail = (err: unknown) => {
      if (cancelled) return
      console.error('[analytics] 불러오기 실패:', err)
      setResult((prev) => ({ key: requestKey, report: prev.report, error: describeError(err) }))
    }

    async function run() {
      const previousPromise = loadPrevious(comparison)
      // 아래에서 await 할 때 오류가 전달된다. 그 전에 실패해도 처리되지 않은 거부로 남지 않게 한다
      previousPromise.catch(() => {})

      if (mode === 'day') {
        const build = (events: AnalyticsEvent[], previous: Summary | null): Report => {
          const current = summarize(events)
          return {
            period,
            comparison,
            current,
            previous,
            buckets: hourBuckets(current, period),
            sessions: groupSessions(events).sort((a, b) => b.start.getTime() - a.start.getTime()),
            live,
            activeNow: live ? activeVisitors(events) : null,
          }
        }

        const previous = await previousPromise
        if (cancelled) return
        if (live) {
          unsubscribe = subscribeEvents(
            dayStart(period.start),
            dayEnd(period.start),
            (events) => setReport(build(events, previous)),
            fail
          )
        } else {
          const events = await fetchEvents(dayStart(period.start), dayEnd(period.start))
          setReport(build(events, previous))
        }
        return
      }

      const days = await loadDailySummaries(period.start, period.end, (done, total) => {
        if (!cancelled && total > 3) setProgress({ key: requestKey, text: `지난 기록을 정리하는 중 (${done}/${total}일)` })
      })
      const previous = await previousPromise
      if (cancelled) return
      setProgress(null)

      const build = (todaySummary: Summary | null, todayEvents: AnalyticsEvent[]): Report => {
        const parts = [...days.values()]
        if (todaySummary) parts.push(todaySummary)
        return {
          period,
          comparison,
          current: mergeSummaries(parts),
          previous,
          buckets:
            mode === 'month'
              ? dayBuckets(period, days, todaySummary)
              : monthBuckets(period, days, todaySummary),
          sessions: null,
          live,
          activeNow: live ? activeVisitors(todayEvents) : null,
        }
      }

      if (live) {
        unsubscribe = subscribeEvents(
          dayStart(today),
          dayEnd(today),
          (events) => setReport(build(summarize(events), events)),
          fail
        )
      } else {
        setReport(build(null, []))
      }
    }

    run().catch(fail)

    return () => {
      cancelled = true
      unsubscribe?.()
    }
  }, [mode, anchor, requestKey])

  return {
    report: result.report,
    loading: result.key !== requestKey,
    error: result.key === requestKey ? result.error : null,
    progress: progress?.key === requestKey ? progress.text : null,
  }
}
