import type { DemoExperienceDesign, ExperienceOption, ExperienceQuestion } from './types';

const option = (id: string, label: string, detail: string, outcome: string, color?: string): ExperienceOption => ({ id, label, detail, outcome, ...(color ? { color } : {}) });
const question = (id: string, label: string, why: string, control: ExperienceQuestion['control'], options: ExperienceOption[]): ExperienceQuestion => ({ id, label, why, control, options });

/** These are creative briefs: preferences are explicit, never inferred from a face. */
export const photoCultureExperiences: Record<string, DemoExperienceDesign> = {
  'ai-style-profiler': {
    venue: '옷장 편집실', eyebrow: 'WARDROBE EDIT / PERSONAL SESSION', headline: '내일 아침, 무엇을 입을까요?',
    invitation: '스타일리스트와 옷장을 펼쳐 놓듯, 생활과 취향을 함께 골라요.',
    accent: '#c5dcaa', secondary: '#dcc8af', background: '#17211d', layout: 'atelier', artifact: '나의 캡슐 워드로브 노트', duration: '약 3분',
    preparation: ['지금 가장 자주 입는 옷 한 벌을 떠올려 주세요.', '브랜드보다 활용도와 편안함을 기준으로 골라도 좋아요.'],
    questions: [
      question('wardrobeGoal', '이번에 옷장을 어떻게 바꾸고 싶나요?', '이미 가진 옷과 새로 필요한 옷을 구분해 제안해요.', 'cards', [
        option('remix', '있는 옷으로', '새 구매는 최소한', '기본 상의·하의를 다시 조합하고 액세서리 한 가지로 3가지 룩을 제안해요.'),
        option('capsule', '기본부터 차근차근', '돌려 입기 좋은 구성', '서로 교차 조합할 수 있는 상의 2벌·하의 2벌·겉옷 1벌을 중심으로 추천해요.'),
        option('statement', '새로운 나의 시그니처', '포인트를 하나 더', '평소 실루엣은 유지하고 색 또는 소재 한 가지를 새로운 포인트로 제안해요.'),
      ]),
      question('spend', '새 아이템 한 벌의 예산은?', '실제 구매 가능한 범위를 먼저 맞춰요. 가격은 예시 범위예요.', 'scale', [
        option('low', '5만 원 이하', '작은 변화', '관리하기 쉬운 기본 아이템과 중고·기존 옷 활용을 우선해요.'),
        option('mid', '5~15만 원', '오래 입을 한 벌', '여러 상황에 활용할 수 있는 셔츠·니트·팬츠 중 부족한 한 벌을 먼저 제안해요.'),
        option('high', '15만 원 이상', '소재와 마감', '소재와 수선 가능성을 살펴 오래 입는 겉옷 중심으로 제안해요.'),
      ]),
    ], processing: ['생활과 옷장 목표 맞추기', '색·실루엣 조합 편집하기', '예산에 맞는 스타일 노트 완성하기'],
    scope: '답변으로 정리하는 취향 제안이며 성격이나 체형을 진단하지 않아요.',
  },
  'ai-runway-photobooth': {
    venue: '컬렉션 백스테이지', eyebrow: 'BACKSTAGE / COVER SHOOT', headline: '오늘의 커버 스타, 입장하세요.',
    invitation: '커버 촬영 전에 조명과 화보의 분위기를 직접 디렉팅해 보세요.',
    accent: '#f5c96b', secondary: '#f9f2e2', background: '#211b19', layout: 'studio', artifact: '에디토리얼 매거진 커버', duration: '약 3분 · 생성 시간 별도',
    preparation: ['머리 위와 어깨 양옆에 여백을 두면 커버 글자가 잘 보여요.', '정면의 부드러운 조명에서 얼굴을 가리지 않고 촬영해 주세요.'],
    questions: [
      question('lighting', '어떤 조명 아래 설까요?', '사진의 입체감과 커버의 전체 분위기를 정해요.', 'swatches', [
        option('soft', '소프트 데이라이트', '은은하고 자연스럽게', '넓은 창에서 들어오는 확산광과 부드러운 그림자로 자연스러운 화보를 연출해요.', '#e8ddc6'),
        option('spot', '골든 스포트라이트', '주인공에게 집중', '따뜻한 스포트 조명을 인물에 집중시키고 배경을 어둡게 연출해요.', '#d39b4d'),
        option('flash', '백스테이지 플래시', '생생한 패션 스냅', '직광 플래시와 선명한 대비를 사용해 현장의 스냅사진처럼 연출해요.', '#dce8fa'),
      ]),
      question('editorial', '이번 호의 주제는?', '표지 카피와 스타일링의 방향을 함께 정해요.', 'chips', [
        option('debut', '첫 번째 데뷔', '새로운 시작', '새 출발을 주제로 자신감 있는 표정과 짧은 데뷔 커버 카피를 제안해요.'),
        option('everyday', '일상의 아이콘', '편안한 존재감', '편안한 자세와 입을 수 있는 스타일링으로 일상의 주인공을 표현해요.'),
        option('experimental', '패션은 실험', '대담한 에디토리얼', '비대칭 구도와 구조적인 의상으로 실험적인 화보를 구성해요.'),
      ]),
    ], processing: ['선택한 조명과 촬영 구도 세팅하기', '컬렉션 착장과 포즈 연출하기', '이번 호의 커버 디자인 편집하기'],
  },
  'ai-fashion-timemachine': {
    venue: '패션 아카이브 역', eyebrow: 'ARCHIVE EXPRESS / TIME TICKET', headline: '당신의 옷장에 시간 여행을.',
    invitation: '시대를 고르기 전에, 빈티지 원본에 가까울지 오늘의 패션으로 풀지 정해 보세요.',
    accent: '#e6b989', secondary: '#d59edf', background: '#211925', layout: 'observatory', artifact: '시대별 패션 타임라인 포스터', duration: '약 3~4분 · 생성 시간 별도',
    preparation: ['같은 표정과 구도로 시대별 스타일의 차이를 비교해 보세요.', '상반신과 어깨가 충분히 보이는 사진이 좋아요.'],
    questions: [
      question('interpretation', '시대의 분위기를 얼마나 살릴까요?', '사진의 시대감과 현대적인 활용도 사이를 조절해요.', 'scale', [
        option('remix', '오늘의 리믹스', '지금 입을 수 있게', '시대의 색과 액세서리만 가져와 현대적인 실루엣에 섞어요.'),
        option('signature', '시대의 시그니처', '대표 스타일 중심', '시대를 떠올리게 하는 의상·헤어의 대표 요소를 강조해요.'),
        option('cinematic', '시대극의 한 장면', '연출에 몰입', '의상·헤어·필름 질감을 함께 바꾸되 역사적 복원을 주장하지 않아요.'),
      ]),
      question('finish', '시간 여행 기록의 질감은?', '포스터의 색과 표면 질감을 정해요.', 'swatches', [
        option('paper', '빛바랜 인쇄', '따뜻한 아카이브', '누런 종이와 낮은 채도로 오래된 패션 아카이브 느낌을 표현해요.', '#bf9f78'),
        option('film', '컬러 네거티브', '생생한 필름', '은은한 입자와 깊은 색으로 필름 스냅의 분위기를 표현해요.', '#b86753'),
        option('clean', '갤러리 프린트', '선명한 비교', '동일한 배경과 정돈된 색으로 시대별 의상 차이가 잘 보이게 해요.', '#cad7df'),
      ]),
    ], processing: ['선택한 시대의 스타일 요소 펼치기', '같은 인물의 시대별 룩 연출하기', '연대순 타임라인 포스터 배치하기'],
    scope: '시대에서 영감을 받은 창작 화보예요. 역사적 복원이나 외모 적합도 측정은 아니에요.',
  },
  'ai-coord-recommender': {
    venue: '오늘의 피팅룸', eyebrow: 'LOOK DESK / THREE OUTFITS', headline: '약속에 어울리는 세 벌을 준비해요.',
    invitation: '날씨와 움직임까지 생각한 코디 상담을 시작해요.',
    accent: '#aabfff', secondary: '#e9bd92', background: '#182032', layout: 'counter', artifact: 'TPO 코디 카드 3장', duration: '약 3~4분',
    preparation: ['카메라 색은 조명에 따라 달라져요. 평소 좋아하는 색을 우선해 주세요.', '오늘 입을 장소와 가장 편한 신발을 떠올려 주세요.'],
    questions: [
      question('weather', '옷을 입을 때의 날씨는?', '겉옷과 소재를 고르는 데 필요한 조건이에요.', 'chips', [
        option('hot', '덥고 습함', '가벼운 소재', '통기성 있는 상의와 가벼운 하의, 실내 냉방용 얇은 겉옷을 제안해요.'),
        option('mild', '선선함', '가벼운 레이어', '벗어 들기 쉬운 셔츠·가디건 레이어를 중심으로 조합해요.'),
        option('cold', '추움', '보온 우선', '보온 이너와 겉옷을 겹치고 목과 발을 따뜻하게 하는 조합을 제안해요.'),
        option('rain', '비가 올 예정', '물과 미끄럼 대비', '젖기 쉬운 긴 밑단을 피하고 접지력과 건조가 쉬운 신발을 우선해요.'),
      ]),
      question('movement', '하루 중 움직임은 어느 정도인가요?', '보기 좋은 것과 실제 편안함을 함께 맞춰요.', 'scale', [
        option('seated', '주로 앉아서', '실내 일정', '앉았을 때 조이지 않는 허리와 구김이 덜 눈에 띄는 소재를 추천해요.'),
        option('mixed', '이동과 휴식 반반', '여러 장소', '쉽게 벗을 수 있는 겉옷과 중간 크기 가방으로 이동을 편하게 해요.'),
        option('walking', '오래 걷기', '보행 중심', '낮고 안정적인 신발, 활동 범위가 넓은 하의, 가벼운 가방을 우선해요.'),
      ]),
    ], processing: ['날씨·활동·TPO 조건 묶기', '상의와 하의의 조합 비교하기', '착용 팁을 담은 세 가지 코디 완성하기'],
    scope: '실시간 상품 재고·가격 조회나 사진만으로 확정하는 퍼스널 컬러 진단은 제공하지 않아요.',
  },
  'ai-idol-makeup-booth': {
    venue: '데뷔 메이크업 룸', eyebrow: 'DEBUT ROOM / READY FOR STAGE', headline: '무대에 오르기 전, 나만의 터치.',
    invitation: '메이크업 아티스트에게 주문하듯 포인트와 반짝임을 골라요.',
    accent: '#ff9bc9', secondary: '#b5afff', background: '#291b30', layout: 'atelier', artifact: '데뷔 포토카드와 메이크업 레시피', duration: '약 3분 · 생성 시간 별도',
    preparation: ['눈과 입술이 보이게 정면으로 촬영해 주세요.', '결과는 가상 연출이며 제품의 실제 발색과 다를 수 있어요.'],
    questions: [
      question('intensity', '무대 메이크업의 강도는?', '같은 콘셉트라도 일상적인 룩부터 공연용까지 조절해요.', 'scale', [
        option('soft', '내추럴', '티 나지 않는 포인트', '피부 표현은 자연스럽게 두고 아이라인과 립의 농도를 낮춰요.'),
        option('camera', '카메라 레디', '사진에 선명하게', '눈과 입술의 대비를 중간 정도로 살려 촬영에서 또렷하게 보여요.'),
        option('stage', '스테이지', '빛나는 공연 룩', '무대 조명을 고려한 선명한 색과 제한적인 반짝임을 강조해요.'),
      ]),
      question('focus', '나의 시그니처 포인트는?', '주목할 부분 한 곳을 정하면 룩이 더 분명해져요.', 'swatches', [
        option('eyes', '눈매', '라인과 음영', '눈매에 포인트를 주고 볼과 입술은 차분하게 정리해요.', '#9f83d7'),
        option('lips', '립 컬러', '또렷한 한 가지 색', '립 컬러를 주인공으로 두고 눈 화장은 간결하게 연출해요.', '#d76483'),
        option('glow', '글로우', '빛나는 하이라이트', '광대와 눈 앞머리에 은은한 빛을 두고 전체 색을 부드럽게 맞춰요.', '#e8c5a1'),
      ]),
    ], processing: ['콘셉트와 메이크업 강도 맞추기', '눈·립·글로우 포인트 연출하기', '조명과 활동명을 담은 데뷔 카드 완성하기'],
  },
  'ai-fan-photocard': {
    venue: '컬렉터 팩 카운터', eyebrow: 'FAN CLUB / PERSONAL EDITION', headline: '오늘의 한정판은 바로 당신.',
    invitation: '카드 뒷면의 이야기까지 생각하며 나만의 컬렉션을 만들어요.',
    accent: '#99e3ea', secondary: '#fcada2', background: '#14292d', layout: 'counter', artifact: '개인 소장용 랜덤 포토카드 팩', duration: '약 2~3분 · 생성 시간 별도',
    preparation: ['포토카드에 들어갈 짧은 활동명을 준비해 주세요.', '얼굴과 손 포즈가 모두 프레임 안에 들어오게 촬영해 주세요.'],
    questions: [
      question('edition', '어떤 날을 기념하는 카드인가요?', '짧은 카피와 소품의 방향을 정해요.', 'cards', [
        option('debut', '첫 번째 데뷔', '처음의 설렘', '데뷔 인사와 첫 에디션을 표현하는 단정한 프레임을 제안해요.'),
        option('anniversary', '기념일 에디션', '오늘을 간직하기', '축하 메시지와 작은 별 장식으로 기념일 카드를 연출해요.'),
        option('concert', '앙코르 에디션', '공연의 여운', '팬에게 손을 흔드는 분위기와 공연 후 인사를 카드에 담아요.'),
      ]),
      question('finish', '어떤 카드 질감을 좋아하나요?', '화면 속 프레임의 재질과 반짝임을 고르는 창작 브리프예요.', 'swatches', [
        option('matte', '매트 페이퍼', '사진에 집중', '장식을 줄이고 무광 종이 느낌으로 인물과 표정에 집중해요.', '#e1d8ca'),
        option('foil', '실버 포일', '차분한 반짝임', '가장자리의 은빛 장식과 선명한 사진으로 수집 카드 느낌을 살려요.', '#b9cbd6'),
        option('holo', '홀로그램', '빛에 따라 다른 색', '분홍·민트 계열의 홀로그램 장식을 사진 바깥 테두리에 배치해요.', '#b4addc'),
      ]),
    ], processing: ['활동명과 기념 에디션 배치하기', '화보 톤과 카드 프레임 입히기', '데모 레어도 팩 포장하기'],
    scope: '개인 창작 포토카드예요. 실제 연예인·소속사의 공식 상품이 아니며 레어도는 데모 연출이에요.',
  },
  'ai-musicvideo-maker': {
    venue: '뮤직비디오 디렉터 부스', eyebrow: 'DIRECTOR’S MONITOR / FIRST CUT', headline: '한 컷에서 시작하는 나의 뮤직비디오.',
    invitation: '감독석에서 곡의 이야기와 편집 리듬을 먼저 정해 보세요.',
    accent: '#b9a4ff', secondary: '#b8ef80', background: '#19162b', layout: 'studio', artifact: '대표 컷으로 연출한 뮤직비디오 프리뷰', duration: '약 3~4분 · 생성 시간 별도',
    preparation: ['상반신과 팔 동작이 잘 보이게 포즈를 잡아 주세요.', '데모는 사진을 활용한 컷 연출이며 현장 영상 촬영과는 달라요.'],
    questions: [
      question('story', '이 곡이 전하고 싶은 이야기는?', '제목·가사·컷의 연결을 하나의 이야기로 묶어요.', 'cards', [
        option('beginning', '새로운 출발', '앞으로 나아가는 나', '첫 컷의 망설임에서 마지막 컷의 자신감으로 이어지는 이야기를 만들어요.'),
        option('celebrate', '오늘을 축하해', '함께 즐기는 순간', '짧은 축하 훅과 밝은 조명으로 순간을 기념하는 구성을 만들어요.'),
        option('night', '도시의 밤', '혼자만의 여운', '늦은 밤의 색감과 짧은 독백형 가사로 차분한 장면을 연결해요.'),
      ]),
      question('editEnergy', '편집의 에너지는?', '연출의 강도와 컷 전환 방향을 정해요.', 'scale', [
        option('gentle', '천천히', '장면의 여운', '긴 호흡의 장면과 부드러운 전환을 제안하고 강한 번쩍임을 피하세요.'),
        option('balanced', '리듬 있게', '편안한 비트', '후렴에서만 장면 변화를 강조하고 나머지는 안정적인 템포로 구성해요.'),
        option('dynamic', '에너지 있게', '선명한 전환', '핵심 비트의 구도 변화를 강조하되 빠른 섬광 효과는 사용하지 않아요.'),
      ]),
    ], processing: ['곡의 이야기와 장르 정하기', '대표 컷의 배경과 연출 만들기', '장면 순서와 자막을 프리뷰로 편집하기'],
  },
  'ai-celeb-lookalike': {
    venue: '캐스팅 무드 갤러리', eyebrow: 'CASTING NOTES / VISUAL INSPIRATION', headline: '나의 화면 속 무드를 찾아요.',
    invitation: '실존 인물 대신 셀럽 무드로 매칭해요. 헤어·의상·표정에서 영감을 얻어 연출해 보고 싶은 모습을 골라요.',
    accent: '#e7be79', secondary: '#b8c9ed', background: '#28211b', layout: 'gallery', artifact: '셀럽 무드 캐스팅 카드', duration: '약 2~3분',
    preparation: ['한 사람의 얼굴이 선명하게 보이는 사진을 사용해 주세요.', '외모 비교는 가벼운 스타일 놀이로 즐겨 주세요.'],
    questions: [
      question('castingMood', '어떤 화면 속 분위기가 궁금한가요?', '닮음의 점수보다 연출해 보고 싶은 분위기를 중심으로 봐요.', 'cards', [
        option('warm', '따뜻한 주인공', '편안한 미소', '부드러운 조명·내추럴 헤어·편안한 미소로 표현할 수 있는 스타일을 제안해요.'),
        option('chic', '시크한 화보', '절제된 표정', '간결한 착장과 차분한 표정으로 시도할 수 있는 화보 스타일을 제안해요.'),
        option('bright', '청량한 무대', '밝은 에너지', '밝은 배경과 선명한 포인트 컬러를 활용한 무대 스타일을 제안해요.'),
      ]),
      question('takeaway', '무엇을 가져가고 싶나요?', '결과를 실제로 시도할 수 있는 스타일 팁으로 연결해요.', 'chips', [
        option('hair', '헤어 영감', '모양과 볼륨', '추천 무드에 맞는 가르마·볼륨·머리 장식의 아이디어를 함께 정리해요.'),
        option('photo', '촬영 포즈', '시선과 각도', '동일한 얼굴에서도 시도할 수 있는 시선 방향과 표정의 팁을 제안해요.'),
        option('outfit', '스타일링', '색과 실루엣', '캐스팅 무드와 어울리는 의상 색 한 가지와 실루엣을 추천해요.'),
      ]),
    ], processing: ['선택한 분야와 연출 무드 정리하기', '사진에 보이는 스타일 특징 비교하기', '다음 촬영에 쓸 캐스팅 노트 완성하기'],
    scope: '닮음 수치는 창작용 참고 표현이며 신원·성격·민족·혈연 관계를 판별하지 않아요.',
  },
  'ai-voice-lab': {
    venue: '보이스 녹음실', eyebrow: 'VOICE SESSION / TAKE 01', headline: '목소리를 듣고, 다음 테이크를 바꿔요.',
    invitation: '조용한 녹음실처럼 준비한 뒤 말의 속도와 전달 방식을 함께 살펴봐요.',
    accent: '#81dfbe', secondary: '#e6b874', background: '#122724', layout: 'lab', artifact: '보이스 테이크 노트와 필터 플레이어', duration: '약 3분',
    preparation: ['조용한 곳에서 마이크와 일정한 거리를 유지해 주세요.', '10초 동안 편한 목소리로 읽고, 아프거나 피곤하면 쉬어 주세요.'],
    questions: [
      question('recordingPlace', '지금 녹음 환경은 어떤가요?', '배경 소음과 울림이 측정값에 섞일 수 있어요.', 'chips', [
        option('quiet', '조용한 실내', '배경 소음 적음', '같은 거리와 볼륨을 유지해 두 번 읽고 문장 끝의 전달감을 비교해 보세요.'),
        option('echo', '울림 있는 실내', '빈 방·큰 공간', '커튼이나 부드러운 가구 가까이에서 녹음하고 긴 잔향이 줄었는지 들어 보세요.'),
        option('noisy', '주변 소음 있음', '행사장·야외', '가능하면 조용한 위치로 이동해 다시 녹음하고 현재 수치를 확정적으로 해석하지 마세요.'),
      ]),
      question('practice', '다음 테이크에서 바꾸고 싶은 것은?', '짧은 음성으로 능력을 판정하는 대신 연습 목표를 정해요.', 'cards', [
        option('clarity', '또렷한 전달', '단어가 들리게', '문장 사이에 짧게 쉬고 마지막 음절을 서두르지 않는 연습을 제안해요.'),
        option('expression', '자연스러운 표현', '강조와 억양', '핵심 단어 하나에만 힘을 주고 전후 문장은 편하게 읽어 보세요.'),
        option('comfort', '편안한 소리', '힘주지 않고', '익숙한 높이에서 작은 문장부터 읽고 억지로 고음이나 큰 소리를 내지 않아요.'),
      ]),
    ], processing: ['녹음 환경과 테이크 확인하기', '이번 녹음의 음높이·크기 변화 살펴보기', '목표에 맞는 다음 테이크 노트 쓰기'],
    scope: '짧은 녹음의 참고값이에요. 성격·건강·성별·보컬 음역이나 실력을 확정하지 않아요.',
  },
  'ai-hanbok-booth': {
    venue: '한복 사진관', eyebrow: 'HANBOK PORTRAIT / 나의 한복 한 장', headline: '색과 선을 골라, 한복을 입어요.',
    invitation: '한복의 실루엣과 배경을 고르기 전, 사진에 담을 분위기를 정해 보세요.',
    accent: '#e9b9a2', secondary: '#9ad1bf', background: '#28201d', layout: 'atelier', artifact: '한복 기념사진과 문화 카드', duration: '약 3분 · 생성 시간 별도',
    preparation: ['어깨선과 목 주변을 가리지 않은 사진이 좋아요.', '편안하게 앉거나 서서 촬영해도 괜찮아요.'],
    questions: [
      question('palette', '어떤 배색에 마음이 가나요?', '실제 피부색을 판정하지 않고 직접 고른 취향을 적용해요.', 'swatches', [
        option('soft', '담백한 옥빛', '은은한 대비', '옥색과 아이보리의 부드러운 배색으로 한복의 선을 보여줘요.', '#a4c8b7'),
        option('bold', '선명한 자주', '또렷한 포인트', '자주색 포인트와 차분한 바탕색으로 기념사진의 존재감을 살려요.', '#a95c79'),
        option('earth', '차분한 흙빛', '따뜻한 질감', '갈색·연베이지 중심의 차분한 창작 배색을 제안해요.', '#b39977'),
      ]),
      question('occasion', '사진에 어떤 이야기를 담을까요?', '포즈와 기념 문구의 방향을 정해요.', 'cards', [
        option('visit', '한국 여행의 하루', '여행 기념', '배경의 분위기를 충분히 남기고 자연스러운 여행 기념사진으로 연출해요.'),
        option('celebrate', '특별한 기념일', '단정한 인사', '정면의 단정한 자세와 축하 문구를 중심으로 기념 초상을 만들어요.'),
        option('editorial', '현대적인 한복 화보', '나만의 해석', '전통에서 영감을 받은 색과 현대적인 구도로 창작 화보를 연출해요.'),
      ]),
    ], processing: ['한복의 선과 직접 고른 배색 맞추기', '기념일에 어울리는 자세와 배경 연출하기', '한복 사진과 문화 설명 카드 완성하기'],
    scope: '전통에서 영감을 받은 가상 착장으로, 시대별 복식의 완전한 고증이나 실제 맞춤 치수가 아니에요.',
  },
  'ai-traditional-painter': {
    venue: '먹향 화원', eyebrow: 'PORTRAIT ATELIER / 한 획의 기록', headline: '화원의 붓끝에서, 나의 초상이.',
    invitation: '여백과 먹의 농도를 골라 초상화의 인상을 직접 다듬어 보세요.',
    accent: '#dcc698', secondary: '#d18e7c', background: '#24221c', layout: 'gallery', artifact: '낙관을 담은 창작 초상화', duration: '약 3분 · 생성 시간 별도',
    preparation: ['얼굴과 어깨가 선명한 사진을 준비해 주세요.', '선택한 화풍은 전통 회화에서 영감을 얻은 현대적 해석이에요.'],
    questions: [
      question('ink', '붓의 농담은 어느 쪽이 좋나요?', '사진의 밝기로 결정하지 않고 작품의 표현을 직접 골라요.', 'scale', [
        option('light', '담묵', '맑고 옅은 선', '옅은 먹과 넓은 여백으로 가볍고 차분한 초상을 연출해요.'),
        option('balanced', '중간 농담', '선과 번짐의 균형', '윤곽은 읽기 쉽게 두고 옷과 배경에 부드러운 번짐을 더해요.'),
        option('deep', '농묵', '깊고 힘찬 선', '짙은 먹의 대비를 옷과 배경에 집중하고 얼굴의 특징은 부드럽게 남겨요.'),
      ]),
      question('motif', '여백에 무엇을 남길까요?', '그림의 의미를 외모에서 추론하지 않고 직접 선택해요.', 'cards', [
        option('empty', '오롯한 여백', '인물에 집중', '불필요한 소품 없이 여백과 낙관만으로 초상을 완성해요.'),
        option('bamboo', '대나무 한 줄기', '담백한 자연', '배경 한쪽에 가는 대나무를 작게 두어 인물을 가리지 않아요.'),
        option('blossom', '꽃가지 한 송이', '계절의 흔적', '연한 꽃가지 한 송이와 제한된 색으로 계절의 분위기를 더해요.'),
      ]),
    ], processing: ['화풍과 먹의 농담 준비하기', '윤곽과 여백을 초상으로 옮기기', '선택한 소재와 창작 낙관 배치하기'],
    scope: '실제 유물의 복제나 전통 화가의 진품이 아닌 AI 창작 초상화예요.',
  },
  'ai-heritage-timemachine': {
    venue: '문화유산 시간전시실', eyebrow: 'HERITAGE VIEW / 시간의 장면', headline: '과거의 풍경 속으로 한 걸음.',
    invitation: '문화유산을 바라보는 관점을 고르고, 사실 설명과 상상 장면을 함께 만나세요.',
    accent: '#dbc188', secondary: '#91b9bc', background: '#202b2b', layout: 'observatory', artifact: '시간 여행 기념사진과 관찰 카드', duration: '약 3~4분 · 생성 시간 별도',
    preparation: ['건축·사람들의 일상·풍경 중 궁금한 주제를 골라 주세요.', '생성 장면은 창작 재현이며 실제 유적 사진이나 복원 도면과 다를 수 있어요.'],
    questions: [
      question('lens', '무엇을 자세히 보고 싶나요?', '같은 장소라도 관찰할 지점을 다르게 안내해요.', 'cards', [
        option('architecture', '건축과 구조', '돌·문·지붕', '문화유산의 구조와 재료를 중심으로 관찰할 요소 세 가지를 정리해요.'),
        option('everyday', '그곳의 사람들', '생활을 상상', '당시의 일상은 상상 장면으로 분리하고 확인된 역사 설명과 구별해요.'),
        option('landscape', '장소의 풍경', '주변과의 관계', '건물과 주변 지형·하늘의 관계를 담은 넓은 장면을 연출해요.'),
      ]),
      question('storyDepth', '어떤 해설로 둘러볼까요?', '어려운 말의 양과 설명의 깊이를 조절해요.', 'scale', [
        option('first', '첫 방문', '쉽고 짧게', '전문 용어를 풀어 쓰고 대표 특징 한 가지부터 설명해요.'),
        option('curious', '호기심 탐방', '관찰 포인트 추가', '구조와 시대적 맥락을 연결하고 화면 속 관찰 포인트를 세 가지 제안해요.'),
        option('compare', '비교 감상', '달라진 모습 찾기', '남아 있는 부분과 후대에 보수된 부분을 구별해 설명하고 불확실한 재현은 상상이라고 밝혀요.'),
      ]),
    ], processing: ['방문 장소와 관찰 관점 정하기', '알려진 역사와 상상 연출 구별하기', '기념사진과 관찰 포인트 카드 만들기'],
    scope: 'AI 상상 재현으로 고증된 원형 복원이 아니에요. 역사 설명은 별도로 확인할 수 있어요.',
  },
  'ai-travel-style': {
    venue: '나의 여행 체크인 데스크', eyebrow: 'TRAVEL DESK / NEXT JOURNEY', headline: '내 속도에 맞는 여행을 체크인해요.',
    invitation: '여행 취향에 체류 시간과 이동 조건을 더해 실제 준비할 수 있는 방향을 찾아요.',
    accent: '#8ad8e4', secondary: '#efbd80', background: '#152a36', layout: 'counter', artifact: '여행 스타일 보딩패스와 패킹 노트', duration: '약 3분',
    preparation: ['떠날 수 있는 기간과 하루에 편하게 걷는 정도를 떠올려 주세요.', '날짜·항공편·예산을 확정하는 예약 서비스는 아니에요.'],
    questions: [
      question('tripLength', '얼마나 머물 수 있나요?', '이동에 쓰는 시간을 줄이고 하루의 밀도를 맞춰요.', 'chips', [
        option('day', '당일', '가볍게 다녀오기', '한 지역에 머물며 핵심 장소 1~2곳과 휴식 시간을 묶어 제안해요.'),
        option('weekend', '2~3일', '짧은 휴가', '하루 한 지역을 중심으로 이동을 묶고 저녁은 숙소 근처에서 마무리해요.'),
        option('long', '4일 이상', '여유 있게', '중간에 쉬는 날을 두고 세탁·날씨 변화에 대응할 짐을 제안해요.'),
      ]),
      question('access', '이동할 때 무엇을 우선할까요?', '장애 여부를 묻지 않고 필요한 환경을 직접 선택해요.', 'cards', [
        option('standard', '일반 동선', '걷기와 대중교통', '보행 구간과 환승 횟수를 함께 확인하고 쉬는 장소를 일정 사이에 배치해요.'),
        option('short', '짧은 보행', '자주 쉬며 이동', '짧은 보행 구간, 앉을 곳, 가까운 화장실을 우선 확인하도록 안내해요.'),
        option('stepfree', '계단 없는 동선', '유모차·휠체어 등', '엘리베이터·출입구 경사·이용 가능한 화장실을 공식 관광 정보와 시설에 사전 확인하도록 안내해요.'),
        option('quiet', '한적한 동선', '붐비는 곳 피하기', '방문 시간대를 분산하고 혼잡한 장소 뒤에 조용한 실내 휴식처를 제안해요.'),
      ]),
    ], processing: ['여행 속도와 체류 기간 맞추기', '선호 활동과 이동 조건 묶기', '보딩패스와 준비할 짐 정리하기'],
    scope: '여행 취향을 위한 예시 제안이에요. 영업시간·가격·접근성은 방문 전 공식 정보로 확인해 주세요.',
  },
  'ai-wedding-booth': {
    venue: '웨딩 포트레이트 살롱', eyebrow: 'TWO OF US / PORTRAIT SESSION', headline: '두 사람다운 한 장을 남겨요.',
    invitation: '사진작가와 대화하듯 거리감과 사진이 놓일 자리를 골라 보세요.',
    accent: '#f2bda9', secondary: '#d8cfad', background: '#302223', layout: 'lounge', artifact: '두 사람의 웨딩 기념 프린트', duration: '약 3분 · 생성 시간 별도',
    preparation: ['함께 촬영하는 두 사람 모두 사진 사용에 동의해 주세요.', '얼굴이 서로 가려지지 않게 어깨를 나란히 두면 좋아요.'],
    questions: [
      question('connection', '어떤 순간을 남기고 싶나요?', '접촉이나 특정 포즈를 강요하지 않고 편한 연출을 골라요.', 'cards', [
        option('side', '나란히 편안하게', '정면을 바라보며', '서로 닿지 않아도 자연스러운 거리에서 나란히 선 기념사진을 연출해요.'),
        option('laugh', '함께 웃는 순간', '눈을 마주치며', '편안하게 웃으며 서로를 바라보는 자연스러운 장면을 제안해요.'),
        option('hands', '손을 맞잡고', '작은 연결', '원할 때 손을 맞잡은 포즈로 두 사람의 연결을 표현해요.'),
      ]),
      question('display', '어디에 놓일 사진인가요?', '배경의 여백과 프레임의 분위기를 정해요.', 'chips', [
        option('desk', '책상 위 액자', '가까이 보는 한 장', '표정이 잘 보이는 상반신 구도와 간결한 프레임을 제안해요.'),
        option('welcome', '웰컴 테이블', '손님을 맞이하는 사진', '두 사람 주변에 여백을 두고 이름이 잘 읽히는 단정한 구도로 연출해요.'),
        option('album', '우리의 앨범', '이야기가 이어지는 사진', '일상의 한 장면처럼 자연스러운 배경과 표정으로 앨범에 어울리게 연출해요.'),
      ]),
    ], processing: ['두 사람에게 편한 포즈 확인하기', '사진이 놓일 자리와 테마 맞추기', '이름과 기념 프레임 완성하기'],
  },
  'ai-couple-chemistry': {
    venue: '둘만의 대화 라운지', eyebrow: 'CONVERSATION LOUNGE / TWO VOICES', headline: '맞히는 궁합보다, 알아가는 대화.',
    invitation: '각자 답해 보고 다른 선택이 나온 이유를 이야기하며 오늘의 작은 약속을 만들어요.',
    accent: '#d4adf3', secondary: '#ffc4a8', background: '#2b2033', layout: 'lounge', artifact: '우리의 대화 카드와 작은 약속', duration: '약 3~4분',
    preparation: ['상대 대신 고르기보다 각자의 답을 먼저 이야기해 주세요.', '정답이나 관계의 우열은 없어요. 편하게 건너갈 주제를 골라도 좋아요.'],
    questions: [
      question('conversationGoal', '오늘 어떤 이야기를 나누고 싶나요?', '점수보다 함께 실천할 대화의 주제를 정해요.', 'cards', [
        option('appreciate', '고마웠던 순간', '좋았던 기억', '최근 고마웠던 행동 한 가지를 구체적으로 말하고 상대의 답을 끝까지 들어 보세요.'),
        option('routine', '함께하는 일상', '작은 습관', '일주일에 한 번 함께하고 싶은 짧은 일상 활동을 각자 제안해 보세요.'),
        option('future', '다음에 하고 싶은 일', '새로운 경험', '각자 원하는 경험을 하나씩 말한 뒤 둘 다 편한 첫 단계를 골라 보세요.'),
      ]),
      question('sharedTime', '둘이 만들 수 있는 시간은?', '실제로 가능한 길이의 다음 행동을 제안해요.', 'scale', [
        option('ten', '10분', '잠깐의 여유', '오늘 10분 동안 기기를 내려놓고 서로의 하루에서 기억나는 순간을 하나씩 나눠요.'),
        option('hour', '한 시간', '작은 데이트', '익숙한 동네를 함께 걷거나 음료를 마시며 선택한 주제를 이야기해요.'),
        option('halfday', '반나절', '함께 계획하기', '활동 하나와 휴식 하나를 번갈아 고르고 서로의 선호를 일정에 하나씩 반영해요.'),
      ]),
    ], processing: ['각자가 고른 표현 방식 나란히 놓기', '같은 점과 다른 선호 살펴보기', '오늘 가능한 대화와 작은 약속 제안하기'],
    scope: '선호 답변으로 만드는 대화 놀이예요. 케미 수치는 연출이며 관계의 성공이나 심리 상태를 예측하지 않아요.',
  },
  'ai-future-family': {
    venue: '가족 상상 그림책방', eyebrow: 'IMAGINARY FAMILY / STORY PORTRAIT', headline: '미래를 맞히지 않고, 함께 그려요.',
    invitation: '두 장의 사진에서 출발해 전적으로 상상 속 가족 캐릭터와 이야기를 만들어요.',
    accent: '#edbe83', secondary: '#a9cdbc', background: '#2b251d', layout: 'gallery', artifact: '상상 가족 액자와 캐릭터 카드', duration: '약 3~4분 · 생성 시간 별도',
    preparation: ['두 사진의 당사자가 사용에 동의한 사진을 준비해 주세요.', '실제 아이의 외모·성격·건강·발달을 예측하는 체험이 아니에요.'],
    questions: [
      question('familyStory', '상상 속 가족은 무엇을 하며 놀까요?', '캐릭터의 관심사를 얼굴에서 추측하지 않고 직접 설정해요.', 'cards', [
        option('nature', '숲속 탐험', '나뭇잎과 작은 발견', '자연을 관찰하고 잎사귀를 모으는 상상 속 가족의 하루를 이야기로 만들어요.'),
        option('art', '그림 그리는 오후', '색으로 가득한 방', '함께 그림을 그리고 작품을 벽에 붙이는 가족 이야기와 색감을 제안해요.'),
        option('space', '우주 여행 놀이', '끝없는 상상', '종이 로켓을 타고 떠나는 상상 여행을 캐릭터 카드의 이야기로 담아요.'),
      ]),
      question('storybookTone', '그림책의 색은?', '가상의 가족 사진에 담을 창작 분위기를 정해요.', 'swatches', [
        option('pastel', '부드러운 파스텔', '따뜻한 동화', '크림색과 파스텔로 포근한 창작 가족 초상을 연출해요.', '#e6c5b7'),
        option('bright', '명랑한 원색', '활기찬 놀이', '선명한 소품 색과 밝은 배경으로 즐거운 가족 놀이를 표현해요.', '#e2b851'),
        option('forest', '차분한 초록', '자연의 여유', '초록과 나무색을 중심으로 편안한 자연 배경을 구성해요.', '#8ea88b'),
      ]),
    ], processing: ['사진을 캐릭터 창작의 참고로 준비하기', '선택한 놀이와 색으로 상상 가족 그리기', '허구의 캐릭터 카드와 액자 완성하기'],
    scope: '생성된 외모·성격·성장 이야기는 모두 허구이며 유전 정보나 실제 미래 예측이 아니에요.',
  },
  'ai-memory-movie': {
    venue: '추억 편집 상영관', eyebrow: 'MEMORY CINEMA / YOUR PREMIERE', headline: '우리의 사진이 한 편의 이야기가 돼요.',
    invitation: '편집자에게 전하듯 누구에게 보여줄지, 어떤 순서로 기억할지 정해요.',
    accent: '#e7c08c', secondary: '#cfa1a8', background: '#281c20', layout: 'studio', artifact: '자막과 음악을 담은 추억 무비', duration: '약 3~4분',
    preparation: ['함께 등장하는 사람의 동의를 받은 사진을 골라 주세요.', '사진은 직접 순서를 바꿀 수 있어요. 처음과 마지막 장면을 생각해 보세요.'],
    questions: [
      question('audience', '누구에게 보여줄 무비인가요?', '자막의 말투와 설명의 양을 관객에 맞춰요.', 'cards', [
        option('self', '나를 위해', '나만의 기록', '혼잣말처럼 짧은 자막으로 그 순간의 감정을 기록해요.'),
        option('close', '소중한 사람에게', '직접 건네는 편지', '상대에게 말하는 따뜻한 문장과 구체적인 감사의 마음을 담아요.'),
        option('guests', '모두 함께', '상영할 영상', '처음 보는 사람도 이해하도록 장면 사이 맥락을 짧게 설명해요.'),
      ]),
      question('narrative', '어떤 흐름으로 기억하고 싶나요?', '사진에 없는 사실을 지어내지 않고 편집 방향을 정해요.', 'chips', [
        option('chronological', '시간을 따라', '시작부터 오늘까지', '직접 정렬한 사진의 순서를 유지하고 확인되지 않은 날짜는 넣지 않아요.'),
        option('emotion', '감정을 따라', '잔잔함에서 벅참으로', '사진의 보이는 장면과 선택한 분위기에 맞춰 감정의 흐름을 제안해요.'),
        option('highlight', '가장 빛난 순간', '대표 장면으로 시작', '첫 사진을 대표 장면으로 사용하고 마지막에는 선택한 메시지를 남겨요.'),
      ]),
    ], processing: ['사진과 관객의 맥락 확인하기', '직접 고른 이야기 흐름으로 자막 쓰기', '음악과 장면을 이어 프리미어 준비하기'],
    scope: '사진에 없는 관계·날짜·사건을 사실로 단정하지 않아요. 사진 기반의 편집 영상이에요.',
  },
};
