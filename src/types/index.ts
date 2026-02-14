/* ─────────────────────────────────────────────────────────
   NEANDERco.ltd  |  Shared TypeScript Interfaces
   ───────────────────────────────────────────────────────── */

/** Navigation item used in header/footer/mobile menu */
export interface NavItem {
  path: string;
  labelKey: string;
  external?: boolean;
}

/** Service offering definition */
export interface Service {
  id: string;
  titleKey: string;
  descriptionKey: string;
  icon: string;
  color: 'scent' | 'photo' | 'media' | 'spatial';
  features: string[];
}

/** Portfolio project entry */
export interface PortfolioProject {
  id: string;
  slug: string;
  titleKey: string;
  descriptionKey: string;
  category: Service['color'];
  thumbnail: string;
  images: string[];
  client: string;
  date: string;
  tags: string[];
}

/** Company timeline entry for About page */
export interface TimelineEntry {
  year: number;
  titleKey: string;
  descriptionKey: string;
  highlight?: boolean;
}

/** Quote/estimate request service selection */
export interface QuoteService {
  serviceId: string;
  quantity: number;
  notes: string;
}

/** Event details for quote context */
export interface EventDetails {
  name: string;
  date: string;
  venue: string;
  expectedAttendees: number;
  description: string;
}

/** Contact form submission data */
export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  company?: string;
  subject: string;
  message: string;
  privacyConsent: boolean;
}
