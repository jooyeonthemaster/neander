export interface PricingTier {
  id: string;
  serviceKey: string;
  basePriceKRW: number;
  options: PricingOption[];
}

export interface PricingOption {
  id: string;
  labelKey: string;
  type: 'toggle' | 'select' | 'number';
  priceModifier: number | Record<string, number>;
  defaultValue: string | number | boolean;
  choices?: { value: string; labelKey: string; price: number }[];
  min?: number;
  max?: number;
}

export const pricingTiers: PricingTier[] = [
  {
    id: 'acscent',
    serviceKey: 'acscent',
    basePriceKRW: 3000000,
    options: [
      {
        id: 'capacity',
        labelKey: 'capacityPerHour',
        type: 'select',
        priceModifier: { '20': 0, '40': 1500000, '60': 3000000 },
        defaultValue: '20',
        choices: [
          { value: '20', labelKey: 'cap20', price: 0 },
          { value: '40', labelKey: 'cap40', price: 1500000 },
          { value: '60', labelKey: 'cap60', price: 3000000 },
        ],
      },
      {
        id: 'customScent',
        labelKey: 'customScentDesign',
        type: 'toggle',
        priceModifier: 1000000,
        defaultValue: false,
      },
      {
        id: 'packaging',
        labelKey: 'premiumPackaging',
        type: 'toggle',
        priceModifier: 500000,
        defaultValue: false,
      },
    ],
  },
  {
    id: 'photoBooth',
    serviceKey: 'photoBooth',
    basePriceKRW: 2000000,
    options: [
      {
        id: 'boothCount',
        labelKey: 'numberOfBooths',
        type: 'number',
        priceModifier: 1500000,
        defaultValue: 1,
        min: 1,
        max: 5,
      },
      {
        id: 'printOption',
        labelKey: 'printType',
        type: 'select',
        priceModifier: { qr: 0, photo: 300000, photocard: 500000 },
        defaultValue: 'qr',
        choices: [
          { value: 'qr', labelKey: 'qrOnly', price: 0 },
          { value: 'photo', labelKey: 'instantPrint', price: 300000 },
          { value: 'photocard', labelKey: 'photoCard', price: 500000 },
        ],
      },
      {
        id: 'aiStyles',
        labelKey: 'aiStyleCount',
        type: 'number',
        priceModifier: 200000,
        defaultValue: 2,
        min: 1,
        max: 8,
      },
    ],
  },
  {
    id: 'mediaArt',
    serviceKey: 'mediaArt',
    basePriceKRW: 5000000,
    options: [
      {
        id: 'complexity',
        labelKey: 'complexityTier',
        type: 'select',
        priceModifier: { standard: 0, premium: 5000000, custom: 10000000 },
        defaultValue: 'standard',
        choices: [
          { value: 'standard', labelKey: 'standard', price: 0 },
          { value: 'premium', labelKey: 'premium', price: 5000000 },
          { value: 'custom', labelKey: 'fullCustom', price: 10000000 },
        ],
      },
      {
        id: 'sensors',
        labelKey: 'motionSensors',
        type: 'toggle',
        priceModifier: 2000000,
        defaultValue: false,
      },
    ],
  },
  {
    id: 'spatialDesign',
    serviceKey: 'spatialDesign',
    basePriceKRW: 4000000,
    options: [
      {
        id: 'areaSize',
        labelKey: 'venueArea',
        type: 'select',
        priceModifier: { small: 0, medium: 2000000, large: 5000000 },
        defaultValue: 'small',
        choices: [
          { value: 'small', labelKey: 'areaSmall', price: 0 },
          { value: 'medium', labelKey: 'areaMedium', price: 2000000 },
          { value: 'large', labelKey: 'areaLarge', price: 5000000 },
        ],
      },
      {
        id: 'photoZone',
        labelKey: 'photoZoneDesign',
        type: 'toggle',
        priceModifier: 1500000,
        defaultValue: false,
      },
      {
        id: 'lighting',
        labelKey: 'customLighting',
        type: 'toggle',
        priceModifier: 1000000,
        defaultValue: false,
      },
    ],
  },
  {
    id: 'rental',
    serviceKey: 'rental',
    basePriceKRW: 1500000,
    options: [
      {
        id: 'kiosk',
        labelKey: 'aiKiosk',
        type: 'number',
        priceModifier: 500000,
        defaultValue: 1,
        min: 1,
        max: 10,
      },
      {
        id: 'camera',
        labelKey: 'cameraSetup',
        type: 'toggle',
        priceModifier: 300000,
        defaultValue: true,
      },
      {
        id: 'printer',
        labelKey: 'instantPrinter',
        type: 'toggle',
        priceModifier: 200000,
        defaultValue: false,
      },
    ],
  },
  {
    id: 'custom',
    serviceKey: 'custom',
    basePriceKRW: 5000000,
    options: [
      {
        id: 'contentType',
        labelKey: 'contentType',
        type: 'select',
        priceModifier: { brand: 0, festival: 2000000, aiContent: 5000000 },
        defaultValue: 'brand',
        choices: [
          { value: 'brand', labelKey: 'brandContent', price: 0 },
          { value: 'festival', labelKey: 'festivalContent', price: 2000000 },
          { value: 'aiContent', labelKey: 'aiContentDev', price: 5000000 },
        ],
      },
      {
        id: 'consultation',
        labelKey: 'consultationIncluded',
        type: 'toggle',
        priceModifier: 1000000,
        defaultValue: false,
      },
      {
        id: 'maintenance',
        labelKey: 'postEventSupport',
        type: 'toggle',
        priceModifier: 800000,
        defaultValue: false,
      },
    ],
  },
];

export const addOns = [
  { id: 'staffing', labelKey: 'operationStaff', priceKRW: 800000, perDay: true },
  { id: 'brandedPackaging', labelKey: 'brandedPackaging', priceKRW: 500000, perDay: false },
  { id: 'analytics', labelKey: 'dataAnalytics', priceKRW: 300000, perDay: false },
  { id: 'extendedHours', labelKey: 'extendedHours', priceKRW: 400000, perDay: true },
  { id: 'remoteMonitoring', labelKey: 'remoteMonitoring', priceKRW: 200000, perDay: false },
] as const;

export type AddOnId = (typeof addOns)[number]['id'];
