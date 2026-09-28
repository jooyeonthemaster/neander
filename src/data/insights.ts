/* ─────────────────────────────────────────────────────────
   NEANDERco.  |  Insights (SEO articles & keyword landings)
   Facts only from: src/data/pricing.ts, experiences.ts,
   demo-registry.ts, portfolio-catalog.json, privacy-policy.ts,
   messages/ko.json. Do not add numbers without a source.
   ───────────────────────────────────────────────────────── */

export type InsightBlock =
  | { type: 'h2'; text: string }
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'table'; head: string[]; rows: string[][] }
  | { type: 'cta'; text: string; href: string };

export interface InsightCopy {
  title: string;
  description: string;
  blocks: InsightBlock[];
}

export interface Insight {
  slug: string;
  kind: 'article' | 'landing';
  date: string;
  keywords: string[];
  ko: InsightCopy;
  en: InsightCopy;
}

const CREDENTIALS_KO = [
  '화장품책임판매업 등록 제42812호 (2024-01-24, 서울지방식품의약품안전청)',
  '방향제 안전기준 적합확인 신고 HB24-12-2355 (일반용·섬유용, 분무기형, 2024-12)',
  '방향제 안전기준 적합확인 신고 HB23-12-1949 (실내공간용·자동차용, 함침물형, 2023-12)',
  '향료 30종 운영',
];

const CREDENTIALS_EN = [
  'Cosmetics Distributor (책임판매업) registration No. 42812 (2024-01-24, Seoul Regional Office of Food and Drug Safety)',
  'Air freshener safety-standard conformity report HB24-12-2355 (general & fabric use, spray type, 2024-12)',
  'Air freshener safety-standard conformity report HB23-12-1949 (indoor & car use, impregnated type, 2023-12)',
  '30 fragrance ingredients in operation',
];

