# 서비스 데모 목업 적용

2026-09-23. 생성한 [목업 5종](../output/demo-ui-mockups/2026-09-23/README.md)의 배치 원칙을 서비스 데모 41개에 적용했다. 기존 서비스 사진과 콘셉트 이미지를 재사용하며, 서비스별 입력·샘플 촬영·분석·결과·출력 기능은 유지한다.

## 레이아웃 배정

| 목업 | 데모 수 | 대표 데모 | 구성 |
| --- | ---: | --- | --- |
| 편집형 `editorial` | 7 | `ai-style-profiler` | 보조 사진, 큰 질문, 넓은 선택 행 |
| 중앙집중형 `centered` | 6 | `ai-fortune-robot` | 작은 상징 이미지와 질문·선택지를 중앙에 배치 |
| 사진 선택형 `photo-choices` | 6 | `ai-scent-soulmate` | 선택지 자체를 사진 카드로 표현 |
| 촬영 스튜디오형 `photo-studio` | 15 | `ai-runway-photobooth` | 크기가 제한된 촬영 미리보기와 선택 도구 |
| 실험 콘솔형 `console` | 7 | `ai-science-kiosk` | 진행 단계, 현재 질문, 실험 조작 영역 |

전체 배정은 [`mockup-layouts.ts`](../src/data/demo-experiences/mockup-layouts.ts)가 관리한다. 데모 레지스트리 41개와 배정 41개가 일치하며, 모든 선택지 이미지 경로가 존재하는 것을 확인했다.

## 화면 동작

- 헤더에 서비스 이름·진행 상태·닫기를 모으고, 하단에는 상세 보기와 이전·다음 동작을 고정한다.
- 소개, 한 번에 하나씩 제시하는 질문, 서비스별 활동, 결과 화면이 같은 프레임을 사용한다.
- 사진 영역을 제한하고 질문·선택지·입력 컨트롤의 크기와 간격을 조정한다. 모바일에서는 화면 크기에 맞춰 사진과 선택지를 재배치한다.
- 선택 상태는 시각 표시와 `aria-pressed`로 전달한다. 결과 탭은 방향키·Home·End로 전환할 수 있다.
- 긴 결과는 실제 사용 가능한 높이에 맞춰 나눈다. 결과의 제목·요약이 각각 한 페이지로 분리되는 현상을 수정했다.
- 결과 하단에서 입력 수정 또는 다시 체험을 선택할 수 있다. 다시 체험하면 이전 질문 선택이 초기화된다.

공통 프레임은 [`DemoSection.tsx`](../src/components/demo/DemoSection.tsx), [`DemoShell.tsx`](../src/components/demo/DemoShell.tsx), 질문 장면은 [`ExperienceVenue.tsx`](../src/components/demo/ExperienceVenue.tsx), 페이지 분할은 [`DemoViewport.tsx`](../src/components/demo/DemoViewport.tsx)에 구현되어 있다. 시각 규칙은 `mockup-shell.css`, `mockup-scenes.css`, `mockup-controls.css`로 구분한다.

## 검증 결과

| 검증 | 결과 |
| --- | --- |
| 1440 × 900 전체 체험 흐름 | 41 / 41 통과 |
| 390 × 844 전체 체험 흐름 | 41 / 41 통과 |
| 마지막 페이지 분할·컨트롤 변경 후 대표 5종 + 퍼스널 컬러 + 제품 체험 재검사 | 데스크톱 7 / 7, 모바일 7 / 7 통과 |
| 1440 × 900, 390 × 844, 320 × 568 키보드·모달·상세 페이지 검사 | 3 / 3 통과 |
| 390 × 844, 320 × 740 대표 5종 질문 화면 | 모두 한 페이지에 질문·선택지 표시, 전체 선택지 접근 가능 |
| 844 × 390 가로 화면 | 대표 5종 선택지 15개 및 과학 체험 항목 4개 접근 가능 |
| 768 × 1024 콘솔 화면 | 소개·질문·첫 활동 한 페이지 표시, 단계 안내와 작업 영역 정상 배치 |
| 질문·활동·결과·가이드의 레이아웃 측정 | 906개 지점에서 프레임 가로·세로 넘침 없음 |
| 브라우저 실행 오류·예상하지 않은 콘솔 오류 | 없음 |
| 영수증 저장 | 데스크톱·모바일에서 576 × 1491 PNG 확인 |
| 런웨이 사진 저장 | 데스크톱·모바일에서 1200 × 1800 JPEG 확인 |
| 마지막 결과 색상 보정 후 스타일·운세·퍼스널컬러 모바일 재검사 | 3 / 3 통과 |
| 최종 프로덕션 빌드·TypeScript 검사 | 통과, 214개 페이지 생성 |
| 이번에 수정한 TS/TSX 파일 ESLint·공백 검사 | 오류·경고 없음 |

