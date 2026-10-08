// Browser stand-in for next/image in the Claude Design bundle: a plain <img>
// that honors `fill` (absolute, inset 0, 100%) the way next/image does.
import type { CSSProperties, ImgHTMLAttributes } from "react";

type ImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "width" | "height"> & {
  src: string | { src: string };
  width?: number | string;
  height?: number | string;
  fill?: boolean;
  priority?: boolean;
  quality?: number;
  placeholder?: string;
  blurDataURL?: string;
  unoptimized?: boolean;
  loader?: unknown;
};

export default function Image({
  src, fill, priority, quality, placeholder, blurDataURL, unoptimized, loader,
  width, height, style, alt = "", ...rest
}: ImageProps) {
  void priority; void quality; void placeholder; void blurDataURL; void unoptimized; void loader;
  const s = typeof src === "string" ? src : src?.src;
  const fillStyle: CSSProperties = fill
    ? { position: "absolute", inset: 0, width: "100%", height: "100%" }
    : {};
  return (
    <img
      src={s}
      alt={alt}
      width={fill || width === 0 ? undefined : width}
      height={fill || height === 0 ? undefined : height}
      // Always eager: a lazy <img> outside the viewport never loads, and the sync's
      // capture awaits img.decode() with no timeout (hangs forever on it).
      loading="eager"
      decoding="async"
      style={{ ...fillStyle, ...style }}
      {...rest}
    />
  );
}
