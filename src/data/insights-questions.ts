/* ─────────────────────────────────────────────────────────
   NEANDERco.  |  질문형 안내 (insights 의 kind: 'landing', 2026-11-27)
   행사 담당자가 ChatGPT · 검색창에 묻는 모양 그대로의 질문 — 「예산 300만원으로 무엇을 할 수 있나」,
   「AI 포토부스와 AI 키오스크 중 무엇을 고르나」 — 에 한 페이지로 답한다.
   ChatGPT 방문이 주간 유입의 21~28%(2026-11)이고, 기존 안내는 서비스·행사 종류에서 출발해 예산·비교에서 출발하는 글이 없었다.
   금액은 온라인 견적 카탈로그(src/lib/quote/catalog.ts)에서 계산한다 — tests/unit/insights-questions.test.ts 가
   calculateQuote 결과와 같은지 확인한다. 카탈로그에 없는 수치(처리 인원 · 면적 등)는 넣지 않는다.
   ───────────────────────────────────────────────────────── */

import type { Insight } from './insights';
import { BOOTH_PROGRAMS, KIOSK_PROGRAMS } from './product-lines';
import { COMMON, CUSTOM_DEV, KIOSK, PERFUME, PHOTO_BOOTH } from '@/lib/quote/catalog';

const man = (n: number) => `${(n / 10_000).toLocaleString('ko-KR')}만원`;
const krw = (n: number) => `KRW ${n.toLocaleString('en-US')}`;

/* ── 견적 계산기와 같은 셈 (서울 · 1일 6시간 · VAT 별도) ── */
type Vol = '10ml' | '50ml';
/** AI 향수 — 조향 1팀으로 되는 인원(1일 240명)까지 */
export const perfumeCost = (guests: number, vol: Vol = '10ml') => {
  const tier = PERFUME.tiers.find((t) => guests >= t.min && guests <= t.max) ?? PERFUME.tiers[0];
  return Math.max(PERFUME.minimumCharge, tier.unit[vol] * guests + PERFUME.teamTravel.seoul);
};
export const boothCost = (booths = 1, days = 1) =>
  PHOTO_BOOTH.firstBooth + (booths - 1) * PHOTO_BOOTH.extraBooth + (days - 1) * booths * PHOTO_BOOTH.extraDayPerBooth;
export const kioskCost = (kiosks = 1, days = 1) =>
  KIOSK.firstKiosk + (kiosks - 1) * KIOSK.extraKiosk + (days - 1) * kiosks * KIOSK.extraDayPerKiosk;
export const staffCost = (people = 1, days = 1) => people * days * COMMON.staffPerDay;
const perfumeMaxAtMinimum = Math.floor((PERFUME.minimumCharge - PERFUME.teamTravel.seoul) / PERFUME.tiers[0].unit['10ml']);

/** 예산별 예시 구성 — 테스트가 calculateQuote 와 맞춰 본다 */
export const BUDGET_EXAMPLES = {
  kiosk1: kioskCost(1),
  kiosk1Staff: kioskCost(1) + staffCost(1),
  perfumeMin: perfumeCost(perfumeMaxAtMinimum),
  booth1Staff: boothCost(1) + staffCost(1),
  kiosk2Staff: kioskCost(2) + staffCost(1),
  perfume100: perfumeCost(100),
  boothKioskStaff: boothCost(1) + kioskCost(1) + staffCost(1),
  booth2Staff2: boothCost(2) + staffCost(2),
  perfume100KioskStaff: perfumeCost(100) + kioskCost(1) + staffCost(1),
  perfume200: perfumeCost(200),
  perfume200BoothKioskStaff2: perfumeCost(200) + boothCost(1) + kioskCost(1) + staffCost(2),
  booth3DaysStaff: boothCost(1, 3) + staffCost(1, 3),
  kiosk2x3DaysStaff: kioskCost(2, 3) + staffCost(1, 3),
} as const;
const B = BUDGET_EXAMPLES;

const BOOTH_N = BOOTH_PROGRAMS.length;
const KIOSK_N = KIOSK_PROGRAMS.length;

