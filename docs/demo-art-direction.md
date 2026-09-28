# 41개 서비스 데모 시각 개편 보고서

현재 화면 분리·무스크롤 대응과 최신 검증은 [데모 화면 분리 보고서](demo-viewport-flow.md)를 참고한다. 아래 기록은 최초 아트 디렉션 적용 시점의 검증이다.

작성일: 2026-09-23 · 대상: 서비스 목록의 팝업과 서비스 상세 페이지에 표시되는 모든 데모

## 적용 결과

41개 프로그램마다 독립된 이름·배경 사진·배색·한글 서체·사진 프레임·선택 버튼·장식과 화면 구성을 적용했다. 밝은 화면 27개와 어두운 화면 14개, 10가지 기본 구성을 조합하고 서비스별 CSS로 세부 형태를 다르게 설계했다. 같은 사진을 공통 배경으로 돌려 쓰지 않고 서비스별 사진 41개를 연결했다. 기존 실제 사례 사진 4개와 생성한 콘셉트 이미지 37개의 구분은 유지된다.

공통 격자 배경과 네트워크 장식을 제거했다. 컬러룸은 밝은 색 견본 편집물, 메이크업은 체리색 화장대, 향수는 식물 도감, 네일은 노란 스티커 숍, 커피는 원두 주문서, 한복은 비단과 한지, 여행은 탑승권, 과학은 실험 계기판, 웨딩은 초대장으로 설계했다. 질문·촬영·결과 화면에서도 해당 프로그램의 서체와 종이·잉크 색을 사용한다. 공통된 조작 순서와 접근성은 유지한다.

## 글자와 상세 보기

| 대상 | 적용 기준 |
| --- | --- |
| 주요 안내 제목 | 데스크톱 36–54px, 작은 모바일 38px |
| 서비스 상단 제목 | 21–30px, 긴 이름을 숨기지 않고 줄바꿈 |
| 본문·선택지·다음 버튼 | 주로 18px |
| 설문 질문 | 21px |
| 설명·단계 안내 | 14–17px |
| 기존 모듈의 작은 UI 문구 | 9–12px와 text-xs를 15px로, text-sm과 text-base를 18px로 확대 |
| 서비스 자세히 보기 | 제목 22px(모바일 21px), 보조 설명 14–15px, 큰 버튼과 하단 고정 영역 |

상세 보기 버튼은 프로그램 강조색으로 표시하고, 팝업에서는 해당 상세 페이지로 이동한다. 상세 페이지에서는 아래 서비스 소개로 이동한다. 작은 화면은 카드 열 수와 여백을 조정해 큰 글자를 유지한다. 사진 결과물 내부의 장식용 활자와 출력용 캔버스는 화면 UI와 별도로 취급한다.

## 서체와 자산

기존 Pretendard에 고운바탕·고운돋움·주아·도현·검은고딕·구기·송명·개구·해바라기·나눔명조·IBM Plex Sans KR·Hahmlet를 더해 총 13개 한글 서체 계열을 사용한다. 제목/본문 조합은 31종이며 굵기·자간·색·프레임·배치까지 프로그램 단위로 지정한다. 41개의 서로 다른 폰트 파일을 쓰는 구성은 아니다.

