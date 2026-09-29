import { PERFUME, SERVICE_ORDER, type ServiceKey } from '../quote/catalog';
import { sanitizeInput, type MediaArtOptions, type QuoteInput, type SpaceOptions } from '../quote/engine';
import { getKioskAssignments } from '../quote/kiosk-experiences';
import { eventObjectGroundPoints, layoutInsideBooth } from './booth-layout';
import { MAX_ILLUSTRATED_PERFUME_TEAMS, perfumeCounterWidth, perfumeFurniture } from './perfume-furniture';

export type PhysicalServiceKey = Exclude<ServiceKey, 'custom'>;
export interface EventScenePoint { x: number; y: number }
export interface EventSceneBounds { left: number; top: number; right: number; bottom: number }
export type EventSceneObjectType =
  | 'counter' | 'team' | 'analysis-kiosk' | 'photo-booth' | 'kiosk' | 'printer'
  | 'media-screen' | 'projector' | 'sensor' | 'media-operator' | 'media-guest' | 'photo-zone';

/** Every origin is the object's ground contact. Bounds include visible glyphs,
 * but not decorative shadows. A team is the existing two-person TeamGlyph. */
export interface EventSceneObject extends EventScenePoint {
  id: string;
  type: EventSceneObjectType;
  service: PhysicalServiceKey;
  scale: number;
  variant: number;
  bounds: EventSceneBounds;
  slug?: string;
  branded?: boolean;
  wrapped?: boolean;
  grade?: MediaArtOptions['grade'];
  sensorType?: MediaArtOptions['sensorType'];
  volume?: '10ml' | '50ml';
  packaging?: 'none' | 'brand' | 'custom';
  customScent?: boolean;
  racks?: number;
}

export interface EventSceneFootprint {
  size: SpaceOptions['size'];
  widthMeters: 3 | 6 | null;
  depthMeters: 3 | null;
  /** A custom space keeps its quoted area rather than implying a fixed booth. */
  pyeong: number | null;
  points: EventScenePoint[];
  wallHeight: number;
}

export interface EventSceneModel {
  width: 1600;
  height: 900;
  services: PhysicalServiceKey[];
  floor: { points: EventScenePoint[] };
  footprint: EventSceneFootprint | null;
  /** build: 3×3·6×3 부스의 구조 (맞춤 공간은 항상 fabric 으로 둔다) */
  space: { size: SpaceOptions['size'] | 'existing'; photoZone: boolean; lighting: boolean; build: 'fabric' | 'wood' };
  objects: EventSceneObject[];
  zones: { service: PhysicalServiceKey; bounds: EventSceneBounds }[];
  bounds: EventSceneBounds;
  counts: {
    teams: number; staff: number; analysisKiosks: number; photoBooths: number;
    kiosks: number; printers: number; sensors: number; projectors: number;
  };
  /** Ground-footprint validation, including cabinet depth. */
  outsideFootprint: string[];
  needsPlacement: boolean;
}

export const EVENT_SCENE_FLOOR: EventSceneModel['floor'] = {
  // Cabinet projection shared by every equipment glyph: horizontal fronts,
  // vertical uprights, and depth receding right/up at exactly 2:1.
  points: [{ x: 40, y: 820 }, { x: 1100, y: 820 }, { x: 1540, y: 600 }, { x: 480, y: 600 }],
};

// The same kiosk/person/photo-booth scale is used throughout the event. The
// counter is one wider shared station, never one extra counter per added team.
const EQUIPMENT_SCALE = 0.85;
const LOCAL_BOUNDS: Record<EventSceneObjectType, EventSceneBounds> = {
  counter: { left: -140, top: -113, right: 140, bottom: 0 },
  team: { left: -52, top: -151, right: 66, bottom: 0 },
  'analysis-kiosk': { left: -24, top: -160, right: 25, bottom: 0 },
  'photo-booth': { left: -39, top: -180, right: 39, bottom: 2 },
  kiosk: { left: -24, top: -160, right: 25, bottom: 0 },
  printer: { left: -24, top: -88, right: 28, bottom: 0 },
  'media-screen': { left: -150, top: -202, right: 157, bottom: 0 },
  projector: { left: -25, top: -87, right: 28, bottom: 0 },
  sensor: { left: -12, top: -24, right: 12, bottom: 3 },
  'media-operator': { left: -25, top: -151, right: 40, bottom: 0 },
  'media-guest': { left: -40, top: -151, right: 25, bottom: 0 },
  'photo-zone': { left: -58, top: -170, right: 58, bottom: 0 },
};

