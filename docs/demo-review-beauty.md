# 뷰티·식음료 데모 검수 — 2026-09-24

사용자 지시서 항목 1, 3, 9, 12, 13, 14, 20, 23, 25 중 뷰티·식음료 범위를 수정했다. 공통 결과 상태·재시도·페이지 표시·고정 CTA는 공통 셸 작업과 연결된다.

| 항목 | 변경 파일 | 변경 및 확인 내용 |
| --- | --- | --- |
| 1 | `NailDesignerDemo.tsx`, `TasteDnaDemo.tsx`, `BaristaMatchingDemo.tsx`, `SommelierDemo.tsx` | 규칙 기반 예시일 때 결과 및 출력물 제목에 AI 생성으로 오인할 문구를 없앴다. 네일의 절차적 SVG 대체 이미지 설명도 '선택한 조건을 표현한 일러스트'로 수정했다. 향수·메이크업·칵테일의 AI 생성 설명은 기존의 유효한 생성 응답 조건을 유지한다. |
| 3 | `NailDesignerDemo.tsx`, `VirtualMakeupDemo.tsx`, `data/demo-ai/beauty-completion.ts` | 패턴/쉐입, 강도/룩 그룹에 '선택 필요'와 '✓ 선택 완료'를 표시한다. `getBlockedReason`이 정확한 미선택 그룹을 공통 다음 버튼에 전달한다. 메이크업 미리보기의 기본 강도를 실제 선택으로 취급하지 않고 명시적인 강도 선택을 받는다. |
| 9 | `ScentSoulmateDemo.tsx` | 향수명 뒤 `을(를)`을 공통 `withParticle`로 교체했다. |
| 12 | `TasteDnaDemo.tsx`, `data/demo-ai/taste-dna.ts`, `specs/taste-dna.ts` | 0단계는 카드·축·바·출력물 모두 0/100이다. 장식용 최솟값 6을 실제 수치에 적용하던 코드를 제거했다. '화끈한크림모험가'는 '화끈한 크림 모험가'로 정리하고 생성 프롬프트에도 띄어쓰기를 지시한다. 불투명한 DNA 코드를 화면·출력물에서 빼고 평문 취향 요약으로 대체했다. |
| 13 | `CocktailCreatorDemo.tsx`, `data/demo-ai/cocktail.ts`, `specs/cocktail-creator.ts` | '가니시'로 통일하고 없음은 '없음' 값 하나로 표시한다. '조향'은 '블렌딩'으로 정리하며 서버 프롬프트와 응답 정규화, 기존 응답을 읽는 화면 모두에 적용한다. |
| 14 | `BaristaMatchingDemo.tsx`, `data/demo-ai/barista.ts`, `specs/barista-matching.ts`, `demo-experiences/beauty-fnb.ts` | 사용 도구 우선 규칙을 화면·출력물·서버에서 일치시킨다. 드리퍼/에스프레소 취향 충돌 시 드립 레시피, 머신/라떼 취향은 라떼를 사용한다. 추출 방식별 잔 표를 도입해 드립에는 250–300ml 머그/향미 잔, 에스프레소에는 60–90ml 데미타세를 연결한다. AI의 임의 잔 조언은 사용하지 않는다. API의 `brewTool`은 선택 필드로 추가해 기존 요청도 호환된다. |
| 20 | `SkincareAnalysisDemo.tsx`, `demo-experiences/beauty-fnb.ts` | 사진을 선택 단계로 변경해 촬영 없이 진행할 수 있다. 촬영한 경우 결과 카드에 '관리 전 참고 사진'으로 명시해 사용한다. 사진을 생략하면 답변 기반 관리 노트임을 밝히고 이미지 AI 요청을 보내지 않는다. 피부 느낌과 자극 경험을 우선하는 기존 루틴 규칙을 유지한다. |
| 23 | `specs/personal-color.ts` | 입력 부위의 속성을 다른 부위로 옮기지 않도록 지시했다. 예: 레디쉬 브라운 모발의 '결'을 립 설명에 사용 금지. 쿨톤에 '갓 구운 온기' 등 웜톤 온도 비유를 사용하지 않고 실제 명도·채도·대비로 설명하도록 했다. |
| 25, 7 | `CocktailCreatorDemo.tsx`, `PersonalColorDemo.tsx` | 중복 결과 CTA를 `demo-legacy-result-cta`로 표시해 공통 고정 CTA와 연결했다. 기존 링크에도 `service=<slug>` 문맥을 추가했다. |

## 검증

