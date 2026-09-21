'use client'

import { useState } from 'react'
import { formatNumber } from './format'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

// 파랑 한 가지 색의 밝기 단계 (값이 클수록 진하게)
const STEPS = ['#e9eef4', '#cde2fb', '#9ec5f4', '#6da7ec', '#3987e5', '#1c5cab']

function stepOf(value: number, max: number): number {
  if (value <= 0) return 0
  if (max <= 0) return 1
  return Math.min(STEPS.length - 1, 1 + Math.floor(((value / max) * (STEPS.length - 1) - 0.0001)))
}

/**
 * 요일 × 시간대 방문 분포.
 * "언제 사람이 몰리는지"를 보고 이벤트 공지·광고 집행 시간을 정하는 데 쓴다.
 */
export default function Heatmap({ grid }: { grid: number[][] }) {
  const [hovered, setHovered] = useState<{ day: number; hour: number } | null>(null)
  const max = Math.max(0, ...grid.flat())
  const total = grid.flat().reduce((sum, v) => sum + v, 0)

  // 접근성·요약용: 방문이 가장 많은 시간대
  const peaks = grid
    .flatMap((row, day) => row.map((value, hour) => ({ day, hour, value })))
    .filter((cell) => cell.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-gray-900">요일·시간대 분포</h2>
          <p className="mt-0.5 text-xs text-gray-500">방문이 시작된 시각 기준 (한국 시간). 진할수록 방문이 많습니다.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>적음</span>
          {STEPS.map((color) => (
            <span key={color} className="h-3 w-5 rounded-sm" style={{ backgroundColor: color }} />
          ))}
          <span>많음</span>
        </div>
      </div>

      {total === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">이 기간에는 기록이 없습니다</p>
      ) : (
        <>
          <div className="mt-4 overflow-x-auto">
            <div className="min-w-[640px]">
              <div className="flex">
                <span className="w-7 shrink-0" />
                {Array.from({ length: 24 }, (_, hour) => (
                  <span key={hour} className="flex-1 text-center text-[10px] tabular-nums text-gray-400">
                    {hour % 3 === 0 ? hour : ''}
                  </span>
                ))}
              </div>
              {grid.map((row, day) => (
                <div key={day} className="mt-0.5 flex items-center">
                  <span className="w-7 shrink-0 text-xs text-gray-500">{WEEKDAYS[day]}</span>
                  {row.map((value, hour) => (
                    <button
                      key={hour}
                      type="button"
                      onMouseEnter={() => setHovered({ day, hour })}
                      onMouseLeave={() => setHovered(null)}
                      onFocus={() => setHovered({ day, hour })}
                      onBlur={() => setHovered(null)}
                      aria-label={`${WEEKDAYS[day]}요일 ${hour}시 방문 ${formatNumber(value)}`}
                      className="mx-px h-6 flex-1 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                      style={{
                        backgroundColor: STEPS[stepOf(value, max)],
                        opacity: hovered && hovered.day === day && hovered.hour === hour ? 0.7 : 1,
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          <p className="mt-3 text-xs text-gray-500">
            {hovered ? (
              <span className="text-gray-700">
                {WEEKDAYS[hovered.day]}요일 {hovered.hour}시 ~ {hovered.hour + 1}시 ·{' '}
                <strong className="tabular-nums text-gray-900">
                  {formatNumber(grid[hovered.day][hovered.hour])}회 방문
                </strong>
              </span>
            ) : (
              <>
                방문이 많은 시간대:{' '}
                {peaks.map((cell, i) => (
                  <span key={`${cell.day}-${cell.hour}`}>
                    {i > 0 && ', '}
                    {WEEKDAYS[cell.day]} {cell.hour}시
                    <span className="text-gray-400"> ({formatNumber(cell.value)})</span>
                  </span>
                ))}
              </>
            )}
          </p>
        </>
      )}
    </section>
  )
}
