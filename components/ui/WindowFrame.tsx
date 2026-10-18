import Image from 'next/image'
import { cn } from '@/lib/cn'

/** Ảnh sản phẩm trong khung cửa sổ: thanh tiêu đề giả và bóng đổ (spec §8.3). */
export function WindowFrame({
  src,
  alt,
  title,
  width = 1600,
  height = 1000,
  priority = false,
  sizes,
  className,
}: {
  src: string
  alt: string
  title: string
  width?: number
  height?: number
  priority?: boolean
  sizes: string
  className?: string
}) {
  return (
    <figure className={cn('overflow-hidden rounded-card border border-line-faint bg-card shadow-window', className)}>
      <div className="flex h-9 items-center gap-2 border-b border-line-faint bg-card px-4" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-2.5 w-2.5 rounded-full bg-line" />
        ))}
        <span className="ml-2 truncate text-[12.5px] text-muted">{title}</span>
      </div>
      <Image src={src} alt={alt} width={width} height={height} priority={priority} sizes={sizes} className="h-auto w-full" />
    </figure>
  )
}
