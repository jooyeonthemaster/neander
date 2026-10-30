import { EXPERIENCE_PHOTOS, type ExperiencePhoto } from './experience-photos';

interface ExperienceConceptImage {
  src: string;
  altKo: string;
  altEn: string;
}

export type ExperienceImage =
  | ({ kind: 'case' } & ExperiencePhoto)
  | ({ kind: 'concept' } & ExperienceConceptImage);

// Generated service illustrations are kept separate from verified on-site photos.
// Each entry has its own image; none is used as evidence of a completed project.
const conceptDescriptions: Record<string, [ko: string, en: string]> = {
  'ai-personal-color': ['매장 상담대에 놓인 컬러 진단 태블릿, 계절별 색상 천과 출력된 컬러 팔레트', 'Color analysis tablet, seasonal fabric swatches and printed palette cards on a shop consultation desk'],
  'ai-skincare-analysis': ['뷰티 매장에서 피부 분석 화면과 출력 리포트를 함께 살펴보는 방문객의 옆모습', 'Side view of a visitor reviewing a skin analysis screen and printed report at a beauty shop'],
  'ai-virtual-makeup': ['화장품 매장에서 태블릿으로 립 컬러를 선택하며 가상 메이크업을 체험하는 모습', 'A shopper choosing a lip shade on a tablet during a virtual makeup experience in a cosmetics shop'],
  'ai-nail-designer': ['작은 네일 체험대의 태블릿 디자인 화면과 즉석 출력된 네일 스티커', 'Nail design tablet and freshly printed nail stickers on a small nail experience table'],
  'ai-sommelier': ['소규모 주류 시음대의 취향 추천 태블릿, 테이스팅 노트와 와인 잔', 'Preference-matching tablet, tasting notes and wine glasses at a small tasting counter'],
  'ai-cocktail-creator': ['동네 바에서 태블릿의 맞춤 레시피를 보며 칵테일을 따르는 바텐더의 손', 'A bartender\'s hands pouring a cocktail while following a custom recipe on a tablet at a neighborhood bar'],
  'ai-barista-matching': ['동네 로스터리에서 커피 취향 태블릿과 원두 시음대를 이용하는 방문객', 'Visitors using a coffee preference tablet and tasting counter in a neighborhood roastery'],
  'ai-taste-dna': ['식품 체험 부스의 미각 설문 태블릿과 시식 접시, 출력된 취향 분석 카드', 'Taste questionnaire tablets, sample dishes and printed preference charts in a food experience booth'],
  'ai-style-profiler': ['옷과 원단 견본 옆 태블릿에서 스타일 질문과 인쇄 리포트를 살펴보는 체험 공간', 'A style profiling station with garments, fabric swatches, a questionnaire tablet and a printed report'],
  'ai-runway-photobooth': ['실내 팝업 행사에서 흰 포토부스와 작은 런웨이 변신 출력물을 확인하는 방문객', 'Visitors inspecting a small runway transformation print beside a white photobooth at an indoor pop-up'],
  'ai-fashion-timemachine': ['포토부스 옆 작업대에 서로 다른 시대의 의상으로 변환된 작은 출력 사진이 놓인 모습', 'Small era-inspired fashion photo prints arranged on a worktable beside a photobooth'],
  'ai-coord-recommender': ['일상복 매장에서 방문객이 키오스크의 의상 조합을 살펴보는 AI 코디 추천 체험', 'A visitor reviewing clothing combinations on a kiosk in an everyday clothing pop-up'],
  'ai-idol-makeup-booth': ['행사 포토부스에서 방문객이 작은 메이크업 변신 출력 사진을 확인하는 모습', 'A visitor checking a small makeup-transformation print at an event photobooth'],
  'ai-fan-photocard': ['작은 행사 작업대에 개인 사진으로 만든 포토카드와 카드 프린터가 놓인 모습', 'Personalized fan photocards and a compact card printer on a small event worktable'],
  'ai-voice-lab': ['행사 체험 테이블에서 USB 마이크와 헤드폰으로 목소리를 녹음하는 방문객', 'A visitor recording with a USB microphone and headphones at an event activity table'],
  'ai-graduation-booth': ['학교 복도에 설치된 졸업 사진 키오스크와 학사모 합성 사진 출력물', 'Graduation photo kiosk in a campus corridor with small printed graduation portraits.'],
  'ai-future-career': ['성인 진로 탐색 수업에서 노트북 적성 질문을 살펴보는 참여자와 진로 결과지', 'An adult exploring career interests on a laptop beside a printed career card in a classroom workshop.'],
  'ai-science-kiosk': ['교실 체험 공간에서 두 성인이 과학 터치스크린과 경사면 실험을 살펴보는 모습', 'Two adults using a science touchscreen beside a physical ramp experiment in an ordinary classroom.'],
  'ai-history-travel': ['지역 역사 체험 행사에 설치된 포토 키오스크와 작은 시대별 의상 합성 사진을 보는 방문객', 'Visitors at a local history event viewing a photo kiosk and small prints with historical costumes.'],
  'ai-timecapsule-photo': ['노트북과 포토 프린터 옆에 놓인 미래 모습 사진과 타임캡슐 편지 봉투', 'Age-progression photo prints and time-capsule envelopes beside a laptop and photo printer.'],
  'ai-fortune-robot': ['야외 마을 행사에서 운세 키오스크를 이용하는 방문객과 카드 출력 공간', 'Visitors using a fortune-reading touchscreen and card printer at an outdoor community fair.'],
  'ai-face-reading': ['실내 행사에서 웹캠이 달린 관상 체험 단말기를 사용하는 참여자와 작은 분석 결과지', 'A participant using a webcam-equipped face-reading terminal beside a small printed report at an indoor event.'],
  'ai-palm-reading': ['행사 테이블의 소형 카메라 앞에 펼친 손바닥과 태블릿 손금 결과 화면', 'An open palm presented to a small event-table camera beside a tablet showing a palm-line report.'],
  'ai-caricature-artist': ['지역 미술 체험 행사 테이블의 노트북과 프린터, 작은 캐리커처 인쇄물', 'A laptop and printer with small caricature prints on an ordinary community art-fair table.'],
  'ai-aura-reading': ['실내 체험 테이블의 웹캠 터치스크린과 작은 오라 색상 프로필 출력물', 'A webcam touchscreen and small printed aura-colour profiles on an indoor activity table.'],
  'ai-brand-avatar': ['기업 행사 테이블의 아바타 카드와 출력 장비', 'Avatar cards and print equipment on a corporate event table'],
  'ai-product-experience': ['전시 부스에서 실물 제품과 디지털 안내를 살펴보는 체험', 'A physical product and interactive display at a modest trade-show booth'],
  'ai-team-chemistry': ['워크숍 테이블에서 팀 성향 결과를 함께 살펴보는 동료들', 'Colleagues reviewing team profiles at a workshop table'],
  'ai-vision-wall': ['행사장 프로젝션 화면과 참여용 터치 테이블', 'An event projection wall with a participation touch table'],
  'ai-business-card': ['개인별 디자인 명함과 행사장의 소형 출력 작업대', 'Personalized business cards at an event print station'],
  'ai-hanbok-booth': ['관광 안내 공간에서 한복 포토부스를 이용하는 방문객', 'A visitor using a hanbok photo kiosk in a tourism information space'],
  'ai-traditional-painter': ['한지 느낌 초상화 출력물과 전통 회화 체험 작업대', 'Portrait prints on textured paper at a traditional painting activity table'],
  'ai-heritage-timemachine': ['박물관 체험실의 문화유산 복원 화면과 키오스크', 'A heritage reconstruction screen and kiosk in a museum activity room'],
  'ai-travel-style': ['여행 박람회 상담 테이블의 성향 진단 화면과 안내 자료', 'Travel profile questionnaire and brochures on a tourism fair desk'],
  'ai-wedding-booth': ['웨딩홀 로비의 포토부스와 기념사진 출력 테이블', 'A wedding lobby photo booth with a souvenir print table'],
  'ai-couple-chemistry': ['행사 테이블에서 함께 궁합 결과를 확인하는 커플', 'A couple checking a compatibility result at an event table'],
  'ai-memory-movie': ['사진과 노트북으로 추억 영상을 준비하는 행사장 작업대', 'An event desk preparing a memory movie from personal photos'],
};

export const EXPERIENCE_CONCEPTS: Partial<Record<string, ExperienceConceptImage>> =
  Object.fromEntries(
    Object.entries(conceptDescriptions).map(([slug, [altKo, altEn]]) => [
      slug,
      { src: `/images/services/documentary/${slug}.webp`, altKo, altEn },
    ])
  );

EXPERIENCE_CONCEPTS['ai-stamp-tour'] = {
  src: '/images/services/stamp-tour.svg',
  altKo: '행사 공간의 체험 지점을 연결하는 동선과 수집한 스탬프를 표현한 일러스트',
  altEn: 'Illustration of an event route connecting experience stops and collected stamps',
};

export function getExperienceImage(slug: string): ExperienceImage | undefined {
  const photo = EXPERIENCE_PHOTOS[slug];
  if (photo) return { kind: 'case', ...photo };

  const concept = EXPERIENCE_CONCEPTS[slug];
  if (concept) return { kind: 'concept', ...concept };
}
