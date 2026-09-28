import { ScrollReveal } from '@/components/animations';
import { Link } from '@/i18n/navigation';

/* ─────────────────────────────────────────────────────────
   AC'SCENT 신뢰 정보 — 인허가 · 실적 · 공개 가격 · 운영 규모
   원본: 등록필증·신고증명 (2026-09 사업 컨텍스트 문서 §5), 2025 이벤트 원장.
   번호나 수치를 바꿀 때는 원본 서류를 먼저 확인한다. 확인결과서 유효기간은 2027-12-05.
   ───────────────────────────────────────────────────────── */

const COPY = {
  ko: {
    eyebrow: "AC'SCENT",
    title: '행사장에서 바로 만들어 건네는 향, 서류까지 갖췄습니다',
    subtitle: '향수·방향제를 현장에서 만들어 나눠 주려면 제품 유형에 맞는 등록·신고가 필요합니다. AC\'SCENT는 이 서류를 갖추고 운영합니다.',
    licensesTitle: '인허가',
    licenses: [
      { name: '화장품책임판매업 등록', id: '제42812호', note: '2024년 · 서울지방식품의약품안전청' },
      { name: '방향제 안전기준 적합확인 신고', id: 'HB24-12-2355', note: '섬유용 · 분무기형 (2024년)' },
      { name: '방향제 안전기준 적합확인 신고', id: 'HB23-12-1949', note: '실내공간용·자동차용 · 함침물형 (2023년)' },
    ],
    factsTitle: '운영 실적과 규모',
    facts: [
      { value: '150건', label: '2025년 생일카페·팬 이벤트 향수 제작' },
      { value: '30종', label: '운영 중인 향료' },
      { value: '2곳', label: "직영 매장 (홍대 AC'SCENT ID · AC'SCENT WOW)" },
      { value: '약 20명', label: '시간당 체험 인원 (조향사 2인 기본 구성)' },
    ],
    priceTitle: '매장 판매가',
    price: "AC'SCENT ID 매장 기준 AI 향수 10ml 24,000원 · 50ml 48,000원. 행사용 수량·구성은 견적으로 안내합니다.",
    guide: '행사 조향 체험 인허가 체크리스트 보기',
  },
  en: {
    eyebrow: "AC'SCENT",
    title: 'Perfume made and handed out on site — with the paperwork in place',
    subtitle: 'Making and giving out perfume or fresheners at an event requires the right registrations for each product type. AC\'SCENT operates with them in place.',
    licensesTitle: 'Licenses',
    licenses: [
      { name: 'Cosmetics distribution business registration', id: 'No. 42812', note: '2024 · Seoul Regional FDA' },
      { name: 'Air freshener safety standard notification', id: 'HB24-12-2355', note: 'Fabric use · spray type (2024)' },
      { name: 'Air freshener safety standard notification', id: 'HB23-12-1949', note: 'Indoor & vehicle use · impregnated type (2023)' },
    ],
    factsTitle: 'Track record and capacity',
    facts: [
      { value: '150', label: 'Birthday-café and fan-event perfume projects in 2025' },
      { value: '30', label: 'Fragrance notes in use' },
      { value: '2', label: "Own stores (AC'SCENT ID · AC'SCENT WOW, Hongdae)" },
      { value: '~20', label: 'Guests per hour (standard 2-perfumer setup)' },
    ],
    priceTitle: 'Store prices',
    price: "At the AC'SCENT ID store: AI perfume 10ml KRW 24,000 · 50ml KRW 48,000. Event quantities and packages are quoted separately.",
    guide: 'Read the event perfume licensing checklist',
  },
} as const;

export function AcscentTrust({ locale }: { locale: string }) {
  const c = COPY[locale === 'en' ? 'en' : 'ko'];
  return (
    <section className="bg-slate-950 py-20 text-white sm:py-28" aria-labelledby="acscent-trust-title">
      <div className="container-wide">
        <ScrollReveal>
          <p className="text-xs font-semibold tracking-[0.2em] text-teal-400">{c.eyebrow}</p>
          <h2 id="acscent-trust-title" className="mt-3 max-w-3xl font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
            {c.title}
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-base">{c.subtitle}</p>
        </ScrollReveal>

        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-2">
          <ScrollReveal delay={0.05}>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">{c.licensesTitle}</h3>
            <ul className="mt-4 space-y-3">
              {c.licenses.map((item) => (
                <li key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-sm text-slate-300">{item.name}</p>
                  <p className="mt-1 font-display text-xl font-bold text-white">{item.id}</p>
                  <p className="mt-1 text-xs text-slate-400">{item.note}</p>
                </li>
              ))}
            </ul>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">{c.factsTitle}</h3>
            <dl className="mt-4 grid grid-cols-2 gap-3">
              {c.facts.map((fact) => (
                <div key={fact.label} className="flex flex-col-reverse rounded-2xl border border-white/10 bg-white/5 p-5">
                  <dt className="mt-1 text-xs leading-relaxed text-slate-400">{fact.label}</dt>
                  <dd className="font-display text-2xl font-extrabold text-teal-300">{fact.value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-6 rounded-2xl border border-white/10 p-5">
              <p className="text-sm font-semibold text-slate-200">{c.priceTitle}</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-400">{c.price}</p>
            </div>
            <Link
              href="/insights/event-perfume-experience-regulation"
              className="mt-6 inline-flex text-sm font-semibold text-teal-300 underline underline-offset-4 hover:text-teal-200"
            >
              {c.guide} →
            </Link>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
