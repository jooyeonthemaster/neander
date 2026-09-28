import {
  COMMON, CUSTOM, CUSTOM_DEV, CUSTOM_DEV_TEXT, CUSTOM_TERMS, KIOSK, MEDIA_ART, OPTION_TEXT, PERFUME, PHOTO_BOOTH, SERVICE_TEXT, SPACE,
  type BoothCustom, type KioskCustom, type Lang, type RegionKey, type ServiceKey,
} from './catalog';

/* ─────────────────────────────────────────────────────────
   견적 계산 엔진 — 화면과 PDF가 같은 결과를 내도록 순수 함수로 둔다.
   ───────────────────────────────────────────────────────── */

export interface PerfumeOptions { guests: number; volume: '10ml' | '50ml'; extraTeams: number; customScent: boolean; premiumPackaging: boolean; /** 전용 디자인 단박스 (300명 이상) — premiumPackaging 대신 */ customBox?: boolean; /** 분석용 AI 키오스크 대수 (0 = QR 웹 분석) */ analysisKiosks?: number }
export interface PhotoBoothOptions { booths: number; extraStyles: number; extraPrintRolls: number; photocard: boolean; wrapping: boolean; customStyles?: number; custom?: BoothCustom }
export interface KioskOptions { mode: 'event' | 'monthly'; kiosks: number; months: number; printer: boolean; extraContents: number; custom?: KioskCustom; experienceSlug?: string }
export interface MediaArtOptions { grade: 'standard' | 'premium' | 'fullCustom'; extraSensors: number }
export interface SpaceOptions { size: 'booth3x3' | 'booth6x3' | 'large'; pyeong: number; photoZone: boolean; lighting: boolean }
export interface CustomOptions { scope: 'standard' | 'large'; consulting: boolean; maintenanceMonths: number }

export type QuoteItem =
  | { key: 'acscent'; options: PerfumeOptions }
  | { key: 'photoBooth'; options: PhotoBoothOptions }
  | { key: 'rental'; options: KioskOptions }
  | { key: 'mediaArt'; options: MediaArtOptions }
  | { key: 'spatialDesign'; options: SpaceOptions }
  | { key: 'custom'; options: CustomOptions };

export interface QuoteInput {
  eventType: string;
  eventDate: string;
  days: number;
  hoursPerDay: number;
  attendees: number;
  region: RegionKey;
  extraStaff: number;
  /** 전날 사전 설치 */
  setupDayBefore?: boolean;
  items: QuoteItem[];
}

export interface QuoteLine {
  service: ServiceKey | 'common';
  label: string;
  detail: string;
  amount: number;
  /** 금액이 확정되지 않아 합계에서 빼고 "상담 후 산정"으로 보여 주는 줄 */
  tbd?: boolean;
}

export interface QuoteResult {
  lines: QuoteLine[];
  supply: number;
  vat: number;
  total: number;
  warnings: string[];
  /** 조건 안내 (커스텀 개발 조건 등) — 화면과 가견적서 유의사항에 표시 */
  notes: string[];
}

const clampInt = (value: unknown, min: number, max: number, fallback: number) => {
  const n = Math.round(Number(value));
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
};

export function defaultOptions(key: ServiceKey, attendees = 100): QuoteItem {
  switch (key) {
    case 'acscent':
      return { key, options: { guests: Math.max(PERFUME.minGuests, Math.min(attendees, 200)), volume: '10ml', extraTeams: 0, customScent: false, premiumPackaging: false } };
    case 'photoBooth':
      return { key, options: { booths: 1, extraStyles: 0, extraPrintRolls: 0, photocard: false, wrapping: false } };
    case 'rental':
      return { key, options: { mode: 'event', kiosks: 1, months: 1, printer: false, extraContents: 0, custom: 'none' } };
    case 'mediaArt':
      return { key, options: { grade: 'standard', extraSensors: 0 } };
    case 'spatialDesign':
      return { key, options: { size: 'booth3x3', pyeong: 10, photoZone: false, lighting: false } };
    case 'custom':
      return { key, options: { scope: 'standard', consulting: false, maintenanceMonths: 0 } };
  }
}