export const QUESTION_GUIDES: Insight[] = [
  /* ── 예산별로 고르기 ─────────────────────────────────── */
  {
    slug: 'event-ai-experience-by-budget',
    kind: 'landing',
    date: '2026-11-27',
    cover: {
      src: '/images/portfolio/archive/pyeongtaek-ai-festa-2026-01.webp',
      caption: { ko: '평택 AI 페스타 2026 — 체험 부스 앞에 줄 선 방문객', en: 'Pyeongtaek AI Festa 2026 — visitors lining up at the booths' },
    },
    keywords: ['행사 AI 체험 예산', '체험 부스 예산', '행사 예산 300만원', '행사 체험 이벤트 비용', 'AI 체험 부스 가격', '기업 행사 체험 예산', '축제 체험 부스 비용'],
    ko: {
      title: '행사 AI 체험, 예산별로 고르기 — 100만·200만·300만·500만원으로 할 수 있는 구성',
      description: `예산이 먼저 정해진 행사를 위해 금액대별로 할 수 있는 AI 체험 구성을 정리했습니다. AI 키오스크 1대 1일 ${man(KIOSK.firstKiosk)}, AI 향수 만들기 ${man(PERFUME.minimumCharge)}, AI 포토부스 1대 1일 ${man(PHOTO_BOOTH.firstBooth)}부터(VAT 별도, 서울). 모두 온라인 견적과 같은 금액입니다.`,
      blocks: [
        { type: 'p', text: '행사 체험은 예산이 먼저 정해지고 그 안에서 고르는 경우가 많습니다. 아래 금액은 모두 네안데르 온라인 견적 계산기와 같은 값입니다(VAT 별도, 서울, 하루 6시간 운영). 조건을 바꾸면 견적 화면에서 바로 다시 계산됩니다.' },
        { type: 'stats', items: [
          { value: man(KIOSK.firstKiosk), label: 'AI 키오스크 1대 1일부터' },
          { value: man(PERFUME.minimumCharge), label: `AI 향수 만들기 (${perfumeMaxAtMinimum}명까지)` },
          { value: man(PHOTO_BOOTH.firstBooth), label: 'AI 포토부스 1대 1일부터' },
        ] },
        { type: 'h2', text: '100만원 안팎' },
        { type: 'table', head: ['구성', '금액 (VAT 별도)', '어울리는 행사'], rows: [
          ['AI 키오스크 1대 (운영 인력 없이)', man(B.kiosk1), '사내 행사, 작은 팝업, 도서관·학교 행사'],
          ['AI 키오스크 1대 + 운영 인력 1명', man(B.kiosk1Staff), '방문객 안내가 필요한 행사'],
          [`AI 향수 만들기 ${perfumeMaxAtMinimum}명까지 (10ml)`, man(B.perfumeMin), '워크숍, VIP 행사, 소규모 클래스'],
        ] },
        { type: 'p', text: `AI 향수 만들기는 조향사와 조수 2명이 함께 가는 금액이고, ${perfumeMaxAtMinimum}명까지는 최소 금액 ${man(PERFUME.minimumCharge)}이 적용됩니다.` },
        { type: 'h2', text: '200만원 안팎' },
        { type: 'table', head: ['구성', '금액 (VAT 별도)', '어울리는 행사'], rows: [
          ['AI 포토부스 1대 + 운영 인력 1명', man(B.booth1Staff), '축제, 브랜드 팝업, 기업 행사 — 사진을 인화해 가져감'],
          ['AI 키오스크 2대 (서로 다른 체험) + 운영 인력 1명', man(B.kiosk2Staff), '진로·퍼스널 컬러처럼 체험을 두 가지 두고 싶을 때'],
          ['AI 향수 만들기 100명 (10ml)', man(B.perfume100), '기업 행사 답례품, 고객 초청 행사'],
        ] },
        { type: 'h2', text: '300만원 안팎' },
        { type: 'table', head: ['구성', '금액 (VAT 별도)', '어울리는 행사'], rows: [
          ['AI 포토부스 1대 + AI 키오스크 1대 + 운영 인력 1명', man(B.boothKioskStaff), '연말 행사·송년회, 대학 축제 (예: 사주 포토부스 + 손금 키오스크)'],
          ['AI 포토부스 2대 + 운영 인력 2명', man(B.booth2Staff2), '방문객이 많아 줄이 길어지는 축제'],
          ['AI 향수 100명 + AI 키오스크 1대 + 운영 인력 1명', man(B.perfume100KioskStaff), '향수와 가벼운 체험을 함께 두는 기업 행사'],
          ['AI 향수 만들기 200명 (10ml)', man(B.perfume200), '대규모 답례품 행사'],
        ] },
        { type: 'h2', text: '500만원 이상' },
        { type: 'table', head: ['구성', '금액 (VAT 별도)', '어울리는 행사'], rows: [
          ['AI 향수 200명 + AI 포토부스 1대 + AI 키오스크 1대 + 운영 인력 2명', man(B.perfume200BoothKioskStaff2), '체험존을 여러 개 꾸리는 축제·박람회'],
          ['브랜드 전용 AI 기능·콘텐츠 개발', `${man(CUSTOM_DEV.booth.dedicated)}부터 (1회 개발비)`, '브랜드 전용 체험이 필요한 팝업·캠페인'],
        ] },
        { type: 'h2', text: '여러 날 · 오래 운영할 때' },
        { type: 'table', head: ['구성', '금액 (VAT 별도)'], rows: [
          ['AI 포토부스 1대 3일 + 운영 인력 1명', man(B.booth3DaysStaff)],
          ['AI 키오스크 2대 3일 + 운영 인력 1명', man(B.kiosk2x3DaysStaff)],
          ['7일 이상 상시 운영 — AI 포토부스', `대당 월 ${man(PHOTO_BOOTH.monthlyPerBooth)} (인화 월 ${PHOTO_BOOTH.printsPerRoll}장 포함)`],
          ['7일 이상 상시 운영 — AI 키오스크', `대당 월 ${man(KIOSK.monthlyPerKiosk)}`],
        ] },
        { type: 'p', text: '운영일이 7일 이상이고 하루 단위 요금이 상시 운영 요금보다 비싸지면, 온라인 견적이 자동으로 상시 운영 요금으로 바꿔 계산합니다.' },
        { type: 'h2', text: '예산을 넘기기 쉬운 항목' },
        { type: 'ul', items: [
          `VAT 10%: 위 금액은 모두 VAT 별도입니다. 예산이 VAT 포함이면 1.1로 나눈 금액 안에서 고르세요 (예: 330만원 → ${man(3_000_000)}).`,
          `서울 밖 운송비: 행사당 한 번 — 경기·인천 +${man(COMMON.travel.gyeongin)}, 경상 +${man(COMMON.travel.gyeongsang)}. 키오스크만 빌리면 더 낮습니다(경상 +${man(KIOSK.travel.gyeongsang)}). AI 향수는 조향 팀 출장비가 지역별로 다릅니다.`,
          `운영 시간: 하루 기본 ${COMMON.baseHours}시간, 넘으면 기기 1대·인력 1명마다 시간당 ${man(COMMON.extraHourPerDay)}.`,
          `전날 사전 설치: ${man(COMMON.setupDayBefore)} (2인, 행사당 1회).`,
          `브랜드 맞춤: 키오스크 브랜드 적용 ${man(CUSTOM_DEV.kiosk.brand)}, 포토부스 전용 AI 스타일 1종 ${man(CUSTOM_DEV.boothStyle)}.`,
        ] },
        { type: 'h2', text: '예산이 빠듯하면' },
        { type: 'ul', items: [
          `향수는 10ml로 고르면 1인 단가가 50ml의 절반 이하입니다 (100명 이상 10ml ${man(PERFUME.tiers[2].unit['10ml'])} · 50ml ${man(PERFUME.tiers[2].unit['50ml'])}).`,
          `AI 포토부스에는 인화 ${PHOTO_BOOTH.printsPerRoll}장이 기본으로 들어 있어, 한 사람이 1장씩 받으면 ${PHOTO_BOOTH.printsPerRoll}명까지 인화지를 더하지 않아도 됩니다.`,
        ] },
        { type: 'links', items: [
          { text: 'AI 포토부스와 AI 키오스크, 무엇이 다른가', href: '/insights/ai-photo-booth-vs-kiosk' },
          { text: '2026 행사 AI 체험 비용 가이드 — 항목별 가격', href: '/insights/event-ai-experience-cost-guide-2026' },
          { text: '연말행사·송년회 AI 체험 부스', href: '/insights/corporate-year-end-event-ai-booth' },
          { text: '행사 답례품 향수', href: '/insights/event-perfume-gift' },
        ] },
        { type: 'faq', items: [
          { q: '100만원으로 행사 AI 체험을 할 수 있나요?', a: `네. AI 키오스크 1대 1일이 ${man(KIOSK.firstKiosk)}, AI 향수 만들기는 ${perfumeMaxAtMinimum}명까지 ${man(PERFUME.minimumCharge)}입니다(VAT 별도, 서울). 키오스크에 운영 인력 1명을 더하면 ${man(B.kiosk1Staff)}입니다.` },
          { q: '300만원이면 어떤 구성이 되나요?', a: `AI 포토부스 1대 + AI 키오스크 1대 + 운영 인력 1명이 ${man(B.boothKioskStaff)}, AI 포토부스 2대 + 운영 인력 2명이 ${man(B.booth2Staff2)}, AI 향수 100명 + AI 키오스크 1대 + 운영 인력 1명이 ${man(B.perfume100KioskStaff)}입니다(VAT 별도, 서울, 1일).` },
          { q: '금액에 VAT가 들어 있나요?', a: '아니요. 안내한 금액은 모두 VAT 별도이고, 온라인 견적 화면과 가견적서에 VAT를 더한 합계가 함께 나옵니다.' },
          { q: '예산에 맞춰 구성을 바꿔 볼 수 있나요?', a: '온라인 견적에서 기기 수 · 운영일 · 인원 · 지역을 바꾸면 금액이 바로 다시 계산됩니다. 연락처 없이 볼 수 있고, 이름과 이메일만 남기면 결재용 가견적서 PDF도 받을 수 있습니다.' },
        ] },
        { type: 'cta', text: '예산에 맞춰 견적 보기', href: '/quote' },
      ],
    },
    en: {
      title: 'Event AI Experiences by Budget — What KRW 1M, 2M, 3M and 5M Get You',
      description: `AI experience setups by budget, priced exactly like our online estimate: an AI kiosk from ${krw(KIOSK.firstKiosk)} per day, AI perfume making from ${krw(PERFUME.minimumCharge)}, an AI photo booth from ${krw(PHOTO_BOOTH.firstBooth)} per day (excl. VAT, Seoul).`,
      blocks: [
        { type: 'p', text: 'Event budgets usually come first. Every price below matches our online estimate (excl. VAT, Seoul, 6 operating hours a day).' },
        { type: 'h2', text: 'Around KRW 1M' },
        { type: 'table', head: ['Setup', 'Price (excl. VAT)'], rows: [
          ['1 AI kiosk, no staff', krw(B.kiosk1)],
          ['1 AI kiosk + 1 staff', krw(B.kiosk1Staff)],
          [`AI perfume making, up to ${perfumeMaxAtMinimum} guests (10ml)`, krw(B.perfumeMin)],
        ] },
        { type: 'h2', text: 'Around KRW 2M' },
        { type: 'table', head: ['Setup', 'Price (excl. VAT)'], rows: [
          ['1 AI photo booth + 1 staff', krw(B.booth1Staff)],
          ['2 AI kiosks (different programs) + 1 staff', krw(B.kiosk2Staff)],
          ['AI perfume making, 100 guests (10ml)', krw(B.perfume100)],
        ] },
        { type: 'h2', text: 'Around KRW 3M' },
        { type: 'table', head: ['Setup', 'Price (excl. VAT)'], rows: [
          ['1 photo booth + 1 kiosk + 1 staff', krw(B.boothKioskStaff)],
          ['2 photo booths + 2 staff', krw(B.booth2Staff2)],
          ['Perfume for 100 + 1 kiosk + 1 staff', krw(B.perfume100KioskStaff)],
          ['AI perfume making, 200 guests (10ml)', krw(B.perfume200)],
        ] },
        { type: 'h2', text: 'KRW 5M and up' },
        { type: 'table', head: ['Setup', 'Price (excl. VAT)'], rows: [
          ['Perfume for 200 + 1 photo booth + 1 kiosk + 2 staff', krw(B.perfume200BoothKioskStaff2)],
          ['Dedicated AI feature or content for your brand', `from ${krw(CUSTOM_DEV.booth.dedicated)} (one-time)`],
        ] },
        { type: 'h2', text: 'Multi-day and long runs' },
        { type: 'table', head: ['Setup', 'Price (excl. VAT)'], rows: [
          ['1 photo booth for 3 days + 1 staff', krw(B.booth3DaysStaff)],
          ['2 kiosks for 3 days + 1 staff', krw(B.kiosk2x3DaysStaff)],
          ['7+ days — photo booth', `${krw(PHOTO_BOOTH.monthlyPerBooth)} per booth per month (${PHOTO_BOOTH.printsPerRoll} prints a month)`],
          ['7+ days — kiosk', `${krw(KIOSK.monthlyPerKiosk)} per kiosk per month`],
        ] },
        { type: 'p', text: `Outside Seoul a one-time transport fee applies (Gyeongsang +${krw(COMMON.travel.gyeongsang)}); hours beyond ${COMMON.baseHours} cost ${krw(COMMON.extraHourPerDay)} per device or person per hour.` },
        { type: 'cta', text: 'Price your setup', href: '/quote' },
      ],
    },
  },

  /* ── AI 포토부스 vs AI 키오스크 ───────────────────────── */
  {
    slug: 'ai-photo-booth-vs-kiosk',
    kind: 'landing',
    date: '2026-11-27',
    cover: {
      src: '/images/portfolio/archive/eunpyeong-ai-festival-2026-07.webp',
      caption: { ko: '은평 AI 페스티벌 2026 — 나란히 선 AI 체험 부스', en: 'Eunpyeong AI Festival 2026 — AI booths side by side' },
    },
    keywords: ['AI 포토부스 키오스크 차이', 'AI 키오스크 대여', 'AI 포토부스 대여', '행사 키오스크 렌탈', '체험 키오스크', '포토부스 키오스크 비교'],
    ko: {
      title: 'AI 포토부스와 AI 키오스크, 무엇이 다른가 — 행사에 맞는 쪽 고르기',
      description: `AI 포토부스는 사진을 AI가 새로 그려 인화하고, AI 키오스크는 퍼스널 컬러·손금·미래직업 같은 AI 분석 결과를 출력합니다. 1대 1일 ${man(PHOTO_BOOTH.firstBooth)} 대 ${man(KIOSK.firstKiosk)}부터(VAT 별도) — 결과물 · 가격 · 대수 · 맞는 행사를 비교했습니다.`,
      blocks: [
        { type: 'p', text: '둘 다 행사장에 세워 두고 방문객이 직접 해 보는 AI 체험이지만, 남는 것이 다릅니다. 포토부스는 「내 사진」을, 키오스크는 「나에 대한 결과」를 가져갑니다.' },
        { type: 'h2', text: '한 표로 비교' },
        { type: 'table', head: ['', 'AI 포토부스', 'AI 키오스크'], rows: [
          ['하는 일', '찍은 사진을 AI가 행사 테마 속 모습으로 새로 그려 인화', '퍼스널 컬러 · 손금 · 미래직업 같은 AI 분석·추천 결과를 출력'],
          ['가져가는 것', '4×6 인화 사진 + QR로 휴대폰 저장', '내장 영수증 프린터로 뽑은 결과지 (체험에 따라 QR)'],
          ['고를 수 있는 프로그램', `${BOOTH_N}가지 테마`, `${KIOSK_N}가지 체험 (1대에 1가지)`],
          ['1대 1일', `${man(PHOTO_BOOTH.firstBooth)} (인화 ${PHOTO_BOOTH.printsPerRoll}장 · 운송·설치 포함)`, `${man(KIOSK.firstKiosk)} (운반·설치 포함)`],
          ['1대 더', man(PHOTO_BOOTH.extraBooth), man(KIOSK.extraKiosk)],
          ['하루 더 (대당)', man(PHOTO_BOOTH.extraDayPerBooth), man(KIOSK.extraDayPerKiosk)],
          ['최대 대수', `${PHOTO_BOOTH.maxBooths}대`, `${KIOSK.maxKiosks}대`],
          ['7일 이상 상시 운영', `대당 월 ${man(PHOTO_BOOTH.monthlyPerBooth)}`, `대당 월 ${man(KIOSK.monthlyPerKiosk)}`],
          ['경상 지역 운송비', `+${man(COMMON.travel.gyeongsang)}`, `+${man(KIOSK.travel.gyeongsang)} (키오스크만일 때)`],
          ['브랜드 맞춤', `전용 AI 스타일 1종 ${man(CUSTOM_DEV.boothStyle)}`, `로고·색·문구 적용 ${man(CUSTOM_DEV.kiosk.brand)}`],
        ] },
        { type: 'p', text: `운영 인력은 둘 다 별도이고 1인 1일 ${man(COMMON.staffPerDay)}입니다. 금액은 모두 VAT 별도, 서울 기준입니다.` },
        { type: 'h2', text: 'AI 포토부스가 맞는 행사' },
        { type: 'ul', items: [
          '방문객이 「사진」을 들고 가길 바라는 행사 — 축제, 브랜드 팝업, 팬 이벤트, 송년회',
          '행사 테마를 결과물에 담고 싶을 때 — 프레임 1종 기본, 브랜드 전용 AI 스타일 추가 가능',
          '줄 서서 구경하는 재미가 필요한 자리 — 촬영과 인화가 눈앞에서 일어납니다',
        ] },
        { type: 'h2', text: 'AI 키오스크가 맞는 행사' },
        { type: 'ul', items: [
          '예산이 작거나 체험을 여러 가지 두고 싶은 행사 — 대마다 다른 체험을 올릴 수 있습니다',
          '학교 · 도서관 · 진로 박람회처럼 「나를 알아보는」 내용이 맞는 자리 — 미래직업, 퍼스널 컬러',
          '지방 행사 — 키오스크만 빌리면 운송비가 더 낮습니다',
        ] },
        { type: 'h2', text: '함께 두기' },
        { type: 'p', text: `둘을 함께 둘 수도 있습니다. 예를 들어 AI 사주 포토부스와 AI 손금 키오스크를 함께 두면 서울 1일 ${man(PHOTO_BOOTH.firstBooth + KIOSK.firstKiosk)}, 운영 인력 1명을 더하면 ${man(PHOTO_BOOTH.firstBooth + KIOSK.firstKiosk + COMMON.staffPerDay)}입니다(VAT 별도).` },
        { type: 'links', items: [
          { text: 'AI 포토부스 — 테마 · 가격 · 진행 순서', href: '/services/ai-photo-booth' },
          { text: 'AI 키오스크 — 프로그램 · 가격 · 진행 순서', href: '/services/ai-kiosk' },
          { text: '2026 안산사이언스밸리 과학축제 — AI 포토부스, 이틀간 316팀·약 860명', href: '/portfolio/ansan-science-festival-2026' },
          { text: '은평 AI 페스티벌 2026 — AI 퍼스널컬러 · AI 조향사 등 체험 부스 3종', href: '/portfolio/eunpyeong-ai-festival-2026' },
          { text: '평택 AI 페스타 2026 — AI 포토부스 3대와 체험 4종', href: '/portfolio/pyeongtaek-ai-festa-2026' },
          { text: '행사 AI 체험, 예산별로 고르기', href: '/insights/event-ai-experience-by-budget' },
        ] },
        { type: 'faq', items: [
          { q: 'AI 포토부스와 AI 키오스크의 차이는 무엇인가요?', a: 'AI 포토부스는 방문객 사진을 AI가 행사 테마 속 모습으로 새로 그려 4×6으로 인화하고, AI 키오스크는 퍼스널 컬러 · 손금 · 미래직업 같은 AI 분석 결과를 내장 영수증 프린터로 출력합니다.' },
          { q: '어느 쪽이 더 저렴한가요?', a: `AI 키오스크가 1대 1일 ${man(KIOSK.firstKiosk)}, AI 포토부스가 ${man(PHOTO_BOOTH.firstBooth)}부터입니다(VAT 별도, 서울). 키오스크는 1대 더할 때 ${man(KIOSK.extraKiosk)}이라 여러 대를 두기 쉽습니다.` },
          { q: '둘을 함께 빌릴 수 있나요?', a: `네. 포토부스 1대와 키오스크 1대는 서울 1일 ${man(PHOTO_BOOTH.firstBooth + KIOSK.firstKiosk)}(VAT 별도)이고, 운영 인력 1명을 더하면 ${man(PHOTO_BOOTH.firstBooth + KIOSK.firstKiosk + COMMON.staffPerDay)}입니다.` },
          { q: '몇 대까지 둘 수 있나요?', a: `포토부스는 최대 ${PHOTO_BOOTH.maxBooths}대, 키오스크는 최대 ${KIOSK.maxKiosks}대까지 한 행사에 운영합니다.` },
        ] },
        { type: 'cta', text: '포토부스 + 키오스크 견적 보기', href: '/quote?preset=fortune-booth' },
      ],
    },
    en: {
      title: 'AI Photo Booth vs. AI Kiosk — Which One Fits Your Event',
      description: `An AI photo booth redraws each guest photo and prints it; an AI kiosk prints AI analysis results such as personal color, palm reading or career matches. From ${krw(PHOTO_BOOTH.firstBooth)} vs ${krw(KIOSK.firstKiosk)} per unit per day (excl. VAT).`,
      blocks: [
        { type: 'p', text: 'Both are hands-on AI experiences guests try themselves. With a photo booth they take home a photo; with a kiosk they take home a result about themselves.' },
        { type: 'table', head: ['', 'AI photo booth', 'AI kiosk'], rows: [
          ['What it does', 'Redraws the guest photo in your event theme and prints it', 'Prints AI analysis — personal color, palm reading, career'],
          ['Take-home', '4×6 print + QR download', 'Receipt-style printout (QR for some programs)'],
          ['Programs', `${BOOTH_N} themes`, `${KIOSK_N} programs (one per kiosk)`],
          ['1 unit, 1 day', krw(PHOTO_BOOTH.firstBooth), krw(KIOSK.firstKiosk)],
          ['Extra unit', krw(PHOTO_BOOTH.extraBooth), krw(KIOSK.extraKiosk)],
          ['Extra day per unit', krw(PHOTO_BOOTH.extraDayPerBooth), krw(KIOSK.extraDayPerKiosk)],
          ['Max units', String(PHOTO_BOOTH.maxBooths), String(KIOSK.maxKiosks)],
          ['7+ days', `${krw(PHOTO_BOOTH.monthlyPerBooth)} per month`, `${krw(KIOSK.monthlyPerKiosk)} per month`],
        ] },
        { type: 'p', text: `Staff are extra for both (${krw(COMMON.staffPerDay)} per person per day). A booth plus a kiosk is ${krw(PHOTO_BOOTH.firstBooth + KIOSK.firstKiosk)} for a day in Seoul (excl. VAT).` },
        { type: 'links', items: [
          { text: 'AI Photo Booth', href: '/services/ai-photo-booth' },
          { text: 'AI Kiosk', href: '/services/ai-kiosk' },
        ] },
        { type: 'cta', text: 'Price a booth + kiosk', href: '/quote?preset=fortune-booth' },
      ],
    },
  },
];
