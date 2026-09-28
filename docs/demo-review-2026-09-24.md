# 서비스 데모 41종 개선 기록 — 2026-09-24

사용자 검수 지시서 27개 항목을 공통 체험 셸과 개별 데모에 반영했다. 기존 5가지 목업 레이아웃과 41개 서비스의 연결을 유지하면서 입력, 결과, 안내, 출력 흐름을 개선했다.

| 번호 | 주요 변경 파일 | 적용 내용 |
| --- | --- | --- |
| 1 | `src/lib/demo-generation.ts`, `src/components/demo/DemoShell.tsx`, `DemoResultNotice.tsx`, 개별 데모 | `ai/example/timeout/error` 상태를 구분한다. 결과 탭에 예시 배지와 같은 입력 재시도를 제공하고, 실패 시 AI 생성이라고 단정하는 설명을 제거한다. 사진 없는 체험의 안내에 사진 분석을 언급하지 않는다. |
| 2 | `DemoShell.tsx`, `DemoSection.tsx`, `ExperienceVenue.tsx`, `kit/ai.ts`, `kit/ResultParts.tsx`, `IdolMakeupBoothDemo.tsx` | 전체 생성과 개별 요청에 최대 45초를 적용하고 15/30초에 안내를 바꾼다. 진행 화면 페이지네이션을 없앴다. 사진은 즉시 표시하고 로컬 효과 처리 중 상태를 분리한다. 모듈 로딩 15초 초과·오류 시 다시 불러오기 버튼으로 페이지를 새로 고친다. |
| 3 | `DemoShell.tsx`, `src/types/demo.ts`, `ScienceKioskDemo.tsx`, `ProductExperienceDemo.tsx`, `NailDesignerDemo.tsx`, `VirtualMakeupDemo.tsx` | 다음 버튼 바로 위에 미완료 이유를 표시한다. 과학은 발사 옆 1/2·2/2 진행 표시, 네일·메이크업은 그룹별 완료 표시, 제품은 4문항 진행과 분리된 대화 기록을 제공한다. |
| 4 | `DemoViewport.tsx`, `demo-review.css` | 1024px 이상은 그리드와 내부 스크롤로 모든 옵션에 접근한다. 좁은 화면의 페이지 표시에는 남은 옵션 수를 덧붙인다. |
| 5 | `kit/ResultParts.tsx`, `DemoViewport.tsx`, `demo-review.css` | 공통 결과는 핵심 내용과 '자세히 보기'로 구성한다. 결과·가이드·출력은 단일 스크롤 화면으로 페이지 수를 1개로 제한한다. |
| 6 | `DemoShell.tsx`, `ExperienceVenue.tsx`, `src/lib/demo-generation.ts` | 소개를 진행 수에서 분리하고 주요 프로필 질문을 우선해 필수 입력을 4~5개로 제한한다. 질문 legend 안에 h2를 제공한다. 생성 대기는 최대 45초이며 실제 사용자의 답변 속도에 따른 완료 시간은 달라진다. |
| 7 | `src/lib/constants.ts`, 서비스 상세 페이지, `DemoShell.tsx`, `src/components/contact/ContactTabs.tsx`, `ContactForm.tsx` | 결과·상세 CTA의 `service=<slug>`를 문의/견적 탭으로 전달하고 해당 서비스를 미리 선택한다. 탭 전환·새로고침에도 문맥을 유지한다. |
| 8 | `src/components/services/IndustryShowcase.tsx` | 필터 선택을 `?pillar=`와 브라우저 기록에 동기화한다. 다른 쿼리를 보존하고 뒤로/앞으로 가기와 재접속 시 선택을 복원한다. |
| 9 | `src/lib/korean.ts`, `kit/CameraStep.tsx`, 향수·코디·손금·관상·MV·제품·과학 데모 | 을/를, 이/가, 은/는, 으로/로 공통 조사를 적용한다. 받침·ㄹ 예외·숫자·마침표를 처리하며 `을(를)` 표기를 제거한다. |
| 10 | `HanbokBoothDemo.tsx` | 스타일명 뒤 '한복'이 중복되지 않는 문장으로 바꾼다. |
| 11 | `MusicvideoMakerDemo.tsx`, `MemoryMovieDemo.tsx`, 두 AI 사양 | 결과·타임라인·출력물 BPM을 선택한 음악에 맞춘다. 선택한 영상 길이와 현장 안내를 일치시킨다. |
| 12 | `TasteDnaDemo.tsx`, `src/data/demo-ai/taste-dna.ts`, AI 사양 | 매운맛 0을 모든 표시에서 유지한다. 유형명 띄어쓰기를 정리하고 의미 없는 DNA 코드를 취향 요약으로 바꾼다. |
| 13 | `CocktailCreatorDemo.tsx`, `src/data/demo-ai/cocktail.ts`, AI 사양 | 가니시 표기와 없음 값을 통일하고 '조향'을 음료 혼합에 맞는 표현으로 바꾼다. |
| 14 | `BaristaMatchingDemo.tsx`, `src/data/demo-ai/barista.ts`, AI 사양 | 보유 도구를 음용 취향보다 우선한다. 추출 방식별 잔을 매핑하고 생성 응답과 화면·출력물에 같은 규칙을 적용한다. |
| 15 | `CoordRecommenderDemo.tsx` | QR 쇼핑은 현장 체험의 기능임을 명시한다. |
| 16 | `FashionTimemachineDemo.tsx`, `DemoShell.tsx` | 단일 시대에 순위를 붙이지 않는다. 새 실행 ID와 답변을 바탕으로 포스터 번호·예시 연출 지수를 달리하며 수치가 창작 예시임을 밝힌다. |
| 17 | `TravelStyleDemo.tsx`, `src/data/demo-ai/travel.ts`, AI 사양 | 당일·2~3일은 국내 후보로 제한하고 여러 후보는 대안임을 명시한다. |
| 18 | `FortuneRobotDemo.tsx`, `learning-events.ts`, AI 사양, `messages/ko.json`, `messages/en.json` | 사주 대신 'AI 원소 운세'로 이름과 소개를 일치시킨다. 계절 아이콘과 행운 아이템·오늘의 한마디 카드를 보강한다. |
| 19 | `CelebLookalikeDemo.tsx`, `photo-culture.ts`, AI 사양 | 시작 화면부터 실존 인물이 아닌 셀럽 무드와 매칭함을 알린다. |
| 20 | `SkincareAnalysisDemo.tsx`, `beauty-fnb.ts` | 사진 단계를 선택 사항으로 바꾸고, 선택한 사진은 결과의 관리 전 참고 이미지로 사용한다. 사진 생략 시 답변 기반 관리 노트를 제공한다. |
| 21 | `FutureFamilyDemo.tsx`, `src/data/demo-ai/future-family.ts`, AI 사양 | 모두 A 50%인 응답을 A/B가 섞인 45~65% 창작 지표로 보정한다. 유전·외모 예측이 아닌 허구의 이미지 구성 표시임을 명시한다. |
| 22 | `ScienceKioskDemo.tsx`, `src/data/demo-ai/science-kiosk.ts`, AI 사양 | 목표 ±2m 판정을 입력·결과·해설에서 통일한다. 물수제비 비유를 제거한다. |
| 23 | `src/lib/demo-ai/specs/personal-color.ts` | 입력의 신체 부위 속성을 다른 부위로 옮기지 말고, 톤과 어긋난 온도 비유 대신 명도·채도·대비를 설명하도록 프롬프트를 보강한다. |
| 24 | `FaceReadingDemo.tsx` | 관록궁·감찰관·재백궁·출납관·지각에 짧은 뜻풀이를 붙인다. |
| 25 | `DemoShell.tsx`, `kit/ResultParts.tsx`, `demo-review.css`, 커스텀 결과 데모 | 결과 화면 안의 중복 문의/재시작 CTA를 숨기거나 제거하고 고정 하단에 한 번만 제공한다. |
| 26 | `kit/PrintStage.tsx` | 렌더·출력 중에도 비활성 저장 버튼을 표시하고 출력 완료 후 다운로드 링크로 전환한다. 출력 렌더링 실패는 오류 상태와 재시도로 복구한다. |
| 27 | `VisionWallDemo.tsx` | 참여 수 21을 '예시 월: 샘플 20 + 내 비전 1'로 설명한다. |

