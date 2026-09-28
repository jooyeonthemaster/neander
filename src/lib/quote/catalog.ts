/**
 * 온라인 견적 가격표 (2026-09 확정 권장가)
 *
 * 화면(/quote), 가견적서 PDF(/api/quote-pdf), 서비스 페이지의 시작가가 모두 이 파일을 쓴다.
 * 금액은 모두 원(KRW), VAT 별도, 수도권 기준. 가격을 바꿀 때는 이 파일만 고친다.
 */

export type Lang = 'ko' | 'en';
export type ServiceKey = 'acscent' | 'photoBooth' | 'rental' | 'mediaArt' | 'spatialDesign' | 'custom';
export type RegionKey = 'capital' | 'central' | 'south';

type Text = Record<Lang, string>;

export const SERVICE_ORDER: ServiceKey[] = ['acscent', 'photoBooth', 'rental', 'spatialDesign', 'mediaArt', 'custom'];

export const SERVICE_TEXT: Record<ServiceKey, { name: Text; summary: Text }> = {
  acscent: {
    name: { ko: 'AI 향수 체험', en: 'AI Perfume Experience' },
    summary: {
      ko: "AI가 취향·이미지를 분석해 향을 추천하고 조향사가 현장에서 향수를 만들어 건넵니다 (AC'SCENT). 분석은 QR 웹 분석이 기본이며 분석용 키오스크를 더할 수 있습니다.",
      en: "AI recommends a scent from each guest's taste and image; a perfumer blends it on site (AC'SCENT). Analysis runs on guests' phones via QR by default; analysis kiosks are optional.",
    },
  },
  photoBooth: {
    name: { ko: 'AI 포토부스', en: 'AI Photo Booth' },
    summary: {
      ko: 'AI가 방문객 사진을 원하는 스타일로 바꿔 즉석 인화·QR로 건넵니다. 현장 운영 인력은 별도입니다.',
      en: 'AI restyles guest photos, delivered as instant prints and QR downloads. On-site staff is extra.',
    },
  },
  rental: {
    name: { ko: 'AI 키오스크', en: 'AI Kiosk' },
    summary: {
      ko: '관상·운세·퍼스널컬러 등 41종 AI 체험 중 하나를 그대로 키오스크로 운영합니다. 현장 운영 인력은 별도입니다.',
      en: 'Run one of 41 AI experiences (face reading, fortune, personal color…) as-is on a kiosk. On-site staff is extra.',
    },
  },
  spatialDesign: {
    name: { ko: '공간 디자인', en: 'Space Design' },
    summary: {
      ko: '체험이 들어갈 부스·팝업 공간의 디자인과 시공·철수입니다.',
      en: 'Design, build and teardown of the booth or pop-up space.',
    },
  },
  mediaArt: {
    name: { ko: '인터랙티브 미디어 아트', en: 'Interactive Media Art' },
    summary: {
      ko: '움직임·소리·터치에 반응하는 미디어 아트. 콘텐츠 제작비와 운영비를 나눠 계산합니다.',
      en: 'Media art that reacts to movement, sound and touch. Production and operation are priced separately.',
    },
  },
  custom: {
    name: { ko: '커스텀 AI 콘텐츠', en: 'Custom AI Content' },
    summary: {
      ko: '포토부스·키오스크와 별개인 웹·미디어·대형 AI 콘텐츠를 새로 기획·개발합니다 (1회 개발비).',
      en: 'New web, media or large-scale AI content, separate from photo booths and kiosks (one-time development).',
    },
  },
};

export const REGIONS: { key: RegionKey; label: Text }[] = [
  { key: 'capital', label: { ko: '수도권', en: 'Seoul metro' } },
  { key: 'central', label: { ko: '충청·강원 영서', en: 'Chungcheong / West Gangwon' } },
  { key: 'south', label: { ko: '전라·경상·강원 영동', en: 'Jeolla / Gyeongsang / East Gangwon' } },
];

/** 제주 등 도서 지역은 운영하지 않는다 (견적 화면·가견적서·가격 안내에 표시) */
/** 가견적서 안내 — 견적 화면·가견적서 페이지·PDF에 모두 넣는다 */
export const ESTIMATE_DISCLAIMER: Text = {
  ko: '가견적서는 참고용으로만 사용해 주세요. 행사 일정·장소·현장 조건에 따라 금액이 달라질 수 있으며, 실제 견적은 상담 후 확정됩니다.',
  en: 'This estimate is for reference only. Prices may change with your schedule, venue and site conditions; the final quote is confirmed after consultation.',
};

