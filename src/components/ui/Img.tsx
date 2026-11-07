import Image from 'next/image';
import type { CSSProperties } from 'react';

interface ImgProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  loading?: 'lazy' | 'eager';
  decoding?: 'async' | 'sync' | 'auto';
  style?: CSSProperties;
  className?: string;
}

/** next/image wrapper. Intrinsic width/height only reserve the aspect ratio; CSS (aspect-ratio / object-fit) drives the layout, as in the approved design. */
export function Img({ src, alt, width, height, sizes, priority, loading, style, className }: ImgProps) {
  if (!src) return null;
  return (
    <Image
      src={src}
      alt={alt}
      width={width ?? 1024}
      height={height ?? 1280}
      sizes={sizes ?? '(min-width: 1200px) 400px, (min-width: 640px) 33vw, 100vw'}
      priority={priority}
      loading={priority ? undefined : loading}
      style={style}
      className={className}
    />
  );
}
