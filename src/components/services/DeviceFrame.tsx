import Image from 'next/image';
import type { ReactNode, Ref } from 'react';
import { cn } from '@/lib/utils';
import { LazyVideo } from '@/components/fx/LazyVideo';
import './onsite.css';

/* ─────────────────────────────────────────────────────────
   기기 정면 그림 (CSS 로만 그린다) + 화면 자리에 실제 프로그램 캡처.
   비율은 매장 키오스크 · 포토부스 실물 사진에서 잰 값이다 (onsite.css).
   screens 를 여러 장 주고 active 를 바꾸면 화면이 겹쳐 넘어간다.
   ───────────────────────────────────────────────────────── */

/** video 가 있으면 그 칸은 영상(소리 없음 · 반복)으로 틀고, src 는 영상이 뜨기 전 포스터가 된다 */
export interface Screen { src: string; alt?: string; video?: string; loop?: boolean }

interface ScreenProps {
  screens: Screen[];
  /** 켜진 칸이 영상일 때 그 영상 요소 (DeviceFlow 가 재생 위치를 읽는다) */
  videoRef?: Ref<HTMLVideoElement>;
  active: number;
  sizes: string;
  priority?: boolean;
}

function Screens({ screens, active, sizes, priority, videoRef }: ScreenProps) {
  return (
    <>
      {screens.map((s, i) => s.video ? (
        // 영상은 켜진 칸만 불러와 튼다 — 꺼진 칸은 포스터만 둔다
        i === active ? (
          <LazyVideo key={`${i}-${s.video}`} ref={videoRef} className="os-screen-img" data-on="" src={s.video} poster={s.src} loop={s.loop ?? true} aria-label={s.alt} />
        ) : (
          <Image key={`${i}-${s.src}`} src={s.src} alt="" fill sizes={sizes} className="os-screen-img" loading="lazy" />
        )
      ) : (
        <Image
          key={`${i}-${s.src}`}
          src={s.src}
          alt={i === active ? s.alt ?? '' : ''}
          fill
          sizes={sizes}
          className="os-screen-img"
          data-on={i === active ? '' : undefined}
          priority={priority && i === 0}
          loading={priority && i === 0 ? undefined : 'lazy'}
        />
      ))}
    </>
  );
}

/* sizes: 카드 속 작은 기기처럼 화면이 작게 들어갈 때 그 크기에 맞는 그림을 받도록 넘긴다 */
export function KioskFrame({ screens, active = 0, receipt, receiptOut = false, className, priority, sizes = '(min-width: 1024px) 320px, 62vw', videoRef }: { screens: ScreenProps['screens']; active?: number; receipt?: string; receiptOut?: boolean; className?: string; priority?: boolean; sizes?: string; videoRef?: Ref<HTMLVideoElement> }) {
  return (
    <span className={cn('os-kiosk', className)}>
      <span className="os-kiosk-cam" aria-hidden="true"><i /></span>
      <span className="os-kiosk-body">
        <span className="os-kiosk-screen os-glass">
          <Screens screens={screens} active={active} sizes={sizes} priority={priority} videoRef={videoRef} />
        </span>
        <span className="os-kiosk-panel" aria-hidden="true"><i /></span>
      </span>
      {/* 몸체는 아래가 흐려지는 mask 라 그 안에 두면 잘린다 — 영수증은 기기 상자에 두고 출력구 위치에 맞춘다 */}
      {/* 영수증은 출력 단계에서만 그린다 — 스타일이 늦게 와도(브라우저 캐시 등) 미리 크게 보이지 않게
          크기 · 위치는 style 로도 박아 둔다 */}
      {receipt && receiptOut && (
        <span className="os-receipt-feed" aria-hidden="true" style={{ position: 'absolute', top: '186.2cqw', left: '18cqw', width: '19cqw', overflow: 'hidden' }}>
          <Image src={receipt} alt="" width={320} height={900} sizes="120px" style={{ display: 'block', width: '100%', height: 'auto' }} />
        </span>
      )}
    </span>
  );
}

export function BoothFrame({ screens, active = 0, print, printOut = false, className, priority, sizes = '(min-width: 1024px) 560px, 88vw', videoRef }: { screens: ScreenProps['screens']; active?: number; print?: string; printOut?: boolean; className?: string; priority?: boolean; sizes?: string; videoRef?: Ref<HTMLVideoElement> }) {
  return (
    <span className={cn('os-booth', className)}>
      <span className="os-booth-body">
        <span className="os-booth-cam" aria-hidden="true"><i /></span>
        <span className="os-booth-screen os-glass">
          <Screens screens={screens} active={active} sizes={sizes} priority={priority} videoRef={videoRef} />
        </span>
        <span className="os-booth-slot" aria-hidden="true"><i /></span>
        {print && (
          <span className="os-booth-print" data-out={printOut ? '' : undefined} aria-hidden="true">
            <Image src={print} alt="" fill sizes="140px" className="object-cover" />
          </span>
        )}
      </span>
    </span>
  );
}

export function PhoneFrame({ src, alt, className, children }: { src: string; alt: string; className?: string; children?: ReactNode }) {
  return (
    // 모양에 꼭 필요한 값은 style 로도 둔다 — 스타일 파일이 늦게 오거나 브라우저에 옛것이 남아 있어도 휴대폰이 사라지지 않게
    <span className={cn('os-iphone', className)} style={{ position: 'relative', display: 'block', aspectRatio: '71.5 / 147.5', borderRadius: '15.5% / 7.2%', background: '#1f2024' }}>
      <span className="os-iphone-screen" style={{ position: 'absolute', inset: '1.55% 3.4%', display: 'block', overflow: 'hidden', borderRadius: '12.5% / 5.6%', background: '#000' }}>
        <Image src={src} alt={alt} fill sizes="240px" />
        {children}
      </span>
    </span>
  );
}
