// ============================================================
// 유입 분석 - 관리자 화면용 Firestore 조회
// 지난 날짜는 analytics_daily/{YYYY-MM-DD} 요약을 쓰고, 없거나 오래된 날짜만
// 원본 이벤트로 계산해 요약을 저장해 둔다 (다음 조회부터는 요약만 읽는다).
// ============================================================

import {
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  where,
  writeBatch,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import {
  DAILY_COLLECTION,
  EVENTS_COLLECTION,
  SUMMARY_VERSION,
  compactSummary,
  emptySummary,
  summarize,
  type AnalyticsEvent,
  type Summary,
} from './aggregate'
import { dayEnd, dayKeyOf, dayStart, daysBetween, todayKey } from './period'

/** 하루가 끝난 뒤에도 체류시간 갱신이 늦게 도착할 수 있어 이만큼 지난 뒤 요약을 확정한다 */
const FINALIZE_GRACE_MS = 60 * 60 * 1000
/** 한 번에 원본을 읽을 최대 날짜 수 */
const MAX_RUN_DAYS = 31

function toEvent(snapshot: QueryDocumentSnapshot<DocumentData>): AnalyticsEvent {
  const data = snapshot.data()
  const ts = data.ts instanceof Timestamp ? data.ts.toDate() : new Date()
  return {
    id: snapshot.id,
    type: data.type === 'event' ? 'event' : 'pageview',
    name: data.name ?? null,
    label: data.label ?? null,
    path: data.path ?? '/',
    locale: data.locale ?? null,
    vid: data.vid ?? snapshot.id,
    sid: data.sid ?? snapshot.id,
    new_visitor: data.new_visitor === true,
    entry: data.entry === true,
    channel: data.channel ?? 'direct',
    source: data.source ?? 'direct',
    medium: data.medium ?? null,
    campaign: data.campaign ?? null,
    keyword: data.keyword ?? null,
    referrer: data.referrer ?? null,
    landing: data.landing ?? null,
    device: data.device ?? 'desktop',
    browser: data.browser ?? '기타',
    os: data.os ?? '기타',
    inapp: data.inapp ?? null,
    country: data.country ?? null,
    city: data.city ?? null,
    lang: data.lang ?? null,
    dur: typeof data.dur === 'number' ? data.dur : null,
    scroll: typeof data.scroll === 'number' ? data.scroll : null,
    ts,
  }
}

function eventsQuery(start: Date, end: Date) {
  return query(
    collection(db, EVENTS_COLLECTION),
    where('ts', '>=', Timestamp.fromDate(start)),
    where('ts', '<', Timestamp.fromDate(end)),
    orderBy('ts', 'asc')
  )
}

export async function fetchEvents(start: Date, end: Date): Promise<AnalyticsEvent[]> {
  const snapshot = await getDocs(eventsQuery(start, end))
  return snapshot.docs.map(toEvent)
}

/** 구간의 원본 이벤트를 실시간으로 구독한다 (오늘을 보고 있을 때) */
export function subscribeEvents(
  start: Date,
  end: Date,
  onChange: (events: AnalyticsEvent[]) => void,
  onError: (error: Error) => void
): () => void {
  return onSnapshot(
    eventsQuery(start, end),
    (snapshot) => onChange(snapshot.docs.map(toEvent)),
    onError
  )
}

let firstDayPromise: Promise<string | null> | null = null

/** 기록이 시작된 날짜. 그 이전 날짜는 조회하지 않는다 */
export function getFirstEventDay(): Promise<string | null> {
  firstDayPromise ??= getDocs(
    query(collection(db, EVENTS_COLLECTION), orderBy('ts', 'asc'), limit(1))
  )
    .then((snapshot) => (snapshot.empty ? null : dayKeyOf(toEvent(snapshot.docs[0]).ts)))
    .catch((error) => {
      firstDayPromise = null
      throw error
    })
  return firstDayPromise
}

interface DailyDoc {
  date: string
  v: number
  final: boolean
  data: string
}

function isFinal(day: string, now: number): boolean {
  return now >= dayEnd(day).getTime() + FINALIZE_GRACE_MS
}

/** 연속된 날짜끼리 묶는다 (원본 조회 횟수를 줄이기 위해) */
function contiguousRuns(days: string[]): string[][] {
  const runs: string[][] = []
  for (const day of days) {
    const run = runs[runs.length - 1]
    const prev = run?.[run.length - 1]
    if (run && prev && dayKeyOf(dayEnd(prev)) === day && run.length < MAX_RUN_DAYS) run.push(day)
    else runs.push([day])
  }
  return runs
}

/**
 * 지난 날짜들의 일별 요약을 돌려준다. 오늘 이후 날짜는 넣지 않는다.
 * 저장된 요약이 없거나 확정 전이면 원본으로 다시 계산하고 저장한다.
 */
export async function loadDailySummaries(
  startKey: string,
  endKey: string,
  onProgress?: (done: number, total: number) => void
): Promise<Map<string, Summary>> {
  const result = new Map<string, Summary>()
  const today = todayKey()
  const lastPast = endKey < today ? endKey : dayKeyOf(new Date(dayStart(today).getTime() - 1))
  const firstDay = await getFirstEventDay()
  if (!firstDay) return result
  const from = startKey > firstDay ? startKey : firstDay
  if (from > lastPast) return result

  const saved = await getDocs(
    query(collection(db, DAILY_COLLECTION), where('date', '>=', from), where('date', '<=', lastPast))
  )
  for (const snapshot of saved.docs) {
    const data = snapshot.data() as DailyDoc
    if (data.v !== SUMMARY_VERSION || !data.final) continue
    try {
      result.set(data.date, JSON.parse(data.data) as Summary)
    } catch {
      // 손상된 요약은 다시 계산한다
    }
  }

  const missing = daysBetween(from, lastPast).filter((day) => !result.has(day))
  const runs = contiguousRuns(missing)
  let done = 0
  const now = Date.now()

  for (const run of runs) {
    const events = await fetchEvents(dayStart(run[0]), dayEnd(run[run.length - 1]))
    const byDay = new Map<string, AnalyticsEvent[]>()
    for (const event of events) {
      const key = dayKeyOf(event.ts)
      const list = byDay.get(key)
      if (list) list.push(event)
      else byDay.set(key, [event])
    }

    const batch = writeBatch(db)
    for (const day of run) {
      const dayEvents = byDay.get(day) ?? []
      const summary = dayEvents.length ? compactSummary(summarize(dayEvents)) : emptySummary()
      result.set(day, summary)
      batch.set(doc(db, DAILY_COLLECTION, day), {
        date: day,
        v: SUMMARY_VERSION,
        final: isFinal(day, now),
        events: dayEvents.length,
        computed_at: new Date(now).toISOString(),
        data: JSON.stringify(summary),
      })
    }
    try {
      await batch.commit()
    } catch (error) {
      // 요약 저장에 실패해도 화면에는 계산 결과를 보여준다
      console.error('[analytics] 일별 요약 저장 실패:', error)
    }
    done += run.length
    onProgress?.(done, missing.length)
  }

  return result
}
