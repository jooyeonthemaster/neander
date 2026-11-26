import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/* 체험 데모는 실제 기기 화면을 흉내 낸 화면이라 2026-11 어두운 테마를 적용하지 않고 원래 색(theme-original) 그대로 둔다 */
export default function DemoLayout({ children }: { children: ReactNode }) {
  return <div className="theme-original bg-white text-neutral-900">{children}</div>;
}