function boundsFor(points: EventScenePoint[]): EventSceneBounds {
  return {
    left: Math.min(...points.map((point) => point.x)),
    top: Math.min(...points.map((point) => point.y)),
    right: Math.max(...points.map((point) => point.x)),
    bottom: Math.max(...points.map((point) => point.y)),
  };
}

function unionBounds(bounds: EventSceneBounds[]): EventSceneBounds {
  return boundsFor(bounds.flatMap((bound) => [
    { x: bound.left, y: bound.top }, { x: bound.right, y: bound.bottom },
  ]));
}

/** Includes the polygon edge. Used for ground contacts, not tall object bounds. */
export function isOnEventFloor(point: EventScenePoint, polygon: readonly EventScenePoint[]): boolean {
  let sign = 0;
  for (let index = 0; index < polygon.length; index++) {
    const a = polygon[index];
    const b = polygon[(index + 1) % polygon.length];
    const cross = (b.x - a.x) * (point.y - a.y) - (b.y - a.y) * (point.x - a.x);
    if (Math.abs(cross) < 0.00001) continue;
    const current = Math.sign(cross);
    if (sign && current !== sign) return false;
    sign = current;
  }
  return polygon.length >= 3;
}

function selectedFootprint(space: SpaceOptions | undefined): EventSceneFootprint | null {
  if (!space) return null;
  const custom = space.size === 'large';
  const width = space.size === 'booth3x3' ? 360 : custom ? 900 : 720;
  const left = 100;
  const front = 790;
  const depth = 150;
  const skew = depth * 2;
  return {
    size: space.size,
    widthMeters: custom ? null : space.size === 'booth3x3' ? 3 : 6,
    depthMeters: custom ? null : 3,
    pyeong: custom ? space.pyeong : null, wallHeight: 235,
    points: [
      { x: left, y: front }, { x: left + width, y: front },
      { x: left + width + skew, y: front - depth }, { x: left + skew, y: front - depth },
    ],
  };
}

export function footprintBounds(footprint: EventSceneFootprint): EventSceneBounds {
  const [frontLeft, , backRight, backLeft] = footprint.points;
  return boundsFor([...footprint.points, ...[frontLeft, backLeft, backRight].map((point) => ({ x: point.x, y: point.y - footprint.wallHeight }))]);
}

/** One shared event floor for all five physical services. Selection order,
 * editor focus, totals and unrelated event fields do not change the layout.
 * Every selected station is arranged inside the purchased booth, which never
 * expands when a kiosk, team or another experience is added. */
