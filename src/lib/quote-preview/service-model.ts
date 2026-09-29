import { PHOTO_BOOTH, SERVICE_TEXT, type Lang, type ServiceKey } from '../quote/catalog';
import type { QuoteInput, QuoteItem } from '../quote/engine';
import { getPhotoBoothTemplates } from '../quote/photo-booth-templates';
import { getKioskAssignments } from '../quote/kiosk-experiences';
import { normalizePreviewInput } from './flow-storage';

export interface ServicePreviewView {
  id: string;
  label: string;
  description: string;
  caption: string;
}

export interface ServicePreviewModel {
  key: ServiceKey;
  item: QuoteItem;
  title: string;
  intro: string;
  views: ServicePreviewView[];
  badges: string[];
  journey: string[];
  notes: string[];
}

/** Presentation data for native SVG illustrations, with no external image references. */
export function resolveServicePreview(input: QuoteInput, activeKey: ServiceKey | null, lang: Lang): ServicePreviewModel | null {
  const normalized = normalizePreviewInput(input);
  const item = normalized.items.find((entry) => entry.key === activeKey) ?? normalized.items[0];
  if (!item) return null;
  const L = (ko: string, en: string) => lang === 'ko' ? ko : en;
  const view = (id: string, label: string, description: string): ServicePreviewView => ({ id, label, description, caption: L('선택한 구성을 보여주는 일러스트', 'An illustration of your selected configuration') });
  const model: ServicePreviewModel = { key: item.key, item, title: SERVICE_TEXT[item.key].name[lang], intro: '', views: [], badges: [], journey: [], notes: [] };

  switch (item.key) {
    case 'acscent':
    case 'spatialDesign':
      return model;
    case 'photoBooth': {
      const o = item.options;
      const templates = getPhotoBoothTemplates(o.templateSlugs ?? []);
      const templateNames = templates.map((template) => template.name[lang]).join(' · ');
      const customStyleDescription = o.customStyles ? L(`새로 제작 ${o.customStyles}종`, `${o.customStyles} newly designed style(s)`) : '';
      model.intro = L('한 장의 사진이 우리 행사만의 기념사진으로 바뀌어요.', 'Turn a guest photo into a keepsake made for your event.');
      model.views = [
        view('scene', L('설치 모습', 'Setup'), L(`포토부스 ${o.booths}대${o.wrapping ? ' · 브랜드 래핑 적용' : ''}`, `${o.booths} photo booth(s)${o.wrapping ? ' · with brand wrapping' : ''}`)),
        view('result', L('가져가는 사진', 'Take-home photo'), L('기념사진을 인화와 휴대폰으로 간직해요', 'Keep your result as a print and on your phone')),
        view('style', L('변신 스타일', 'Photo styles'), [templateNames, customStyleDescription].filter(Boolean).join(' + ') || L('준비된 AI 스타일로 변신', 'Explore ready-made AI styles')),
      ];
      const templateBadge = o.templateSlugs === undefined
        ? L(`기존 스타일 ${PHOTO_BOOTH.includedStyles + o.extraStyles}종`, `${PHOTO_BOOTH.includedStyles + o.extraStyles} ready-made styles`)
        : templates.length
        ? L(`기존 템플릿 ${templates.length}종 선택`, `${templates.length} existing templates selected`)
        : L(`기존 템플릿 ${PHOTO_BOOTH.includedStyles}종 기본 포함`, `${PHOTO_BOOTH.includedStyles} existing templates included`);
      model.badges = [L(`포토부스 ${o.booths}대`, `${o.booths} photo booth(s)`), templateBadge, L('즉석 인화 · QR 저장', 'Instant print · QR download')];
      if (o.wrapping) model.badges.push(L('기기 외관 래핑', 'Exterior wrapping'));
      if (o.customStyles) model.badges.push(L(`새 스타일 ${o.customStyles}종 제작`, `${o.customStyles} new custom styles`));
      if (o.extraPrintRolls) model.badges.push(L(`인화지 ${o.extraPrintRolls}롤 추가`, `${o.extraPrintRolls} extra paper rolls`));
      model.journey = [L('사진 촬영', 'Take a photo'), L('AI 스타일 변환', 'AI restyling'), L('인화 · 휴대폰 저장', 'Print · save to phone')];
      model.notes = [L('설치 모습에 선택한 포토부스 수를 모두 표시해요. 기기 간격과 동선은 행사장에 맞춰 정해요.', 'The setup shows every selected photo booth. Spacing and visitor flow are planned for your venue.'), L('인물과 스타일은 이해를 돕는 일러스트예요. 실제 결과 스타일과 래핑 디자인은 함께 정해요.', 'The portraits and treatments are illustrations. Final photo styles and wrap artwork are agreed together.')];
      if (templates.length) model.notes.push(L('고른 기존 템플릿은 해당 데모에 준비된 의상·배경·화풍을 사용해요. 새로운 브랜드 자산 적용은 새 스타일 제작으로 구분해요.', 'Existing templates use the selected demo’s prepared outfits, backgrounds, and treatments. New brand assets belong to separately designed styles.'));
      return model;
    }
    case 'rental': {
      const o = item.options;
      const assignments = getKioskAssignments(o);
      const assigned = assignments.filter(Boolean).length;
      model.intro = L('기기 한 대마다 체험 하나를 담아요. 원하는 기기 앞에서 참여하고 나만의 결과를 확인해요.', 'Each kiosk offers one experience. Step up to your chosen kiosk and discover a result made for you.');
      model.views = [view('scene', L('설치 모습', 'Setup'), L(`행사장에 키오스크 ${o.kiosks}대${o.printer ? ` · 프린터 ${o.kiosks}대` : ''}`, `${o.kiosks} kiosks${o.printer ? ` · ${o.kiosks} printers` : ''} in an event setting`))];
      if (assigned || o.experienceSlugs !== undefined) model.views.push(view('experience', L('선택한 체험', 'Your experiences'), L(`기기 ${o.kiosks}대 중 ${assigned}대의 체험을 골랐어요`, `Experiences chosen for ${assigned} of ${o.kiosks} kiosks`)));
      model.badges = [L(`키오스크 ${o.kiosks}대`, `${o.kiosks} kiosk(s)`), L(`${normalized.days}일 행사 운영`, `${normalized.days}-day event`), o.printer ? L('결과지 즉석 출력', 'Receipt printing') : L('화면에서 결과 확인', 'On-screen results'), L('기기마다 체험 1종', 'One experience per kiosk')];
      model.journey = [L('원하는 기기로 이동', 'Choose a kiosk'), L('질문 · 촬영', 'Answer · capture'), o.printer ? L('결과 확인 · 출력', 'View · print result') : L('결과 확인', 'See your result')];
      model.notes = [L('선택한 기기를 같은 비율의 일러스트로 보여드려요. 실제 간격과 동선은 행사장에 맞춰 정해요.', 'Selected devices are illustrated at one scale. Actual spacing and visitor flow are planned for your venue.'), L('체험 결과는 키오스크 화면에서 확인해요.', 'Guests view their experience results on the kiosk screen.')];
      if (assigned < o.kiosks) model.notes.push(L('미정인 기기의 체험은 나중에 정해도 괜찮아요.', 'Experiences for unassigned kiosks can be chosen later.'));
      return model;
    }
    case 'mediaArt': {
      const o = item.options;
      model.intro = L('내 움직임이 빛과 그래픽이 되어 공간에 펼쳐져요.', 'Your movement becomes light and graphics across the space.');
      model.views = [view('scene', L('체험 모습', 'Experience'), L('움직임에 반응하는 빛과 그래픽', 'Light and graphics that respond to movement')), view('case', L('장비 구성', 'Equipment'), L('프로젝터와 센서가 참여자의 움직임을 연결해요', 'A projector and sensors connect visitors to the scene'))];
      model.badges = [o.grade === 'fullCustom' ? L('완전 맞춤 제작', 'Fully custom production') : o.grade === 'premium' ? L('프리미엄 제작', 'Premium production') : L('기본 제작', 'Standard production'), L('프로젝터 1대', '1 projector'), L(`센서 ${1 + o.extraSensors}세트`, `${1 + o.extraSensors} sensor set(s)`), L('운영 1인', '1 operator')];
      model.badges.push(o.sensorType === 'depth' ? L('3D 카메라', '3D camera') : L('이미지 카메라', 'Image camera'));
      model.journey = [L('공간에 들어서기', 'Enter the space'), L('움직임에 반응', 'Interact with motion'), L('나만의 장면 만들기', 'Create your moment')];
      model.notes = [L('제작 등급에 따라 그래픽의 표현 예시가 달라져요. 최종 콘텐츠와 반응 방식은 함께 정해요.', 'The illustration changes with the production tier. Final content and interactions are planned together.'), L('선택한 센서 수를 모두 표시해요. 실제 센서 위치와 감지 범위는 공간을 확인한 뒤 정해요.', 'Every selected sensor is shown. Actual locations and sensing areas require a venue review.')];
      return model;
    }
    case 'custom': {
      const o = item.options;
      model.intro = L('특정 행사의 목적과 참여자에 맞는 커스텀 AI 콘텐츠를 만들어요.', 'Develop custom AI content for the goals and participants of your specific event.');
      model.views = [view('scene', L('체험 아이디어', 'Experience idea'), o.scope === 'large' ? L('여러 체험을 연결하는 하나의 이야기', 'One story across connected experiences') : L('브랜드와 만나는 나만의 AI 체험', 'A personal AI experience with your brand'))];
      model.badges = [o.scope === 'large' ? L('복합 · 대형 콘텐츠', 'Complex · large-scale content') : L('단일 콘텐츠', 'Single experience')];
      if (o.pgIntegration) model.badges.push(L('PG 연결', 'Payment gateway'));
      if (o.consulting) model.badges.push(L('기획 컨설팅', 'Planning consultation'));
      if (o.maintenanceMonths) model.badges.push(L(`운영 관리 ${o.maintenanceMonths}개월`, `${o.maintenanceMonths} months of maintenance`));
      model.journey = o.scope === 'large' ? [L('입장 · 참여', 'Enter · join'), L('여러 체험 연결', 'Connect experiences'), L('공간 · 결과 연동', 'Link space · results')] : [L('질문 · 참여', 'Answer · participate'), L('브랜드 맞춤 AI', 'Brand-specific AI'), L('개인별 결과', 'Personal result')];
      model.notes = [L('태블릿은 맞춤 AI 콘텐츠의 화면 예시예요. 실제 기능과 결과물은 기획 상담에서 정해요.', 'The tablet is a screen concept for your custom AI content. Actual functions and outputs are agreed during planning.'), L('태블릿 등 기기 대여는 콘텐츠 제작비에 기본 포함되는 것은 아니에요.', 'Tablet and other hardware rentals are not automatically included in the development fee.')];
      return model;
    }
  }
}