새 서체는 Google Fonts 공식 저장소 원본을 WOFF2로 압축하여 로컬 배포한다. 16개 파일 총 6.64MB이며, 방문한 프로그램에서 사용하는 서체만 브라우저가 요청하고 이후 캐시를 재사용한다. font-display: swap을 적용했다. 글리프 서브셋을 만들지 않아 입력한 한글 이름도 같은 서체로 표시된다. 원본 URL·크기·굵기는 [manifest](../public/fonts/programs/manifest.json), 각 서체의 OFL은 같은 폴더에 보관한다. [Google Fonts 한글 서체 안내](https://googlefonts.github.io/korean/)를 확인했다.

## 41개 디자인 명세

| 프로그램 | 디자인 취지 | 화면 구성 | 제목 / 본문 서체 | 배경 / 강조색 |
| --- | --- | --- | --- | --- |
| [CHROMA / 컬러룸](/services/ai-personal-color) | 색종이와 패브릭 견본을 펼쳐 놓은, 밝은 컬러 에디토리얼. | editorial · 밝음 | 고운바탕 / 고운돋움 | `#f2e9e5` / `#9d405c` |
| [SKIN NOTES](/services/ai-skincare-analysis) | 햇살이 드는 세이지색 상담실. 창문과 투명한 라벨로 정리하는 오늘의 루틴. | window · 밝음 | Pretendard / IBM Plex Sans KR | `#e6eee9` / `#2e6b53` |
| [AFTER GLOW](/services/ai-virtual-makeup) | 체리 블랙과 반사광, 화장대 거울 앞에서 펼쳐지는 메이크업 살롱. | salon · 어두움 | 도현 / Pretendard | `#200e16` / `#f9a3b7` |
| [향의 서가](/services/ai-scent-soulmate) | 식물 표본과 시향지를 모은 향의 도감. 잉크와 크림색 종이의 고요한 대화. | journal · 밝음 | 나눔명조 / 고운돋움 | `#eae5d5` / `#516342` |
| [TINY GALLERY](/services/ai-nail-designer) | 버터 옐로 위 코발트 잉크. 손끝의 작은 작품을 만드는 스티커 숍. | poster · 밝음 | 주아 / Pretendard | `#fff3a9` / `#2e48c7` |
| [CAVE No.06](/services/ai-sommelier) | 깊은 와인색 벽, 황동 액자와 손글씨 메뉴. 한 잔의 감각을 감상하는 갤러리. | gallery · 어두움 | 송명 / IBM Plex Sans KR | `#2c111c` / `#e8c78c` |
| [OFF HOUR](/services/ai-cocktail-creator) | 잉크 블루 위 라임빛 주문서. 둥근 잔과 긴 카운터가 만드는 밤의 리듬. | immersive · 어두움 | 구기 / IBM Plex Sans KR | `#101f35` / `#dcf58a` |
| [하루 한 잔](/services/ai-barista-matching) | 오트빛 원두 봉투와 파란 주문 라벨. 아침빛이 길게 들어오는 작은 커피 바. | split · 밝음 | Hahmlet / 고운돋움 | `#ece8dc` / `#235c9a` |
| [맛의 여권](/services/ai-taste-dna) | 살구색 티켓, 오렌지 스탬프. 새로운 한 입을 찾아가는 즐거운 미식 여행. | ticket · 밝음 | 검은고딕 / 해바라기 | `#f7ddca` / `#ac411e` |
| [DRESS NOTE](/services/ai-style-profiler) | 옷장을 한 권의 독립 패션 매거진처럼 편집하는 화이트 에디토리얼 | editorial · 밝음 | Hahmlet / Pretendard | `#f2f0e9` / `#4a6048` |
| [THE COVER](/services/ai-runway-photobooth) | 백스테이지의 검은 벽과 패션지의 커다란 명조 타이틀 | immersive · 어두움 | 나눔명조 / IBM Plex Sans KR | `#161412` / `#eee4ce` |
| [TIME WARDROBE](/services/ai-fashion-timemachine) | 색 바랜 박물관 소장품 봉투와 시대를 넘나드는 황토색 승차권 | ticket · 밝음 | 도현 / 고운바탕 | `#e7d7b4` / `#973b26` |
| [LOOK SERVICE](/services/ai-coord-recommender) | 파란 작업 지시서와 흰 피팅룸으로 구성한 실용적인 스타일 데스크 | window · 밝음 | IBM Plex Sans KR / Pretendard | `#e8edf4` / `#2157b6` |
| [DEBUT CLUB](/services/ai-idol-makeup-booth) | 체리색 벨벳과 조명 달린 거울을 품은 스타의 개인 분장실 | salon · 어두움 | 주아 / 해바라기 | `#351325` / `#ffc0d5` |
| [DEAR COLLECTOR](/services/ai-fan-photocard) | 라일락 팝업 창과 레몬색 스티커가 놓인 팬의 카드 보관함 | window · 밝음 | 구기 / 고운돋움 | `#eae0f5` / `#745097` |
| [SIDE A](/services/ai-musicvideo-maker) | 애시드 그린의 큰 활자와 검은 공연 포스터로 만든 뮤직비디오 편집석 | poster · 어두움 | 검은고딕 / IBM Plex Sans KR | `#191b17` / `#d2f07b` |
| [CASTING ROOM](/services/ai-celeb-lookalike) | 은회색 콘택트 시트와 검정 인덱스 탭으로 고르는 캐스팅 보드 | gallery · 밝음 | 도현 / Pretendard | `#ebe9e5` / `#333330` |
| [TAKE ONE](/services/ai-voice-lab) | 호박색 VU 미터와 따뜻한 검정 금속을 닮은 아날로그 녹음 콘솔 | console · 어두움 | IBM Plex Sans KR / 고운돋움 | `#24221c` / `#f0ba68` |
| [옷의 결](/services/ai-hanbok-booth) | 옥빛 비단의 넓은 색면과 한지색 여백이 만나는 현대 한복 사진관 | split · 밝음 | 고운바탕 / 해바라기 | `#e5ebe2` / `#356755` |
| [먹 한 점](/services/ai-traditional-painter) | 먹빛 타이틀과 주홍 낙관이 살아 있는 여백 많은 화원의 종이 | journal · 밝음 | 송명 / 고운바탕 | `#eae4d5` / `#a84131` |
| [시간의 문](/services/ai-heritage-timemachine) | 짙은 녹청색 전시실 안으로 들어서는 황동색 문화유산의 문 | immersive · 어두움 | 고운바탕 / Pretendard | `#122b2b` / `#dfbd73` |
| [NEXT STOP](/services/ai-travel-style) | 코발트색 출발 표시와 따뜻한 흰 종이로 만든 나만의 보딩패스 | ticket · 밝음 | 도현 / IBM Plex Sans KR | `#e8e6dd` / `#245ba0` |
| [우리의 장면](/services/ai-wedding-booth) | 와인색 활자와 넉넉한 크림색 여백으로 쓴 두 사람의 초대장 | salon · 밝음 | 나눔명조 / 고운바탕 | `#f2e8dd` / `#85424f` |
| [둘의 문장](/services/ai-couple-chemistry) | 서로 건네는 두 장의 엽서와 손글씨로 꾸민 따뜻한 대화 편집실 | journal · 밝음 | 개구 / 고운돋움 | `#efe4d5` / `#af5748` |
| [작은 가족책](/services/ai-future-family) | 버터색 책 표지와 코발트색 종이 조각으로 만든 상상 가족 그림책 | poster · 밝음 | 주아 / 고운돋움 | `#f3e8ba` / `#4d6b8e` |
| [AFTER CREDITS](/services/ai-memory-movie) | 검은 올리브색 극장과 담백한 크림색 자막으로 기록하는 사적인 시네마 | immersive · 어두움 | 송명 / IBM Plex Sans KR | `#21241f` / `#e7ce9a` |
| [졸업 기록실](/services/ai-graduation-booth) | 크림색 졸업 앨범과 깊은 녹색 제본, 와인색 기념 인장으로 남기는 한 장의 이정표. | editorial · 밝음 | 나눔명조 / Pretendard | `#f4f0e5` / `#7b403f` |
| [가능성 노트](/services/ai-future-career) | 버터색 탐색 노트에 녹색 색인을 붙이고, 관심 활동을 한 페이지씩 모으는 진로 편집실. | journal · 밝음 | Hahmlet / 해바라기 | `#f3efcd` / `#2e684f` |
| [변수 실험국](/services/ai-science-kiosk) | 잉크색 계기판 위 민트 신호와 주황색 조작점을 사용한 탐구 관제실. 관찰과 조작이 주인공. | console · 어두움 | 구기 / IBM Plex Sans KR | `#071d2d` / `#a8eed1` |
| [시간의 전시실](/services/ai-history-travel) | 석회색 전시장, 종이 도록, 적갈색 전시 번호로 구성한 시대 초상 아카이브. | gallery · 밝음 | 송명 / 고운바탕 | `#e9e3d7` / `#8a4634` |
| [내일의 우편함](/services/ai-timecapsule-photo) | 연보라 편지지와 자주색 우편 인장을 가진 미래의 엽서. 예측 대신 상상한 시간을 봉인한다. | ticket · 밝음 | 고운돋움 / 고운바탕 | `#ece7f5` / `#6a4779` |
| [달빛 예언극장](/services/ai-fortune-robot) | 자주색 벨벳 막과 황금빛 초승달이 여는 작은 이야기 무대. 운세는 극장의 즐거운 한 장면. | immersive · 어두움 | 구기 / 고운돋움 | `#23162d` / `#f8cf86` |
| [인상 이야기극](/services/ai-face-reading) | 살구색 벽과 옥색 액자를 갖춘 초상 살롱. 얼굴의 인상을 한 편의 창작 이야기로 옮긴다. | salon · 밝음 | 송명 / Pretendard | `#f4e2d7` / `#38645a` |
| [손금 서사공방](/services/ai-palm-reading) | 양피지 위의 유려한 선과 먹빛 제목이 만드는 공예 수첩. 손의 선을 창작 서사의 길로 읽는다. | journal · 밝음 | 고운바탕 / 고운돋움 | `#e8e2ce` / `#346259` |
| [한 컷 웃음화실](/services/ai-caricature-artist) | 레몬색 포스터, 굵은 잉크 윤곽, 손글씨 제목과 종이 오려붙임이 어울리는 거리 초상 화실. | poster · 밝음 | 개구 / Pretendard | `#f8e785` / `#284fac` |
| [빛의 기류](/services/ai-aura-reading) | 짙은 보랏빛 광학실에서 복숭아빛과 라일락빛이 번지는 창. 오라는 성격 수치가 아닌 색의 작품. | window · 어두움 | 해바라기 / 고운돋움 | `#171329` / `#ffbdc7` |
| [페르소나 조형실](/services/ai-brand-avatar) | 코발트색 제작실에 라임색 판과 굵은 타이포그래피를 결합한 브랜드 캐릭터 제작 무대. | split · 어두움 | 검은고딕 / IBM Plex Sans KR | `#12295a` / `#d6ff65` |
| [선택의 편집숍](/services/ai-product-experience) | 따뜻한 회백색 카탈로그와 코냑색 색인. 생활 장면을 먼저 읽고 제품을 비교하는 조용한 편집숍. | editorial · 밝음 | Hahmlet / Pretendard | `#eeece6` / `#8e442e` |
| [우리의 합동 작업실](/services/ai-team-chemistry) | 피스타치오색 공방에서 서로 겹치는 블록과 둥근 말풍선으로 함께 일하는 방식을 조합한다. | window · 밝음 | 도현 / 해바라기 | `#e1edc8` / `#275861` |
| [내일을 붙이는 벽](/services/ai-vision-wall) | 차콜색 행사 벽에 복숭아색 종이와 커다란 둥근 제목을 붙여 만드는 공동의 미래 포스터. | poster · 어두움 | 주아 / Pretendard | `#292a2c` / `#ffb18d` |
| [첫인상 인쇄소](/services/ai-business-card) | 차가운 흰 종이, 군청색 잉크, 얇은 재단선으로 만든 작은 인쇄소. 소개의 우선순위를 한 장에 찍는다. | ticket · 밝음 | IBM Plex Sans KR / Pretendard | `#e8edf2` / `#224c9c` |

## 웹 레퍼런스와 반영 범위

브랜드·전시·도구의 공식 자료에서 서비스에 적합한 분위기와 정보 배치를 연구했다. 아래 방향은 자료를 바탕으로 한 독자적인 제작 판단이다.

- [Aesop의 디자인 철학](https://www.aesop.com/philosophy-on-design.html): 공간과 목적에 맞는 재료를 고르는 관점을 참고해 뷰티·향·테이스팅 공간을 구분했다.
- [MoMA — The New Typography](https://www.moma.org/calendar/exhibitions/1013): 제목과 이미지의 비대칭 구성을 명함·브랜드·제품 체험에 해석했다.
- [Cooper Hewitt — How Posters Work](https://www.cooperhewitt.org/exhibitions/how-posters-work/): 시각적 이야기 전달을 네일·캐리커처·비전 월의 큰 제목과 장식에 참고했다.
- [V&A Fashion](https://www.vam.ac.uk/collections/fashion): 시대와 소장품의 맥락을 패션 타임머신의 기록물과 카드 수집 형태로 해석했다.
- [Ableton Live](https://www.ableton.com/en/live/): 제작 도구의 구분을 음성 콘솔과 공연 포스터의 서로 다른 분위기에 참고했다.

서비스별 레퍼런스와 적용 근거: [뷰티·F&B 9개](demo-art-beauty-fnb.md), [포토·패션·문화·웨딩 17개](demo-art-photo-culture.md), [학습·행사 15개](demo-art-learning-events.md).

## 검증

- 전체 41개에서 소개 질문 → 기존 입력 → 처리 → 결과 → 다시 시작을 브라우저로 실행했다. 41/41 통과, 추가 질문 값이 AI 요청에 포함되는 것과 다시 시작 시 초기화되는 것을 확인했다. 이 회귀 검증은 API에 의도적인 503을 반환해 샘플 결과 경로를 검사했으며 실제 AI 품질 평가와 구분한다.
- 전체 41개 × 데스크톱 1440px / 모바일 320px, 총 82개 시작 화면에서 실제 사진·폰트 로딩, 선택, 다음 단계, 가로 넘침을 확인했다.
- 밝은 결과의 반투명 회색 패널을 불투명한 프로그램 종이색으로 바꾸고, 어두운 사진·작품 영역과 강조 버튼에 명시적인 텍스트 대비를 적용했다.
- 피부·커피의 데스크톱/모바일 결과 4건과 졸업·명함·제품·웨딩·팬 포토카드의 모바일 결과 5건, 총 9건을 추가 검증했다. 9건 모두 의미 있는 결과 문구의 가로 넘침·잘림이 없었다. 그중 졸업·명함·제품·웨딩·팬 포토카드 5건은 실제 파일 다운로드와 이미지 크기도 확인했다. 포토카드는 팩 뜯기 → 카드 공개 → 출력 → JPEG 저장까지 확인했다. 샘플 경로이며 사진 위 장식·숨겨진 카드 뒷면·일회성 파티클의 대비 계산은 본문 검증과 구분했다.
- 상세 보기 버튼을 1440px와 320px에서 확인했다. 첫 화면에서 버튼 전체가 보이며, 제목은 각각 22px/21px이고 실제 높이는 93px/약 82px이다. 팝업의 키보드 포커스 순환, 상세 페이지 이동 후 스크롤 잠금 해제, 상세 소개 앵커 이동을 모두 확인했다.
- 변경된 데모 컴포넌트·설정의 ESLint 검사와 최종 프로덕션 빌드(타입 검사 포함)가 통과했고 214개 페이지가 생성됐다. 초기 빌드에서는 포트폴리오의 외부 Firestore 응답 파싱 경고가 한 차례 있었지만 최종 빌드에서는 재현되지 않았다. 포트폴리오 조회 소스는 이번 변경에서 수정하지 않았다.
- 세부 검증 기록과 화면 캡처는 로컬 .playwright-mcp/demo-art-direction/ 및 .playwright-mcp/demo-redesign/에 보관한다.

기존 질문·분석·출력 개편은 [체험 개편 보고서](demo-experience-redesign.md), 이미지 생성 내역은 [서비스 이미지 보고서](service-images.md)를 참고한다.
