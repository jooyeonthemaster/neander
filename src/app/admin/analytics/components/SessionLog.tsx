'use client'

import { useState } from 'react'
import { ChevronRight, MousePointerClick, Send } from 'lucide-react'
import type { AnalyticsEvent, SessionRecord } from '@/lib/analytics/aggregate'
import { formatDuration, formatTime } from '@/lib/analytics/period'
import { CHANNEL_LABELS, DEVICE_LABELS, EVENT_LABELS, INQUIRY_KIND_LABELS, sourceLabel } from '@/lib/analytics/sources'
import { cityName, countryName, pageName } from './format'

type Filter = 'all' | 'converted' | 'engaged'

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'engaged', label: '이탈 제외' },
  { value: 'converted', label: '문의 접수' },
]

const PAGE_SIZE = 20

function actionLabel(event: AnalyticsEvent): string {
  if (event.name === 'inquiry_submit') return INQUIRY_KIND_LABELS[event.label ?? ''] ?? '문의 접수'
  const base = EVENT_LABELS[event.name ?? ''] ?? event.name ?? '행동'
  return event.label ? `${base} · ${event.label}` : base
}

/** 채널 칩 옆에 붙는 구체적인 출처 (직접 유입은 칩만으로 충분해 비운다) */
function origin(first: AnalyticsEvent): string {
  const parts = [
    first.source !== 'direct' && sourceLabel(first.source),
    first.campaign && `캠페인 ${first.campaign}`,
    first.keyword && `"${first.keyword}"`,
  ].filter(Boolean)
  return parts.join(' · ')
}

function place(first: AnalyticsEvent): string | null {
  if (first.city) return cityName(`${first.country ?? ''}\t${first.region ?? ''}\t${first.city}`)
  return first.country ? countryName(first.country) : null
}

/** '/services/acscent' → 서비스 acscent (체류시간) */
function PageStep({ event }: { event: AnalyticsEvent }) {
  const name = pageName(event.path)
  const rest = event.path.split('/').slice(2).join('/')
  return (
    <span className="rounded-md border border-gray-200 px-1.5 py-0.5 text-gray-700" title={event.path}>
      {name || event.path}
      {name && rest && <span className="text-gray-400"> {rest}</span>}
      {event.dur ? <span className="ml-1 text-gray-400">{formatDuration(event.dur)}</span> : null}
    </span>
  )
}

function SessionRow({ session }: { session: SessionRecord }) {
  const { first } = session
  const details = [
    DEVICE_LABELS[first.device] ?? first.device,
    `${first.browser}${first.os !== '기타' ? ` · ${first.os}` : ''}`,
    place(first),
    first.locale === 'en' ? '영문' : null,
  ].filter(Boolean)

  return (
    <li className="py-4">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        <span className="w-11 shrink-0 font-semibold tabular-nums text-gray-900">{formatTime(session.start)}</span>
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
          {CHANNEL_LABELS[first.channel] ?? first.channel}
        </span>
        {origin(first) && <span className="text-gray-800">{origin(first)}</span>}
        {session.newVisitor ? (
          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">첫 방문</span>
        ) : (
          <span className="rounded-full bg-gray-50 px-2 py-0.5 text-xs text-gray-500">재방문</span>
        )}
        {session.internal && (
          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">내부</span>
        )}
        {session.converted && (
          <span className="rounded-full bg-teal-50 px-2 py-0.5 text-xs font-semibold text-teal-700">문의 접수</span>
        )}
        <span className="ml-auto text-xs tabular-nums text-gray-500">
          {session.pageviews.length}페이지 · {formatDuration(session.engagedMs)}
          {session.bounced && ' · 이탈'}
        </span>
      </div>
      <p className="mt-1 pl-14 text-xs text-gray-500">{details.join(' · ')}</p>

      <ol className="mt-2 flex flex-wrap items-center gap-1 pl-14 text-xs">
        {session.timeline.map((event, i) => (
          <li key={event.id} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3 w-3 text-gray-300" aria-hidden />}
            {event.type === 'pageview' ? (
              <PageStep event={event} />
            ) : (
              <span className="inline-flex items-center gap-1 rounded-md bg-teal-50 px-1.5 py-0.5 font-medium text-teal-800">
                {event.name === 'inquiry_submit' ? (
                  <Send className="h-3 w-3" aria-hidden />
                ) : (
                  <MousePointerClick className="h-3 w-3" aria-hidden />
                )}
                {actionLabel(event)}
              </span>
            )}
          </li>
        ))}
      </ol>
    </li>
  )
}

export default function SessionLog({ sessions }: { sessions: SessionRecord[] }) {
  const [filter, setFilter] = useState<Filter>('all')
  const [shown, setShown] = useState(PAGE_SIZE)

  const filtered = sessions.filter((s) =>
    filter === 'converted' ? s.converted : filter === 'engaged' ? !s.bounced : true
  )

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-gray-900">방문 기록</h2>
          <p className="mt-0.5 text-xs text-gray-500">
            방문 한 번마다 어디서 들어와 어떤 페이지를 거쳐 무엇을 했는지 보여줍니다. 최신 순.
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1" role="group" aria-label="방문 기록 필터">
          {FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => {
                setFilter(item.value)
                setShown(PAGE_SIZE)
              }}
              aria-pressed={filter === item.value}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                filter === item.value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">
          {sessions.length === 0 ? '이 날에는 방문 기록이 없습니다.' : '조건에 맞는 방문이 없습니다.'}
        </p>
      ) : (
        <>
          <ul className="mt-2 divide-y divide-gray-100">
            {filtered.slice(0, shown).map((session) => (
              <SessionRow key={session.sid} session={session} />
            ))}
          </ul>
          {filtered.length > shown && (
            <button
              type="button"
              onClick={() => setShown((n) => n + PAGE_SIZE)}
              className="mt-2 w-full rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              더 보기 ({filtered.length - shown}건 남음)
            </button>
          )}
        </>
      )}
    </section>
  )
}
