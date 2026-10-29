import {
  COMMON, CUSTOM_DEV, CUSTOM_DEV_TEXT, CUSTOM_TERMS, KIOSK, PERFUME, PHOTO_BOOTH, SERVICE_TEXT, SPACE, isConsultationService,
  type BoothBuild, type BoothCustom, type KioskCustom, type Lang, normalizeRegion, type RegionKey, type ServiceKey,
} from './catalog';
import { getPhotoBoothTemplates, normalizePhotoBoothTemplateSlugs } from './photo-booth-templates';
import { formatKioskNumbers, getKioskAssignments, getKioskExperience, groupKioskAssignments, normalizeKioskExperienceSlugs } from './kiosk-experiences';
import { normalizePyeong, type AreaUnit } from './space-area';

/* ─────────────────────────────────────────────────────────
   견적 계산 엔진 — 화면과 PDF가 같은 결과를 내도록 순수 함수로 둔다.
   ───────────────────────────────────────────────────────── */

export interface PerfumeOptions { guests: number; volume: '10ml' | '50ml'; extraTeams: number; /** 자동 증원 전 고객이 선택한 추가 팀 수. 자동 증원이 필요할 때만 저장한다. */ requestedExtraTeams?: number; customScent: boolean; premiumPackaging: boolean; /** 전용 디자인 단박스 (300명 이상) — premiumPackaging 대신 */ customBox?: boolean; /** 분석용 AI 키오스크 대수 (0 = QR 웹 분석) */ analysisKiosks?: number }
export interface PhotoBoothOptions { booths: number; extraStyles: number; extraPrintRolls: number; photocard: boolean; wrapping: boolean; customStyles?: number; custom?: BoothCustom; /** Chosen existing demo templates; omitted for legacy quantity-only estimates. */ templateSlugs?: string[] }
export interface KioskOptions { mode: 'event' | 'monthly'; kiosks: number; months: number; printer: boolean; extraContents: number; custom?: KioskCustom; experienceSlug?: string; /** One experience per kiosk, in kiosk-number order. Empty slots are undecided. */ experienceSlugs?: string[] }
export interface MediaArtOptions { grade: 'standard' | 'premium' | 'fullCustom'; extraSensors: number; sensorType?: 'image' | 'depth' }
export interface SpaceOptions {
  size: 'booth3x3' | 'booth6x3' | 'large'; pyeong: number; areaUnit?: AreaUnit; photoZone: boolean; lighting: boolean;
  /** 부스 구조. 비우면 조립식 천 부스 — 나무 가벽을 고를 때만 저장해 예전 견적과 모양이 같다 */
  build?: BoothBuild;
}

/** 부스(3×3·6×3) 금액 — 구조에 따라 */
export function boothPrice(size: 'booth3x3' | 'booth6x3', build: BoothBuild = 'fabric'): number {
  return build === 'wood' ? SPACE.woodBooth[size] : SPACE[size];
}
export interface CustomOptions { scope: 'standard' | 'large'; consulting: boolean; maintenanceMonths: number; pgIntegration?: boolean }

export type QuoteItem =
  | { key: 'acscent'; options: PerfumeOptions }
  | { key: 'photoBooth'; options: PhotoBoothOptions }
  | { key: 'rental'; options: KioskOptions }
  | { key: 'mediaArt'; options: MediaArtOptions }
  | { key: 'spatialDesign'; options: SpaceOptions }
  | { key: 'custom'; options: CustomOptions };

