'use client'

import { useState } from 'react'
import type { Bucket, DrillTarget, Granularity } from '../useAnalyticsReport'
import { formatNumber } from './format'

type Metric = 'uv' | 'ss' | 'pv'

const METRICS: { value: Metric; label: string }[] = [
  { value: 'uv', label: '방문자' },
  { value: 'ss', label: '방문' },
  { value: 'pv', label: '페이지뷰' },
]

const TITLES: Record<Granularity, string> = {
  hour: '시간대별 추이',
  day: '일별 추이',
  week: '주별 추이',
  month: '월별 추이',
}

const SERIES_COLOR = '#2a78d6'
const PLOT_HEIGHT = 208

/** 0부터 시작하는 깔끔한 눈금 (최대값 이상을 4칸으로) */
function niceTicks(max: number): number[] {
  if (max <= 0) return [0, 1, 2, 3, 4]
  const rough = max / 4
  const magnitude = 10 ** Math.floor(Math.log10(rough))
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= rough) ?? rough
  const whole = Math.max(1, Math.ceil(step))
  return Array.from({ length: 5 }, (_, i) => i * whole)
}

interface TrendChartProps {
  granularity: Granularity
  buckets: Bucket[]
  onDrill: (target: DrillTarget) => void
}

export default function TrendChart({ granularity, buckets, onDrill }: TrendChartProps) {
  const [metric, setMetric] = useState<Metric>('uv')
  const [hovered, setHovered] = useState<number | null>(null)
  const [showTable, setShowTable] = useState(false)

  const values = buckets.map((b) => b[metric])
  const peak = Math.max(0, ...values)
  const ticks = niceTicks(peak)
  const top = ticks[ticks.length - 1]
  const peakIndex = peak > 0 ? values.indexOf(peak) : -1
  // 막대가 많으면 축 라벨을 건너뛴다
  const labelEvery = buckets.length > 24 ? 5 : buckets.length > 12 ? 3 : 1
  const hasData = values.some((v) => v > 0)
  const active = hovered != null ? buckets[hovered] : null

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-gray-900">{TITLES[granularity]}</h2>
          <p className="text-xs text-gray-500">
            {METRICS.find((m) => m.value === metric)?.label}
            {granularity !== 'hour' && ' · 막대를 누르면 해당 기간으로 이동합니다'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1" role="group" aria-label="지표 선택">
            {METRICS.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setMetric(m.value)}
                aria-pressed={metric === m.value}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  metric === m.value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setShowTable((v) => !v)}
            className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
          >
            {showTable ? '차트로 보기' : '표로 보기'}
          </button>
        </div>
      </div>

      {showTable ? (
        <div className="max-h-80 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white text-left text-xs text-gray-500">
              <tr className="border-b border-gray-200">
                <th className="py-2 font-medium">기간</th>
                <th className="py-2 text-right font-medium">방문자</th>
                <th className="py-2 text-right font-medium">방문</th>
                <th className="py-2 text-right font-medium">페이지뷰</th>
              </tr>
            </thead>
            <tbody className="tabular-nums">
              {buckets
                .filter((b) => !b.future)
                .map((b) => (
                  <tr key={b.key} className="border-b border-gray-100 last:border-0">
                    <td className="py-1.5 text-gray-700">{b.title}</td>
                    <td className="py-1.5 text-right text-gray-900">{formatNumber(b.uv)}</td>
                    <td className="py-1.5 text-right text-gray-900">{formatNumber(b.ss)}</td>
                    <td className="py-1.5 text-right text-gray-900">{formatNumber(b.pv)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex gap-2">
          {/* y축 */}
          <div className="relative w-9 shrink-0 text-right text-[11px] tabular-nums text-gray-400" style={{ height: PLOT_HEIGHT }}>
            {ticks.map((tick) => (
              <span
                key={tick}
                className="absolute right-0"
                style={{ bottom: `${(tick / top) * 100}%`, transform: 'translateY(50%)' }}
              >
                {formatNumber(tick)}
              </span>
            ))}
          </div>

          <div className="min-w-0 flex-1">
            <div className="relative" style={{ height: PLOT_HEIGHT }} onMouseLeave={() => setHovered(null)}>
              {/* 눈금선 */}
              {ticks.map((tick) => (
                <div
                  key={tick}
                  className={`absolute inset-x-0 border-t ${tick === 0 ? 'border-gray-300' : 'border-gray-100'}`}
                  style={{ bottom: `${(tick / top) * 100}%` }}
                />
              ))}

              {!hasData && (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-400">
                  이 기간에는 기록이 없습니다
                </div>
              )}

              <div className="absolute inset-0 flex items-end">
                {buckets.map((bucket, i) => {
                  const value = bucket[metric]
                  const height = top > 0 ? (value / top) * 100 : 0
                  const clickable = !!bucket.drill
                  const isActive = hovered === i
                  return (
                    <div
                      key={bucket.key}
                      role={clickable ? 'button' : undefined}
                      tabIndex={bucket.future ? -1 : 0}
                      aria-label={`${bucket.title} ${METRICS.find((m) => m.value === metric)?.label} ${formatNumber(value)}`}
                      onMouseEnter={() => setHovered(i)}
                      onFocus={() => setHovered(i)}
                      onBlur={() => setHovered(null)}
                      onClick={() => bucket.drill && onDrill(bucket.drill)}
                      onKeyDown={(e) => {
                        if ((e.key === 'Enter' || e.key === ' ') && bucket.drill) {
                          e.preventDefault()
                          onDrill(bucket.drill)
                        }
                      }}
                      className={`relative flex h-full flex-1 items-end justify-center px-px outline-none ${
                        clickable ? 'cursor-pointer' : ''
                      } ${isActive && !bucket.future ? 'bg-gray-50' : ''} focus-visible:ring-2 focus-visible:ring-blue-400`}
                    >
                      {!bucket.future && value > 0 && (
                        <div
                          className="w-full max-w-6 rounded-t transition-opacity"
                          style={{
                            height: `${height}%`,
                            backgroundColor: SERIES_COLOR,
                            opacity: hovered == null || isActive ? 1 : 0.55,
                          }}
                        />
                      )}
                      {/* 최대값 한 곳에만 값을 직접 표시 */}
                      {i === peakIndex && hovered == null && (
                        <span
                          className="pointer-events-none absolute text-[11px] font-semibold tabular-nums text-gray-700"
                          style={{ bottom: `calc(${height}% + 4px)` }}
                        >
                          {formatNumber(value)}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>

              {active && !active.future && hovered != null && (
                <div
                  className="pointer-events-none absolute z-10 w-40 rounded-lg border border-gray-200 bg-white p-3 text-xs shadow-lg"
                  style={{
                    left: `${((hovered + 0.5) / buckets.length) * 100}%`,
                    top: 0,
                    transform: `translateX(${hovered / buckets.length > 0.6 ? '-105%' : '5%'})`,
                  }}
                >
                  <p className="mb-2 font-medium text-gray-500">{active.title}</p>
                  {METRICS.map((m) => (
                    <p key={m.value} className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-1.5 text-gray-500">
                        {m.value === metric && (
                          <span className="inline-block h-0.5 w-3 rounded" style={{ backgroundColor: SERIES_COLOR }} />
                        )}
                        {m.label}
                      </span>
                      <span className="font-semibold tabular-nums text-gray-900">{formatNumber(active[m.value])}</span>
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/* x축 */}
            <div className="mt-1.5 flex text-[11px] tabular-nums text-gray-400">
              {buckets.map((bucket, i) => (
                <span key={bucket.key} className="flex-1 truncate text-center">
                  {i % labelEvery === 0 ? bucket.label : ''}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