위 표에서 경로를 줄여 적은 데모 파일은 `src/components/demo/demos/`, 공통 컴포넌트는 `src/components/demo/`, 체험 데이터는 `src/data/demo-experiences/`, AI 사양은 `src/lib/demo-ai/specs/` 아래에 있다.

## 검증 방법

- `npm test`: 22/22 통과. 조사, fallback 상태·배지, 전체 타임아웃·취소·늦은 응답, 입력 수, 취향·잔 매칭, 가족 지표·여행 기간의 단위 테스트.
- `npm run build`: Next.js 프로덕션 빌드 및 TypeScript 검사.
- `PLAYWRIGHT_BASE_URL=http://localhost:3002 npm run test:e2e`: 최종 빌드를 로컬 3002번 포트에서 검증한다.
- `tests/e2e/demo-flows.spec.ts`: 41종 × 첫/마지막 선택 × 데스크톱/모바일 164경로. 첫 경로는 상세 URL, 다른 경로는 목록 모달을 사용한다. 샘플 사진·누락 항목 안내·예시 배지·결과 3탭·잘못된 문자열·화면 넘침·재시작을 검사한다.
- `tests/e2e/demo-lifecycle.spec.ts`: AI 실패 후 같은 입력 재시도, 45초 타임아웃, 모듈 로더 15초 제한과 다시 불러오기, 출력 렌더링 오류 후 재시도·유효한 이미지 다운로드.
- `tests/e2e/service-navigation.spec.ts`: 필터 공유 URL/뒤로가기, 서비스가 선택된 문의/견적 탭과 새로고침.
- 실제 AI API 호출은 테스트에서 차단한다. 성공·실패·잘못된 BPM·모두 50인 가족 지표·음료 오류 응답은 고정 테스트 응답을 주입한다. 모델의 실제 응답 품질이나 외부 서비스 속도를 검증했다는 의미는 아니다.

