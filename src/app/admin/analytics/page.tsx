'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Download, Loader2, RefreshCw } from 'lucide-react'
import AdminHeader from '../components/AdminHeader'
import KpiGrid from './components/KpiGrid'
import TrendChart from './components/TrendChart'
import PagesTable from './components/PagesTable'
import SessionLog from './components/SessionLog'
import StatTable, { type StatRow } from './components/StatTable'
import Heatmap from './components/Heatmap'
import { BarList, BarListCard, type BarListItem } from './components/BarList'
import { cityName, countryName, formatNumber, formatPercent, langName, pageName, regionName } from './components/format'
import { downloadCsv } from './components/csv'
import { useAnalyticsReport, type DrillTarget } from './useAnalyticsReport'
import { splitSourceKey, type Counter, type StatMap, type Summary } from '@/lib/analytics/aggregate'
import {
  addDays,
  formatDuration,
  periodOf,
  rangePresets,
  shiftPeriod,
  todayKey,
  type PeriodMode,
} from '@/lib/analytics/period'
import {
  CHANNEL_DESCRIPTIONS,
  CHANNEL_LABELS,
  CHANNELS,
  DEVICE_LABELS,
  EVENT_LABELS,
  INQUIRY_KIND_LABELS,
  sourceLabel,
  type Channel,
  type DeviceType,
} from '@/lib/analytics/sources'
import { isAnalyticsOptedOut, setAnalyticsOptOut } from '@/lib/analytics/tracker'

const MODES: { value: PeriodMode; label: string }[] = [
  { value: 'day', label: '일' },
  { value: 'month', label: '월' },
  { value: 'year', label: '연' },
  { value: 'range', label: '기간' },
]

/** 기록을 시작한 해 (연도 선택 목록의 시작) */
const FIRST_YEAR = 2026
/** '기간'으로 바꿨을 때의 기본 구간 */
const DEFAULT_RANGE_DAYS = 28

function counterItems(counter: Counter, label: (key: string) => string = (key) => key): BarListItem[] {
  return Object.entries(counter).map(([key, value]) => ({ key, label: label(key), value }))
}

function statItems(map: StatMap, label: (key: string) => string = (key) => key): BarListItem[] {
  return Object.entries(map).map(([key, stat]) => ({
    key,
    label: label(key),
    meta: stat.conv ? `문의 ${stat.conv}` : undefined,
    value: stat.ss,
  }))
}

function channelRows(summary: Summary): StatRow[] {
  return CHANNELS.filter((channel) => summary.channels[channel]).map((channel) => ({
    key: channel,
    label: <span title={CHANNEL_DESCRIPTIONS[channel]}>{CHANNEL_LABELS[channel]}</span>,
    stat: summary.channels[channel],
  }))
}

function sourceRows(summary: Summary): StatRow[] {
  return Object.entries(summary.sources).map(([key, stat]) => {
    const { channel, source } = splitSourceKey(key)
    return { key, label: sourceLabel(source), meta: CHANNEL_LABELS[channel] ?? channel, stat }
  })
}

function pathRows(map: StatMap): StatRow[] {
  return Object.entries(map).map(([path, stat]) => ({
    key: path,
    label: pageName(path) || path,
    meta: pageName(path) ? path : undefined,
    stat,
  }))
}

function actionItems(summary: Summary): BarListItem[] {
  const inquiries = Object.entries(summary.inquiries).map(([kind, value]) => ({
    key: `inquiry:${kind}`,
    label: INQUIRY_KIND_LABELS[kind] ?? kind,
    meta: '폼 제출',
    value,
  }))
  const clicks = Object.entries(summary.events)
    .filter(([name]) => name !== 'inquiry_submit')
    .map(([name, value]) => ({ key: name, label: EVENT_LABELS[name] ?? name, value }))
  return [...inquiries, ...clicks]
}

