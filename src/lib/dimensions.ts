import { standardDimensions, type DimensionProfile } from '@/lib/catalog';
import { fmt, type Messages } from '@/lib/messages';

export interface DimensionsView {
  profile: DimensionProfile;
  title: string;
  /** Intro sentence; empty for made-to-measure. */
  intro: string;
  /** Reference rows. Every number comes from standard-dimensions.json — nothing is typed into the copy. */
  rows: { label: string; value: string }[];
  /** Customization / quotation paragraph. */
  customization: string;
  /** Reminder that these are category reference sizes, not this design's confirmed dimensions. */
  reference: string;
  ctaLabel: string;
}

type P = Record<string, Record<string, number | null> | string>;

/** Builds the localized "Standard dimensions & customization" block. Unspecified values (e.g. wardrobe depth) are never rendered. */
export function buildDimensions(profile: DimensionProfile, t: Messages): DimensionsView {
  const d = t.dimensions;
  const base = { profile, ctaLabel: d.cta, reference: d.notThisProduct };
  if (profile === 'made-to-measure') {
    return { ...base, title: d.madeToMeasureTitle, intro: '', rows: [], customization: d.madeToMeasureBody, reference: '' };
  }
  const data = standardDimensions.profiles[profile] as P;
  if (profile === 'bedroom-standard') {
    const w = data.wardrobe as Record<string, number | null>;
    const bed = data.bed as Record<string, number>;
    const ns = data.nightstand as Record<string, number>;
    const dt = data.dressingTable as Record<string, number>;
    return {
      ...base, title: d.title, intro: d.bedroomIntro, customization: d.customization,
      rows: [
        { label: d.bedroom.wardrobe, value: fmt(d.bedroom.wardrobeValue, { w: w.width as number, h: w.height as number }) },
        { label: d.bedroom.bed, value: fmt(d.bedroom.bedValue, { size: bed.size }) },
        { label: d.bedroom.nightstand, value: fmt(d.bedroom.nightstandValue, { count: ns.count, size: ns.size }) },
        { label: d.bedroom.dressingTable, value: fmt(d.bedroom.dressingTableValue, { min: dt.min, max: dt.max }) },
      ],
    };
  }
  const beds = data.beds as Record<string, number>;
  const w = data.wardrobe as Record<string, number>;
  const ns = data.nightstand as Record<string, number>;
  return {
    ...base, title: d.title, intro: d.kidsIntro, customization: d.kidsCustomization,
    rows: [
      { label: d.kids.beds, value: fmt(d.kids.bedsValue, { count: beds.count, size: beds.size }) },
      { label: d.kids.wardrobe, value: fmt(d.kids.wardrobeValue, { size: w.size }) },
      { label: d.kids.nightstand, value: fmt(d.kids.nightstandValue, { count: ns.count }) },
      { label: d.kids.dressingTable, value: d.kids.dressingTableValue },
    ],
  };
}
