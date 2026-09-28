'use client'

import { BarList, BarListCard, type BarListItem } from './BarList'
import { formatNumber, formatPercent, pageName } from './format'
import { QUOTE_STEPS, type Counter, type QuoteStats } from '@/lib/analytics/aggregate'
import { QUOTE_PRESETS } from '@/lib/quote/presets'
import { SERVICE_TEXT, type ServiceKey } from '@/lib/quote/catalog'

/* ─────────────────────────────────────────────────────────
   온라인 견적(/quote) 이용 — 방문(세션) 기준
   단계별로 몇 번의 방문이 어디까지 갔는지, 무엇을 골랐는지, 어디서 들어왔는지
   ───────────────────────────────────────────────────────── */

const STEP_LABELS: Record<(typeof QUOTE_STEPS)[number], { label: string; hint: string }> = {
  visit: { label: '견적 페이지 방문', hint: '/quote 를 연 방문' },
  conditions: { label: '행사 조건', hint: '시나리오를 고르거나 조건 단계로 넘어감' },
  experiences: { label: '체험 담기', hint: '체험 단계로 넘어가거나 상품을 담음' },
  form: { label: '견적서 받기 단계', hint: '연락처 입력 단계까지 옴' },
  pdf: { label: '가견적서 PDF 발급', hint: 'PDF를 내려받음' },
  request: { label: '확정 견적 요청', hint: '담당자에게 요청을 보냄' },
}

const ENTRY_LABELS: Record<string, string> = {
  direct: '직접 (메뉴·링크)',
  item: '상품 카드의 견적에 담기',
  service: '체험 페이지·데모 결과',
  preset: '시나리오 링크',
}

function items(counter: Counter, label: (key: string) => string): BarListItem[] {
  return Object.entries(counter).map(([key, value]) => ({ key, label: label(key), value }))
}

const presetName = (id: string) =>
  id === 'blank' ? '직접 구성' : QUOTE_PRESETS.find((p) => p.id === id)?.title.ko ?? id
const serviceName = (key: string) => SERVICE_TEXT[key as ServiceKey]?.name.ko ?? key

export default function QuoteFunnel({ stats }: { stats: QuoteStats }) {
  const f = stats.funnel
  const base = f.visit

  return (
    <BarListCard title="온라인 견적" description="견적 페이지를 이용한 방문이 어느 단계까지 갔는지 (방문 기준)">
      {base === 0 ? (
        <p className="py-6 text-center text-sm text-gray-400">이 기간에 온라인 견적을 이용한 방문이 없습니다</p>
      ) : (
        <div className="grid gap-8 lg:grid-cols-2">
          {/* 단계별 퍼널 */}
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">단계별 도달</h3>
            <ol className="space-y-3">
              {QUOTE_STEPS.map((step, i) => {
                const value = f[step]
                const prevStep = i === 0 ? null : QUOTE_STEPS[step === 'request' ? 3 : i - 1]
                const prev = prevStep ? f[prevStep] : null
                return (
                  <li key={step}>
                    <div className="flex items-baseline justify-between gap-3 text-sm">
                      <span className="text-gray-800">
                        {STEP_LABELS[step].label}
                        <span className="ml-1.5 text-xs text-gray-400">{STEP_LABELS[step].hint}</span>
                      </span>
                      <span className="shrink-0 tabular-nums">
                        <span className="font-semibold text-gray-900">{formatNumber(value)}</span>
                        <span className="ml-2 text-xs text-gray-500">{formatPercent(base ? value / base : 0)}</span>
                        {prev != null && (
                          <span className="ml-2 text-xs text-gray-400" title="바로 앞 단계 대비">
                            ({formatPercent(prev ? value / prev : 0)})
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 rounded-full bg-gray-100">
                      <div className="h-2 rounded-full bg-[#2a78d6]" style={{ width: `${base ? Math.max(2, (value / base) * 100) : 0}%` }} />
                    </div>
                  </li>
                )
              })}
            </ol>
            <p className="mt-3 text-xs text-gray-400">
              퍼센트는 견적 페이지 방문 대비, 괄호는 바로 앞 단계 대비입니다. PDF 발급과 확정 요청은 모두 &apos;견적서 받기 단계&apos; 대비로 봅니다.
            </p>
          </div>

          {/* 무엇을 골랐는지 · 어디서 왔는지 */}
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">들어온 경로</h3>
            <BarList items={items(stats.entries, (k) => ENTRY_LABELS[k] ?? k)} total={base} unit="방문" limit={4} />
            <h3 className="mb-3 mt-6 text-xs font-semibold uppercase tracking-wide text-gray-400">담은 상품</h3>
            <BarList items={items(stats.items, serviceName)} total={base} unit="방문" limit={6} emptyText="담은 상품 기록 없음" />
            <h3 className="mb-3 mt-6 text-xs font-semibold uppercase tracking-wide text-gray-400">고른 시나리오</h3>
            <BarList items={items(stats.presets, presetName)} total={base} unit="방문" limit={5} emptyText="고른 시나리오 없음" />
            <h3 className="mb-3 mt-6 text-xs font-semibold uppercase tracking-wide text-gray-400">견적 직전에 보던 페이지</h3>
            <BarList items={items(stats.from, (p) => (p === '(첫 페이지)' ? '견적 페이지로 바로 들어옴' : pageName(p)))} total={base} unit="방문" limit={5} />
          </div>
        </div>
      )}
    </BarListCard>
  )
}
