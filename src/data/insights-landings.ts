/* ─────────────────────────────────────────────────────────
   NEANDERco.  |  구매 의도 검색어용 랜딩 (insights 의 kind: 'landing')
   행사 담당자가 실제로 찾는 말(포토부스 대여, 사주 키오스크 대여, 향수 만들기 체험 출장,
   연말행사·송년회, 축제 체험 부스)마다 한 페이지씩 둔다 — 2026-11 검색·AI 노출 조사와
   2026-11-14 네이버 키워드 도구 검색량 기준.
   금액은 모두 온라인 견적 카탈로그(src/lib/quote/catalog.ts)에서 계산해 견적과 어긋나지 않게 하고,
   사례는 공개 포트폴리오에 있는 것만 쓴다. 카탈로그에 없는 수치는 넣지 않는다.
   ───────────────────────────────────────────────────────── */

import type { Insight, InsightImage } from './insights';
import { COMMON, CUSTOM_DEV, KIOSK, PERFUME, PHOTO_BOOTH } from '@/lib/quote/catalog';

const man = (n: number) => `${(n / 10_000).toLocaleString('ko-KR')}만원`;
const krw = (n: number) => `KRW ${n.toLocaleString('en-US')}`;
const pct = (r: number) => `${Math.round(r * 100)}%`;

const travelRowsKo = (t: Record<string, number>, unit = '') => [
  ['서울', t.seoul ? `${man(t.seoul)}${unit}` : '추가 없음'],
  ['경기·인천', `+${man(t.gyeongin)}${unit}`],
  ['충청·강원 영서 (대전·세종·청주·춘천 등)', `+${man(t.central)}${unit}`],
  ['전라·강원 영동 (광주·전주·강릉 등)', `+${man(t.jeolla)}${unit}`],
  ['경상 (부산·대구·울산·창원 등)', `+${man(t.gyeongsang)}${unit}`],
];
const travelRowsEn = (t: Record<string, number>, unit = '') => [
  ['Seoul', t.seoul ? `${krw(t.seoul)}${unit}` : 'No extra charge'],
  ['Gyeonggi / Incheon', `+${krw(t.gyeongin)}${unit}`],
  ['Chungcheong / West Gangwon (Daejeon, Sejong, Cheongju…)', `+${krw(t.central)}${unit}`],
  ['Jeolla / East Gangwon (Gwangju, Jeonju, Gangneung…)', `+${krw(t.jeolla)}${unit}`],
  ['Gyeongsang (Busan, Daegu, Ulsan, Changwon…)', `+${krw(t.gyeongsang)}${unit}`],
];

const STAFF_KO = `현장 운영 인력은 1인 1일 ${man(COMMON.staffPerDay)}이고, 1일 기본 운영은 ${COMMON.baseHours}시간입니다 (초과 시 기기 1대·인력 1명마다 시간당 ${man(COMMON.extraHourPerDay)}). 전날 사전 설치는 ${man(COMMON.setupDayBefore)}입니다.`;
const STAFF_EN = `On-site staff are ${krw(COMMON.staffPerDay)} per person per day; a day covers ${COMMON.baseHours} hours (extra hours ${krw(COMMON.extraHourPerDay)} per device or person). Setup the day before is ${krw(COMMON.setupDayBefore)}.`;
const POWER_KO = '220V 콘센트와 인터넷이 필요합니다. 클라우드 AI로 분석·생성하기 때문입니다.';
const POWER_EN = 'A 220V outlet and an internet connection are required, because the analysis and generation run on cloud AI.';
const NO_ISLANDS_KO = '제주 및 도서 지역은 운영하지 않습니다.';
const NO_ISLANDS_EN = 'We do not operate on Jeju or other islands.';

/* 본문 사진 — 실제 운영 사진은 공개 포트폴리오에 올라간 것만 쓴다(public/images/portfolio).
   실제 사진이 없는 장면만 AI 연출 이미지(public/images/insights/staged-*, 2026-11-21 Seedream 5.5로 생성)를 쓰고,
   화면에는 따로 표시하지 않는다(2026-11-21 사용자 결정). 캡션에 실제 행사 이름을 붙이지 않는다. */
type Pic = { ko: InsightImage; en: InsightImage };
const pic = (src: string, ko: string, en: string, staged = false): Pic => ({
  ko: { src, alt: ko, caption: ko, staged },
  en: { src, alt: en, caption: en, staged },
});
const coverOf = (p: Pic) => ({ src: p.ko.src, staged: p.ko.staged, caption: { ko: p.ko.caption ?? '', en: p.en.caption ?? '' } });
const AR = '/images/portfolio/archive/';
const PF = '/images/portfolio/';
const ST = '/images/insights/staged-';
const PIC = {
  ptBlend: pic(`${AR}pyeongtaek-ai-festa-2026-06.webp`, '평택 AI 페스타 2026 — 조향 테이블에서 향을 고르는 방문객', 'Pyeongtaek AI Festa 2026 — guests choosing scents at the blending table'),
  ptBooth: pic(`${AR}pyeongtaek-ai-festa-2026-10.webp`, '평택 AI 페스타 2026 — AI 조향사 부스', 'Pyeongtaek AI Festa 2026 — AI perfumer booth'),
  jcPhone: pic(`${AR}jecheon-music-film-festival-08.webp`, '휴대폰으로 받는 AI 향 분석 결과 — 제천국제음악영화제 2025', "AI scent analysis on a guest's phone — JIMFF 2025"),
  jcScale: pic(`${AR}jecheon-music-film-festival-04.webp`, '추천 받은 향료를 계량해 섞습니다 — 제천국제음악영화제 2025', 'Weighing and blending the recommended oils — JIMFF 2025'),
  jcBlend: pic(`${AR}jecheon-music-film-festival-03.webp`, '조향 테이블에서 향을 섞는 방문객 — 제천국제음악영화제 2025', 'A guest blending at the perfumer table — JIMFF 2025'),
  jcBooth: pic(`${AR}jecheon-music-film-festival-01.webp`, '제천국제음악영화제 2025 — AI 조향사 부스', 'JIMFF 2025 — AI perfumer booth'),
  jimffKiosk: pic(`${AR}jimff-2026-ost-fair-03.webp`, 'AI 향 추천 키오스크 2대와 시향 테이블 — 제천국제음악영화제 2026', 'Two AI scent kiosks and a tasting table — JIMFF 2026'),
  jimffBooth: pic(`${AR}jimff-2026-ost-fair-01.webp`, '제천국제음악영화제 2026 — OST페어 AI 조향 부스', 'JIMFF 2026 — AI perfume booth at the OST Fair'),
  jimffMake: pic(`${AR}jimff-2026-ost-fair-02.webp`, '현장에서 향수를 만드는 방문객 — 제천국제음악영화제 2026', 'Guests making perfume on site — JIMFF 2026'),
  jimffDone: pic(`${AR}jimff-2026-ost-fair-06.webp`, '완성한 향수를 들고 — 제천국제음악영화제 2026', 'Guests with the perfume they made — JIMFF 2026'),
  epPerf: pic(`${AR}eunpyeong-ai-festival-2026-01.webp`, '은평 AI 페스티벌 2026 — AI 조향사 부스 (맞춤 향수 100인분)', 'Eunpyeong AI Festival 2026 — AI perfumer booth (100 custom perfumes)'),
  epKiosk: pic(`${AR}eunpyeong-ai-festival-2026-02.webp`, '은평 AI 페스티벌 2026 — 키오스크로 받는 AI 향 분석', 'Eunpyeong AI Festival 2026 — AI scent analysis at the kiosk'),
  epColor: pic(`${AR}eunpyeong-ai-festival-2026-04.webp`, '은평 AI 페스티벌 2026 — AI 퍼스널컬러 진단 부스', 'Eunpyeong AI Festival 2026 — AI personal color booth'),
  epHall: pic(`${AR}eunpyeong-ai-festival-2026-07.webp`, '은평 AI 페스티벌 2026 — 나란히 선 AI 체험 부스', 'Eunpyeong AI Festival 2026 — AI booths side by side'),
  kgs2: pic(`${PF}korea-grand-sale-2026-2.webp`, '코리아그랜드세일 2026 (서울 북촌) — AI 맞춤 향수 체험', 'Korea Grand Sale 2026 (Bukchon, Seoul) — AI custom perfume'),
  kgs3: pic(`${PF}korea-grand-sale-2026-3.webp`, '시향용 향료 선반 — 코리아그랜드세일 2026', 'Scent shelf for tasting — Korea Grand Sale 2026'),
  tvw1: pic(`${PF}tourism-venture-week-2025-1.webp`, '관광벤처 이음주간 2025 — 맞춤형 향수 조향 체험', 'Tourism Venture Week 2025 — custom perfume blending'),
  pack: pic(`${AR}acscent-packaging-design-01.webp`, "AC'SCENT 쇼핑백·패키지 — 포장 디자인 예시", "AC'SCENT bag and box — packaging example"),
  store: pic(`${AR}acscent-id-01.webp`, "직영 AI 맞춤 조향 매장 AC'SCENT ID (서울 마포)", "AC'SCENT ID, our AI custom perfume store in Mapo, Seoul"),
  swfShelf: pic(`${AR}seoul-writers-festival-17.webp`, '서울국제작가축제 — 참가 도서마다 만든 향수와 시향지', 'Seoul International Writers’ Festival — a perfume made for each book'),
  swfBook: pic(`${AR}seoul-writers-festival-10.webp`, '책 한 권에 향 하나 — 서울국제작가축제 북퍼퓸', 'One scent per book — book perfumes at the Writers’ Festival'),
  swfVisit: pic(`${AR}seoul-writers-festival-13.webp`, '시향지를 들고 책과 향을 고르는 관람객 — 서울국제작가축제', 'Visitors choosing books and scents — Writers’ Festival'),
  swfSmell: pic(`${AR}seoul-writers-festival-16.webp`, '책 향을 시향하는 관람객 — 서울국제작가축제', 'A visitor smelling a book perfume — Writers’ Festival'),
  jbnu: pic(`${AR}jbnu-major-fair-2026-01.webp`, '전북대 전공탐색 박람회 — AI 퍼스널컬러·캐리커처·미래직업 웹 체험', 'Jeonbuk National University major fair — AI personal color, caricature and career'),
  jbnuRow: pic(`${AR}jbnu-major-fair-2026-03.webp`, '여러 대를 나란히 둔 체험존 — 전북대 전공탐색 박람회', 'A row of stations — Jeonbuk National University major fair'),
  ansan: pic(`${AR}ansan-science-festival-2026-01.webp`, '안산 과학축제 2026 — 가족 타임캡슐 AI 포토부스 (이틀 316팀)', 'Ansan Science Festival 2026 — family time-capsule AI photo booth (316 groups in 2 days)'),
  jongno: pic(`${PF}jongno-open-book-maru-2026-3.webp`, '종로 열린 책마루 — 야외도서관의 독서 취향·향 체험', 'Jongno Open Book Maru — reading taste and scent in an outdoor library'),
  ptPhoto: pic(`${AR}pyeongtaek-ai-festa-2026-09.webp`, '평택 AI 페스타 2026 — AI 포토부스', 'Pyeongtaek AI Festa 2026 — AI photo booths'),
  ptCrowd: pic(`${AR}pyeongtaek-ai-festa-2026-01.webp`, '평택 AI 페스타 2026 — 체험 부스 앞에 줄 선 방문객', 'Pyeongtaek AI Festa 2026 — visitors lining up at the booths'),
  fortune: pic('/images/services/experiences/ai-fortune-robot.webp', 'AI 사주 포토부스 체험', 'AI saju photo booth'),
  epson: pic(`${AR}epson-oneday-class-2025-01.webp`, '한국엡손 원데이클래스 — 기업 행사 AI 향수 만들기', 'Epson Korea one-day class — AI perfume making at a corporate event'),
  giftHero: pic(`${ST}gift-hero.webp`, '행사 답례품 향수를 준비한 모습', 'Perfume gifts set out for guests', true),
  giftHand: pic(`${ST}gift-handover.webp`, '조향사가 참석자에게 향수를 건네는 모습', 'A perfumer handing a perfume gift to a guest', true),
  // 행사 답례품 「받아 가기까지」 4단계 — 같은 송년회 한 장면처럼 이어지게 만든 연출 컷 (output/gift-steps-2026-11-21)
  giftStepQr: pic(`${ST}gift-step-qr.webp`, '연회장 조향 코너에서 휴대폰으로 취향 분석을 하는 참석자', 'A guest taking the taste analysis on a phone at the ballroom perfume corner', true),
  giftStepBlend: pic(`${ST}gift-step-blend.webp`, '조향사가 참석자 앞에서 10ml 향수를 계량해 만드는 모습', 'A perfumer measuring a 10 ml perfume in front of the guest', true),
  giftStepWrap: pic(`${ST}gift-step-wrap.webp`, '완성한 향수를 결과 카드와 함께 선물 상자에 담는 모습', 'Packing the finished perfume into a gift box with its result card', true),
  giftStepGive: pic(`${ST}gift-step-give.webp`, '조향사가 참석자에게 선물 상자를 건네는 모습', 'A perfumer handing the gift box to a guest', true),
  // 키오스크를 실제 매장 키오스크 모양으로 다시 만든 판 (output/brand-collab-kiosk-2026-11-21)
  brandExpo: pic(`${ST}brand-collab-v2.webp`, '브랜드 부스 안에 차린 향 콜라보 코너 — AI 향 키오스크와 시향대', 'A scent collaboration corner inside a brand booth — AI scent kiosks and a tasting counter', true),
  colorResult: pic(`${ST}color-result-k.webp`, '퍼스널 컬러 결과 화면 — 어울리는 색 팔레트', 'Personal color result — the palette that suits you', true),
  colorSchool: pic(`${ST}color-school-k.webp`, '학교 축제에서 결과를 함께 보는 학생들', 'Students checking results together at a school festival', true),
  colorLight: pic(`${ST}color-light-k.webp`, '주광색 조명 아래 설치한 진단 부스', 'A booth set up under daylight-balanced lighting', true),
  schoolLib: pic(`${ST}school-library-k.webp`, '학교도서관 행사에 AI 키오스크를 둔 모습', 'AI kiosks at a school library event', true),
};
const GIFT150 = PERFUME.tiers[2].unit['10ml'] * 150 + PERFUME.teamTravel.seoul + PERFUME.premiumPackaging['10ml'] * 150;

