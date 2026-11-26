/* ─────────────────────────────────────────────────────────
   AI 포토부스 · AI 키오스크 상세 페이지 문구 (2026-11 개편에서 새로 만든 두 페이지)
   · 금액 · 대수 · 확정 기한은 문장에 직접 쓰지 않고 src/lib/quote/catalog.ts 값을 끼워 넣는다
   · 기기 스펙은 확인된 것만: 키오스크 = 세로 터치 화면 · 웹캠 · 80mm 영수증 프린터(결과 QR 24시간 보관),
     포토부스 = 가로 화면 · DSLR 카메라 · 4×6 사진 프린터 · 조명(결과 QR 7일 보관)
   · 1인 소요 시간처럼 재지 않은 수치는 쓰지 않는다 (experience-specs.ts 규칙)
   ───────────────────────────────────────────────────────── */
import { COMMON, CUSTOM_DEV, KIOSK, PHOTO_BOOTH } from '@/lib/quote/catalog';
import { phonesText } from '@/lib/constants';
import { formatPrice } from '@/lib/quote/format';
import { BOOTH_PROGRAMS, KIOSK_PROGRAMS } from './product-lines';
import { ONSITE_SCENES } from './onsite-flows';
import { COLOR_VIDEO_FLOW, SAJU_VIDEO_FLOW, type VideoFlow } from './program-previews';

type Lang = 'ko' | 'en';
export type ProductPageKind = 'photoBooth' | 'rental';

export interface ProductPageCopy {
  path: string;
  metaTitle: string;
  metaDescription: string;
  statement: string;
  numbers: { value: string; unit?: string; label: string; note?: string }[];
  /** 체험 순서에 쓸 대표 프로그램 */
  flowSlug: string;
  /** 「체험 순서」만 다른 프로그램으로 보여 줄 때 (받아 가는 것은 flowSlug 그대로) */
  processFlow?: VideoFlow;
  flowNote: string;
  scene: string;
  sceneAlt: string;
  spec: { label: string; value: string }[];
  lineupSub: string;
  caseSlugs: string[];
  guideSlugs: string[];
  faq: { q: string; a: string }[];
}

const weeks = (days: number) => Math.round(days / 7);

