import { emptySummary, metricsOf, type Summary } from '@/lib/analytics/aggregate'
import { pastDays, type Report } from '../useAnalyticsReport'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

// 보고용으로 기간 데이터를 CSV로 내려받는다 (엑셀에서 바로 열 수 있게 BOM을 붙인다)

function escape(value: string | number): string {
  const text = String(value)
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

function row(day: string, summary: Summary): (string | number)[] {
  const m = metricsOf(summary)
  return [
    day,
    WEEKDAYS[new Date(`${day}T00:00:00+09:00`).getUTCDay()],
    m.visitors,
    m.newVisitors,
    m.sessions,
    m.pageviews,
    Math.round(m.bounceRate * 1000) / 10,
    Math.round(m.avgSessionMs / 1000),
    m.conversions,
  ]
}

/** 날짜별 지표 + 기간 전체의 유입 소스·페이지 요약 */
export function buildCsv(report: Report): string {
  const lines: string[] = []
  lines.push(['날짜', '요일', '방문자', '신규 방문자', '방문', '페이지뷰', '이탈률(%)', '평균 체류(초)', '문의·견적'].join(','))
  for (const day of pastDays(report.period)) {
    lines.push(row(day, report.days.get(day) ?? emptySummary()).map(escape).join(','))
  }

  lines.push('')
  lines.push(['유입 소스', '채널', '방문', '이탈률(%)', '평균 체류(초)', '문의·견적'].join(','))
  for (const [key, stat] of Object.entries(report.current.sources).sort((a, b) => b[1].ss - a[1].ss)) {
    const [channel, source] = key.split('\t')
    lines.push(
      [source, channel, stat.ss, Math.round((stat.bounces / stat.ss) * 1000) / 10, Math.round(stat.dur / stat.ss / 1000), stat.conv]
        .map(escape)
        .join(',')
    )
  }

  lines.push('')
  lines.push(['페이지', '조회수', '첫 페이지', '이탈 페이지', '평균 체류(초)', '평균 스크롤(%)'].join(','))
  for (const [path, stat] of Object.entries(report.current.pages).sort((a, b) => b[1].pv - a[1].pv)) {
    lines.push(
      [
        path,
        stat.pv,
        stat.entries,
        stat.exits,
        stat.durN ? Math.round(stat.dur / stat.durN / 1000) : 0,
        stat.scrollN ? Math.round(stat.scroll / stat.scrollN) : 0,
      ]
        .map(escape)
        .join(',')
    )
  }

  return `﻿${lines.join('\n')}`
}

export function downloadCsv(report: Report) {
  const blob = new Blob([buildCsv(report)], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `neander-유입분석_${report.period.start}_${report.period.end}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