export const REGION_NOTE: Text = {
  ko: '제주 및 도서 지역은 운영하지 않습니다.',
  en: 'We do not operate on Jeju or other islands.',
};

export const EVENT_TYPES: { key: string; label: Text }[] = [
  { key: 'popup', label: { ko: '브랜드 팝업', en: 'Brand pop-up' } },
  { key: 'festival', label: { ko: '축제', en: 'Festival' } },
  { key: 'exhibition', label: { ko: '전시·박람회', en: 'Exhibition / fair' } },
  { key: 'corporate', label: { ko: '기업 행사', en: 'Corporate event' } },
  { key: 'campus', label: { ko: '대학 행사', en: 'Campus event' } },
  { key: 'public', label: { ko: '공공·관광 행사', en: 'Public / tourism event' } },
  { key: 'fan', label: { ko: '팬 이벤트·공연', en: 'Fan event / concert' } },
  { key: 'other', label: { ko: '기타', en: 'Other' } },
];

/* ── 공통 ───────────────────────────────────────────── */

export const COMMON = {
  /** 1일 기본 운영 시간 */
  baseHours: 6,
  /** 기본 시간을 넘는 운영, 시간당·일당 */
  extraHourPerDay: 50_000,
  /** 현장 운영 인력 1인 1일 */
  staffPerDay: 300_000,
  /** 전날 사전 설치 (2인, 행사당 1회) */
  setupDayBefore: 300_000,
  /**
   * 지방 운송비 (AI 향수 체험 외 서비스, 행사당 1회)
   * 용달 원가(설치 편도 + 철수 편도): 서울권 12만(기본가에 포함) · 충청·강원 영서 20만 · 그 외 40만 → 서울권과의 차액만큼 받는다
   */
  travel: { capital: 0, central: 100_000, south: 300_000 } as Record<RegionKey, number>,
  vatRate: 0.1,
  /** 가견적서 유효기간 (일) */
  validDays: 30,
};

/* ── AI 향수 체험 ───────────────────────────────────── */

export const PERFUME = {
  minGuests: 20,
  /** 인원 구간별 1인 단가 */
  tiers: [
    { min: 20, max: 49, unit: { '10ml': 20_000, '50ml': 45_000 } },
    { min: 50, max: 99, unit: { '10ml': 18_000, '50ml': 40_000 } },
    { min: 100, max: Infinity, unit: { '10ml': 15_000, '50ml': 35_000 } },
  ],
  /** 조향 1팀(조향사 1 + 조수 1) 출장비, 운영일마다 */
  teamTravel: { capital: 350_000, central: 450_000, south: 550_000 } as Record<RegionKey, number>,
  /**
   * 최소 금액 (수도권, 1인 단가 합계 + 조향 팀 출장비 기준). 지방은 출장비 차이만큼 더한다.
   * 10ml 기준 32명까지는 이 금액이 적용된다.
   */
  minimumCharge: 990_000,
  /** 조향 1팀 시간당 처리 인원 */
  guestsPerTeamHour: 20,
  customScent: 1_000_000,
  /** 고급 선물 포장 — 기본 AC'SCENT 브랜드 패키지, 병당 (만드는 향수 수 = 체험 인원) */
  premiumPackaging: { '10ml': 3_000, '50ml': 5_000 },
  /** 전용 디자인 단박스 — 새 디자인으로 단박스 제작, 디자인비 포함 최소 금액 (수량·사양은 상담 후 확정) */
  customBox: { minGuests: 300, minimum: 1_000_000 },
  /**
   * 분석용 AI 키오스크 (선택). 고르지 않으면 방문객이 QR로 휴대폰 웹 분석을 한다.
   * 조향 팀이 함께 가져가 운영하므로 키오스크 '추가 대수' 요금으로 받는다.
   */
  analysisKiosk: 300_000,
  analysisKioskExtraDay: 200_000,
};

/* ── AI 포토부스 ────────────────────────────────────── */

export const PHOTO_BOOTH = {
  /** 1대 1일 (AI 스타일 2종·인화 1롤 700장·프레임 1종·수도권 운송·설치 포함, 운영 인력 별도) */
  firstBooth: 1_200_000,
  /** 2·3번째 부스 (보유 3대라 할인을 작게 둔다) */
  extraBooth: 1_100_000,
  /** 대당 추가 1일 */
  extraDayPerBooth: 600_000,
  includedStyles: 2,
  extraStyle: 200_000,
  /** 인화지 1롤 장수 (원가 약 12만원) */
  printsPerRoll: 700,
  /** 인화 1롤(700장) 추가 */
  extraPrintRoll: 200_000,
  /** 보유 기기 수 — 견적에서 고를 수 있는 최대 대수 */
  maxBooths: 3,
  wrapping: 500_000,
};

