# 포토·패션·문화·웨딩 17개 프로그램 아트디렉션

작성일: 2026-09-23. 같은 어두운 대시보드에 색만 바꾸는 구성에서 벗어나 각 서비스가 독립된 프로그램처럼 보이도록 새 시각 정체성을 설계했다. 기존 입력·분석·출력 기능과 질문은 유지한다.

`art-photo-culture.ts`에는 17개 독립 프로그램명, 구성 방식, 제목/본문 폰트, 캔버스·종이·잉크·강조색, 사진 크롭, 배경 사진의 위치·농도, 시그니처 마크를 정의했다. `program-photo-culture.css`에는 프로그램 ID로 제한된 장식·프레임·컨트롤을 구현했다. **밝은 화면 11개, 어두운 화면 6개**다. 공통 격자 배경을 사용하지 않으며 개별 스타일에서 글자 크기를 줄이지 않는다. 큰 글자와 공통 최소 터치 영역은 메인 체험 스타일에서 유지한다.

기존 서비스별 AI 콘셉트 사진/운영 사례 사진을 재활용하고, 서비스마다 크롭·종이 프레임·채도·배경 위치를 달리한다. 외부 레퍼런스의 사진·로고·문구를 가져오지는 않았다.

## 17개 독립 디자인

| 서비스 | 프로그램 / 구성 | 서체 조합 | 사진·배경·UI 시그니처 | 참고 |
|---|---|---|---|---|
| 스타일 프로파일러 | **DRESS NOTE** / 밝은 에디토리얼 | Hahmlet + Pretendard | 회백색 종이, 세이지 잉크, 얇은 페이지 구분선, 밑줄형 선택지, 매트 사진 프레임 | [Vogue Fashion](https://www.vogue.com/fashion) |
| 런웨이 포토부스 | **THE COVER** / 검은 화보 공간 | Nanum Myeongjo + IBM Plex Sans KR | 상단 인물 크롭, 흑백 대비, 이탤릭 명조 제목, 각진 검정 선택지와 크림 반전 상태 | [Vogue Fashion](https://www.vogue.com/fashion) |
| 패션 타임머신 | **TIME WARDROBE** / 밝은 아카이브 티켓 | Do Hyeon + Gowun Batang | 황토색 봉투, 버건디 날짜 도장, 점선 절취부, 약한 세피아 사진과 종이 테두리 | [V&A Fashion](https://www.vam.ac.uk/collections/fashion) |
| 코디 추천 | **LOOK SERVICE** / 흰 작업 창 | IBM Plex Sans KR + Pretendard | 코발트 작업 지시서, 상단 굵은 바, 청회색 버튼, 정돈된 피팅룸 사진 | [V&A Fashion](https://www.vam.ac.uk/collections/fashion) |
| 아이돌 메이크업 | **DEBUT CLUB** / 체리색 살롱 | Jua + Sunflower | 벨벳 분장실, 전구를 연상시키는 거울 프레임, 둥근 분홍 버튼, 별 배지 | [Vogue Fashion](https://www.vogue.com/fashion) |
| 팬 포토카드 | **DEAR COLLECTOR** / 라일락 수집 창 | Gugi + Gowun Dodum | 레몬색 스티커, 카드 바인더의 단단한 그림자, 사선 사진, 보관 슬리브형 선택지 | [V&A Fashion 컬렉션](https://www.vam.ac.uk/collections/fashion) |
| 뮤직비디오 | **SIDE A** / 어두운 공연 포스터 | Black Han Sans + IBM Plex Sans KR | 애시드 그린의 큰 활자, 보라색 보조 띠, 각진 컨트롤, 무대 사진을 넓게 사용 | [Ableton Live](https://www.ableton.com/en/live/) |
| 셀럽 닮은꼴 | **CASTING ROOM** / 밝은 캐스팅 갤러리 | Do Hyeon + Pretendard | 흑백 콘택트 프린트, 검정 인덱스 탭, 직선 프레임, 흑백 반전 선택 상태 | [MoMA Collection](https://www.moma.org/collection/) |
| 음색 분석 | **TAKE ONE** / 어두운 녹음 콘솔 | IBM Plex Sans KR + Gowun Dodum | 호박색 표시등, 따뜻한 금속 패널, 눌리는 기계식 버튼, 녹음실 사진의 하단 크롭 | [Ableton Live](https://www.ableton.com/en/live/) |
| 한복 포토부스 | **옷의 결** / 밝은 두 폭 화면 | Gowun Batang + Sunflower | 옥빛·한지색 넓은 색면, 자주색 가장자리, 비단처럼 접힌 모서리, 한복 사진의 큰 여백 | [국립중앙박물관](https://www.museum.go.kr/ENG/main/index.do) |
| 전통 초상화 | **먹 한 점** / 밝은 화원 일지 | Song Myung + Gowun Batang | 먹빛 활자, 주홍 낙관, 넓은 종이 여백, 세로 표구선, 절제된 색의 사진 | [국립중앙박물관](https://www.museum.go.kr/ENG/main/index.do) |
| 문화유산 타임머신 | **시간의 문** / 녹청색 몰입 전시실 | Gowun Batang + Pretendard | 황동 이중 테두리, 문 모양 사진 프레임, 짙은 녹청색 벽, 전시 안내판형 선택지 | [국립중앙박물관](https://www.museum.go.kr/ENG/main/index.do) |
| 여행 스타일 | **NEXT STOP** / 밝은 탑승권 | Do Hyeon + IBM Plex Sans KR | 코발트 출발 표시, 흰 티켓·절취선, 출국 도장 같은 마크, 목적지 사진을 왼쪽 배경에 배치 | [RIMOWA](https://www.rimowa.com/kr/ko/home) |
| 웨딩 포토부스 | **우리의 장면** / 크림색 초대장 | Nanum Myeongjo + Gowun Batang | 와인색 타이포, 둥근 초대장 머리, 가는 이중 테두리, 두 사람의 아치형 사진 | [Vogue Weddings](https://www.vogue.com/weddings) |
| 커플 케미 | **둘의 문장** / 따뜻한 엽서 일지 | Gaegu + Gowun Dodum | 손글씨와 붉은 연필 밑줄, 대화 풍선 모서리, 포근한 종이색, 엽서 사진 | [Vogue Weddings](https://www.vogue.com/weddings) |
| 미래 가족 | **작은 가족책** / 밝은 그림책 포스터 | Jua + Gowun Dodum | 버터색 표지, 푸른 책등, 둥근 종이 조각과 오렌지 보조색, 그림책 액자형 사진 | [MoMA Collection](https://www.moma.org/collection/) |
| 추억 무비 | **AFTER CREDITS** / 올리브색 개인 극장 | Song Myung + IBM Plex Sans KR | 검은 올리브 벽, 크림색 자막 분위기, 와이드 프린트의 레터박스, 차분한 상영실 컨트롤 | [Criterion Collection](https://www.criterion.com/) |

## 실제로 읽은 공식 레퍼런스와 해석 범위

- **Vogue Fashion / Weddings**: 패션·런웨이·웨딩의 사진 기사와 별도 편집 범주를 확인했다. 하나의 서비스에 하나의 출판물 같은 정체성을 부여하는 방향으로 해석했다. 본 구현의 폰트·배색·프레임은 독자 설계다. [Fashion](https://www.vogue.com/fashion) · [Weddings](https://www.vogue.com/weddings)
- **V&A Fashion**: 시대와 주제가 분리된 패션 컬렉션, 소장품·제작 과정·패션 사진의 서로 다른 관점을 확인했다. 이를 패션 아카이브 티켓, 수집 카드, 피팅 작업 지시서라는 세 가지 다른 UI로 해석했다. [컬렉션](https://www.vam.ac.uk/collections/fashion)
- **Ableton Live**: 음악을 생성하고 편집하는 기능, 클립·믹서·장치 등 작업 단위로 구성된 제품 설명을 확인했다. MV는 공연 포스터, 음색 체험은 녹음 콘솔로 분리했다. 실제 음향 장비의 측정 기능을 구현했다는 뜻은 아니다. [제품 소개](https://www.ableton.com/en/live/)
- **국립중앙박물관**: 전시·소장품·관람 안내의 맥락을 확인했다. 문화 체험 세 개를 한복의 비단, 회화의 종이, 문화유산의 전시실로 각각 해석했다. 전통 문양을 고증해 복제한 디자인은 아니다. [공식 사이트](https://www.museum.go.kr/ENG/main/index.do)
- **MoMA Collection**: 작품을 개별 대상으로 보는 컬렉션 관점을 참고했다. 이를 캐스팅 콘택트 시트와 가족 그림책에 서로 다른 방식으로 적용했다. [컬렉션](https://www.moma.org/collection/)
- **RIMOWA**: 여행과 소지품을 중심으로 한 공식 브랜드의 정보 구성을 확인했다. 여행 준비·이동의 맥락을 탑승권 형식으로 새롭게 표현했다. [공식 사이트](https://www.rimowa.com/kr/ko/home)
- **Criterion Collection**: 영화와 에디션을 개별 작품으로 다루는 구성을 확인했다. 개인의 추억도 한 편의 작품처럼 다루는 작은 상영관으로 해석했다. [공식 사이트](https://www.criterion.com/)

위 내용은 공식 웹페이지를 읽고 도출한 디자인 방향이다. 해당 브랜드의 원본 시각 레이아웃을 픽셀 단위로 재현하거나 디자인 시스템을 복제하지 않는다. 접근되지 않은 페이지는 설계 근거로 인용하지 않았다.

## 검증 기준

- 모든 새 CSS 선택자는 `.experience-venue[data-program='해당 슬러그']` 안으로 한정한다.
- 이 파일은 기존 질문·모듈·공통 버튼 이벤트를 수정하지 않는다.
- 공통 격자 배경을 추가하지 않는다. 별도 애니메이션·작은 글자 크기를 추가하지 않는다.
- 모바일에서는 기울어진 카드 사진을 바로 세우고 내부 장식 패딩과 책등 두께를 줄여 읽을 공간을 확보한다.
- 아트디렉션의 본문/보조본문 색을 캔버스·종이 위에서, 강조 버튼의 글자색을 강조색 위에서 계산해 4.5:1 이상이 되도록 확인한다. 반투명 사진 위의 최종 명암·줄바꿈·레이아웃은 통합 브라우저 검증에서 확인한다.

## 통합 브라우저 검증

- Chromium에서 17개 프로그램을 1440×1050 및 320×740 화면으로 열어 총 34개 사례를 확인했다. 모든 사례에서 제목·본문 로컬 폰트와 사진 로딩, 가로 넘침 없음, 질문 선택 후 다음 단계 실제 진입을 확인했다.
- 선택 상태의 실제 계산 색상으로 제목·설명·단계 숫자는 4.5:1 이상, 체크 아이콘은 3:1 이상을 검사했다. 발견된 반전 버튼의 아이콘·숫자와 팬 포토카드·문화유산·커플의 선택 설명문/숫자 대비 문제를 보정한 뒤 해당 5개 프로그램을 두 화면 크기에서 다시 확인했다.
- 최종 기록: `.playwright-mcp/demo-art-direction/photo-culture-report-final.json`. 각 화면의 초기/선택 상태 캡처는 같은 폴더의 `photo-culture-*.png` 68개 파일에 남겼다.
- 이 검증은 이번 소개 화면의 시각·입력·첫 단계 진입 범위다. 전체 결과 생성과 인쇄 동작은 별도 전체 서비스 검증에서 확인한다.
- 결과 화면 통합 과정에서는 사진·작품의 짙은 배경과 불투명 강조색 버튼에 색상 범위를 명시했다. 밝은 페이지 색이 사진 캡션이나 포토카드의 글자를 덮어쓰지 않도록 하기 위한 클래스 추가이며 결과 계산이나 생성 요청을 바꾸지 않는다.
