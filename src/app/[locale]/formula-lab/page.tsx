import { FormulaLab } from '@/components/formula-lab/FormulaLab';

export const metadata = {
  title: 'AI Formula Lab | 감성 기반 향 레시피 설계',
  description: 'AI 기반 감성 분석과 향료 배합 자동 설계 시스템. 감성 브리프 하나로 최적의 향 레시피를 생성합니다.',
};

export default function FormulaLabPage() {
  // 숨은 실험 페이지 — 2026-11 어두운 테마를 적용하지 않고 원래 색 그대로 둔다
  return <div className="theme-original bg-white text-neutral-900"><FormulaLab /></div>;
}
