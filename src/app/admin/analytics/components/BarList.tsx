'use client'

import { useState, type ReactNode } from 'react'
import { formatNumber, formatPercent, share } from './format'

export interface BarListItem {
  key: string
  label: ReactNode
  /** 라벨 옆 보조 설명 */
  meta?: ReactNode
  value: number
}

interface BarListProps {
  items: BarListItem[]
  /** 비율의 분모 (없으면 항목 합계) */
  total?: number
  unit?: string
  limit?: number
  emptyText?: string
}

const BAR_COLOR = '#2a78d6'

export function BarListCard({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5">
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      {description && <p className="mt-0.5 text-xs text-gray-500">{description}</p>}
      <div className="mt-4">{children}</div>
    </section>
  )
}

/** 항목별 값을 가로 막대로 보여준다 (값이 큰 순서) */
export function BarList({ items, total, unit = '', limit = 8, emptyText = '기록 없음' }: BarListProps) {
  const [expanded, setExpanded] = useState(false)
  const sorted = [...items].filter((item) => item.value > 0).sort((a, b) => b.value - a.value)
  const denominator = total ?? sorted.reduce((sum, item) => sum + item.value, 0)
  const max = sorted[0]?.value ?? 0
  const visible = expanded ? sorted : sorted.slice(0, limit)

  if (sorted.length === 0) {
    return <p className="py-6 text-center text-sm text-gray-400">{emptyText}</p>
  }

  return (
    <div>
      <ul className="space-y-3">
        {visible.map((item) => (
          <li key={item.key}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-baseline gap-2">
                <span className="truncate text-gray-800">{item.label}</span>
                {item.meta && <span className="shrink-0 text-xs text-gray-400">{item.meta}</span>}
              </span>
              <span className="shrink-0 tabular-nums">
                <span className="font-semibold text-gray-900">
                  {formatNumber(item.value)}
                  {unit}
                </span>
                <span className="ml-2 inline-block w-11 text-right text-xs text-gray-500">
                  {formatPercent(share(item.value, denominator), 0)}
                </span>
              </span>
            </div>
            <div className="mt-1.5 h-1.5 rounded-full bg-gray-100">
              <div
                className="h-full rounded-full"
                style={{ width: `${max ? Math.max(2, (item.value / max) * 100) : 0}%`, backgroundColor: BAR_COLOR }}
              />
            </div>
          </li>
        ))}
      </ul>
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
