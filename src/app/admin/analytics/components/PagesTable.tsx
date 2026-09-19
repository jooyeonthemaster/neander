'use client'

import { useState } from 'react'
import type { Summary } from '@/lib/analytics/aggregate'
import { formatDuration } from '@/lib/analytics/period'
import { formatNumber, pageName } from './format'

type SortKey = 'pv' | 'entries' | 'dur' | 'scroll'

const COLUMNS: { key: SortKey; label: string; hint: string }[] = [
  { key: 'pv', label: '조회수', hint: '페이지를 연 횟수' },
  { key: 'entries', label: '첫 페이지', hint: '이 페이지로 방문을 시작한 횟수' },
  { key: 'dur', label: '평균 체류', hint: '이 페이지를 보고 있던 평균 시간' },
  { key: 'scroll', label: '평균 스크롤', hint: '페이지를 얼마나 아래까지 내려봤는지 (100% = 끝까지)' },
]

const BAR_COLOR = '#2a78d6'
const LIMIT = 12

export default function PagesTable({ summary }: { summary: Summary }) {
  const [sortKey, setSortKey] = useState<SortKey>('pv')
  const [expanded, setExpanded] = useState(false)

  const rows = Object.entries(summary.pages).map(([path, stat]) => ({
    path,
    pv: stat.pv,
    entries: stat.entries,
    dur: stat.durN ? stat.dur / stat.durN : 0,
    scroll: stat.scrollN ? stat.scroll / stat.scrollN : 0,
  }))
  rows.sort((a, b) => b[sortKey] - a[sortKey] || b.pv - a.pv)
  const maxPv = Math.max(0, ...rows.map((r) => r.pv))
  const visible = expanded ? rows : rows.slice(0, LIMIT)

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5">
      <h2 className="text-base font-semibold text-gray-900">페이지별 활동</h2>
      <p className="mt-0.5 text-xs text-gray-500">어떤 페이지를 많이 보고, 얼마나 머물렀는지. 열 이름을 누르면 정렬합니다.</p>

      {rows.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-400">기록 없음</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs text-gray-500">
                <th className="w-1/2 py-2 pr-4 font-medium">페이지</th>
                {COLUMNS.map((col) => (
                  <th key={col.key} className="whitespace-nowrap py-2 pl-4 text-right font-medium" title={col.hint}>
                    <button
                      type="button"
                      onClick={() => setSortKey(col.key)}
                      className={`hover:text-gray-900 ${sortKey === col.key ? 'text-gray-900' : ''}`}
                    >
                      {col.label}
                      {sortKey === col.key && ' ↓'}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="tabular-nums">
              {visible.map((row) => (
                <tr key={row.path} className="border-b border-gray-100 last:border-0">
                  <td className="max-w-0 py-2 pr-4">
                    <div className="flex items-baseline gap-2">
                      {pageName(row.path) && <span className="shrink-0 text-gray-800">{pageName(row.path)}</span>}
                      <span className="truncate font-mono text-xs text-gray-500" title={row.path}>
                        {row.path}
                      </span>
                    </div>
                    <div className="mt-1 h-1 rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${maxPv ? (row.pv / maxPv) * 100 : 0}%`, backgroundColor: BAR_COLOR }}
                      />
                    </div>
                  </td>
                  <td className="py-2 pl-4 text-right font-semibold text-gray-900">{formatNumber(row.pv)}</td>
                  <td className="py-2 pl-4 text-right text-gray-700">{formatNumber(row.entries)}</td>
                  <td className="whitespace-nowrap py-2 pl-4 text-right text-gray-700">
                    {row.dur ? formatDuration(row.dur) : '-'}
                  </td>
                  <td className="py-2 pl-4 text-right text-gray-700">{row.scroll ? `${Math.round(row.scroll)}%` : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length > LIMIT && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="mt-4 text-xs font-medium text-blue-600 hover:text-blue-800"
            >
              {expanded ? '접기' : `모두 보기 (${rows.length}개)`}
            </button>
          )}
        </div>
      )}
    </section>
  )
}