/* ── AI 키오스크 ───────────────────────────────────── */

export const KIOSK = {
  /**
   * 1대 1일 — 기존 체험 1종을 그대로 운영 (커스텀 없음), 카메라·직접 운반·설치 포함, 운영 인력 별도.
   * 화면·질문·결과를 바꾸는 작업은 '커스텀 AI 콘텐츠' 상품으로 따로 받는다.
   */
  firstKiosk: 890_000,
  extraKiosk: 300_000,
  /** 대당 추가 1일 */
  extraDayPerKiosk: 200_000,
  /** 영수증형 즉석 프린터, 대당 */
  printer: 100_000,
  extraContent: 300_000,
  /** 상시 운영: 대당 월 */
  monthlyPerKiosk: 2_000_000,
  /** 보유 기기 수 — 견적에서 고를 수 있는 최대 대수 */
  maxKiosks: 4,
  /** 키오스크만 있을 때의 지방 운송비 (직접 운반, 행사당 1회). 용달 상품이 함께 있으면 COMMON.travel 을 쓴다 */
  travel: { capital: 0, central: 100_000, south: 200_000 } as Record<RegionKey, number>,
};

/* ── 인터랙티브 미디어 아트 ─────────────────────────── */

export const MEDIA_ART = {
  production: { standard: 5_000_000, premium: 10_000_000, fullCustom: 15_000_000 },
  /** 장비·운영 1일 (프로젝터 1대·센서 1세트·운영 1인) */
  operationFirstDay: 800_000,
  operationExtraDay: 600_000,
  extraSensor: 1_000_000,
};

/* ── 공간 디자인 ───────────────────────────────────── */

export const SPACE = {
  booth3x3: 4_000_000,
  booth6x3: 7_000_000,
  /** 30㎡ 이상 팝업·공간형: 평당 시작가 (실측 후 확정) */
  perPyeong: 1_200_000,
  photoZone: 1_500_000,
  lighting: 1_000_000,
};

/* ── 커스텀 AI 콘텐츠 ──────────────────────────────── */

/* ── 포토부스·키오스크 커스텀 개발 (1회) ─────────────────── */

export type KioskCustom = 'none' | 'brand' | 'content' | 'dedicated';
export type BoothCustom = 'none' | 'flow' | 'dedicated';

export const CUSTOM_DEV = {
  kiosk: { brand: 200_000, content: 1_500_000, dedicated: 5_000_000 } as Record<Exclude<KioskCustom, 'none'>, number>,
  booth: { flow: 1_500_000, dedicated: 5_000_000 } as Record<Exclude<BoothCustom, 'none'>, number>,
  /** P1 전용 AI 스타일 1종 */
  boothStyle: 500_000,
  /** 행사까지 남은 날이 이보다 적으면 긴급 제작 */
  leadDays: { brand: 7, style: 7, content: 21, flow: 21, dedicated: 42 },
  rushRate: 0.3,
};

