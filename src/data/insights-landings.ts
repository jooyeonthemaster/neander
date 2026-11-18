/* ─────────────────────────────────────────────────────────
   NEANDERco.  |  구매 의도 검색어용 랜딩 (insights 의 kind: 'landing')
   행사 담당자가 실제로 찾는 말(포토부스 대여, 사주 키오스크 대여, 향수 만들기 체험 출장,
   연말행사·송년회, 축제 체험 부스)마다 한 페이지씩 둔다 — 2026-11 검색·AI 노출 조사와
   2026-11-14 네이버 키워드 도구 검색량 기준.
   금액은 모두 온라인 견적 카탈로그(src/lib/quote/catalog.ts)에서 계산해 견적과 어긋나지 않게 하고,
   사례는 공개 포트폴리오에 있는 것만 쓴다. 카탈로그에 없는 수치는 넣지 않는다.
   ───────────────────────────────────────────────────────── */

import type { Insight } from './insights';
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

export const LANDINGS: Insight[] = [
  /* ── AI 포토부스 대여 ─────────────────────────────────── */
  {
    slug: 'ai-photo-booth-rental',
    kind: 'landing',
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
    date: '2026-11-11',
    keywords: ['AI 향수 만들기 체험', 'AI 향수 체험 부스', '향수 만들기 체험 출장', '조향 클래스 출장', '기업 조향 클래스', '행사 조향 체험', "AC'SCENT"],
    ko: {
      title: 'AI 향수 만들기 체험 부스 — 행사·기업·팝업 조향사 출장',
      description: `AI가 방문객의 취향을 분석해 향을 추천하고, 출장 온 조향사가 그 자리에서 향수를 만들어 건넵니다. ${man(PERFUME.minimumCharge)}부터(VAT 별도), 1인 ${man(PERFUME.tiers[2].unit['10ml'])}~${man(PERFUME.tiers[0].unit['10ml'])}(10ml), 전국 출장.`,
      blocks: [
        { type: 'p', text: "AC'SCENT AI 향수 체험은 AI가 방문객의 취향과 이미지를 분석해 향을 추천하고, 조향사가 현장에서 그 향으로 향수를 만들어 드리는 체험입니다. 방문객은 자신만의 향수를 기념품으로 가져갑니다. 축제·팝업·기업 행사·원데이 클래스로 운영합니다." },
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
          '방향제 안전기준 적합확인 신고 HB24-12-2355 (일반용·섬유용, 분무기형, 2024-12)',
          '방향제 안전기준 적합확인 신고 HB23-12-1949 (실내공간용·자동차용, 함침물형, 2023-12)',
          '향료 30종 운영',
        ] },
        { type: 'h2', text: '운영 사례' },
        { type: 'links', items: [
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
          { q: '행사에서 향수를 나눠 줘도 괜찮나요?', a: '네안데르는 화장품책임판매업 등록과 방향제 안전기준 적합확인 신고를 마쳤습니다. 자세한 인허가 내용은 「행사에서 향수·방향제를 나눠 주려면」 글에 정리해 두었습니다.' },
          { q: '키오스크가 꼭 있어야 하나요?', a: `아니요. 기본은 방문객이 휴대폰으로 QR을 찍어 AI 분석을 받는 방식입니다. 현장에 분석용 키오스크를 두려면 대당 ${man(PERFUME.analysisKiosk)}이 더해집니다.` },
          { q: '우리 브랜드만의 향을 만들 수 있나요?', a: `브랜드 전용 향 개발은 ${man(PERFUME.customScent)}입니다. ${PERFUME.customBox.minGuests}명 이상이면 전용 디자인 단박스도 ${man(PERFUME.customBox.minimum)}부터 만들 수 있습니다.` },
          { q: '지방 행사도 되나요?', a: `네, 조향 팀이 출장합니다. 출장비는 팀·운영일마다 서울 ${man(PERFUME.teamTravel.seoul)}, 경상 ${man(PERFUME.teamTravel.gyeongsang)} 등 지역별로 다릅니다. ${NO_ISLANDS_KO}` },
        ] },
        { type: 'cta', text: 'AI 향수 체험 견적 바로 보기', href: '/quote' },
      ],
    },
    en: {
      title: 'AI Perfume-Making Experience for Events — On-site Perfumers in Korea',
      description: `AI reads each guest's taste and recommends a scent; a visiting perfumer blends it into a perfume on the spot. From ${krw(PERFUME.minimumCharge)} (excl. VAT), ${krw(PERFUME.tiers[2].unit['10ml'])}–${krw(PERFUME.tiers[0].unit['10ml'])} per 10 ml guest.`,
      blocks: [
        { type: 'p', text: "The AC'SCENT AI perfume experience uses AI to analyze a guest's taste and image and recommend a scent, which a perfumer then blends on site. Guests take home their own perfume." },
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
          'Air freshener safety-standard conformity reports HB24-12-2355 and HB23-12-1949',
          '30 fragrance ingredients in operation',
        ] },
        { type: 'h2', text: 'Recent work' },
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

  /* ── AI 사주·관상·손금 키오스크 대여 ─────────────────────── */
  {
    slug: 'ai-fortune-kiosk-rental',
    kind: 'landing',
    date: '2026-11-11',
    keywords: ['사주 키오스크 대여', 'AI 사주 키오스크', 'AI 관상 체험 부스', 'AI 손금', '운세 키오스크 렌탈', '행사 사주 이벤트', '축제 사주 부스'],
    ko: {
      title: 'AI 사주·관상·손금 키오스크 대여 — 행사·축제·기업 행사',
      description: `생년월일로 보는 AI 사주, 얼굴로 보는 AI 관상, 손바닥으로 보는 AI 손금을 키오스크로 운영하고 결과를 그 자리에서 출력해 드립니다. 1대 1일 ${man(KIOSK.firstKiosk)}부터(VAT 별도, 운반·설치 포함), 전국 출장.`,
      blocks: [
        { type: 'p', text: '방문객이 키오스크에서 생년월일을 넣거나 얼굴·손바닥을 비추면 AI가 풀이를 만들고, 내장된 영수증형 프린터로 결과를 출력합니다. 사람이 몰리는 축제, 송년회, 기업 행사, 대학 축제에서 가볍게 줄을 세우는 체험입니다.' },
        { type: 'links', items: [
          { text: 'AI 사주 — 생년월일로 보는 사주 풀이', href: '/services/ai-fortune-robot' },
          { text: 'AI 관상 분석 — 얼굴로 보는 재미있는 관상 풀이', href: '/services/ai-face-reading' },
          { text: 'AI 손금 로봇 — 손바닥 속 운명 읽기', href: '/services/ai-palm-reading' },
          { text: 'AI 커플 케미 진단 — 두 사람의 궁합', href: '/services/ai-couple-chemistry' },
        ] },
        { type: 'p', text: '같은 키오스크로 AI 퍼스널 컬러, AI 미래직업, AI 연예인 닮은꼴, AI 캐리커처 같은 다른 체험도 운영할 수 있습니다.' },
        { type: 'h2', text: '대여 가격 (VAT 별도, 서울 기준)' },
        { type: 'table', head: ['항목', '금액'], rows: [
          ['키오스크 1대 · 1일', `${man(KIOSK.firstKiosk)} (기존 체험 1종·카메라·영수증형 프린터 내장·운반·설치 포함)`],
          [`키오스크 추가 (최대 ${KIOSK.maxKiosks}대)`, `대당 ${man(KIOSK.extraKiosk)}`],
          ['운영일 추가', `대당 1일 ${man(KIOSK.extraDayPerKiosk)}`],
          ['상시 운영 (매장·전시)', `대당 월 ${man(KIOSK.monthlyPerKiosk)}`],
          ['현장 운영 인력', `1인 1일 ${man(COMMON.staffPerDay)}`],
        ] },
        { type: 'p', text: `예: 서울 1일 행사에 AI 사주·AI 관상 키오스크 2대면 ${man(KIOSK.firstKiosk + KIOSK.extraKiosk)}, 운영 인력 1명을 더하면 ${man(KIOSK.firstKiosk + KIOSK.extraKiosk + COMMON.staffPerDay)}입니다(VAT 별도).` },
        { type: 'h2', text: '브랜드 맞춤 (1회 개발비)' },
        { type: 'table', head: ['범위', '금액', '확정 시점'], rows: [
          ['로고·색 등 브랜드 적용', man(CUSTOM_DEV.kiosk.brand), `행사 ${CUSTOM_DEV.leadDays.brand}일 전`],
          ['질문·결과 문구 등 콘텐츠 커스텀', man(CUSTOM_DEV.kiosk.content), `행사 ${CUSTOM_DEV.leadDays.content}일 전`],
          ['전용 체험 개발', `${man(CUSTOM_DEV.kiosk.dedicated)}부터`, `행사 ${CUSTOM_DEV.leadDays.dedicated}일 전`],
        ] },
        { type: 'h2', text: '전국 출장 — 운송비 (키오스크만 빌릴 때, 행사당 1회)' },
        { type: 'table', head: ['지역', '추가 운송비'], rows: travelRowsKo(KIOSK.travel) },
        { type: 'p', text: NO_ISLANDS_KO },
        { type: 'h2', text: '키오스크 운영 사례' },
        { type: 'links', items: [
          { text: '평택 AI 페스타 2026 (평택아트센터) — 방문객이 직접 조작하는 키오스크 체험 4종', href: '/portfolio/pyeongtaek-ai-festa-2026' },
        ] },
        { type: 'faq', items: [
          { q: '사주 키오스크 대여 비용은 얼마인가요?', a: `1대 1일 ${man(KIOSK.firstKiosk)}부터입니다(VAT 별도). 카메라와 영수증형 프린터가 내장돼 있고 운반·설치가 포함됩니다. 운영 인력은 1인 1일 ${man(COMMON.staffPerDay)}로 따로 받습니다.` },
          { q: '결과는 어떻게 받나요?', a: '키오스크에 내장된 영수증형 즉석 프린터로 결과를 출력해 바로 가져갈 수 있습니다. 프린터 비용은 따로 받지 않습니다.' },
          { q: '여러 대를 놓을 수 있나요?', a: `한 행사에 최대 ${KIOSK.maxKiosks}대까지 운영합니다. 사주·관상·손금처럼 키오스크마다 다른 체험을 놓을 수 있습니다.` },
          { q: '매장에 계속 둘 수 있나요?', a: `네, 상시 운영은 대당 월 ${man(KIOSK.monthlyPerKiosk)}입니다.` },
          { q: '설치 장소에 무엇이 필요한가요?', a: POWER_KO },
        ] },
        { type: 'cta', text: 'AI 키오스크 견적 바로 보기', href: '/quote' },
      ],
    },
    en: {
      title: 'AI Fortune-Telling Kiosk Rental (Saju, Face Reading, Palm Reading) for Events in Korea',
      description: `AI saju from a birth date, AI face reading and AI palm reading on a kiosk that prints each result on the spot. From ${krw(KIOSK.firstKiosk)} per kiosk per day (excl. VAT, delivery and setup included).`,
      blocks: [
        { type: 'p', text: 'Guests enter a birth date or show their face or palm; AI writes the reading and the built-in receipt printer prints it.' },
        { type: 'links', items: [
          { text: 'AI Saju', href: '/services/ai-fortune-robot' },
          { text: 'AI Face Reading', href: '/services/ai-face-reading' },
          { text: 'AI Palm Reading', href: '/services/ai-palm-reading' },
          { text: 'AI Couple Chemistry', href: '/services/ai-couple-chemistry' },
        ] },
        { type: 'h2', text: 'Rental prices (excl. VAT, Seoul)' },
        { type: 'table', head: ['Item', 'Price'], rows: [
          ['1 kiosk · 1 day', `${krw(KIOSK.firstKiosk)} (one existing experience, camera, built-in receipt printer, delivery and setup)`],
          [`Extra kiosk (up to ${KIOSK.maxKiosks})`, `${krw(KIOSK.extraKiosk)} each`],
          ['Extra day', `${krw(KIOSK.extraDayPerKiosk)} per kiosk`],
          ['Monthly placement', `${krw(KIOSK.monthlyPerKiosk)} per kiosk per month`],
          ['On-site staff', `${krw(COMMON.staffPerDay)} per person per day`],
        ] },
        { type: 'h2', text: 'Travel within Korea (kiosk-only orders, once per event)' },
        { type: 'table', head: ['Region', 'Extra'], rows: travelRowsEn(KIOSK.travel) },
        { type: 'p', text: `${NO_ISLANDS_EN} ${POWER_EN}` },
        { type: 'cta', text: 'Get an instant estimate', href: '/quote' },
      ],
    },
  },

  /* ── 기업 행사·송년회 체험 부스 ─────────────────────────── */
  {
    slug: 'corporate-year-end-event-ai-booth',
    kind: 'landing',
    // 2026-11-14 네이버 키워드 도구: 크리스마스행사 월 2,540회·연말행사 1,340회·기업행사 890회·송년회 이벤트 560회·창립기념행사 1,130회.
    // 송년회만 다루던 제목을 연말·크리스마스·시무식·창립기념까지 넓힌다. 주소는 검색엔진에 제출한 그대로 둔다.
    date: '2026-11-14',
    keywords: ['연말행사', '연말 이벤트', '송년회 이벤트', '크리스마스 행사', '크리스마스 이벤트 부스', '기업행사 이벤트', '시무식 이벤트', '신년회 이벤트', '창립기념행사', '사내 행사 이벤트', '기업 행사 포토부스'],
    ko: {
      title: '연말행사·송년회·크리스마스 행사 이벤트 — AI 체험 부스 출장 운영',
      description: `송년회·연말행사·크리스마스 행사·시무식·창립기념행사에서 참석자가 직접 해 보고 결과물을 가져가는 AI 체험. AI 포토부스, AI 사주·관상 키오스크, AI 향수 만들기를 장비와 운영 인력까지 함께 보내 드립니다. ${man(KIOSK.firstKiosk)}부터(VAT 별도).`,
      blocks: [
        { type: 'p', text: '연말 행사는 짧은 시간에 많은 사람이 지나가고, 참석자가 무언가를 들고 돌아가야 기억에 남습니다. 네안데르의 AI 체험은 모두 결과물(사진, 운세 풀이, 향수)을 그 자리에서 건네는 방식이라 송년회·크리스마스 파티의 대기 시간과 쉬는 시간을 채우기 좋습니다.' },
        { type: 'h2', text: '연말·연초 행사별 추천 구성' },
        { type: 'table', head: ['행사', '추천 체험', '이유'], rows: [
          ['송년회·사내 파티', 'AI 포토부스 + AI 사주·관상 키오스크', '연말 프레임을 씌운 단체 사진과 새해 운세를 출력해 가져갑니다'],
          ['크리스마스 행사·고객 초청', 'AI 포토부스 (크리스마스 프레임)', '기본 포함된 프레임 1종을 크리스마스 디자인으로 맞춥니다. 크리스마스 컨셉 AI 스타일도 새로 만들 수 있습니다'],
          ['시상식·VIP 초청', 'AI 향수 만들기 + 고급 선물 포장', '참석자마다 다른 향수를 기념품으로 건넵니다'],
          ['시무식·신년회', 'AI 사주 키오스크', '생년월일로 새해 운세를 풀어 영수증형 결과지로 출력합니다'],
          ['창립기념행사', '회사 맞춤 포토부스·키오스크', '로고·색·결과 문구를 회사에 맞게 바꿉니다'],
          ['워크숍·팀 빌딩', 'AI 향수 원데이 클래스', 'AI 추천 향을 시향하고 직접 조향하는 클래스로 진행합니다'],
        ] },
        { type: 'h2', text: '시작가 (VAT 별도, 서울 1일 기준)' },
        { type: 'table', head: ['체험', '시작가'], rows: [
          ['AI 사주·관상·손금 키오스크', `1대 ${man(KIOSK.firstKiosk)} (추가 1대 ${man(KIOSK.extraKiosk)})`],
          ['AI 포토부스', `1대 ${man(PHOTO_BOOTH.firstBooth)} (인화 ${PHOTO_BOOTH.printsPerRoll}장 포함)`],
          ['AI 향수 만들기', `${man(PERFUME.minimumCharge)}부터 (100명이면 10ml 1인 ${man(PERFUME.tiers[2].unit['10ml'])} + 조향 팀 출장비)`],
          ['현장 운영 인력', `1인 1일 ${man(COMMON.staffPerDay)}`],
        ] },
        { type: 'p', text: `예: 송년회에 AI 포토부스 1대와 AI 사주 키오스크 1대를 두고 운영 인력 1명을 쓰면 ${man(PHOTO_BOOTH.firstBooth + KIOSK.firstKiosk + COMMON.staffPerDay)}(VAT 별도)입니다. ${STAFF_KO}` },
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
      description: `AI photo booths, AI fortune-telling kiosks and AI perfume making for year-end parties, Christmas events, new-year kickoffs, anniversaries and company events, delivered with equipment and staff. From ${krw(KIOSK.firstKiosk)} (excl. VAT).`,
      blocks: [
        { type: 'p', text: 'Every NEANDER experience hands guests something to take home — a photo, a reading or a perfume — which makes it a good fit for the gaps in a corporate program.' },
        { type: 'h2', text: 'Starting prices (excl. VAT, Seoul, 1 day)' },
        { type: 'table', head: ['Experience', 'From'], rows: [
          ['AI fortune-telling kiosk', `${krw(KIOSK.firstKiosk)} per kiosk`],
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
    date: '2026-11-14',
    keywords: ['축제 체험 부스', '축제부스', '체험부스', '행사부스', '축제 부스 운영', '지역축제 체험 프로그램', '대학 축제 부스', '과학축제 체험', '축제 포토부스', 'AI 체험 부스'],
    ko: {
      title: '축제 체험 부스 운영 — 지역축제·과학축제·대학 축제 AI 체험 부스 출장',
      description: `지역축제·과학축제·대학 축제·영화제에 AI 포토부스, AI 사주·관상 키오스크, AI 향수 만들기 체험 부스를 장비와 운영 인력까지 함께 보내 드립니다. 키오스크 1대 1일 ${man(KIOSK.firstKiosk)}부터(VAT 별도), 전국 출장.`,
      blocks: [
        { type: 'p', text: '축제 체험 부스는 지나가던 방문객이 짧게 참여하고, 무언가를 들고 돌아가야 기억에 남습니다. 네안데르의 AI 체험은 사진·운세 풀이·향수처럼 결과물을 그 자리에서 건네는 방식이라 가족 방문객과 학생이 많은 축제에서 많이 운영합니다. 2026 안산사이언스밸리 과학축제의 AI 포토부스에는 이틀 동안 316팀(약 860명)이 참여했습니다.' },
        { type: 'h2', text: '축제에서 운영하는 AI 체험 부스' },
        { type: 'table', head: ['체험', '방문객이 하는 것 → 가져가는 것', '시작가 (VAT 별도, 1일)'], rows: [
          ['AI 포토부스', '사진을 찍고 AI 컨셉을 고릅니다 → 즉석 인화 사진·QR 저장', `1대 ${man(PHOTO_BOOTH.firstBooth)} (인화 ${PHOTO_BOOTH.printsPerRoll}장 포함)`],
          ['AI 키오스크 (사주·관상·손금·퍼스널컬러 등)', '생년월일을 넣거나 얼굴·손바닥을 비춥니다 → 영수증형 결과지', `1대 ${man(KIOSK.firstKiosk)}`],
          ['AI 향수 만들기', 'AI가 추천한 향으로 조향사와 향수를 만듭니다 → 내 향수 (10ml·50ml)', `${man(PERFUME.minimumCharge)}부터`],
        ] },
        { type: 'p', text: `예: 서울 1일 축제에 AI 포토부스 1대와 AI 사주 키오스크 1대를 두고 운영 인력 1명을 쓰면 ${man(PHOTO_BOOTH.firstBooth + KIOSK.firstKiosk + COMMON.staffPerDay)}(VAT 별도)입니다. 운영일을 더하면 포토부스는 대당 1일 ${man(PHOTO_BOOTH.extraDayPerBooth)}, 키오스크는 대당 1일 ${man(KIOSK.extraDayPerKiosk)}가 더해집니다.` },
        { type: 'links', items: [
          { text: '포토부스 대여 — 가격·진행 안내', href: '/insights/ai-photo-booth-rental' },
          { text: 'AI 사주·관상·손금 키오스크 대여 — 가격·진행 안내', href: '/insights/ai-fortune-kiosk-rental' },
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
      description: `AI photo booths, AI fortune-telling kiosks and AI perfume making for local festivals, science festivals, campus festivals and film festivals, delivered with equipment and staff. From ${krw(KIOSK.firstKiosk)} per kiosk per day (excl. VAT), anywhere in mainland Korea.`,
      blocks: [
        { type: 'p', text: 'Every NEANDER experience hands guests something to take home — a photo, a reading or a perfume. At the Ansan Science Valley Science Festival 2026, 316 groups (about 860 people) used our AI photo booth over two days.' },
        { type: 'h2', text: 'Booths we run at festivals (excl. VAT, 1 day)' },
        { type: 'table', head: ['Experience', 'From'], rows: [
          ['AI photo booth', `${krw(PHOTO_BOOTH.firstBooth)} per booth (${PHOTO_BOOTH.printsPerRoll} prints)`],
          ['AI kiosk (saju, face reading, palm reading, personal color…)', `${krw(KIOSK.firstKiosk)} per kiosk`],
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
];