## 결과와 증거

- **최종 확인: 전체 흐름 164/164, 복구 8/8, 문의·필터 6/6, 단위 22/22 통과.**
- 프로덕션 빌드와 TypeScript 검사, 변경 범위 ESLint, 공백 검사 통과.
- 첫 전체 실행은 160/164 통과했다. 사진을 선택 사항으로 바꾼 스킨케어 4경로에서 테스트가 여전히 API 요청을 필수로 기대해 실패했고, 사진 촬영/생략을 각각 검증하도록 테스트를 수정했다.
- 최종 빌드에서 변경 영향 40경로와 복구·연결 14건을 재검증했다. 53건은 한 번에 통과했고, 모바일 로더 1건은 화면 검증 후 테스트 도구의 네트워크 정리가 멈춰 중단했다. 오래된 페이지 요청을 기다리지 않도록 정리 코드를 고친 뒤 로더 데스크톱/모바일 2/2가 통과했다. 위 수치는 각 경로의 최신 결과를 합친 집계이며, 처음부터 한 번에 모두 통과했다는 뜻은 아니다.
- 원본 실행 보고서: `test-results/final/demo-review.json`, `test-results/recheck/demo-review.json`, `test-results/lazy-final/demo-review.json`.
- 합산 결과: [verification.json](../output/demo-review/2026-09-24/verification.json).
- 전후 화면 갤러리: [검수 페이지](../output/demo-review/2026-09-24/index.html). 41종의 수정 후 164장과 이번 작업의 수정 전 23장, 총 187장을 연결했다.

- 개별 뷰티/FnB 9종 × 2선택: 18/18 완료. [상세 기록](demo-review-beauty.md)
- 개별 사진/문화 10종 및 추가 13종 문구 감사: 완료. [상세 기록](demo-review-photo.md)
- 학습/행사·문의·목록 연결: [상세 기록](demo-review-learning.md)
- 변경 전 스크린샷: `.playwright-mcp/demo-review-beauty/before/`, `.playwright-mcp/demo-review-photo-before/`, `.playwright-mcp/demo-review-learning/before/`.
- 추가 공통 변경 전 화면은 이전 목업 검수의 `.playwright-mcp/mockup-redesign/` 기록을 참고한다. 이번 수정 직전 화면을 41종 모두 새로 캡처한 것은 아니다.
- 변경 후 164경로 결과 스크린샷·추적·JSON: `test-results/final/`, 최종 보완 화면은 `test-results/recheck/`.
- 생성·로더·문의 검수의 출력 폴더는 각 담당 기록에 기재한다.
- 빌드 로그: `.playwright-mcp/demo-review-build.log`.

27개 기능 항목 중 의도적으로 남겨 둔 항목은 없다. 실제 AI 모델 호출을 포함한 실환경 품질 검수와 모든 41종의 수정 직전 신규 스크린샷은 위 검증 범위에 포함하지 않았다. 코드 변경은 로컬 작업 공간에 있으며 원격 배포는 수행하지 않았다.
