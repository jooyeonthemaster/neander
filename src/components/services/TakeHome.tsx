import Image from 'next/image';
import type { OnsiteFlow } from '@/data/onsite-flows';
import type { VideoFlow } from '@/data/program-previews';
import { Reveal, Tilt } from '@/components/fx';
import { PhoneFrame } from './DeviceFrame';

/* 손님이 받아 가는 것 — 포토부스: 4×6 인화 2종 · 휴대폰 받기 / 키오스크: 영수증 · 휴대폰 받기.
   스펙 문구는 확인된 것만 쓴다 (onsite-flows.ts 머리말). */

export function TakeHome({ flow, lang }: { flow: OnsiteFlow | VideoFlow; lang: 'ko' | 'en' }) {
  const ko = lang === 'ko';
  const card = 'card' in flow ? flow.card : undefined;
  const hasPrints = !card && (flow.prints?.length ?? 0) > 0;
  if (!card && !hasPrints && !flow.receipt && !flow.phone) return null;

  return (
    <div className="grid gap-x-10 gap-y-14 sm:grid-cols-2 lg:flex lg:items-end lg:gap-[clamp(2.5rem,6vw,6rem)]">
      {/* 접는 카드 한 장 (SAJU! 등) — 인화가 주인공이라 크게 */}
      {card && (
        <Reveal className="sm:col-span-2">
          <Tilt max={7} className="w-[min(86vw,34rem)] -rotate-1">
            <Image src={card} alt={ko ? '인화한 4×6 사주 카드 — 왼쪽은 AI 초상, 오른쪽은 사주 풀이' : 'A printed 4×6 fortune card — AI portrait on the left, reading on the right'} width={1200} height={800} className="os-paper" />
          </Tilt>
          <p className="mt-6 text-lg font-bold tracking-[-0.02em] text-paper">{ko ? '4×6 사진 인화' : '4×6 photo print'}</p>
          <p className="mt-1 text-sm text-paper/55">{ko ? '그 자리에서 인화해 반으로 접어 세우는 카드로 건넵니다' : 'Printed on the spot and handed over as a fold-and-stand card'}</p>
        </Reveal>
      )}
      {hasPrints && (
        <Reveal className="sm:col-span-2">
          <div className="flex items-end gap-4 lg:gap-6">
            {flow.prints!.map((src, i) => (
              <Tilt key={src} max={9} className={i === 1 ? 'w-[min(38vw,13rem)] -rotate-2 lg:mb-6' : 'w-[min(38vw,13rem)] rotate-2'}>
                <Image src={src} alt={ko ? `4×6 인화 디자인 ${i + 1}` : `4×6 print design ${i + 1}`} width={416} height={624} className="os-paper" />
              </Tilt>
            ))}
          </div>
          <p className="mt-6 text-lg font-bold tracking-[-0.02em] text-paper">{ko ? '4×6 인화 사진' : '4×6 photo print'}</p>
          <p className="mt-1 text-sm text-paper/55">{ko ? '디자인 2종 중에서 손님이 고릅니다' : 'Guests choose between two designs'}</p>
        </Reveal>
      )}
      {flow.receipt && (
        <Reveal delay={90}>
          {/* 긴 영수증은 윗부분만 보이고 아래로 흐려진다 */}
          <Tilt max={7} className="max-h-[23rem] w-[min(46vw,12.5rem)] overflow-hidden bg-snow [mask-image:linear-gradient(to_bottom,black_80%,transparent)]">
            <Image src={flow.receipt} alt={ko ? '80mm 영수증형 결과지' : '80mm receipt-style result'} width={320} height={900} className="os-paper os-receipt" />
          </Tilt>
          <p className="mt-6 text-lg font-bold tracking-[-0.02em] text-paper">{ko ? '영수증형 결과지' : 'Receipt-style result'}</p>
          <p className="mt-1 text-sm text-paper/55">{ko ? '키오스크에 내장된 80mm 프린터로 바로 출력' : 'Printed on the kiosk’s built-in 80mm printer'}</p>
        </Reveal>
      )}
      {flow.phone && (
        <Reveal delay={160}>
          <PhoneFrame src={flow.phone} alt={ko ? 'QR로 연 휴대폰 받기 페이지' : 'Phone download page opened from the QR code'} className="!w-[min(40vw,11rem)]" />
          <p className="mt-6 text-lg font-bold tracking-[-0.02em] text-paper">{card ? (ko ? '휴대폰으로도 저장' : 'Also saved to phone') : ko ? '휴대폰으로 받기' : 'Send to phone'}</p>
          <p className="mt-1 text-sm text-paper/55">
            {flow.device === 'booth'
              ? (ko ? 'QR로 열어 저장 · 7일 보관' : 'Open by QR and save · kept for 7 days')
              : (ko ? 'QR로 열어 저장 · 24시간 보관' : 'Open by QR and save · kept for 24 hours')}
          </p>
        </Reveal>
      )}
    </div>
  );
}
