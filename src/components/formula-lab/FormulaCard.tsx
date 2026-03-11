'use client';

import { motion } from 'motion/react';
import { INGREDIENTS, type Formula } from '@/data/formula-lab-data';

// ─── Note Pyramid ─────────────────────────────────────────────────────
function NotePyramid({ formula }: { formula: Formula }) {
  const grouped = { top: [] as typeof formula.ingredients, middle: [] as typeof formula.ingredients, base: [] as typeof formula.ingredients };
  formula.ingredients.forEach(fi => {
    const ing = INGREDIENTS.find(i => i.id === fi.ingredientId);
    if (ing) grouped[ing.noteType].push(fi);
  });

  const layers = [
    { key: 'top' as const, label: 'TOP', color: 'bg-teal-100 text-teal-700 border-teal-200', width: 'w-[45%]' },
    { key: 'middle' as const, label: 'HEART', color: 'bg-teal-50 text-teal-600 border-teal-100', width: 'w-[70%]' },
    { key: 'base' as const, label: 'BASE', color: 'bg-neutral-50 text-neutral-600 border-neutral-100', width: 'w-[95%]' },
  ];

  return (
    <div className="flex flex-col items-center gap-1.5 py-2">
      {layers.map((layer, i) => (
        <motion.div
          key={layer.key}
          initial={{ opacity: 0, scaleX: 0.5 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.3 + i * 0.12 }}
          className={`${layer.width} ${layer.color} border rounded-lg px-4 py-3`}
        >
          <div className="text-[10px] font-bold tracking-[0.15em] mb-1.5 opacity-60">{layer.label}</div>
          <div className="flex flex-wrap gap-1.5">
            {grouped[layer.key].map(fi => {
              const ing = INGREDIENTS.find(i => i.id === fi.ingredientId);
              return (
                <span key={fi.ingredientId} className="text-xs font-medium">
                  {ing?.nameKo || fi.ingredientId}
                  <span className="opacity-50 ml-0.5">{fi.percentage}%</span>
                </span>
              );
            })}
            {grouped[layer.key].length === 0 && (
              <span className="text-xs opacity-40">—</span>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Ingredient Table ─────────────────────────────────────────────────
function IngredientTable({ formula }: { formula: Formula }) {
  return (
    <div className="overflow-hidden rounded-xl border border-neutral-100">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-neutral-50">
            <th className="text-left px-4 py-2.5 text-xs font-semibold text-neutral-400 tracking-wider uppercase">성분</th>
            <th className="text-left px-4 py-2.5 text-xs font-semibold text-neutral-400 tracking-wider uppercase">노트</th>
            <th className="text-left px-4 py-2.5 text-xs font-semibold text-neutral-400 tracking-wider uppercase">카테고리</th>
            <th className="text-right px-4 py-2.5 text-xs font-semibold text-neutral-400 tracking-wider uppercase">비율</th>
          </tr>
        </thead>
        <tbody>
          {formula.ingredients.map((fi, i) => {
            const ing = INGREDIENTS.find(ig => ig.id === fi.ingredientId);
            if (!ing) return null;
            const noteLabel = { top: 'T', middle: 'H', base: 'B' }[ing.noteType];
            const noteColor = {
              top: 'bg-teal-100 text-teal-700',
              middle: 'bg-blue-50 text-blue-600',
              base: 'bg-amber-50 text-amber-700',
            }[ing.noteType];
            return (
              <motion.tr
                key={fi.ingredientId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 + i * 0.04 }}
                className="border-t border-neutral-50 hover:bg-neutral-50/50 transition-colors"
              >
                <td className="px-4 py-2.5">
                  <div className="font-medium text-neutral-900">{ing.nameKo}</div>
                  <div className="text-xs text-neutral-400">{ing.name}</div>
                </td>
                <td className="px-4 py-2.5">
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-[10px] font-bold ${noteColor}`}>
                    {noteLabel}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-neutral-500">{ing.category}</td>
                <td className="px-4 py-2.5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-teal-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(fi.percentage * 3, 100)}%` }}
                        transition={{ delay: 0.3 + i * 0.04, duration: 0.5 }}
                      />
                    </div>
                    <span className="font-mono text-sm font-semibold text-neutral-800 w-12 text-right">
                      {fi.percentage}%
                    </span>
                  </div>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main Formula Card ────────────────────────────────────────────────
export function FormulaCard({
  formula, isSelected, onSelect,
}: {
  formula: Formula;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const sillageLabel = {
    intimate: '은은함', moderate: '적당함', strong: '강함', enormous: '매우 강함',
  }[formula.sillageRating];

  return (
    <motion.div
      layout
      className={`border rounded-2xl transition-all cursor-pointer ${
        isSelected
          ? 'border-teal-500 bg-white shadow-lg shadow-teal-500/5 ring-1 ring-teal-500/20'
          : 'border-neutral-200 bg-white hover:border-neutral-300'
      }`}
      onClick={onSelect}
    >
      {/* Header */}
      <div className="px-6 py-5 border-b border-neutral-100">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs text-teal-600 font-bold">{formula.id}</span>
              {isSelected && (
                <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">SELECTED</span>
              )}
            </div>
            <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-neutral-950">
              {formula.nameKo}
            </h3>
            <p className="text-sm text-neutral-500 mt-1 leading-relaxed">{formula.concept}</p>
          </div>
          <div className="text-right shrink-0 ml-4">
            <div className="text-3xl font-[family-name:var(--font-display)] font-bold text-teal-600">
              {formula.matchScore}
            </div>
            <div className="text-[10px] text-neutral-400 font-medium">MATCH SCORE</div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-4 divide-x divide-neutral-100 border-b border-neutral-100">
        {[
          { label: '예상 원가', value: `₩${Math.round(formula.estimatedCostPer10ml).toLocaleString()}`, sub: '/ 10ml' },
          { label: '지속력', value: `${formula.longevityHours}h`, sub: sillageLabel },
          { label: '안정성', value: `${formula.stabilityScore}`, sub: '/ 100' },
          { label: '독창성', value: `${formula.uniquenessIndex}`, sub: '/ 100' },
        ].map(m => (
          <div key={m.label} className="px-4 py-3 text-center">
            <div className="text-[10px] text-neutral-400 font-medium mb-0.5">{m.label}</div>
            <div className="text-sm font-bold text-neutral-950">{m.value}</div>
            <div className="text-[10px] text-neutral-300">{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Expanded Content */}
      {isSelected && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="px-6 py-6 space-y-6">
            {/* Note Pyramid */}
            <div>
              <h4 className="text-xs font-semibold text-neutral-400 tracking-[0.15em] uppercase mb-4">
                Note Structure
              </h4>
              <NotePyramid formula={formula} />
            </div>

            {/* Ingredient Detail Table */}
            <div>
              <h4 className="text-xs font-semibold text-neutral-400 tracking-[0.15em] uppercase mb-4">
                Composition Detail
              </h4>
              <IngredientTable formula={formula} />
            </div>

            {/* IFRA Badge */}
            <div className="flex items-center gap-2 bg-green-50 rounded-lg px-4 py-3 border border-green-100">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              <span className="text-sm font-medium text-green-700">IFRA 안전 규제 적합</span>
              <span className="text-xs text-green-500 ml-auto">All ingredients within limits</span>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
