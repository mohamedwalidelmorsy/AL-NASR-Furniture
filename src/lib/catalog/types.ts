import type { Locale } from '@/i18n/routing';

export type Localized = { en: string; ar: string };

export interface ImageSource {
  /** Google Drive file id of the original PNG (traceability back to the master asset). */
  driveFileId: string;
  locale: Locale;
}

export interface ProductImage {
  /** 640px WebP for cards. */
  card: string;
  /** 1400px WebP for detail page / lightbox. */
  full: string;
  width: number;
  height: number;
  source: ImageSource;
}

export interface Piece {
  name: Localized;
  qty: number;
  /** [width, depth, height] in cm — null when not confirmed. Never invent. */
  dims: [number, number, number] | null;
}

export interface Category {
  id: string;
  slug: string;
  sort: number;
  name: Localized;
  desc: Localized;
}

export type Unit = 'set' | 'piece';

export interface Product {
  id: string;
  slug: string;
  /** Internal preview ID until real manufacturer codes exist. */
  code: string;
  categoryId: string;
  style: string | null;
  unit: Unit;
  sort: number;
  /** AI-generated illustrative design (shown with an "Illustrative design" label). */
  illustrative: boolean;
  name: Localized;
  description: Localized;
  pieces: Piece[];
  materials: Localized | null;
  /** Locale-specific image variants; each locale may have several gallery images. */
  gallery: Record<Locale, ProductImage[]>;
}