export function productPageCopy(kind: ProductPageKind, lang: Lang): ProductPageCopy {
  const ko = lang === 'ko';
  const p = (n: number) => formatPrice(n, lang);
  const region = ko
    ? { q: '서울 밖 행사도 가능한가요?', a: '전국 어디든 출장해 운영하며, 장소에 맞춰 장비 운송과 설치 계획을 세웁니다. 지역별 운송비는 별도이고, 제주 및 도서 지역과 해외 행사는 진행하지 않습니다.' }
    : { q: 'Do you travel outside Seoul?', a: 'Yes, anywhere on the Korean mainland; we plan transport and setup for the venue. Regional transport is extra. We do not operate on Jeju, other islands, or overseas.' };
  const prep = ko
    ? { q: '행사 얼마 전에 문의해야 하나요?', a: `준비된 프로그램을 그대로 운영하면 보통 행사 2주 전이면 충분합니다. 급한 일정이라도 조정할 수 있으니 전화(${phonesText('ko')})로 먼저 문의해 주세요. 화면이나 내용을 바꾸는 커스텀은 종류에 따라 ${weeks(CUSTOM_DEV.leadDays.brand)}주 · ${weeks(CUSTOM_DEV.leadDays.content)}주 · ${weeks(CUSTOM_DEV.leadDays.dedicated)}주 전에 내용을 확정해야 합니다.` }
    : { q: 'How far ahead should we get in touch?', a: `For ready-made programs, two weeks before the event is usually enough. If your date is close, we can often adjust — please call us first (${phonesText('en')}). Customization must be confirmed ${weeks(CUSTOM_DEV.leadDays.brand)}, ${weeks(CUSTOM_DEV.leadDays.content)} or ${weeks(CUSTOM_DEV.leadDays.dedicated)} weeks ahead depending on scope.` };

  if (kind === 'photoBooth') {
    const n = BOOTH_PROGRAMS.length;
    return {
      path: '/services/ai-photo-booth',
      metaTitle: ko ? `AI 포토부스 — 테마 ${n}종 · 가격 · 진행 순서` : `AI Photo Booth — ${n} themes, pricing and how it works`,
      metaDescription: ko
        ? `촬영한 사진을 AI가 행사 테마 속 모습으로 바꾸고 그 자리에서 4×6으로 인화합니다. 1대 1일 ${p(PHOTO_BOOTH.firstBooth)}부터(VAT 별도, 서울 기준), 최대 ${PHOTO_BOOTH.maxBooths}대 동시 운영. 실제 프로그램 화면과 운영 사례를 확인하세요.`
        : `AI restyles each guest photo into your event theme and prints it as a 4×6 on the spot. From ${p(PHOTO_BOOTH.firstBooth)} per booth per day (excl. VAT, Seoul), up to ${PHOTO_BOOTH.maxBooths} booths at once.`,
      statement: ko
        ? '찍고, 고르고, 바뀌고, 손에 쥡니다.\n행사의 한 장면이 방문객의 사진이 됩니다.'
        : 'Shoot, choose, transform, take it home.\nA scene from your event becomes each guest’s photo.',
      numbers: ko
        ? [
            { value: '316', unit: '팀', label: '이틀 동안 완성', note: '안산사이언스밸리 과학축제 2026' },
            { value: String(PHOTO_BOOTH.maxBooths), unit: '대', label: '까지 동시 운영', note: '평택 AI 페스타 2026에서 3대 운영' },
            { value: String(n), unit: '종', label: '바로 쓰는 AI 테마', note: '행사 전용 스타일 추가 가능' },
          ]
        : [
            { value: '316', label: 'groups in two days', note: 'Ansan Science Festival 2026' },
            { value: String(PHOTO_BOOTH.maxBooths), label: 'booths at once', note: 'Three ran at Pyeongtaek AI Festa 2026' },
            { value: String(n), label: 'ready-made AI themes', note: 'Dedicated styles available' },
          ],
      flowSlug: 'ai-idol-makeup-booth',
      // 체험 순서는 최신 영상판 SAJU! 로 보여 준다 (2026-11-21 사용자)
      processFlow: SAJU_VIDEO_FLOW,
      flowNote: ko ? '예시 프로그램: SAJU! 영상판 — 길잡이 인물이 안내하는 사주 포토부스' : 'Example program: SAJU! video edition — a guide character leads the fortune photo booth',
      // SAJU! 화면을 띄운 판 — 안테나 · 조명 선을 정리했다 (output/booth-scene-saju-2026-11-21)
      scene: '/images/services/spec/booth-scene-saju.webp',
      sceneAlt: ko ? '행사 텐트 안의 흰색 AI 포토부스와 인화물이 나오는 모습' : 'A white AI photo booth in an event tent with a print coming out',
      spec: ko
        ? [
            { label: '기기', value: '가로 화면 · DSLR 카메라 · 4×6 사진 프린터 · 조명' },
            { label: '기본 포함', value: `AI 스타일 ${PHOTO_BOOTH.includedStyles}종 · 인화 1롤 ${PHOTO_BOOTH.printsPerRoll}장 · 프레임 1종 · 서울 운송 · 설치` },
            { label: '결과물', value: '4×6 인화 사진(디자인 2종 중 선택) · QR로 휴대폰 저장' },
            { label: '결과 보관', value: 'QR 받기 페이지 7일' },
            { label: '대수', value: `최대 ${PHOTO_BOOTH.maxBooths}대 동시 운영` },
            { label: '운영 인력', value: `별도 · 1명 1일 ${p(COMMON.staffPerDay)}` },
            { label: '운영 시간', value: `1일 기본 ${COMMON.baseHours}시간` },
          ]
        : [
            { label: 'Device', value: 'Landscape screen, DSLR camera, 4×6 photo printer, light' },
            { label: 'Included', value: `${PHOTO_BOOTH.includedStyles} AI styles · one roll of ${PHOTO_BOOTH.printsPerRoll} prints · 1 frame · Seoul transport · setup` },
            { label: 'Take-home', value: '4×6 print (choice of two designs) · QR download to phone' },
            { label: 'Result retention', value: 'QR download page for 7 days' },
            { label: 'Units', value: `Up to ${PHOTO_BOOTH.maxBooths} booths at once` },
            { label: 'Staff', value: `Extra · ${p(COMMON.staffPerDay)} per person per day` },
            { label: 'Hours', value: `${COMMON.baseHours} hours per day as standard` },
          ],
      lineupSub: ko ? '같은 부스에 행사에 맞는 테마를 담습니다.' : 'One booth, themed for your event.',
      caseSlugs: ['pyeongtaek-ai-festa-2026', 'ansan-science-festival-2026', 'kwave-dance-festival-2026', 'sowon-festa-saju-photobooth-2026'],
      guideSlugs: ['ai-photo-booth-rental', 'festival-experience-booth', 'corporate-year-end-event-ai-booth'],
      faq: ko
        ? [
            { q: '한 번에 몇 대까지 운영할 수 있나요?', a: `최대 ${PHOTO_BOOTH.maxBooths}대까지 함께 운영합니다. 첫 부스는 1일 ${p(PHOTO_BOOTH.firstBooth)}, 2 · 3번째 부스는 대당 ${p(PHOTO_BOOTH.extraBooth)}입니다.` },
            { q: '행사 전용 테마를 만들 수 있나요?', a: `준비된 테마는 기본 ${PHOTO_BOOTH.includedStyles}종이 포함되고 1종 추가마다 ${p(PHOTO_BOOTH.extraStyle)}입니다. 행사만을 위한 전용 AI 스타일은 1종 ${p(CUSTOM_DEV.boothStyle)}(${CUSTOM_DEV.leadDays.style}일 전 확정), 화면과 프레임까지 바꾸는 커스텀은 ${p(CUSTOM_DEV.booth.flow)}(${weeks(CUSTOM_DEV.leadDays.flow)}주 전 확정)입니다.` },
            { q: '인화는 몇 장까지 되나요?', a: `인화지 1롤(${PHOTO_BOOTH.printsPerRoll}장)이 기본으로 포함됩니다. 더 필요하면 1롤에 ${p(PHOTO_BOOTH.extraPrintRoll)}으로 추가합니다.` },
            prep,
            region,
          ]
        : [
            { q: 'How many booths can run at once?', a: `Up to ${PHOTO_BOOTH.maxBooths}. The first booth is ${p(PHOTO_BOOTH.firstBooth)} per day; the 2nd and 3rd are ${p(PHOTO_BOOTH.extraBooth)} each.` },
            { q: 'Can you make a theme just for our event?', a: `${PHOTO_BOOTH.includedStyles} ready-made styles are included and each extra one is ${p(PHOTO_BOOTH.extraStyle)}. A dedicated AI style is ${p(CUSTOM_DEV.boothStyle)} (confirm ${CUSTOM_DEV.leadDays.style} days ahead); customizing screens and frames is ${p(CUSTOM_DEV.booth.flow)} (confirm ${weeks(CUSTOM_DEV.leadDays.flow)} weeks ahead).` },
            { q: 'How many prints are included?', a: `One roll of ${PHOTO_BOOTH.printsPerRoll} prints. Extra rolls are ${p(PHOTO_BOOTH.extraPrintRoll)} each.` },
            prep,
            region,
          ],
    };
  }

  const n = KIOSK_PROGRAMS.length;
  return {
    path: '/services/ai-kiosk',
    metaTitle: ko ? `AI 키오스크 — 프로그램 ${n}종 · 가격 · 진행 순서` : `AI Kiosk — ${n} programs, pricing and how it works`,
    metaDescription: ko
      ? `퍼스널 컬러 · 손금 · 미래직업 같은 AI 체험을 세로형 키오스크로 운영하고, 결과는 내장 영수증 프린터와 QR로 건넵니다. 1대 1일 ${p(KIOSK.firstKiosk)}부터(VAT 별도, 서울 기준), 최대 ${KIOSK.maxKiosks}대. 실제 프로그램 화면을 확인하세요.`
      : `Run AI experiences such as personal color, palm reading and career tests on a portrait kiosk; results print on the built-in receipt printer and download by QR. From ${p(KIOSK.firstKiosk)} per kiosk per day (excl. VAT, Seoul), up to ${KIOSK.maxKiosks}.`,
    statement: ko
      ? '한 대에 체험 하나.\n퍼스널 컬러부터 손금까지,\n행사에 맞는 체험을 골라 나란히 세웁니다.'
      : 'One experience per kiosk.\nFrom personal color to palm reading,\npick what fits your event and line them up.',
    numbers: ko
      ? [
          { value: String(n), unit: '종', label: '바로 쓰는 AI 체험', note: '진단 · 운세 · 취향 · 크리에이티브' },
          { value: String(KIOSK.maxKiosks), unit: '대', label: '까지 동시 운영', note: '대마다 다른 체험 가능' },
          { value: String(weeks(CUSTOM_DEV.leadDays.brand)), unit: '주', label: '전 확정이면 브랜드 적용', note: '로고 · 색 · 문구 교체' },
        ]
      : [
          { value: String(n), label: 'ready-made AI experiences', note: 'Analysis, fortune, taste, creative' },
          { value: String(KIOSK.maxKiosks), label: 'kiosks at once', note: 'A different experience on each' },
          { value: String(weeks(CUSTOM_DEV.leadDays.brand)), unit: 'wk', label: 'lead time for branding', note: 'Logo, colors and copy' },
        ],
    flowSlug: 'ai-personal-color',
    // 체험 순서는 COLOR! 영상판 녹화로 (2026-11-21 사용자). 받아 가는 것은 기존 퍼스널 컬러 영수증 · 휴대폰 받기 그대로
    processFlow: COLOR_VIDEO_FLOW,
    flowNote: ko ? '예시 프로그램: COLOR! 영상판 — 컬러리스트 서하가 안내하는 AI 퍼스널 컬러' : 'Example program: COLOR! video edition — AI personal color guided by colorist Seoha',
    scene: ONSITE_SCENES.kiosk,
    sceneAlt: ko ? '행사 부스에서 방문객이 세로형 AI 키오스크 화면을 누르는 모습' : 'A guest tapping a portrait AI kiosk at an event booth',
    spec: ko
      ? [
          { label: '기기', value: '세로 터치 화면 · 웹캠 · 80mm 영수증 프린터(내장)' },
          { label: '기본 포함', value: '준비된 체험 1종 그대로 · 카메라 · 프린터 · 운반 · 설치' },
          { label: '결과물', value: '영수증형 결과지 · QR로 휴대폰 저장' },
          { label: '결과 보관', value: 'QR 받기 페이지 24시간' },
          { label: '대수', value: `최대 ${KIOSK.maxKiosks}대 · 대마다 다른 체험` },
          { label: '운영 인력', value: `별도 · 1명 1일 ${p(COMMON.staffPerDay)}` },
          { label: '상시 운영', value: `대당 월 ${p(KIOSK.monthlyPerKiosk)} · 콘텐츠 월 1회 교체` },
        ]
      : [
          { label: 'Device', value: 'Portrait touch screen, webcam, built-in 80mm receipt printer' },
          { label: 'Included', value: 'One ready-made experience as-is · camera · printer · delivery · setup' },
          { label: 'Take-home', value: 'Receipt-style result · QR download to phone' },
          { label: 'Result retention', value: 'QR download page for 24 hours' },
          { label: 'Units', value: `Up to ${KIOSK.maxKiosks} kiosks, each with its own experience` },
          { label: 'Staff', value: `Extra · ${p(COMMON.staffPerDay)} per person per day` },
          { label: 'Long-term', value: `${p(KIOSK.monthlyPerKiosk)} per kiosk per month · monthly content refresh` },
        ],
    lineupSub: ko ? '준비된 체험을 그대로 운영합니다. 대마다 다른 체험을 넣을 수 있습니다.' : 'Run a ready-made experience as-is — a different one on each kiosk.',
    caseSlugs: ['eunpyeong-ai-festival-2026', 'pyeongtaek-ai-festa-2026', 'jimff-2026-ost-fair'],
    guideSlugs: ['ai-fortune-kiosk-rental', 'ai-personal-color-booth', 'school-library-ai-experience'],
    faq: ko
      ? [
          { q: '한 대에 여러 체험을 넣을 수 있나요?', a: `키오스크 한 대에는 체험 하나를 운영합니다. 여러 체험을 하려면 대수를 늘려 대마다 다른 체험을 넣습니다. 최대 ${KIOSK.maxKiosks}대까지 함께 운영할 수 있고, 2대째부터는 대당 ${p(KIOSK.extraKiosk)}입니다.` },
          { q: '질문이나 결과를 우리 행사에 맞게 바꿀 수 있나요?', a: `로고 · 색 · 문구만 바꾸는 브랜드 적용은 ${p(CUSTOM_DEV.kiosk.brand)}(${weeks(CUSTOM_DEV.leadDays.brand)}주 전 확정), 질문 · 결과 유형 · 화면까지 바꾸는 콘텐츠 커스텀은 ${p(CUSTOM_DEV.kiosk.content)}(${weeks(CUSTOM_DEV.leadDays.content)}주 전 확정)입니다. 새 체험을 만드는 전용 개발은 ${p(CUSTOM_DEV.kiosk.dedicated)}부터입니다.` },
          { q: '행사 말고 매장에 오래 둘 수 있나요?', a: `상시 운영은 대당 월 ${p(KIOSK.monthlyPerKiosk)}이며, 콘텐츠를 한 달에 한 번 바꿔 드립니다.` },
          prep,
          region,
        ]
      : [
          { q: 'Can one kiosk run several experiences?', a: `Each kiosk runs one experience. For more, add kiosks and put a different one on each — up to ${KIOSK.maxKiosks}, at ${p(KIOSK.extraKiosk)} each from the second.` },
          { q: 'Can you adapt the questions and results to our event?', a: `Branding (logo, colors, copy) is ${p(CUSTOM_DEV.kiosk.brand)} (confirm ${weeks(CUSTOM_DEV.leadDays.brand)} week ahead). Content customization of questions, result types and screens is ${p(CUSTOM_DEV.kiosk.content)} (confirm ${weeks(CUSTOM_DEV.leadDays.content)} weeks ahead). A dedicated new experience starts at ${p(CUSTOM_DEV.kiosk.dedicated)}.` },
          { q: 'Can a kiosk stay in a store long-term?', a: `Yes — ${p(KIOSK.monthlyPerKiosk)} per kiosk per month, with a content refresh once a month.` },
          prep,
          region,
        ],
  };
}
