import { sanitizeInput, type QuoteInput, type SpaceOptions } from '../quote/engine';
import { PERFUME } from '../quote/catalog';
import { MAX_ILLUSTRATED_PERFUME_TEAMS, perfumeCounterWidth, perfumeFurniture } from './perfume-furniture';
import { layoutInsideBooth } from './booth-layout';
import type { EventSceneObject } from './event-scene';

export interface SceneObject {
  id: string;
  x: number;
  y: number;
  scale: number;
  variant: number;
}
export type SceneSize = SpaceOptions['size'] | 'existing';
export interface SceneFloor {
  left: number;
  front: number;
  width: number;
  depthX: number;
  depthY: number;
  wallHeight: number;
}
export function sceneFloor(size: SceneSize): SceneFloor {
  return size === 'booth3x3'
    ? { left: 90, front: 422, width: 450, depthX: 160, depthY: 80, wallHeight: 190 }
    : { left: 50, front: 422, width: 620, depthX: 110, depthY: 55, wallHeight: 195 };
}
export interface PerfumeSceneModel {
  size: SceneSize;
  footprint: { width: 3 | 6; depth: 3 } | null;
  floor: SceneFloor;
  counter: SceneObject;
  counters: (SceneObject & { racks: number })[];
  rackCount: number;
  kiosks: SceneObject[];
  teams: SceneObject[];
  overflowTeams: SceneObject[];
  totalTeams: number;
  staff: number;
  needsPlacement: boolean;
  photoZone: boolean;
  lighting: boolean;
  /** 3×3·6×3 부스의 구조 — 조립식 천 부스(fabric) 또는 나무 가벽(wood) */
  build: 'fabric' | 'wood';
}

/** Shared 800 × 520 vector canvas. Every object's origin is its floor contact.
 * Illustration positions explain the selection, not measured venue capacity.
 * Racks follow perfume guests; staff counts remain independently selected. */
export function resolvePerfumeScene(input: QuoteInput): PerfumeSceneModel | null {
  const normalized = sanitizeInput(input);
  const perfume = normalized.items.find((item) => item.key === 'acscent');
  if (!perfume) return null;
  const space = normalized.items.find((item) => item.key === 'spatialDesign')?.options;
  const size = space?.size ?? 'existing';
  const small = size === 'booth3x3';
  const totalTeams = PERFUME.includedTeams + perfume.options.extraTeams;
  const kioskCount = perfume.options.analysisKiosks ?? 0;
  const photoZone = Boolean(space?.photoZone);
  const displayLimit = small ? (photoZone || kioskCount > 2 ? 1 : 2) : (photoZone ? 2 : 3);
  const count = Math.min(totalTeams, displayLimit);
  const centered = size !== 'booth3x3' && size !== 'booth6x3' && kioskCount === 0;
  const centers = centered
    ? count === 1 ? [400] : count === 2 ? [330, 470] : [270, 400, 530]
    : count === 1 ? [small ? 340 : 320] : count === 2 ? [260, 395] : [190, 310, 430];
  const teams = Array.from({ length: Math.min(totalTeams, MAX_ILLUSTRATED_PERFUME_TEAMS) }, (_, index): SceneObject => ({
    id: `team-${index + 1}`, x: centers[index] ?? 0, y: 369, scale: 0.94, variant: index,
  }));
  const kiosks = Array.from({ length: kioskCount }, (_, index): SceneObject => ({
    id: `kiosk-${index + 1}`, x: (small ? [480, 535, 590, 645] : [530, 590, 650, 710])[index],
    // Follow the floor's depth, keeping every device on the selected platform.
    y: (small ? [390, 376, 362, 348] : [405, 397, 389, 381])[index], scale: 0.94, variant: index,
  }));
  const furniture = perfumeFurniture(perfume.options.guests);
  const counter = { id: 'counter', x: centered ? 400 : small ? 340 : 325, y: 413, scale: 1.05, variant: 0 };
  const rear = furniture.counters.at(-1)!;
  const visibleTeams = teams.slice(0, count).map((team, index) => ({
    ...team, x: counter.x + rear.x + (index - (count - 1) / 2) * Math.max(180, rear.width * .72) / count,
    y: counter.y + rear.y - 45,
  }));
  const counters = furniture.counters.map(row => ({
    ...counter, id: row.index ? `counter-${row.index + 1}` : 'counter',
    x: counter.x + row.x, y: counter.y + row.y, variant: row.index, racks: row.racks,
  }));
  const objects: EventSceneObject[] = [...visibleTeams, ...counters, ...kiosks].map(object => {
    const racks = 'racks' in object ? object.racks as number : undefined;
    const type = racks ? 'counter' : object.id.startsWith('team-') ? 'team' : 'analysis-kiosk';
    const half = racks ? perfumeCounterWidth(racks) / 2 : type === 'team' ? 66 : 25;
    return {
      ...object, service: 'acscent', type, racks,
      bounds: {
        left: object.x - half * object.scale, right: object.x + half * object.scale,
        top: object.y - (racks ? 122 : 160) * object.scale, bottom: object.y,
      },
    };
  });
  const floor = sceneFloor(size);
  const arranged = layoutInsideBooth(objects, {
    size: space?.size ?? 'large', widthMeters: null, depthMeters: null, pyeong: null, wallHeight: floor.wallHeight,
    points: [
      { x: floor.left, y: floor.front }, { x: floor.left + floor.width, y: floor.front },
      { x: floor.left + floor.width + floor.depthX, y: floor.front - floor.depthY }, { x: floor.left + floor.depthX, y: floor.front - floor.depthY },
    ],
  });
  const placed = <T extends SceneObject>(object: T): T => {
    const match = arranged.find(item => item.id === object.id)!;
    return { ...object, x: match.x, y: match.y, scale: match.scale };
  };
  return {
    size, footprint: small ? { width: 3, depth: 3 } : size === 'booth6x3' ? { width: 6, depth: 3 } : null,
    floor, counter: placed(counters[0]), counters: counters.map(placed), rackCount: furniture.rackCount,
    kiosks: kiosks.map(placed), teams: visibleTeams.map(placed), overflowTeams: teams.slice(count),
    totalTeams, staff: totalTeams * 2, photoZone, lighting: Boolean(space?.lighting),
    build: small || size === 'booth6x3' ? (space?.build === 'wood' ? 'wood' : 'fabric') : 'fabric',
    needsPlacement: totalTeams > count || (small && kioskCount > 1),
  };
}
