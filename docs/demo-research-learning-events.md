# Learning, festival and corporate demo research

Updated: 2026-09-23. Scope: 15 service demos, 32 additional briefing questions. All copy and questions are original product design, not reproductions of validated assessment instruments.

## Sources and design decisions

- [O*NET Interest Profiler](https://www.onetcenter.org/IP.html): occupational interests support exploration of work activities. Its RIASEC framework informs an activity-first approach here; this short experience does not administer O*NET, calculate its scores or predict career success. The full instrument uses substantially more questions. We replace fixed suitability percentages and future-status predictions with researching a real task, trying a small project and reflecting on the experience.
- [NASA JPL: Build and Launch a Foam Rocket](https://www.jpl.nasa.gov/edu/resources/lesson-plan/build-and-launch-a-foam-rocket/): compare launch conditions and measured distance, and distinguish independent and dependent variables. Our implementation applies that inquiry pattern to existing interactive simulations. The projectile view explicitly states that its model omits air resistance and uses equal launch/landing heights. “Compare” requires two different conditions and retains the first and last records.
- [NASA: Ball Launcher](https://www.nasa.gov/stem-content/ball-launcher/): supports explaining the idealized projectile model rather than presenting it as a complete real-world launch prediction.
- [Lenberg & Feldt: Psychological Safety and Norm Clarity in Software Engineering Teams](https://arxiv.org/abs/1802.01378): primary survey research motivates questions about explicit expectations and team norms. We use current self-report and specific requests for feedback, context or focus time. This is a conversation aid, not an individual personality/ability test or causal guarantee. Google re:Work's primary team-effectiveness guidance was also reviewed via its indexed official page; the short canonical route currently redirects to a 404, so the accessible primary research paper is the durable reference.
- [National Museum of Korea: Portrait](https://www.museum.go.kr/ENG/contents/E0403000000.do?relicId=705&schM=relic_represent_view) and [The Secret of the Joseon Portraits](https://www.museum.go.kr/ENG/contents/E0202030000.do?exhiSpThemId=3571&listType=list&menuId=past&schM=view): historical portraits are material and cultural works with period-specific visual conventions. History-travel therefore asks what everyday activity to observe and labels synthesized scenes as creative interpretations, not archival evidence. These museum sources are not evidence for physiognomy or fortune prediction.

## Runtime contract and result behavior

The designs live in `src/data/demo-experiences/learning-events.ts`, exported as `learningEventExperiences`. Each has a distinct venue, headline, palette, layout, physical artifact, two preparation notes, three processing stages and an approximate 2–4 minute duration. Every question has three or four explicit options, a reason for asking, a control type and a concrete outcome. The shared experience UI stores selections in `answers.experienceProfile`; all 15 owned `requestDemoAi` payloads forward that field for the centralized AI context and result/print advice.

Existing generation, validation, image fallbacks and print hooks are retained. Specific module changes:

- Nine photo modules replace fabricated scan accuracy, fit, symmetry, energy, wavelength and landmark counts with truthful preparation states.
- FutureCareer removes visible suitability percentages. Local career paths now describe introductory research, a small practical task and an interview/reflection step. Its backend requires exploratory actions rather than future promotions, income or success.
- ScienceKiosk preserves the first record for comparison, requires a different second condition in compare mode, shows both observations and includes them in print output and the AI experiment summary.
- FaceReading removes numerical fortune/balance/harmony scores from screen and print. Fallback characters come from the selected story role; fallback copy uses explicit creative motifs rather than image-derived character judgments.
- PalmReading removes numerical line-strength bars, deterministic left/right fate descriptions and image-derived aptitude language from visible fallback results. The selected chapter sets the story focus. Overlaid lines remain explicitly decorative.
- AuraReading selects palette and glow intensity from the visitor's choices, including local photo-effect rendering. It removes energy-profile measurement charts and uses creative color language in output/print. Backend photo use is restricted to visible composition and subject presence.
- ProductExperience displays comparison candidates instead of fabricated match percentages and labels all prices/coupons as non-redeemable sample content.
- TimecapsulePhoto calls future portraits imagined artwork and makes no automatic-delivery promise. FortuneRobot output and printed footer explicitly describe symbolic entertainment.
- Five backend specs preserve their response shapes while removing instructions to infer personality/health/ability from appearance, validated scores, or future success. Legacy numeric fields are compatibility-only values that the changed UIs do not present as measurement.

## Service designs and decision effects

### ai-graduation-booth

캠퍼스 기념사진관 — **끝낸 시간과 시작할 시간을, 한 장에.**

Layout: `studio`; palette: `#d9b36c` / `#7d9e93` on `#17282a`; artifact: 졸업 기념 포토 프린트; duration: 약 3분.

Preparation: 얼굴과 어깨가 보이는 사진 한 장을 준비해 주세요. 사진에 남길 짧은 한마디를 생각해 주세요.

Processing: 촬영 콘셉트와 시선 정리 → 가운·배경에 기념 분위기 반영 → 사진과 메시지를 프린트로 구성.

**어떤 순간을 기념하나요?** (`occasion`, `cards`)

Purpose: 사진의 표정과 메시지 방향을 정합니다.

| Option | Result advice / creative direction |
| --- | --- |
| 해냈다는 뿌듯함 (`milestone`) | 정면 시선과 당당한 자세로 촬영하고, 끝까지 해낸 구체적인 경험 한 가지를 메시지로 남겨보세요. |
| 고마운 사람에게 (`thanks`) | 부드러운 미소와 따뜻한 조명을 사용하고, 함께해 준 사람의 이름이나 감사 이유를 짧게 적어보세요. |
| 새로운 출발 (`next`) | 열린 캠퍼스 배경과 가벼운 미소로 연출하고, 다음에 시도할 작은 목표를 메시지로 담아보세요. |

**어떤 인화 분위기가 좋나요?** (`finish`, `swatches`)

Purpose: 배경과 색감을 고르는 기준이 됩니다.

| Option | Result advice / creative direction |
| --- | --- |
| 크림 클래식 (`ivory`) | 따뜻한 아이보리 바탕과 낮은 대비로 인화해 앨범 속 다른 사진과 자연스럽게 이어보세요. |
| 네이비 포멀 (`navy`) | 네이비 배경과 선명한 가운 실루엣으로 작은 액자에서도 주인공이 또렷하게 보이도록 구성하세요. |
| 세이지 캠퍼스 (`sage`) | 세이지 녹음과 확산광을 배경으로 사용해 새로운 시작의 가벼운 분위기를 살려보세요. |

### ai-future-career

가능성 탐색 라운지 — **잘할 미래보다, 해보고 싶은 일을 찾으세요.**

Layout: `lounge`; palette: `#91c5ee` / `#d6bc82` on `#172331`; artifact: 직업 탐색 실천 카드; duration: 약 4분.

Preparation: 최근 재미있었던 활동 한 가지를 떠올려 주세요. 정답 대신 지금의 선호를 골라 주세요.

Processing: 관심 활동과 학습 조건 정리 → 직업 후보와 실제 업무 연결 → 이번 주 탐색 행동 제안.

Scope: 흥미에 기반한 진로 탐색입니다. 적성 검사나 성공 가능성 예측이 아니며, O*NET 검사를 시행하거나 점수를 산출하지 않습니다.

**시간 가는 줄 모르는 활동은?** (`activity`, `cards`)

Purpose: 관심 분야를 구체적인 업무 행동으로 연결합니다.

| Option | Result advice / creative direction |
| --- | --- |
| 직접 만들고 고치기 (`build`) | 작은 물건이나 디지털 도구를 하나 만들어 작동 과정을 기록해 보세요. 제작·기술 직무의 실제 하루를 조사하는 출발점입니다. |
| 원인을 찾아 설명하기 (`investigate`) | 궁금한 질문 하나에 자료 세 개를 찾아 답을 비교해 보세요. 조사·연구 업무에서 어떤 과정이 즐거운지 기록하세요. |
| 새로운 표현 만들기 (`create`) | 같은 주제로 표현 방식 두 가지를 만들어 비교해 보세요. 결과보다 수정 과정이 재미있는지 살펴보세요. |
| 사람을 돕고 연결하기 (`support`) | 누군가에게 익숙한 일을 설명하고 이해하기 어려웠던 부분을 물어보세요. 교육·지원 직무 탐색의 작은 실험이 됩니다. |

**지금 시작하기 좋은 방법은?** (`start`, `chips`)

Purpose: 시간과 경험에 맞는 첫 과제를 제안합니다.

| Option | Result advice / creative direction |
| --- | --- |
| 현직자 이야기 듣기 (`observe`) | 관심 직무 인터뷰를 찾아 반복되는 업무 세 가지와 예상과 달랐던 점 한 가지를 적어보세요. |
| 작은 프로젝트 (`mini`) | 이번 주 30분 안에 끝낼 수 있는 결과물을 정하고 완성 후 재미·어려움·더 배울 점을 각각 적어보세요. |
| 입문 수업 (`course`) | 입문 강좌의 첫 수업을 들어보고 연습 문제 한 개를 직접 풀어보세요. 수료보다 실제 활동의 흥미를 확인하세요. |

**새로운 과제에 필요한 안내는?** (`structure`, `scale`)

Purpose: 실천 카드의 과제 크기와 진행 방식을 조절합니다.

| Option | Result advice / creative direction |
| --- | --- |
| 단계별 안내 (`guided`) | 완성 예시를 먼저 보고 세 단계 체크리스트로 과제를 나누세요. 첫 단계는 10분 이내로 정해보세요. |
| 방향만 있으면 충분 (`balanced`) | 목표와 마감만 정하고 방법 두 가지를 비교해 선택하세요. 중간에 한 번 진행 상황을 점검하세요. |
| 직접 길 찾기 (`open`) | 스스로 질문을 정하되 완료 기준 한 가지는 미리 써두세요. 탐색이 넓어지면 이번 주 범위만 남겨보세요. |

### ai-science-kiosk

손으로 여는 과학 실험대 — **한 가지를 바꾸면, 무엇이 달라질까요?**

Layout: `lab`; palette: `#69d4d2` / `#e7b676` on `#102e35`; artifact: 조건·관찰이 담긴 실험 노트; duration: 약 4분.

Preparation: 슬라이더를 움직일 수 있는 화면을 준비해 주세요. 처음 예상과 실제 결과가 달라도 괜찮습니다.

Processing: 실험 조건과 관찰값 정리 → 바꾼 변수와 결과 변화 연결 → 다음 비교 실험 질문 작성.

Scope: 화면의 단순화된 모형을 탐구합니다. 현실의 실험 조건과 차이가 있으며, 포물선 모형은 공기 저항을 제외합니다.

**오늘의 탐구 목표는?** (`mission`, `cards`)

Purpose: 실험 후 무엇을 기록할지 정합니다.

| Option | Result advice / creative direction |
| --- | --- |
| 두 조건 비교하기 (`compare`) | 첫 시도 값을 적고 한 변수만 바꿔 다시 실행하세요. 다른 조건을 그대로 두어 변화의 이유를 비교해 보세요. |
| 목표값에 다가가기 (`target`) | 첫 결과가 목표보다 크면 조절량을 줄이고, 작으면 늘려보세요. 한 번에 크게 바꾸지 않고 세 번의 시도를 기록하세요. |
| 원리 설명하기 (`explain`) | 예상→조작→관찰→설명의 순서로 한 문장씩 적어보세요. 모형에서 제외한 현실 조건도 한 가지 찾아보세요. |

**관찰은 어떻게 남길까요?** (`record`, `chips`)

Purpose: 결과 노트에 담길 설명 형태를 정합니다.

| Option | Result advice / creative direction |
| --- | --- |
| 숫자 비교 (`numbers`) | 초기 조건과 마지막 조건을 같은 단위로 적고 값이 얼마나 달라졌는지 비교해 보세요. |
| 모양과 경로 (`drawing`) | 경로·색·형태가 바뀐 부분을 먼저 기록하고 변하지 않은 부분도 함께 적어보세요. |
| 다음 질문 (`question`) | 이번 실험에서 가장 뜻밖이었던 결과를 질문으로 바꾸고 확인할 변수를 한 가지 정해보세요. |

### ai-history-travel

시간 여행 사진 아카이브 — **한 장의 사진에서, 한 시대의 일상으로.**

Layout: `gallery`; palette: `#d5a174` / `#8fa89d` on `#312820`; artifact: 시대 여행 엽서와 관찰 질문; duration: 약 3분.

Preparation: 얼굴이 선명하게 보이는 정면 사진을 준비해 주세요. 시대와 역할을 고르면 해당 분위기로 사진을 연출합니다.

Processing: 시대·역할·관찰 주제 연결 → 의상과 배경을 창작 장면으로 구성 → 사진 옆에 시대 탐구 질문 정리.

Scope: 역사 자료를 참고한 창작 장면입니다. 합성 이미지는 특정 인물이나 사건의 기록 사진이 아닙니다.

**어떤 일상을 들여다볼까요?** (`lens`, `cards`)

Purpose: 배경 속 사물과 설명의 초점을 정합니다.

| Option | Result advice / creative direction |
| --- | --- |
| 만드는 사람의 하루 (`craft`) | 배경에서 도구와 재료를 관찰하고 오늘날 같은 일을 하는 도구와 한 가지씩 비교해 보세요. |
| 거리의 사람들 (`street`) | 거리의 교통수단과 가게 모습을 중심으로 장면을 구성하세요. 누가 어떤 물건을 주고받았을지 질문해 보세요. |
| 배우는 공간 (`study`) | 책·필기구·배움의 공간을 중심으로 장면을 구성하고 당시 누가 교육에 접근할 수 있었는지 찾아보세요. |

**사진의 질감은?** (`tone`, `swatches`)

Purpose: 시대 분위기를 표현하는 창작 방향입니다.

| Option | Result advice / creative direction |
| --- | --- |
| 먹빛 기록 (`ink`) | 먹빛과 종이 질감으로 윤곽과 의상 실루엣을 강조하세요. 실제 사료와 창작 표현을 구분해 감상해 보세요. |
| 따뜻한 세피아 (`sepia`) | 은은한 세피아와 낮은 대비로 오래된 앨범 같은 분위기를 연출하세요. 엽서에 선택한 시대를 함께 남겨보세요. |
| 살아있는 색 (`color`) | 직물과 건축 재료의 색을 중심으로 생동감을 살리세요. 오늘날의 색채와 다른 점을 관찰해 보세요. |

### ai-timecapsule-photo

미래에게 보내는 작은 우체국 — **달라질 얼굴보다, 지키고 싶은 마음.**

Layout: `counter`; palette: `#d3af75` / `#b5a3c9` on `#302a38`; artifact: 미래 사진 편지; duration: 약 3분.

Preparation: 현재의 얼굴 사진과 짧은 편지를 준비해 주세요. 직접 보관할 인화물이나 파일을 만들 수 있습니다.

Processing: 편지의 수신 시점과 마음 정리 → 미래 초상화의 창작 방향 구성 → 현재 사진·미래 사진·편지 함께 배치.

Scope: 미래 모습은 창작 이미지이며 실제 노화나 삶의 변화를 예측하지 않습니다. 자동 예약 발송 기능은 포함하지 않습니다.

**미래에도 간직하고 싶은 것은?** (`keep`, `cards`)

Purpose: 미래 장면과 편지의 중심 소재가 됩니다.

| Option | Result advice / creative direction |
| --- | --- |
| 호기심 (`curiosity`) | 미래 사진에는 새로운 장소를 탐색하는 여유를 담고 편지에는 올해 처음 해보고 싶은 일을 하나 적어보세요. |
| 소중한 관계 (`people`) | 따뜻한 일상의 미래 장면을 선택하고 지금 고마운 사람에게 전하고 싶은 한 문장을 편지에 넣어보세요. |
| 나만의 속도 (`rhythm`) | 편안한 표정과 차분한 미래 장면을 선택하고 앞으로도 지키고 싶은 작은 습관을 편지에 적어보세요. |

**어떤 목소리로 편지를 남길까요?** (`voice`, `chips`)

Purpose: 문장 길이와 메시지의 온도를 정합니다.

| Option | Result advice / creative direction |
| --- | --- |
| 응원의 한마디 (`cheer`) | 잘하고 싶은 일보다 이미 해낸 일을 먼저 적고 미래의 나에게 부담 없는 응원 한 문장을 남겨보세요. |
| 미래에게 질문 (`question`) | 지금 궁금한 것 세 가지 대신 가장 중요한 질문 하나만 남겨보세요. 나중에 답할 여백을 두면 좋습니다. |
| 작은 약속 (`promise`) | 완벽한 성취 대신 반복할 수 있는 작은 행동 한 가지를 약속해 보세요. 시작할 날짜도 함께 적어보세요. |

### ai-fortune-robot

별빛 메시지 자판기 — **오늘의 운을, 오늘의 작은 행동으로.**

Layout: `observatory`; palette: `#d7afed` / `#e9c985` on `#29213b`; artifact: 오늘의 응원 영수증; duration: 약 2분.

Preparation: 지금 마음에 걸리는 주제를 하나 떠올려 주세요. 생년월일 전체나 민감한 개인 정보는 필요하지 않습니다.

Processing: 고른 상징과 대화 주제 연결 → 가벼운 응원 이야기 구성 → 오늘 해볼 작은 행동 카드 출력.

Scope: 상징을 활용한 오락용 창작 운세입니다. 실제 미래나 금전·건강 결과를 예측하지 않습니다.

**어떤 응원이 필요한가요?** (`voice`, `cards`)

Purpose: 운세의 말투와 행동 제안에 반영합니다.

| Option | Result advice / creative direction |
| --- | --- |
| 조용한 위로 (`gentle`) | 지금 급하지 않은 일 한 가지를 잠시 내려놓고, 오늘 이미 해낸 일을 하나 적어보세요. |
| 가벼운 용기 (`bold`) | 미뤄둔 일의 첫 동작을 5분만 해보세요. 완성보다 시작한 사실을 오늘의 좋은 징조로 삼아보세요. |
| 유쾌한 전환 (`playful`) | 늘 가던 길이나 익숙한 음악 중 하나를 바꿔보세요. 작은 새로움에서 오늘의 재미를 찾아보세요. |

**오늘 손에 쥐고 싶은 상징은?** (`symbol`, `chips`)

Purpose: 의미를 직접 고르는 창작 모티프입니다.

| Option | Result advice / creative direction |
| --- | --- |
| 열쇠 (`key`) | 열쇠를 새로운 대화를 여는 상징으로 사용합니다. 궁금했던 사람에게 부담 없는 질문 한 가지를 건네보세요. |
| 씨앗 (`seed`) | 씨앗을 꾸준함의 상징으로 사용합니다. 내일도 반복할 수 있는 아주 작은 습관 하나를 정해보세요. |
| 별 (`star`) | 별을 방향의 상징으로 사용합니다. 오늘 꼭 남기고 싶은 결과 한 가지를 정하고 나머지 일의 순서를 조정해 보세요. |

### ai-face-reading

이야기를 입히는 초상 살롱 — **당신의 얼굴을, 한 편의 캐릭터 이야기로.**

Layout: `atelier`; palette: `#d6a070` / `#b9b176` on `#32261e`; artifact: 캐릭터 초상 이야기 카드; duration: 약 3분.

Preparation: 얼굴 윤곽이 보이는 사진을 준비해 주세요. 얼굴로 성격·능력·운명을 판단하는 검사가 아닙니다.

Processing: 사진을 초상 구도에 맞추기 → 선택한 서사와 상징 연결 → 창작 캐릭터 카드와 응원 문장 구성.

Scope: 관상은 전통적 상징을 차용한 오락용 창작입니다. 외모로 성격·건강·재물·미래를 판단하지 않습니다.

**어떤 이야기의 주인공이 될까요?** (`role`, `cards`)

Purpose: 외모 대신 직접 고른 역할로 서사를 만듭니다.

| Option | Result advice / creative direction |
| --- | --- |
| 길을 찾는 탐험가 (`explorer`) | 탐험가라는 선택을 바탕으로 호기심의 서사를 만듭니다. 처음 보는 장소에서 눈에 띈 것 세 가지를 적어보세요. |
| 온기를 지키는 사람 (`keeper`) | 돌봄의 역할을 직접 선택한 이야기로 구성합니다. 고마웠던 순간 한 가지를 가까운 사람에게 전해보세요. |
| 세상을 만드는 장인 (`maker`) | 장인의 역할을 중심으로 꾸준함의 서사를 만듭니다. 오늘 끝낼 수 있는 작은 결과물을 하나 정해보세요. |

**이야기의 분위기는?** (`style`, `chips`)

Purpose: 초상 카드의 표현 강도와 말투를 정합니다.

| Option | Result advice / creative direction |
| --- | --- |
| 고전 설화 (`classic`) | 과장된 운명 예언 없이 고전 설화처럼 절제된 비유와 여운 있는 문장으로 구성하세요. |
| 현대 에세이 (`modern`) | 일상의 장면과 짧은 응원 문장으로 표현하세요. 성격 판정 대신 스스로 고른 관심사를 중심에 두세요. |
| 가벼운 코미디 (`comic`) | 유쾌한 캐릭터 설정과 작은 반전으로 구성하되 외모를 놀리거나 능력을 단정하는 표현은 피하세요. |

### ai-palm-reading

손끝의 이야기 지도실 — **손금 위에, 내가 고른 이야기를 그립니다.**

Layout: `observatory`; palette: `#b8a0e8` / `#dfb08e` on `#27213a`; artifact: 상징 손금 포토 카드; duration: 약 3분.

Preparation: 밝은 곳에서 손바닥 전체가 보이도록 펴주세요. 화면의 선은 이야기 표현을 위한 그래픽입니다.

Processing: 손바닥 사진과 카드 방향 맞추기 → 선택한 주제를 상징 선에 연결 → 창작 이야기와 실천 질문 정리.

Scope: 오락용 상징 해석입니다. 손금으로 수명·건강·성격·재물 또는 실제 미래를 예측하지 않습니다.

**오늘 펼쳐볼 이야기의 장은?** (`chapter`, `cards`)

Purpose: 손 모양 대신 선택한 관심사를 반영합니다.

| Option | Result advice / creative direction |
| --- | --- |
| 새로운 시작 (`change`) | 시작의 선을 하나의 상징으로 삼아 지금 바꾸고 싶은 일의 가장 작은 첫 단계를 적어보세요. |
| 사람과 연결 (`connection`) | 연결의 선을 상징으로 삼아 오래 연락하지 못한 사람에게 짧은 안부를 건네보세요. |
| 차곡차곡 쌓기 (`craft`) | 쌓임의 선을 상징으로 삼아 이번 주 세 번 반복할 수 있는 5분 습관을 정해보세요. |

**선의 표현을 골라주세요** (`line`, `swatches`)

Purpose: 사진 위 이야기 그래픽의 분위기입니다.

| Option | Result advice / creative direction |
| --- | --- |
| 금빛 지도 (`gold`) | 금빛 선과 어두운 종이의 대비로 기념 카드의 상징을 강조하세요. 선은 실제 측정치가 아닌 창작 표현입니다. |
| 보랏빛 별자리 (`violet`) | 보랏빛 곡선과 별자리 같은 점을 사용해 상상 속 지도로 구성하세요. 운명 경로라는 단정은 피하세요. |
| 민트 드로잉 (`mint`) | 민트 선과 간결한 여백을 사용해 손의 형태가 편안하게 보이는 현대적인 포토 카드로 구성하세요. |

### ai-caricature-artist

나만의 캐릭터 드로잉 바 — **닮은 점은 남기고, 표현은 더 자유롭게.**

Layout: `atelier`; palette: `#efb67d` / `#b1bbdf` on `#332831`; artifact: 맞춤 캐리커처 아트 프린트; duration: 약 3분.

Preparation: 눈과 입이 가려지지 않은 사진을 준비해 주세요. 좋아하는 표정과 활용할 곳을 떠올려 주세요.

Processing: 사진의 시각적 특징과 표정 정리 → 선택한 과장 정도와 화풍 반영 → 사용 목적에 맞는 프레임 완성.

**얼마나 과감하게 그릴까요?** (`exaggeration`, `scale`)

Purpose: 얼굴 특징을 표현하는 강도를 직접 정합니다.

| Option | Result advice / creative direction |
| --- | --- |
| 살짝만 (`subtle`) | 얼굴 비율과 표정을 최대한 유지하고 선과 색감만 부드럽게 단순화한 초상화로 구성하세요. |
| 재미있게 (`balanced`) | 미소와 헤어스타일 같은 시각적 특징을 적당히 강조하되 인물의 정체성이 유지되도록 표현하세요. |
| 과감하게 (`bold`) | 머리 비율과 표정을 경쾌하게 과장하되 신체나 외모를 비하하지 않는 밝은 캐릭터로 표현하세요. |

**어디에 쓰고 싶나요?** (`use`, `cards`)

Purpose: 크롭과 배경 밀도를 결정합니다.

| Option | Result advice / creative direction |
| --- | --- |
| 프로필 이미지 (`profile`) | 얼굴을 중앙에 크게 배치하고 배경은 단순하게 유지해 작은 원형 프로필에서도 표정이 읽히게 구성하세요. |
| 선물용 엽서 (`gift`) | 인물 주변에 넉넉한 여백을 두어 직접 메시지를 적을 공간을 남기고 포근한 분위기로 마무리하세요. |
| 미니 포스터 (`poster`) | 인물과 어울리는 상징 소품 한두 개를 배경에 배치하되 얼굴보다 시선을 빼앗지 않게 구성하세요. |

### ai-aura-reading

기분을 물들이는 빛의 스튜디오 — **오늘의 마음을, 빛과 색으로 남기세요.**

Layout: `studio`; palette: `#c59de7` / `#83cfc5` on `#29243e`; artifact: 무드 컬러 포토 아트; duration: 약 3분.

Preparation: 표정이 자연스럽게 보이는 사진을 준비해 주세요. 지금 마음에 가까운 색을 정답 없이 골라주세요.

Processing: 직접 선택한 기분과 색 정리 → 초상 주변에 빛의 레이어 구성 → 무드 아트와 짧은 휴식 제안 완성.

Scope: 오라는 기분을 표현하는 창작 효과입니다. 생체 에너지장·감정·성격을 측정하거나 진단하지 않습니다.

**어떤 빛에 둘러싸이고 싶나요?** (`light`, `swatches`)

Purpose: 본인이 선택한 색을 작품의 방향으로 사용합니다.

| Option | Result advice / creative direction |
| --- | --- |
| 새벽의 라벤더 (`dawn`) | 라벤더와 부드러운 청색 빛으로 차분한 여백을 표현하세요. 화면을 잠시 내려놓고 주변 소리 세 가지를 들어보세요. |
| 오후의 골드 (`sun`) | 골드와 살구색의 확산광으로 포근한 분위기를 만드세요. 오늘 즐거웠던 작은 장면 하나를 기록해 보세요. |
| 숲의 민트 (`forest`) | 민트와 청록색 레이어로 가벼운 분위기를 만드세요. 창밖이나 가까운 곳의 초록색을 잠시 바라보세요. |

**빛은 얼마나 은은하면 좋을까요?** (`intensity`, `scale`)

Purpose: 효과의 시각적 강도이며 에너지 수치가 아닙니다.

| Option | Result advice / creative direction |
| --- | --- |
| 은은하게 (`soft`) | 인물의 피부색과 윤곽이 자연스럽게 보이도록 빛의 번짐을 낮추고 가장자리에만 색을 얹으세요. |
| 균형 있게 (`medium`) | 인물과 배경의 대비를 유지하며 두 가지 색이 자연스럽게 섞이는 균형 있는 광채를 표현하세요. |
| 선명하게 (`vivid`) | 얼굴의 표정은 유지하면서 배경의 색채 레이어를 풍부하게 쌓아 전시 포스터 같은 인상을 만드세요. |

### ai-brand-avatar

우리 팀의 아바타 디자인룸 — **브랜드의 언어로, 나다운 프로필을.**

Layout: `studio`; palette: `#8fb8e3` / `#dbb297` on `#202b3a`; artifact: 브랜드 아바타 프로필 카드; duration: 약 3분.

Preparation: 정면 사진과 표시할 이름을 준비해 주세요. 실제 브랜드 가이드가 없으면 선택한 방향의 콘셉트로 제작합니다.

Processing: 사용 채널과 브랜드 인상 정리 → 인물 특징을 아바타 스타일로 구성 → 작은 화면에서도 읽히는 프로필 완성.

**어디에서 만날 아바타인가요?** (`channel`, `cards`)

Purpose: 구도와 필요한 가독성을 정합니다.

| Option | Result advice / creative direction |
| --- | --- |
| 사내 메신저 (`messenger`) | 중앙 얼굴 크롭과 단순한 배경으로 작은 원 안에서도 인물이 구분되도록 제작하세요. |
| 행사 명찰 (`event`) | 머리와 어깨를 선명하게 표현하고 단색 배경을 사용해 명찰에서 얼굴과 이름이 경쟁하지 않게 구성하세요. |
| 팀 소개 페이지 (`team`) | 시선 높이와 어깨 구도를 통일하고 팀원 간 같은 배경 톤을 사용해 단체 페이지의 일관성을 지키세요. |

**팀을 어떤 인상으로 소개할까요?** (`brandTone`, `chips`)

Purpose: 사진으로 성격을 판단하지 않고 표현을 직접 정합니다.

| Option | Result advice / creative direction |
| --- | --- |
| 신뢰와 정돈 (`precise`) | 정돈된 실루엣과 절제된 색으로 신뢰감을 표현하되 표정은 과도하게 경직되지 않도록 구성하세요. |
| 친근한 연결 (`friendly`) | 부드러운 미소와 둥근 형태를 사용하고 따뜻한 중간 색조로 접근하기 쉬운 인상을 표현하세요. |
| 새로운 시도 (`inventive`) | 선명한 포인트색과 가벼운 동세를 사용하되 얼굴 식별이 어려워지는 장식은 줄여보세요. |

### ai-product-experience

생활에 맞추는 제품 체험 카운터 — **스펙보다 먼저, 쓰게 될 순간부터.**

Layout: `counter`; palette: `#a6c3a9` / `#d6b38c` on `#27342f`; artifact: 제품 비교·확인 체크 카드; duration: 약 4분.

Preparation: 제품을 가장 자주 쓸 장소를 떠올려 주세요. 체험용 예시 제품을 비교하며 실제 구매·할인은 발생하지 않습니다.

Processing: 사용 장면과 우선순위 정리 → 예시 제품의 장단점 비교 → 선택 이유와 구매 전 확인점 작성.

Scope: 예시 제품을 사용한 추천 체험입니다. 재고·가격·할인 쿠폰의 실제 제공을 보장하지 않습니다.

**가장 자주 사용할 장면은?** (`context`, `cards`)

Purpose: 기능을 실제 생활 조건에 연결합니다.

| Option | Result advice / creative direction |
| --- | --- |
| 작은 나만의 공간 (`small`) | 제품의 설치 면적·보관 위치·작동 소음을 먼저 확인하세요. 기능이 많아도 공간에 맞지 않으면 활용도가 떨어질 수 있습니다. |
| 함께 쓰는 공간 (`shared`) | 조작 단계와 청소·관리 방법을 비교하고 여러 사용자가 같은 설정을 쉽게 바꿀 수 있는지 확인하세요. |
| 시간이 부족한 일상 (`busy`) | 자동 기능뿐 아니라 소모품 교체·청소 주기를 함께 확인하세요. 반복 작업을 실제로 얼마나 줄이는지 비교해 보세요. |

**한 가지를 우선한다면?** (`tradeoff`, `chips`)

Purpose: 추천 이유와 감수할 점을 함께 보여줍니다.

| Option | Result advice / creative direction |
| --- | --- |
| 쉬운 사용 (`simple`) | 핵심 기능을 몇 번의 조작으로 실행하는지 확인하세요. 고급 기능 일부를 줄이더라도 매일 쓰기 쉬운 구성을 우선해 보세요. |
| 핵심 성능 (`performance`) | 주로 사용할 기능의 시험 조건과 성능 수치를 확인하고, 부가 기능보다 해당 기능의 체험 결과를 비교하세요. |
| 유지 관리 (`upkeep`) | 초기 가격 외에 소모품·전력·수리 접근성을 함께 살펴보세요. 실제 사용 기간의 총비용을 비교할 질문을 준비하세요. |

### ai-team-chemistry

함께 일하는 방식의 워크숍 — **성격을 맞추기 전에, 일하는 약속부터.**

Layout: `lounge`; palette: `#89c8bd` / `#e2b588` on `#1f3338`; artifact: 협업 약속 대화 카드; duration: 약 4분.

Preparation: 최근 함께 진행한 과제 한 가지를 떠올려 주세요. 팀 전체를 대신 평가하지 않고 자신의 경험으로 답해 주세요.

Processing: 현재 협업 상황과 어려움 정리 → 답변에 맞는 대화·역할 제안 → 다음 회의에서 시험할 약속 작성.

Scope: 현재 상황에 대한 자기 보고를 바탕으로 한 대화 도구입니다. 얼굴·MBTI로 역량을 측정하거나 인사 평가에 쓰는 검사가 아닙니다.

**지금 팀이 마주한 상황은?** (`situation`, `cards`)

Purpose: 상황에 맞는 협업 행동을 제안합니다.

| Option | Result advice / creative direction |
| --- | --- |
| 처음 함께 시작 (`start`) | 첫 회의에서 완료 기준·결정 담당자·질문할 창구를 각 한 줄로 정리하고 서로 같은 뜻으로 이해했는지 확인하세요. |
| 마감이 가까워요 (`delivery`) | 필수 결과물과 미뤄도 되는 일을 나누고 막힌 일을 공개하세요. 개인의 속도보다 인수인계 지점을 먼저 조율해 보세요. |
| 의견이 엇갈려요 (`friction`) | 각 제안이 해결하려는 문제를 먼저 말하고 평가 기준을 함께 정하세요. 사람의 성향보다 구체적인 관찰과 필요를 나눠보세요. |

**내 역할의 완료 기준은 얼마나 분명한가요?** (`clarity`, `scale`)

Purpose: 느낌을 점수화하지 않고 필요한 다음 행동으로 연결합니다.

| Option | Result advice / creative direction |
| --- | --- |
| 아직 흐릿해요 (`unclear`) | 다음 회의에서 결과물 예시 하나를 요청하고 언제·누가·무엇을 확인하면 완료인지 함께 문장으로 써보세요. |
| 대략 알아요 (`partial`) | 역할이 겹치는 지점과 다른 사람에게 넘기는 시점을 확인하세요. 가장 먼저 해야 할 한 가지를 합의해 보세요. |
| 서로 합의했어요 (`clear`) | 지금의 합의를 짧게 기록하고 범위가 바뀔 때 다시 확인할 시점을 정하세요. 도움을 요청할 조건도 함께 남겨보세요. |

**팀원에게 부탁하고 싶은 지원은?** (`support`, `chips`)

Purpose: 바로 말할 수 있는 요청 문장으로 바꿉니다.

| Option | Result advice / creative direction |
| --- | --- |
| 빠른 피드백 (`feedback`) | “초안을 먼저 공유할 테니 방향이 맞는지 한 가지만 확인해 주세요”라고 구체적으로 요청해 보세요. |
| 집중할 시간 (`focus`) | “이 작업을 끝내기 위해 언제까지 집중하고, 그 뒤에 진행 상황을 공유하겠습니다”라고 시간을 제안해 보세요. |
| 배경과 이유 (`context`) | “이 일이 누구에게 어떤 변화를 만들면 성공인지 알려주세요”라고 목표와 영향부터 확인해 보세요. |

### ai-vision-wall

우리의 생각이 모이는 미디어 갤러리 — **당신의 한 문장이, 벽 위의 풍경이 됩니다.**

Layout: `gallery`; palette: `#82cae1` / `#e2a58e` on `#152c3b`; artifact: 아이디어 비주얼 포스터; duration: 약 3분.

Preparation: 표현하고 싶은 아이디어를 한 문장으로 준비해 주세요. 웹 체험에서는 내 아이디어의 시각화와 샘플 월을 확인합니다.

Processing: 문장에서 중심 이미지 추출 → 선택한 관점과 움직임으로 구성 → 개인 포스터와 월 미리보기 완성.

**이 아이디어가 만드는 변화는?** (`impact`, `cards`)

Purpose: 추상적인 비전을 구체적인 장면으로 바꿉니다.

| Option | Result advice / creative direction |
| --- | --- |
| 사람을 연결 (`connect`) | 서로 다른 길이 하나의 광장으로 이어지는 장면을 중심 모티프로 삼고 연결되는 사람들의 다양성을 표현하세요. |
| 가능성을 키움 (`grow`) | 작은 씨앗이나 빛이 여러 방향으로 자라는 장면으로 구성하세요. 출발점과 확장된 결과가 함께 보이게 표현하세요. |
| 더 오래 지킴 (`care`) | 반복해 쓰는 순환 구조와 생태적인 재료감을 중심으로 구성하세요. 거대한 선언보다 일상의 작은 변화를 시각화하세요. |

**벽 위의 분위기는?** (`rhythm`, `swatches`)

Purpose: 시각적 밀도와 흐름을 정합니다.

| Option | Result advice / creative direction |
| --- | --- |
| 고요한 확장 (`calm`) | 청록색과 넓은 여백으로 중심 모티프가 천천히 펼쳐지는 정적인 장면을 구성하세요. |
| 따뜻한 파동 (`bright`) | 살구색과 골드의 반복되는 곡선으로 긍정적인 파동을 표현하되 문장과 불필요한 로고는 넣지 마세요. |
| 우주적 상상 (`cosmic`) | 남보라색 공간 속 빛나는 점들이 연결되는 깊이 있는 장면으로 구성하고 중심 아이디어가 묻히지 않게 하세요. |

### ai-business-card

첫인상을 인쇄하는 명함 공방 — **이름 다음에, 무엇으로 기억되고 싶나요?**

Layout: `atelier`; palette: `#c2b285` / `#92b9b7` on `#2c302c`; artifact: 프로필 명함과 한 줄 소개; duration: 약 3분.

Preparation: 이름·역할과 선택적으로 넣을 연락처를 준비해 주세요. 화면에서 정보를 확인한 뒤 직접 출력할 수 있습니다.

Processing: 명함을 건넬 상황과 핵심 소개 정리 → 프로필과 정보의 우선순위 배치 → 앞면 미리보기와 인쇄 구도 완성.

**누구에게 건넬 명함인가요?** (`meeting`, `cards`)

Purpose: 정보의 순서와 소개 말투를 정합니다.

| Option | Result advice / creative direction |
| --- | --- |
| 처음 만난 동료 (`network`) | 이름과 역할을 먼저 보여주고 서로 이야기할 수 있는 관심 분야 한 가지를 소개에 담으세요. |
| 협업할 고객 (`client`) | 직함보다 제공하는 결과를 한 문장으로 설명하세요. 연락처는 한두 가지 주요 채널로 정리해 선택 부담을 줄이세요. |
| 함께 만들 사람 (`creator`) | 작업 분야와 시각적 스타일을 중심으로 구성하고 다음 대화로 이어질 프로젝트 키워드를 하나 남겨보세요. |

**종이의 인상은?** (`paper`, `swatches`)

Purpose: 디자인의 색과 여백 방향을 정합니다.

| Option | Result advice / creative direction |
| --- | --- |
| 코튼 아이보리 (`cotton`) | 아이보리 바탕과 진한 본문색으로 작은 글자의 대비를 확보하고 넉넉한 여백으로 차분하게 구성하세요. |
| 그래파이트 (`graphite`) | 짙은 배경과 밝은 글자를 대비시키고 작은 장식을 줄여 이름과 역할의 가독성을 우선하세요. |
| 프레시 민트 (`mint`) | 밝은 민트는 포인트로 사용하고 본문은 어두운 색으로 유지하세요. 장식보다 연락 정보가 먼저 읽히게 구성하세요. |

## Verification

Targeted ESLint passed for the 15 modules, learning-events config and five changed backend specs. TypeScript `tsc --noEmit --pretty false` passed after integration. Existing AI services were not called during static validation; generated content quality remains subject to runtime model output. Shared UI/browser verification is handled by the integrating parent task.