- `tests/unit/demo-beauty.test.ts`: 7개 테스트 통과. 매운맛 0 보존·유형명 띄어쓰기·가니시 정규화·추출 방식 충돌·방식별 잔·네일/메이크업 미선택 안내를 검증한다.
- 변경 파일 ESLint 통과, `tsc --noEmit` 통과, `git diff --check` 통과.
- 변경 전 9개 데모를 로컬 브라우저에서 완료하고 스크린샷을 저장했다. 최초 칵테일 검수는 결과까지 도달했지만 개발 서버의 일시적 500 콘솔 오류를 기록했다.
- 변경 후 9종 × 서로 다른 선택지 2회, 총 18개 흐름이 통과했다. 첫 경로는 API 실패를 명시적으로 주입해 예시 결과를 검사했다. 두 번째 경로는 반대 선택지를 사용하고, 미각·칵테일·바리스타에는 문제가 있던 AI 응답을 로컬 fixture로 주입해 정규화와 일관성을 검사했다. 유료 AI API는 호출하지 않았다.
- 개발 중 공통 파일 HMR로 중단된 소믈리에 첫 경로와 퍼스널컬러·스킨케어 두 번째 경로는 빌드된 `localhost:3002`에서 재실행해 통과했다(`flow-report-1440-retry.json`). 초기 실패 기록도 보존했다. 전체 공통 셸의 최종 41종 검수와 별개로, 이 보고서는 담당 기능의 입력·출력 검증을 기록한다.
- 스킨케어는 샘플 사진 경로와 사진 생략 경로를 모두 확인했다. 생략 시 AI 요청은 0건이었다. 바리스타는 드리퍼+에스프레소 취향의 드립 결과, 머신+스위트 취향의 라떼 결과를 확인했다. 미각은 매운맛 0/100과 100/100, 칵테일은 가니시 '없음'과 '블렌딩' 정규화를 확인했다. 결과·가이드·출력 탭 키보드 이동과 재시작 선택 초기화도 각 경로에서 확인했다.
- 퍼스널컬러 프롬프트 제약은 코드 검수 대상이며, 유료 모델 출력의 품질을 실제 호출로 검증했다고 주장하지 않는다.

## 공통 복구 흐름 회귀 테스트

`tests/e2e/demo-lifecycle.spec.ts`에서 미각 데모를 대표로 재시도·대기·모듈 로드·출력 복구를 검사한다. API는 모두 브라우저에서 차단하거나 fixture로 응답하며 실제 AI를 호출하지 않는다.

4개 시나리오 × 데스크톱·모바일은 마지막 개별 재실행 기준 **8/8 통과**했다. 최종 빌드의 전체 회귀 실행은 공통 보고서에서 별도로 집계한다.

- API 503 뒤 동일 입력으로 다시 시도하고 성공 응답을 받으면 '예시 결과' 안내가 사라지는지 확인했다. 데스크톱·모바일 통과.
- 45초 타임아웃은 실제 시간을 기다려 검증했다. 30초 경과 표시·45초 이내 안내·로딩 페이지네이션 없음과 timeout 예시/재시도 버튼을 데스크톱·모바일 모두 확인했다. Playwright의 가상 시간 이동은 Motion 전환에 간섭하므로 이 사례에서는 사용하지 않는다.
- 모듈 로드 실패는 동적 JS 청크를 차단하고 가상 시계로 15초를 진행해 새로 불러오기 안내와 복구를 확인했다. 데스크톱·모바일 통과. 청크 해시 대신 내용을 찾아 차단하고, 테스트 종료 전에 진행 중인 네트워크 핸들러를 정리한다.
- 출력은 첫 렌더 시도 동안 `toDataURL` 예외를 주입한 뒤 원복하여 오류 안내·재준비·이미지 다운로드를 확인했다. 데스크톱·모바일에서 저장한 파일의 PNG/JPEG 시그니처와 비어 있지 않은 데이터까지 검사했다.

## 아티팩트

- 변경 전: `.playwright-mcp/demo-review-beauty/before/`
- 변경 후 첫 경로: `.playwright-mcp/demo-review-beauty/after/variant-0/`
- 변경 후 다른 선택지: `.playwright-mcp/demo-review-beauty/after/variant-1/`
- 브라우저 검수 스크립트: `.playwright-mcp/demo-review-beauty/after/flows.cjs`
- 공통 실제 대기 검수: `test-results/lifecycle-real-time/` (`waiting-30-seconds.png`, `timeout-example.png`)
- 출력 복구 검수: `test-results/lifecycle-print-dev-fixed/` (실패·복구 PNG, 다운로드된 결과 PNG)
- 모듈 로드 복구 검수: `test-results/lifecycle-module/`, `test-results/lifecycle-module-mobile-fixed/`
- 생성 재시도 검수: `test-results/lifecycle-final/`의 `failed-gene…` 데스크톱·모바일 폴더 (재시도 전 예시 / 성공 후 AI 결과 PNG)

각 폴더에 데모별 질문·입력·결과·출력 화면 PNG와 흐름 보고서 JSON을 남긴다. 최종 전체 41개 스모크 결과는 공통 검수 보고서에서 집계한다.
