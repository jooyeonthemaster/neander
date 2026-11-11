import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore'
import { db } from './config'
import type { Inquiry, InquiryInput, InquiryStatus } from '@/types/inquiry'
import { inquiryAttribution } from '@/lib/analytics/tracker'

const COLLECTION = 'inquiries'

// 연결이 끊기면 Firestore SDK는 쓰기를 계속 재시도할 뿐 실패를 알려주지 않으므로,
// 이 시간이 지나면 실패로 보고 폼에 오류 화면을 띄운다.
const WRITE_TIMEOUT_MS = 15_000

/**
 * Firestore는 undefined 값을 거부하므로 저장 전에 제거한다.
 * (견적 스냅샷의 선택 항목이 비어 있는 경우가 있다)
 */
function stripUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => stripUndefined(item)) as unknown as T
  }
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => [k, stripUndefined(v)])
    return Object.fromEntries(entries) as T
  }
  return value
}

/**
 * 저장된 문의를 담당자 메일로 알린다 (/api/inquiry-notify).
 * 문의는 이미 저장됐으므로 알림이 실패해도 폼은 성공으로 처리한다.
 * keepalive로 보내 제출 직후 페이지를 떠나도 요청이 끝까지 간다.
 */
function notifyInquiry(id: string, payload: Record<string, unknown>): void {
  if (typeof window === 'undefined') return
  void fetch('/api/inquiry-notify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(stripUndefined({ id, ...payload })),
    keepalive: true,
  }).catch(() => {})
}

/**
 * 공개 페이지(문의·견적 폼)에서 문의를 저장한다.
 * Firestore 규칙에서 누구나 create만 가능하고, 읽기·수정은 관리자만 가능하다.
 */
export async function createInquiry(input: InquiryInput): Promise<string> {
  const now = new Date().toISOString()
  const payload = {
    ...input,
    // 선택 입력값은 빈 문자열 대신 null로 저장해 규칙 검증을 단순하게 유지한다
    phone: input.phone || null,
    company: input.company || null,
    status: 'new' as InquiryStatus,
    created_at: now,
    locale: input.locale,
    // 스팸 유입 파악용 (개인 식별 정보는 저장하지 않는다)
    source_path: typeof window !== 'undefined' ? window.location.pathname : null,
    // 어디서 보고 왔는지: 고객이 고른 답(referral)과 방문 기록에서 읽은 유입 경로(attribution)
    referral: input.referral || null,
    attribution: inquiryAttribution(),
  }

  let timer: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('문의 저장 시간이 초과되었습니다')), WRITE_TIMEOUT_MS)
  })

  // 유입 정보 필드(referral·attribution)를 허용하는 규칙이 아직 배포되지 않았으면 거부된다 →
  // 문의 자체를 잃지 않도록 그 두 필드를 빼고 한 번 더 저장한다
  const save = async () => {
    try {
      return await addDoc(collection(db, COLLECTION), stripUndefined(payload))
    } catch (error) {
      if ((error as { code?: string })?.code !== 'permission-denied') throw error
      const { referral: _referral, attribution: _attribution, ...rest } = payload
      void _referral
      void _attribution
      return addDoc(collection(db, COLLECTION), stripUndefined(rest))
    }
  }

  try {
    const ref = await Promise.race([save(), timeout])
    notifyInquiry(ref.id, payload)
    return ref.id
  } finally {
    clearTimeout(timer)
  }
}

/** 관리자 수신함 목록 (최신순) */
export async function listInquiries(): Promise<Inquiry[]> {
  const q = query(collection(db, COLLECTION), orderBy('created_at', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Inquiry)
}

export async function setInquiryStatus(id: string, status: InquiryStatus): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    status,
    updated_at: new Date().toISOString(),
  })
}

export async function deleteInquiry(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id))
}