function Subheading({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-3 mt-6 text-xs font-semibold uppercase tracking-wide text-gray-400 first:mt-0">{children}</h3>
}

/** 문의로 이어진 방문이 어떤 모습이었는지 */
function ConversionProfile({ summary }: { summary: Summary }) {
  const { convSessions } = summary
  const best = (map: StatMap) =>
    Object.entries(map)
      .filter(([, stat]) => stat.conv > 0)
      .sort((a, b) => b[1].conv - a[1].conv)[0]

  if (convSessions === 0) {
    return <p className="py-6 text-center text-sm text-gray-400">이 기간에는 접수된 문의가 없습니다</p>
  }

  const topChannel = best(summary.channels)
  const topSource = best(summary.sources)
  const topLanding = best(summary.landings)
  const topDevice = best(summary.devices)

  const rows: { label: string; value: string }[] = [
    {
      label: '문의를 남긴 방문',
      value: `${formatNumber(convSessions)}회 (전체 방문의 ${formatPercent(
        summary.sessions ? convSessions / summary.sessions : 0
      )})`,
    },
    { label: '접수 전에 본 페이지', value: `평균 ${(summary.convPageviews / convSessions).toFixed(1)}개` },
    { label: '접수까지 머문 시간', value: `평균 ${formatDuration(summary.convMs / convSessions)}` },
    ...(topChannel
      ? [{ label: '가장 많은 유입 채널', value: `${CHANNEL_LABELS[topChannel[0] as Channel] ?? topChannel[0]} (${topChannel[1].conv}건)` }]
      : []),
    ...(topSource
      ? [{ label: '가장 많은 유입 소스', value: `${sourceLabel(splitSourceKey(topSource[0]).source)} (${topSource[1].conv}건)` }]
      : []),
    ...(topLanding
      ? [{ label: '가장 많은 첫 페이지', value: `${pageName(topLanding[0]) || topLanding[0]} (${topLanding[1].conv}건)` }]
      : []),
    ...(topDevice
      ? [{ label: '가장 많은 기기', value: `${DEVICE_LABELS[topDevice[0] as DeviceType] ?? topDevice[0]} (${topDevice[1].conv}건)` }]
      : []),
  ]

  return (
    <dl className="divide-y divide-gray-100 text-sm">
      {rows.map((row) => (
        <div key={row.label} className="flex items-baseline justify-between gap-4 py-2.5 first:pt-0">
          <dt className="text-gray-500">{row.label}</dt>
          <dd className="text-right font-medium text-gray-900">{row.value}</dd>
        </div>
      ))}
    </dl>
  )
}

function OptOutToggle() {
  // 관리자 화면은 로그인 확인 뒤 브라우저에서만 그려지므로 바로 localStorage를 읽어도 된다
  const [optedOut, setOptedOut] = useState(isAnalyticsOptedOut)

  return (
    <label className="flex cursor-pointer items-start gap-3 text-sm">
      <input
        type="checkbox"
        checked={optedOut}
        onChange={(e) => {
          setAnalyticsOptOut(e.target.checked)
          setOptedOut(e.target.checked)
        }}
        className="mt-0.5 h-4 w-4 rounded border-gray-300"
      />
      <span>
        <span className="font-medium text-gray-900">이 브라우저의 사이트 방문은 기록하지 않기</span>
        <span className="block text-xs text-gray-500">
          관리자로 로그인한 브라우저는 기본으로 제외됩니다. 팀원 방문이 통계에 섞이지 않게 하기 위함입니다.
        </span>
      </span>
    </label>
  )
}

export default function AdminAnalyticsPage() {
  const [mode, setMode] = useState<PeriodMode>('day')
  const [anchor, setAnchor] = useState(todayKey)
  const [rangeEnd, setRangeEnd] = useState(todayKey)
  const [reloadKey, setReloadKey] = useState(0)
  const { report, loading, error, progress } = useAnalyticsReport(mode, anchor, rangeEnd, reloadKey)

  const today = todayKey()
  const period = periodOf(mode, anchor, rangeEnd)
  const nextPeriod = shiftPeriod(period, 1)
  const atLatest = periodOf(mode, nextPeriod.anchor, nextPeriod.rangeEnd).start > today
  const years = Array.from({ length: Number(today.slice(0, 4)) - FIRST_YEAR + 1 }, (_, i) => FIRST_YEAR + i)
  const presets = rangePresets(today)
  const summary = report?.current

  function goTo(target: DrillTarget) {
    setMode(target.mode)
    setAnchor(target.anchor)
    if (target.rangeEnd) setRangeEnd(target.rangeEnd)
  }

  function changeMode(nextMode: PeriodMode) {
    setMode(nextMode)
    if (nextMode === 'range') {
      setAnchor(addDays(today, -(DEFAULT_RANGE_DAYS - 1)))
      setRangeEnd(today)
    } else if (anchor > today) {
      // 기간 단위를 바꿀 때 미래로 넘어가지 않도록 오늘로 맞춘다
      setAnchor(today)
    }
  }

  function setRange(start: string, end: string) {
    // 시작이 종료보다 뒤면 뒤집어서 받아준다
    const [from, to] = start <= end ? [start, end] : [end, start]
    setAnchor(from)
    setRangeEnd(to)
  }

  function step(direction: 1 | -1) {
    const target = shiftPeriod(period, direction)
    setAnchor(target.anchor)
    setRangeEnd(target.rangeEnd)
  }

  return (
    <div>
      <AdminHeader
        title="유입 분석"
        description="방문자가 어디서 들어와 무엇을 했는지 기간별로 봅니다. (한국 시간 기준)"
        actions={
          <>
            {report?.live && (
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" aria-hidden />
                실시간 · 최근 30분 {report.activeNow ?? 0}명
              </span>
            )}
            <button
              type="button"
              onClick={() => report && downloadCsv(report)}
              disabled={!report}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
              title="선택한 기간의 날짜별 지표와 소스·페이지 요약을 CSV로 내려받습니다"
            >
              <Download className="h-4 w-4" />
              CSV
            </button>
            <button
              type="button"
              onClick={() => setReloadKey((k) => k + 1)}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              새로고침
            </button>
          </>
        }
      />

      {/* 기간 선택 - 아래 모든 수치가 이 기간을 따른다 */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1" role="group" aria-label="기간 단위">
          {MODES.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => changeMode(item.value)}
              aria-pressed={mode === item.value}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                mode === item.value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => step(-1)}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            aria-label="이전 기간"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {mode === 'day' && (
            <input
              type="date"
              value={anchor}
              max={today}
              onChange={(e) => e.target.value && setAnchor(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-900"
              aria-label="날짜 선택"
            />
          )}
          {mode === 'month' && (
            <input
              type="month"
              value={anchor.slice(0, 7)}
              max={today.slice(0, 7)}
              onChange={(e) => e.target.value && setAnchor(`${e.target.value}-01`)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-900"
              aria-label="월 선택"
            />
          )}
          {mode === 'year' && (
            <select
              value={anchor.slice(0, 4)}
              onChange={(e) => setAnchor(`${e.target.value}-01-01`)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-900"
              aria-label="연도 선택"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}년
                </option>
              ))}
            </select>
          )}
          {mode === 'range' && (
            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={anchor}
                max={today}
                onChange={(e) => e.target.value && setRange(e.target.value, rangeEnd)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-900"
                aria-label="시작 날짜"
              />
              <span className="text-gray-400">~</span>
              <input
                type="date"
                value={rangeEnd}
                max={today}
                onChange={(e) => e.target.value && setRange(anchor, e.target.value)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-900"
                aria-label="종료 날짜"
              />
            </div>
          )}

          <button
            type="button"
            onClick={() => step(1)}
            disabled={atLatest}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-30 disabled:hover:bg-transparent"
            aria-label="다음 기간"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {mode === 'range' ? (
          <div className="flex flex-wrap items-center gap-1.5">
            {presets.map((preset) => {
              const active = anchor === preset.start && rangeEnd === preset.end
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setRange(preset.start, preset.end)}
                  aria-pressed={active}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    active
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {preset.label}
                </button>
              )
            })}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAnchor(today)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {mode === 'day' ? '오늘' : mode === 'month' ? '이번 달' : '올해'}
          </button>
        )}

        {(mode === 'day' || mode === 'range') && (
          <span className="text-sm font-medium text-gray-900">{period.label}</span>
        )}
        {report && <span className="text-xs text-gray-400">증감: {report.comparison.label}</span>}
        {progress && (
          <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            {progress}
          </span>
        )}
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
      )}

      {!report || !summary ? (
        !error && (
          <div className="flex items-center justify-center py-24 text-gray-400">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )
      ) : (
        // 다른 기간을 불러오는 동안에는 이전 화면을 흐리게 유지한다
        <div className={`space-y-6 transition-opacity ${loading ? 'opacity-50' : ''}`} aria-busy={loading}>
          <KpiGrid current={summary} previous={report.previous} comparisonLabel={report.comparison.label} />

          <TrendChart granularity={report.granularity} buckets={report.buckets} onDrill={goTo} />

          <div className="grid gap-6 lg:grid-cols-2">
            <BarListCard
              title="유입 채널 성과"
              description="방문이 어떤 경로로 시작됐는지와 그 방문의 질 (채널 이름에 마우스를 올리면 설명)"
            >
              <StatTable rows={channelRows(summary)} total={summary.sessions} header="채널" limit={CHANNELS.length} />
            </BarListCard>
            <BarListCard title="유입 소스 성과" description="구체적으로 어느 사이트·앱에서 들어왔는지">
              <StatTable rows={sourceRows(summary)} total={summary.sessions} header="소스" limit={8} />
            </BarListCard>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <BarListCard title="첫 방문 페이지" description="방문을 시작한 페이지별 성과">
              <StatTable rows={pathRows(summary.landings)} total={summary.sessions} header="페이지" limit={8} />
            </BarListCard>
            <BarListCard title="검색어·캠페인" description="검색엔진이 넘겨준 검색어와 utm 캠페인 (방문 기준)">
              <Subheading>검색어</Subheading>
              <BarList
                items={counterItems(summary.keywords)}
                limit={6}
                emptyText="검색어 기록 없음 (구글 등 대부분의 검색엔진은 검색어를 넘기지 않습니다)"
              />
              <Subheading>캠페인</Subheading>
              <BarList
                items={statItems(summary.campaigns)}
                limit={6}
                emptyText="캠페인 링크(utm_campaign)로 들어온 방문 없음"
              />
            </BarListCard>
          </div>

          <PagesTable summary={summary} />

          {report.heatmap && <Heatmap grid={report.heatmap} />}

          <div className="grid gap-6 lg:grid-cols-2">
            <BarListCard title="기기·방문자 유형" description="어떤 환경에서, 처음 온 사람인지 다시 온 사람인지">
              <Subheading>기기</Subheading>
              <StatTable
                rows={Object.entries(summary.devices).map(([key, stat]) => ({
                  key,
                  label: DEVICE_LABELS[key as DeviceType] ?? key,
                  stat,
                }))}
                total={summary.sessions}
                header="기기"
                limit={3}
              />
              <Subheading>방문자 유형</Subheading>
              <StatTable
                rows={Object.entries(summary.visitorTypes).map(([key, stat]) => ({
                  key,
                  label: key === 'new' ? '첫 방문' : '재방문',
                  stat,
                }))}
                total={summary.sessions}
                header="유형"
                limit={2}
              />
            </BarListCard>
            <BarListCard title="문의로 이어진 방문" description="접수까지 간 방문이 어떤 경로로, 얼마나 보고 결정했는지">
              <ConversionProfile summary={summary} />
            </BarListCard>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <BarListCard title="행동" description="방문자가 사이트에서 한 일 (발생 횟수)">
              <BarList items={actionItems(summary)} emptyText="기록된 행동 없음" />
              {Object.keys(summary.outbound).length > 0 && (
                <>
                  <Subheading>많이 누른 외부 링크</Subheading>
                  <BarList items={counterItems(summary.outbound)} limit={5} />
                </>
              )}
            </BarListCard>
            <BarListCard title="브라우저·운영체제" description="방문 기준">
              <Subheading>브라우저·앱</Subheading>
              <BarList items={counterItems(summary.browsers)} limit={6} />
              <Subheading>운영체제</Subheading>
              <BarList items={counterItems(summary.os)} limit={6} />
            </BarListCard>
            <BarListCard title="지역·언어" description="접속 위치는 IP로 추정한 값입니다 (IP는 저장하지 않음)">
              <Subheading>시·도</Subheading>
              <BarList items={counterItems(summary.regions, regionName)} limit={5} />
              <Subheading>시·군·구</Subheading>
              <BarList items={counterItems(summary.cities, cityName)} limit={5} />
              <Subheading>국가</Subheading>
              <BarList items={counterItems(summary.countries, countryName)} limit={4} />
              <Subheading>브라우저 언어</Subheading>
              <BarList items={counterItems(summary.langs, langName)} limit={4} />
              <Subheading>사이트 언어 (페이지뷰)</Subheading>
              <BarList items={counterItems(summary.locales, (key) => (key === 'en' ? '영문' : '한국어'))} />
            </BarListCard>
          </div>

          {report.sessions && <SessionLog sessions={report.sessions} />}
        </div>
      )}

      <footer className="mt-10 grid gap-6 border-t border-gray-200 pt-6 lg:grid-cols-2">
        <OptOutToggle />
        <details className="text-sm text-gray-600">
          <summary className="cursor-pointer font-medium text-gray-900">지표와 수집 방식</summary>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-xs leading-relaxed">
            <li>운영 도메인(neander.co.kr)의 공개 페이지만 기록합니다. 관리자 페이지·로컬·미리보기 배포는 제외됩니다.</li>
            <li>방문자는 브라우저마다 만드는 무작위 ID로 구분합니다. 이름·이메일·IP 같은 개인 정보는 저장하지 않습니다.</li>
            <li>30분 넘게 활동이 없으면 다음 활동부터 새 방문으로 셉니다. 유입 경로는 방문의 첫 페이지 기준입니다.</li>
            <li>카카오톡·인스타그램 앱 안에서 연 링크는 리퍼러가 없어도 해당 앱에서 온 소셜 유입으로 분류합니다.</li>
            <li>체류시간은 화면을 실제로 보고 있던 시간만 더하고, 한 페이지당 최대 30분까지 셉니다.</li>
            <li>이탈은 한 페이지만 10초 미만 보고 아무 행동 없이 떠난 방문입니다.</li>
            <li>방문 기록(개별 여정)은 7일 이하 기간을 볼 때만 표시됩니다. 더 긴 기간은 저장된 일별 요약으로 계산합니다.</li>
            <li>검색 로봇·크롤러로 보이는 방문은 기록하지 않습니다.</li>
          </ul>
        </details>
      </footer>
    </div>
  )
}