export interface QuoteInput {
  eventType: string;
  /** Customer-entered event name; optional for older saved estimates. */
  eventName?: string;
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

/** Perfume participants are the total across all operating days, not per day.
 * Keep the customer's team preference separate from automatic capacity increases,
 * so reducing guests or extending the schedule can release automatic teams. */
export function getPerfumeStaffing(options: Pick<PerfumeOptions, 'guests' | 'extraTeams' | 'requestedExtraTeams'>, schedule: Pick<QuoteInput, 'days' | 'hoursPerDay'>) {
  const guests = clampInt(options.guests, PERFUME.minGuests, 5000, 100);
  const days = clampInt(schedule.days, 1, 60, 1);
  const hoursPerDay = clampInt(schedule.hoursPerDay, 1, 14, COMMON.baseHours);
  const capacityPerTeam = PERFUME.guestsPerTeamHour * hoursPerDay * days;
  const requiredTeams = Math.ceil(guests / capacityPerTeam);
  const minimumTeams = Math.max(PERFUME.includedTeams, requiredTeams);
  const requestedExtraTeams = clampInt(options.requestedExtraTeams ?? options.extraTeams, 0, Number.MAX_SAFE_INTEGER - PERFUME.includedTeams, 0);
  const teams = Math.max(minimumTeams, PERFUME.includedTeams + requestedExtraTeams);
  return {
    days, hoursPerDay, capacityPerTeam, minimumTeams, teams, requestedExtraTeams,
    automaticTeams: teams - PERFUME.includedTeams - requestedExtraTeams,
    capacity: teams * capacityPerTeam,
    requiresConsultation: teams > PERFUME.standardTeams,
  };
}

/** Resolve teams in the stored/UI model as well as pricing, keeping SVG headcount
 * and summaries in sync. Legacy extraTeams remain the customer's preference. */
export function normalizePerfumeStaffing(input: QuoteInput): QuoteInput {
  return { ...input, items: input.items.map((item) => {
    if (item.key !== 'acscent') return item;
    const staffing = getPerfumeStaffing(item.options, input);
    const options = { ...item.options, extraTeams: staffing.teams - PERFUME.includedTeams };
    if (staffing.automaticTeams > 0) options.requestedExtraTeams = staffing.requestedExtraTeams;
    else delete options.requestedExtraTeams;
    return { ...item, options };
  }) };
}

export function defaultOptions(key: ServiceKey, attendees = 100): QuoteItem {
  switch (key) {
    case 'acscent':
      return { key, options: { guests: Math.max(PERFUME.minGuests, Math.min(attendees, 5000)), volume: '10ml', extraTeams: 0, customScent: false, premiumPackaging: false } };
    case 'photoBooth':
      return { key, options: { booths: 1, extraStyles: 0, extraPrintRolls: 0, photocard: false, wrapping: false } };
    case 'rental':
      return { key, options: { mode: 'event', kiosks: 1, months: 1, printer: false, extraContents: 0, custom: 'none' } };
    case 'mediaArt':
      return { key, options: { grade: 'standard', extraSensors: 0, sensorType: 'image' } };
    case 'spatialDesign':
      return { key, options: { size: 'booth3x3', pyeong: 10, photoZone: false, lighting: false } };
    case 'custom':
      return { key, options: { scope: 'standard', consulting: false, maintenanceMonths: 0, pgIntegration: false } };
  }
}

/** 외부 입력(요청 본문·저장된 값)을 안전한 범위로 정리한다 */
export function sanitizeInput(raw: unknown): QuoteInput {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const region: RegionKey = normalizeRegion(r.region);
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
          extraTeams: clampInt(o.extraTeams, 0, Number.MAX_SAFE_INTEGER - PERFUME.includedTeams, 0),
          ...(o.requestedExtraTeams === undefined ? {} : { requestedExtraTeams: clampInt(o.requestedExtraTeams, 0, Number.MAX_SAFE_INTEGER - PERFUME.includedTeams, 0) }),
          customScent: o.customScent === true,
          premiumPackaging: o.premiumPackaging === true && o.customBox !== true,
          customBox: o.customBox === true && clampInt(o.guests, PERFUME.minGuests, 5000, 100) >= PERFUME.customBox.minGuests,
          analysisKiosks: clampInt(o.analysisKiosks, 0, KIOSK.maxKiosks, 0),
        } });
        break;
      case 'photoBooth': {
        const templateSlugs = o.templateSlugs === undefined ? undefined : normalizePhotoBoothTemplateSlugs(o.templateSlugs);
        items.push({ key, options: {
          booths: clampInt(o.booths, 1, PHOTO_BOOTH.maxBooths, 1),
          extraStyles: templateSlugs === undefined ? clampInt(o.extraStyles, 0, 20, 0) : Math.max(0, templateSlugs.length - PHOTO_BOOTH.includedStyles),
          extraPrintRolls: clampInt(o.extraPrintRolls, 0, 50, 0),
          photocard: false, // 포토카드 출력 옵션은 없앴다 (예전 저장본·링크 호환용 필드)
          wrapping: o.wrapping === true,
          customStyles: clampInt(o.customStyles, 0, 10, 0),
          custom: o.custom === 'flow' || o.custom === 'dedicated' ? o.custom : 'none',
          ...(templateSlugs === undefined ? {} : { templateSlugs }),
        } });
        break;
      }
      case 'rental': {
        const kiosks = clampInt(o.kiosks, 1, KIOSK.maxKiosks, 1);
        const experienceSlugs = o.experienceSlugs === undefined ? undefined : normalizeKioskExperienceSlugs(o.experienceSlugs, kiosks);
        items.push({ key, options: {
          mode: o.mode === 'monthly' ? 'monthly' : 'event',
          kiosks,
          months: clampInt(o.months, 1, 24, 1),
          printer: o.printer === true,
          extraContents: experienceSlugs === undefined ? clampInt(o.extraContents, 0, 10, 0) : 0,
          // 예전 저장값(branding: true)은 브랜드 적용으로 읽는다
          custom: o.custom === 'brand' || o.custom === 'content' || o.custom === 'dedicated' ? o.custom : o.branding === true ? 'brand' : 'none',
          experienceSlug: experienceSlugs === undefined ? (typeof o.experienceSlug === 'string' ? o.experienceSlug.slice(0, 60) : undefined) : experienceSlugs[0] || undefined,
          ...(experienceSlugs === undefined ? {} : { experienceSlugs }),
        } });
        break;
      }
      case 'mediaArt':
        items.push({ key, options: {
          grade: o.grade === 'premium' || o.grade === 'fullCustom' ? o.grade : 'standard',
          extraSensors: clampInt(o.extraSensors, 0, 10, 0),
          sensorType: o.sensorType === 'depth' ? 'depth' : 'image',
        } });
        break;
      case 'spatialDesign':
        items.push({ key, options: {
          size: o.size === 'booth6x3' || o.size === 'large' ? o.size : 'booth3x3',
          pyeong: normalizePyeong(o.pyeong),
          ...(o.areaUnit === 'sqm' || o.areaUnit === 'pyeong' ? { areaUnit: o.areaUnit } : {}),
          photoZone: o.photoZone === true,
          lighting: o.lighting === true,
          ...(o.build === 'wood' ? { build: 'wood' as const } : {}),
        } });
        break;
      case 'custom':
        items.push({ key, options: {
          scope: o.scope === 'large' ? 'large' : 'standard',
          consulting: o.consulting === true,
          pgIntegration: o.pgIntegration === true,
          maintenanceMonths: clampInt(o.maintenanceMonths, 0, 36, 0),
        } });
        break;
      default:
        items.push(base);
    }
  }
  return normalizePerfumeStaffing({
    eventType: typeof r.eventType === 'string' ? r.eventType.slice(0, 40) : 'other',
    ...(typeof r.eventName === 'string' ? { eventName: r.eventName.trim().slice(0, 200) } : {}),
    eventDate: typeof r.eventDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(r.eventDate) ? r.eventDate : '',
    days: clampInt(r.days, 1, 60, 1),
    hoursPerDay: clampInt(r.hoursPerDay, 1, 14, COMMON.baseHours),
    attendees: clampInt(r.attendees, 1, 100_000, 100),
    region,
    extraStaff: clampInt(r.extraStaff, 0, 30, 0),
    setupDayBefore: r.setupDayBefore === true,
    items,
  });
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
        const staffing = getPerfumeStaffing(o, input);
        const teams = staffing.teams;
        const travel = PERFUME.teamTravel[input.region];
        lines.push({ service: 'acscent', label: L('조향 팀 출장비', 'Perfumer team travel'), detail: L(
          `조향사 1 + 조수 1 · ${teams}팀 × ${days}일 × ${won(travel, lang)}`,
          `1 perfumer + 1 assistant · ${teams} team(s) × ${days} day(s) × ${won(travel, lang)}`), amount: travel * teams * days });
        // 최소 금액 (서울 99만원, 다른 지역은 출장비 차이만큼 더함)
        const minimum = PERFUME.minimumCharge + (travel - PERFUME.teamTravel.seoul);
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
        if (staffing.requiresConsultation) {
          warnings.push(L(
            `AI 향수 체험: 조향 ${teams}팀을 선택했습니다. 기본 운영 규모(${PERFUME.standardTeams}팀)를 초과해 상담이 필요합니다. 선택한 팀 수의 출장비를 가견적에 반영했으며, 인력 배치·운영 계획과 최종 금액은 상담 후 확정합니다.`,
            `AI Perfume: ${teams} perfumer teams selected. This exceeds our standard ${PERFUME.standardTeams}-team setup and requires consultation. Travel fees for all selected teams are included in this estimate; staffing, the operating plan and final price will be confirmed after consultation.`));
        }
        break;
      }
      case 'photoBooth': {
        const o = item.options;
        const templates = getPhotoBoothTemplates(o.templateSlugs);
        const extraStyles = o.templateSlugs === undefined ? o.extraStyles : Math.max(0, templates.length - PHOTO_BOOTH.includedStyles);
        const templateDetail = templates.length ? L(` · 선택한 기존 템플릿: ${templates.map((template) => template.name.ko).join(', ')}`, ` · Selected existing templates: ${templates.map((template) => template.name.en).join(', ')}`) : '';
        const first = PHOTO_BOOTH.firstBooth + PHOTO_BOOTH.extraBooth * (o.booths - 1);
        lines.push({ service: 'photoBooth', label: name('photoBooth'), detail: L(
          `${o.booths}대 · 1일차 (AI 스타일 ${PHOTO_BOOTH.includedStyles}종·인화 ${PHOTO_BOOTH.printsPerRoll}장·프레임 1종·운송·설치 포함, 운영 인력 별도)`,
          `${o.booths} booth(s) · day 1 (2 AI styles, ${PHOTO_BOOTH.printsPerRoll} prints, 1 frame, delivery & setup; staff not included)`) + templateDetail, amount: first });
        if (extraDays) lines.push({ service: 'photoBooth', label: L('포토부스 추가 운영일', 'Photo booth extra days'), detail: L(
          `${o.booths}대 × ${extraDays}일 × ${won(PHOTO_BOOTH.extraDayPerBooth, lang)}`,
          `${o.booths} booth(s) × ${extraDays} day(s) × ${won(PHOTO_BOOTH.extraDayPerBooth, lang)}`), amount: PHOTO_BOOTH.extraDayPerBooth * o.booths * extraDays });
        if (extraStyles) lines.push({ service: 'photoBooth',
          label: o.templateSlugs === undefined ? L('AI 스타일 추가', 'Extra AI styles') : L('기존 AI 템플릿 추가', 'Additional existing AI templates'),
          detail: o.templateSlugs === undefined ? L(`${extraStyles}종`, `${extraStyles}`) : L(`${extraStyles}종 × ${won(PHOTO_BOOTH.extraStyle, lang)} · 기본 ${PHOTO_BOOTH.includedStyles}종 초과분`, `${extraStyles} × ${won(PHOTO_BOOTH.extraStyle, lang)} beyond the ${PHOTO_BOOTH.includedStyles} included styles`),
          amount: PHOTO_BOOTH.extraStyle * extraStyles });
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
        const assigned = o.experienceSlugs !== undefined;
        // 같은 체험을 운영하는 기기는 묶는다 — '1–2번 키오스크: A / 3–4번 키오스크: B'
        const assignmentDetail = assigned ? ' · ' + groupKioskAssignments(getKioskAssignments(o)).map(({ slug, kiosks }) => {
          const experience = getKioskExperience(slug);
          return L(`${formatKioskNumbers(kiosks, 'ko')} 키오스크: ${experience?.name.ko ?? '상담 후 결정'}`, `${formatKioskNumbers(kiosks, 'en')}: ${experience?.name.en ?? 'Decide later'}`);
        }).join(' / ') : '';
        if (o.mode === 'monthly') {
          lines.push({ service: 'rental', label: L('AI 키오스크 상시 운영', 'AI Kiosk ongoing operation'), detail: L(
            `${o.kiosks}대 × ${o.months}개월 × ${won(KIOSK.monthlyPerKiosk, lang)} (콘텐츠 월 1회 교체 포함)`,
            `${o.kiosks} kiosk(s) × ${o.months} month(s) × ${won(KIOSK.monthlyPerKiosk, lang)} (monthly content refresh)`) + assignmentDetail, amount: KIOSK.monthlyPerKiosk * o.kiosks * o.months });
        } else {
          lines.push({ service: 'rental', label: name('rental'), detail: L(
            `${o.kiosks}대 · 1일차 (${assigned ? '대당 ' : ''}기존 체험 1종 그대로 운영·카메라·운반·설치 포함, 운영 인력 별도)`,
            `${o.kiosks} kiosk(s) · day 1 (1 existing experience${assigned ? ' per kiosk' : ''} as-is, camera, delivery & setup; staff not included)`) + assignmentDetail, amount: KIOSK.firstKiosk + KIOSK.extraKiosk * (o.kiosks - 1) });
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
        if (!assigned && o.extraContents) lines.push({ service: 'rental', label: L('체험 콘텐츠 추가', 'Extra experiences'), detail: L(`${o.extraContents}종`, `${o.extraContents}`), amount: KIOSK.extraContent * o.extraContents });
        break;
      }
      case 'mediaArt':
      case 'spatialDesign':
      case 'custom':
        lines.push({ service: item.key, label: name(item.key),
          detail: L('별도 문의가 필요합니다. 상담 후 견적을 안내해 드립니다.', 'Please contact us for a separate quote.'),
          amount: 0, tbd: true });
        break;
    }
  }

  const hasOnsite = input.items.some((i) => !isConsultationService(i.key) && !(i.key === 'rental' && i.options.mode === 'monthly'));
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
  // 지역 운송비 (행사당 1회): 용달이 필요한 상품이 있으면 용달 기준, 키오스크만 있으면 직접 운반 기준
  const needsTruck = input.items.some((i) => i.key === 'photoBooth');
  const hasKiosk = input.items.some((i) => i.key === 'rental');
  const travel = needsTruck ? COMMON.travel[input.region] : hasKiosk ? KIOSK.travel[input.region] : 0;
  if (travel > 0) {
    lines.push({ service: 'common', label: L('지역 운송비', 'Regional transport'), detail: L('설치·철수 운송, 행사당 1회', 'setup & teardown transport, once per event'), amount: travel });
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

/** 서비스별 시작가 (옵션 최소, 1일, 서울) — 서비스 페이지·스펙 카드용 */
export function startingPrice(key: ServiceKey): number {
  switch (key) {
    case 'acscent': return Math.max(PERFUME.minimumCharge, PERFUME.tiers[0].unit['10ml'] * PERFUME.minGuests + PERFUME.teamTravel.seoul);
    case 'photoBooth': return PHOTO_BOOTH.firstBooth;
    case 'rental': return KIOSK.firstKiosk;
    case 'mediaArt':
    case 'spatialDesign':
    case 'custom': return 0; // A separate inquiry is required; there is no online starting price.
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