/** 외부 입력(요청 본문·저장된 값)을 안전한 범위로 정리한다 */
export function sanitizeInput(raw: unknown): QuoteInput {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const region: RegionKey = r.region === 'central' || r.region === 'south' ? r.region : 'capital';
  const items: QuoteItem[] = [];
  const seen = new Set<string>();
  for (const it of Array.isArray(r.items) ? r.items.slice(0, 6) : []) {
    const key = (it as { key?: string })?.key as ServiceKey;
    if (!key || seen.has(key) || !(key in SERVICE_TEXT)) continue;
    seen.add(key);
    const o = ((it as { options?: unknown }).options ?? {}) as Record<string, unknown>;
    const base = defaultOptions(key);
    switch (key) {
      case 'acscent':
        items.push({ key, options: {
          guests: clampInt(o.guests, PERFUME.minGuests, 5000, 100),
          volume: o.volume === '50ml' ? '50ml' : '10ml',
          extraTeams: clampInt(o.extraTeams, 0, 10, 0),
          customScent: o.customScent === true,
          premiumPackaging: o.premiumPackaging === true && o.customBox !== true,
          customBox: o.customBox === true && clampInt(o.guests, PERFUME.minGuests, 5000, 100) >= PERFUME.customBox.minGuests,
          analysisKiosks: clampInt(o.analysisKiosks, 0, KIOSK.maxKiosks, 0),
        } });
        break;
      case 'photoBooth':
        items.push({ key, options: {
          booths: clampInt(o.booths, 1, PHOTO_BOOTH.maxBooths, 1),
          extraStyles: clampInt(o.extraStyles, 0, 20, 0),
          extraPrintRolls: clampInt(o.extraPrintRolls, 0, 50, 0),
          photocard: false, // 포토카드 출력 옵션은 없앴다 (예전 저장본·링크 호환용 필드)
          wrapping: o.wrapping === true,
          customStyles: clampInt(o.customStyles, 0, 10, 0),
          custom: o.custom === 'flow' || o.custom === 'dedicated' ? o.custom : 'none',
        } });
        break;
      case 'rental':
        items.push({ key, options: {
          mode: o.mode === 'monthly' ? 'monthly' : 'event',
          kiosks: clampInt(o.kiosks, 1, KIOSK.maxKiosks, 1),
          months: clampInt(o.months, 1, 24, 1),
          printer: o.printer === true,
          extraContents: clampInt(o.extraContents, 0, 10, 0),
          // 예전 저장값(branding: true)은 브랜드 적용으로 읽는다
          custom: o.custom === 'brand' || o.custom === 'content' || o.custom === 'dedicated' ? o.custom : o.branding === true ? 'brand' : 'none',
          experienceSlug: typeof o.experienceSlug === 'string' ? o.experienceSlug.slice(0, 60) : undefined,
        } });
        break;
      case 'mediaArt':
        items.push({ key, options: {
          grade: o.grade === 'premium' || o.grade === 'fullCustom' ? o.grade : 'standard',
          extraSensors: clampInt(o.extraSensors, 0, 10, 0),
        } });
        break;
      case 'spatialDesign':
        items.push({ key, options: {
          size: o.size === 'booth6x3' || o.size === 'large' ? o.size : 'booth3x3',
          pyeong: clampInt(o.pyeong, 10, 500, 10),
          photoZone: o.photoZone === true,
          lighting: o.lighting === true,
        } });
        break;
      case 'custom':
        items.push({ key, options: {
          scope: o.scope === 'large' ? 'large' : 'standard',
          consulting: o.consulting === true,
          maintenanceMonths: clampInt(o.maintenanceMonths, 0, 36, 0),
        } });
        break;
      default:
        items.push(base);
    }
  }
  return {
    eventType: typeof r.eventType === 'string' ? r.eventType.slice(0, 40) : 'other',
    eventDate: typeof r.eventDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(r.eventDate) ? r.eventDate : '',
    days: clampInt(r.days, 1, 60, 1),
    hoursPerDay: clampInt(r.hoursPerDay, 1, 14, COMMON.baseHours),
    attendees: clampInt(r.attendees, 1, 100_000, 100),
    region,
    extraStaff: clampInt(r.extraStaff, 0, 30, 0),
    setupDayBefore: r.setupDayBefore === true,
    items,
  };
}

