# 학습·행사 15개 프로그램 아트 디렉션

작성·자료 확인: 2026-09-23.

`art-learning-events.ts`는 질문과 AI 동작에 영향을 주지 않는 시각 설정이다. `program-learning-events.css`는 각각의 `.experience-venue[data-program='ai-…']` 안에서만 작동한다. 밝은 종이·전시·공방 10개, 어두운 무대·제작실 5개로 나누고, 15개 모두 다른 제목/본문 서체 조합을 사용한다. 10개 composition을 모두 활용한다. 사진은 이미 제작한 서비스 콘셉트 이미지를 사용하며 아래 좌표는 그 사진의 실제 주인공·결과물 위치를 보고 정했다.

본문 크기는 공통 renderer가 정한다. 이 파일에는 글자 크기 축소, 질문 변경, 전역 선택자, 격자 배경, 별도 애니메이션을 넣지 않았다. 장식은 인장·테두리·색면·종이의 그림자로 만들고, 실제 버튼의 내용과 선택 상태가 우선 보이도록 한다. 아래의 인쇄·전시 은유는 독자적으로 만든 디자인 방향이며 참고 기관의 프로그램이나 협업을 뜻하지 않는다.

## 확인한 1차 자료와 적용 판단

- **[NASA Graphics Standards Manual, 1976](https://www.nasa.gov/wp-content/uploads/2015/01/nasa_graphics_manual_nhb_1430-2_jan_1976.pdf)** — PDF 25–26쪽의 출판물 설명과 35쪽의 교육 출판물 예시를 확인했다. 제목 중심의 단순한 구성, 명확한 정보 단계와 제한된 강조색을 과학 실험국과 인쇄소에 참고했다. NASA 로고·임무 표장이나 도형을 복제하지 않는다. 문서에 있는 레이아웃 규칙을 화면의 격자 무늬로 옮기지 않는다.
- **[Smithsonian American Art Museum — Interdisciplinary Teaching with Museum Objects](https://americanart.si.edu/education/learning/interdisciplinary-teaching-museum-objects)** — 작품과 사물에서 출발하는 학습 자료를 확인했다. 역사·졸업·진로 화면에서 작은 결과물과 그 맥락이 선명하게 보이는 도록·노트 형식을 선택한 근거다.
- **[Smithsonian Learning Lab — Research](https://learninglab.si.edu/about/research)** — 박물관 자료를 교육용으로 맥락화하고 선별하는 연구 방향을 확인했다. 진로 노트, 역사 전시, 미래 엽서에서 한 번에 하나의 조건과 기록을 다루는 시각적 구획을 참고했다. 학습 효과가 검증된 UI라는 주장은 하지 않는다.
- **[MoMA — The New Typography](https://www.moma.org/calendar/exhibitions/1013)** — 비대칭적인 타이포그래피와 이미지 배치가 명함·책·포스터 등에 확장된 전시 설명을 확인했다. 브랜드 조형실·제품 편집숍·명함 인쇄소의 강한 제목, 열린 여백, 서로 다른 정보 밀도에 참고했다.
- **[MoMA — Bauhaus: The Graphic Design Department Goes Back to School](https://www.moma.org/explore/inside_out/2009/11/06/bauhaus-the-graphic-design-department-goes-back-to-school/)** — 전시 디자이너가 주제와 공간에 맞추어 제목 글자와 색 경계를 만든 과정을 확인했다. 역사 전시의 액자, 팀 공방의 연결된 형태, 브랜드의 라임색 판에 참고했다. 특정 바우하우스 도형이나 기존 전시 타이틀을 재현하지 않는다.
- **[Cooper Hewitt — How Posters Work](https://www.cooperhewitt.org/exhibitions/how-posters-work/)** — 포스터의 시각적 이야기 전달과 지각을 다루는 전시 설명을 확인했다. 캐리커처·비전 월·운세 극장에서 제목과 하나의 선명한 장식이 먼저 읽히는 구성을 선택했다.
- **[Cooper Hewitt — Making a Poster is a Process](https://www.cooperhewitt.org/2014/12/05/making-a-poster-is-a-process/)** — 스케치, 글자 조합, 인쇄 과정을 통해 종이·색·서체의 촉감을 만든 사례를 확인했다. 캐리커처의 펜 윤곽, 손금 공방의 선, 오라의 빛, 비전 월의 붙임 종이에 독자적으로 적용했다.

다음 표의 설계는 이 자료를 바탕으로 한 제작 판단이다. 원문이 특정 색·한글 서체·체험 형식을 추천하거나 성능을 보증한다는 의미는 아니다.

## 15개 독립 디자인

| 서비스 / 프로그램 이름 | 밝기·배치 / 제목 + 본문 | 배경·강조색 | 고유 UI와 사진 구도 | 참고 |
| --- | --- | --- | --- | --- |
| `ai-graduation-booth` / **졸업 기록실** | 밝음 · editorial / 나눔명조 700 + Pretendard | 크림 `#f4f0e5`, 와인 `#7b403f`, 세이지 | 제본의 이중 선, GRAD 인장, 흰 종이에 붙인 사진, 가느다란 세로 책등. 사진은 인화물과 참가자를 함께 살리는 `58% 42%`, 배경 사진은 오른쪽 위 12%. | Smithsonian Objects |
| `ai-future-career` / **가능성 노트** | 밝음 · journal / Hahmlet 600 + Sunflower | 버터 `#f3efcd`, 녹색 `#2e684f` | 연필색 제목 밑줄, 녹색 노트 색인, 점선으로 나눈 질문, 선택 항목의 왼쪽 표시. 사진의 직업 탐색 화면 중심 `63% 43%`, 오른쪽 아래 9%. | Learning Lab |
| `ai-science-kiosk` / **변수 실험국** | 어두움 · console / Gugi 400 + IBM Plex Sans KR | 잉크 `#071d2d`, 민트 `#a8eed1`, 주황 | 물리적 계기판의 상단 테두리, 주황 신호점, Δ 표식, 눌러진 버튼의 하단 표시. 실험 테이블 중심 `54% 62%`, 왼쪽 아래 24%. | NASA |
| `ai-history-travel` / **시간의 전시실** | 밝음 · gallery / Song Myung 400 + Gowun Batang | 석회 `#e9e3d7`, 적갈 `#8a4634` | 전시 도록의 위아래 가는 선, 時 인장, 두꺼운 전시 액자, 질문의 작품 번호 같은 왼쪽 선. 역사 초상 화면을 살리는 `64% 43%`, 오른쪽 중앙 13%. | Smithsonian Objects, MoMA Bauhaus |
| `ai-timecapsule-photo` / **내일의 우편함** | 밝음 · ticket / Gowun Dodum 400 + Gowun Batang | 연보라 `#ece7f5`, 자주 `#6a4779` | POST 원형 우편 인장, 엽서 테두리, 접는 선의 점선, 편지지 같은 질문 모서리. 탁자 위 세 인화사진 중심 `51% 62%`, 왼쪽 아래 14%. | Learning Lab |
| `ai-fortune-robot` / **달빛 예언극장** | 어두움 · immersive / Gugi 400 + Gowun Dodum | 벨벳 `#23162d`, 황금 `#f8cf86` | 초승달 표식, 무대의 아치형 사진, 보랏빛 조명, 초대장 같은 선택 카드와 이중 경계. 로봇과 참가자 중심 `43% 50%`, 상단 중앙 34%. | Cooper Hewitt Posters |
| `ai-face-reading` / **인상 이야기극** | 밝음 · salon / Song Myung 400 + Pretendard | 살구 `#f4e2d7`, 옥색 `#38645a` | 타원형 살롱 간판, 초상 액자, 表 표식, 비대칭 둥근 카드를 사용한 창작 이야기 화면. 인물과 결과 화면의 접점 `35% 43%`, 왼쪽 중앙 16%. | Smithsonian Objects |
| `ai-palm-reading` / **손금 서사공방** | 밝음 · journal / Gowun Batang 700 + Gowun Dodum | 양피지 `#e8e2ce`, 먹녹색 `#346259` | 유려한 선 표식, 열린 책등, 대각선 곡선 모서리의 사진과 카드. 실제 손과 장식 선 결과를 함께 살리는 `63% 61%`, 오른쪽 아래 12%. | Cooper Hewitt Process |
| `ai-caricature-artist` / **한 컷 웃음화실** | 밝음 · poster / Gaegu 700 + Pretendard | 레몬 `#f8e785`, 파랑 `#284fac`, 주황 | 손글씨와 마커 밑줄, 웃는 얼굴 표식, 굵은 검정 윤곽, 오려붙인 종이의 단단한 그림자. 참가자와 그림 중심 `47% 44%`, 오른쪽 중앙 11%. | Cooper Hewitt Posters, Process |
| `ai-aura-reading` / **빛의 기류** | 어두움 · window / Sunflower 700 + Gowun Dodum | 밤보라 `#171329`, 복숭아 `#ffbdc7`, 라일락 | 빛이 번지는 고리, 큰 곡면 창, 투명한 선택 패널, 얕은 광학적 번짐. 작품을 든 인물 중심 `49% 53%`, 중앙 32%. | Cooper Hewitt Process |
| `ai-brand-avatar` / **페르소나 조형실** | 어두움 · split / Black Han Sans 400 + IBM Plex Sans KR | 코발트 `#12295a`, 라임 `#d6ff65` | 굵은 제목, Aa 조형 표식, 어긋난 판의 그림자, 각진 카드, 왼쪽의 라임색 기둥. 참가자와 아바타 화면 중심 `55% 41%`, 오른쪽 위 22%. | MoMA Typography, Bauhaus |
| `ai-product-experience` / **선택의 편집숍** | 밝음 · editorial / Hahmlet 600 + Pretendard | 회백 `#eeece6`, 코냑 `#8e442e` | 카탈로그의 가는 선, EDIT 색인, 넓은 종이 액자, 제품 라벨 같은 선택 카드. 제품·체험 결과 화면 중심 `65% 47%`, 오른쪽 아래 14%. | MoMA Typography |
| `ai-team-chemistry` / **우리의 합동 작업실** | 밝음 · window / Do Hyeon 400 + Sunflower | 피스타치오 `#e1edc8`, 청록 `#275861` | 겹친 ＋ 블록, 말풍선 간판, 좌우 모서리가 번갈아 연결되는 선택지. 네 사람이 테이블을 함께 쓰는 `50% 58%`, 왼쪽 위 12%. | MoMA Bauhaus |
| `ai-vision-wall` / **내일을 붙이는 벽** | 어두움 · poster / Jua 400 + Pretendard | 차콜 `#292a2c`, 복숭아 `#ffb18d`, 라임 | 붙임 종이 제목, ! 메모, 두꺼운 상단 종이띠, 한 모서리가 접힌 듯한 카드. 대형 비전 화면 중심 `66% 42%`, 오른쪽 중앙 25%. | Cooper Hewitt Posters, Process |
| `ai-business-card` / **첫인상 인쇄소** | 밝음 · ticket / IBM Plex Sans KR 600 + Pretendard | 차가운 종이 `#e8edf2`, 군청 `#224c9c` | 재단선, ID 인쇄 표식, 어긋난 인쇄판의 그림자, 점선 질문 구분, 직각 카드. 실물 명함과 손 중심 `48% 65%`, 왼쪽 아래 10%. | NASA, MoMA Typography |

## 통합·검증 기준

- 15개 key는 기존 서비스 slug와 일치한다. composition 10종, 서체 조합 15종, 밝음 10개/어두움 5개를 정적으로 확인한다.
- CSS 111개 규칙은 서비스 slug로 범위를 제한했다. 글자 크기·레이아웃 컬럼·터치 영역을 줄이는 규칙은 없다.
- 설정의 본문·보조 문구·강조색과 canvas, CTA 글자와 강조색 간 대비를 계산하고 4.5:1 이상으로 조정했다. 실제 사진과 그림자가 합쳐진 최종 대비는 통합 화면 QA에서 확인한다.
- 운세·관상·손금·오라는 유희적 서사와 예술적 해석의 시각 언어를 사용한다. 의료 기기나 측정 정확도로 보이는 장식을 추가하지 않는다. 기존 해석 범위 안내는 유지한다.
- 공통 renderer 통합 후 15개 프로그램을 1440×1050과 320×740에서 각각 열어 30개 화면을 확인했다. 모든 프로그램의 고유 서체·사진이 로드되었고, 문서·dialog·의미 있는 콘텐츠의 가로 넘침과 JavaScript 오류는 없었다. 모든 질문에 답하면 시작 버튼이 활성화되고 화면 안에 표시되었다. 제목은 데스크탑 51.84px, 320px 모바일 38px로 렌더링되었다.
- 데스크탑·모바일 30개 스크린샷을 촬영하고 모음 이미지를 시각적으로 검수했다. 정적 검사 결과는 `.playwright-mcp/demo-redesign/art-learning-static-report.json`, 브라우저 검증은 `art-learning-browser-report.json`, 검수 이미지는 `art-learning-review-1440.png`와 `art-learning-review-320.png`에 보관한다. ESLint와 TypeScript 검사도 통과했다.
- 키보드와 전체 생성·결과 흐름은 통합 QA에서 확인한다. 이 변경은 질문, 생성 요청, fallback, 결과 출력의 동작을 수정하지 않는다.
- 모바일 결과 통합 점검에서 졸업·명함·제품의 견적 버튼, 명함 배지, 어두운 제품 카드와 반투명 패널 대비를 보정했다. 사진·명함의 짙은 표면을 명시하고 프로그램의 강조 버튼 글자색을 연결했다. 졸업 기록의 작은 금색 문구는 더 짙은 색으로 조정했다.
