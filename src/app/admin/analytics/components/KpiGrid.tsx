'use client'

import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import { metricsOf, type Summary } from '@/lib/analytics/aggregate'
import { formatDuration } from '@/lib/analytics/period'
import { formatNumber, formatPercent } from './format'

interface KpiGridProps {
  current: Summary
  previous: Summary | null
  comparisonLabel: string
}

type Direction = 'up' | 'down' | 'flat'

interface Delta {
  text: string
  direction: Direction
  /** 늘어난 것이 좋은 지표인지 (이탈률은 반대) */
  good: boolean | null
}

function relativeDelta(current: number, previous: number, higherIsBetter = true): Delta {
  if (previous === 0) {
    if (current === 0) return { text: '변화 없음', direction: 'flat', good: null }
    return { text: '새로 발생', direction: 'up', good: higherIsBetter }
  }
  const change = (current - previous) / previous
  if (Math.abs(change) < 0.005) return { text: '변화 없음', direction: 'flat', good: null }
  const direction: Direction = change > 0 ? 'up' : 'down'
  return {
    text: formatPercent(Math.abs(change)),
    direction,
    good: direction === 'up' ? higherIsBetter : !higherIsBetter,
  }
}

/** 비율 지표는 %p(퍼센트포인트) 차이로 보여준다 */
function pointDelta(current: number, previous: number, higherIsBetter: boolean): Delta {
  const diff = (current - previous) * 100
  if (Math.abs(diff) < 0.05) return { text: '변화 없음', direction: 'flat', good: null }
  const direction: Direction = diff > 0 ? 'up' : 'down'
  return {
    text: `${Math.abs(diff).toFixed(1)}%p`,
    direction,
    good: direction === 'up' ? higherIsBetter : !higherIsBetter,
  }
}

function DeltaBadge({ delta, label }: { delta: Delta; label: string }) {
  const Icon = delta.direction === 'up' ? ArrowUpRight : delta.direction === 'down' ? ArrowDownRight : Minus
  const tone =
    delta.good === null ? 'text-gray-500' : delta.good ? 'text-emerald-700' : 'text-rose-600'
  return (
    <p className="mt-2 flex flex-wrap items-center gap-x-1 text-xs">
      <span className={`inline-flex items-center gap-0.5 font-semibold ${tone}`}>
        <Icon className="h-3.5 w-3.5" aria-hidden />
        <span className="sr-only">{delta.direction === 'up' ? '증가' : delta.direction === 'down' ? '감소' : ''}</span>
        {delta.text}
      </span>
      <span className="text-gray-400">{label}</span>
    </p>
  )
}

export default function KpiGrid({ current, previous, comparisonLabel }: KpiGridProps) {
  const now = metricsOf(current)
  // 비교 기간에 기록이 전혀 없으면(기록 시작 전 등) 증감이 의미 없으므로 보여주지 않는다
  const before = previous && previous.sessions > 0 ? metricsOf(previous) : null

  const tiles: { label: string; value: string; sub: string; delta: Delta | null; hint: string }[] = [
    {
      label: '방문자',
      value: formatNumber(now.visitors),
      sub: `신규 ${formatPercent(now.visitors ? now.newVisitors / now.visitors : 0, 0)}`,
      delta: before ? relativeDelta(now.visitors, before.visitors) : null,
      hint: '중복 없이 센 브라우저 수. 같은 사람이라도 기기·브라우저가 다르면 따로 셉니다.',
    },
    {
      label: '방문',
      value: formatNumber(now.sessions),
      sub: `방문당 ${now.pagesPerSession.toFixed(1)}페이지`,
      delta: before ? relativeDelta(now.sessions, before.sessions) : null,
      hint: '들어와서 30분 넘게 활동이 없을 때까지를 한 번의 방문(세션)으로 셉니다.',
    },
    {
      label: '페이지뷰',
      value: formatNumber(now.pageviews),
      sub: `방문자당 ${(now.visitors ? now.pageviews / now.visitors : 0).toFixed(1)}회`,
      delta: before ? relativeDelta(now.pageviews, before.pageviews) : null,
      hint: '페이지를 연 횟수입니다.',
    },
    {
      label: '평균 체류시간',
      value: formatDuration(now.avgSessionMs),
      sub: '방문 1회 기준',
      delta: before ? relativeDelta(now.avgSessionMs, before.avgSessionMs) : null,
      hint: '화면을 실제로 보고 있던 시간만 더합니다 (다른 탭에 가 있던 시간 제외).',
    },
    {
      label: '이탈률',
      value: formatPercent(now.bounceRate),
      sub: `${formatNumber(current.bounces)}회 이탈`,
      delta: before ? pointDelta(now.bounceRate, before.bounceRate, false) : null,
      hint: '한 페이지만 10초 미만 보고 아무 행동 없이 떠난 방문의 비율입니다.',
    },
    {
      label: '문의·견적 접수',
      value: formatNumber(now.conversions),
      sub: `전환율 ${formatPercent(now.conversionRate)}`,
      delta: before ? relativeDelta(now.conversions, before.conversions) : null,
      hint: '문의하기·견적 요청 폼 제출 건수. 전환율은 접수가 있었던 방문의 비율입니다.',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
      {tiles.map((tile) => (
        <div key={tile.label} className="rounded-xl border border-gray-200 bg-white p-5" title={tile.hint}>
          <p className="text-sm font-medium text-gray-500">{tile.label}</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{tile.value}</p>
          <p className="mt-0.5 text-xs text-gray-500">{tile.sub}</p>
          {tile.delta ? (
            <DeltaBadge delta={tile.delta} label={comparisonLabel} />
          ) : (
            previous && <p className="mt-2 text-xs text-gray-400">비교할 이전 기록 없음</p>
          )}
        </div>
      ))}
    </div>
  )
}