const won = (n: number, lang: Lang) =>
  lang === 'ko' ? `${n.toLocaleString('ko-KR')}원` : `KRW ${n.toLocaleString('en-US')}`;

/** 인원 구간제: 해당 구간 단가로 계산하되, 다음 구간 최소 인원으로 계산한 금액이 더 낮으면 그 금액을 쓴다 */
export function perfumeGuestCost(guests: number, volume: '10ml' | '50ml') {
  const tier = PERFUME.tiers.find((t) => guests >= t.min && guests <= t.max) ?? PERFUME.tiers[0];
  let best = { amount: tier.unit[volume] * guests, unit: tier.unit[volume], billedGuests: guests };
  for (const next of PERFUME.tiers) {
    if (next.min <= guests) continue;
    const amount = next.unit[volume] * next.min;
    if (amount < best.amount) best = { amount, unit: next.unit[volume], billedGuests: next.min };
  }
  return best;
}

export function calculateQuote(input: QuoteInput, lang: Lang = 'ko'): QuoteResult {
  const L = (ko: string, en: string) => (lang === 'ko' ? ko : en);
  const lines: QuoteLine[] = [];
  const warnings: string[] = [];
  const days = input.days;
  const extraDays = Math.max(0, days - 1);
  const name = (key: ServiceKey) => SERVICE_TEXT[key].name[lang];
  const notes: string[] = [];
  // 포토부스·키오스크 커스텀 개발비 합계와 필요한 준비 기간(일)
  let devAmount = 0;
  let lead = 0;

  for (const item of input.items) {
    switch (item.key) {
      case 'acscent': {
        const o = item.options;
        const cost = perfumeGuestCost(o.guests, o.volume);
        const billedNote = cost.billedGuests > o.guests
          ? L(` (다음 구간 ${cost.billedGuests}명 기준이 더 낮아 적용)`, ` (billed at the ${cost.billedGuests}-guest tier, which is lower)`)
          : '';
        lines.push({ service: 'acscent', label: name('acscent'), detail: L(
          `${o.volume} · ${o.guests}명 × ${won(cost.unit, lang)}${billedNote}`,
          `${o.volume} · ${o.guests} guests × ${won(cost.unit, lang)}${billedNote}`), amount: cost.amount });
        const teams = 1 + o.extraTeams;
        const travel = PERFUME.teamTravel[input.region];
        lines.push({ service: 'acscent', label: L('조향 팀 출장비', 'Perfumer team travel'), detail: L(
          `조향사 1 + 조수 1 · ${teams}팀 × ${days}일 × ${won(travel, lang)}`,
          `1 perfumer + 1 assistant · ${teams} team(s) × ${days} day(s) × ${won(travel, lang)}`), amount: travel * teams * days });
        // 최소 금액 (수도권 99만원, 지방은 출장비 차이만큼 더함)
        const minimum = PERFUME.minimumCharge + (travel - PERFUME.teamTravel.capital);
        const perfumeSubtotal = cost.amount + travel * teams * days;
        if (perfumeSubtotal < minimum) {
          lines.push({ service: 'acscent', label: L('최소 금액 보정', 'Minimum charge adjustment'), detail: L(
            `AI 향수 체험 최소 금액 ${won(minimum, lang)}에 맞춤`,
            `Brought up to the AI Perfume minimum of ${won(minimum, lang)}`), amount: minimum - perfumeSubtotal });
        }
        if (o.customScent) lines.push({ service: 'acscent', label: L('커스텀 향 디자인', 'Custom scent design'), detail: L('브랜드 전용 향 개발', 'Signature scent for the brand'), amount: PERFUME.customScent });
        if (o.premiumPackaging) {
          const pack = PERFUME.premiumPackaging[o.volume];
          lines.push({ service: 'acscent', label: L('고급 선물 포장', 'Premium gift packaging'), detail: L(
            `기본 AC'SCENT 브랜드 패키지 · ${o.volume} ${o.guests}병 × ${won(pack, lang)}`,
            `Standard AC'SCENT brand package · ${o.volume} ${o.guests} bottles × ${won(pack, lang)}`), amount: pack * o.guests });
        }
        if (o.customBox && o.guests >= PERFUME.customBox.minGuests) {
          lines.push({ service: 'acscent', label: L('전용 디자인 단박스', 'Custom-designed gift box'), detail: L(
            `새 디자인 단박스 제작 · 디자인비 포함 최소 금액 · ${o.guests}병 · 상담 후 확정`,
            `New box design and production · minimum incl. design · ${o.guests} bottles · confirmed after consultation`), amount: PERFUME.customBox.minimum });
          notes.push(L(
            `전용 디자인 단박스는 ${PERFUME.customBox.minGuests}명 이상 행사에서 제작할 수 있으며, 디자인비 포함 ${won(PERFUME.customBox.minimum, lang)}부터입니다. 수량·사양·일정에 따라 상담 후 금액을 확정합니다.`,
            `Custom-designed gift boxes are available for ${PERFUME.customBox.minGuests}+ guests, from ${won(PERFUME.customBox.minimum, lang)} including design. The final price depends on quantity, spec and schedule and is set after consultation.`));
        }
        // 분석 방식: 기본은 방문객 휴대폰 QR 웹 분석, 선택 시 분석용 AI 키오스크
        const ak = o.analysisKiosks ?? 0;
        if (ak > 0) {
          lines.push({ service: 'acscent', label: L('분석용 AI 키오스크', 'Analysis kiosks'), detail: L(
            `${ak}대 · 조향 팀이 함께 운반·운영`, `${ak} kiosk(s) · carried and run by the perfumer team`), amount: PERFUME.analysisKiosk * ak });
          if (extraDays) lines.push({ service: 'acscent', label: L('분석용 키오스크 추가 운영일', 'Analysis kiosk extra days'), detail: L(
            `${ak}대 × ${extraDays}일 × ${won(PERFUME.analysisKioskExtraDay, lang)}`, `${ak} × ${extraDays} day(s) × ${won(PERFUME.analysisKioskExtraDay, lang)}`),
            amount: PERFUME.analysisKioskExtraDay * ak * extraDays });
        }
        const capacity = teams * PERFUME.guestsPerTeamHour * input.hoursPerDay * days;
        if (o.guests > capacity) {
          const needTeams = Math.ceil(o.guests / (PERFUME.guestsPerTeamHour * input.hoursPerDay * days));
          warnings.push(L(
            `AI 향수 체험: ${teams}팀으로는 운영 시간 안에 약 ${capacity}명까지 가능합니다. ${o.guests}명이면 조향 팀 ${needTeams}팀을 권장합니다.`,
            `AI Perfume: ${teams} team(s) can serve about ${capacity} guests in the hours set. For ${o.guests} guests we recommend ${needTeams} teams.`));
        }
        break;
      }
      case 'photoBooth': {
        const o = item.options;
        const first = PHOTO_BOOTH.firstBooth + PHOTO_BOOTH.extraBooth * (o.booths - 1);
        lines.push({ service: 'photoBooth', label: name('photoBooth'), detail: L(
          `${o.booths}대 · 1일차 (AI 스타일 ${PHOTO_BOOTH.includedStyles}종·인화 ${PHOTO_BOOTH.printsPerRoll}장·프레임 1종·운송·설치 포함, 운영 인력 별도)`,
          `${o.booths} booth(s) · day 1 (2 AI styles, ${PHOTO_BOOTH.printsPerRoll} prints, 1 frame, delivery & setup; staff not included)`), amount: first });
        if (extraDays) lines.push({ service: 'photoBooth', label: L('포토부스 추가 운영일', 'Photo booth extra days'), detail: L(
          `${o.booths}대 × ${extraDays}일 × ${won(PHOTO_BOOTH.extraDayPerBooth, lang)}`,
          `${o.booths} booth(s) × ${extraDays} day(s) × ${won(PHOTO_BOOTH.extraDayPerBooth, lang)}`), amount: PHOTO_BOOTH.extraDayPerBooth * o.booths * extraDays });
        if (o.extraStyles) lines.push({ service: 'photoBooth', label: L('AI 스타일 추가', 'Extra AI styles'), detail: L(`${o.extraStyles}종`, `${o.extraStyles}`), amount: PHOTO_BOOTH.extraStyle * o.extraStyles });
        if (o.extraPrintRolls) lines.push({ service: 'photoBooth', label: L('인화 추가', 'Extra prints'), detail: L(`${o.extraPrintRolls}롤 (${o.extraPrintRolls * PHOTO_BOOTH.printsPerRoll}장)`, `${o.extraPrintRolls} roll(s) (${o.extraPrintRolls * PHOTO_BOOTH.printsPerRoll} prints)`), amount: PHOTO_BOOTH.extraPrintRoll * o.extraPrintRolls });
        if (o.wrapping) lines.push({ service: 'photoBooth', label: L('부스 랩핑', 'Booth wrapping'), detail: '', amount: PHOTO_BOOTH.wrapping * o.booths });
        if (o.customStyles) {
          const t = CUSTOM_DEV_TEXT.boothStyle;
          lines.push({ service: 'photoBooth', label: L(`포토부스 커스텀 — ${t.name.ko}`, `Photo booth custom — ${t.name.en}`), detail: `${L(`${o.customStyles}종`, `${o.customStyles}`)} · ${t.scope[lang]}`, amount: CUSTOM_DEV.boothStyle * o.customStyles });
          devAmount += CUSTOM_DEV.boothStyle * o.customStyles;
          lead = Math.max(lead, CUSTOM_DEV.leadDays.style);
        }
        if (o.custom && o.custom !== 'none') {
          const t = CUSTOM_DEV_TEXT.booth[o.custom];
          lines.push({ service: 'photoBooth', label: L(`포토부스 커스텀 — ${t.name.ko}`, `Photo booth custom — ${t.name.en}`), detail: `${t.scope[lang]} · ${L('1회 개발비', 'one-time')}`, amount: CUSTOM_DEV.booth[o.custom] });
          devAmount += CUSTOM_DEV.booth[o.custom];
          lead = Math.max(lead, CUSTOM_DEV.leadDays[o.custom]);
        }
        const expectedPrints = input.attendees;
        const includedPrints = PHOTO_BOOTH.printsPerRoll * (o.booths + o.extraPrintRolls);
        if (expectedPrints > includedPrints) warnings.push(L(
          `AI 포토부스: 예상 인원(${input.attendees}명)이 포함 인화 매수(${includedPrints}장)보다 많습니다. 인화 추가를 고려하세요.`,
          `AI Photo Booth: expected guests (${input.attendees}) exceed included prints (${includedPrints}). Consider extra prints.`));
        break;
      }
      case 'rental': {
        const o = item.options;
        if (o.mode === 'monthly') {
          lines.push({ service: 'rental', label: L('AI 키오스크 상시 운영', 'AI Kiosk ongoing operation'), detail: L(
            `${o.kiosks}대 × ${o.months}개월 × ${won(KIOSK.monthlyPerKiosk, lang)} (콘텐츠 월 1회 교체 포함)`,
            `${o.kiosks} kiosk(s) × ${o.months} month(s) × ${won(KIOSK.monthlyPerKiosk, lang)} (monthly content refresh)`), amount: KIOSK.monthlyPerKiosk * o.kiosks * o.months });
        } else {
          lines.push({ service: 'rental', label: name('rental'), detail: L(
            `${o.kiosks}대 · 1일차 (기존 체험 1종 그대로 운영·카메라·운반·설치 포함, 운영 인력 별도)`,
            `${o.kiosks} kiosk(s) · day 1 (1 existing experience as-is, camera, delivery & setup; staff not included)`), amount: KIOSK.firstKiosk + KIOSK.extraKiosk * (o.kiosks - 1) });
          if (extraDays) lines.push({ service: 'rental', label: L('키오스크 추가 운영일', 'Kiosk extra days'), detail: L(
            `${o.kiosks}대 × ${extraDays}일 × ${won(KIOSK.extraDayPerKiosk, lang)}`,
            `${o.kiosks} kiosk(s) × ${extraDays} day(s) × ${won(KIOSK.extraDayPerKiosk, lang)}`), amount: KIOSK.extraDayPerKiosk * o.kiosks * extraDays });
        }
        if (o.printer) lines.push({ service: 'rental', label: L('즉석 프린터', 'Instant printer'), detail: L(`${o.kiosks}대`, `${o.kiosks}`), amount: KIOSK.printer * o.kiosks });
        if (o.custom && o.custom !== 'none') {
          const t = CUSTOM_DEV_TEXT.kiosk[o.custom];
          lines.push({ service: 'rental', label: L(`키오스크 커스텀 — ${t.name.ko}`, `Kiosk custom — ${t.name.en}`), detail: `${t.scope[lang]} · ${L('1회 개발비', 'one-time')}`, amount: CUSTOM_DEV.kiosk[o.custom] });
          devAmount += CUSTOM_DEV.kiosk[o.custom];
          lead = Math.max(lead, CUSTOM_DEV.leadDays[o.custom]);
        }
        if (o.extraContents) lines.push({ service: 'rental', label: L('체험 콘텐츠 추가', 'Extra experiences'), detail: L(`${o.extraContents}종`, `${o.extraContents}`), amount: KIOSK.extraContent * o.extraContents });
        break;
      }
      case 'mediaArt': {
        const o = item.options;
        lines.push({ service: 'mediaArt', label: L('미디어 아트 콘텐츠 제작', 'Media art production'), detail: `${OPTION_TEXT.production[o.grade][lang]} · ${L('1회', 'one-time')}`, amount: MEDIA_ART.production[o.grade] });
        lines.push({ service: 'mediaArt', label: L('미디어 아트 장비·운영', 'Media art equipment & operation'), detail: L(
          `${days}일 (프로젝터 1대·센서 1세트·운영 1인)`, `${days} day(s) (1 projector, 1 sensor set, 1 operator)`),
          amount: MEDIA_ART.operationFirstDay + MEDIA_ART.operationExtraDay * extraDays });
        if (o.extraSensors) lines.push({ service: 'mediaArt', label: L('모션 센서 추가', 'Extra motion sensors'), detail: L(`${o.extraSensors}세트`, `${o.extraSensors} set(s)`), amount: MEDIA_ART.extraSensor * o.extraSensors });
        break;
      }
      case 'spatialDesign': {
        const o = item.options;
        if (o.size === 'large') {
          lines.push({ service: 'spatialDesign', label: name('spatialDesign'), detail: L(
            `팝업·공간 약 ${o.pyeong}평 × 평당 ${won(SPACE.perPyeong, lang)}부터 · 실측 후 확정`,
            `About ${o.pyeong} pyeong × from ${won(SPACE.perPyeong, lang)} per pyeong · confirmed after site survey`),
            amount: SPACE.perPyeong * o.pyeong, tbd: true });
        } else {
          lines.push({ service: 'spatialDesign', label: name('spatialDesign'), detail: L(
            `${OPTION_TEXT.space[o.size].ko} · 디자인·구조물·그래픽·기본 조명·설치·철수`,
            `${OPTION_TEXT.space[o.size].en} · design, structure, graphics, basic lighting, install & teardown`), amount: SPACE[o.size] });
        }
        if (o.photoZone) lines.push({ service: 'spatialDesign', label: L('포토존 디자인', 'Photo zone design'), detail: '', amount: SPACE.photoZone });
        if (o.lighting) lines.push({ service: 'spatialDesign', label: L('커스텀 조명', 'Custom lighting'), detail: '', amount: SPACE.lighting });
        break;
      }
      case 'custom': {
        const o = item.options;
        lines.push({ service: 'custom', label: name('custom'), detail: `${OPTION_TEXT.scope[o.scope][lang]} · ${L('1회 개발비', 'one-time')}`, amount: CUSTOM.scope[o.scope] });
        if (o.consulting) lines.push({ service: 'custom', label: L('기획 컨설팅', 'Planning consultation'), detail: '', amount: CUSTOM.consulting });
        if (o.maintenanceMonths) lines.push({ service: 'custom', label: L('유지보수', 'Maintenance'), detail: L(`${o.maintenanceMonths}개월 × ${won(CUSTOM.maintenancePerMonth, lang)}`, `${o.maintenanceMonths} month(s) × ${won(CUSTOM.maintenancePerMonth, lang)}`), amount: CUSTOM.maintenancePerMonth * o.maintenanceMonths });
        break;
      }
    }
  }

  const hasOnsite = input.items.some((i) => i.key !== 'custom' && !(i.key === 'rental' && i.options.mode === 'monthly'));
  // 키오스크는 보유 대수 안에서만 쓸 수 있다 (AI 키오스크 + 분석용 키오스크)
  const kioskTotal = input.items.reduce((n, i) => n + (i.key === 'rental' ? i.options.kiosks : i.key === 'acscent' ? (i.options.analysisKiosks ?? 0) : 0), 0);
  if (kioskTotal > KIOSK.maxKiosks) warnings.push(L(
    `키오스크가 모두 ${kioskTotal}대입니다. 보유 대수(${KIOSK.maxKiosks}대)를 넘는 부분은 상담이 필요합니다.`,
    `${kioskTotal} kiosks requested in total; we have ${KIOSK.maxKiosks}. The rest needs a consultation.`));
  if (hasOnsite && input.setupDayBefore) {
    lines.push({ service: 'common', label: L('전날 사전 설치', 'Setup the day before'), detail: L('2인 · 행사 전날 설치', '2 people · day before the event'), amount: COMMON.setupDayBefore });
  }
  if (hasOnsite && input.extraStaff > 0) {
    lines.push({ service: 'common', label: L('현장 운영 인력', 'On-site staff'), detail: L(
      `${input.extraStaff}명 × ${days}일 × ${won(COMMON.staffPerDay, lang)}`,
      `${input.extraStaff} × ${days} day(s) × ${won(COMMON.staffPerDay, lang)}`), amount: COMMON.staffPerDay * input.extraStaff * days });
  }
  const extraHours = Math.max(0, input.hoursPerDay - COMMON.baseHours);
  if (hasOnsite && extraHours > 0) {
    lines.push({ service: 'common', label: L('연장 운영', 'Extended hours'), detail: L(
      `기본 ${COMMON.baseHours}시간 초과 ${extraHours}시간 × ${days}일 × ${won(COMMON.extraHourPerDay, lang)}`,
      `${extraHours} h beyond ${COMMON.baseHours} h × ${days} day(s) × ${won(COMMON.extraHourPerDay, lang)}`), amount: COMMON.extraHourPerDay * extraHours * days });
  }
  // 지방 운송비 (행사당 1회): 용달이 필요한 상품이 있으면 용달 기준, 키오스크만 있으면 직접 운반 기준
  const needsTruck = input.items.some((i) => i.key === 'photoBooth' || i.key === 'spatialDesign' || i.key === 'mediaArt');
  const hasKiosk = input.items.some((i) => i.key === 'rental');
  const travel = needsTruck ? COMMON.travel[input.region] : hasKiosk ? KIOSK.travel[input.region] : 0;
  if (travel > 0) {
    lines.push({ service: 'common', label: L('지방 운송비', 'Regional transport'), detail: L('설치·철수 운송, 행사당 1회', 'setup & teardown transport, once per event'), amount: travel });
  }

  // 긴급 제작: 행사 일자가 필요한 준비 기간보다 가까우면 개발비의 30%
  if (devAmount > 0) {
    notes.push(CUSTOM_TERMS[lang]);
    if (input.eventDate) {
      const today = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
      const daysLeft = Math.round((Date.parse(input.eventDate) - Date.parse(today)) / 86400000);
      if (daysLeft < lead) {
        lines.push({ service: 'common', label: L('긴급 제작', 'Rush production'), detail: L(
          `행사까지 ${Math.max(0, daysLeft)}일 · 커스텀 준비 기간 ${lead}일 미만 · 개발비의 ${Math.round(CUSTOM_DEV.rushRate * 100)}%`,
          `${Math.max(0, daysLeft)} day(s) to the event, under the ${lead}-day lead time · ${Math.round(CUSTOM_DEV.rushRate * 100)}% of development`),
          amount: Math.round(devAmount * CUSTOM_DEV.rushRate) });
      }
    }
  }

  const supply = lines.filter((l) => !l.tbd).reduce((sum, l) => sum + l.amount, 0);
  const vat = Math.round(supply * COMMON.vatRate);
  return { lines, supply, vat, total: supply + vat, warnings, notes };
}

