# 견적 미리보기 벡터 에셋

`public/images/quote-preview/vector/`에 편집 가능한 독립 SVG 19개를 제공합니다. 실제 미리보기와 같은 React SVG 도형을 내보내므로 색상과 형태를 함께 관리할 수 있습니다. 사진·PNG·WebP·외부 폰트는 포함하지 않습니다.

| 파일 | 구성 |
| --- | --- |
| `kiosk.svg` | 세로형 키오스크, 외장 카메라, 은색 전면 띠, 별도 받침대 |
| `perfume-{10ml,50ml}-{none,brand,custom}.svg` | 용량과 포장별 6종 |
| `team-{1,2,3,4}.svg` | 조향사 1명과 보조 1명으로 구성한 4종 |
| `perfumery-counter.svg` | 조향 테이블, 원료 진열대, 시향 도구 |
| `receipt-printer.svg` | 영수증형 프린터 |
| `photo-booth.svg`, `photo-booth-wrapped.svg` | 사각형 포토부스와 브랜드 래핑 예시 |
| `plant.svg` | 공간 연출용 화분 |
| `portrait-{source,ready,custom}.svg` | 변환 전·기존 스타일·맞춤 스타일 예시 |

`manifest.json`에는 공개 URL, 이름, 크기, 바닥 기준점, SHA-256, 원본 컴포넌트 해시가 들어 있습니다. 개인 경로와 생성 프롬프트는 기록하지 않습니다.

## 다시 내보내기

```bash
npx tsx scripts/export-quote-illustrations.tsx
```

도형을 수정할 때는 `src/components/quote-preview/illustrations/VectorPrimitives.tsx`를 수정하고 위 명령을 실행합니다. 자동 생성한 SVG를 직접 수정하면 다음 실행에서 덮어씁니다.

## 배치 규칙

- 모든 도형의 `(0, 0)`은 바닥에 닿는 중심입니다. 앱에서는 `x`, `y`, `scale`로 배치합니다.
- `viewBox`에는 선과 접지 그림자를 위한 여백이 있습니다. `manifest.json`의 `anchor.canvasX`, `anchor.canvasY`가 이미지 캔버스 안의 바닥 위치입니다.
- 향수 6종은 같은 캔버스를 사용하므로 옵션을 바꿔도 제품의 기준 높이를 유지합니다.
- 크기는 SVG 좌표이며 실측 치수가 아닙니다. 한 장면의 여러 기기는 같은 배율로 그립니다.
- 프레임 배경은 투명합니다. 기본 장면 배경색은 `#f7f5f0`입니다.

주요 색상은 청록 `#22969b`, 연청록 `#bfe3df`, 남색 `#263b45`, 코럴 `#ed997a`, 황토색 `#d7ae5d`입니다. 오른쪽 면을 약간 높여 깊이를 표현하고, 과도한 광택이나 사진 질감을 사용하지 않습니다.

6종 상품의 전체 장면은 옵션에 따라 달라지는 `ServiceIllustration`, `SpaceIllustration`, `PerfumeScene`, `KioskScene` 컴포넌트에서 구성합니다. 내보낸 파일은 그 장면을 이루는 재사용 에셋입니다.
