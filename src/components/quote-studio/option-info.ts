import type { Lang } from '@/lib/quote/catalog';

/* 온라인 견적 — 옵션에 마우스를 올리면 뜨는 상세 설명 (팝오버) */

type Info = { ko: string; en: string };

export const OPTION_INFO = {
  // AI 향수 체험
  perfumeGuests: {
    ko: '향수를 직접 만들어 가져가는 인원이에요. 인원이 많을수록 1인 단가가 낮아져요 (20–49명 · 50–99명 · 100명 이상).',
    en: 'Guests who make and take home a perfume. The per-guest price drops as numbers grow (20–49 · 50–99 · 100+).',
  },
  volume: {
    ko: '10ml는 가볍게 들고 가는 미니 사이즈, 50ml는 일상에서 오래 쓰는 정식 사이즈예요. 조향 과정은 같고 병과 원액 양만 달라요.',
    en: '10ml is a take-away mini; 50ml is a full-size bottle for everyday use. The blending experience is the same.',
  },
  analysisQr: {
    ko: '방문객이 부스의 QR 코드를 찍으면 휴대폰 웹에서 AI가 취향을 분석해요. 별도 기기가 없어 부스가 좁아도 운영할 수 있어요.',
    en: 'Guests scan a QR code and the AI reads their taste on their own phone. No extra hardware, so it fits small booths.',
  },
  analysisKiosk: {
    ko: '부스에 터치스크린 AI 키오스크를 두고 현장에서 분석해요. 휴대폰 사용이 어려운 방문객도 쉽게 참여하고, 부스가 더 눈에 띄어요.',
    en: 'A touchscreen AI kiosk at the booth runs the analysis. Easier for guests who prefer not to use their phone, and more eye-catching.',
  },
  extraTeams: {
    ko: '조향사 1명과 보조 1명이 한 팀이며, 시간당 최대 40명을 맡아요. 체험 인원과 하루 운영 시간·행사 일수에 맞춰 기본 1팀에서 필요한 만큼 자동으로 늘어나요. 필요한 팀 수 이상으로 직접 선택할 수도 있으며, 4팀부터는 상담 후 인력 배치와 최종 금액을 확정해요. 지역과 운영 일수에 따른 팀별 출장비가 견적에 반영돼요.',
    en: 'Each team has a perfumer and an assistant and serves up to 40 guests an hour. Teams automatically increase from 1 based on perfume guests, daily hours and event days. You can choose more than the minimum. Four or more teams require consultation to confirm staffing and the final price. Travel fees apply per team, based on your region and event days.',
  },
  customScent: {
    ko: '기본 체험에는 준비된 30가지 향이 포함돼요. 이 옵션은 브랜드나 행사만의 향을 새로 개발하며, 제작비 89만원(부가세 별도)이 한 번 추가돼요. 방문객은 이 향을 바탕으로 자기 향수를 만들어요.',
    en: 'The base experience includes 30 ready-made scents. This option develops a signature scent for your brand or event for a one-time fee of KRW 890,000, excluding VAT. Guests use it as the base of their own perfume.',
  },
  premiumPackaging: {
    ko: "향수 한 병마다 기본 AC'SCENT 브랜드 패키지로 선물 포장을 해요. 디자인은 정해져 있고, 만드는 병 수(체험 인원)만큼 비용이 더해져요.",
    en: "Each bottle is gift-packed in our standard AC'SCENT brand package. The design is fixed; priced per bottle (one per guest).",
  },
  customBox: {
    ko: '행사·브랜드 전용으로 단박스를 새로 디자인해 제작해요. 300명 이상 행사에서만 가능하고, 디자인비 포함 100만원부터예요. 수량·사양·일정은 상담이 필요해요.',
    en: 'A gift box newly designed and produced for your brand or event. Available for 300+ guests, from KRW 1M including design. Quantity, spec and timeline need a consultation.',
  },

  // AI 포토부스
  booths: {
    ko: '부스 1대마다 AI 스타일 2종과 인화지 1롤(약 700장)이 포함돼요. 방문객이 많으면 부스를 늘려 대기 시간을 줄여요.',
    en: 'Each booth includes 2 AI styles and one roll of prints (about 700). Add booths to cut queues.',
  },
  extraStyles: {
    ko: '네안데르가 준비해 둔 AI 스타일(애니메이션, 잡지 화보 등)을 더 넣어 방문객이 고를 수 있는 폭을 넓혀요.',
    en: 'Add more of our ready-made AI styles (anime, magazine cover and more) for guests to choose from.',
  },
  extraPrintRolls: {
    ko: '1롤로 약 700장을 인화해요. 방문객이 700명을 넘거나 1인 여러 장 인화가 예상되면 추가해 주세요.',
    en: 'One roll prints about 700 photos. Add rolls if you expect more than 700 guests or several prints each.',
  },

  wrapping: {
    ko: '부스 외관을 브랜드 로고, 컬러, 행사 그래픽으로 감싸는 래핑 시트를 제작해 붙여요. 부스 1대 기준 가격이에요.',
    en: 'A printed wrap in your logo, colors and event graphics covers the booth exterior. Priced per booth.',
  },

  // AI 키오스크
  modeEvent: {
    ko: '행사 기간에만 키오스크를 빌려요. 운반, 설치, 철수가 포함되고 하루 단위로 계산해요.',
    en: 'Rent kiosks just for the event, billed by the day, with delivery, setup and teardown included.',
  },
  modeMonthly: {
    ko: '매장, 쇼룸, 로비 등에 키오스크를 두고 매달 이용해요. 콘텐츠 월 1회 교체가 포함돼요.',
    en: 'Keep kiosks in a store, showroom or lobby month to month, with one content change a month included.',
  },
  kiosks: {
    ko: '키오스크 1대에서 한 명씩 체험해요. 동시에 체험할 사람이 많거나 동선이 여러 곳이면 대수를 늘려요.',
    en: 'Each kiosk serves one guest at a time. Add more for heavy traffic or several spots.',
  },
  months: {
    ko: '상시 운영할 기간이에요. 대당 월 요금으로 계산해요.',
    en: 'How long the kiosks stay on site, billed per kiosk per month.',
  },
  experience: {
    ko: '네안데르가 이미 만들어 둔 AI 체험 중 하나를 그대로 운영해요. 고르지 않아도 상담에서 행사에 맞는 체험을 추천해 드려요.',
    en: 'Run one of our ready-made AI experiences as is. Not sure? We will recommend one for your event.',
  },
  extraContents: {
    ko: '한 키오스크에서 두 가지 이상의 체험을 번갈아 운영해요. 방문객이 체험을 골라서 할 수 있어요.',
    en: 'Offer more than one experience on the same kiosk so guests can choose.',
  },
  printer: {
    ko: '키오스크 옆에 영수증형 즉석 프린터를 두고 분석 결과를 종이로 뽑아 줘요. 방문객이 결과를 들고 가서 공유하기 좋아요.',
    en: 'A receipt-style printer next to each kiosk prints the result for guests to take home and share.',
  },

  // 인터랙티브 미디어 아트
  gradeStandard: {
    ko: '준비된 인터랙션 템플릿에 브랜드 색과 로고를 입혀요. 빠르게 준비할 수 있어요.',
    en: 'Our interaction templates in your colors and logo. Quick to prepare.',
  },
  gradePremium: {
    ko: '브랜드 콘셉트에 맞춰 영상과 인터랙션 효과를 새로 디자인해요.',
    en: 'Visuals and interaction effects designed for your brand concept.',
  },
  gradeFullCustom: {
    ko: '기획부터 영상, 인터랙션, 공간 연출까지 처음부터 새로 만들어요.',
    en: 'Everything built from scratch: concept, visuals, interaction and staging.',
  },
  imageCamera: { ko: '카메라 영상 속 움직임과 사람의 형태에 반응해요. 기본 1세트가 포함돼요.', en: 'Responds to movement and silhouettes in the camera image. One set is included.' },
  depthCamera: { ko: '거리와 깊이를 읽어 앞뒤 움직임까지 활용해요. 기본 1세트를 3D 카메라로 바꾸는 비용은 행사당 50만원이에요.', en: 'Reads distance and depth for forward and backward movement. Upgrade the included set for KRW 500,000 per event.' },
  extraSensors: {
    ko: '센서가 방문객의 움직임을 읽어 영상이 반응해요. 기본 1세트로 부족할 만큼 넓거나 여러 면을 쓰면 센서를 더해요.',
    en: 'Sensors track guest movement so the visuals respond. Add sets for larger or multiple surfaces.',
  },

  // 공간 디자인
  booth3x3: { ko: '전시회 기본 부스 1칸 크기예요. 체험 1–2개를 두기 좋아요.', en: 'A standard single exhibition booth. Fits 1–2 experiences.' },
  booth6x3: { ko: '기본 부스 2칸 크기예요. 체험과 대기 공간, 포토존을 함께 두기 좋아요.', en: 'Two standard booths. Room for experiences, a queue and a photo spot.' },
  fabric: { ko: '알루미늄 프레임에 천 그래픽을 씌우는 조립식 부스예요. 행사마다 그래픽만 새로 출력해 깔끔하고, 설치·철수가 빨라요.', en: 'An aluminium frame wrapped in printed fabric. Only the graphics are reprinted for each event, so it looks clean and sets up quickly.' },
  wood: { ko: '나무로 가벽을 짜고 도장·시트로 마감해요. 선반·틈새 같은 모양을 자유롭게 낼 수 있고, 행사가 끝나면 철거해요.', en: 'Walls built in wood and finished with paint or film. Shelves and niches can be shaped freely; the walls are removed after the event.' },
  large: { ko: '팝업 스토어나 전시 공간처럼 30㎡ 이상인 공간이에요. 평당 120만원, 최소 10평부터 예상 합계에 반영하고 실측 후 확정해요.', en: 'Pop-up stores and exhibition spaces of 30㎡ or more. From KRW 1.2M per pyeong, minimum 10 pyeong, included in the estimate and finalized after a site survey.' },
  pyeong: { ko: '꾸밀 공간의 대략적인 넓이예요. 1평은 약 3.3㎡예요.', en: 'Approximate floor area. 1 pyeong is about 3.3㎡.' },
  photoZone: { ko: '방문객이 사진을 찍어 SNS에 올리고 싶게 만드는 포토존을 공간 안에 디자인해 설치해요.', en: 'A designed photo spot inside your space that guests want to share.' },
  lighting: { ko: '공간과 체험 분위기에 맞춰 조명을 설계하고 설치해요.', en: 'Lighting designed and installed for your space and experience.' },

  // 커스텀 AI 콘텐츠
  scopeStandard: { ko: '브랜드 웹 체험, 미디어 콘텐츠처럼 한 가지 결과물을 새로 만들어요.', en: 'A single new deliverable, such as a branded web experience or media piece.' },
  scopeLarge: { ko: '여러 체험이 이어지는 복합 콘텐츠나 대형 전시용 콘텐츠를 만들어요.', en: 'Multi-part or large-scale exhibition content.' },
  consulting: { ko: '아이디어 단계부터 함께 기획해요. 목표, 관람 동선, 체험 시나리오를 정리해 드려요.', en: 'We plan with you from the idea stage: goals, visitor flow and scenarios.' },
  pgIntegration: { ko: '행사 맞춤 AI 콘텐츠에 PG 1개사의 결제 흐름을 연동해요. 1회 개발비 100만원이며 PG 계약·가입비·거래 수수료는 별도예요.', en: 'Integrate one payment gateway into your event AI content. One-time development is KRW 1M; provider signup and transaction fees are separate.' },
  maintenance: { ko: '오픈 후 오류 대응, 작은 수정, 서버 관리를 매달 맡아요.', en: 'Monthly bug fixes, small edits and server care after launch.' },
} satisfies Record<string, Info>;

export type OptionInfoKey = keyof typeof OPTION_INFO;

export const optionInfo = (key: OptionInfoKey, lang: Lang) => OPTION_INFO[key][lang];