export const INSIGHTS: Insight[] = [
  /* 1 ── Cost guide ─────────────────────────────────────── */
  {
    slug: 'event-ai-experience-cost-guide-2026',
    kind: 'article',
    date: '2026-09-26',
    keywords: ['행사 AI 체험 비용', 'AI 포토부스 대여 비용', '행사 체험 부스 견적', 'AI 체험 렌탈 가격', '팝업 체험 콘텐츠 비용'],
    ko: {
      title: '2026 행사 AI 체험 비용 가이드',
      description: '행사·팝업 AI 체험 비용은 기간, 규모, 커스텀 범위, 출력물, 운영 인력, 설치 조건으로 달라집니다. 항목별 기준과 네안데르 공개 시작가를 정리했습니다.',
      blocks: [
        { type: 'p', text: '행사 AI 체험의 견적은 “부스 하나에 얼마”로 정해지지 않습니다. 같은 체험이라도 운영 조건에 따라 금액이 달라집니다. 견적을 요청하기 전에 아래 항목을 먼저 정리하면 비교가 쉬워집니다.' },
        { type: 'h2', text: '비용을 결정하는 6가지 요소' },
        {
          type: 'ul',
          items: [
            '기간: 장비·운영비는 운영일만큼 더해지고, 콘텐츠 제작비·시공비는 한 번만 듭니다. 1일 기본 운영은 6시간입니다.',
            '규모(대수·인원): 예상 방문객과 시간당 처리 인원에 맞춰 부스 수, 장비, 인력을 정합니다.',
            '커스텀 범위: 브랜드 프레임, 전용 스타일, 전용 콘텐츠를 새로 만들수록 제작 비용이 추가됩니다.',
            '출력물: QR 다운로드만 할지, 즉석 인화나 포토카드를 출력할지에 따라 달라집니다.',
            '운영 인력: 현장 스태프 수와 운영 시간(연장 운영 포함)이 반영됩니다.',
            '지역·설치: 행사 장소, 설치·철수 일정, 공간 규모에 따라 운송·설치 비용이 달라집니다.',
          ],
        },
        { type: 'h2', text: '네안데르 서비스별 공개 시작가' },
        { type: 'p', text: '아래는 옵션을 최소로 고른 기본 구성의 시작가입니다. 모두 VAT 별도, 수도권 기준이며 온라인 견적에서 조건별 금액을 바로 확인할 수 있습니다.' },
        {
          type: 'table',
          head: ['서비스', '시작가'],
          rows: [
            ["AI 향수 체험 (AC'SCENT)", '99만원부터 (최소 금액 · 10ml 32명까지 · 조향 1팀 출장비 포함)'],
            ['AI 포토부스', '120만원부터 (1일·AI 스타일 2종·인화 700장·운송·설치 포함, 운영 인력 별도)'],
            ['AI 키오스크', '89만원부터 (1일·기존 체험 1종 그대로·카메라·운반·설치 포함, 운영 인력 별도)'],
            ['공간 디자인', '400만원부터 (부스 3×3m)'],
            ['인터랙티브 미디어 아트', '580만원부터 (제작 500만 + 1일 운영 80만)'],
            ['커스텀 AI 콘텐츠', '800만원부터 (웹·미디어·대형 콘텐츠 신규 개발·1회 개발비)'],
          ],
        },
        { type: 'h2', text: '주요 옵션 가격' },
        {
          type: 'ul',
          items: [
            'AI 향수 체험 1인 단가: 10ml 2만 / 1.8만 / 1.5만원, 50ml 4.5만 / 4만 / 3.5만원 (20~49명 / 50~99명 / 100명 이상)',
            'AI 향수 체험 조향 1팀(2인) 출장비: 수도권 35만 · 충청·강원 영서 45만 · 전라·경상·강원 영동 55만원, 팀 추가 시 1팀당 동일. 최소 금액 99만원(수도권)',
            'AI 포토부스: 부스 추가 1대당 +110만원(최대 3대), 추가 운영일 대당 +60만원, AI 스타일 추가 1종당 +20만원, 인화 1롤(700장) 추가 +20만원',
            'AI 키오스크: 키오스크 추가 1대당 +30만원(최대 4대), 추가 운영일 대당 +20만원, 즉석 프린터 +10만원, 상시 운영 대당 월 200만원',
            '포토부스·키오스크 커스텀 개발(1회): 키오스크 브랜드 적용 20만 · 콘텐츠 커스텀 150만 · 전용 체험 500만원부터, 포토부스 전용 AI 스타일 1종 50만 · 촬영 흐름·화면 150만 · 전용 AI 기능 500만원부터. 준비 기간보다 촉박하면 긴급 제작 +30%',
            '현장 운영 인력 1인 1일 30만원, 전날 사전 설치 +30만원(2인), 기본 6시간 초과 시간당 5만원, 지방 운송비 충청·강원 영서 +10만원 · 전라·경상·강원 영동 +30만원, AI 키오스크만이면 +10만원 / +20만원 (제주 및 도서 지역은 운영하지 않음)',
          ],
        },
        { type: 'p', text: '온라인 견적에서 인원·기간·지역을 넣으면 연락처 없이 바로 금액을 볼 수 있고, 내부 결재용 가견적서 PDF도 받을 수 있습니다.' },
        { type: 'cta', text: '온라인 견적 바로 받기', href: '/quote' },
      ],
    },
    en: {
      title: '2026 Event AI Experience Cost Guide',
      description: 'What drives event AI experience pricing, plus Neander’s public starting prices by service.',
      blocks: [
        { type: 'p', text: 'An event AI experience is not priced as a flat “per booth” fee. The same experience can cost differently depending on operating conditions. Clarify the items below before requesting quotes so they are easy to compare.' },
        { type: 'h2', text: 'Six factors that drive cost' },
        {
          type: 'ul',
          items: [
            'Duration: equipment and operation add up per day, while content production and build are charged once. A day includes 6 operating hours.',
            'Scale (units and visitors): booths, equipment and staff are sized to expected visitors and hourly throughput.',
            'Customization: new brand frames, dedicated styles or bespoke content add production cost.',
            'Outputs: QR download only, instant prints or photo cards.',
            'Staffing: number of on-site staff and operating hours, including extensions.',
            'Location and setup: venue, install/teardown schedule and space size affect transport and setup cost.',
          ],
        },
        { type: 'h2', text: 'Neander public starting prices' },
        { type: 'p', text: 'Starting prices with minimum options, excluding VAT, Seoul metro area. The online estimate shows exact prices for your conditions.' },
        {
          type: 'table',
          head: ['Service', 'Starting price'],
          rows: [
            ["AI Perfume Experience (AC'SCENT)", 'From KRW 990,000 (minimum charge, up to 32 guests with 10ml, perfumer team travel)'],
            ['AI Photo Booth', 'From KRW 1,200,000 (1 day, 2 AI styles, 700 prints, delivery & setup; staff not included)'],
            ['AI Kiosk', 'From KRW 890,000 (1 day, 1 existing experience as-is, camera, delivery & setup; staff not included)'],
            ['Space Design', 'From KRW 4,000,000 (3×3m booth)'],
            ['Interactive Media Art', 'From KRW 5,800,000 (production 5M + 1 day operation 800K)'],
            ['Custom AI Content', 'From KRW 8,000,000 (new web, media or large-scale content, one-time)'],
          ],
        },
        { type: 'h2', text: 'Key option prices' },
        {
          type: 'ul',
          items: [
            'AI Perfume per guest: 10ml KRW 20,000 / 18,000 / 15,000; 50ml KRW 45,000 / 40,000 / 35,000 (20–49 / 50–99 / 100+ guests)',
            'AI Perfume team travel (perfumer + assistant): Seoul metro KRW 350,000, Chungcheong/West Gangwon 450,000, Jeolla/Gyeongsang/East Gangwon 550,000 per team. Minimum charge KRW 990,000 (Seoul metro)',
            'AI Photo Booth: +KRW 1,100,000 per extra booth (up to 3), +KRW 600,000 per booth per extra day, +KRW 200,000 per extra AI style, +KRW 200,000 per extra 700-print roll',
            'AI Kiosk: +KRW 300,000 per extra kiosk (up to 4), +KRW 200,000 per kiosk per extra day, instant printer +KRW 100,000, ongoing operation KRW 2,000,000 per kiosk per month',
            'Photo booth and kiosk custom development (one-time): kiosk branding KRW 200K, content customization KRW 1.5M, dedicated experience from KRW 5M; photo booth dedicated AI style KRW 500K each, flow and screens KRW 1.5M, dedicated AI feature from KRW 5M. Rush production +30% when the lead time is short',
            'On-site staff KRW 300,000 per person per day; setup the day before +KRW 300,000 (2 people); KRW 50,000 per hour beyond 6 hours; regional transport +KRW 100,000 (Chungcheong/West Gangwon) or +KRW 300,000 (Jeolla/Gyeongsang/East Gangwon), kiosk only +KRW 100,000 / 200,000; no service on Jeju or other islands',
          ],
        },
        { type: 'p', text: 'Enter guests, days and region in the online estimate to see the price without signing up, and download an estimate PDF for internal approval.' },
        { type: 'cta', text: 'Get an online estimate', href: '/quote' },
      ],
    },
  },

  /* 2 ── Popup booth checklist ──────────────────────────── */
  {
    slug: 'popup-experience-booth-checklist',
    kind: 'article',
    date: '2026-09-26',
    keywords: ['팝업스토어 체험 부스', '팝업 체험 콘텐츠', '브랜드 팝업 부스 기획', '행사 체험존 체크리스트', 'AI 포토부스 팝업'],
    ko: {
      title: '팝업스토어 체험 부스 고르는 법: 7가지 체크리스트',
      description: '처리 인원, 설치 조건, 결과물, 브랜드 커스텀, 사진 데이터 처리, 운영 인력, 대기 동선까지. 팝업 체험 부스를 고를 때 확인할 항목을 정리했습니다.',
      blocks: [
        { type: 'p', text: '팝업스토어 체험 부스는 “재미있어 보이는가”보다 “현장에서 막힘없이 돌아가는가”가 성패를 가릅니다. 업체와 상담하기 전에 아래 7가지를 확인하십시오.' },
        { type: 'h2', text: '1. 1인 소요 시간과 시간당 처리 인원' },
        { type: 'p', text: '체험 1회에 걸리는 시간과 시간당 처리 가능한 인원을 먼저 물어보십시오. 예상 방문객 수와 비교해 부스 수나 인력을 늘려야 하는지 판단할 수 있습니다.' },
        { type: 'h2', text: '2. 설치 공간·전원·인터넷' },
        { type: 'p', text: '필요 면적, 콘센트 위치와 용량, 인터넷 환경을 확인합니다. 네안데르의 AI 체험은 클라우드 AI를 사용하므로 모든 체험에 전원과 인터넷 연결이 필요합니다. 현장 인터넷 사정을 미리 공유해 주시면 대응 방안을 함께 정합니다.' },
        { type: 'h2', text: '3. 결과물: 출력인가, QR인가' },
        { type: 'p', text: '즉석 인화·포토카드처럼 손에 쥐는 결과물은 기념 효과가 크고, QR 다운로드는 SNS 공유에 유리합니다. 출력 방식에 따라 비용과 대기 시간이 달라지므로 목적에 맞게 고릅니다.' },
        { type: 'h2', text: '4. 브랜드 커스텀 범위' },
        { type: 'p', text: '로고·프레임만 바꾸는지, 전용 스타일이나 콘텐츠를 새로 만드는지 범위를 구분하십시오. 범위가 넓을수록 제작 일정이 길어집니다.' },
        { type: 'h2', text: '5. 얼굴·사진 데이터 처리 방침' },
        {
          type: 'ul',
          items: [
            '촬영 사진을 어디에, 얼마나 보관하는지 확인합니다.',
            '네안데르 웹사이트 체험 데모의 사진은 결과 생성에만 쓰고 서버에 저장하지 않습니다.',
            '행사 현장 부스 사진의 보관 기간과 파기 방법은 주최 고객사와 협의해 계약서에 명시하고, 현장에서 참가자에게 안내합니다.',
          ],
        },
        { type: 'h2', text: '6. 현장 운영 인력' },
        { type: 'p', text: '장비만 대여하는지, 운영 스태프가 함께 오는지 확인합니다. 체험 안내, 장비 이상 대응, 출력물 관리까지 누가 맡는지 정해 두어야 합니다.' },
        { type: 'h2', text: '7. 대기 동선' },
        { type: 'p', text: '대기 줄이 매장 동선이나 다른 존을 막지 않는지 도면에서 미리 확인합니다. 대기 공간, 안내물, 결과물 수령 위치를 함께 설계하면 혼잡을 줄일 수 있습니다.' },
        { type: 'cta', text: '팝업에 맞는 AI 체험 둘러보기', href: '/services' },
      ],
    },
    en: {
      title: 'How to Choose a Pop-up Experience Booth: 7-Point Checklist',
      description: 'Seven things to check before booking a pop-up experience booth, from throughput to photo data.',
      blocks: [
        { type: 'p', text: 'A pop-up experience booth succeeds less on how fun it looks and more on whether it runs smoothly on site. Check these seven points before talking to vendors.' },
        { type: 'h2', text: '1. Time per person and hourly throughput' },
        { type: 'p', text: 'Ask how long one session takes and how many people can be served per hour. Compare with expected traffic to decide whether you need more booths or staff.' },
        { type: 'h2', text: '2. Space, power and internet' },
        { type: 'p', text: 'Confirm floor area, outlet location and capacity, and internet. Neander AI experiences use cloud AI, so every experience needs power and an internet connection. Share on-site network conditions early so we can plan together.' },
        { type: 'h2', text: '3. Outputs: print or QR' },
        { type: 'p', text: 'Instant prints and photo cards make strong keepsakes; QR downloads are better for social sharing. The choice affects cost and wait time, so match it to your goal.' },
        { type: 'h2', text: '4. Brand customization scope' },
        { type: 'p', text: 'Distinguish between swapping logos and frames and building dedicated styles or content. Wider scope means a longer production schedule.' },
        { type: 'h2', text: '5. Face and photo data policy' },
        {
          type: 'ul',
          items: [
            'Ask where captured photos are stored and for how long.',
            'Photos taken in Neander website demos are used only to generate results and are not stored on our servers.',
            'For on-site booths, photo retention and deletion are agreed with the host client, written into the contract, and explained to participants on site.',
          ],
        },
        { type: 'h2', text: '6. On-site staff' },
        { type: 'p', text: 'Check whether you are renting equipment only or getting operating staff as well. Decide who handles guiding guests, equipment issues and printed outputs.' },
        { type: 'h2', text: '7. Queue flow' },
        { type: 'p', text: 'Check on the floor plan that the queue will not block store traffic or other zones. Planning waiting space, signage and pickup points together reduces congestion.' },
        { type: 'cta', text: 'Browse AI experiences for pop-ups', href: '/services' },
      ],
    },
  },

  /* 3 ── Perfume regulation ─────────────────────────────── */
  {
    slug: 'event-perfume-experience-regulation',
    kind: 'article',
    date: '2026-09-26',
    keywords: ['행사 향수 배포', '향수 체험 인허가', '화장품책임판매업', '방향제 안전기준 적합확인', '조향 체험 행사 업체'],
    ko: {
      title: '행사에서 향수·방향제를 나눠 주려면: 인허가 체크리스트',
      description: '행사에서 맞춤 향수나 방향제를 판매·증정할 때 일반적으로 확인할 화장품책임판매업, 방향제 안전기준 적합확인, 표시 사항을 정리했습니다.',
      blocks: [
        { type: 'p', text: '행사 기념품으로 맞춤 향수나 방향제를 나눠 주는 사례가 늘고 있습니다. 다만 향 제품은 유형에 따라 관련 제도가 다르므로, 기획 단계에서 운영 업체의 자격을 확인하는 것이 좋습니다. 아래 내용은 일반적인 안내이며 법률 자문이 아닙니다.' },
        { type: 'h2', text: '향수: 화장품책임판매업' },
        { type: 'p', text: '향수는 일반적으로 화장품으로 분류됩니다. 화장품을 유통·판매하려면 화장품책임판매업 등록이 필요한 경우가 많습니다. 무료 증정이라도 제품 형태나 유통 방식에 따라 적용 여부가 달라질 수 있습니다.' },
        { type: 'h2', text: '방향제: 생활화학제품 안전기준 적합확인' },
        { type: 'p', text: '실내·섬유·자동차용 방향제는 일반적으로 생활화학제품으로 관리되며, 제품 유형별로 안전기준 적합확인 신고가 필요할 수 있습니다. 분무형, 함침형 등 형태와 용도에 따라 신고 범위가 다릅니다.' },
        { type: 'h2', text: '표시 사항' },
        {
          type: 'ul',
          items: [
            '전성분 표시',
            '알레르기 유발 가능 성분 표기',
            '제품 유형에 따라 요구되는 기타 표시 사항',
          ],
        },
        { type: 'h2', text: '기획 전 확인할 것' },
        {
          type: 'ul',
          items: [
            '나눠 줄 제품이 향수(화장품)인지 방향제(생활화학제품)인지 구분',
            '판매인지 증정인지, 현장 조향인지 사전 제작인지 구분',
            '운영 업체의 등록·신고 번호와 신고된 제품 유형이 행사 제품과 맞는지 확인',
            '세부 기준은 식약처·환경부 안내 또는 전문가를 통해 확인',
          ],
        },
        { type: 'h2', text: "네안데르(AC'SCENT)의 등록·신고 현황" },
        { type: 'ul', items: CREDENTIALS_KO },
        { type: 'p', text: '행사 제품의 유형과 배포 방식에 맞는 구성은 상담 단계에서 함께 검토합니다.' },
        { type: 'cta', text: 'AI 조향 체험 자세히 보기', href: '/services/ai-scent-soulmate' },
      ],
    },
    en: {
      title: 'Giving Away Perfume or Fresheners at Events: A Permit Checklist',
      description: 'Registrations, safety reports and labeling to check before giving away perfume or fresheners at Korean events.',
      blocks: [
        { type: 'p', text: 'Custom perfume and fresheners are increasingly used as event giveaways. Because the applicable rules differ by product type, it is worth checking the operator’s credentials at the planning stage. This is general information, not legal advice.' },
        { type: 'h2', text: 'Perfume: Cosmetics Distributor registration' },
        { type: 'p', text: 'Perfume is generally classified as a cosmetic in Korea. Distributing or selling cosmetics often requires Cosmetics Distributor (화장품책임판매업) registration. Whether it applies to free giveaways can depend on the product and distribution method.' },
        { type: 'h2', text: 'Air fresheners: safety-standard conformity report' },
        { type: 'p', text: 'Room, fabric and car fresheners are generally managed as household chemical products, and a safety-standard conformity report may be required per product type. The scope differs by form (spray, impregnated, etc.) and use.' },
        { type: 'h2', text: 'Labeling' },
        {
          type: 'ul',
          items: [
            'Full ingredient list',
            'Potential allergens',
            'Other labeling required for the product type',
          ],
        },
        { type: 'h2', text: 'Before you plan' },
        {
          type: 'ul',
          items: [
            'Is the item a perfume (cosmetic) or a freshener (household chemical product)?',
            'Is it sold or given away; blended on site or made in advance?',
            'Do the operator’s registration/report numbers and product types match your item?',
            'Confirm details with MFDS / Ministry of Environment guidance or a specialist.',
          ],
        },
        { type: 'h2', text: "Neander (AC'SCENT) registrations and reports" },
        { type: 'ul', items: CREDENTIALS_EN },
        { type: 'p', text: 'We review the right setup for your product type and distribution method during consultation.' },
        { type: 'cta', text: 'See the AI fragrance experience', href: '/services/ai-scent-soulmate' },
      ],
    },
  },

  /* 4 ── Landing: AI perfume experience ─────────────────── */
  {
    slug: 'event-ai-perfume-experience',
    kind: 'landing',
    date: '2026-09-26',
    keywords: ['행사 AI 조향 체험', 'AI 향수 체험', '조향 체험 부스', '팝업 향수 만들기', '축제 조향 체험', "AC'SCENT"],
    ko: {
      title: "행사 AI 조향 체험 (AC'SCENT)",
      description: 'AI가 취향·이미지를 분석해 향을 추천하고, 조향사가 현장에서 향수를 만들어 드립니다. 행사 렌탈과 월 단위 상시 운영이 가능합니다.',
      blocks: [
        { type: 'p', text: "AC'SCENT AI 조향 체험은 AI가 방문객의 취향과 이미지를 분석해 향을 추천하고, 조향사가 현장에서 그 향으로 향수를 만들어 드리는 체험입니다. 방문객은 자신만의 향수를 기념품으로 가져갑니다." },
        { type: 'h2', text: '규모 가이드' },
        {
          type: 'table',
          head: ['구성', '시간당 체험 인원'],
          rows: [
            ['조향 1팀 (조향사 1 + 조수 1, 기본)', '약 20명'],
            ['조향 2팀', '약 40명'],
            ['조향 3팀', '약 60명'],
          ],
        },
        { type: 'h2', text: '등록·신고' },
        { type: 'ul', items: CREDENTIALS_KO },
        { type: 'h2', text: '운영 경험' },
        {
          type: 'ul',
          items: [
            '2025년 생일카페·팬 이벤트 150건 운영',
            "직영 매장 2곳: 홍대 AC'SCENT ID, AC'SCENT WOW",
            '제천국제음악영화제 2026 — OST페어 체험 프로그램',
            '제천국제음악영화제 2025 — AI 조향사 부스',
            '엔플라잉 〈into REM〉 — 공식 향 MD',
            '서울국제작가축제 — AI 북퍼퓸 전시',
          ],
        },
        { type: 'h2', text: '운영 방식' },
        {
          type: 'ul',
          items: [
            '행사 렌탈(단기): 축제·팝업·기업 행사 기간에 맞춰 운영',
            '상시 운영(월 단위): 매장·전시 공간에 월 단위로 운영',
          ],
        },
        { type: 'cta', text: '조향 체험 견적 요청하기', href: '/quote' },
      ],
    },
    en: {
      title: "AI Perfume Experience for Events (AC'SCENT)",
      description: 'AI recommends a scent from taste and image; a perfumer blends it on site. Event rental or monthly operation.',
      blocks: [
        { type: 'p', text: "The AC'SCENT AI perfume experience uses AI to analyze a visitor’s taste and image and recommend a scent, which a perfumer then blends into a perfume on site. Visitors take home their own perfume." },
        { type: 'h2', text: 'Scale guide' },
        {
          type: 'table',
          head: ['Setup', 'Visitors per hour'],
          rows: [
            ['1 team (perfumer + assistant, base)', 'About 20'],
            ['2 teams', 'About 40'],
            ['3 teams', 'About 60'],
          ],
        },
        { type: 'h2', text: 'Registrations and reports' },
        { type: 'ul', items: CREDENTIALS_EN },
        { type: 'h2', text: 'Track record' },
        {
          type: 'ul',
          items: [
            '150 birthday-café and fan events operated in 2025',
            "Two directly operated stores in Hongdae: AC'SCENT ID and AC'SCENT WOW",
            'JIMFF 2026 — OST Fair Experience Program',
            'JIMFF 2025 — AI Perfumer Booth',
            'N.Flying 〈into REM〉 — Official Fragrance Merchandise',
            'Seoul International Writers’ Festival — AI Book Perfume',
          ],
        },
        { type: 'h2', text: 'Engagement types' },
        {
          type: 'ul',
          items: [
            'Event rental (short-term): for festivals, pop-ups and corporate events',
            'Ongoing operation (monthly): in stores or exhibition spaces',
          ],
        },
        { type: 'cta', text: 'Request a quote', href: '/quote' },
      ],
    },
  },

  /* 5 ── Landing: AI experience content ─────────────────── */
  {
    slug: 'event-ai-experience-content',
    kind: 'landing',
    date: '2026-09-26',
    keywords: ['행사 AI 체험 콘텐츠', '팝업 AI 체험', 'AI 체험 부스 렌탈', '축제 체험 콘텐츠', '기업 행사 AI 이벤트'],
    ko: {
      title: '행사·팝업 AI 체험 콘텐츠',
      description: 'AI 포토·진단·포춘·크리에이티브·이머시브 5개 분야 41개 체험. 모두 웹 데모로 먼저 해 보고 행사 렌탈이나 월 단위 상시 운영으로 도입할 수 있습니다.',
      blocks: [
        { type: 'p', text: '네안데르는 행사·팝업·축제·기업 행사에 맞는 AI 체험 콘텐츠를 기획하고 현장 운영까지 맡습니다. 41개 체험 모두 웹 데모가 있어 예약 전에 직접 해 볼 수 있습니다.' },
        { type: 'h2', text: '5가지 체험 분야' },
        {
          type: 'table',
          head: ['분야', '내용'],
          rows: [
            ['AI 포토 체험', 'AI 이미지 생성·합성 기술로 방문자를 특별한 모습으로 변신시키는 포토 체험'],
            ['AI 진단 체험', '컴퓨터 비전과 AI 분석으로 개인 맞춤 진단 결과를 제공하는 체험'],
            ['AI 포춘 체험', 'AI가 사주, 관상, 손금, 오라 등을 분석하여 재미있는 운세를 제공하는 엔터테인먼트 체험'],
            ['AI 크리에이티브 체험', 'AI가 방문자를 위해 유일한 창작물(레시피, 디자인, 음악 등)을 생성하는 체험'],
            ['AI 이머시브 체험', '프로젝션 맵핑, 대형 LED, 인터랙티브 설치 등으로 공간 전체를 AI 체험으로 만드는 대규모 콘텐츠'],
          ],
        },
        { type: 'h2', text: '진행 과정' },
        {
          type: 'ul',
          items: [
            '기획 & 컨설팅: 브랜드에 맞는 AI 체험을 기획합니다.',
            '콘텐츠 개발: 맞춤 AI 콘텐츠를 개발합니다.',
            '공간 설계 & 설치: 체험에 맞는 공간을 설계하고 장비를 설치합니다.',
            '현장 운영: 행사 현장 운영까지 책임집니다.',
          ],
        },
        { type: 'h2', text: '운영 방식' },
        {
          type: 'ul',
          items: [
            '행사 렌탈: 행사 기간에 맞춰 단기로 운영합니다.',
            '상시 운영(월 단위): 매장·전시 공간에 월 단위로 운영합니다.',
          ],
        },
        { type: 'p', text: '모든 AI 체험은 클라우드 AI를 사용하므로 현장에 전원과 인터넷이 필요합니다.' },
        { type: 'cta', text: '41개 체험과 웹 데모 보기', href: '/services' },
        { type: 'cta', text: '견적 요청하기', href: '/quote' },
      ],
    },
    en: {
      title: 'AI Experience Content for Events and Pop-ups',
      description: '41 AI experiences in 5 categories, each with a web demo to try before booking for your event or pop-up.',
      blocks: [
        { type: 'p', text: 'Neander plans AI experience content for events, pop-ups, festivals and corporate events, and runs it on site. All 41 experiences have web demos you can try before booking.' },
        { type: 'h2', text: 'Five categories' },
        {
          type: 'table',
          head: ['Category', 'What it is'],
          rows: [
            ['AI Photo Experience', 'Photo experiences that transform visitors using AI image generation and compositing'],
            ['AI Diagnosis Experience', 'Personalized diagnosis results using computer vision and AI analysis'],
            ['AI Fortune Experience', 'Entertainment where AI reads fortune, face, palm, aura and more'],
            ['AI Creative Experience', 'AI generates a unique creation (recipe, design, music, etc.) for each visitor'],
            ['AI Immersive Experience', 'Large-scale content using projection mapping, LED displays and interactive installations'],
          ],
        },
        { type: 'h2', text: 'How it runs' },
        {
          type: 'ul',
          items: [
            'Planning & Consulting: we plan AI experiences tailored to your brand.',
            'Content Development: we develop custom AI content.',
            'Space Design & Installation: we design the space and install equipment.',
            'On-site Operations: we run the experience on site.',
          ],
        },
        { type: 'h2', text: 'Engagement types' },
        {
          type: 'ul',
          items: [
            'Event rental: short-term, matched to your event dates.',
            'Ongoing operation (monthly): in stores or exhibition spaces.',
          ],
        },
        { type: 'p', text: 'All AI experiences use cloud AI, so power and internet are required on site.' },
        { type: 'cta', text: 'See all 41 experiences and demos', href: '/services' },
        { type: 'cta', text: 'Request a quote', href: '/quote' },
      ],
    },
  },
];

export function getInsight(slug: string): Insight | undefined {
  return INSIGHTS.find((i) => i.slug === slug);
}
