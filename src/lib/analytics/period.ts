// ============================================================
// 유입 분석 - 날짜·기간 계산 (한국 시간 기준)
// 날짜 키는 'YYYY-MM-DD' 문자열로 다루고, 하루의 경계는 KST 자정이다.
// 한국은 서머타임이 없어 +09:00 고정 오프셋으로 계산한다.
// ============================================================

const KST_OFFSET_MS = 9 * 60 * 60 * 1000
export const DAY_MS = 24 * 60 * 60 * 1000

export type PeriodMode = 'day' | 'month' | 'year'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

function shifted(date: Date): Date {
  return new Date(date.getTime() + KST_OFFSET_MS)
}

/** 순간(Date)의 KST 날짜 키 */
export function dayKeyOf(date: Date): string {
  return shifted(date).toISOString().slice(0, 10)
}

export function todayKey(): string {
  return dayKeyOf(new Date())
}

/** KST 기준 시(0~23) */
export function kstHour(date: Date): number {
  return shifted(date).getUTCHours()
}

/** 날짜 키의 KST 자정 */
export function dayStart(key: string): Date {
  return new Date(`${key}T00:00:00+09:00`)
}

/** 날짜 키 다음 날의 KST 자정 (구간의 끝, 미포함) */
export function dayEnd(key: string): Date {
  return new Date(dayStart(key).getTime() + DAY_MS)
}

export function addDays(key: string, amount: number): string {
  return dayKeyOf(new Date(dayStart(key).getTime() + amount * DAY_MS))
}

export function daysBetween(startKey: string, endKey: string): string[] {
  const days: string[] = []
  for (let key = startKey; key <= endKey; key = addDays(key, 1)) days.push(key)
  return days
}

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate()
}

export interface Period {
  mode: PeriodMode
  /** 기간 안의 기준 날짜 */
  anchor: string
  /** 첫 날 (포함) */
  start: string
  /** 마지막 날 (포함) */
  end: string
  label: string
}

export function periodOf(mode: PeriodMode, anchor: string): Period {
  const [y, m, d] = anchor.split('-').map(Number)
  if (mode === 'day') {
    const weekday = WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]
    return { mode, anchor, start: anchor, end: anchor, label: `${y}년 ${m}월 ${d}일 (${weekday})` }
  }
  if (mode === 'month') {
    return {
      mode,
      anchor,
      start: `${y}-${pad(m)}-01`,
      end: `${y}-${pad(m)}-${pad(daysInMonth(y, m))}`,
      label: `${y}년 ${m}월`,
    }
  }
  return { mode, anchor, start: `${y}-01-01`, end: `${y}-12-31`, label: `${y}년` }
}

/** 이전/다음 기간의 기준 날짜 */
export function shiftAnchor(mode: PeriodMode, anchor: string, step: number): string {
  const [y, m, d] = anchor.split('-').map(Number)
  if (mode === 'day') return addDays(anchor, step)
  if (mode === 'month') {
    const target = new Date(Date.UTC(y, m - 1 + step, 1))
    const ty = target.getUTCFullYear()
    const tm = target.getUTCMonth() + 1
    return `${ty}-${pad(tm)}-${pad(Math.min(d, daysInMonth(ty, tm)))}`
  }
  const ty = y + step
  return `${ty}-${pad(m)}-${pad(Math.min(d, daysInMonth(ty, m)))}`
}

export interface Comparison {
  /** 비교 구간 시작 날짜 */
  start: string
  /** 비교 구간 마지막 날짜 (포함) */
  end: string
  /**
   * 일 단위에서 오늘을 볼 때처럼 하루가 아직 끝나지 않았으면
   * 비교 날짜도 같은 시각까지만 센다 (구간 끝 순간)
   */
  until: Date | null
  label: string
}

/**
 * 증감을 비교할 직전 기간. 진행 중인 기간(오늘·이번 달·올해)은
 * 지금까지 지난 만큼만 비교해 "진행 중이라 적어 보이는" 착시를 막는다.
 */
export function comparisonOf(period: Period, now: Date = new Date()): Comparison {
  const today = dayKeyOf(now)
  const inProgress = period.start <= today && today <= period.end

  if (period.mode === 'day') {
    const prev = addDays(period.start, -1)
    if (!inProgress) return { start: prev, end: prev, until: null, label: '전일 대비' }
    const elapsed = now.getTime() - dayStart(period.start).getTime()
    return {
      start: prev,
      end: prev,
      until: new Date(dayStart(prev).getTime() + elapsed),
      label: '전일 같은 시각 대비',
    }
  }

  const prevAnchor = shiftAnchor(period.mode, period.start, -1)
  const prev = periodOf(period.mode, prevAnchor)
  if (!inProgress) {
    return { start: prev.start, end: prev.end, until: null, label: period.mode === 'month' ? '전월 대비' : '전년 대비' }
  }

  // 이번 달 1~N일 ↔ 지난달 1~N일, 올해 1/1~오늘 ↔ 작년 1/1~같은 날
  const elapsedDays = daysBetween(period.start, today).length
  const sameLength = addDays(prev.start, elapsedDays - 1)
  const end = sameLength < prev.end ? sameLength : prev.end
  return {
    start: prev.start,
    end,
    until: null,
    label: period.mode === 'month' ? '전월 같은 기간 대비' : '전년 같은 기간 대비',
  }
}

export function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return '0초'
  const totalSeconds = Math.round(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  if (minutes === 0) return `${seconds}초`
  if (minutes < 60) return seconds ? `${minutes}분 ${seconds}초` : `${minutes}분`
  const hours = Math.floor(minutes / 60)
  return `${hours}시간 ${minutes % 60}분`
}

export function formatTime(date: Date): string {
  const d = shifted(date)
  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`
}
