import Image from 'next/image'

/** Màu logo Agentra (chữ A, PO 2026-10-22): nét trái xanh lá sáng, nét phải xanh lá thương hiệu. */
export const BRAND_COLORS = { light: '#8CBF3C', green: '#6A9C39', white: '#FFFFFF' } as const

/** Tỷ lệ tệp public/brand/eduflow-wordmark*.svg (viewBox 414 × 104), do scripts/brand/build_wordmark.py dựng. */
export const WORDMARK_VIEWBOX = { width: 414, height: 104 } as const

/** Hai nét của chữ A Agentra trên viewBox "36 36 428 428". */
export const LOGO_A = { viewBox: '36 36 428 428', left: '255,72 313,174 153,428 41,428', right: '331,206 458,428 344,428 282,327 251,327' } as const

/**
 * Chữ A Agentra. `tone="white"` cho nền đậm: hai nét trắng, nét phải trắng mờ 75%.
 * Không dùng Fragment trong <svg>: ogImage() render component này bằng satori, vốn chỉ nhận phần tử gốc của SVG.
 */
export function LogoMark({ size = 32, title, tone = 'color' }: { size?: number; title?: string; tone?: 'color' | 'white' }) {
  const white = tone === 'white'
  return (
    <svg width={size} height={size} viewBox={LOGO_A.viewBox} {...(title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': true })}>
      {title ? <title>{title}</title> : null}
      <polygon points={LOGO_A.left} fill={white ? BRAND_COLORS.white : BRAND_COLORS.light} />
      <polygon points={LOGO_A.right} fill={white ? BRAND_COLORS.white : BRAND_COLORS.green} fillOpacity={white ? 0.75 : 1} />
    </svg>
  )
}

/** Logo đủ (chữ A Agentra và chữ EduFlow đậm 600 dạng path, không cần nạp font). */
export function Logo({ height = 30, tone = 'color', priority = false }: { height?: number; tone?: 'color' | 'white'; priority?: boolean }) {
  const src = tone === 'white' ? '/brand/eduflow-wordmark-white.svg' : '/brand/eduflow-wordmark.svg'
  return (
    <Image
      src={src}
      alt="EduFlow"
      width={Math.round((height * WORDMARK_VIEWBOX.width) / WORDMARK_VIEWBOX.height)}
      height={height}
      priority={priority}
      unoptimized
    />
  )
}