export const CUSTOM_DEV_TEXT: {
  kiosk: Record<Exclude<KioskCustom, 'none'>, { name: Text; scope: Text }>;
  booth: Record<Exclude<BoothCustom, 'none'>, { name: Text; scope: Text }>;
  boothStyle: { name: Text; scope: Text };
} = {
  kiosk: {
    brand: {
      name: { ko: '브랜드 적용', en: 'Branding' },
      scope: { ko: '시작·결과 화면 로고·브랜드 컬러, 문구 3줄 이내 교체 · 수정 1회 · 1주 전 확정', en: 'Logo, brand colors and up to 3 lines of copy on start and result screens · 1 revision · confirm 1 week ahead' },
    },
    content: {
      name: { ko: '콘텐츠 커스텀', en: 'Content customization' },
      scope: { ko: '기존 체험 틀 안에서 질문(최대 8문항)·선택지·결과 유형(최대 8종)·결과 문구 교체, 출력물 디자인, 브랜드 상품 연결(최대 20개), AI 말투 조정 · 수정 2회 · 3주 전 확정', en: 'Within an existing experience: questions (up to 8), choices, result types (up to 8) and copy, printout design, product matching (up to 20), AI tone · 2 revisions · confirm 3 weeks ahead' },
    },
    dedicated: {
      name: { ko: '전용 체험 개발', en: 'Dedicated experience' },
      scope: { ko: '새 체험 기획, 새 AI 분석·생성 로직, 화면 8개 이내, 출력물, 사전 테스트 운영 · 수정 2회 · 6주 전 확정 · 범위 확정 후 금액 조정', en: 'New experience concept, new AI analysis or generation logic, up to 8 screens, printout, test run · 2 revisions · confirm 6 weeks ahead · final price after scoping' },
    },
  },
  booth: {
    flow: {
      name: { ko: '촬영 흐름·화면 커스텀', en: 'Flow & screen customization' },
      scope: { ko: '시작·촬영·선택·결과 화면 디자인, 프레임 레이아웃 3종, 컷 수·타이머, QR 결과 페이지 브랜딩 · 수정 2회 · 3주 전 확정', en: 'Start, capture, selection and result screens, 3 frame layouts, shot count and timer, branded QR result page · 2 revisions · confirm 3 weeks ahead' },
    },
    dedicated: {
      name: { ko: '전용 AI 기능 개발', en: 'Dedicated AI feature' },
      scope: { ko: '새 AI 기능(새로운 매칭·합성·영상 생성 등), 결과 설계, 사전 테스트 운영 · 수정 2회 · 6주 전 확정 · 범위 확정 후 금액 조정', en: 'A new AI feature (matching, compositing, video generation…), result design, test run · 2 revisions · confirm 6 weeks ahead · final price after scoping' },
    },
  },
  boothStyle: {
    name: { ko: '전용 AI 스타일 제작', en: 'Dedicated AI style' },
    scope: { ko: '브랜드·IP 콘셉트 스타일 제작(참고 이미지 기반), 시안 3컷 · 수정 1회 · 1주 전 확정', en: 'Brand or IP concept style from reference images, 3 sample shots · 1 revision · confirm 1 week ahead' },
  },
};

/** 커스텀을 고르면 견적 화면·가견적서에 함께 적는 조건 */
export const CUSTOM_TERMS: Text = {
  ko: '커스텀 개발: 기획 미팅 1회·시안·오류 대응 포함, 수정 3회차부터·외부 시스템 연동·개인정보 수집 기능·다국어·데이터 리포트·소스코드 제공은 별도입니다. 개발한 프로그램의 권리는 네안데르에 있고, 고객 브랜드 자산은 고객에게 있으며 연예인·캐릭터 등 제3자 권리 확보는 고객이 맡습니다. 같은 고객이 같은 프로그램을 다시 쓰면 개발비 없이 운영비만 받습니다. 개발비는 선금 50%, 납품 후 잔금 50%입니다.',
  en: 'Custom development includes one planning meeting, drafts and bug fixes. Revisions beyond the included ones, external system integration, personal-data collection, extra languages, data reports and source code are extra. NEANDER retains rights to the program; your brand assets stay yours, and securing third-party rights (celebrities, characters) is your responsibility. Reusing the same program for you again costs only operation. Development is billed 50% upfront and 50% on delivery.',
};

export const CUSTOM = {
  /** 포토부스·키오스크와 무관한 웹·미디어·대형 콘텐츠 개발 */
  scope: { standard: 8_000_000, large: 15_000_000 },
  consulting: 1_000_000,
  maintenancePerMonth: 500_000,
};

export const OPTION_TEXT = {
  volume10: { ko: '10ml', en: '10ml' },
  volume50: { ko: '50ml', en: '50ml' },
  production: {
    standard: { ko: '스탠다드', en: 'Standard' },
    premium: { ko: '프리미엄', en: 'Premium' },
    fullCustom: { ko: '풀 커스텀', en: 'Full custom' },
  },
  space: {
    booth3x3: { ko: '부스 3×3m (약 9㎡)', en: 'Booth 3×3m (~9㎡)' },
    booth6x3: { ko: '부스 6×3m (약 18㎡)', en: 'Booth 6×3m (~18㎡)' },
    large: { ko: '팝업·공간 (30㎡ 이상)', en: 'Pop-up / space (30㎡+)' },
  },
  scope: {
    standard: { ko: '웹·미디어 콘텐츠 개발', en: 'Web / media content' },
    large: { ko: '대형·복합 콘텐츠 개발', en: 'Large or multi-part content' },
  },
} as const;
