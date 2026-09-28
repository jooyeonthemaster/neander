# 데모 개선 — 학습·제품·문의 경로 검증

2026-09-24. 27개 개선 요청 중 담당 항목 3, 7, 8, 18, 22, 27과 조사 처리 일부를 반영했다. 공통 프레임·결과 상태·나머지 데모의 변경과 전체 41종 최종 결과는 통합 보고서에서 다룬다.

| 항목 | 변경 파일 | 반영 내용 |
| --- | --- | --- |
| 3 — 과학 | `src/components/demo/demos/ScienceKioskDemo.tsx`, `src/components/demo/demo-review-learning.css` | 실험 조작 영역에 `실험 0/2회 완료` 진행 표시와 남은 행동을 함께 배치했다. 같은 조건을 반복해도 횟수가 늘지 않으며 조건을 바꾼 두 번째 실험 후 완료된다. 상세 실험 안내는 펼치기로 정리하고 필수 설명은 조작부에 남겼다. 공통 하단에 전달하는 `getBlockedReason`을 추가했다. |
| 3 — 제품 | `src/components/demo/demos/ProductExperienceDemo.tsx`, `src/components/demo/demo-review-learning.css` | 답변 수와 4개 질문별 완료 표시, 남은 답변 수 안내를 추가했다. 대화 기록 버튼을 답변 칩에서 분리해 별도 줄에 아이콘과 함께 배치했다. 기록을 열고 닫아도 이미 입력한 답변을 보존한다. |
| 7 | `src/lib/constants.ts`, `src/app/[locale]/services/[slug]/page.tsx`, `src/app/[locale]/contact/page.tsx`, `src/components/contact/{ContactTabs,ContactForm}.tsx`, `src/components/quote/{QuoteBuilder,QuoteSubmitForm}.tsx`, `FortuneRobotDemo.tsx` | `getServiceContactHref(slug, quote)`로 서비스 맥락을 전달한다. 문의 화면의 관심 체험을 미리 선택하고 탭 변경·URL·새로고침에 보존한다. 일반 문의 제목과 견적 요청 서비스 목록에도 체험명과 slug를 포함한다. 공통 결과 CTA는 같은 헬퍼를 사용한다. |
| 8 | `src/components/services/IndustryShowcase.tsx` | 필터 선택을 `?pillar=`와 브라우저 기록에 반영하고 뒤로·앞으로 이동 시 선택 상태를 복원한다. 기존의 다른 쿼리 매개변수는 유지한다. 필터 버튼에 `aria-pressed`를 적용했다. |
| 9 — 담당 범위 | `ProductExperienceDemo.tsx`, `ScienceKioskDemo.tsx` | 제품명의 `을(를)` 처리와 과학 지시약·지형명의 조사를 공통 `withParticle`로 통일했다. |
| 18 | `FortuneRobotDemo.tsx`, `src/data/demo-ai/fortune.ts`, `src/lib/demo-ai/specs/fortune-robot.ts`, `src/data/demo-experiences/learning-events.ts`, `messages/{ko,en}.json` | 이름을 `AI 원소 운세`로 바꾸고 태어난 달의 계절과 상상 속 원소를 활용하는 오락용 이야기로 설명했다. 달 아이콘을 계절로 바꾸고 사주·오행·정확한 별자리 해석이라는 인상을 제거했다. 행운 아이템과 오늘의 한마디 카드를 결과 및 출력물에 추가했다. 새로운 생년월일 수집은 도입하지 않았다. |
| 22 | `ScienceKioskDemo.tsx`, `src/data/demo-ai/science-kiosk.ts`, `src/lib/demo-ai/specs/science-kiosk.ts` | 조작부·측정값·결과 제목이 동일한 `30m ±2m` 판정을 사용한다. 30°·18m/s는 명중, 45°·18m/s는 `목표에서 3.1m 차이`로 표시한다. 포물선 설명은 공 던지기 예시를 사용하고 AI 지침에도 잘못된 물수제비 비유를 금지했다. |
| 27 | `VisionWallDemo.tsx` | 고정 참여 수치를 `예시 월 · 샘플 비전 20 + 내 비전 1`로 명시하고 샘플 수는 배열 길이에서 계산한다. |

## 검증

| 검사 | 확인 결과 |
| --- | --- |
| 수정 전 과학·제품·원소 운세·비전 월 | 데스크톱 4/4 전체 흐름 통과, 소개·질문·활동·결과 캡처 보관 |
| 수정 후 담당 4종 × 서로 다른 2개 선택 × 데스크톱·모바일 | 프로덕션 서버에서 16/16 통과, 각 결과 캡처 보관 |
| 서비스 필터 URL·뒤로·앞으로·새로고침 | 데스크톱·모바일 2/2 통과 |
| 과학·원소 운세 상세 CTA와 문의 탭의 선택 유지 | 데스크톱·모바일 4/4 통과 |
| `npm test` | 전체 단위 테스트 21/21 통과. 담당 판정·CTA 테스트 4개 포함 |
| 담당 TS/TSX 정적 검사 | TypeScript 통과. ESLint 오류 없음, 기존 상세 페이지 미사용 변수 2개와 React Hook Form의 컴파일러 안내 1개는 유지 |

