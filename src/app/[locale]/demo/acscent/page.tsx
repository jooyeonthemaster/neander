import { AcscentDemo } from '@/components/demo/acscent/AcscentDemo';

export const metadata = {
  title: "A C'SCENT | 후각 인지 유형 검사",
  description: '6종의 시향지로 알아보는 나만의 후각 인지 유형. 16가지 유형 중 당신은?',
};

export default function AcscentPage() {
  return (
    <section className="min-h-screen bg-neutral-950">
      <AcscentDemo />
    </section>
  );
}
