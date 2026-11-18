'use client'

import type { Summary } from '@/lib/analytics/aggregate'
import { daysBetween, todayKey, type Period } from '@/lib/analytics/period'

/* ─────────────────────────────────────────────────────────
   평일·주말 하루 평균 — B2B 문의는 평일 근무 시간에 몰려서
   주말이 섞인 기간과 평일만 있는 기간을 그냥 비교하면 차이가 부풀려진다.
   하루가 끝나지 않은 오늘은 평균에서 뺀다.
   ───────────────────────────────────────────────────────── */

const MIN_DAYS = 7

function weekdayOf(day: string): number {
  const [y, m, d] = day.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay()
}

function average(days: string[], map: Map<string, Summary>, pick: (s: Summary) => number): number | null {
  if (days.length === 0) return null
  return days.reduce((sum, day) => sum + pick(map.get(day) ?? ({} as Summary)), 0) / days.length
}

export default function WeekdaySplit({ period, days }: { period: Period; days: Map<string, Summary> }) {
  const today = todayKey()
  const full = daysBetween(period.start, period.end).filter((day) => day < today)
  if (full.length < MIN_DAYS) return null

  const weekdays = full.filter((day) => {
    const w = weekdayOf(day)
    return w !== 0 && w !== 6
  })
  const weekends = full.filter((day) => !weekdays.includes(day))
  const sessions = (s: Summary) => s.sessions ?? 0
  const conversions = (s: Summary) => s.convSessions ?? 0

  const cells = [
    { label: '평일 하루 평균 방문', value: average(weekdays, days, sessions), days: weekdays.length },
    { label: '주말 하루 평균 방문', value: average(weekends, days, sessions), days: weekends.length },
    { label: '평일 하루 평균 문의 접수', value: average(weekdays, days, conversions), days: weekdays.length, digits: 2 },
  ]

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5">
      <h2 className="text-base font-semibold text-gray-900">평일 · 주말</h2>
      <p className="mt-0.5 text-xs text-gray-500">
        행사 담당자는 평일 근무 시간에 많이 찾아옵니다. 기간끼리 비교할 때는 평일 평균을 보세요 (오늘은 빼고 계산).
      </p>
      <dl className="mt-4 grid gap-4 sm:grid-cols-3">
        {cells.map((cell) => (
          <div key={cell.label} className="rounded-lg bg-gray-50 px-4 py-3">
            <dt className="text-xs text-gray-500">{cell.label}</dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums text-gray-900">
              {cell.value == null ? '-' : cell.value.toFixed(cell.digits ?? 1)}
            </dd>
            <dd className="text-xs text-gray-400">{cell.days}일 기준</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
