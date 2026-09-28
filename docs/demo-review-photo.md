# 사진·문화·여행 데모 개선 기록

2026-09-24. 공통 결과 상태·재시도·타임아웃·페이지 구조는 공통 작업에 연결하고, 아래 항목의 데모별 문구와 계산을 수정했다. 기존 API 입력 키는 유지했다.

| 지시 항목 | 변경 파일 | 변경 내용 |
| --- | --- | --- |
| 2 | `IdolMakeupBoothDemo.tsx` | 사진 카드의 인위적인 1.1초 지연을 제거했다. 공통 `ProcessedPhoto`의 즉시 원본 표시와 함께 완료 상태에서 가짜 AI 렌더링 문구가 남지 않게 했다. 추가 리뷰에서 예시 사진 설명과 ‘AI가 적용한 메이크업’ 제목도 색 보정 예시/콘셉트 아이디어로 나눴다. |
| 9 | `CoordRecommenderDemo.tsx`, `FaceReadingDemo.tsx`, `MusicvideoMakerDemo.tsx`, `BrandAvatarDemo.tsx` | 공통 `withParticle`을 사용해 오버사이즈로, 관상 유형/관심 주제, 가사 또는 MV 컷, 브랜드 스타일의 조사를 처리한다. |
| 10 | `HanbokBoothDemo.tsx` | 스타일명 뒤에 한복을 다시 붙이지 않는다. 본문·사진 대체 텍스트·출력 캡션을 같은 스타일명으로 맞추고 AI 사진과 필터 예시를 구분했다. |
| 11 | `MusicvideoMakerDemo.tsx`, `MemoryMovieDemo.tsx`, `data/demo-ai/musicvideo.ts`, `data/demo-ai/memory-movie.ts`, 해당 `lib/demo-ai/specs` | 선택한 장르/감정의 BPM을 클라이언트·서버 응답·재생에 그대로 쓴다. 모델의 다른 BPM 응답도 덮어쓴다. MV 길이는 편집 리듬에 따른 실제 15~24초 값을 표시한다. |
| 15 | `CoordRecommenderDemo.tsx` | QR 쇼핑 안내를 현장 제공 기능으로 명시했다. |
| 16 | `FashionTimemachineDemo.tsx`, `lib/demo-ai/specs/fashion-timemachine.ts` | 한 시대만 선택하면 순위를 표시하지 않는다. 번호와 장식용 연출값은 입력과 실행 식별자를 포함한 시드로 만든다. 연출값이 실제 외모 평가나 적합도 확률이 아닌 창작 예시임을 화면과 출력물에 밝힌다. 프롬프트에서도 점수/순위를 이유 문장에 섞지 못하게 했다. |
| 17 | `TravelStyleDemo.tsx`, `data/demo-ai/travel.ts`, `lib/demo-ai/specs/travel-style.ts` | 당일/2~3일은 선택한 여행 분위기별 국내 후보 테이블로 제한한다. 화면·출력물·AI 응답에 동일 규칙을 적용한다. 후보는 한 번에 묶인 여정이 아닌 ‘또는’으로 구분한 대안이다. 당일 출력물은 항공권 대신 여행 계획으로 표시한다. |
| 19 | `CelebLookalikeDemo.tsx`, `data/demo-experiences/photo-culture.ts`, `data/demo-ai/celeb.ts`, `lib/demo-ai/specs/celeb-lookalike.ts` | 시작 단계에서 실존 인물 대신 셀럽 무드 캐스팅임을 알린다. 결과·출력물도 같은 용어를 쓴다. 모델은 실존 연예인 얼굴 비교 대신 선택한 무드와 보이는 스타일을 참고한 가상의 캐스팅 유형을 만든다. |
| 21 | `FutureFamilyDemo.tsx`, `data/demo-ai/future-family.ts`, `lib/demo-ai/specs/future-family.ts` | 전부 50 또는 한쪽으로만 몰린 응답은 A/B가 번갈아 우세한 6개 값으로 보정한다. 우세한 쪽은 55~65%이며, 화면/출력물에 실제 닮음이나 유전 확률이 아닌 허구의 모티프 배합값임을 명시했다. |
| 24 | `FaceReadingDemo.tsx` | 관록궁·감찰관·재백궁·출납관·지각에 이마·눈·코·입·턱을 뜻하는 전통 용어라는 짧은 괄호 풀이를 붙였다. 출력물에도 포함한다. |
| 25 | `CelebLookalikeDemo.tsx`, `TravelStyleDemo.tsx` | 자체 결과 CTA를 제거해 공통 고정 푸터의 서비스 문의 링크 한 곳으로 통합했다. |

파일명이 짧게 적힌 데모는 `src/components/demo/demos/` 아래에 있다. `data/`와 `lib/`는 `src/` 기준이다.

## 추가 13종의 fallback 문구 감사

