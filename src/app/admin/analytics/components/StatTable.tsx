'use client'

import { useState, type ReactNode } from 'react'
import type { Stat } from '@/lib/analytics/aggregate'
import { formatDuration } from '@/lib/analytics/period'
import { formatNumber, formatPercent, share } from './format'

export interface StatRow {
  key: string
  label: ReactNode
  /** 라벨 옆 보조 설명 (채널 이름 등) */
  meta?: ReactNode
  stat: Stat
}

interface StatTableProps {
  rows: StatRow[]
  /** 비중의 분모 (보통 기간 전체 방문 수) */
  total: number
  /** 첫 열 제목 */
  header: string
  limit?: number
  emptyText?: string
}

const BAR_COLOR = '#2a78d6'

/**
 * 분류별 성과 표 - 방문 수뿐 아니라 이탈률·체류시간·문의까지 한 줄에 보여준다.
 * "어느 유입이 많은가"와 "어느 유입이 좋은가"를 같이 볼 수 있게 한다.
 */
export default function StatTable({ rows, total, header, limit = 8, emptyText = '기록 없음' }: StatTableProps) {
  const [expanded, setExpanded] = useState(false)
  const sorted = [...rows].filter((row) => row.stat.ss > 0).sort((a, b) => b.stat.ss - a.stat.ss)
  const max = sorted[0]?.stat.ss ?? 0
  const visible = expanded ? sorted : sorted.slice(0, limit)

  if (sorted.length === 0) {
    return <p className="py-6 text-center text-sm text-gray-400">{emptyText}</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left text-xs text-gray-500">
            <th className="w-2/5 py-2 pr-3 font-medium">{header}</th>
            <th className="py-2 pl-3 text-right font-medium">방문</th>
            <th className="py-2 pl-3 text-right font-medium" title="한 페이지만 잠깐 보고 떠난 방문의 비율">
              이탈률
            </th>
            <th className="whitespace-nowrap py-2 pl-3 text-right font-medium" title="방문 1회당 평균 체류시간">
              평균 체류
            </th>
            <th className="py-2 pl-3 text-right font-medium" title="문의·견적을 접수한 방문 수와 비율">
              문의
            </th>
          </tr>
        </thead>
        <tbody className="tabular-nums">
          {visible.map((row) => {
            const { stat } = row
            return (
              <tr key={row.key} className="border-b border-gray-100 last:border-0">
                <td className="max-w-0 py-2 pr-3">
                  <div className="flex items-baseline gap-2">
                    <span className="truncate text-gray-800">{row.label}</span>
                    {row.meta && <span className="shrink-0 text-xs text-gray-400">{row.meta}</span>}
                  </div>
                  <div className="mt-1 h-1 rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${max ? (stat.ss / max) * 100 : 0}%`, backgroundColor: BAR_COLOR }}
                    />
                  </div>
                </td>
                <td className="py-2 pl-3 text-right">
                  <span className="font-semibold text-gray-900">{formatNumber(stat.ss)}</span>
                  <span className="ml-1.5 text-xs text-gray-500">{formatPercent(share(stat.ss, total), 0)}</span>
                </td>
                <td className="py-2 pl-3 text-right text-gray-700">{formatPercent(share(stat.bounces, stat.ss), 0)}</td>
                <td className="whitespace-nowrap py-2 pl-3 text-right text-gray-700">
                  {stat.ss ? formatDuration(stat.dur / stat.ss) : '-'}
                </td>
                <td className="py-2 pl-3 text-right">
                  <span className={stat.conv ? 'font-semibold text-teal-700' : 'text-gray-400'}>
                    {formatNumber(stat.conv)}
                  </span>
                  {stat.conv > 0 && (
                    <span className="ml-1.5 text-xs text-gray-500">{formatPercent(share(stat.conv, stat.ss), 0)}</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {sorted.length > limit && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-4 text-xs font-medium text-blue-600 hover:text-blue-800"
        >
          {expanded ? '접기' : `모두 보기 (${sorted.length}개)`}
        </button>
      )}
    </div>
  )
}
