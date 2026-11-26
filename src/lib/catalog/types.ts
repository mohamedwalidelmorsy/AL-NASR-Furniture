import type { Locale } from '@/i18n/routing';

export type Localized = { en: string; ar: string };

export interface ImageSource {
  /** Google Drive file id of the original image (traceability back to the master asset). */
  driveFileId: string;
  locale: Locale;
  /** valid = id exists in the active Drive · remapped = same bytes, new id · orphaned = source gone, local file kept · deleted-by-decision = intentionally deleted, never re-import. */
  status?: 'valid' | 'remapped' | 'orphaned' | 'deleted-by-decision';
  drivePath?: string;
  originalFilename?: string;
  sha256?: string | null;
  previousDriveFileId?: string;
  /** Older Drive ids of the same file, oldest first (each re-upload adds one). */
  earlierDriveFileIds?: string[];
  note?: string;
}

export interface ProductImage {
  /** 640px WebP for cards. */
  card: string;
  /** 1400px WebP for detail page / lightbox. */
  full: string;
  width: number;
  height: number;
  source: ImageSource;
  /** cover = first/primary view; detail = supporting view of the same design. */
  role?: 'cover' | 'detail';
  /** Per-image label (used for thumbnail accessible names). */
  alt?: Localized;
  /** Marketing poster / image with embedded text. */
  hasEmbeddedText?: boolean;
  /** Display-only crop applied when the web rendition was produced (original is untouched). */
  displayCrop?: { bottomPx: number; note?: string };
}

export interface Piece {
  name: Localized;
  qty: number;
  /** [width, depth, height] in cm — null when not confirmed. Never invent. */
  dims: [number, number, number] | null;
}

/** Which approved reference-dimensions block (if any) a category shows. */
export type DimensionProfile = 'bedroom-standard' | 'kids-standard' | 'made-to-measure';

export interface Category {
  id: string;
  slug: string;
  sort: number;
  name: Localized;
  desc: Localized;
  /** Reference dimensions shown on product pages of this category (data in standard-dimensions.json). */
  dimensionProfile?: DimensionProfile;
  /** Shape of product-card image boxes: landscape room renders use 4/3, portrait posters 3/4 (the approved default). */
  cardRatio?: '4/3' | '3/4';
  /** Default unit wording for products of this category. */
  unitKind?: UnitKind;
  /** Product whose cover represents the category on Home / Collections (default: first product). */
  coverProductId?: string;
  /** Short note shown on the Bedroom Sets page pointing to a related category (e.g. dressing rooms). */
  relatedCategoryId?: string;
  relatedNote?: Localized;
}

/** Lifecycle: active = public; draft = hidden everywhere (incomplete); archived = not listed, URL answers with an archived page, id stays resolvable. */
export type ProductStatus = 'active' | 'draft' | 'archived' | 'merged';

/** What one unit of a product is called (quantity labels, Inquiry List): drives wording only; the RFQ payload keeps the coarse `unit` (set | piece). */
export type UnitKind = 'bedroom-set' | 'kids-set' | 'dressing-room' | 'corner-sofa' | 'sofa' | 'chaise' | 'sofa-set' | 'dining-set' | 'display-cabinet';

export interface MigrationInfo {
  /** A superseded · B continuing · C uncertain (see docs/plans/catalog-expansion/13). */
  class: 'A' | 'B' | 'C';
  basis?: string;
  equivalence?: { status: 'pending' | 'confirmed' | 'rejected'; candidate?: string | null; evidence?: string; confirmedBy?: string; date?: string };
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
  /** Defaults to 'active'. `merged` = duplicate record of `mergedInto` (approved): not listed, URL redirects 308 to the continuing product, id stays resolvable for old Inquiry Lists. */
  status?: ProductStatus;
  mergedInto?: string;
  unitKind?: UnitKind;
  /** Earlier canonical routes of this product (category slug + slug) that must redirect 308 to the current one. */
  previousRoutes?: { categoryId: string; slug: string }[];
  /** Extra categories the product is also listed under (URL stays under `categoryId`). */
  alsoIn?: string[];
  verification?: 'concept-render' | 'photo-unverified' | 'verified-product';
  /** Overrides the category's dimension profile; `null` = show none. */
  dimensionProfile?: DimensionProfile | null;
  migration?: MigrationInfo;
  /** Flags for manual review (possible duplicate of another record, etc.). Never changes behaviour. */
  review?: {
    possibleDuplicateOf?: string; confidence?: 'low' | 'medium' | 'high'; note?: string;
    /** Owner decision on a flagged item (data only, not rendered). */
    decision?: { status: 'approved' | 'rejected'; by: 'owner'; date: string; basis?: string; note?: string };
    extraImage?: { driveFileId: string; note?: string; confidence?: string; decision?: { status: 'approved' | 'rejected'; by: 'owner'; date: string; basis?: string; note?: string } };
  };
  archived?: { archivedAt: string; reason: string; equivalentId: string | null };
  note?: string;
  sourceGap?: string;
}
