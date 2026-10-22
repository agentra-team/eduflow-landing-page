import Image from 'next/image'

/** Ảnh trong bài hướng dẫn: bắt buộc src, alt, width, height (spec §5.4). Kế hoạch 2 khoác giao diện theo canvas. */
export function Figure({ src, alt, width, height, caption }: { src: string; alt: string; width: number; height: number; caption?: string }) {
  return (
    <figure className="flex flex-col gap-2">
      <Image src={src} alt={alt} width={width} height={height} sizes="(min-width: 1024px) 720px, 100vw" className="h-auto w-full rounded-lg border border-line" />
      {caption ? <figcaption className="text-[13.5px] text-muted">{caption}</figcaption> : null}
    </figure>
  )
}