export const LANDINGS: Insight[] = [
  /* ── AI 포토부스 대여 ─────────────────────────────────── */
  {
    slug: 'ai-photo-booth-rental',
    kind: 'landing',
    cover: coverOf(PIC.ptPhoto),
    // 2026-11-14 네이버 키워드 도구: 「포토부스 대여」 월 3,820회·「포토부스 렌탈」 920회인데 「AI 포토부스 대여」는 50회라,
    // 제목·설명을 포토부스 대여 전체로 넓히고 일반 포토부스와의 차이를 보여 준다. 주소는 검색엔진에 제출한 그대로 둔다.
    date: '2026-11-14',
    keywords: ['포토부스 대여', '포토부스 렌탈', '포토부스 가격', '행사 포토부스', 'AI 포토부스', 'AI 포토부스 대여', '네컷 사진 부스 대여', '축제 포토부스', '기업행사 포토부스', '포토부스 출장'],
    ko: {
      title: '포토부스 대여·렌탈 — AI 포토부스 행사·축제·기업 행사 전국 출장',
      description: `행사·축제·기업 행사용 포토부스 대여. 찍은 사진을 AI가 아이돌 컨셉·패션 화보·미래 모습으로 새로 그려 바로 인화합니다. 1대 1일 ${man(PHOTO_BOOTH.firstBooth)}부터(VAT 별도, 운송·설치·인화 ${PHOTO_BOOTH.printsPerRoll}장 포함), 전국 출장.`,
      blocks: [
        { type: 'p', text: '포토부스는 방문객이 사진을 찍고 인화해 가져가는, 행사에서 가장 익숙한 이벤트입니다. 네안데르의 AI 포토부스는 여기서 한 단계 더 나아가, 찍은 사진을 AI가 아이돌 컨셉·패션 화보·10년 뒤 모습 같은 새 이미지로 바꿔 그 자리에서 인화합니다. 브랜드 팝업, 지역 축제, 과학축제, 기업 행사, 대학 행사에서 운영합니다.' },
        { type: 'h2', text: '일반 포토부스와 AI 포토부스' },
        { type: 'table', head: ['', '일반 포토부스', '네안데르 AI 포토부스'], rows: [
          ['결과물', '찍은 사진에 프레임을 씌워 인화', '찍은 사진을 AI가 고른 컨셉으로 새로 그려 인화'],
          ['방문객이 고르는 것', '포즈·프레임', `AI 스타일 (기본 ${PHOTO_BOOTH.includedStyles}종, 추가 가능)`],
          ['가져가는 것', '즉석 인화 사진', '즉석 인화 사진 + QR로 휴대폰에 저장'],
          ['행사 맞춤', '프레임 디자인', `프레임 1종 기본 포함 + 행사 전용 AI 스타일(1종 ${man(CUSTOM_DEV.boothStyle)})`],
        ] },
        { type: 'p', text: '네 컷 띠지로도 인화할 수 있습니다. 2026 안산사이언스밸리 과학축제에서는 가족사진 한 장으로 지금 모습과 10년·20년·30년 뒤 모습을 네 컷으로 만들어 인화했고, 이틀 동안 316팀(약 860명)이 참여했습니다.' },
        { type: 'links', items: [
          { text: 'AI 아이돌 메이크업 포토부스 — 아이돌 메이크업 변신', href: '/services/ai-idol-makeup-booth' },
          { text: 'AI 패션 타임머신 — 시대별 패션 화보', href: '/services/ai-fashion-timemachine' },
          { text: 'AI 미래 가족 상상 — AI가 그려 주는 미래 가족', href: '/services/ai-future-family' },
        ] },
        { type: 'h2', text: '대여 가격 (VAT 별도, 서울 기준)' },
        { type: 'table', head: ['항목', '금액'], rows: [
          ['AI 포토부스 1대 · 1일', `${man(PHOTO_BOOTH.firstBooth)} (AI 스타일 ${PHOTO_BOOTH.includedStyles}종·즉석 인화 ${PHOTO_BOOTH.printsPerRoll}장·프레임 1종·운송·설치 포함)`],
          [`부스 추가 (최대 ${PHOTO_BOOTH.maxBooths}대)`, `대당 ${man(PHOTO_BOOTH.extraBooth)}`],
          ['운영일 추가', `대당 1일 ${man(PHOTO_BOOTH.extraDayPerBooth)}`],
          ['AI 스타일 추가', `1종 ${man(PHOTO_BOOTH.extraStyle)}`],
          [`인화 추가 (1롤 ${PHOTO_BOOTH.printsPerRoll}장)`, `1롤 ${man(PHOTO_BOOTH.extraPrintRoll)}`],
          ['부스 랩핑', `대당 ${man(PHOTO_BOOTH.wrapping)}`],
          ['현장 운영 인력', `1인 1일 ${man(COMMON.staffPerDay)}`],
        ] },
        { type: 'p', text: `예: 서울 1일 행사에 포토부스 1대와 운영 인력 1명이면 ${man(PHOTO_BOOTH.firstBooth + COMMON.staffPerDay)}(VAT 별도)입니다. 온라인 견적에서 조건을 바꿔 가며 바로 계산할 수 있습니다.` },
        { type: 'h2', text: '기본 견적에 포함 / 별도' },
        { type: 'ul', items: [
          `포함: 부스 1대, AI 스타일 ${PHOTO_BOOTH.includedStyles}종, 즉석 인화 ${PHOTO_BOOTH.printsPerRoll}장, 프레임 디자인 1종, 서울 운송·설치`,
          `별도: 운영 인력, 기본 ${COMMON.baseHours}시간 초과 운영, 전날 사전 설치, 서울 밖 운송비, 브랜드 전용 스타일·화면 커스텀`,
        ] },
        { type: 'h2', text: '브랜드 맞춤 (1회 개발비)' },
        { type: 'table', head: ['범위', '금액', '확정 시점'], rows: [
          ['브랜드 전용 AI 스타일', `1종 ${man(CUSTOM_DEV.boothStyle)}`, `행사 ${CUSTOM_DEV.leadDays.style}일 전`],
          ['촬영 흐름·화면 커스텀', man(CUSTOM_DEV.booth.flow), `행사 ${CUSTOM_DEV.leadDays.flow}일 전`],
          ['전용 AI 기능 개발', `${man(CUSTOM_DEV.booth.dedicated)}부터`, `행사 ${CUSTOM_DEV.leadDays.dedicated}일 전`],
        ] },
        { type: 'p', text: `확정 시점보다 촉박하면 긴급 제작으로 ${pct(CUSTOM_DEV.rushRate)}가 더해집니다.` },
        { type: 'h2', text: '전국 출장 — 지역별 운송비 (행사당 1회)' },
        { type: 'table', head: ['지역', '추가 운송비'], rows: travelRowsKo(COMMON.travel) },
        { type: 'p', text: NO_ISLANDS_KO },
        { type: 'h2', text: '운영 사례' },
        { type: 'links', items: [
          { text: '2026 안산사이언스밸리 과학축제 (한양대 ERICA) — AI 포토부스 〈미래로 가는 타임캡슐〉, 이틀간 316팀·약 860명', href: '/portfolio/ansan-science-festival-2026' },
          { text: '2026 소원성취페스타 (금천 오미생태공원) — 한복을 입힌 AI 사주 포토부스, 결과 카드 출력', href: '/portfolio/sowon-festa-saju-photobooth-2026' },
          { text: 'K-WAVE DANCE FESTIVAL 2026 (서울 이태원) — AI 포토부스·AI 조향사 2개 부스, 4개 언어 운영', href: '/portfolio/kwave-dance-festival-2026' },
          { text: '평택 AI 페스타 2026 (평택아트센터) — AI 포토부스·미래 가족 상상 등 체험 4종', href: '/portfolio/pyeongtaek-ai-festa-2026' },
        ] },
        { type: 'faq', items: [
          { q: '포토부스 대여 비용은 얼마인가요?', a: `AI 포토부스는 1대 1일 ${man(PHOTO_BOOTH.firstBooth)}부터입니다(VAT 별도). AI 스타일 ${PHOTO_BOOTH.includedStyles}종, 즉석 인화 ${PHOTO_BOOTH.printsPerRoll}장, 프레임 1종, 서울 운송·설치가 들어 있고 운영 인력은 1인 1일 ${man(COMMON.staffPerDay)}로 따로 받습니다.` },
          { q: '일반 포토부스와 무엇이 다른가요?', a: '일반 포토부스는 찍은 사진에 프레임을 씌워 인화하고, AI 포토부스는 AI가 사진을 아이돌 컨셉·패션 화보·미래 모습처럼 새 이미지로 그려 인화합니다. 결과가 사람마다 달라 행사 기념품으로 남기기 좋고, QR로 휴대폰에도 저장할 수 있습니다.' },
          { q: '방문객이 많으면 인화지가 모자라지 않나요?', a: `기본으로 인화 ${PHOTO_BOOTH.printsPerRoll}장(1롤)이 들어 있고, ${PHOTO_BOOTH.printsPerRoll}장 1롤씩 ${man(PHOTO_BOOTH.extraPrintRoll)}에 더할 수 있습니다. 부스는 최대 ${PHOTO_BOOTH.maxBooths}대까지 늘릴 수 있습니다.` },
          { q: '몇 대까지 빌릴 수 있나요?', a: `보유한 부스가 ${PHOTO_BOOTH.maxBooths}대라 한 행사에 최대 ${PHOTO_BOOTH.maxBooths}대까지 운영합니다. 연말처럼 행사가 몰리는 시기에는 일찍 일정을 확정해 주세요.` },
          { q: '지방 행사도 되나요?', a: `네, 전국 출장합니다. 지역에 따라 운송비가 행사당 한 번 더해집니다(부산·대구 등 경상 +${man(COMMON.travel.gyeongsang)}). ${NO_ISLANDS_KO}` },
          { q: '우리 브랜드에 맞게 바꿀 수 있나요?', a: `프레임 1종은 기본으로 맞춰 드리고, 브랜드 전용 AI 스타일은 1종 ${man(CUSTOM_DEV.boothStyle)}(행사 ${CUSTOM_DEV.leadDays.style}일 전 확정), 촬영 흐름·화면 커스텀은 ${man(CUSTOM_DEV.booth.flow)}(${CUSTOM_DEV.leadDays.flow}일 전 확정)입니다.` },
          { q: '설치 장소에 무엇이 필요한가요?', a: POWER_KO },
          { q: '견적서는 어떻게 받나요?', a: '온라인 견적에서 행사 조건을 고르면 연락처 없이 금액을 바로 볼 수 있고, 내부 결재용 가견적서 PDF도 받을 수 있습니다.' },
        ] },
        { type: 'cta', text: '포토부스 견적 바로 보기', href: '/quote?item=photoBooth' },
      ],
    },
    en: {
      title: 'Photo Booth Rental in Korea — AI Photo Booths for Events, Festivals and Corporate Parties',
      description: `Photo booth rental for events, festivals and corporate parties: AI redraws each photo as an idol concept, fashion editorial or future look and prints it on the spot. From ${krw(PHOTO_BOOTH.firstBooth)} per booth per day (excl. VAT, delivery, setup and ${PHOTO_BOOTH.printsPerRoll} prints included), anywhere in mainland Korea.`,
      blocks: [
        { type: 'p', text: 'Guests take a photo, AI redraws it in the chosen concept, and the booth prints it right away. Brands, festivals, corporate events and campuses use it as a crowd-drawing experience.' },
        { type: 'h2', text: 'A regular photo booth vs. the AI photo booth' },
        { type: 'table', head: ['', 'Regular photo booth', 'NEANDER AI photo booth'], rows: [
          ['Result', 'Your photo with a frame', 'Your photo redrawn by AI in a chosen concept'],
          ['Guests choose', 'Pose and frame', `AI style (${PHOTO_BOOTH.includedStyles} included, more available)`],
          ['Take-home', 'Instant print', 'Instant print + QR download'],
        ] },
        { type: 'p', text: 'Four-frame photo strips are possible too: at the Ansan Science Valley Science Festival 2026, families got today and 10, 20 and 30 years later in four frames, and 316 groups (about 860 people) took part over two days.' },
        { type: 'links', items: [
          { text: 'AI Idol Makeup Photo Booth', href: '/services/ai-idol-makeup-booth' },
          { text: 'AI Fashion Time Machine', href: '/services/ai-fashion-timemachine' },
          { text: 'AI Future Family', href: '/services/ai-future-family' },
        ] },
        { type: 'h2', text: 'Rental prices (excl. VAT, Seoul)' },
        { type: 'table', head: ['Item', 'Price'], rows: [
          ['1 AI photo booth · 1 day', `${krw(PHOTO_BOOTH.firstBooth)} (${PHOTO_BOOTH.includedStyles} AI styles, ${PHOTO_BOOTH.printsPerRoll} prints, 1 frame, delivery and setup)`],
          [`Extra booth (up to ${PHOTO_BOOTH.maxBooths})`, `${krw(PHOTO_BOOTH.extraBooth)} each`],
          ['Extra day', `${krw(PHOTO_BOOTH.extraDayPerBooth)} per booth`],
          ['Extra AI style', krw(PHOTO_BOOTH.extraStyle)],
          [`Extra prints (${PHOTO_BOOTH.printsPerRoll} per roll)`, `${krw(PHOTO_BOOTH.extraPrintRoll)} per roll`],
          ['Booth wrapping', `${krw(PHOTO_BOOTH.wrapping)} per booth`],
          ['On-site staff', `${krw(COMMON.staffPerDay)} per person per day`],
        ] },
        { type: 'h2', text: 'Travel within Korea (once per event)' },
        { type: 'table', head: ['Region', 'Extra'], rows: travelRowsEn(COMMON.travel) },
        { type: 'p', text: `${NO_ISLANDS_EN} ${POWER_EN}` },
        { type: 'h2', text: 'Recent work' },
        { type: 'links', items: [
          { text: 'Ansan Science Valley Science Festival 2026 — AI photo booth "Time Capsule to the Future", 316 groups in two days', href: '/portfolio/ansan-science-festival-2026' },
          { text: 'Sowon Seongchwi Festa 2026 — AI saju photo booth dressed in hanbok', href: '/portfolio/sowon-festa-saju-photobooth-2026' },
          { text: 'K-WAVE DANCE FESTIVAL 2026 (Itaewon, Seoul) — AI photo booth and AI perfumer, in four languages', href: '/portfolio/kwave-dance-festival-2026' },
          { text: 'Pyeongtaek AI Festa 2026 — four AI experiences including the photo booth', href: '/portfolio/pyeongtaek-ai-festa-2026' },
        ] },
        { type: 'cta', text: 'Get an instant estimate', href: '/quote?item=photoBooth' },
      ],
    },
  },

  /* ── AI 향수 만들기 체험 (기존 주소 유지) ─────────────────── */
  {
    slug: 'event-ai-perfume-experience',
    kind: 'landing',
    date: '2026-11-20',
    cover: coverOf(PIC.ptBlend),
    keywords: ['AI 향수 만들기 체험', 'AI 향수 체험 부스', '향수 만들기 체험 출장', '조향 클래스 출장', '기업 조향 클래스', '행사 조향 체험', "AC'SCENT"],
    ko: {
      title: 'AI 향수 만들기 체험 부스 — 행사·기업·팝업 조향사 출장',
      description: `AI가 방문객의 취향을 분석해 향을 추천하고, 출장 온 조향사가 그 자리에서 향수를 만들어 건넵니다. ${man(PERFUME.minimumCharge)}부터(VAT 별도), 1인 ${man(PERFUME.tiers[2].unit['10ml'])}~${man(PERFUME.tiers[0].unit['10ml'])}(10ml), 전국 출장.`,
      blocks: [
        { type: 'p', text: "AI 조향사는 AI가 방문객의 취향과 이미지를 분석해 향을 추천하고, 조향사가 현장에서 그 향으로 향수를 만들어 드리는 체험입니다. 방문객은 자신만의 향수를 기념품으로 가져갑니다. 축제·팝업·기업 행사·원데이 클래스로 운영합니다." },
        { type: 'stats', items: [
          { value: man(PERFUME.tiers[2].unit['10ml']), label: '1인 단가 (10ml · 100명 이상)' },
          { value: `시간당 ${PERFUME.guestsPerTeamHour}명`, label: '조향 1팀이 맡는 인원' },
          { value: `${PERFUME.minGuests}명부터`, label: `서울 최소 ${man(PERFUME.minimumCharge)}` },
          { value: '10ml', label: '방문객이 가져가는 내 향수' },
        ] },
        { type: 'h2', text: '체험은 이렇게 진행됩니다' },
        { type: 'steps', items: [
          { title: '취향 분석', text: '방문객이 휴대폰으로 QR을 찍어 몇 가지 질문에 답하거나 사진을 올립니다. 분석용 키오스크를 둘 수도 있습니다.', image: PIC.jcPhone.ko },
          { title: 'AI 향 추천', text: 'AI가 분석 결과에 맞는 향 조합을 추천하고, 방문객은 추천 받은 향을 시향합니다.', image: PIC.jimffKiosk.ko },
          { title: '조향사와 블렌딩', text: '조향사가 옆에서 도와 추천 향료를 계량해 섞습니다.', image: PIC.jcScale.ko },
          { title: '내 향수 완성', text: '10ml 향수와 결과 카드를 기념품으로 가져갑니다.', image: PIC.jimffDone.ko },
        ] },
        { type: 'h2', text: '가격 (VAT 별도)' },
        { type: 'table', head: ['항목', '금액'], rows: [
          ['1인 단가 10ml', `${PERFUME.tiers.map((t) => man(t.unit['10ml'])).join(' / ')} (20~49명 / 50~99명 / 100명 이상)`],
          ['1인 단가 50ml', PERFUME.tiers.map((t) => man(t.unit['50ml'])).join(' / ')],
          ['조향 1팀 출장비 (조향사 1 + 조수 1)', `운영일마다 서울 ${man(PERFUME.teamTravel.seoul)} (지역별 아래 표)`],
          ['최소 금액', `${man(PERFUME.minimumCharge)} (서울 · 10ml 32명까지)`],
          ['분석용 AI 키오스크 (선택)', `${man(PERFUME.analysisKiosk)}, 운영일 추가 ${man(PERFUME.analysisKioskExtraDay)} — 고르지 않으면 방문객 휴대폰(QR)으로 분석`],
          ['브랜드 전용 향 개발', man(PERFUME.customScent)],
          ['고급 선물 포장', `병당 ${man(PERFUME.premiumPackaging['10ml'])}(10ml) · ${man(PERFUME.premiumPackaging['50ml'])}(50ml)`],
          ['전용 디자인 단박스', `${PERFUME.customBox.minGuests}명 이상, ${man(PERFUME.customBox.minimum)}부터`],
        ] },
        { type: 'p', text: `예: 서울 1일 행사에 100명이 10ml 향수를 만들면 ${man(PERFUME.tiers[2].unit['10ml'] * 100 + PERFUME.teamTravel.seoul)}(1인 ${man(PERFUME.tiers[2].unit['10ml'])} × 100명 + 조향 1팀 출장비, VAT 별도)입니다.` },
        { type: 'h2', text: '지역별 조향 팀 출장비 (팀·운영일마다)' },
        { type: 'table', head: ['지역', '1팀 출장비'], rows: [
          ['서울', man(PERFUME.teamTravel.seoul)],
          ['경기·인천', man(PERFUME.teamTravel.gyeongin)],
          ['충청·강원 영서', man(PERFUME.teamTravel.central)],
          ['전라(광주 포함)·강원 영동', man(PERFUME.teamTravel.jeolla)],
          ['경상(부산·대구 포함)', man(PERFUME.teamTravel.gyeongsang)],
        ] },
        { type: 'p', text: `조향 1팀(조향사 1명 + 보조 1명)이 시간당 최대 ${PERFUME.guestsPerTeamHour}명을 맡습니다. 인원과 운영 시간에 맞춰 팀 수를 정하고, ${PERFUME.standardTeams}팀을 넘으면 상담으로 운영 계획을 정합니다. ${NO_ISLANDS_KO}` },
        { type: 'h2', text: '등록·신고' },
        { type: 'ul', items: [
          '화장품책임판매업 등록 제42812호 (2024-01-24, 서울지방식품의약품안전청)',
          '생활화학제품 안전기준 적합확인 신고 HB24-12-2355 (일반용·섬유용, 분무기형, 2024-12)',
          '생활화학제품 안전기준 적합확인 신고 HB23-12-1949 (실내공간용·자동차용, 함침물형, 2023-12)',
          '향료 30종 운영',
        ] },
        { type: 'h2', text: '어떻게 쓰나요 — 체험 부스 · 답례품 · 브랜드 향' },
        { type: 'table', head: ['방식', '이럴 때', '자세히'], rows: [
          ['체험 부스', '축제·팝업에서 방문객이 직접 향수를 만들어 가져갑니다', '이 페이지'],
          ['행사 답례품', '기업 행사·송년회 참석자 전원에게 맞춤 향수를 나눠 줍니다 (150명 고급 포장 기준 1인 약 2만원)', '행사 답례품 맞춤 향수'],
          ['브랜드 향 + 키오스크', '전시·박람회 부스에서 방문객에게 맞는 브랜드 향을 찾아 줍니다', '브랜드 향 개발 + AI 향수 키오스크'],
        ] },
        { type: 'links', items: [
          { text: '행사 답례품 맞춤 향수 — 참석자마다 AI가 고른 향수 10ml', href: '/insights/event-perfume-gift' },
          { text: '브랜드 향 개발 + AI 향수 키오스크 — 전시·박람회 부스', href: '/insights/brand-scent-kiosk' },
        ] },
        { type: 'h2', text: '운영 사례' },
        { type: 'gallery', images: [PIC.epPerf.ko, PIC.jimffBooth.ko, PIC.kgs2.ko, PIC.tvw1.ko, PIC.ptBooth.ko, PIC.jcBooth.ko] },
        { type: 'links', items: [
          { text: '은평구진로직업체험지원센터 AI 페스티벌 2026 — 맞춤 향수 100인분', href: '/portfolio/eunpyeong-ai-festival-2026' },
          { text: '제천국제음악영화제 2026 — OST페어 체험 프로그램', href: '/portfolio/jimff-2026-ost-fair' },
          { text: '종로문화재단 종로 열린 책마루 — 독서 취향과 향 체험', href: '/portfolio/jongno-open-book-maru-2026' },
          { text: '한국관광공사 — AI 조향 클래스 프로그램·교안', href: '/portfolio/kto-ai-perfume-class-2026' },
          { text: '한국엡손 원데이클래스 — AI로 만드는 나만의 향수', href: '/portfolio/epson-oneday-class-2025' },
          { text: '코리아그랜드세일 (서울 북촌) — AI 맞춤 향수 체험', href: '/portfolio/korea-grand-sale-2026' },
          { text: 'K-WAVE DANCE FESTIVAL 2026 — 사주 오행으로 향을 처방하는 AI 조향사', href: '/portfolio/kwave-dance-festival-2026' },
          { text: '남산골한옥마을 〈취향〉 — 조향 체험', href: '/portfolio/namsangol-hanok-chwihyang-2025' },
          { text: '서울국제작가축제 — AI 북퍼퓸 전시', href: '/portfolio/seoul-writers-festival' },
        ] },
        { type: 'faq', items: [
          { q: '몇 명부터 할 수 있나요?', a: `${PERFUME.minGuests}명부터 운영합니다. 서울 기준 최소 금액은 ${man(PERFUME.minimumCharge)}이고, 10ml 기준 32명까지는 이 금액이 적용됩니다.` },
          { q: '시간당 몇 명까지 체험할 수 있나요?', a: `조향 1팀(조향사 1명 + 보조 1명)이 시간당 최대 ${PERFUME.guestsPerTeamHour}명입니다. 예상 인원과 운영 시간을 알려 주시면 필요한 팀 수를 맞춰 드리고, 온라인 견적에서도 자동으로 계산됩니다.` },
          { q: '행사에서 향수를 나눠 줘도 괜찮나요?', a: '네안데르는 화장품책임판매업 등록과 생활화학제품 안전기준 적합확인 신고를 마쳤습니다. 자세한 인허가 내용은 「행사에서 향수를 나눠 주려면」 글에 정리해 두었습니다.' },
          { q: '키오스크가 꼭 있어야 하나요?', a: `아니요. 기본은 방문객이 휴대폰으로 QR을 찍어 AI 분석을 받는 방식입니다. 현장에 분석용 키오스크를 두려면 대당 ${man(PERFUME.analysisKiosk)}이 더해집니다.` },
          { q: '우리 브랜드만의 향을 만들 수 있나요?', a: `브랜드 전용 향 개발은 ${man(PERFUME.customScent)}입니다. ${PERFUME.customBox.minGuests}명 이상이면 전용 디자인 단박스도 ${man(PERFUME.customBox.minimum)}부터 만들 수 있습니다.` },
          { q: '지방 행사도 되나요?', a: `네, 조향 팀이 출장합니다. 출장비는 팀·운영일마다 서울 ${man(PERFUME.teamTravel.seoul)}, 경상 ${man(PERFUME.teamTravel.gyeongsang)} 등 지역별로 다릅니다. ${NO_ISLANDS_KO}` },
        ] },
        { type: 'cta', text: 'AI 조향사 견적 바로 보기', href: '/quote?item=acscent' },
      ],
    },
    en: {
      title: 'AI Perfume-Making Experience for Events — On-site Perfumers in Korea',
      description: `AI reads each guest's taste and recommends a scent; a visiting perfumer blends it into a perfume on the spot. From ${krw(PERFUME.minimumCharge)} (excl. VAT), ${krw(PERFUME.tiers[2].unit['10ml'])}–${krw(PERFUME.tiers[0].unit['10ml'])} per 10 ml guest.`,
      blocks: [
        { type: 'p', text: "The AI perfume experience uses AI to analyze a guest's taste and image and recommend a scent, which a perfumer then blends on site. Guests take home their own perfume." },
        { type: 'stats', items: [
          { value: krw(PERFUME.tiers[2].unit['10ml']), label: 'Per guest (10 ml, 100+ guests)' },
          { value: `${PERFUME.guestsPerTeamHour} / hour`, label: 'Guests per perfumer team' },
          { value: `${PERFUME.minGuests}+ guests`, label: `Minimum ${krw(PERFUME.minimumCharge)} in Seoul` },
          { value: '10 ml', label: 'Perfume each guest takes home' },
        ] },
        { type: 'h2', text: 'How it works' },
        { type: 'steps', items: [
          { title: 'Taste analysis', text: 'Guests scan a QR code and answer a few questions or upload a photo. An analysis kiosk is optional.', image: PIC.jcPhone.en },
          { title: 'AI recommendation', text: 'AI recommends a scent combination and guests smell the suggested notes.', image: PIC.jimffKiosk.en },
          { title: 'Blending with a perfumer', text: 'A perfumer helps each guest weigh and blend the oils.', image: PIC.jcScale.en },
          { title: 'Their own perfume', text: 'Guests take home a 10 ml perfume and a result card.', image: PIC.jimffDone.en },
        ] },
        { type: 'h2', text: 'Prices (excl. VAT)' },
        { type: 'table', head: ['Item', 'Price'], rows: [
          ['Per guest, 10 ml', `${PERFUME.tiers.map((t) => krw(t.unit['10ml'])).join(' / ')} (20–49 / 50–99 / 100+ guests)`],
          ['Per guest, 50 ml', PERFUME.tiers.map((t) => krw(t.unit['50ml'])).join(' / ')],
          ['Perfumer team travel (perfumer + assistant)', `${krw(PERFUME.teamTravel.seoul)} per team per day in Seoul`],
          ['Minimum', `${krw(PERFUME.minimumCharge)} (Seoul, up to 32 guests at 10 ml)`],
          ['Capacity', `Up to ${PERFUME.guestsPerTeamHour} guests per hour per team (perfumer + assistant)`],
          ['Analysis kiosk (optional)', `${krw(PERFUME.analysisKiosk)}; otherwise guests use their phones via QR`],
          ['Signature scent for your brand', krw(PERFUME.customScent)],
        ] },
        { type: 'h2', text: 'Registrations and reports' },
        { type: 'ul', items: [
          'Cosmetics Distributor registration No. 42812 (2024-01-24)',
          'Household chemical product safety-standard conformity reports HB24-12-2355 and HB23-12-1949',
          '30 fragrance ingredients in operation',
        ] },
        { type: 'h2', text: 'Recent work' },
        { type: 'gallery', images: [PIC.epPerf.en, PIC.jimffBooth.en, PIC.kgs2.en, PIC.tvw1.en, PIC.ptBooth.en, PIC.jcBooth.en] },
        { type: 'links', items: [
          { text: 'Jecheon International Music & Film Festival 2026 — OST Fair program', href: '/portfolio/jimff-2026-ost-fair' },
          { text: 'Korea Tourism Organization — AI perfume class program', href: '/portfolio/kto-ai-perfume-class-2026' },
          { text: 'Epson Korea — AI perfume one-day class', href: '/portfolio/epson-oneday-class-2025' },
          { text: 'K-WAVE DANCE FESTIVAL 2026 — AI perfumer booth', href: '/portfolio/kwave-dance-festival-2026' },
        ] },
        { type: 'p', text: NO_ISLANDS_EN },
        { type: 'cta', text: 'Get an instant estimate', href: '/quote' },
      ],
    },
  },

  /* ── AI 사주·관상·손금 체험 대여 ───────────────────────────
     2026-11-26 사주 · 관상이 포토부스 프로그램으로 옮겨져(포트폴리오 B-02 · B-03) 기기별로 나눠 안내한다.
     주소(ai-fortune-kiosk-rental)는 검색 유입 때문에 그대로 둔다. */
  {
    slug: 'ai-fortune-kiosk-rental',
    kind: 'landing',
    cover: coverOf(PIC.fortune),
    date: '2026-11-11',
    keywords: ['사주 키오스크 대여', 'AI 사주 포토부스', 'AI 사주 키오스크', 'AI 관상 체험 부스', 'AI 손금', '운세 키오스크 렌탈', '행사 사주 이벤트', '축제 사주 부스'],
    ko: {
      title: 'AI 사주·관상·손금 체험 대여 — 포토부스·키오스크',
      description: `AI 사주·관상은 AI 포토부스로 촬영해 풀이를 담은 사진을 인화하고(1대 1일 ${man(PHOTO_BOOTH.firstBooth)}부터), AI 손금은 키오스크로 영수증형 결과지를 출력합니다(1대 1일 ${man(KIOSK.firstKiosk)}부터). VAT 별도, 운반·설치 포함, 전국 출장.`,
      blocks: [
        { type: 'p', text: '운세 체험은 기기에 따라 두 가지로 운영합니다. AI 사주·관상은 AI 포토부스에서 생년월일을 넣거나 얼굴을 찍으면 AI가 풀이를 만들어 4×6 사진으로 인화하고 QR로도 보내 드립니다. AI 손금·커플 케미는 키오스크에서 손바닥이나 두 사람을 비추면 내장 프린터로 영수증형 결과지를 출력합니다. 사람이 몰리는 축제, 송년회, 기업 행사, 대학 축제에서 가볍게 줄을 세우는 체험입니다.' },
        { type: 'links', items: [
          { text: 'AI 사주 (AI 포토부스) — 생년월일로 보는 사주 풀이', href: '/services/ai-fortune-robot' },
          { text: 'AI 관상 분석 (AI 포토부스) — 얼굴로 보는 재미있는 관상 풀이', href: '/services/ai-face-reading' },
          { text: 'AI 손금 로봇 (AI 키오스크) — 손바닥 속 운명 읽기', href: '/services/ai-palm-reading' },
          { text: 'AI 커플 케미 진단 (AI 키오스크) — 두 사람의 궁합', href: '/services/ai-couple-chemistry' },
        ] },
        { type: 'h2', text: '대여 가격 (VAT 별도, 서울 기준)' },
        { type: 'table', head: ['항목', '금액'], rows: [
          ['AI 포토부스 1대 · 1일 (사주·관상)', `${man(PHOTO_BOOTH.firstBooth)} (AI 스타일 ${PHOTO_BOOTH.includedStyles}종·4×6 인화·QR·운반·설치 포함)`],
          [`포토부스 추가 (최대 ${PHOTO_BOOTH.maxBooths}대)`, `대당 ${man(PHOTO_BOOTH.extraBooth)}`],
          ['AI 키오스크 1대 · 1일 (손금·커플 케미)', `${man(KIOSK.firstKiosk)} (기존 체험 1종·카메라·영수증형 프린터 내장·운반·설치 포함)`],
          [`키오스크 추가 (최대 ${KIOSK.maxKiosks}대)`, `대당 ${man(KIOSK.extraKiosk)}`],
          ['운영일 추가', `포토부스 대당 1일 ${man(PHOTO_BOOTH.extraDayPerBooth)} · 키오스크 대당 1일 ${man(KIOSK.extraDayPerKiosk)}`],
          ['현장 운영 인력', `1인 1일 ${man(COMMON.staffPerDay)}`],
        ] },
        { type: 'p', text: `예: 서울 1일 행사에 AI 사주 포토부스 1대와 AI 손금 키오스크 1대면 ${man(PHOTO_BOOTH.firstBooth + KIOSK.firstKiosk)}, 운영 인력 1명을 더하면 ${man(PHOTO_BOOTH.firstBooth + KIOSK.firstKiosk + COMMON.staffPerDay)}입니다(VAT 별도).` },
        { type: 'p', text: '로고·색·문구를 행사에 맞추는 브랜드 맞춤과 지역별 운송비는 기기마다 다릅니다. 아래 가격 안내에서 확인해 주세요.' },
        { type: 'links', items: [
          { text: 'AI 포토부스 가격·조건 보기', href: '/services/ai-photo-booth#pricing' },
          { text: 'AI 키오스크 가격·조건 보기', href: '/services/ai-kiosk#pricing' },
        ] },
        { type: 'p', text: NO_ISLANDS_KO },
        { type: 'h2', text: '운영 사례' },
        { type: 'links', items: [
          { text: '2026 소원성취페스타 (금천 오미생태공원) — 한복을 입힌 AI 사주 포토부스', href: '/portfolio/sowon-festa-saju-photobooth-2026' },
          { text: '평택 AI 페스타 2026 (평택아트센터) — 방문객이 직접 조작하는 AI 체험 4종', href: '/portfolio/pyeongtaek-ai-festa-2026' },
        ] },
        { type: 'faq', items: [
          { q: 'AI 사주 체험 대여 비용은 얼마인가요?', a: `AI 사주·관상은 AI 포토부스로 1대 1일 ${man(PHOTO_BOOTH.firstBooth)}부터, AI 손금·커플 케미는 AI 키오스크로 1대 1일 ${man(KIOSK.firstKiosk)}부터입니다(VAT 별도, 운반·설치 포함). 운영 인력은 1인 1일 ${man(COMMON.staffPerDay)}로 따로 받습니다.` },
          { q: '결과는 어떻게 받나요?', a: '사주·관상은 풀이를 담은 4×6 사진으로 인화하고 QR로 휴대폰에도 보내 드립니다. 손금·커플 케미는 키오스크에 내장된 영수증형 프린터로 결과지를 출력합니다. 인화·출력 비용은 기본 가격에 포함돼 있습니다.' },
          { q: '여러 대를 놓을 수 있나요?', a: `한 행사에 포토부스는 최대 ${PHOTO_BOOTH.maxBooths}대, 키오스크는 최대 ${KIOSK.maxKiosks}대까지 운영합니다. 사주 포토부스 옆에 손금 키오스크를 두는 식으로 섞어 놓을 수 있습니다.` },
          { q: '매장에 계속 둘 수 있나요?', a: `키오스크는 상시 운영이 가능합니다(대당 월 ${man(KIOSK.monthlyPerKiosk)}). 포토부스 상시 운영은 상담해 주세요.` },
          { q: '설치 장소에 무엇이 필요한가요?', a: POWER_KO },
        ] },
        { type: 'cta', text: 'AI 사주·손금 체험 견적 바로 보기', href: '/quote' },
      ],
    },
    en: {
      title: 'AI Fortune-Telling Rental (Saju, Face Reading, Palm Reading) for Events in Korea',
      description: `AI saju and face reading run on an AI photo booth that prints the reading as a 4×6 photo (from ${krw(PHOTO_BOOTH.firstBooth)} per booth per day); AI palm reading runs on a kiosk that prints a receipt-style result (from ${krw(KIOSK.firstKiosk)} per kiosk per day). Excl. VAT, delivery and setup included.`,
      blocks: [
        { type: 'p', text: 'Fortune experiences run on two devices. AI saju (Korean four-pillars fortune reading from a birth date) and AI face reading run on the AI photo booth: guests enter a birth date or have their face photographed, and the reading is printed as a 4×6 photo and sent by QR. AI palm reading and couple chemistry run on a kiosk with a built-in receipt printer.' },
        { type: 'links', items: [
          { text: 'AI Saju (AI photo booth)', href: '/services/ai-fortune-robot' },
          { text: 'AI Face Reading (AI photo booth)', href: '/services/ai-face-reading' },
          { text: 'AI Palm Reading (AI kiosk)', href: '/services/ai-palm-reading' },
          { text: 'AI Couple Chemistry (AI kiosk)', href: '/services/ai-couple-chemistry' },
        ] },
        { type: 'h2', text: 'Rental prices (excl. VAT, Seoul)' },
        { type: 'table', head: ['Item', 'Price'], rows: [
          ['1 AI photo booth · 1 day (saju, face reading)', `${krw(PHOTO_BOOTH.firstBooth)} (${PHOTO_BOOTH.includedStyles} AI styles, 4×6 prints, QR, delivery and setup)`],
          [`Extra photo booth (up to ${PHOTO_BOOTH.maxBooths})`, `${krw(PHOTO_BOOTH.extraBooth)} each`],
          ['1 AI kiosk · 1 day (palm reading, couple chemistry)', `${krw(KIOSK.firstKiosk)} (one existing experience, camera, built-in receipt printer, delivery and setup)`],
          [`Extra kiosk (up to ${KIOSK.maxKiosks})`, `${krw(KIOSK.extraKiosk)} each`],
          ['On-site staff', `${krw(COMMON.staffPerDay)} per person per day`],
        ] },
        { type: 'p', text: 'Branding options and regional delivery fees differ by device; see the photo booth and kiosk pricing pages.' },
        { type: 'links', items: [
          { text: 'AI photo booth pricing', href: '/services/ai-photo-booth#pricing' },
          { text: 'AI kiosk pricing', href: '/services/ai-kiosk#pricing' },
        ] },
        { type: 'p', text: `${NO_ISLANDS_EN} ${POWER_EN}` },
        { type: 'cta', text: 'Get an instant estimate', href: '/quote' },
      ],
    },
  },

  /* ── 기업 행사·송년회 체험 부스 ─────────────────────────── */
  {
    slug: 'corporate-year-end-event-ai-booth',
    kind: 'landing',
    cover: coverOf(PIC.epson),
    // 2026-11-14 네이버 키워드 도구: 크리스마스행사 월 2,540회·연말행사 1,340회·기업행사 890회·송년회 이벤트 560회·창립기념행사 1,130회.
    // 송년회만 다루던 제목을 연말·크리스마스·시무식·창립기념까지 넓힌다. 주소는 검색엔진에 제출한 그대로 둔다.
    date: '2026-11-14',
    keywords: ['연말행사', '연말 이벤트', '송년회 이벤트', '크리스마스 행사', '크리스마스 이벤트 부스', '기업행사 이벤트', '시무식 이벤트', '신년회 이벤트', '창립기념행사', '사내 행사 이벤트', '기업 행사 포토부스'],
    ko: {
      title: '연말행사·송년회·크리스마스 행사 이벤트 — AI 체험 부스 출장 운영',
      description: `송년회·연말행사·크리스마스 행사·시무식·창립기념행사에서 참석자가 직접 해 보고 결과물을 가져가는 AI 체험. AI 포토부스(사주·관상 포함), AI 키오스크, AI 향수 만들기를 장비와 운영 인력까지 함께 보내 드립니다. ${man(KIOSK.firstKiosk)}부터(VAT 별도).`,
      blocks: [
        { type: 'p', text: '연말 행사는 짧은 시간에 많은 사람이 지나가고, 참석자가 무언가를 들고 돌아가야 기억에 남습니다. 네안데르의 AI 체험은 모두 결과물(사진, 운세 풀이, 향수)을 그 자리에서 건네는 방식이라 송년회·크리스마스 파티의 대기 시간과 쉬는 시간을 채우기 좋습니다.' },
        { type: 'h2', text: '연말·연초 행사별 추천 구성' },
        { type: 'table', head: ['행사', '추천 체험', '이유'], rows: [
          ['송년회·사내 파티', 'AI 포토부스 + AI 사주 포토부스', '연말 프레임을 씌운 단체 사진과 새해 운세를 담은 사진을 인화해 가져갑니다'],
          ['크리스마스 행사·고객 초청', 'AI 포토부스 (크리스마스 프레임)', '기본 포함된 프레임 1종을 크리스마스 디자인으로 맞춥니다. 크리스마스 컨셉 AI 스타일도 새로 만들 수 있습니다'],
          ['시상식·VIP 초청', 'AI 향수 만들기 + 고급 선물 포장', '참석자마다 다른 향수를 기념품으로 건넵니다'],
          ['시무식·신년회', 'AI 사주 포토부스', '생년월일로 새해 운세를 풀어 4×6 사진으로 인화합니다'],
          ['창립기념행사', '회사 맞춤 포토부스·키오스크', '로고·색·결과 문구를 회사에 맞게 바꿉니다'],
          ['워크숍·팀 빌딩', 'AI 향수 원데이 클래스', 'AI 추천 향을 시향하고 직접 조향하는 클래스로 진행합니다'],
        ] },
        { type: 'h2', text: '시작가 (VAT 별도, 서울 1일 기준)' },
        { type: 'table', head: ['체험', '시작가'], rows: [
          ['AI 손금·커플 케미 키오스크', `1대 ${man(KIOSK.firstKiosk)} (추가 1대 ${man(KIOSK.extraKiosk)})`],
          ['AI 포토부스', `1대 ${man(PHOTO_BOOTH.firstBooth)} (인화 ${PHOTO_BOOTH.printsPerRoll}장 포함)`],
          ['AI 향수 만들기', `${man(PERFUME.minimumCharge)}부터 (100명이면 10ml 1인 ${man(PERFUME.tiers[2].unit['10ml'])} + 조향 팀 출장비)`],
          ['현장 운영 인력', `1인 1일 ${man(COMMON.staffPerDay)}`],
        ] },
        { type: 'p', text: `예: 송년회에 AI 사주 포토부스 1대와 AI 손금 키오스크 1대를 두고 운영 인력 1명을 쓰면 ${man(PHOTO_BOOTH.firstBooth + KIOSK.firstKiosk + COMMON.staffPerDay)}(VAT 별도)입니다. ${STAFF_KO}` },
        { type: 'h2', text: '준비 기간' },
        { type: 'ul', items: [
          '기존 체험을 그대로 쓰면 일정과 장비만 맞으면 진행할 수 있습니다.',
          `로고·색만 바꾸는 브랜드 적용은 행사 ${CUSTOM_DEV.leadDays.brand}일 전, 질문·결과 문구 커스텀은 ${CUSTOM_DEV.leadDays.content}일 전, 전용 체험은 ${CUSTOM_DEV.leadDays.dedicated}일 전까지 확정해 주세요.`,
          `보유 장비가 포토부스 ${PHOTO_BOOTH.maxBooths}대, 키오스크 ${KIOSK.maxKiosks}대라 행사가 몰리는 연말에는 일찍 일정을 잡는 것이 좋습니다.`,
        ] },
        { type: 'h2', text: '기업·기관 행사 사례' },
        { type: 'links', items: [
          { text: '한국엡손 원데이클래스 — AI로 만드는 나만의 향수', href: '/portfolio/epson-oneday-class-2025' },
          { text: '한국관광공사 — AI 조향 클래스 프로그램·교안', href: '/portfolio/kto-ai-perfume-class-2026' },
          { text: '휴리즈 HUREASE — 브랜드 런칭 공간·운영', href: '/portfolio/hurease-launch-2025' },
          { text: '평택 AI 페스타 2026 — 체험 콘텐츠 4종 기획·현장 운영', href: '/portfolio/pyeongtaek-ai-festa-2026' },
        ] },
        { type: 'faq', items: [
          { q: '크리스마스 분위기로 꾸밀 수 있나요?', a: `포토부스 프레임 1종은 기본으로 행사에 맞춰 디자인합니다. 크리스마스·연말 컨셉 AI 스타일을 새로 만들려면 1종 ${man(CUSTOM_DEV.boothStyle)}이고 행사 ${CUSTOM_DEV.leadDays.style}일 전까지 확정해 주세요. 부스 외관 랩핑은 대당 ${man(PHOTO_BOOTH.wrapping)}입니다.` },
          { q: '12월 송년회 일정은 언제까지 잡아야 하나요?', a: `보유 장비가 포토부스 ${PHOTO_BOOTH.maxBooths}대, 키오스크 ${KIOSK.maxKiosks}대라 12월 같은 성수기에는 장비가 먼저 마감될 수 있습니다. 기존 체험을 그대로 쓰면 일정과 장비만 맞으면 되고, 로고·색 적용은 ${CUSTOM_DEV.leadDays.brand}일 전, 전용 AI 스타일은 ${CUSTOM_DEV.leadDays.style}일 전까지 확정하면 됩니다.` },
          { q: '호텔 연회장이나 사내 강당에서도 되나요?', a: `네. ${POWER_KO} 부스 크기와 동선은 장소 도면을 보고 함께 정합니다.` },
          { q: '참석자가 많으면 어떻게 하나요?', a: `포토부스는 최대 ${PHOTO_BOOTH.maxBooths}대, 키오스크는 최대 ${KIOSK.maxKiosks}대까지 늘리고, 향수 체험은 조향 팀을 늘립니다. 예상 인원을 알려 주시면 대수를 맞춰 드립니다.` },
          { q: '지방 사업장 행사도 되나요?', a: `네, 전국 출장합니다. 지역별 운송비가 행사당 한 번 더해집니다. ${NO_ISLANDS_KO}` },
          { q: '내부 결재용 견적서가 필요해요.', a: '온라인 견적에서 조건을 고르면 연락처 없이 금액을 바로 보고 가견적서 PDF를 받을 수 있습니다. 확정 견적은 상담 후 보내 드립니다.' },
        ] },
        { type: 'cta', text: '연말행사·송년회 견적 바로 보기', href: '/quote' },
      ],
    },
    en: {
      title: 'Year-End Party, Christmas and Corporate Event Experiences in Korea — AI Booths',
      description: `AI photo booths (including saju and face reading), AI kiosks and AI perfume making for year-end parties, Christmas events, new-year kickoffs, anniversaries and company events, delivered with equipment and staff. From ${krw(KIOSK.firstKiosk)} (excl. VAT).`,
      blocks: [
        { type: 'p', text: 'Every NEANDER experience hands guests something to take home — a photo, a reading or a perfume — which makes it a good fit for the gaps in a corporate program.' },
        { type: 'h2', text: 'Starting prices (excl. VAT, Seoul, 1 day)' },
        { type: 'table', head: ['Experience', 'From'], rows: [
          ['AI kiosk (palm reading, couple chemistry…)', `${krw(KIOSK.firstKiosk)} per kiosk`],
          ['AI photo booth', `${krw(PHOTO_BOOTH.firstBooth)} per booth (${PHOTO_BOOTH.printsPerRoll} prints)`],
          ['AI perfume making', `${krw(PERFUME.minimumCharge)} minimum`],
          ['On-site staff', `${krw(COMMON.staffPerDay)} per person per day`],
        ] },
        { type: 'p', text: `${STAFF_EN} ${NO_ISLANDS_EN}` },
        { type: 'cta', text: 'Get an instant estimate', href: '/quote' },
      ],
    },
  },

  /* ── 축제 체험 부스 ─────────────────────────────────────── */
  // 2026-11-14 네이버 키워드 도구: 축제부스 월 820회·체험부스 540회·행사부스 340회·축제 체험 부스 170회.
  // 사례는 공개 포트폴리오의 축제·페스타·영화제 사례만, 숫자는 각 사례의 결과 문구에 있는 것만 쓴다.
  {
    slug: 'festival-experience-booth',
    kind: 'landing',
    cover: coverOf(PIC.ptCrowd),
    date: '2026-11-14',
    keywords: ['축제 체험 부스', '축제부스', '체험부스', '행사부스', '축제 부스 운영', '지역축제 체험 프로그램', '대학 축제 부스', '과학축제 체험', '축제 포토부스', 'AI 체험 부스'],
    ko: {
      title: '축제 체험 부스 운영 — 지역축제·과학축제·대학 축제 AI 체험 부스 출장',
      description: `지역축제·과학축제·대학 축제·영화제에 AI 포토부스(사주·관상 포함), AI 키오스크, AI 향수 만들기 체험 부스를 장비와 운영 인력까지 함께 보내 드립니다. 키오스크 1대 1일 ${man(KIOSK.firstKiosk)}부터(VAT 별도), 전국 출장.`,
      blocks: [
        { type: 'p', text: '축제 체험 부스는 지나가던 방문객이 짧게 참여하고, 무언가를 들고 돌아가야 기억에 남습니다. 네안데르의 AI 체험은 사진·운세 풀이·향수처럼 결과물을 그 자리에서 건네는 방식이라 가족 방문객과 학생이 많은 축제에서 많이 운영합니다. 2026 안산사이언스밸리 과학축제의 AI 포토부스에는 이틀 동안 316팀(약 860명)이 참여했습니다.' },
        { type: 'h2', text: '축제에서 운영하는 AI 체험 부스' },
        { type: 'table', head: ['체험', '방문객이 하는 것 → 가져가는 것', '시작가 (VAT 별도, 1일)'], rows: [
          ['AI 포토부스', '사진을 찍고 AI 컨셉을 고릅니다 → 즉석 인화 사진·QR 저장', `1대 ${man(PHOTO_BOOTH.firstBooth)} (인화 ${PHOTO_BOOTH.printsPerRoll}장 포함)`],
          ['AI 키오스크 (손금·퍼스널컬러·미래직업 등)', '얼굴·손바닥을 비추거나 질문에 답합니다 → 영수증형 결과지', `1대 ${man(KIOSK.firstKiosk)}`],
          ['AI 향수 만들기', 'AI가 추천한 향으로 조향사와 향수를 만듭니다 → 내 향수 (10ml·50ml)', `${man(PERFUME.minimumCharge)}부터`],
        ] },
        { type: 'p', text: `예: 서울 1일 축제에 AI 사주 포토부스 1대와 AI 손금 키오스크 1대를 두고 운영 인력 1명을 쓰면 ${man(PHOTO_BOOTH.firstBooth + KIOSK.firstKiosk + COMMON.staffPerDay)}(VAT 별도)입니다. 운영일을 더하면 포토부스는 대당 1일 ${man(PHOTO_BOOTH.extraDayPerBooth)}, 키오스크는 대당 1일 ${man(KIOSK.extraDayPerKiosk)}가 더해집니다.` },
        { type: 'links', items: [
          { text: '포토부스 대여 — 가격·진행 안내', href: '/insights/ai-photo-booth-rental' },
          { text: 'AI 사주·관상·손금 체험 대여 — 가격·진행 안내', href: '/insights/ai-fortune-kiosk-rental' },
          { text: 'AI 향수 만들기 체험 — 비용·진행 안내', href: '/insights/event-ai-perfume-experience' },
        ] },
        { type: 'h2', text: '부스 수와 처리량' },
        { type: 'ul', items: [
          `AI 포토부스는 최대 ${PHOTO_BOOTH.maxBooths}대, AI 키오스크는 최대 ${KIOSK.maxKiosks}대까지 한 축제에 운영합니다.`,
          `AI 향수 만들기는 조향 1팀(조향사 1명 + 보조 1명)이 시간당 최대 ${PERFUME.guestsPerTeamHour}명을 맡고, 예상 인원에 맞춰 팀을 늘립니다.`,
          `포토부스 인화지는 기본 ${PHOTO_BOOTH.printsPerRoll}장이고, ${PHOTO_BOOTH.printsPerRoll}장 1롤씩 ${man(PHOTO_BOOTH.extraPrintRoll)}에 더할 수 있습니다.`,
        ] },
        { type: 'h2', text: '야외 축제 운영 전 확인할 것' },
        { type: 'ul', items: [
          POWER_KO,
          '비와 직사광선을 피할 수 있는 천막·정자·실내 공간에 설치합니다. 천막과 테이블을 누가 준비할지는 상담 때 함께 정합니다.',
          STAFF_KO,
          '외국인 방문객이 많은 축제는 한국어·영어·일본어·중국어로 운영한 사례가 있습니다 (K-WAVE DANCE FESTIVAL 2026).',
        ] },
        { type: 'h2', text: '전국 출장 — 지역별 운송비 (행사당 1회)' },
        { type: 'table', head: ['지역', '추가 운송비'], rows: travelRowsKo(COMMON.travel) },
        { type: 'p', text: `키오스크만 빌리면 운송비가 더 낮습니다(경상 +${man(KIOSK.travel.gyeongsang)}). AI 향수 만들기는 조향 팀 출장비가 따로 있습니다. ${NO_ISLANDS_KO}` },
        { type: 'h2', text: '축제 운영 사례' },
        { type: 'links', items: [
          { text: '2026 안산사이언스밸리 과학축제 (한양대 ERICA) — AI 포토부스 〈미래로 가는 타임캡슐〉, 이틀간 316팀·약 860명', href: '/portfolio/ansan-science-festival-2026' },
          { text: '2026 소원성취페스타 (금천 오미생태공원) — 한복을 입힌 AI 사주 포토부스', href: '/portfolio/sowon-festa-saju-photobooth-2026' },
          { text: 'K-WAVE DANCE FESTIVAL 2026 (서울 이태원) — AI 조향사·AI 포토부스, 4개 언어 운영', href: '/portfolio/kwave-dance-festival-2026' },
          { text: '평택 AI 페스타 2026 (평택아트센터) — 방문객이 직접 조작하는 키오스크 체험 4종', href: '/portfolio/pyeongtaek-ai-festa-2026' },
          { text: '은평구진로직업체험지원센터 AI 페스티벌 2026 — AI 조향사·퍼스널컬러·타로 부스 3종, 맞춤 향수 100인분', href: '/portfolio/eunpyeong-ai-festival-2026' },
          { text: '제천국제음악영화제 2026 — OST페어 AI 조향 체험 프로그램', href: '/portfolio/jimff-2026-ost-fair' },
          { text: '제천국제음악영화제 2025 — AI 조향사 부스', href: '/portfolio/jecheon-music-film-festival' },
        ] },
        { type: 'faq', items: [
          { q: '축제 체험 부스 비용은 얼마인가요?', a: `AI 키오스크는 1대 1일 ${man(KIOSK.firstKiosk)}, AI 포토부스는 1대 1일 ${man(PHOTO_BOOTH.firstBooth)}부터이고, AI 향수 만들기는 ${man(PERFUME.minimumCharge)}부터입니다(VAT 별도). 현장 운영 인력은 1인 1일 ${man(COMMON.staffPerDay)}입니다.` },
          { q: '며칠짜리 축제도 되나요?', a: `네. 운영일을 더할 때마다 포토부스는 대당 ${man(PHOTO_BOOTH.extraDayPerBooth)}, 키오스크는 대당 ${man(KIOSK.extraDayPerKiosk)}가 더해지고, 운영 인력은 1인 1일 ${man(COMMON.staffPerDay)}입니다.` },
          { q: '지방 축제도 가나요?', a: `네, 전국 출장합니다. 운송비가 행사당 한 번 더해집니다(경상 +${man(COMMON.travel.gyeongsang)}, 키오스크만이면 +${man(KIOSK.travel.gyeongsang)}). ${NO_ISLANDS_KO}` },
          { q: '축제 이름이나 지역 특색을 넣을 수 있나요?', a: `포토부스 프레임 1종은 기본으로 축제에 맞춰 디자인합니다. 키오스크 화면에 로고·색을 넣는 작업은 ${man(CUSTOM_DEV.kiosk.brand)}(행사 ${CUSTOM_DEV.leadDays.brand}일 전 확정), 축제 전용 AI 스타일은 1종 ${man(CUSTOM_DEV.boothStyle)}(${CUSTOM_DEV.leadDays.style}일 전 확정)입니다. 소원성취페스타에서는 포토부스에 한복을 입혀 공원 정자에 설치했습니다.` },
          { q: '어린이·가족 방문객도 할 수 있나요?', a: '네. 은평구 AI 페스티벌에서는 초등학생부터 청소년과 가족이 키오스크로 AI 분석을 받고 맞춤 향수를 만들어 갔고, 안산 과학축제에서는 가족사진으로 10년·20년·30년 뒤 모습을 만들었습니다.' },
          { q: '견적서는 어떻게 받나요?', a: '온라인 견적에서 행사 조건을 고르면 연락처 없이 금액을 바로 볼 수 있고, 내부 결재용 가견적서 PDF도 받을 수 있습니다.' },
        ] },
        { type: 'cta', text: '축제 부스 견적 바로 보기', href: '/quote?preset=campus-festival' },
      ],
    },
    en: {
      title: 'Festival Experience Booths in Korea — AI Photo Booths, Fortune Kiosks and Perfume Making',
      description: `AI photo booths (including saju and face reading), AI kiosks and AI perfume making for local festivals, science festivals, campus festivals and film festivals, delivered with equipment and staff. From ${krw(KIOSK.firstKiosk)} per kiosk per day (excl. VAT), anywhere in mainland Korea.`,
      blocks: [
        { type: 'p', text: 'Every NEANDER experience hands guests something to take home — a photo, a reading or a perfume. At the Ansan Science Valley Science Festival 2026, 316 groups (about 860 people) used our AI photo booth over two days.' },
        { type: 'h2', text: 'Booths we run at festivals (excl. VAT, 1 day)' },
        { type: 'table', head: ['Experience', 'From'], rows: [
          ['AI photo booth', `${krw(PHOTO_BOOTH.firstBooth)} per booth (${PHOTO_BOOTH.printsPerRoll} prints)`],
          ['AI kiosk (palm reading, personal color, career…)', `${krw(KIOSK.firstKiosk)} per kiosk`],
          ['AI perfume making', `${krw(PERFUME.minimumCharge)} minimum`],
          ['On-site staff', `${krw(COMMON.staffPerDay)} per person per day`],
        ] },
        { type: 'p', text: `${POWER_EN} ${NO_ISLANDS_EN}` },
        { type: 'h2', text: 'Festival work' },
        { type: 'links', items: [
          { text: 'Ansan Science Valley Science Festival 2026 — AI photo booth, 316 groups in two days', href: '/portfolio/ansan-science-festival-2026' },
          { text: 'Sowon Seongchwi Festa 2026 — AI saju photo booth dressed in hanbok', href: '/portfolio/sowon-festa-saju-photobooth-2026' },
          { text: 'K-WAVE DANCE FESTIVAL 2026 — AI perfumer and AI photo booth, in four languages', href: '/portfolio/kwave-dance-festival-2026' },
          { text: 'Pyeongtaek AI Festa 2026 — four kiosk experiences', href: '/portfolio/pyeongtaek-ai-festa-2026' },
          { text: 'Eunpyeong AI Festival 2026 — three AI booths, 100 custom perfumes', href: '/portfolio/eunpyeong-ai-festival-2026' },
        ] },
        { type: 'cta', text: 'Get an instant estimate', href: '/quote?preset=campus-festival' },
      ],
    },
  },
  /* ── 행사 답례품 맞춤 향수 ─────────────────────────────── */
  // 2026-11 문의(파트너스데이 160명, 기업 송년회 답례품 등)에서 「참석자 전원에게 나눠 줄 향수」 요청이 이어져 따로 둔다.
  // 금액은 PERFUME 카탈로그로 계산(150명 10ml + 고급 포장 = 305만, 300명 2팀 = 610만 — calculateQuote로 확인).
  {
    slug: 'event-perfume-gift',
    kind: 'landing',
    date: '2026-11-20',
    cover: coverOf(PIC.giftHero),
    keywords: ['행사 답례품', '기업 답례품', '송년회 답례품', '행사 기념품', '단체 답례품 향수', '맞춤 향수 답례품', '참석자 기념품', '세미나 답례품'],
    ko: {
      title: '행사 답례품 맞춤 향수 — 참석자마다 AI가 고른 향수 10ml를 현장에서',
      description: `기업 행사·송년회·세미나 답례품을 참석자마다 다른 맞춤 향수로. AI가 취향을 분석해 향을 고르고, 조향사가 현장에서 10ml 향수로 만들어 선물 포장까지 합니다. 100명 이상 1인 ${man(PERFUME.tiers[2].unit['10ml'])}(VAT 별도), 전국 출장.`,
      blocks: [
        { type: 'p', text: '똑같은 기념품을 나눠 주는 대신, 참석자 한 명 한 명이 자기 향수를 만들어 가져가는 답례품입니다. 참석자는 휴대폰으로 QR을 찍어 몇 가지 질문에 답하거나 사진 한 장을 올리고, AI가 그 사람에게 맞는 향을 고릅니다. 조향사가 그 자리에서 10ml 향수로 만들어 결과 카드와 함께 건넵니다. 줄을 서서 기다리는 시간도 행사의 볼거리가 됩니다.' },
        { type: 'stats', items: [
          { value: `약 ${man(Math.round(GIFT150 / 150 / 100) * 100)}`, label: '1인 비용 (서울 150명 · 고급 포장)' },
          { value: `시간당 ${PERFUME.guestsPerTeamHour}명`, label: '조향 1팀이 만드는 인원' },
          { value: '10ml', label: '참석자마다 다른 향수' },
          { value: `${PERFUME.minGuests}명부터`, label: '운영 가능한 인원' },
        ] },
        { type: 'h2', text: '받아 가기까지' },
        { type: 'steps', items: [
          { title: 'QR로 취향 분석', text: '참석자가 휴대폰으로 질문에 답하거나 사진을 올립니다. 기다리는 동안 미리 해 둘 수 있습니다.', image: PIC.giftStepQr.ko },
          { title: '조향사와 함께 현장에서 블렌딩', text: 'AI가 고른 향으로 조향사가 그 자리에서 10ml 향수를 만듭니다.', image: PIC.giftStepBlend.ko },
          { title: '선물 포장', text: '결과 카드와 함께 포장합니다. 고급 선물 포장·행사 전용 단박스를 고를 수 있습니다.', image: PIC.giftStepWrap.ko },
          { title: '참석자에게 전달', text: '참석자는 자기 이름의 향수를 답례품으로 받아 갑니다.', image: PIC.giftStepGive.ko },
        ] },
        { type: 'h2', text: '이런 행사에서 씁니다' },
        { type: 'ul', items: [
          '기업 송년회·시무식·창립기념행사 — 참석자 답례품',
          '고객 초청 행사·파트너스데이·VIP 행사 — 기억에 남는 기념품',
          '세미나·포럼·시상식 — 쉬는 시간 프로그램 겸 답례품',
          '팬 이벤트·공연 — 아티스트 콘셉트 향(브랜드 전용 향 개발)',
        ] },
        { type: 'h2', text: '가격 (VAT 별도, 서울 1일 기준)' },
        { type: 'table', head: ['항목', '금액'], rows: [
          ['향수 10ml (1인)', `${PERFUME.tiers.map((t) => man(t.unit['10ml'])).join(' / ')} (20~49명 / 50~99명 / 100명 이상)`],
          ['향수 50ml (1인)', PERFUME.tiers.map((t) => man(t.unit['50ml'])).join(' / ')],
          ['조향 1팀 출장비 (조향사 1 + 보조 1)', `운영일마다 ${man(PERFUME.teamTravel.seoul)} (경기·인천 ${man(PERFUME.teamTravel.gyeongin)}, 경상 ${man(PERFUME.teamTravel.gyeongsang)} 등)`],
          ['고급 선물 포장 (선택)', `병당 ${man(PERFUME.premiumPackaging['10ml'])}(10ml) · ${man(PERFUME.premiumPackaging['50ml'])}(50ml)`],
          ['행사 전용 디자인 단박스 (선택)', `${PERFUME.customBox.minGuests}명 이상, ${man(PERFUME.customBox.minimum)}부터`],
          ['행사·브랜드 전용 향 개발 (선택)', man(PERFUME.customScent)],
        ] },
        { type: 'p', text: `예: 서울에서 150명에게 10ml 향수를 고급 포장해 나눠 주면 ${man(PERFUME.tiers[2].unit['10ml'] * 150 + PERFUME.teamTravel.seoul + PERFUME.premiumPackaging['10ml'] * 150)}입니다(1인 ${man(PERFUME.tiers[2].unit['10ml'])} × 150명 + 조향 1팀 출장비 + 포장, VAT 별도). 1인당 약 ${man(Math.round((PERFUME.tiers[2].unit['10ml'] * 150 + PERFUME.teamTravel.seoul + PERFUME.premiumPackaging['10ml'] * 150) / 150 / 100) * 100)}입니다.` },
        { type: 'h2', text: '몇 명까지, 얼마나 걸리나요' },
        { type: 'ul', items: [
          `조향 1팀(조향사 1명 + 보조 1명)이 시간당 최대 ${PERFUME.guestsPerTeamHour}명을 맡습니다. 6시간 행사면 1팀이 약 ${PERFUME.guestsPerTeamHour * COMMON.baseHours}명입니다.`,
          `300명이 6시간 안에 받아 가야 하면 2팀이 갑니다. 이 경우 ${man(PERFUME.tiers[2].unit['10ml'] * 300 + PERFUME.teamTravel.seoul * 2 + PERFUME.premiumPackaging['10ml'] * 300)}(서울, 10ml, 고급 포장, VAT 별도)입니다.`,
          '분석은 참석자 휴대폰(QR)으로 하므로 기다리는 동안 미리 해 둘 수 있습니다. 현장에 분석용 키오스크를 두려면 대당 ' + man(PERFUME.analysisKiosk) + '이 더해집니다.',
          `${PERFUME.minGuests}명부터 운영하며, 서울 기준 최소 금액은 ${man(PERFUME.minimumCharge)}입니다.`,
        ] },
        { type: 'h2', text: '나눠 줘도 되는 향수인가요' },
        { type: 'p', text: '네안데르는 화장품책임판매업 등록(제42812호)과 생활화학제품 안전기준 적합확인 신고를 마친 회사이고, 직영 AI 맞춤 조향 매장 AC\'SCENT ID를 운영합니다. 행사에서 만드는 향수도 매장과 같은 향료와 공정으로 만듭니다.' },
        { type: 'figure', image: PIC.store.ko },
        { type: 'h2', text: '운영 사례' },
        { type: 'gallery', images: [PIC.epPerf.ko, PIC.jimffMake.ko, PIC.kgs2.ko] },
        { type: 'links', items: [
          { text: '은평구진로직업체험지원센터 AI 페스티벌 2026 — 맞춤 향수 100인분', href: '/portfolio/eunpyeong-ai-festival-2026' },
          { text: '제천국제음악영화제 2026 — OST페어 AI 조향 체험', href: '/portfolio/jimff-2026-ost-fair' },
          { text: 'K-WAVE DANCE FESTIVAL 2026 — 사주 오행으로 향을 처방하는 AI 조향사', href: '/portfolio/kwave-dance-festival-2026' },
          { text: '한국엡손 원데이클래스 — AI로 만드는 나만의 향수', href: '/portfolio/epson-oneday-class-2025' },
          { text: 'AI 향수 만들기 체험 부스 — 비용·진행 전체 안내', href: '/insights/event-ai-perfume-experience' },
        ] },
        { type: 'faq', items: [
          { q: '답례품 향수 비용은 1인당 얼마인가요?', a: `10ml 기준 1인 ${PERFUME.tiers.map((t) => man(t.unit['10ml'])).join(' · ')}(인원 구간별)에 조향 팀 출장비가 더해집니다. 서울 150명이면 고급 포장까지 1인 약 ${man(Math.round((PERFUME.tiers[2].unit['10ml'] * 150 + PERFUME.teamTravel.seoul + PERFUME.premiumPackaging['10ml'] * 150) / 150 / 100) * 100)}입니다(VAT 별도).` },
          { q: '행사 로고를 넣은 포장이 되나요?', a: `${PERFUME.customBox.minGuests}명 이상이면 행사 전용 디자인 단박스를 ${man(PERFUME.customBox.minimum)}부터 만듭니다. 그보다 적으면 AC'SCENT 기본 패키지나 고급 선물 포장(병당 ${man(PERFUME.premiumPackaging['10ml'])})을 씁니다.` },
          { q: '행사 콘셉트에 맞는 향을 따로 만들 수 있나요?', a: `행사·브랜드 전용 향 개발은 ${man(PERFUME.customScent)}입니다. 참석자 맞춤 향 대신, 또는 함께 쓸 수 있습니다.` },
          { q: '참석자가 많아 줄이 길어지지 않을까요?', a: `조향 1팀이 시간당 최대 ${PERFUME.guestsPerTeamHour}명을 맡고, 인원과 운영 시간에 맞춰 팀을 늘립니다. 분석은 휴대폰으로 미리 해 두면 현장에서는 조향만 기다리면 됩니다.` },
          { q: '견적서는 어떻게 받나요?', a: '온라인 견적에서 「행사 답례품 향수」를 고르면 연락처 없이 금액을 바로 보고, 내부 결재용 가견적서 PDF를 받을 수 있습니다.' },
        ] },
        { type: 'cta', text: '답례품 향수 견적 바로 보기', href: '/quote?preset=perfume-gift' },
      ],
    },
    en: {
      title: 'Custom Perfume Gifts for Events — AI-Matched 10 ml Perfume for Every Guest',
      description: `Instead of one giveaway for everyone, each guest takes home a perfume AI matched to them, blended on site by our perfumers. ${krw(PERFUME.tiers[2].unit['10ml'])} per guest at 100+ guests (excl. VAT), anywhere in mainland Korea.`,
      blocks: [
        { type: 'p', text: 'Guests scan a QR code, answer a few questions or upload a photo, and AI picks a scent for them. A perfumer blends it into a 10 ml perfume on the spot and hands it over with a result card.' },
        { type: 'stats', items: [
          { value: `≈ ${krw(Math.round(GIFT150 / 150 / 100) * 100)}`, label: 'Per guest (150 guests in Seoul, gift-wrapped)' },
          { value: `${PERFUME.guestsPerTeamHour} / hour`, label: 'Guests per perfumer team' },
          { value: '10 ml', label: 'A different perfume for each guest' },
          { value: `${PERFUME.minGuests}+`, label: 'Minimum guests' },
        ] },
        { type: 'h2', text: 'From analysis to gift' },
        { type: 'steps', items: [
          { title: 'Taste analysis by QR', text: 'Guests answer a few questions or upload a photo on their phones, even while they wait.', image: PIC.giftStepQr.en },
          { title: 'Blended on site with a perfumer', text: 'A perfumer makes a 10 ml perfume from the scent AI picked.', image: PIC.giftStepBlend.en },
          { title: 'Gift wrapping', text: 'Wrapped with the result card; premium wrapping or a custom event box is available.', image: PIC.giftStepWrap.en },
          { title: 'Handed to each guest', text: 'Every guest leaves with a perfume made for them.', image: PIC.giftStepGive.en },
        ] },
        { type: 'h2', text: 'Prices' },
        { type: 'table', head: ['Item', 'Price (excl. VAT)'], rows: [
          ['10 ml per guest', `${PERFUME.tiers.map((t) => krw(t.unit['10ml'])).join(' / ')} (20–49 / 50–99 / 100+)`],
          ['Perfumer team travel (Seoul)', `${krw(PERFUME.teamTravel.seoul)} per team per day`],
          ['Gift packaging', `${krw(PERFUME.premiumPackaging['10ml'])} per 10 ml bottle`],
          ['Capacity', `Up to ${PERFUME.guestsPerTeamHour} guests per team per hour`],
        ] },
        { type: 'p', text: `Example: 150 guests in Seoul with gift packaging come to ${krw(PERFUME.tiers[2].unit['10ml'] * 150 + PERFUME.teamTravel.seoul + PERFUME.premiumPackaging['10ml'] * 150)} (excl. VAT). NEANDER is a registered cosmetics distributor (No. 42812). ${NO_ISLANDS_EN}` },
        { type: 'figure', image: PIC.store.en },
        { type: 'h2', text: 'Recent work' },
        { type: 'gallery', images: [PIC.epPerf.en, PIC.jimffMake.en, PIC.kgs2.en] },
        { type: 'cta', text: 'Get an instant estimate', href: '/quote?preset=perfume-gift' },
      ],
    },
  },

  /* ── 브랜드 향 개발 + AI 향수 키오스크 (전시·박람회) ──────── */
  // 2026-11 킨텍스 전시 문의(브랜드형 향 4종 개발 + 30초 설문 키오스크 → 유형 카드 출력 → 시향·샘플)에서 나온 구성.
  // 키오스크 콘텐츠 커스텀(질문 8·결과 유형 8)과 브랜드 전용 향 개발은 카탈로그 금액, 샘플 제작은 카탈로그에 없어 상담으로 둔다.
  {
    slug: 'brand-scent-kiosk',
    kind: 'landing',
    date: '2026-11-20',
    cover: coverOf(PIC.swfShelf),
    keywords: ['브랜드 향 개발', '시그니처 향 제작', '브랜드 향수 제작', '박람회 부스 체험', '전시회 부스 이벤트', '향 마케팅', '향기 마케팅', 'AI 향수 키오스크'],
    ko: {
      title: '브랜드 향 개발 + AI 향수 키오스크 — 전시·박람회 부스용 향 체험',
      description: `브랜드를 닮은 향을 만들고, 전시·박람회 부스에서 방문객이 30초 설문으로 「나에게 맞는 브랜드 향」을 찾게 합니다. 결과 카드 출력·시향·샘플 증정까지. 키오스크 1대 1일 ${man(KIOSK.firstKiosk)}부터, 브랜드 전용 향 개발 ${man(PERFUME.customScent)}(VAT 별도).`,
      blocks: [
        { type: 'p', text: '전시·박람회 부스에서 가장 어려운 일은 지나가는 방문객을 멈춰 세우는 것입니다. 브랜드 향 키오스크는 방문객이 화면에서 짧은 질문에 답하면, AI가 브랜드 향 몇 가지 중 그 사람에게 맞는 향을 골라 결과 카드로 출력합니다. 방문객은 그 향을 시향하거나 샘플로 가져가고, 브랜드는 「내 향」으로 기억됩니다.' },
        { type: 'figure', image: PIC.brandExpo.ko },
        { type: 'h2', text: '구성' },
        { type: 'table', head: ['단계', '하는 일', '금액 (VAT 별도)'], rows: [
          ['① 브랜드 향 개발', '브랜드 이야기·제품·공간에 맞춘 전용 향을 조향사가 개발합니다', `${man(PERFUME.customScent)} (1종 기준, 여러 종은 상담)`],
          ['② 키오스크 콘텐츠', `질문(최대 8문항)·결과 유형(최대 8종)·결과 문구·화면을 브랜드에 맞게 만듭니다 (${CUSTOM_DEV.leadDays.content}일 전 확정)`, man(CUSTOM_DEV.kiosk.content)],
          ['③ 현장 운영', '키오스크가 결과 카드를 바로 출력하고, 시향·샘플 증정 동선을 함께 짭니다', `키오스크 1대 1일 ${man(KIOSK.firstKiosk)} (추가 대수 ${man(KIOSK.extraKiosk)}, 추가 운영일 대당 ${man(KIOSK.extraDayPerKiosk)})`],
          ['샘플·시향지', '수량과 용량에 따라 제작합니다', '상담 후 견적'],
        ] },
        // 표에 있는 금액을 다시 늘어놓지 않는다 — 예시는 한 줄, 운영 인력·연장·사전 설치 같은 세부는 온라인 견적에서 (2026-11-21 사용자)
        { type: 'p', text: `예: 1일 전시 · 키오스크 1대 · 브랜드 맞춤 설문이면 ${man(KIOSK.firstKiosk + CUSTOM_DEV.kiosk.content)}부터 시작합니다. 현장 인력과 운영 시간에 따른 금액은 온라인 견적에서 바로 확인할 수 있습니다.` },
        { type: 'gallery', cols: 2, images: [PIC.jimffKiosk.ko, PIC.epKiosk.ko] },
        { type: 'h2', text: '조향사가 직접 만들어 주는 방식도 됩니다' },
        { type: 'p', text: `샘플 대신 방문객에게 향수를 바로 만들어 주려면 조향 팀이 함께 갑니다. 이때는 AI 향수 만들기 체험 가격(10ml 1인 ${PERFUME.tiers.map((t) => man(t.unit['10ml'])).join(' · ')}, 조향 1팀 출장비 ${man(PERFUME.teamTravel.seoul)})이 적용됩니다.` },
        { type: 'gallery', cols: 2, images: [PIC.jcBlend.ko, PIC.kgs3.ko] },
        { type: 'h2', text: '향을 만든 사례' },
        { type: 'gallery', images: [PIC.swfBook.ko, PIC.swfVisit.ko, PIC.swfSmell.ko] },
        { type: 'links', items: [
          { text: '서울국제작가축제 — 참가 도서 29종마다 다른 향(북퍼퓸 전시)', href: '/portfolio/seoul-writers-festival' },
          { text: '엔플라잉 〈into REM〉 공식 향 MD — 공연 도시마다 다른 향', href: '/portfolio/nflying-into-the-rem-md-2026' },
          { text: '제천국제음악영화제 2026 — OST페어 AI 조향 체험', href: '/portfolio/jimff-2026-ost-fair' },
          { text: '평택 AI 페스타 2026 — 방문객이 직접 조작하는 키오스크 체험 4종', href: '/portfolio/pyeongtaek-ai-festa-2026' },
        ] },
        { type: 'faq', items: [
          { q: '브랜드 향은 몇 가지까지 만들 수 있나요?', a: `결과 유형은 최대 8종까지 둘 수 있습니다. 브랜드 전용 향 개발은 1종 ${man(PERFUME.customScent)} 기준이고, 여러 종을 함께 개발하면 상담으로 금액을 정합니다.` },
          { q: '준비 기간은 얼마나 걸리나요?', a: `키오스크 콘텐츠는 행사 ${CUSTOM_DEV.leadDays.content}일 전까지 질문·결과를 확정하면 됩니다. 향 개발은 시향과 수정이 필요해 그보다 여유 있게 시작하는 것을 권합니다.` },
          { q: '결과는 어떻게 주나요?', a: '키오스크에 내장된 영수증형 프린터로 결과 카드를 바로 출력하고, QR로 휴대폰에 저장할 수 있게 할 수도 있습니다.' },
          { q: '전시장에 무엇이 필요한가요?', a: `${POWER_KO} 키오스크 1대는 작은 테이블 하나 정도의 자리면 됩니다.` },
          { q: '행사가 끝난 뒤 향을 제품으로 만들 수 있나요?', a: '네안데르는 화장품책임판매업 등록(제42812호)을 마쳤고, 엔플라잉 공식 향 MD처럼 룸스프레이·사쉐 등 제품 제작도 합니다. 수량과 사양은 상담으로 정합니다.' },
        ] },
        { type: 'cta', text: '키오스크 견적 바로 보기', href: '/quote?item=rental' },
      ],
    },
    en: {
      title: 'Signature Scent + AI Scent Kiosk — For Trade Shows and Exhibitions',
      description: `We develop a scent for your brand and run a kiosk where visitors answer a short quiz and get matched to one of your scents, with a printed result card and a sampling station. Kiosk from ${krw(KIOSK.firstKiosk)} per day; signature scent ${krw(PERFUME.customScent)} (excl. VAT).`,
      blocks: [
        { type: 'p', text: 'The hardest part of a trade-show booth is getting people to stop. Visitors answer a few questions on the kiosk, AI matches them to one of your brand scents and prints a result card, and they smell it or take a sample home.' },
        { type: 'figure', image: PIC.brandExpo.en },
        { type: 'h2', text: 'What it costs' },
        { type: 'table', head: ['Step', 'Price (excl. VAT)'], rows: [
          ['Signature scent development', `${krw(PERFUME.customScent)} per scent`],
          ['Kiosk content (up to 8 questions and 8 result types)', krw(CUSTOM_DEV.kiosk.content)],
          ['Kiosk, 1 day', krw(KIOSK.firstKiosk)],
          ['Samples', 'Quoted by quantity'],
        ] },
        { type: 'gallery', cols: 2, images: [PIC.jimffKiosk.en, PIC.epKiosk.en] },
        { type: 'p', text: `${POWER_EN} ${NO_ISLANDS_EN}` },
        { type: 'h2', text: 'Scents we have made' },
        { type: 'p', text: 'For the Seoul International Writers’ Festival we made a perfume and scent strip for each of the 29 participating books.' },
        { type: 'gallery', images: [PIC.swfBook.en, PIC.swfVisit.en, PIC.swfSmell.en] },
        { type: 'cta', text: 'Get an instant estimate', href: '/quote?item=rental' },
      ],
    },
  },

  /* ── AI 퍼스널 컬러 부스 ─────────────────────────────── */
  // 사이트 관심도 2위(10/30~11/17 상세 방문자 13명), 2026-11 문의(뷰티·패션 브랜드 팝업, 학교 도서관 행사)에서 이어져 따로 둔다.
  {
    slug: 'ai-personal-color-booth',
    kind: 'landing',
    date: '2026-11-20',
    cover: coverOf(PIC.epColor),
    keywords: ['퍼스널컬러 부스', '퍼스널컬러 진단 행사', '퍼스널컬러 이벤트', '퍼스널컬러 키오스크', 'AI 퍼스널컬러', '뷰티 팝업 체험', '퍼스널컬러 진단 출장'],
    ko: {
      title: 'AI 퍼스널 컬러 부스 — 행사·팝업·학교 축제 퍼스널컬러 진단 키오스크 대여',
      description: `카메라로 얼굴을 비추면 AI가 봄웜·여름쿨·가을웜·겨울쿨 중 퍼스널 컬러를 진단하고 결과 카드를 바로 출력합니다. 키오스크 1대 1일 ${man(KIOSK.firstKiosk)}부터(VAT 별도), 전국 출장.`,
      blocks: [
        { type: 'p', text: '퍼스널 컬러 진단은 남녀노소가 결과를 궁금해하고, 친구끼리 결과를 비교하며 줄을 서는 체험입니다. 키오스크 카메라로 얼굴을 비추면 AI가 피부 톤을 분석해 봄웜·여름쿨·가을웜·겨울쿨 중 하나로 진단하고, 어울리는 색 팔레트가 담긴 결과 카드를 바로 출력합니다. 결과는 QR로 휴대폰에도 저장됩니다.' },
        { type: 'stats', items: [
          { value: man(KIOSK.firstKiosk), label: '키오스크 1대 1일부터' },
          { value: '1분 안팎', label: '촬영부터 결과 카드까지' },
          { value: '4계절', label: '봄웜·여름쿨·가을웜·겨울쿨' },
        ] },
        { type: 'gallery', cols: 2, images: [PIC.colorResult.ko, PIC.colorSchool.ko] },
        { type: 'h2', text: '가격 (VAT 별도)' },
        { type: 'table', head: ['항목', '금액'], rows: [
          ['키오스크 1대 1일 (카메라·결과 카드 프린터 내장, 운반·설치 포함)', man(KIOSK.firstKiosk)],
          ['같은 행사 키오스크 추가', `대당 ${man(KIOSK.extraKiosk)}`],
          ['운영일 추가', `대당 1일 ${man(KIOSK.extraDayPerKiosk)}`],
          ['브랜드 로고·컬러 적용', `${man(CUSTOM_DEV.kiosk.brand)} (행사 ${CUSTOM_DEV.leadDays.brand}일 전 확정)`],
          ['결과에 브랜드 제품 연결 (최대 20개)·질문·결과 문구 교체', `${man(CUSTOM_DEV.kiosk.content)} (행사 ${CUSTOM_DEV.leadDays.content}일 전 확정)`],
          ['현장 운영 인력', `1인 1일 ${man(COMMON.staffPerDay)}`],
        ] },
        { type: 'p', text: `예: 서울에서 이틀 동안 키오스크 1대와 운영 인력 1명으로 운영하면 ${man(KIOSK.firstKiosk + KIOSK.extraDayPerKiosk + COMMON.staffPerDay * 2)}(VAT 별도)입니다. 하루 행사에 브랜드 로고·컬러를 넣으면 ${man(KIOSK.firstKiosk + CUSTOM_DEV.kiosk.brand + COMMON.staffPerDay)}(운영 인력 1명 포함)입니다.` },
        { type: 'h2', text: '이런 곳에서 씁니다' },
        { type: 'ul', items: [
          '뷰티·패션 브랜드 팝업 — 진단 결과에 맞는 자사 제품을 추천',
          '백화점·쇼핑몰 이벤트, 웨딩 박람회',
          '학교 축제·도서관 행사·진로 체험 — 청소년이 가장 많이 줄 서는 체험 중 하나',
          '기업 행사·사내 축제의 쉬는 시간 프로그램',
        ] },
        { type: 'h2', text: '운영 전 확인할 것' },
        { type: 'ul', items: [
          '피부 톤 진단은 조명 색에 영향을 받습니다. 노란 조명이나 색 조명 바로 아래는 피하고, 설치 자리의 조명을 미리 알려 주시면 맞춰 둡니다.',
          POWER_KO,
          STAFF_KO,
        ] },
        { type: 'figure', image: PIC.colorLight.ko },
        { type: 'h2', text: '운영 사례' },
        { type: 'gallery', cols: 2, images: [PIC.jbnu.ko, PIC.epHall.ko] },
        { type: 'links', items: [
          { text: '은평구진로직업체험지원센터 AI 페스티벌 2026 — AI 퍼스널컬러 진단 부스', href: '/portfolio/eunpyeong-ai-festival-2026' },
          { text: '전북대학교 전공탐색 박람회 — AI 퍼스널컬러·캐리커처·미래직업 체험', href: '/portfolio/jbnu-major-fair-2026' },
          { text: 'AI 퍼스널 컬러 진단 — 체험 소개', href: '/services/ai-personal-color' },
        ] },
        { type: 'faq', items: [
          { q: '퍼스널 컬러 부스 비용은 얼마인가요?', a: `키오스크 1대 1일 ${man(KIOSK.firstKiosk)}부터이고(VAT 별도), 현장 운영 인력은 1인 1일 ${man(COMMON.staffPerDay)}입니다.` },
          { q: '한 명당 얼마나 걸리나요?', a: '촬영부터 결과 카드 출력까지 1분 안팎입니다. 방문객이 많으면 키오스크를 늘립니다(같은 행사 추가 대당 ' + man(KIOSK.extraKiosk) + ').' },
          { q: '우리 브랜드 제품을 결과에 넣을 수 있나요?', a: `네. 결과 유형별로 브랜드 제품(최대 20개)을 연결하고 질문·결과 문구·화면을 바꾸는 작업은 ${man(CUSTOM_DEV.kiosk.content)}이며, 행사 ${CUSTOM_DEV.leadDays.content}일 전까지 확정합니다.` },
          { q: '사진은 저장되나요?', a: '진단에 쓴 얼굴 사진은 결과를 만드는 데만 쓰고, 얼굴 인식이나 AI 학습에 쓰지 않습니다. 자세한 내용은 개인정보처리방침에 있습니다.' },
          { q: '견적서는 어떻게 받나요?', a: '온라인 견적에서 AI 키오스크를 담고 체험을 퍼스널 컬러로 고르면 금액을 바로 보고 가견적서 PDF를 받을 수 있습니다.' },
        ] },
        { type: 'cta', text: '퍼스널 컬러 키오스크 견적 바로 보기', href: '/quote?item=rental' },
      ],
    },
    en: {
      title: 'AI Personal Color Booth — Personal Color Analysis Kiosk Rental for Events',
      description: `Guests face the kiosk camera and AI diagnoses their personal color season (spring warm, summer cool, autumn warm, winter cool), printing a result card on the spot. From ${krw(KIOSK.firstKiosk)} per kiosk per day (excl. VAT).`,
      blocks: [
        { type: 'p', text: 'Guests face the kiosk camera, AI analyzes their skin tone, and a result card with their season and matching palette prints on the spot. Results can also be saved to a phone by QR.' },
        { type: 'stats', items: [
          { value: krw(KIOSK.firstKiosk), label: 'Per kiosk per day, from' },
          { value: '~1 min', label: 'Photo to printed card' },
          { value: '4 seasons', label: 'Spring warm · Summer cool · Autumn warm · Winter cool' },
        ] },
        { type: 'gallery', cols: 2, images: [PIC.colorResult.en, PIC.colorSchool.en] },
        { type: 'h2', text: 'Prices' },
        { type: 'table', head: ['Item', 'Price (excl. VAT)'], rows: [
          ['Kiosk, 1 day', krw(KIOSK.firstKiosk)],
          ['Branding (logo and colors)', krw(CUSTOM_DEV.kiosk.brand)],
          ['Product matching and custom results', krw(CUSTOM_DEV.kiosk.content)],
          ['On-site staff', `${krw(COMMON.staffPerDay)} per person per day`],
        ] },
        { type: 'p', text: `Lighting affects skin-tone analysis, so we avoid colored lights at the booth. ${POWER_EN} ${NO_ISLANDS_EN}` },
        { type: 'figure', image: PIC.colorLight.en },
        { type: 'h2', text: 'Recent work' },
        { type: 'gallery', cols: 2, images: [PIC.jbnu.en, PIC.epHall.en] },
        { type: 'cta', text: 'Get an instant estimate', href: '/quote?item=rental' },
      ],
    },
  },

  /* ── 학교·도서관·청소년 시설 AI 체험 ──────────────────────── */
  // 2026-11 문의(학교도서관 행사, 청소년 공간 상설 설치)와 은평 진로센터·전북대·안산 과학축제 사례로 묶는다.
  {
    slug: 'school-library-ai-experience',
    kind: 'landing',
    date: '2026-11-20',
    cover: coverOf(PIC.epPerf),
    keywords: ['학교 축제 체험 부스', '학교 행사 체험 프로그램', '도서관 행사 체험', '진로 체험 프로그램', '청소년 AI 체험', 'AI 교육 체험 부스', '진로 박람회 부스', '청소년 축제 체험'],
    ko: {
      title: '학교·도서관·청소년 행사 AI 체험 부스 — 진로·퍼스널컬러·캐리커처·향수 만들기',
      description: `학교 축제·도서관 행사·진로 박람회·청소년 시설에 AI 미래직업 진단, AI 퍼스널컬러, AI 캐리커처, AI 향수 만들기 체험을 장비와 운영 인력까지 함께 보내 드립니다. 키오스크 1대 1일 ${man(KIOSK.firstKiosk)}부터(VAT 별도), 상설 설치도 상담합니다.`,
      blocks: [
        { type: 'p', text: '학생과 가족이 오는 행사에는 결과를 바로 들고 갈 수 있는 체험이 잘 맞습니다. 미래직업 진단은 적성 질문에 답하면 AI가 직업을 추천하고 그 직업을 가진 내 모습을 그려 진로 카드로 출력합니다. 퍼스널컬러·캐리커처는 줄을 서서 친구와 결과를 비교하고, 향수 만들기는 분석 결과로 내 향수를 직접 만들어 갑니다.' },
        { type: 'stats', items: [
          { value: '316팀', label: '안산 과학축제 이틀 참여 (약 860명)' },
          { value: '100인분', label: '은평 AI 페스티벌 맞춤 향수' },
          { value: man(KIOSK.firstKiosk), label: '키오스크 1대 1일부터' },
        ] },
        { type: 'figure', image: PIC.schoolLib.ko },
        { type: 'h2', text: '학교·청소년 행사에서 많이 고르는 체험' },
        { type: 'table', head: ['체험', '학생이 하는 것 → 가져가는 것', '시작가 (VAT 별도, 1일)'], rows: [
          ['AI 미래직업 진단', '적성 질문에 답합니다 → 미래 직업 모습이 담긴 진로 카드', `키오스크 1대 ${man(KIOSK.firstKiosk)}`],
          ['AI 퍼스널컬러 진단', '카메라로 얼굴을 비춥니다 → 퍼스널 컬러 결과 카드', `키오스크 1대 ${man(KIOSK.firstKiosk)}`],
          ['AI 캐리커처', '사진을 찍고 화풍을 고릅니다 → 캐리커처 출력', `키오스크 1대 ${man(KIOSK.firstKiosk)}`],
          ['AI 향수 만들기', 'AI가 고른 향으로 조향사와 향수를 만듭니다 → 내 향수 10ml', `${man(PERFUME.minimumCharge)}부터 (20명~)`],
          ['AI 포토부스', '사진을 찍고 AI 컨셉을 고릅니다 → 즉석 인화 사진', `1대 ${man(PHOTO_BOOTH.firstBooth)}`],
        ] },
        { type: 'p', text: `예: 하루 행사에 키오스크 2대(미래직업 + 퍼스널컬러)와 운영 인력 1명이면 ${man(KIOSK.firstKiosk + KIOSK.extraKiosk + COMMON.staffPerDay)}(VAT 별도)입니다. 키오스크마다 다른 체험을 넣을 수 있습니다.` },
        { type: 'gallery', images: [PIC.jbnu.ko, PIC.epColor.ko, PIC.epKiosk.ko, PIC.ansan.ko, PIC.epHall.ko, PIC.jongno.ko] },
        { type: 'h2', text: '학교·공공기관이 많이 묻는 것' },
        { type: 'ul', items: [
          '견적서·사업자등록증·통장 사본 등 수의계약 서류를 바로 드립니다. 온라인 견적에서 내부 결재용 가견적서 PDF를 연락처 없이 받을 수 있습니다.',
          '사주·운세 체험은 청소년 행사에 맞게 공부·친구·진로 이야기로 풀이 문구를 순화할 수 있습니다.',
          '촬영한 얼굴 사진은 결과를 만드는 데만 쓰고 얼굴 인식이나 AI 학습에 쓰지 않습니다.',
          `청소년 시설·도서관에 계속 두고 쓰는 상설 설치도 상담합니다(키오스크 상시 운영 대당 월 ${man(KIOSK.monthlyPerKiosk)}부터).`,
        ] },
        { type: 'h2', text: '운영 사례' },
        { type: 'gallery', cols: 2, images: [PIC.jbnuRow.ko, PIC.ansan.ko] },
        { type: 'links', items: [
          { text: '은평구진로직업체험지원센터 AI 페스티벌 2026 — AI 조향사·퍼스널컬러·타로 부스 3종, 맞춤 향수 100인분', href: '/portfolio/eunpyeong-ai-festival-2026' },
          { text: '전북대학교 전공탐색 박람회 — AI 퍼스널컬러·캐리커처·미래직업 웹 체험 3종', href: '/portfolio/jbnu-major-fair-2026' },
          { text: '2026 안산사이언스밸리 과학축제 (한양대 ERICA) — 가족 타임캡슐 AI 포토부스, 이틀간 316팀', href: '/portfolio/ansan-science-festival-2026' },
          { text: '종로 열린 책마루 — 독서 취향과 향을 잇는 AI 체험', href: '/portfolio/jongno-open-book-maru-2026' },
          { text: '축제 체험 부스 — 지역축제·과학축제·대학 축제 안내', href: '/insights/festival-experience-booth' },
        ] },
        { type: 'faq', items: [
          { q: '학교 축제 체험 부스 비용은 얼마인가요?', a: `AI 키오스크는 1대 1일 ${man(KIOSK.firstKiosk)}, 같은 행사에 추가하는 키오스크는 대당 ${man(KIOSK.extraKiosk)}입니다. 현장 운영 인력은 1인 1일 ${man(COMMON.staffPerDay)}입니다(VAT 별도).` },
          { q: '초등학생도 할 수 있나요?', a: '네. 은평구 AI 페스티벌에서는 초등학생부터 청소년과 가족이 키오스크로 AI 분석을 받고 맞춤 향수를 만들어 갔습니다.' },
          { q: '학교 이름이나 행사 로고를 넣을 수 있나요?', a: `키오스크 화면에 로고·색을 넣는 작업은 ${man(CUSTOM_DEV.kiosk.brand)}이고 행사 ${CUSTOM_DEV.leadDays.brand}일 전에 확정합니다.` },
          { q: '지방 학교도 가나요?', a: `네, 전국 출장합니다. 키오스크만 빌리면 운송비가 행사당 한 번 더해집니다(경상 +${man(KIOSK.travel.gyeongsang)}). ${NO_ISLANDS_KO}` },
        ] },
        { type: 'cta', text: '학교 행사 견적 바로 보기', href: '/quote?preset=campus-festival' },
      ],
    },
    en: {
      title: 'AI Experience Booths — For Schools, Libraries and Youth Events',
      description: `AI career matching, personal color, caricature and perfume making for school festivals, library events, career fairs and youth centers, delivered with equipment and staff. From ${krw(KIOSK.firstKiosk)} per kiosk per day (excl. VAT).`,
      blocks: [
        { type: 'p', text: 'Students and families like experiences they can take home: a career card showing their future self, a personal color result, a caricature, or a perfume they blended themselves.' },
        { type: 'stats', items: [
          { value: '316 groups', label: 'Ansan Science Festival, 2 days (about 860 people)' },
          { value: '100', label: 'Custom perfumes at Eunpyeong AI Festival' },
          { value: krw(KIOSK.firstKiosk), label: 'Per kiosk per day, from' },
        ] },
        { type: 'figure', image: PIC.schoolLib.en },
        { type: 'h2', text: 'Popular experiences' },
        { type: 'table', head: ['Experience', 'From (excl. VAT, 1 day)'], rows: [
          ['AI future career', krw(KIOSK.firstKiosk)],
          ['AI personal color', krw(KIOSK.firstKiosk)],
          ['AI caricature', krw(KIOSK.firstKiosk)],
          ['AI perfume making', `${krw(PERFUME.minimumCharge)} minimum`],
        ] },
        { type: 'gallery', images: [PIC.jbnu.en, PIC.epColor.en, PIC.epKiosk.en, PIC.ansan.en, PIC.epHall.en, PIC.jongno.en] },
        { type: 'p', text: `Long-term installations for youth centers and libraries are available. ${NO_ISLANDS_EN}` },
        { type: 'cta', text: 'Get an instant estimate', href: '/quote?preset=campus-festival' },
      ],
    },
  },
];