export function resolveEventScene(input: QuoteInput): EventSceneModel | null {
  const normalized = sanitizeInput(input);
  const selected = new Set(normalized.items.map((item) => item.key));
  const services = SERVICE_ORDER.filter((key): key is PhysicalServiceKey => key !== 'custom' && selected.has(key));
  if (!services.length) return null;

  const perfume = normalized.items.find((item) => item.key === 'acscent')?.options;
  const photo = normalized.items.find((item) => item.key === 'photoBooth')?.options;
  const rental = normalized.items.find((item) => item.key === 'rental')?.options;
  const media = normalized.items.find((item) => item.key === 'mediaArt')?.options;
  const space = normalized.items.find((item) => item.key === 'spatialDesign')?.options;
  const floor = EVENT_SCENE_FLOOR;
  const footprint = selectedFootprint(space);
  let objects: EventSceneObject[] = [];
  const add = (
    type: EventSceneObjectType, service: PhysicalServiceKey, index: number, x: number, y: number,
    options: Partial<Pick<EventSceneObject, 'scale' | 'slug' | 'branded' | 'wrapped' | 'grade' | 'volume' | 'packaging' | 'customScent' | 'sensorType' | 'racks'>> = {},
  ) => {
    const scale = options.scale ?? EQUIPMENT_SCALE;
    const bound = type === 'counter'
      ? { left: -perfumeCounterWidth(options.racks ?? 1) / 2, top: -122, right: perfumeCounterWidth(options.racks ?? 1) / 2, bottom: 0 }
      : LOCAL_BOUNDS[type];
    objects.push({
      id: `${service}-${type}-${index + 1}`, type, service, x, y, scale, variant: index, ...options,
      bounds: { left: x + bound.left * scale, top: y + bound.top * scale, right: x + bound.right * scale, bottom: y + bound.bottom * scale },
    });
  };

  const teams = perfume ? PERFUME.includedTeams + perfume.extraTeams : 0;
  if (perfume) {
    const furniture = perfumeFurniture(perfume.guests);
    const rear = furniture.counters.at(-1)!;
    const spread = Math.max(180, rear.width * .72);
    const illustratedTeams = Math.min(teams, MAX_ILLUSTRATED_PERFUME_TEAMS);
    for (let index = 0; index < illustratedTeams; index++) {
      const row = Math.floor(index / 3);
      const columns = Math.min(3, illustratedTeams - row * 3);
      const spacing = illustratedTeams > 3 ? Math.max(112, spread / columns) : spread / columns;
      add('team', 'acscent', index, 350 + rear.x + row * 220 + (index % 3 - (columns - 1) / 2) * spacing, 715 + rear.y - row * 110);
    }
    // Draw rear tables before front tables. Brown racks are real repeated SVG
    // elements, while only the supporting tabletop gains width.
    [...furniture.counters].reverse().forEach(counter => add('counter', 'acscent', counter.index, 350 + counter.x, 760 + counter.y, {
      scale: 1.15, volume: perfume.volume, racks: counter.racks,
      packaging: perfume.customBox ? 'custom' : perfume.premiumPackaging ? 'brand' : 'none', customScent: perfume.customScent,
    }));
    for (let index = 0; index < (perfume.analysisKiosks ?? 0); index++) {
      add('analysis-kiosk', 'acscent', index, 565 + index * 62, 792);
    }
  }
  if (photo) {
    for (let index = 0; index < photo.booths; index++) {
      add('photo-booth', 'photoBooth', index, 770 + index * 110, 650, { wrapped: photo.wrapping });
    }
  }
  if (rental) {
    getKioskAssignments(rental).forEach((slug, index) => {
      const x = 815 + index * 80;
      add('kiosk', 'rental', index, x, 795, { slug, branded: rental.custom === 'brand' });
      if (rental.printer) add('printer', 'rental', index, x + 31, 807);
    });
  }
  if (media) {
    add('media-screen', 'mediaArt', 0, 1250, 650, { grade: media.grade });
    add('media-operator', 'mediaArt', 0, 1085, 650);
    add('media-guest', 'mediaArt', 0, 1330, 660);
    add('projector', 'mediaArt', 0, 1180, 700);
    const sensorPositions = [
      ...Array.from({ length: 8 }, (_, index) => ({ x: 1135 + index * 26, y: 780 - index * 13 })),
      { x: 1135, y: 735 }, { x: 1175, y: 725 }, { x: 1215, y: 715 },
    ];
    sensorPositions.slice(0, 1 + media.extraSensors).forEach(({ x, y }, index) => add('sensor', 'mediaArt', index, x, y, { sensorType: media.sensorType ?? 'image' }));
  }
  if (space?.photoZone) add('photo-zone', 'spatialDesign', 0, 650, 662, { scale: 0.85 });

  if (footprint) objects = layoutInsideBooth(objects, footprint);
  else if (perfume) objects = layoutInsideBooth(objects, {
    size: 'large', widthMeters: null, depthMeters: null, pyeong: null,
    points: floor.points, wallHeight: 0,
  });

  // Painter's order is deterministic. Counter legs intentionally sit in front
  // of the perfume teams; other service equipment occupies separate zones.
  const zones = services.map((service) => {
    const bounds = objects.filter((object) => object.service === service).map((object) => object.bounds);
    if (service === 'spatialDesign' && footprint) bounds.push(footprintBounds(footprint));
    return { service, bounds: unionBounds(bounds) };
  });
  const outsideFootprint = footprint ? objects.filter((object) => eventObjectGroundPoints(object)
    .some((point) => !isOnEventFloor(point, footprint.points))).map((object) => object.id) : [];

  return {
    width: 1600, height: 900, services, floor, footprint,
    space: { size: space?.size ?? 'existing', photoZone: Boolean(space?.photoZone), lighting: Boolean(space?.lighting), build: space && space.size !== 'large' && space.build === 'wood' ? 'wood' : 'fabric' },
    objects, zones, bounds: unionBounds([...objects.map((object) => object.bounds), ...(footprint ? [footprintBounds(footprint)] : [])]),
    counts: {
      teams, staff: teams * 2, analysisKiosks: perfume?.analysisKiosks ?? 0, photoBooths: photo?.booths ?? 0,
      kiosks: rental?.kiosks ?? 0, printers: rental?.printer ? rental.kiosks : 0,
      sensors: media ? 1 + media.extraSensors : 0, projectors: media ? 1 : 0,
    },
    outsideFootprint, needsPlacement: outsideFootprint.length > 0,
  };
}
