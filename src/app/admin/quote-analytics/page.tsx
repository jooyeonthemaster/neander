'use client'

import { useEffect, useMemo, useState } from 'react'
import { FirebaseError } from 'firebase/app'
import { BarList, BarListCard, type BarListItem } from '../analytics/components/BarList'
import { formatNumber, formatPercent, share } from '../analytics/components/format'
import JourneyLog from './JourneyLog'
import { fetchQuoteBatches } from '@/lib/analytics/quote-admin'
import {
  IDLE_CAP_MS,
  buildJourneys,
  summarizeJourneys,
  type CountRow,
  type DwellRow,
  type QuoteActionBatch,
} from '@/lib/analytics/quote-behavior'
import { dayEnd, dayStart, formatDuration, rangePresets, todayKey } from '@/lib/analytics/period'
import { CHANNEL_LABELS, DEVICE_LABELS } from '@/lib/analytics/sources'

/* ─────────────────────────────────────────────────────────
   온라인 견적(/quote) 행동 분석
   방문자가 견적 화면에서 어디까지 갔고, 어디서 떠났고, 무엇을 오래 보고 눌렀는지
   ───────────────────────────────────────────────────────── */

type VisitorFilter = 'external' | 'all' | 'internal'
type DeviceFilter = 'all' | 'desktop' | 'mobile' | 'tablet'

const VISITOR_FILTERS: { value: VisitorFilter; label: string }[] = [
  { value: 'external', label: '내부 제외' },
  { value: 'all', label: '전체' },
  { value: 'internal', label: '내부만' },
]
const DEVICE_FILTERS: { value: DeviceFilter; label: string }[] = [
  { value: 'all', label: '모든 기기' },
  { value: 'desktop', label: 'PC' },
  { value: 'mobile', label: '모바일' },
  { value: 'tablet', label: '태블릿' },
]

const toItems = (rows: CountRow[], by: 'journeys' | 'count' = 'journeys'): BarListItem[] =>
  rows.map((row) => ({
    key: row.key,
    label: row.label,
    value: row[by],
    meta: by === 'journeys' && row.count !== row.journeys ? `총 ${formatNumber(row.count)}회` : undefined,
  }))

function describeError(error: unknown): string {
  if (error instanceof FirebaseError && error.code === 'permission-denied') {
    return 'Firestore 규칙(quote_actions)이 배포되지 않았거나 관리자 권한이 없습니다. firebase deploy --only firestore:rules 를 실행했는지 확인해 주세요.'
  }
  return '견적 행동 기록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.'
}

