/* ─────────────────────────────────────────────────────────
   실제 체험 프로그램 화면 (행사장 기기에서 도는 프로그램을 끝까지 진행해 캡처한 것)
   scripts/redesign/onsite-assets.py 가 output/onsite-assets 에서 골라 만든다 — 직접 고치지 말 것.

   · 화면 속 인물은 AI 로 만든 가상 예시 인물이다. 실제 행사 사진(experience-photos.ts · 포트폴리오)과 섞어 쓰지 않는다.
   · 장면 3장(ONSITE_SCENES)은 실물을 참고한 생성 이미지라 「체험 콘셉트 이미지」 표시를 붙인다.
   · 기기 스펙은 확인된 것만: 키오스크 = 세로 터치 화면 · 웹캠 · 80mm 영수증 프린터(결과 QR 24시간 보관),
     포토부스 = 가로 화면 · DSLR 카메라 · 4×6 사진 프린터 · 조명(결과 QR 7일 보관).
   ───────────────────────────────────────────────────────── */

export type OnsiteDevice = 'kiosk' | 'booth';
export type OnsiteStepKind = 'start' | 'guide' | 'input' | 'camera' | 'confirm' | 'loading' | 'result' | 'receipt' | 'phone';

export interface OnsiteFlow {
  device: OnsiteDevice;
  /** 첫 화면 */
  start: string;
  /** 결과 화면 (없으면 대표 그림으로 쓰지 않는다) */
  result?: string;
  /** 상세 페이지 단계 화면 — 공개된 체험만 */
  steps: { kind: OnsiteStepKind; src: string }[];
  /** QR 로 연 휴대폰 받기 페이지 */
  phone?: string;
  /** 80mm 영수증 */
  receipt?: string;
  /** 포토부스 4×6 인화 디자인 2종 */
  prints?: string[];
}

export const ONSITE_STEP_LABELS: Record<OnsiteStepKind, { ko: string; en: string }> = {
  "start": {
    "ko": "시작",
    "en": "Start"
  },
  "guide": {
    "ko": "체험 안내",
    "en": "How it works"
  },
  "input": {
    "ko": "질문 · 선택",
    "en": "Choose"
  },
  "camera": {
    "ko": "촬영",
    "en": "Photo"
  },
  "confirm": {
    "ko": "사진 확인",
    "en": "Check photo"
  },
  "loading": {
    "ko": "AI 생성",
    "en": "AI at work"
  },
  "result": {
    "ko": "결과",
    "en": "Result"
  },
  "receipt": {
    "ko": "영수증 출력",
    "en": "Receipt print"
  },
  "phone": {
    "ko": "휴대폰으로 받기",
    "en": "Send to phone"
  }
};

export const ONSITE_SCENES = {
  kiosk: '/images/services/onsite/scene-kiosk.webp',
  booth: '/images/services/onsite/scene-booth.webp',
  phone: '/images/services/onsite/scene-phone.webp',
} as const;

