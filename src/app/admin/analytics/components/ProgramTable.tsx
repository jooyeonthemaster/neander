'use client'

import { useState } from 'react'
import type { Summary } from '@/lib/analytics/aggregate'
import { formatDuration } from '@/lib/analytics/period'
import { experiences } from '@/data/experiences'
import ko from '../../../../../messages/ko.json'
import { formatNumber, formatPercent } from './format'

/* ─────────────────────────────────────────────────────────
   체험 프로그램 관심도 — 서비스 목록에 공개된 프로그램마다
   상세 페이지를 연 방문 수, 그 뒤 견적·문의로 넘어간 비율.
   목록 앞자리일수록 많이 눌리는 경향이 있어 「목록 순서」를 같이 보여 준다.
   ───────────────────────────────────────────────────────── */

type SortKey = 'ss' | 'pv' | 'next' | 'dur'

const COLUMNS: { key: SortKey; label: string; hint: string }[] = [
  { key: 'ss', label: '방문', hint: '이 프로그램 상세를 연 방문(세션) 수' },
  { key: 'pv', label: '조회수', hint: '상세 페이지를 연 횟수' },
  { key: 'dur', label: '평균 체류', hint: '상세 페이지를 보고 있던 평균 시간' },
  { key: 'next', label: '견적·문의로', hint: '상세를 본 뒤 같은 방문에서 견적 화면이나 문의 페이지로 간 비율' },
]

const BAR_COLOR = '#2a78d6'
const TOP = 6

type Messages = { services?: { exp?: Record<string, { name?: string }> } }
const EXP = (ko as Messages).services?.exp ?? {}

function nameOf(nameKey: string, slug: string): string {
  // nameKey = 'exp.<id>.name'
  const id = nameKey.split('.')[1]
  return EXP[id]?.name ?? slug
}

const LISTED = experiences.map((exp, i) => ({ slug: exp.slug, name: nameOf(exp.nameKey, exp.slug), position: i + 1 }))
const LISTED_SLUGS = new Set(LISTED.map((p) => p.slug))

export default function ProgramTable({ summary }: { summary: Summary }) {
  const [sortKey, setSortKey] = useState<SortKey>('ss')
  const programs = summary.programs ?? {}

  const rows = [
    ...LISTED,
    // 목록에서 내린 프로그램도 그 기간에 기록이 있으면 아래에 붙인다
    ...Object.keys(programs)
      .filter((slug) => !LISTED_SLUGS.has(slug))
      .map((slug) => ({ slug, name: slug, position: null as number | null })),
  ].map((p) => {
    const stat = programs[p.slug]
    return {
      ...p,
      ss: stat?.ss ?? 0,
      pv: stat?.pv ?? 0,
      dur: stat?.durN ? stat.dur / stat.durN : 0,
      next: stat?.ss ? stat.next / stat.ss : 0,
      nextCount: stat?.next ?? 0,
    }
  })
  rows.sort((a, b) => b[sortKey] - a[sortKey] || b.ss - a.ss || b.pv - a.pv || (a.position ?? 99) - (b.position ?? 99))
  const ranked = [...rows].sort((a, b) => b.ss - a.ss || b.pv - a.pv)
  const topSlugs = new Set(ranked.filter((r) => r.ss > 0).slice(0, TOP).map((r) => r.slug))
  const maxSs = Math.max(0, ...rows.map((r) => r.ss))
  const opened = rows.filter((r) => r.ss > 0).length

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5">
      <h2 className="text-base font-semibold text-gray-900">체험 프로그램 관심도</h2>
      <p className="mt-0.5 text-xs text-gray-500">
        서비스 목록에 공개된 {LISTED.length}개 프로그램의 상세 페이지를 연 방문. 방문 수 상위 {TOP}개는 굵게 표시합니다.
        「목록 순서」가 앞일수록 많이 눌리는 경향이 있으니 같이 보세요. 열 이름을 누르면 정렬합니다.
      </p>

      {opened === 0 ? (
        <p className="py-6 text-center text-sm text-gray-400">이 기간에 프로그램 상세를 연 방문이 없습니다</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs text-gray-500">
                <th className="w-1/2 py-2 pr-4 font-medium">프로그램</th>
                <th className="whitespace-nowrap py-2 pl-4 text-right font-medium" title="지금 서비스 목록에서의 자리 (1 = 맨 앞)">
                  목록 순서
                </th>
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
              {rows.map((row) => {
                const top = topSlugs.has(row.slug)
                return (
                  <tr key={row.slug} className="border-b border-gray-100 last:border-0">
                    <td className="max-w-0 py-2 pr-4">
                      <div className="flex items-baseline gap-2">
                        <span className={`shrink-0 ${top ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>{row.name}</span>
                        <span className="truncate font-mono text-xs text-gray-400" title={`/services/${row.slug}`}>
                          {row.position == null ? '목록에 없음' : row.slug}
                        </span>
                      </div>
                      <div className="mt-1 h-1 rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${maxSs ? (row.ss / maxSs) * 100 : 0}%`, backgroundColor: BAR_COLOR }}
                        />
                      </div>
                    </td>
                    <td className="py-2 pl-4 text-right text-gray-500">{row.position ?? '-'}</td>
                    <td className={`py-2 pl-4 text-right ${top ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                      {formatNumber(row.ss)}
                    </td>
                    <td className="py-2 pl-4 text-right text-gray-700">{formatNumber(row.pv)}</td>
                    <td className="whitespace-nowrap py-2 pl-4 text-right text-gray-700">
                      {row.dur ? formatDuration(row.dur) : '-'}
                    </td>
                    <td className="whitespace-nowrap py-2 pl-4 text-right text-gray-700" title={`${row.nextCount}회`}>
                      {row.ss ? formatPercent(row.next, 0) : '-'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <p className="mt-3 text-xs text-gray-400">
            방문 수가 작을 때는 1~2회 차이로 순위가 바뀝니다. 기간을 한 달 이상으로 넓혀 보면 더 믿을 만합니다.
          </p>
        </div>
      )}
    </section>
  )
}
