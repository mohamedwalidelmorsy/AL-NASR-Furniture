import { createHash } from 'node:crypto';

export interface InventoryFile {
  imageId: string;
  driveFileId: string;
  originalFilename: string;
  drivePath: string;
  sourceCategory: string;
  language: 'ar' | 'en';
  bytes: number;
  mimeType: string;
  localPath?: { full: string; card: string };
  downloaded?: boolean;
}

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

export const isPng = (b: Buffer) => b.length > 24 && b.subarray(0, 8).equals(PNG_SIGNATURE);

/** Width/height from the PNG IHDR chunk. */
export function pngSize(b: Buffer): { width: number; height: number } {
  if (!isPng(b)) throw new Error('not a PNG');
  return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
}

export const sha256 = (b: Buffer) => createHash('sha256').update(b).digest('hex');

/**
 * Where a converted rendition of an inventory file is published. Files already imported by the preview keep
 * their recorded location (the preview split the mixed china/dining folder by visual classification).
 */
export const renditionPath = (f: Pick<InventoryFile, 'sourceCategory' | 'language' | 'imageId' | 'localPath'>, width: 640 | 1400) =>
  f.localPath ? `public/${width === 640 ? f.localPath.card : f.localPath.full}` : `public/assets/furniture/${f.sourceCategory}/${f.language}/${f.imageId}-${width}.webp`;

export interface VerifyResult { ok: boolean; problems: string[]; width?: number; height?: number; sha256?: string }

/** Validate a downloaded original against the inventory record. */
export function verifyOriginal(f: InventoryFile, data: Buffer): VerifyResult {
  const problems: string[] = [];
  if (!isPng(data)) problems.push('not a PNG (bad signature)');
  if (data.length !== f.bytes) problems.push(`size ${data.length} ≠ inventory ${f.bytes}`);
  let width: number | undefined, height: number | undefined;
  if (isPng(data)) ({ width, height } = pngSize(data));
  if (width !== undefined && (width < 600 || (height ?? 0) < 600)) problems.push(`unexpectedly small image ${width}×${height}`);
  return { ok: problems.length === 0, problems, width, height, sha256: sha256(data) };
}
