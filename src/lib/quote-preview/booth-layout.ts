import type { EventSceneBounds, EventSceneFootprint, EventSceneObject, EventScenePoint } from './event-scene';

/** Ground area only: the top of a tall device is allowed to cross the floor's
 * outline in projection. Include cabinet depth and a little clearance at its feet. */
export function eventObjectGroundPoints(object: EventSceneObject): EventScenePoint[] {
  const { bounds, y, scale } = object;
  return [
    { x: bounds.left - 6 * scale, y: y + 3 * scale },
    { x: bounds.right - 6 * scale, y: y + 3 * scale },
    { x: bounds.right + 20 * scale, y: y - 10 * scale },
    { x: bounds.left + 20 * scale, y: y - 10 * scale },
  ];
}

interface FurnitureGroup {
  objects: EventSceneObject[];
  anchor: EventScenePoint;
  bounds: EventSceneBounds;
  ground: EventSceneBounds;
  preferred: { across: number; depth: number };
}

function extent(points: EventScenePoint[]): EventSceneBounds {
  return {
    left: Math.min(...points.map(p => p.x)), right: Math.max(...points.map(p => p.x)),
    top: Math.min(...points.map(p => p.y)), bottom: Math.max(...points.map(p => p.y)),
  };
}

function furnitureGroups(objects: EventSceneObject[]): FurnitureGroup[] {
  const groups = new Map<string, EventSceneObject[]>();
  for (const object of objects) {
    // Staff stay behind their counter; projection equipment stays with its
    // screen. Repeated devices remain in ordered rows instead of being scattered
    // across unrelated stations when their quantities change.
    const key = ['counter', 'team'].includes(object.type) ? 'perfume-station'
      : object.service === 'mediaArt' ? 'media-station'
      : object.service === 'rental' ? 'rental-row'
      : object.type === 'photo-booth' ? 'photo-row'
      : object.type === 'analysis-kiosk' ? 'analysis-row' : object.id;
    groups.set(key, [...(groups.get(key) ?? []), object]);
  }
  return [...groups.values()].map(members => {
    const first = members[0];
    const anchor = { x: first.x, y: first.y };
    const ground = extent(members.flatMap(eventObjectGroundPoints).map(point => ({
      // Invert the same 2:1 projection as the booth floor.
      x: point.x - anchor.x + 2 * (point.y - anchor.y), y: anchor.y - point.y,
    })));
    const bounds = extent(members.flatMap(object => [
      { x: object.bounds.left - anchor.x, y: object.bounds.top - anchor.y },
      { x: object.bounds.right - anchor.x, y: object.bounds.bottom - anchor.y },
    ]));
    const preferred = first.service === 'mediaArt' ? { across: .3, depth: .75 }
      : first.type === 'photo-booth' ? { across: .8, depth: .8 }
      : first.type === 'photo-zone' ? { across: .52, depth: .85 }
      : first.type === 'analysis-kiosk' ? { across: .65, depth: .22 }
      : first.service === 'rental' ? { across: .82, depth: .2 }
      : { across: .25, depth: .25 };
    return { objects: members, anchor, bounds, ground, preferred };
  }).sort((a, b) => (b.bounds.right - b.bounds.left) * (b.bounds.bottom - b.bounds.top)
    - (a.bounds.right - a.bounds.left) * (a.bounds.bottom - a.bounds.top));
}

function samples(min: number, max: number, preferred: number, step: number): number[] {
  if (max < min) return [];
  return [Math.max(min, Math.min(max, preferred)), min, max,
    ...Array.from({ length: Math.floor((max - min) / step) }, (_, index) => min + (index + 1) * step)];
}

/** Fit complete furniture groups inside the purchased floor polygon. Keep a
 * common equipment scale, leave breathing room, and reject silhouettes that
 * would hide a different station. This is an illustrative arrangement, not a
 * change to the purchased area or a promise of physical installation capacity. */
export function layoutInsideBooth(objects: EventSceneObject[], footprint: EventSceneFootprint): EventSceneObject[] {
  if (!objects.length) return objects;
  const groups = furnitureGroups(objects);
  const [frontLeft, frontRight, , backLeft] = footprint.points;
  const width = frontRight.x - frontLeft.x;
  const depth = frontLeft.y - backLeft.y;
  const inset = 9;

  // Usually full size or close to it is enough. Dense selections use one
  // uniform reduction rather than moving devices outside or resizing each one.
  const scales = [...Array.from({ length: 39 }, (_, index) => 1 - index * .025), .025, .0125, .00625];
  for (const scale of scales) {
    const placed: EventSceneBounds[] = [];
    const result = new Map<string, EventSceneObject>();
    for (const group of groups) {
      const preferredU = width * group.preferred.across - (group.ground.left + group.ground.right) * scale / 2;
      const preferredV = depth * group.preferred.depth - (group.ground.top + group.ground.bottom) * scale / 2;
      const across = samples(inset - group.ground.left * scale, width - inset - group.ground.right * scale, preferredU, 8);
      const depths = samples(inset - group.ground.top * scale, depth - inset - group.ground.bottom * scale, preferredV, 6);
      let best: { x: number; y: number; bounds: EventSceneBounds; score: number } | undefined;
      for (const u of across) for (const v of depths) {
        const score = ((u - preferredU) / width) ** 2 + ((v - preferredV) / depth) ** 2;
        if (best && score >= best.score) continue;
        const x = frontLeft.x + u + 2 * v;
        const y = frontLeft.y - v;
        const bounds = {
          left: x + group.bounds.left * scale, right: x + group.bounds.right * scale,
          top: y + group.bounds.top * scale, bottom: y + group.bounds.bottom * scale,
        };
        const gap = 10 * scale;
        if (placed.some(other => bounds.left < other.right + gap && bounds.right > other.left - gap
          && bounds.top < other.bottom + gap && bounds.bottom > other.top - gap)) continue;
        best = { x, y, bounds, score };
      }
      if (!best) break;
      placed.push(best.bounds);
      for (const object of group.objects) {
        result.set(object.id, {
          ...object,
          x: best.x + (object.x - group.anchor.x) * scale,
          y: best.y + (object.y - group.anchor.y) * scale,
          scale: object.scale * scale,
          bounds: {
            left: best.x + (object.bounds.left - group.anchor.x) * scale,
            right: best.x + (object.bounds.right - group.anchor.x) * scale,
            top: best.y + (object.bounds.top - group.anchor.y) * scale,
            bottom: best.y + (object.bounds.bottom - group.anchor.y) * scale,
          },
        });
      }
    }
    if (result.size === objects.length) return objects.map(object => result.get(object.id)!);
  }
  // Sanitized product limits fit well before this point; do not silently fall
  // back to the old out-of-booth coordinates if new inventory is introduced.
  throw new Error('Selected equipment cannot be arranged within the preview booth');
}
