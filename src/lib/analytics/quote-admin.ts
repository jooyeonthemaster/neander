// ============================================================
// 견적 행동 분석 - 관리자 화면용 Firestore 조회 (quote_actions)
// ============================================================

import { collection, getDocs, limit, orderBy, query, Timestamp, where } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { QUOTE_ACTIONS_COLLECTION, parseActions, type QuoteActionBatch } from './quote-behavior'

/** 한 번에 읽는 최대 묶음 수 — 넘으면 화면에 알린다 */
export const MAX_BATCH_READ = 20_000

/** 기간 안에 기록된 묶음을 읽는다. 여정이 기간 경계에 걸치면 기간 안의 묶음만 들어온다 */
export async function fetchQuoteBatches(start: Date, end: Date): Promise<{ batches: QuoteActionBatch[]; truncated: boolean }> {
  const snapshot = await getDocs(
    query(
      collection(db, QUOTE_ACTIONS_COLLECTION),
      where('ts', '>=', Timestamp.fromDate(start)),
      where('ts', '<', Timestamp.fromDate(end)),
      orderBy('ts'),
      limit(MAX_BATCH_READ),
    ),
  )
  const batches = snapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      jid: String(data.jid ?? doc.id.split('_')[0]),
      seq: Number(data.seq ?? 0),
      ts: data.ts instanceof Timestamp ? data.ts.toDate() : new Date(),
      actions: parseActions(data.actions),
      vid: String(data.vid ?? ''),
      sid: String(data.sid ?? ''),
      internal: data.internal === true,
      device: String(data.device ?? 'desktop'),
      channel: String(data.channel ?? 'direct'),
      source: String(data.source ?? 'direct'),
      browser: String(data.browser ?? '기타'),
      locale: String(data.locale ?? 'ko'),
    }
  })
  return { batches, truncated: snapshot.size >= MAX_BATCH_READ }
}