과학의 추가 조작 검사에서는 같은 조건 재실행이 1/2회에 머무는지, 각도를 바꾼 뒤 2/2회가 되는지, 발사 버튼과 진행 표시가 함께 보이는지 확인했다. 제품의 추가 검사에서는 대화 기록을 오가도 기존 답변이 유지되고 답변 영역과 기록 토글이 분리되는 것을 확인했다. 원소 운세의 행운 카드와 비전 월의 예시 표시도 서로 다른 두 선택으로 확인했다.

최종 담당 smoke는 첫 번째 선택을 `/services/<slug>` 상세 페이지에서, 마지막 선택을 `/services?demo=<slug>` 모달에서 실행했다. 각 실행은 결과·맞춤 가이드·출력물 저장 탭, 예시 결과 표시, 입력 단계 상한, 잘못된 결과 문자열, 프레임 넘침, 브라우저 실행 오류, 다시 체험 초기화를 검사한다. 제품은 같은 입력으로 재요청하는 요청 본문도 비교한다.

중간 개발 서버 검사 중 공통 모듈이 수정되는 순간 발생한 빌드 오버레이 2건은 이후 프로덕션 smoke에서 통과했다. 최초 문의 탭 검사 1건은 React 이벤트가 연결되기 전 클릭한 검사 시점 문제였고, 연결 완료 대기를 추가한 최종 재검증에서 6/6 통과했다.

모든 브라우저 검사는 `/api/demo-ai/**`를 로컬 503 응답으로 대체했다. 실제 AI 품질·유료 생성·카메라/마이크 장치·폼 제출은 이 기록의 검증 대상이 아니다. 문의와 견적 폼은 입력·선택 보존만 확인했고 전송하지 않았다.

## 재사용 가능한 검사

- [`tests/unit/demo-learning.test.ts`](../tests/unit/demo-learning.test.ts): ±2m 양쪽 경계, 범위 밖·비정상 값, 실제 발사값과 판정 문구 일치, 서비스별 견적·일반 문의 URL.
- [`tests/e2e/demo-flows.spec.ts`](../tests/e2e/demo-flows.spec.ts): 레지스트리 41종 × 두 선택 × 두 화면 크기 = 164개 흐름. 선택 사진인 피부 관리 데모는 사진 샘플 사용과 사진 생략을 각각 검사한다.
- [`tests/e2e/service-navigation.spec.ts`](../tests/e2e/service-navigation.spec.ts): 두 화면 크기의 필터 기록 및 상세→문의 맥락 6개 검사.
- [`playwright.config.ts`](../playwright.config.ts): 데스크톱 1440×900, 모바일 390×844, 한국어, 실패 시 trace와 스크린샷. `PLAYWRIGHT_BASE_URL`과 `PLAYWRIGHT_OUTPUT_DIR`로 서버·결과 경로를 분리한다.

```sh
npm test
PLAYWRIGHT_BASE_URL=http://localhost:3002 npm run test:e2e -- tests/e2e/demo-flows.spec.ts --workers=3
PLAYWRIGHT_BASE_URL=http://localhost:3002 npm run test:e2e -- tests/e2e/service-navigation.spec.ts --workers=1
```

담당 증거는 [`.playwright-mcp/demo-review-learning/`](../.playwright-mcp/demo-review-learning/)에 보관한다.

- `before/`: 수정 전 4종의 소개·질문·활동·결과와 `flow-report-1440.json`.
- `after-*.png`: 실험 진행, 대화 완료, 운세·비전 결과의 추가 검사 캡처.
- `smoke/demo-review.json`: 16개 최종 담당 흐름 결과와 각 하위 폴더의 `result.png`.
- `navigation-final/demo-review.json`: 최종 URL·문의 경로 6개 통과 기록.
- `targeted.cjs`, `targeted-1440.json`: 실험 반복 조건·대화 기록 등 추가 조작 검사 및 중간 개발 서버 기록.

대표 전후 비교: `before/ai-science-kiosk-1440-activity-1.png`와 `after-ai-science-kiosk-1440-0-experiment-complete.png`, `before/ai-product-experience-1440-activity-1.png`와 `after-ai-product-experience-1440-1-chat-complete.png`, `before/ai-fortune-robot-1440-result.png`와 `after-ai-fortune-robot-1440-1-result.png`, `before/ai-vision-wall-1440-result.png`와 `after-ai-vision-wall-1440-1-result.png`를 비교할 수 있다.
