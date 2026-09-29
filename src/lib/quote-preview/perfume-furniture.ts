/** Illustration budget only; selected/quoted teams have no business ceiling. */
export const MAX_ILLUSTRATED_PERFUME_TEAMS = 12;

/** One scent rack serves each started group of 50 perfume participants. */
export function perfumeRackCount(guests: number): number {
  return Math.ceil(Math.max(1, Math.min(5000, Number.isFinite(guests) ? guests : 100)) / 50);
}

export function perfumeCounterWidth(racks: number): number {
  return 190 + (racks - 1) * 112;
}

/** Widen a continuous table first. Large events add parallel tables, keeping
 * each rack at its original proportions instead of stretching the bottles. */
export function perfumeFurniture(guests: number) {
  const rackCount = perfumeRackCount(guests);
  const rows = Math.ceil(rackCount / 6);
  const columns = Math.ceil(rackCount / rows);
  return {
    rackCount,
    counters: Array.from({ length: rows }, (_, index) => {
      const racks = Math.min(columns, rackCount - index * columns);
      return { index, racks, width: perfumeCounterWidth(racks), x: index * 280, y: -index * 140 };
    }),
  };
}