| 데모 | 결과 |
| --- | --- |
| BrandAvatar | AI가 브랜드를 ‘학습했다’는 무조건적 설명을 제거하고 생성 사진/색 보정 미리보기를 구분했다. |
| BusinessCard | 고정 명함 템플릿을 AI 디자인으로 부르지 않는다. 실제 생성되지 않은 300dpi 파일이 준비됐다는 문구도 현장 제공 설명으로 바꿨다. |
| TimecapsulePhoto | 예시 사진의 설명·alt에서 AI가 만든 노화 사진이라는 표현을 제거하고 에이징 필터로 표시했다. |
| GraduationBooth | 원본+장식 예시를 AI 합성 과정으로 표시하던 제목·기법·alt를 조건부로 나눴다. |
| TraditionalPainter | 필터 예시를 AI가 직접 그린 그림으로 설명하지 않는다. 예시의 표구·필터·낙관을 실제 적용 구성으로 표시한다. |
| FanPhotocard | 예시의 ‘AI 보정’ 및 피부 리터칭 완료 문구를 색 보정·프레임·레어도 장식으로 바꿨다. |
| CaricatureArtist | 예시의 AI 변환·얼굴 비율 과장 완료 주장을 제거하고 사진 필터/레이아웃으로 표시한다. 출력물의 AI 화가 코멘트도 조건부다. |
| RunwayPhotobooth | 예시의 AI 변환 제목과 실제 런웨이 조명 적용 주장을 사진 색 보정/표지 구성으로 바꿨다. |
| VoiceLab | 결과 본문의 AI 설명은 유효한 생성 결과가 있을 때만 나타나는 것을 확인했다. 추가 변경 없음. |
| AuraReading | 기분/빛 선택을 색으로 표현한 작품임을 이미 밝히고 AI 성공 주장을 무조건 표시하지 않는다. 추가 변경 없음. |
| HeritageTimemachine | 생성 사진/해설 문구에 AI 결과 조건이 있는 것을 확인했다. 추가 리뷰에서 역사 참고 링크 앞의 ‘장면과 인물은 AI 창작’ 문구도 실제 AI 생성 여부로 나눴다. |
| HistoryTravel | 생성 사진과 이야기 설명에 AI 결과 조건이 있는 것을 확인했다. 추가 변경 없음. |
| WeddingBooth | 생성 웨딩 사진 안내에 `photo.ai` 조건이 있는 것을 확인했다. 추가 변경 없음. |

공통 `ResultShell`의 예시 배지·설명 분기 외에도 데모 안쪽의 상세 구성과 출력 문구가 생성 성공을 잘못 주장하지 않도록 감사했다. 서비스명에 들어간 ‘AI’는 기능명으로 유지했다.

공통 코드 독립 리뷰 중 발견한 `VisionWallDemo.tsx`의 화면·출력물 키워드 제목도 실제 생성 여부에 따라 ‘AI가 읽어낸 키워드’/‘내 문장에서 고른 예시 키워드’로 분리했다.

## 검증과 증거

- 수정 전 10종의 첫 선택 전체 흐름을 실행했고 10/10 통과했다. 사진은 샘플을 사용하고 API는 503 예시 응답으로 고정했다. 원본 소스와 스크린샷: `.playwright-mcp/demo-review-photo-before/`, 보고서: `flow-report-1440-before.json`.
- 수정 후 같은 10종의 전체 흐름, 결과 탭, 출력물 다운로드를 확인했다. 첫 실행에서 8/10 통과했고, 작업 중 공통 컴포넌트 import 컴파일과 겹친 한복/MV 2종은 재실행해 2/2 통과했다. 스크린샷과 결과 텍스트: `.playwright-mcp/demo-review-photo-after/`. 첫 실행 로그: `/tmp/demo-review-photo-after0.log`; 재실행 로그: `/tmp/demo-review-photo-after-rerun.log`.
- 추가 API 응답 검증: MV와 메모리 무비에 116 BPM을 응답하도록 주입해도 화면은 선택한 124/112 BPM을 유지했다. 미래 가족은 6개 특징에 모두 50을 응답하도록 주입하고 혼합값 보정을 확인했다. 나머지 7종은 API 실패 흐름을 확인했다. 실제 유료 모델 호출 결과를 보장하는 테스트는 아니다.
- `tests/unit/demo-photo.test.ts`: 국내 후보 10개 조합, 100개 시드의 균일 가족값 보정, 유효한 응답 보존 및 NaN/Infinity 방어 총 3개 테스트 통과.
- 최종 코드 상태에서 `npx tsc --noEmit --pretty false`와 담당 데모 23종·관련 데이터/스펙·새 단위 테스트 대상 ESLint가 모두 통과했다.
- 두 가지 다른 선택 및 모바일을 포함한 최종 공통 E2E는 별도 `tests/e2e` 전체 스위트에서 실행한다. 이 문서의 독립 실행은 각 데모 첫 선택 한 흐름에 대한 기록이다.
