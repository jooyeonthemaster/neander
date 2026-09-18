#!/usr/bin/env node
/**
 * 포트폴리오 Firestore 동기화 스크립트
 *
 * scripts/portfolio-sync.data.json 의 내용을 Firestore `portfolio` 컬렉션에 반영한다.
 * - upserts: slug 기준으로 문서를 찾아 필드를 갱신하고, 없으면 새로 만든다.
 * - order:   나열된 slug 순서대로 display_order 를 1부터 다시 매긴다.
 *
 * 사용법
 *   node scripts/sync-portfolio.mjs           # 미리보기 (공개 REST로 읽기만 함, 인증 불필요)
 *   node scripts/sync-portfolio.mjs --apply   # 실제 반영 (관리자 인증 필요)
 *
 * --apply 인증: Firebase 콘솔 → 프로젝트 설정 → 서비스 계정 → "새 비공개 키 생성"으로 받은 JSON 경로를
 *   GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json node scripts/sync-portfolio.mjs --apply
 * 처럼 지정한다. (gcloud auth application-default login 으로 만든 ADC도 사용 가능)
 * 키 파일은 저장소에 커밋하지 않는다.
 */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const data = JSON.parse(readFileSync(join(here, 'portfolio-sync.data.json'), 'utf8'))
const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || data.projectId
const APPLY = process.argv.includes('--apply')

const DEFAULTS = {
  title_ko: '',
  title_en: '',
  description_ko: '',
  description_en: '',
  year: new Date().getFullYear(),
  category: 'offline',
  tags: [],
  images: [],
  thumbnail: '',
  services: [],
  client: '',
  location: null,
  is_featured: false,
  is_published: true,
}

// ── Firestore 읽기 ──────────────────────────────────────────

function decodeValue(v) {
  if ('nullValue' in v) return null
  if ('booleanValue' in v) return v.booleanValue
  if ('integerValue' in v) return Number(v.integerValue)
  if ('doubleValue' in v) return v.doubleValue
  if ('stringValue' in v) return v.stringValue
  if ('timestampValue' in v) return v.timestampValue
  if ('arrayValue' in v) return (v.arrayValue.values ?? []).map(decodeValue)
  if ('mapValue' in v) return decodeFields(v.mapValue.fields ?? {})
  return null
}

const decodeFields = (fields) =>
  Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, decodeValue(v)]))

async function readViaRest() {
  const base = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/portfolio`
  const docs = []
  let pageToken
  do {
    const res = await fetch(`${base}?pageSize=300${pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ''}`)
    if (!res.ok) throw new Error(`Firestore REST ${res.status}: ${await res.text()}`)
    const body = await res.json()
    for (const d of body.documents ?? []) docs.push({ id: d.name.split('/').pop(), data: decodeFields(d.fields ?? {}) })
    pageToken = body.nextPageToken
  } while (pageToken)
  return docs
}

async function openAdmin() {
  const { initializeApp, applicationDefault } = await import('firebase-admin/app')
  const { getFirestore } = await import('firebase-admin/firestore')
  const app = initializeApp({ credential: applicationDefault(), projectId: PROJECT_ID })
  const db = getFirestore(app)
  const snap = await db.collection('portfolio').get()
  return { db, docs: snap.docs.map((d) => ({ id: d.id, data: d.data() })) }
}

// ── 변경 계획 ───────────────────────────────────────────────

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)

function buildPlan(docs) {
  const bySlug = new Map(docs.map((d) => [d.data.slug, d]))
  const plan = []
  const now = new Date().toISOString()

  for (const { slug, ...fields } of data.upserts) {
    const existing = bySlug.get(slug)
    if (existing) {
      const changed = Object.fromEntries(Object.entries(fields).filter(([k, v]) => !same(existing.data[k], v)))
      if (Object.keys(changed).length > 0) plan.push({ type: 'update', slug, id: existing.id, fields: { ...changed, updated_at: now } })
    } else {
      const doc = { ...DEFAULTS, ...fields, slug, created_at: now, updated_at: now }
      doc.thumbnail ||= doc.images[0] ?? ''
      plan.push({ type: 'create', slug, fields: doc })
    }
  }

  // display_order: order 목록 순서대로, 목록에 없는 기존 문서는 뒤에 기존 순서대로 붙인다
  const allSlugs = new Set([...docs.map((d) => d.data.slug), ...data.upserts.map((u) => u.slug)])
  const unknown = data.order.filter((s) => !allSlugs.has(s))
  if (unknown.length) throw new Error(`order에 존재하지 않는 slug: ${unknown.join(', ')}`)
  const rest = docs
    .filter((d) => !data.order.includes(d.data.slug))
    .sort((a, b) => a.data.display_order - b.data.display_order)
    .map((d) => d.data.slug)
  if (rest.length) console.warn(`⚠ order에 없는 문서는 맨 뒤로 보냅니다: ${rest.join(', ')}`)

  ;[...data.order, ...rest].forEach((slug, i) => {
    const displayOrder = i + 1
    const entry = plan.find((p) => p.slug === slug)
    if (entry) {
      if (entry.type === 'create' || bySlug.get(slug).data.display_order !== displayOrder) {
        entry.fields.display_order = displayOrder
      }
    } else if (bySlug.get(slug).data.display_order !== displayOrder) {
      plan.push({ type: 'update', slug, id: bySlug.get(slug).id, fields: { display_order: displayOrder } })
    }
  })

  return plan
}

function printPlan(plan) {
  if (plan.length === 0) {
    console.log('변경 사항 없음 — Firestore가 이미 최신입니다.')
    return
  }
  for (const p of plan) {
    const keys = Object.keys(p.fields).filter((k) => !['created_at', 'updated_at'].includes(k))
    const title = p.fields.title_ko ? ` "${p.fields.title_ko}"` : ''
    console.log(`${p.type === 'create' ? '+ 생성' : '~ 수정'}  ${p.slug}${title}`)
    if (p.type === 'update') console.log(`         필드: ${keys.join(', ')}`)
  }
  const creates = plan.filter((p) => p.type === 'create').length
  console.log(`\n총 ${plan.length}건 (생성 ${creates}, 수정 ${plan.length - creates})`)
}

// ── 실행 ────────────────────────────────────────────────────

if (!APPLY) {
  const plan = buildPlan(await readViaRest())
  printPlan(plan)
  console.log('\n미리보기입니다. 실제로 반영하려면 --apply 를 붙여 실행하세요.')
} else {
  const { db, docs } = await openAdmin()
  const plan = buildPlan(docs)
  printPlan(plan)
  if (plan.length > 0) {
    const batch = db.batch()
    for (const p of plan) {
      if (p.type === 'create') batch.set(db.collection('portfolio').doc(), p.fields)
      else batch.update(db.collection('portfolio').doc(p.id), p.fields)
    }
    await batch.commit()
    console.log('\n✓ Firestore에 반영했습니다.')
  }
}
