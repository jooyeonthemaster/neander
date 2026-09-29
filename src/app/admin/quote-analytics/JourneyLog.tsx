'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { formatNumber } from '../analytics/components/format'
import { FUNNEL, describeAction, presetName, serviceName, type JourneyRecord } from '@/lib/analytics/quote-behavior'
import { dayKeyOf, formatDuration, formatTime } from '@/lib/analytics/period'
import { CHANNEL_LABELS, DEVICE_LABELS } from '@/lib/analytics/sources'

const PAGE = 30

const offset = (ms: number) => {
  const s = Math.floor(ms / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

/** 여정 목록 — 한 줄을 누르면 그 사람이 한 일을 시간 순서대로 펼친다 */
export default function JourneyLog({ journeys }: { journeys: JourneyRecord[] }) {
  const [open, setOpen] = useState<string | null>(null)
  const [shown, setShown] = useState(PAGE)

  if (journeys.length === 0) return <p className="py-6 text-center text-sm text-gray-400">기록 없음</p>

  return (
    <div>
      <ul className="divide-y divide-gray-100">
        {journeys.slice(0, shown).map((j) => {
          const expanded = open === j.jid
          return (
            <li key={j.jid}>
              <button type="button" onClick={() => setOpen(expanded ? null : j.jid)} aria-expanded={expanded}
                className="flex w-full flex-wrap items-center gap-x-4 gap-y-1 py-3 text-left text-sm hover:bg-gray-50">
                <span className="w-32 shrink-0 tabular-nums text-gray-500">{dayKeyOf(j.startedAt).slice(5)} {formatTime(j.startedAt)}</span>
                <span className="w-44 shrink-0 text-gray-600">
                  {DEVICE_LABELS[j.device as keyof typeof DEVICE_LABELS] ?? j.device} · {CHANNEL_LABELS[j.channel as keyof typeof CHANNEL_LABELS] ?? j.channel}
                  {j.internal && <span className="ml-1.5 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">내부</span>}
                </span>
                <span className="min-w-0 flex-1 truncate text-gray-800">
                  {j.submitted
                    ? <span className="font-semibold text-emerald-700">{j.submitted === 'pdf' ? '가견적서 발급' : '상담 요청'}</span>
                    : <>{FUNNEL[j.depth]?.label}에서 떠남</>}
                  {j.preset && <span className="text-gray-400"> · {presetName(j.preset)}</span>}
                  {j.services.length > 0 && <span className="text-gray-400"> · {j.services.map(serviceName).join(', ')}</span>}
                </span>
                <span className="w-20 shrink-0 text-right tabular-nums text-gray-600">{formatDuration(j.activeMs)}</span>
                <span className="w-24 shrink-0 text-right tabular-nums font-medium text-gray-900">{j.finalTotal ? `${formatNumber(Math.round(j.finalTotal / 10_000))}만원` : '-'}</span>
                <ChevronDown className={`size-4 shrink-0 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>
              {expanded && (
                <ol className="mb-3 max-h-96 overflow-y-auto rounded-lg bg-gray-50 px-4 py-3 text-xs">
                  {j.actions.map((action, i) => (
                    <li key={i} className={`flex gap-3 py-1 ${action[1] === 'v' ? 'mt-1 font-semibold text-gray-900' : action[1] === '$' || action[1] === 'hide' || action[1] === 'show' ? 'text-gray-400' : 'text-gray-700'}`}>
                      <span className="w-12 shrink-0 tabular-nums text-gray-400">{offset(action[0])}</span>
                      <span>{describeAction(action)}</span>
                    </li>
                  ))}
                </ol>
              )}
            </li>
          )
        })}
      </ul>
      {journeys.length > shown && (
        <button type="button" onClick={() => setShown((n) => n + PAGE)} className="mt-3 w-full rounded-lg border border-gray-200 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50">
          더 보기 ({formatNumber(journeys.length - shown)}건 남음)
        </button>
      )}
    </div>
  )
}
