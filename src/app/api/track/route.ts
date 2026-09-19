import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { EVENTS_COLLECTION } from '@/lib/analytics/aggregate'
import { classifyOrigin, isBotAgent, parseUserAgent } from '@/lib/analytics/sources'

// 공개 사이트의 방문 기록기(src/lib/analytics/tracker.ts)가 sendBeacon으로 보내는 요청을 받아
// 유입 경로·기기·지역을 분류한 뒤 Firestore analytics_events 에 기록한다.
// 서버에 관리자 자격 증명이 없으므로 Firestore 규칙이 허용하는 형태(생성, 체류시간 갱신)로만 쓴다.

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
const DOCUMENTS = `projects/${PROJECT_ID}/databases/(default)/documents`
const COMMIT_URL = `https://firestore.googleapis.com/v1/${DOCUMENTS}:commit`
const OWN_HOSTS = ['neander.co.kr', 'www.neander.co.kr']
const MAX_BODY = 4096

const id = z.string().regex(/^[A-Za-z0-9]{16,24}$/)

const origin = z.object({
  ref: z.string().max(500),
  utm: z.object({
    source: z.string().max(100).optional(),
    medium: z.string().max(100).optional(),
    campaign: z.string().max(100).optional(),
    term: z.string().max(100).optional(),
    content: z.string().max(100).optional(),
  }),
  landing: z.string().max(300),
})

const hit = {
  id,
  path: z.string().startsWith('/').max(300),
  locale: z.enum(['ko', 'en']),
  vid: id,
  sid: id,
  nv: z.boolean(),
  entry: z.boolean(),
  s: origin,
  lang: z.string().max(20),
  tp: z.number().int().min(0).max(20),
}

const payloadSchema = z.discriminatedUnion('t', [
  z.object({ t: z.literal('pv'), ...hit }),
  z.object({
    t: z.literal('ev'),
    ...hit,
    name: z.enum(['inquiry_submit', 'click_tel', 'click_email', 'click_outbound']),
    label: z.string().max(200).nullable(),
  }),
  z.object({
    t: z.literal('eng'),
    id,
    dur: z.number().int().min(0).max(30 * 60 * 1000),
    scroll: z.number().int().min(0).max(100),
  }),
])

type FirestoreValue =
  | { nullValue: null }
  | { booleanValue: boolean }
  | { integerValue: string }
  | { stringValue: string }

function encode(value: string | number | boolean | null): FirestoreValue {
  if (value === null) return { nullValue: null }
  if (typeof value === 'boolean') return { booleanValue: value }
  if (typeof value === 'number') return { integerValue: String(Math.round(value)) }
  return { stringValue: value }
}

function encodeFields(data: Record<string, string | number | boolean | null>) {
  return Object.fromEntries(Object.entries(data).map(([k, v]) => [k, encode(v)]))
}

function header(request: NextRequest, name: string, max: number): string | null {
  const raw = request.headers.get(name)
  if (!raw) return null
  try {
    return decodeURIComponent(raw).slice(0, max)
  } catch {
    return raw.slice(0, max)
  }
}

async function commit(write: Record<string, unknown>) {
  const res = await fetch(COMMIT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ writes: [write] }),
    cache: 'no-store',
  })
  if (!res.ok) {
    console.error('[track] Firestore 기록 실패:', res.status, (await res.text()).slice(0, 300))
  }
}

export async function POST(request: NextRequest) {
  const done = new NextResponse(null, { status: 204 })
  if (!PROJECT_ID) return done

  const ua = request.headers.get('user-agent') ?? ''
  if (isBotAgent(ua)) return done

  const raw = await request.text()
  if (raw.length > MAX_BODY) return new NextResponse(null, { status: 413 })

  let payload: z.infer<typeof payloadSchema>
  try {
    payload = payloadSchema.parse(JSON.parse(raw))
  } catch {
    return new NextResponse(null, { status: 400 })
  }

  const name = `${DOCUMENTS}/${EVENTS_COLLECTION}/${payload.id}`

  try {
    if (payload.t === 'eng') {
      // 페이지를 떠날 때 체류시간·스크롤 깊이만 갱신한다 (규칙상 이 두 필드만 바꿀 수 있다)
      await commit({
        update: { name, fields: encodeFields({ dur: payload.dur, scroll: payload.scroll }) },
        updateMask: { fieldPaths: ['dur', 'scroll'] },
        currentDocument: { exists: true },
      })
      return done
    }

    const agent = parseUserAgent(ua, payload.tp)
    const source = classifyOrigin(payload.s, agent.inApp, OWN_HOSTS)
    const fields = encodeFields({
      type: payload.t === 'pv' ? 'pageview' : 'event',
      name: payload.t === 'ev' ? payload.name : null,
      label: payload.t === 'ev' ? payload.label : null,
      path: payload.path,
      locale: payload.locale,
      vid: payload.vid,
      sid: payload.sid,
      new_visitor: payload.nv,
      entry: payload.entry,
      channel: source.channel,
      source: source.source.slice(0, 100),
      medium: source.medium,
      campaign: source.campaign,
      keyword: source.keyword,
      referrer: source.referrer?.slice(0, 200) ?? null,
      landing: payload.s.landing || payload.path,
      device: agent.device,
      browser: agent.browser,
      os: agent.os,
      inapp: agent.inApp,
      // Vercel이 붙여주는 접속 지역 (IP 자체는 저장하지 않는다)
      country: header(request, 'x-vercel-ip-country', 5),
      region: header(request, 'x-vercel-ip-country-region', 10),
      city: header(request, 'x-vercel-ip-city', 60),
      lang: payload.lang || null,
    })

    await commit({
      update: { name, fields },
      updateTransforms: [{ fieldPath: 'ts', setToServerValue: 'REQUEST_TIME' }],
      currentDocument: { exists: false },
    })
  } catch (error) {
    console.error('[track] 요청 처리 실패:', error)
  }

  return done
}