export const ONSITE_FLOWS: Record<string, OnsiteFlow> = {
  "ai-personal-color": {
    "device": "kiosk",
    "steps": [
      {
        "kind": "start",
        "src": "/images/services/onsite/ai-personal-color/start.webp"
      },
      {
        "kind": "camera",
        "src": "/images/services/onsite/ai-personal-color/action.webp"
      },
      {
        "kind": "loading",
        "src": "/images/services/onsite/ai-personal-color/loading.webp"
      },
      {
        "kind": "result",
        "src": "/images/services/onsite/ai-personal-color/result.webp"
      }
    ],
    "start": "/images/services/onsite/ai-personal-color/start.webp",
    "result": "/images/services/onsite/ai-personal-color/result.webp",
    "receipt": "/images/services/onsite/ai-personal-color/receipt.webp"
  },
  "ai-skincare-analysis": {
    "device": "kiosk",
    "steps": [
      {
        "kind": "start",
        "src": "/images/services/onsite/ai-skincare-analysis/start.webp"
      },
      {
        "kind": "input",
        "src": "/images/services/onsite/ai-skincare-analysis/action.webp"
      },
      {
        "kind": "input",
        "src": "/images/services/onsite/ai-skincare-analysis/choose.webp"
      },
      {
        "kind": "result",
        "src": "/images/services/onsite/ai-skincare-analysis/result.webp"
      },
      {
        "kind": "phone",
        "src": "/images/services/onsite/ai-skincare-analysis/send.webp"
      }
    ],
    "start": "/images/services/onsite/ai-skincare-analysis/start.webp",
    "result": "/images/services/onsite/ai-skincare-analysis/result.webp",
    "phone": "/images/services/onsite/ai-skincare-analysis/phone.webp"
  },
  "ai-virtual-makeup": {
    "device": "kiosk",
    "steps": [],
    "start": "/images/services/onsite/ai-virtual-makeup/start.webp",
    "result": "/images/services/onsite/ai-virtual-makeup/result.webp"
  },
  "ai-nail-designer": {
    "device": "kiosk",
    "steps": [],
    "start": "/images/services/onsite/ai-nail-designer/start.webp",
    "result": "/images/services/onsite/ai-nail-designer/result.webp"
  },
  "ai-sommelier": {
    "device": "kiosk",
    "steps": [
      {
        "kind": "start",
        "src": "/images/services/onsite/ai-sommelier/start.webp"
      },
      {
        "kind": "camera",
        "src": "/images/services/onsite/ai-sommelier/action.webp"
      },
      {
        "kind": "loading",
        "src": "/images/services/onsite/ai-sommelier/loading.webp"
      },
      {
        "kind": "result",
        "src": "/images/services/onsite/ai-sommelier/result.webp"
      },
      {
        "kind": "phone",
        "src": "/images/services/onsite/ai-sommelier/send.webp"
      }
    ],
    "start": "/images/services/onsite/ai-sommelier/start.webp",
    "result": "/images/services/onsite/ai-sommelier/result.webp",
    "phone": "/images/services/onsite/ai-sommelier/phone.webp"
  },
  "ai-barista-matching": {
    "device": "kiosk",
    "steps": [],
    "start": "/images/services/onsite/ai-barista-matching/start.webp",
    "result": "/images/services/onsite/ai-barista-matching/result.webp"
  },
  "ai-taste-dna": {
    "device": "kiosk",
    "steps": [],
    "start": "/images/services/onsite/ai-taste-dna/start.webp",
    "result": "/images/services/onsite/ai-taste-dna/result.webp"
  },
  "ai-style-profiler": {
    "device": "kiosk",
    "steps": [
      {
        "kind": "start",
        "src": "/images/services/onsite/ai-style-profiler/start.webp"
      },
      {
        "kind": "camera",
        "src": "/images/services/onsite/ai-style-profiler/action.webp"
      },
      {
        "kind": "loading",
        "src": "/images/services/onsite/ai-style-profiler/loading.webp"
      },
      {
        "kind": "result",
        "src": "/images/services/onsite/ai-style-profiler/result.webp"
      },
      {
        "kind": "phone",
        "src": "/images/services/onsite/ai-style-profiler/send.webp"
      }
    ],
    "start": "/images/services/onsite/ai-style-profiler/start.webp",
    "result": "/images/services/onsite/ai-style-profiler/result.webp",
    "phone": "/images/services/onsite/ai-style-profiler/phone.webp"
  },
  "ai-celeb-lookalike": {
    "device": "kiosk",
    "steps": [
      {
        "kind": "start",
        "src": "/images/services/onsite/ai-celeb-lookalike/start.webp"
      },
      {
        "kind": "camera",
        "src": "/images/services/onsite/ai-celeb-lookalike/action.webp"
      },
      {
        "kind": "loading",
        "src": "/images/services/onsite/ai-celeb-lookalike/loading.webp"
      },
      {
        "kind": "result",
        "src": "/images/services/onsite/ai-celeb-lookalike/result.webp"
      },
      {
        "kind": "phone",
        "src": "/images/services/onsite/ai-celeb-lookalike/send.webp"
      }
    ],
    "start": "/images/services/onsite/ai-celeb-lookalike/start.webp",
    "result": "/images/services/onsite/ai-celeb-lookalike/result.webp"
  },
  "ai-future-career": {
    "device": "kiosk",
    "steps": [
      {
        "kind": "start",
        "src": "/images/services/onsite/ai-future-career/start.webp"
      },
      {
        "kind": "input",
        "src": "/images/services/onsite/ai-future-career/action.webp"
      },
      {
        "kind": "loading",
        "src": "/images/services/onsite/ai-future-career/loading.webp"
      },
      {
        "kind": "result",
        "src": "/images/services/onsite/ai-future-career/result.webp"
      }
    ],
    "start": "/images/services/onsite/ai-future-career/start.webp",
    "result": "/images/services/onsite/ai-future-career/result.webp"
  },
  "ai-science-kiosk": {
    "device": "kiosk",
    "steps": [],
    "start": "/images/services/onsite/ai-science-kiosk/start.webp",
    "result": "/images/services/onsite/ai-science-kiosk/result.webp"
  },
  "ai-face-reading": {
    "device": "kiosk",
    "steps": [
      {
        "kind": "start",
        "src": "/images/services/onsite/ai-face-reading/start.webp"
      },
      {
        "kind": "camera",
        "src": "/images/services/onsite/ai-face-reading/action.webp"
      },
      {
        "kind": "loading",
        "src": "/images/services/onsite/ai-face-reading/loading.webp"
      },
      {
        "kind": "result",
        "src": "/images/services/onsite/ai-face-reading/result.webp"
      },
      {
        "kind": "phone",
        "src": "/images/services/onsite/ai-face-reading/send.webp"
      }
    ],
    "start": "/images/services/onsite/ai-face-reading/start.webp",
    "result": "/images/services/onsite/ai-face-reading/result.webp",
    "phone": "/images/services/onsite/ai-face-reading/phone.webp"
  },
  "ai-palm-reading": {
    "device": "kiosk",
    "steps": [
      {
        "kind": "start",
        "src": "/images/services/onsite/ai-palm-reading/start.webp"
      },
      {
        "kind": "camera",
        "src": "/images/services/onsite/ai-palm-reading/action.webp"
      },
      {
        "kind": "loading",
        "src": "/images/services/onsite/ai-palm-reading/loading.webp"
      },
      {
        "kind": "result",
        "src": "/images/services/onsite/ai-palm-reading/result.webp"
      },
      {
        "kind": "phone",
        "src": "/images/services/onsite/ai-palm-reading/send.webp"
      }
    ],
    "start": "/images/services/onsite/ai-palm-reading/start.webp",
    "result": "/images/services/onsite/ai-palm-reading/result.webp",
    "phone": "/images/services/onsite/ai-palm-reading/phone.webp"
  },
  "ai-caricature-artist": {
    "device": "kiosk",
    "steps": [
      {
        "kind": "start",
        "src": "/images/services/onsite/ai-caricature-artist/start.webp"
      },
      {
        "kind": "camera",
        "src": "/images/services/onsite/ai-caricature-artist/action.webp"
      },
      {
        "kind": "loading",
        "src": "/images/services/onsite/ai-caricature-artist/loading.webp"
      },
      {
        "kind": "result",
        "src": "/images/services/onsite/ai-caricature-artist/result.webp"
      },
      {
        "kind": "phone",
        "src": "/images/services/onsite/ai-caricature-artist/send.webp"
      }
    ],
    "start": "/images/services/onsite/ai-caricature-artist/start.webp",
    "result": "/images/services/onsite/ai-caricature-artist/result.webp",
    "phone": "/images/services/onsite/ai-caricature-artist/phone.webp"
  },
  "ai-aura-reading": {
    "device": "kiosk",
    "steps": [],
    "start": "/images/services/onsite/ai-aura-reading/start.webp",
    "result": "/images/services/onsite/ai-aura-reading/result.webp"
  },
  "ai-team-chemistry": {
    "device": "kiosk",
    "steps": [],
    "start": "/images/services/onsite/ai-team-chemistry/start.webp",
    "result": "/images/services/onsite/ai-team-chemistry/result.webp"
  },
  "ai-travel-style": {
    "device": "kiosk",
    "steps": [],
    "start": "/images/services/onsite/ai-travel-style/start.webp",
    "result": "/images/services/onsite/ai-travel-style/result.webp"
  },
  "ai-couple-chemistry": {
    "device": "kiosk",
    "steps": [
      {
        "kind": "start",
        "src": "/images/services/onsite/ai-couple-chemistry/start.webp"
      },
      {
        "kind": "camera",
        "src": "/images/services/onsite/ai-couple-chemistry/action.webp"
      },
      {
        "kind": "loading",
        "src": "/images/services/onsite/ai-couple-chemistry/loading.webp"
      },
      {
        "kind": "result",
        "src": "/images/services/onsite/ai-couple-chemistry/result.webp"
      },
      {
        "kind": "phone",
        "src": "/images/services/onsite/ai-couple-chemistry/send.webp"
      }
    ],
    "start": "/images/services/onsite/ai-couple-chemistry/start.webp",
    "result": "/images/services/onsite/ai-couple-chemistry/result.webp",
    "phone": "/images/services/onsite/ai-couple-chemistry/phone.webp"
  },
  "ai-runway-photobooth": {
    "device": "booth",
    "steps": [],
    "start": "/images/services/onsite/ai-runway-photobooth/start.webp",
    "result": "/images/services/onsite/ai-runway-photobooth/result.webp",
    "prints": [
      "/images/services/onsite/ai-runway-photobooth/print-0.webp",
      "/images/services/onsite/ai-runway-photobooth/print-1.webp"
    ]
  },
  "ai-fashion-timemachine": {
    "device": "booth",
    "steps": [
      {
        "kind": "start",
        "src": "/images/services/onsite/ai-fashion-timemachine/start.webp"
      },
      {
        "kind": "camera",
        "src": "/images/services/onsite/ai-fashion-timemachine/action.webp"
      },
      {
        "kind": "loading",
        "src": "/images/services/onsite/ai-fashion-timemachine/loading.webp"
      },
      {
        "kind": "result",
        "src": "/images/services/onsite/ai-fashion-timemachine/result.webp"
      },
      {
        "kind": "phone",
        "src": "/images/services/onsite/ai-fashion-timemachine/send.webp"
      }
    ],
    "start": "/images/services/onsite/ai-fashion-timemachine/start.webp",
    "result": "/images/services/onsite/ai-fashion-timemachine/result.webp",
    "phone": "/images/services/onsite/ai-fashion-timemachine/phone.webp",
    "prints": [
      "/images/services/onsite/ai-fashion-timemachine/print-0.webp",
      "/images/services/onsite/ai-fashion-timemachine/print-1.webp"
    ]
  },
  "ai-idol-makeup-booth": {
    "device": "booth",
    "steps": [
      {
        "kind": "start",
        "src": "/images/services/onsite/ai-idol-makeup-booth/start.webp"
      },
      {
        "kind": "camera",
        "src": "/images/services/onsite/ai-idol-makeup-booth/action.webp"
      },
      {
        "kind": "loading",
        "src": "/images/services/onsite/ai-idol-makeup-booth/loading.webp"
      },
      {
        "kind": "result",
        "src": "/images/services/onsite/ai-idol-makeup-booth/result.webp"
      },
      {
        "kind": "phone",
        "src": "/images/services/onsite/ai-idol-makeup-booth/send.webp"
      }
    ],
    "start": "/images/services/onsite/ai-idol-makeup-booth/start.webp",
    "result": "/images/services/onsite/ai-idol-makeup-booth/result.webp",
    "phone": "/images/services/onsite/ai-idol-makeup-booth/phone.webp",
    "prints": [
      "/images/services/onsite/ai-idol-makeup-booth/print-0.webp",
      "/images/services/onsite/ai-idol-makeup-booth/print-1.webp"
    ]
  },
  "ai-fan-photocard": {
    "device": "booth",
    "steps": [],
    "start": "/images/services/onsite/ai-fan-photocard/start.webp",
    "result": "/images/services/onsite/ai-fan-photocard/result.webp",
    "prints": [
      "/images/services/onsite/ai-fan-photocard/print-0.webp",
      "/images/services/onsite/ai-fan-photocard/print-1.webp"
    ]
  },
  "ai-graduation-booth": {
    "device": "booth",
    "steps": [],
    "start": "/images/services/onsite/ai-graduation-booth/start.webp",
    "result": "/images/services/onsite/ai-graduation-booth/result.webp",
    "prints": [
      "/images/services/onsite/ai-graduation-booth/print-0.webp",
      "/images/services/onsite/ai-graduation-booth/print-1.webp"
    ]
  },
  "ai-history-travel": {
    "device": "booth",
    "steps": [],
    "start": "/images/services/onsite/ai-history-travel/start.webp",
    "result": "/images/services/onsite/ai-history-travel/result.webp",
    "prints": [
      "/images/services/onsite/ai-history-travel/print-0.webp",
      "/images/services/onsite/ai-history-travel/print-1.webp"
    ]
  },
  "ai-timecapsule-photo": {
    "device": "booth",
    "steps": [
      {
        "kind": "start",
        "src": "/images/services/onsite/ai-timecapsule-photo/start.webp"
      },
      {
        "kind": "camera",
        "src": "/images/services/onsite/ai-timecapsule-photo/action.webp"
      },
      {
        "kind": "input",
        "src": "/images/services/onsite/ai-timecapsule-photo/choose.webp"
      },
      {
        "kind": "result",
        "src": "/images/services/onsite/ai-timecapsule-photo/result.webp"
      },
      {
        "kind": "phone",
        "src": "/images/services/onsite/ai-timecapsule-photo/send.webp"
      }
    ],
    "start": "/images/services/onsite/ai-timecapsule-photo/start.webp",
    "result": "/images/services/onsite/ai-timecapsule-photo/result.webp",
    "phone": "/images/services/onsite/ai-timecapsule-photo/phone.webp",
    "prints": [
      "/images/services/onsite/ai-timecapsule-photo/print-0.webp",
      "/images/services/onsite/ai-timecapsule-photo/print-1.webp"
    ]
  },
  "ai-brand-avatar": {
    "device": "booth",
    "steps": [],
    "start": "/images/services/onsite/ai-brand-avatar/start.webp",
    "result": "/images/services/onsite/ai-brand-avatar/result.webp",
    "prints": [
      "/images/services/onsite/ai-brand-avatar/print-0.webp",
      "/images/services/onsite/ai-brand-avatar/print-1.webp"
    ]
  },
  "ai-hanbok-booth": {
    "device": "booth",
    "steps": [],
    "start": "/images/services/onsite/ai-hanbok-booth/start.webp",
    "result": "/images/services/onsite/ai-hanbok-booth/result.webp",
    "prints": [
      "/images/services/onsite/ai-hanbok-booth/print-0.webp",
      "/images/services/onsite/ai-hanbok-booth/print-1.webp"
    ]
  },
  "ai-traditional-painter": {
    "device": "booth",
    "steps": [],
    "start": "/images/services/onsite/ai-traditional-painter/start.webp",
    "result": "/images/services/onsite/ai-traditional-painter/result.webp",
    "prints": [
      "/images/services/onsite/ai-traditional-painter/print-0.webp",
      "/images/services/onsite/ai-traditional-painter/print-1.webp"
    ]
  },
  "ai-wedding-booth": {
    "device": "booth",
    "steps": [],
    "start": "/images/services/onsite/ai-wedding-booth/start.webp"
  },
  "ai-future-family": {
    "device": "booth",
    "steps": [
      {
        "kind": "start",
        "src": "/images/services/onsite/ai-future-family/start.webp"
      },
      {
        "kind": "camera",
        "src": "/images/services/onsite/ai-future-family/action.webp"
      },
      {
        "kind": "loading",
        "src": "/images/services/onsite/ai-future-family/loading.webp"
      }
    ],
    "start": "/images/services/onsite/ai-future-family/start.webp"
  }
};

export function getOnsiteFlow(slug: string): OnsiteFlow | undefined {
  return ONSITE_FLOWS[slug];
}
