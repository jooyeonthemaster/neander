import type { DemoExperienceDesign, ExperienceOption } from './types';

const option = (id: string, label: string, detail: string, outcome: string, color?: string): ExperienceOption => ({ id, label, detail, outcome, ...(color ? { color } : {}) });

/** Consultation briefs: answers are carried into generation and into the printed session notes. */
export const beautyFnbExperiences: Record<string, DemoExperienceDesign> = {
  'ai-personal-color': {
    venue: 'CHROMA DRAPING ROOM', eyebrow: 'COLOR CONSULTATION · 01',
    headline: '오늘의 나를 비추는, 한 장의 컬러.',
    invitation: '컬러리스트와 원단을 펼치듯, 사용할 장면과 대비를 먼저 골라보세요.',
    accent: '#f0abfc', secondary: '#fdba74', background: '#21131f', layout: 'studio',
    artifact: '포켓 컬러 스와치 북', duration: '약 3분',
    preparation: ['화면의 야간 모드와 색상 필터를 끄면 비교하기 좋아요.', '계절 유형보다 실제로 입고 싶은 옷과 활용 장면을 떠올려 주세요.'],
    questions: [
      { id: 'purpose', label: '이 팔레트를 어디에 쓸까요?', why: '같은 컬러도 옷, 립, 액세서리에서 쓰는 면적이 달라져요.', control: 'cards', options: [
        option('wardrobe', '데일리 옷장', '출근과 일상을 위한 조합', '베이스 컬러를 넓게, 포인트 컬러를 작은 면적으로 배치한 상의·하의 조합을 만드세요.'),
        option('makeup', '메이크업 파우치', '립과 블러셔 컬러', '립은 추천 팔레트의 중간 채도, 블러셔는 같은 계열의 연한 색으로 맞춰보세요.'),
        option('occasion', '특별한 날', '사진에 남는 한 벌', '추천 포인트 컬러를 얼굴 가까운 상의에 쓰고 액세서리는 한 톤으로 정리하세요.'),
      ] },
      { id: 'contrast', label: '오늘 입고 싶은 색의 대비는?', why: '선호하는 대비를 색 배합에 반영해 실생활에서 쓰기 쉽게 만들어요.', control: 'swatches', options: [
        option('soft', '포근한 톤온톤', '비슷한 밝기끼리', '추천색 두 개의 밝기를 비슷하게 맞추고 대비를 줄인 톤온톤 조합을 제안해요.', '#d4bfca'),
        option('balanced', '한 가지 포인트', '차분함 속 작은 변화', '뉴트럴 베이스 두 가지에 추천색 한 가지를 더하는 2+1 조합을 제안해요.', '#c79677'),
        option('bold', '선명한 대비', '밝은색과 짙은색', '추천 팔레트의 가장 밝은 색과 짙은 색을 함께 써서 윤곽이 또렷한 조합을 제안해요.', '#7256a8'),
      ] },
    ],
    processing: ['언더톤 자기보고와 선호색 비교', '활용 장면에 맞는 색 조합 구성', '휴대할 컬러 스와치 북 편집'],
    scope: '설문 기반 컬러 스타일링 체험이에요. 실제 드레이핑이나 조명 보정 측정을 대체하지 않아요.',
  },
  'ai-skincare-analysis': {
    venue: 'SKIN ROUTINE LAB', eyebrow: 'DAILY CARE · 02',
    headline: '피부가 느끼는 것부터, 차근차근.',
    invitation: '사진보다 먼저 평소의 당김과 제품 사용 경험을 듣고, 지킬 수 있는 루틴을 함께 정해요.',
    accent: '#7dd3fc', secondary: '#a7f3d0', background: '#10252b', layout: 'lab',
    artifact: '아침·저녁 루틴 카드', duration: '약 3–4분',
    preparation: ['사진은 선택 사항이에요. 준비하면 결과 카드에 관리 전 참고 사진으로 담아요.', '질환명이나 병력 대신 평소 느끼는 피부 상태만 선택하면 돼요.'],
    questions: [
      { id: 'skinFeel', label: '평소 오후의 피부는 어떤가요?', why: '사진으로 확인할 수 없는 당김·유분감을 루틴에 반영해요.', control: 'cards', options: [
        option('dry', '전체가 당겨요', '볼·입가까지 건조한 느낌', '세안 뒤 피부가 약간 촉촉할 때 무향 크림을 바르고 건조한 부위부터 보습해요.'),
        option('oily', '전체가 번들거려요', '얼굴 전반의 유분감', '순한 세안과 논코메도제닉 보습제를 기본으로 하고 강한 탈지 세안은 피하세요.'),
        option('combination', '부위마다 달라요', 'T존 유분·볼 당김', 'T존에는 가벼운 보습을, 당기는 볼에는 크림을 덧발라 부위별로 양을 조절해요.'),
        option('balanced', '대체로 편안해요', '당김과 번들거림이 적음', '현재 잘 맞는 순한 세안·보습·자외선 차단 루틴을 유지하고 제품을 한 번에 늘리지 않아요.'),
      ] },
      { id: 'sensitivity', label: '새 제품을 바르면 따갑거나 붉어지나요?', why: '활성 성분을 늘리기 전에 자극 경험부터 확인해요.', control: 'scale', options: [
        option('rare', '거의 없어요', '대부분 편안하게 사용', '새 제품도 작은 부위에 7–10일 시험한 뒤 얼굴에 적용하고 한 번에 하나만 바꿔요.'),
        option('sometimes', '가끔 그래요', '제품에 따라 달라짐', '무향 제품과 짧은 루틴을 우선하고 각질 제거제처럼 자극 가능성이 있는 제품을 동시에 추가하지 않아요.'),
        option('often', '자주 그래요', '순한 제품도 신경 쓰임', '무향 세안제·보습제·잘 맞는 자외선 차단제로 단순화해요. 지속적인 따가움이나 발진은 피부과에서 확인하세요.'),
      ] },
      { id: 'careTime', label: '매일 꾸준히 쓸 수 있는 시간은?', why: '단계 수보다 실제로 유지할 수 있는 구성이 중요해요.', control: 'chips', options: [
        option('quick', '2분 기본 루틴', '핵심 단계만', '아침에는 필요한 세안→보습→광범위 SPF 30 이상 자외선 차단, 저녁에는 세안→보습으로 정리해요.'),
        option('steady', '5분 여유 루틴', '기본에 한 가지 더', '기본 루틴을 먼저 안정시킨 뒤 이미 잘 맞는 제품 한 가지를 선택 단계로 유지해요.'),
        option('simple', '지금 루틴 줄이기', '겹치는 제품 정리', '토너·앰플 등 중복 단계를 줄이고 불편함 없이 쓰던 세안·보습·자외선 차단을 남겨요.'),
      ] },
    ],
    processing: ['자가 보고 피부감과 자극 경험 확인', '관리 시간에 맞춰 기본 루틴 정리', '아침·저녁 실천 카드 작성'],
    scope: '일상 관리 참고용이며 의료 진단이 아니에요. 사진에서 수분량·탄력·질환 여부를 측정하지 않아요.',
  },
  'ai-virtual-makeup': {
    venue: 'BACKSTAGE MAKEUP MIRROR', eyebrow: 'LOOK FITTING · 03',
    headline: '조명 켜고, 오늘의 룩을 입어봐요.',
    invitation: '백스테이지 거울 앞에서 메이크업 아티스트에게 말하듯, 장면과 마무리를 골라주세요.',
    accent: '#fda4af', secondary: '#e9d5ff', background: '#29151f', layout: 'studio',
    artifact: '비포·애프터 룩 시트', duration: '약 3분 · 이미지 생성 시간 추가',
    preparation: ['눈과 입술이 가리지 않게 정면 사진을 준비해 주세요.', '완성 후 비교 핸들을 움직이면 전후를 직접 확인할 수 있어요.'],
    questions: [
      { id: 'scene', label: '어떤 조명 아래에 설 예정인가요?', why: '활용 장소에 따라 포인트의 강도와 위치를 달리해요.', control: 'cards', options: [
        option('daylight', '낮의 일상', '자연광·가벼운 약속', '자연광용으로 피부 표현을 얇게 하고 립이나 치크 중 한 곳만 포인트를 주세요.'),
        option('office', '미팅과 출근', '정돈된 실내 조명', '눈매는 또렷하게, 립은 중간 채도로 정리하고 큰 펄 대신 섬세한 음영을 써요.'),
        option('evening', '저녁과 무대', '어두운 공간·촬영', '저녁 조명에서도 남는 립 포인트와 눈꼬리 음영을 만들고 치크는 부드럽게 연결해요.'),
      ] },
      { id: 'finish', label: '원하는 피부 표현을 골라주세요', why: '색상 선택과 별개로 룩의 질감을 정해요.', control: 'swatches', options: [
        option('sheer', '투명한 결', '원래 피부 질감 살리기', '커버를 얇게 하고 피부 본연의 질감과 특징을 유지하는 시어 피니시로 연출해요.', '#e9c7b7'),
        option('satin', '은은한 새틴', '부드러운 반광', '광대 중심만 은은하게 밝히고 T존은 과한 광 없이 정리하는 새틴 피니시예요.', '#cf9b99'),
        option('matte', '차분한 벨벳', '보송하고 선명한 색', '광택을 줄이고 눈·입술의 색이 또렷하게 보이는 벨벳 피니시를 제안해요.', '#a97386'),
      ] },
    ],
    processing: ['장면·질감·선택 룩을 한 브리프로 정리', '사진에 선택 메이크업 콘셉트 표현', '전후 비교와 스타일링 노트 준비'],
    scope: '사진 기반 가상 스타일링이에요. 제품의 실제 발색이나 실시간 AR 추적을 보장하지 않아요.',
  },
  'ai-scent-soulmate': {
    venue: 'SCENT LIBRARY', eyebrow: 'OLFACTORY PORTRAIT · 04',
    headline: '당신의 하루를 담을, 향 한 줄.',
    invitation: '시향지를 펼친 조향사의 테이블에서 향을 쓸 장소와 가까이 둘 정도를 정해요.',
    accent: '#d8b4fe', secondary: '#d9c5a3', background: '#241c29', layout: 'atelier',
    artifact: '나만의 시향 라이브러리 카드', duration: '약 3분',
    preparation: ['실제로 좋아했던 향의 장면을 떠올려 주세요.', '화면에서는 향을 맡을 수 없어 현장 시향을 위한 후보를 만들어 드려요.'],
    questions: [
      { id: 'scentUse', label: '향을 가장 자주 쓸 장소는?', why: '함께 있는 사람과 공간의 크기를 확산감에 반영해요.', control: 'cards', options: [
        option('shared', '오피스·대중교통', '다른 사람과 가까운 공간', '가까이에서만 느껴지는 잔향을 우선하고 향이 겹치는 바디 제품을 줄여보세요.'),
        option('outdoor', '산책·바깥 약속', '바람과 함께 쓰는 향', '가벼운 시트러스나 그린 계열로 시작해 외출 전 시향지에서 잔향 변화를 비교해요.'),
        option('evening', '저녁의 특별한 자리', '기억에 남는 향', '우디·앰버처럼 깊이 있는 베이스를 후보에 두고 첫 향보다 시간이 지난 잔향으로 골라요.'),
      ] },
      { id: 'projection', label: '어느 정도 거리에서 느껴지면 좋나요?', why: '향의 계열과 별개인 확산 선호도를 구분해요.', control: 'scale', options: [
        option('close', '나에게만 은은하게', '가까운 거리', '스킨 센트처럼 가까이 느껴지는 향을 우선하고 소량부터 사용해요.'),
        option('personal', '대화하는 거리', '중간 정도의 존재감', '상쾌한 첫 향과 부드러운 베이스가 균형을 이루는 후보를 시향해 보세요.'),
        option('statement', '확실한 존재감', '풍성한 잔향', '강한 확산을 원해도 처음에는 적게 사용하고 공간과 동행인의 반응을 살펴 양을 조절해요.'),
      ] },
      { id: 'avoidNote', label: '후보에서 줄이고 싶은 향은?', why: '좋아하는 향만큼 덜 선호하는 계열도 추천에 중요해요.', control: 'chips', options: [
        option('none', '특별히 없어요', '다양하게 탐색', '서로 다른 향 계열 세 가지를 한 번에 섞지 않고 각각의 시향지로 비교해요.'),
        option('sweet', '달콤한 향', '바닐라·구르망', '바닐라와 디저트 같은 달콤한 잔향은 줄이고 드라이한 우디·그린 후보를 비교해요.'),
        option('floral', '진한 꽃향', '풍성한 플로럴', '무거운 화이트 플로럴을 줄이고 허브·시트러스·드라이 우디 중심으로 후보를 구성해요.'),
        option('smoky', '스모키한 향', '연기·가죽·묵직함', '스모키·레더 노트를 줄이고 깨끗한 머스크나 산뜻한 과일 향으로 방향을 잡아요.'),
      ] },
    ],
    processing: ['좋아하는 장면과 피하고 싶은 노트 연결', '향 계열·확산 선호에 맞춰 후보 구성', '시향 순서와 잔향 메모 카드 작성'],
    scope: '성격 진단이 아닌 취향 탐색이에요. 실제 향과 지속력은 제품·사용량·환경에 따라 달라요.',
  },
  'ai-nail-designer': {
    venue: 'NAIL OBJECT ATELIER', eyebrow: 'TEN TINY CANVASES · 05',
    headline: '손끝에 놓는, 작은 전시.',
    invitation: '네일 아티스트의 작업대에서 일상에 맞는 장식과 빛을 먼저 골라보세요.',
    accent: '#f9a8d4', secondary: '#a5b4fc', background: '#291b31', layout: 'atelier',
    artifact: '열 손가락 디자인 보드', duration: '약 3–4분 · 이미지 생성 시간 추가',
    preparation: ['손등과 손톱이 잘 보이는 사진을 준비하거나 샘플로 시작해요.', '스티커 시트는 디자인 예시예요. 실제 제작에는 손톱 치수 확인이 필요해요.'],
    questions: [
      { id: 'nailUse', label: '손을 가장 많이 쓰는 순간은?', why: '예쁜 디자인을 생활에 맞는 길이·장식으로 구체화해요.', control: 'cards', options: [
        option('typing', '키보드와 일상', '작업할 때 편하게', '짧은 라운드·스퀘어와 평평한 패턴을 우선하고 큰 파츠는 제외해요.'),
        option('practical', '손을 자주 씻어요', '간결하고 관리하기 쉽게', '표면이 매끈한 원컬러나 프렌치로 구성하고 작은 들뜸이 생기면 무리하게 떼지 말아요.'),
        option('event', '사진과 특별한 날', '손끝을 주인공으로', '약지 한두 개에만 입체감 있는 포인트를 모아 사진에서도 패턴이 읽히게 해요.'),
      ] },
      { id: 'nailFinish', label: '어떤 빛을 담을까요?', why: '같은 팔레트도 표면 마감에 따라 인상이 달라져요.', control: 'swatches', options: [
        option('gloss', '유리처럼 글로시', '맑은 반사', '맑은 광택을 중심으로 하고 포인트 네일도 같은 마감으로 통일해요.', '#f6bacd'),
        option('matte', '보송한 매트', '빛을 낮춘 색', '광택을 줄인 매트 바탕에 얇은 선 패턴을 더해 색과 형태를 강조해요.', '#b49abf'),
        option('pearl', '은은한 펄', '움직일 때 반짝임', '미세한 펄은 포인트 손가락에만 두고 나머지는 투명한 단색으로 여백을 남겨요.', '#cdd8f2'),
      ] },
    ],
    processing: ['생활 장면과 마감 선호를 디자인에 반영', '팔레트·패턴·쉐입 조합 렌더링', '양손 디자인 보드와 제작 노트 정리'],
    scope: '가상 네일 시안이며 사진만으로 손톱의 실제 mm 치수나 곡률을 측정하지 않아요.',
  },
  'ai-sommelier': {
    venue: 'THE TASTING TABLE', eyebrow: 'PAIRING SESSION · 06',
    headline: '한 접시에서 시작하는, 한 잔의 이야기.',
    invitation: '소믈리에와 같은 테이블에 앉아 떫은 느낌과 음식의 양념부터 이야기해요.',
    accent: '#fda4af', secondary: '#fcd9a5', background: '#2a151c', layout: 'lounge',
    artifact: '테이스팅·페어링 티켓', duration: '약 3–4분',
    preparation: ['함께 먹을 음식의 주재료뿐 아니라 소스도 떠올려 주세요.', '수치는 선택한 취향과의 데모 비교 지표이며 실제 시음 평가가 아니에요.'],
    questions: [
      { id: 'tannin', label: '홍차처럼 입안이 마르는 느낌은?', why: '떫은 느낌은 산미·단맛과 별개의 선호예요.', control: 'scale', options: [
        option('soft', '거의 없는 게 좋아요', '부드러운 질감', '떫은 느낌이 적은 스타일을 우선하고 가벼운 레드나 화이트를 비교해요.'),
        option('medium', '적당하면 좋아요', '음식과 균형', '중간 정도의 구조감을 우선하고 음식과 한 모금씩 번갈아 맛보며 조합을 확인해요.'),
        option('firm', '묵직한 느낌이 좋아요', '입안에 남는 구조감', '탄닌과 바디가 있는 스타일을 후보에 두고 단백질·지방이 있는 음식과 비교해요.'),
      ] },
      { id: 'sauce', label: '음식에서 가장 두드러지는 맛은?', why: '소스의 단맛·매운맛·산미가 잔의 인상을 바꿔요.', control: 'cards', options: [
        option('light', '담백·허브', '구이·샐러드', '담백한 음식의 향을 덮지 않는 가벼운 바디와 허브·과일 향을 중심으로 맞춰요.'),
        option('rich', '크리미·고소함', '크림·버터·치즈', '풍부한 음식에 산뜻한 산미를 대비시키거나 비슷한 바디감으로 맞추는 두 방향을 비교해요.'),
        option('spicy', '매콤함', '고추·향신료', '매운 음식에는 강한 알코올감과 떫은 느낌을 줄이고 부드러운 과일 향을 우선해요.'),
        option('sweet', '달콤한 소스', '글레이즈·디저트', '음식의 단맛 때문에 잔이 더 날카롭게 느껴질 수 있어 단맛의 균형을 먼저 확인해요.'),
      ] },
    ],
    processing: ['단맛·산미·떫은 느낌 선호 구분', '음식과 소스에 맞춰 페어링 조정', '테이스팅 순서와 서빙 노트 준비'],
    scope: '취향 탐색용 추천이에요. 가격·재고와 매칭 수치는 실제 판매·시음 검증 자료가 아니에요.',
  },
  'ai-cocktail-creator': {
    venue: 'AFTER HOURS MIXING BAR', eyebrow: 'SIGNATURE DRINK · 07',
    headline: '오늘의 기분을, 한 잔에 조합해요.',
    invitation: '바텐더에게 주문하듯 잔의 질감과 마무리를 골라 나만의 레시피를 완성해요.',
    accent: '#67e8f9', secondary: '#f0abfc', background: '#141f2d', layout: 'counter',
    artifact: '시그니처 레시피 코스터', duration: '약 3분',
    preparation: ['마지막 베이스 선택에서 논알콜도 고를 수 있어요.', '무드 다음에 단맛·산미·베이스를 조절하며 한 잔을 주문해요.'],
    questions: [
      { id: 'mouthfeel', label: '첫 모금의 느낌은?', why: '같은 맛도 탄산과 희석 정도에 따라 다르게 느껴져요.', control: 'cards', options: [
        option('sparkling', '톡 쏘는 청량감', '탄산이 있는 긴 한 잔', '차가운 탄산수를 마지막에 더하고 가볍게 저어 기포를 살리는 롱 드링크로 만들어요.'),
        option('silky', '부드럽고 매끈하게', '주스와 얼음의 균형', '주스 베이스를 얼음과 함께 셰이크한 뒤 걸러 부드러운 질감으로 마무리해요.'),
        option('stirred', '묵직하고 천천히', '투명하고 차분한 한 잔', '탄산 없이 얼음과 천천히 저어 차갑게 만들고 큰 얼음 한 개로 희석 속도를 조절해요.'),
      ] },
      { id: 'garnish', label: '잔을 가까이했을 때 원하는 향은?', why: '가니시는 장식뿐 아니라 첫 향을 만드는 선택이에요.', control: 'chips', options: [
        option('citrus', '상큼한 시트러스', '레몬·라임 껍질', '레몬 또는 라임 껍질을 잔 위에서 가볍게 비틀어 첫 향을 더해요.'),
        option('herb', '싱그러운 허브', '바질·민트', '민트나 바질을 살짝 두드려 잔 위에 올리고 잘게 으깨 쓴맛을 내지 않아요.'),
        option('fruit', '풍성한 과일', '제철 과일 한 조각', '레시피의 주된 과일과 같은 가니시를 사용해 향과 맛을 연결해요.'),
        option('minimal', '가니시 없이', '맛에 집중', '가니시를 생략하고 잘 차가워진 잔과 균형 잡힌 희석으로 마무리해요.'),
      ] },
    ],
    processing: ['기분·맛·베이스를 레시피로 조합', '탄산·질감·가니시로 마무리 설정', '재료와 제조 순서를 코스터에 기록'],
    scope: '음료 조합 체험이며 알코올 도수는 계량·제품·희석에 따라 달라져요.',
  },
  'ai-barista-matching': {
    venue: 'SLOW BREW COUNTER', eyebrow: 'YOUR DAILY CUP · 08',
    headline: '내일 아침에도 다시 만들고 싶은 한 잔.',
    invitation: '바리스타 앞에서 취향을 고르고, 집에서 사용하는 도구까지 맞춰 레시피를 받아요.',
    accent: '#fdba74', secondary: '#d9b99b', background: '#281e18', layout: 'counter',
    artifact: '원두 라벨·브루 레시피', duration: '약 3분',
    preparation: ['원두 이름을 몰라도 괜찮아요. 좋아하는 향과 맛으로 시작해요.', '집의 추출 도구와 주로 마시는 온도를 골라주세요.'],
    questions: [
      { id: 'brewTool', label: '어떤 도구로 만들 예정인가요?', why: '사용할 도구를 우선해 추출 레시피를 정하고, 음용 취향은 원두와 로스팅에 반영해요.', control: 'cards', options: [
        option('dripper', '핸드드립', '종이 필터와 드리퍼', '원두 15g·물 240g의 1:16 비율부터 시작하고 분쇄도를 한 단계씩 바꾸며 조절해요.'),
        option('espresso', '에스프레소 머신', '진하게 추출하기', '사용하는 바스켓 용량을 기준으로 투입량을 정하고 추출량을 기록해 같은 조건에서 맛을 비교해요.'),
        option('immersion', '프렌치프레스', '천천히 담가 추출', '원두 15g·물 240g부터 시작하고 굵은 분쇄와 일정한 침출 시간으로 한 번에 한 변수만 조절해요.'),
        option('cafe', '카페에서 주문', '주문 문장으로 받기', '추천 향과 산미·바디 선호를 바리스타에게 말하고 오늘 제공되는 원두 중 가까운 것을 요청해요.'),
      ] },
      { id: 'temperature', label: '주로 어떤 온도로 마시나요?', why: '얼음과 희석 조건을 레시피에 반영해요.', control: 'chips', options: [
        option('hot', '따뜻하게', '온도에 따른 향 변화', '뜨거울 때와 조금 식었을 때를 비교하며 향·산미·단맛을 따로 메모해요.'),
        option('iced', '시원하게', '얼음 희석까지 계산', '드립은 총 물 무게 안에 얼음을 포함하는 아이스 레시피를 쓰고, 추출 후 얼음을 무작정 더하지 않아요.'),
        option('both', '둘 다 즐겨요', '온도별 두 가지 표정', '같은 원두로 따뜻한 잔과 아이스 잔을 각각 기록해 취향 차이를 비교해요.'),
      ] },
    ],
    processing: ['향·산미·단맛·바디 선호 분리', '추출 도구와 음용 온도에 맞춰 레시피 조정', '주문 문장과 브루 카드를 발행'],
    scope: '향 노트는 감각 표현이며 향료 성분을 뜻하지 않아요. 레시피는 도구·분쇄도에 맞춰 조절하는 출발점이에요.',
  },
  'ai-taste-dna': {
    venue: 'FLAVOR DISCOVERY LAB', eyebrow: 'TASTING PASSPORT · 09',
    headline: '익숙한 한 입에서, 새로운 취향으로.',
    invitation: '테이스팅 테이블에서 좋아하는 맛을 기록하고 다음에 도전할 한 접시를 정해요.',
    accent: '#bef264', secondary: '#5eead4', background: '#1a271f', layout: 'lab',
    artifact: '미각 탐험 패스포트', duration: '약 3–4분',
    preparation: ['잘 먹는 정도보다 내가 즐기는 맛을 기준으로 답해 주세요.', 'DNA는 취향을 표현한 이름이에요. 유전자나 건강 검사는 하지 않아요.'],
    questions: [
      { id: 'mealMoment', label: '이번 추천을 언제 즐길까요?', why: '같은 입맛도 간식과 한 끼 식사에서 원하는 구성이 달라요.', control: 'cards', options: [
        option('lunch', '일상의 점심', '반복해서 먹을 한 끼', '선호하는 맛 한 가지를 중심에 두고 익숙한 주재료와 곁들임으로 점심 메뉴를 구성해요.'),
        option('snack', '오후의 간식', '작게 즐기는 맛', '가장 좋아하는 맛과 식감을 작은 디저트·간식 한 가지로 연결하고 음료는 대비되는 맛으로 골라요.'),
        option('dinner', '주말의 한 끼', '새로운 조합 탐험', '익숙한 메인에 새로운 소스나 곁들임 하나를 더해 부담 없이 취향을 넓혀요.'),
      ] },
      { id: 'menuStyle', label: '어떤 메뉴 범위에서 고를까요?', why: '추천이 실제 선택 가능한 메뉴에 가까워지도록 범위를 정해요.', control: 'chips', options: [
        option('all', '다양하게', '재료에 제한 없음', '고기·채소·곡물을 다양하게 비교하되 선택한 맛과 식감을 추천 이유에 연결해요.'),
        option('plant', '식물성 메뉴', '채소·콩·곡물 중심', '고기·생선 대신 두부·콩·버섯·곡물 중심으로 추천하고 소스와 육수의 재료도 확인해요.'),
        option('familiar', '익숙한 재료', '새로운 맛은 조금씩', '평소 먹던 재료를 유지하고 조리법이나 소스만 한 가지 바꾸는 탐험 메뉴를 제안해요.'),
      ] },
    ],
    processing: ['선택한 다섯 맛과 식감 선호 정리', '식사 장면·메뉴 범위에 맞춰 추천 구성', '다음 한 입 미션과 패스포트 완성'],
    scope: '자가 보고 취향을 시각화한 체험이에요. 유전자 분석·미각 능력 검사·인구 통계 순위가 아니에요.',
  },
};
