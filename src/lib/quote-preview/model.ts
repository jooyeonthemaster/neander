import { COMMON, PERFUME, type Lang } from '../quote/catalog';
import { defaultOptions, sanitizeInput, type QuoteInput } from '../quote/engine';
import { formatSpaceArea } from '../quote/space-area';

export type PreviewView = 'combined' | 'space' | 'top';

export interface PreviewIllustration {
  id: string;
  alt: string;
  label: string;
}

export interface PreviewModel {
  scene: PreviewIllustration;
  product: PreviewIllustration | null;
  extras: PreviewIllustration[];
  badges: string[];
  notes: string[];
  analysisKiosks: number;
}

export const PREVIEW_STORAGE_KEY = 'neander-quote-preview-v1';

export function createPreviewInput(): QuoteInput {
  return sanitizeInput({
    eventType: 'popup', eventDate: '', days: 1, hoursPerDay: COMMON.baseHours,
    attendees: 100, region: 'seoul', extraStaff: 0, setupDayBefore: false,
    items: [defaultOptions('acscent', 100), defaultOptions('spatialDesign')],
  });
}

/** Resolve illustration descriptions from the same normalized quote options.
 * Prices remain in calculateQuote; descriptions never change the input.
 */
export function resolvePreview(input: QuoteInput, view: PreviewView, lang: Lang): PreviewModel {
  const normalized = sanitizeInput(input);
  const perfume = normalized.items.find((item) => item.key === 'acscent')?.options;
  const space = normalized.items.find((item) => item.key === 'spatialDesign')?.options;
  const L = (ko: string, en: string) => lang === 'ko' ? ko : en;
  const asset = (id: string, label: string, alt = label): PreviewIllustration => ({ id, label, alt });
  const analysisKiosks = perfume?.analysisKiosks ?? 0;
  const analysis = analysisKiosks > 0 ? 'kiosk' : 'qr';
  const badges: string[] = [];
  const notes: string[] = [];
  const extras: PreviewIllustration[] = [];
  let product: PreviewIllustration | null = null;

  if (perfume) {
    const packaging = perfume.customBox ? 'custom' : perfume.premiumPackaging ? 'brand' : 'none';
    const packagingLabel = packaging === 'custom'
      ? L('전용 디자인 단박스', 'Custom-designed box')
      : packaging === 'brand' ? L("AC'SCENT 선물 포장", "AC'SCENT gift packaging") : L('기본 무지 패키지', 'Plain package included');
    product = asset(`perfume-${perfume.volume}-${packaging}`, `${perfume.volume} · ${packagingLabel}`,
      packaging === 'none'
        ? L(`${perfume.volume} 향수 병 예시 · 포함된 무지 패키지는 생략`, `${perfume.volume} perfume bottle example; the included plain package is not pictured`)
        : L(`${perfume.volume} 향수와 ${packagingLabel} 구성 예시`, `${perfume.volume} perfume with ${packagingLabel.toLowerCase()}, illustrative example`));
    badges.push(`${perfume.volume} · ${L(`${perfume.guests.toLocaleString('ko-KR')}명`, `${perfume.guests.toLocaleString('en-US')} guests`)}`);
    badges.push(analysisKiosks > 0 ? L(`분석 키오스크 ${analysisKiosks}대`, `${analysisKiosks} analysis kiosk${analysisKiosks > 1 ? 's' : ''}`) : L('휴대폰 QR 분석', 'Phone QR analysis'));
    if (packaging !== 'none') badges.push(packagingLabel);
    if (perfume.customBox) notes.push(L('전용 단박스의 색상과 디자인은 예시이며 상담 후 정해요.', 'Custom box colors and artwork are examples; the final design is agreed during consultation.'));
    badges.push(L(`조향 ${PERFUME.includedTeams + perfume.extraTeams}팀 · ${(PERFUME.includedTeams + perfume.extraTeams) * 2}명`, `${PERFUME.includedTeams + perfume.extraTeams} teams · ${(PERFUME.includedTeams + perfume.extraTeams) * 2} staff`));
    if (perfume.extraTeams > 0) notes.push(L('한 팀은 조향사 1명과 보조 1명이에요. 각 팀의 작업 위치와 동선은 선택한 공간에 맞춰 함께 정해요.', 'Each team has one perfumer and one assistant. Each team’s work position is planned to suit the selected space.'));
    if (perfume.customScent) {
      extras.push(asset('custom-scent-development', L('브랜드만의 향 개발', 'Your signature scent'), L('선택한 향수와 향의 원료를 표현한 일러스트', 'The selected perfume with illustrated fragrance ingredients')));
      notes.push(L('전용 향 개발은 향을 만드는 과정에 반영돼요. 병의 모양은 그대로예요.', 'Signature scent development changes the fragrance; the bottle shape stays the same.'));
    }
  }

  if (space) {
    const boothSize = space.size === 'booth6x3' ? '6 × 3 m' : '3 × 3 m';
    badges.push(space.size === 'large' ? L(`맞춤 공간 · ${formatSpaceArea(space, lang)}`, `Custom space · ${formatSpaceArea(space, lang)}`)
      : space.build === 'wood' ? L(`${boothSize} · 나무 가벽`, `${boothSize} · wooden walls`) : boothSize);
    if (space.photoZone) badges.push(L('포토존', 'Photo zone'));
    if (space.lighting) badges.push(L('추가 조명', 'Additional lighting'));
    notes.push(L('기본 조명은 공간 구성에 포함돼요. 조명 옵션은 추가 연출 조명이에요.', 'Basic lighting is included with the space. The lighting option adds decorative lighting.'));
  }

  let scene: PreviewIllustration;
  if (!space) {
    if (perfume) {
      scene = asset(`experience-neutral-${analysis}`, L('우리 행사에서 만나는 조향 체험', 'A perfume experience at your event'),
        L(`조향 테이블과 원료를 갖춘 향수 체험, ${analysisKiosks > 0 ? '분석 키오스크' : '방문객 휴대폰 QR'} 이용 예시`, `A practical perfume workshop with a blending table, ingredients and ${analysisKiosks > 0 ? 'an analysis kiosk' : 'phone QR analysis'}`));
      notes.push(L('행사장에 조향 체험을 설치한 예시예요. 별도 공간 디자인·시공은 선택하지 않았어요.', 'This illustrates a perfume workshop in an existing venue. Separate space design and construction are not selected.'));
    } else {
      scene = asset('space-site-survey', L('만들고 싶은 체험을 골라주세요', 'Choose an experience to preview'), L('행사 공간 구성 일러스트', 'An illustrated event space'));
    }
  } else if (space.size === 'large') {
    scene = asset('space-site-survey', L('우리 행사장에 맞춘 공간', 'A space tailored to your venue'), L('맞춤 공간의 배치를 계획하기 위한 구성 예시', 'An illustrative layout for planning a custom event space'));
    if (perfume) {
      scene = { ...scene, label: L('맞춤 공간에서 운영할 조향 체험', 'Perfume experience for your custom space') };
      notes.push(L(`${formatSpaceArea(space, lang)} 공간은 현장 확인 후 배치와 금액을 정해요. 현재 장면은 선택한 인원과 장비 구성이며, 해당 면적의 완성 시안은 아니에요.`, `The layout and price for ${formatSpaceArea(space, lang)} are set after a site survey. This scene shows your staff and equipment, not a finished design of that floor area.`));
    } else notes.push(L(`${formatSpaceArea(space, lang)} 공간은 현장 확인 후 배치와 금액을 정해요. 일러스트는 공간 구성의 예시이며, 선택 면적의 완성 시안은 아니에요.`, `The layout and price for ${formatSpaceArea(space, lang)} are set after a site survey. The illustration explains the space concept, not a finished design of that size.`));
    if (space.photoZone || space.lighting) notes.push(L('선택한 포토존·추가 조명은 맞춤 공간 상담에 반영되며, 정확한 위치는 현장에서 함께 정해요.', 'Selected photo zone and additional lighting are included in the custom-space brief; their positions are planned for your venue.'));
  } else {
    const size = space.size === 'booth6x3' ? '6x3' : '3x3';
    const dimension = space.size === 'booth6x3' ? '6 × 3 m' : '3 × 3 m';
    const configuration = space.photoZone ? space.lighting ? 'full' : 'photozone' : space.lighting ? 'lighting' : 'base';
    const configurationLabel = [space.photoZone && L('포토존', 'photo zone'), space.lighting && L('추가 조명', 'additional lighting')].filter(Boolean).join(' · ');
    if (view === 'combined' && perfume) {
      scene = asset(`space-${size}-${configuration}`, L('조향 체험이 있는 우리 공간', 'Your space with a perfume experience'),
        L(`${dimension} 공간${configurationLabel ? ` · ${configurationLabel}` : ''}에 선택한 조향팀과 분석 키오스크 ${analysisKiosks}대를 배치한 예시`, `${dimension} space${configurationLabel ? ` with ${configurationLabel}` : ''}, selected perfumer teams and ${analysisKiosks} analysis kiosks`));
    } else {
      const isTop = view === 'top';
      scene = asset(`space-${size}-${configuration}${isTop ? '-top' : ''}`, isTop ? L('위에서 본 공간 구성', 'Space from above') : L('공간 디자인 자세히 보기', 'A closer look at the space'),
        L(`${dimension} 공간${configurationLabel ? ` · ${configurationLabel}` : ''}${isTop ? '의 상부 구성 예시' : '의 디자인 예시'}`, `${dimension} space${configurationLabel ? ` with ${configurationLabel}` : ''}, ${isTop ? 'illustrative overhead view' : 'illustrative perspective view'}`));
      if (perfume) notes.push(L('이 보기에서는 공간 구조를 살펴봐요. 조향 테이블과 분석 기기는 함께 보기에서 확인해 주세요.', 'This view shows the space structure. See the combined view for the perfume table and analysis equipment.'));
      if (isTop) notes.push(L('상부 일러스트는 배치 이해를 위한 예시로, 실측 도면은 아니에요.', 'The overhead image illustrates the layout; it is not a measured floor plan.'));
    }
  }

  if (analysisKiosks > 0) notes.push(L('실제 기기의 형태를 단순화한 일러스트예요. 선택한 대수가 함께 보기 장면에 반영돼요.', 'The illustration simplifies our actual kiosk shape. Every selected device appears in the combined scene.'));
  return { scene, product, extras, badges, notes, analysisKiosks };
}