/** 서비스별 시작가 (옵션 최소, 1일, 수도권) — 서비스 페이지·스펙 카드용 */
export function startingPrice(key: ServiceKey): number {
  switch (key) {
    case 'acscent': return Math.max(PERFUME.minimumCharge, PERFUME.tiers[0].unit['10ml'] * PERFUME.minGuests + PERFUME.teamTravel.capital);
    case 'photoBooth': return PHOTO_BOOTH.firstBooth;
    case 'rental': return KIOSK.firstKiosk;
    case 'mediaArt': return MEDIA_ART.production.standard + MEDIA_ART.operationFirstDay;
    case 'spatialDesign': return SPACE.booth3x3;
    case 'custom': return CUSTOM.scope.standard;
  }
}

/** 체험(slug)에서 견적으로 넘어올 때 미리 담을 서비스 */
export function serviceForExperience(slug: string, pillar: string | undefined): ServiceKey | null {
  if (slug === 'ai-scent-soulmate') return 'acscent';
  if (!pillar) return null;
  if (pillar === 'ai-photo') return 'photoBooth';
  if (pillar === 'ai-immersive') return 'mediaArt';
  return 'rental';
}

/** 금액을 한글로 (가견적서의 "일금 ○○원정") */
export function koreanAmount(n: number): string {
  if (n === 0) return '영';
  const digits = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
  const small = ['', '십', '백', '천'];
  const big = ['', '만', '억', '조'];
  let out = '';
  let group = 0;
  while (n > 0) {
    const part = n % 10000;
    if (part > 0) {
      let s = '';
      let p = part;
      for (let i = 0; i < 4 && p > 0; i++) {
        const d = p % 10;
        if (d) s = digits[d] + small[i] + s;
        p = Math.floor(p / 10);
      }
      out = s + big[group] + out;
    }
    n = Math.floor(n / 10000);
    group++;
  }
  return out;
}