function Pill<T extends string>({ options, value, onChange }: { options: { value: T; label: string }[]; value: T; onChange: (value: T) => void }) {
  return (
    <div className="inline-flex rounded-lg border border-gray-200 bg-white p-0.5">
      {options.map((option) => (
        <button key={option.value} type="button" onClick={() => onChange(option.value)} aria-pressed={value === option.value}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${value === option.value ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
          {option.label}
        </button>
      ))}
    </div>
  )
}

function Kpi({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-bold tabular-nums text-gray-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  )
}

function DwellTable({ rows, base, emptyText }: { rows: DwellRow[]; base: number; emptyText: string }) {
  if (rows.length === 0) return <p className="py-6 text-center text-sm text-gray-400">{emptyText}</p>
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-left text-xs text-gray-500">
            <th className="py-2 pr-3 font-medium">화면</th>
            <th className="py-2 pr-3 text-right font-medium">본 여정</th>
            <th className="py-2 pr-3 text-right font-medium">중간 체류</th>
            <th className="py-2 pr-3 text-right font-medium">평균 체류</th>
            <th className="py-2 text-right font-medium">여기서 떠남</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} className="border-b border-gray-50 last:border-0">
              <td className="py-2.5 pr-3 text-gray-800">{row.label}</td>
              <td className="py-2.5 pr-3 text-right tabular-nums text-gray-700">{formatNumber(row.journeys)} <span className="text-xs text-gray-400">{formatPercent(share(row.journeys, base))}</span></td>
              <td className="py-2.5 pr-3 text-right tabular-nums font-semibold text-gray-900">{formatDuration(row.median)}</td>
              <td className="py-2.5 pr-3 text-right tabular-nums text-gray-600">{formatDuration(row.mean)}</td>
              <td className="py-2.5 text-right tabular-nums text-gray-700">
                {formatNumber(row.exits)} <span className={`text-xs ${share(row.exits, row.journeys) >= 0.4 ? 'font-semibold text-rose-600' : 'text-gray-400'}`}>{formatPercent(share(row.exits, row.journeys))}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function QuoteAnalyticsPage() {
  const presets = useMemo(() => rangePresets(), [])
  const [range, setRange] = useState({ start: presets[1].start, end: todayKey() })
  const [visitors, setVisitors] = useState<VisitorFilter>('external')
  const [device, setDevice] = useState<DeviceFilter>('all')
  const rangeKey = `${range.start}~${range.end}`
  // 불러온 기간(key)이 지금 고른 기간과 다르면 불러오는 중이다
  const [state, setState] = useState<{ key: string | null; error: string | null; batches: QuoteActionBatch[]; truncated: boolean }>({
    key: null, error: null, batches: [], truncated: false,
  })
  const loading = state.key !== rangeKey

  useEffect(() => {
    let cancelled = false
    const [start, end] = rangeKey.split('~')
    fetchQuoteBatches(dayStart(start), dayEnd(end))
      .then(({ batches, truncated }) => { if (!cancelled) setState({ key: rangeKey, error: null, batches, truncated }) })
      .catch((error) => { if (!cancelled) setState({ key: rangeKey, error: describeError(error), batches: [], truncated: false }) })
    return () => { cancelled = true }
  }, [rangeKey])

  const allJourneys = useMemo(() => buildJourneys(state.batches), [state.batches])
  const journeys = useMemo(() => allJourneys.filter((j) =>
    (visitors === 'all' || (visitors === 'internal') === j.internal) && (device === 'all' || j.device === device),
  ), [allJourneys, visitors, device])
  const stats = useMemo(() => summarizeJourneys(journeys), [journeys])
  const internalCount = allJourneys.filter((j) => j.internal).length
  const base = stats.funnel[0]?.value ?? 0

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">견적 행동 분석</h1>
          <p className="mt-1 text-sm text-gray-500">온라인 견적(/quote)에서 방문자가 어디까지 가고, 어디서 떠나고, 무엇을 오래 보고 눌렀는지 (견적 화면을 연 한 번 = 여정 1건)</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Pill options={VISITOR_FILTERS} value={visitors} onChange={setVisitors} />
          <Pill options={DEVICE_FILTERS} value={device} onChange={setDevice} />
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-gray-200 bg-white p-3">
        {presets.map((preset) => (
          <button key={preset.label} type="button" onClick={() => setRange({ start: preset.start, end: preset.end })}
            className={`rounded-md px-3 py-1.5 text-xs font-medium ${range.start === preset.start && range.end === preset.end ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
            {preset.label}
          </button>
        ))}
        <span className="mx-1 h-5 w-px bg-gray-200" aria-hidden="true" />
        <label className="flex items-center gap-1.5 text-xs text-gray-500">시작
          <input type="date" value={range.start} max={range.end} onChange={(e) => e.target.value && setRange((r) => ({ ...r, start: e.target.value }))} className="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-800" />
        </label>
        <label className="flex items-center gap-1.5 text-xs text-gray-500">끝
          <input type="date" value={range.end} min={range.start} max={todayKey()} onChange={(e) => e.target.value && setRange((r) => ({ ...r, end: e.target.value }))} className="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-800" />
        </label>
        {loading && <span className="ml-auto text-xs text-gray-400">불러오는 중…</span>}
      </div>

      {state.error && <p className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{state.error}</p>}
      {state.truncated && <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">기록이 많아 앞부분만 불러왔습니다. 기간을 줄여 보세요.</p>}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Kpi label="견적 여정" value={formatNumber(stats.journeys)} hint={`방문자 ${formatNumber(stats.visitors)}명${visitors === 'external' && internalCount ? ` · 내부 ${internalCount}건 제외` : ''}`} />
        <Kpi label="발급·요청 전환율" value={formatPercent(share(stats.submitted, stats.journeys))} hint={`가견적서 ${stats.pdf} · 상담 요청 ${stats.request}`} />
        <Kpi label="중간 이용 시간" value={formatDuration(stats.medianActiveMs)} hint="탭을 숨긴 시간 제외" />
        <Kpi label="평균 최종 견적" value={stats.meanFinalTotal ? `${formatNumber(Math.round(stats.meanFinalTotal / 10_000))}만원` : '-'} hint="체험을 담은 여정, 부가세 포함" />
        <Kpi label="옵션 창을 연 여정" value={formatPercent(share(stats.funnel[4]?.value ?? 0, base))} hint="3단계에서 옵션을 살펴본 비율" />
      </div>

      <BarListCard title="단계별 도달과 이탈" description="각 단계까지 온 여정 수 · 처음 대비 비율 · 바로 앞 단계에서 떠난 수">
        {base === 0 ? <p className="py-6 text-center text-sm text-gray-400">이 기간에 기록된 견적 여정이 없습니다</p> : (
          <ol className="space-y-3">
            {stats.funnel.map((step, i) => {
              const prev = i === 0 ? null : stats.funnel[i - 1].value
              const lost = prev === null ? 0 : prev - step.value
              return (
                <li key={step.key}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="text-gray-800">{step.label} <span className="text-xs text-gray-400">{step.hint}</span></span>
                    <span className="shrink-0 tabular-nums">
                      <span className="font-semibold text-gray-900">{formatNumber(step.value)}</span>
                      <span className="ml-2 text-xs text-gray-400">{formatPercent(share(step.value, base))}</span>
                      {prev !== null && lost > 0 && <span className="ml-3 text-xs text-rose-600">−{formatNumber(lost)} ({formatPercent(share(lost, prev))} 이탈)</span>}
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 rounded-full bg-gray-100"><div className="h-2 rounded-full bg-[#2a78d6]" style={{ width: `${share(step.value, base) * 100}%` }} /></div>
                </li>
              )
            })}
          </ol>
        )}
      </BarListCard>

      <BarListCard title="단계별 체류와 이탈" description={`실제로 보고 있던 시간 (탭 숨김 제외, 아무 행동 없는 시간은 ${IDLE_CAP_MS / 60000}분까지만) · 그 화면을 마지막으로 발급·요청 없이 떠난 여정`}>
        <DwellTable rows={stats.screens} base={base} emptyText="기록 없음" />
      </BarListCard>

      <BarListCard title="옵션 창 페이지별 체류와 이탈" description="체험 옵션 창의 각 페이지를 본 여정과 머문 시간 · 그 페이지를 마지막으로 떠난 여정">
        <DwellTable rows={stats.optionPages} base={base} emptyText="옵션 창을 연 여정이 없습니다" />
      </BarListCard>

      <div className="grid gap-6 lg:grid-cols-3">
        <BarListCard title="어디서 떠났나" description="발급·요청 없이 끝난 여정의 마지막 화면">
          <BarList items={toItems(stats.exitPoints)} unit="건" />
        </BarListCard>
        <BarListCard title="떠나기 직전 행동" description="마지막으로 한 행동">
          <BarList items={toItems(stats.exitActions)} unit="건" />
        </BarListCard>
        <BarListCard title="떠날 때 견적 금액" description="발급·요청 없이 끝난 여정의 마지막 합계 (부가세 포함)">
          <BarList items={stats.exitTotals.map((row) => ({ key: row.label, label: row.label, value: row.value }))} unit="건" limit={10} />
        </BarListCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <BarListCard title="많이 누른 것" description="누른 여정 수 (한 여정이 여러 번 눌러도 1)">
          <BarList items={toItems(stats.clicks)} unit="건" total={base} limit={15} />
        </BarListCard>
        <BarListCard title="유심히 본 것" description="마우스를 1초 이상 올려 둔 대상 · 머문 시간 합 (PC만 해당)">
          <BarList items={stats.hovers.map((row) => ({ key: row.key, label: row.label, value: Math.round((row.ms ?? 0) / 1000), meta: `${formatNumber(row.journeys)}건` }))} unit="초" limit={15} />
        </BarListCard>
        <BarListCard title="열어 본 안내(i)" description="옵션 설명 풍선을 연 여정 수">
          <BarList items={toItems(stats.infos)} unit="건" total={base} limit={10} />
        </BarListCard>
        <BarListCard title="시작 방법·템플릿" description="고른 여정 수">
          <BarList items={toItems(stats.presets)} unit="건" total={base} />
        </BarListCard>
        <BarListCard title="담은 체험" description="담기를 누른 여정 수">
          <BarList items={toItems(stats.added)} unit="건" total={base} />
        </BarListCard>
        <BarListCard title="뺀 체험" description="담았다가 뺀 여정 수">
          <BarList items={toItems(stats.removed)} unit="건" total={base} />
        </BarListCard>
        <BarListCard title="바꿔 본 옵션" description="체험 옵션을 그 값으로 바꾼 여정 수">
          <BarList items={toItems(stats.optionChanges)} unit="건" total={base} limit={15} />
        </BarListCard>
        <BarListCard title="바꿔 본 행사 정보" description="행사 정보를 그 값으로 바꾼 여정 수">
          <BarList items={toItems(stats.conditionChanges)} unit="건" total={base} limit={15} />
        </BarListCard>
        <BarListCard title="연락처 칸 진입" description="4단계에서 눌러 본 칸 (입력한 내용은 기록하지 않음)">
          <BarList items={toItems(stats.contactFields)} unit="건" total={base} />
        </BarListCard>
        <BarListCard title="기기·유입 경로" description="여정 수">
          <BarList items={[
            ...stats.devices.map((row) => ({ key: `d-${row.key}`, label: `기기 · ${DEVICE_LABELS[row.key as keyof typeof DEVICE_LABELS] ?? row.key}`, value: row.journeys })),
            ...stats.channels.map((row) => ({ key: `c-${row.key}`, label: `유입 · ${CHANNEL_LABELS[row.key as keyof typeof CHANNEL_LABELS] ?? row.key}`, value: row.journeys })),
          ]} unit="건" total={base} limit={12} />
        </BarListCard>
      </div>

      <BarListCard title="여정 기록" description="최근 여정부터 · 누르면 한 사람이 견적 화면에서 한 일을 순서대로 봅니다">
        <JourneyLog journeys={journeys} />
      </BarListCard>
    </div>
  )
}