데모 폴더 전체 ESLint 검사도 오류 없이 완료했다. 이번 대상 밖의 기존 `PhotoBoothPreview.tsx`, `ScentQuiz.tsx`에는 사용하지 않는 변수 경고 5개가 남아 있다.

전체 흐름은 소개 → 질문 선택 → 활동 입력 또는 샘플 촬영 → 결과 → 맞춤 가이드 → 다시 체험을 진행한다. 선택한 프로필이 분석 요청에 보존되는지, 결과 탭 키보드 전환, 필수 선택 전 다음 버튼 비활성화, 초기화 이후 선택 상태 제거도 검사했다.

모달 검사는 서비스 카드의 Enter 실행, 처음 닫기 버튼 포커스, 탭 이동의 모달 내부 유지, Escape·닫기 버튼, 원래 카드로 포커스 복원, 스크롤 잠금 해제, 이전 질문 선택 유지, 상세 페이지 실행 버튼을 포함한다. 전체 화면 전환은 해당 버튼이 표시되는 데스크톱에서 검사했다.

팬 포토카드의 결과 안쪽 초기화 버튼은 앞 페이지에서는 화면 밖·비활성 상태이며, 해당 버튼이 있는 마지막 페이지에서는 보이고 클릭 가능한 것을 좌표·클립 영역·포인터 판정으로 확인했다.

브라우저 검사는 `/api/demo-ai/**`를 로컬 503 응답으로 대체해 샘플 결과 경로를 사용했다. 유료 AI 생성, 실제 카메라·마이크 장치, 실물 프린터 작동은 이번 검사 범위에 포함하지 않는다. 최초 검사에서 발생한 두 데스크톱 실패는 전환 완료 전 선택지 탐색과 탭 변경 중 동적으로 바뀌는 버튼 인덱스를 사용한 검사 문제였으며, 전환 대기와 고정 하단 초기화 버튼을 사용한 재검사에서 통과했다. 카드의 첫 키보드 검사도 React 이벤트 연결 완료를 기다리도록 보완했다.

## 검사 파일과 화면

검사 파일은 [`.playwright-mcp/mockup-redesign/`](../.playwright-mcp/mockup-redesign/)에 있다.

- `flows.cjs`: 전체 41개 흐름 및 출력 파일 저장 검사.
- `lifecycle.cjs`: 키보드·모달·상세 페이지·전체 화면 검사.
- `final-summary.json`: 최초 실행과 마지막 재검사를 합친 82개 최종 결과 및 각 원본 보고서 경로.
- `flow-report-1440.json`, `flow-report-390.json`: 전체 실행 기록.
- `flow-report-1440-final.json`, `flow-report-390-final.json`: 마지막 대표 7개 재검사 기록.
- `flow-report-1440-fan-audit.json`, `flow-report-1440-timecapsule-recheck.json`: 데스크톱 개별 확인 기록.
- `lifecycle-report.json`, `static-report.json`: 키보드·화면 크기·배정 검사 결과.

대표 5종의 소개·질문·첫 활동·결과를 두 화면 크기에서 저장했고, 영수증·사진 출력 화면까지 총 44개 캡처를 기록했다. 파일명은 `{서비스-slug}-{1440|390}-{welcome|question|activity-1|result|print}.png` 형식이다. 출력 파일은 `download-{1440|390}-neander-ai-style-profiler-20260923.png` 및 `download-{1440|390}-neander-ai-runway-photobooth-20260923.jpg`에 저장했다.

전체 실행 예시:

```sh
node .playwright-mcp/mockup-redesign/flows.cjs
QA_WIDTH=390 QA_HEIGHT=844 node .playwright-mcp/mockup-redesign/flows.cjs
node .playwright-mcp/mockup-redesign/lifecycle.cjs
```

검사 스크립트는 이 작업 환경에 설치된 Playwright 경로를 사용한다. 다른 개발 환경에서는 스크립트 첫 줄의 Playwright 모듈 경로를 해당 환경에 맞춰 변경한다.
