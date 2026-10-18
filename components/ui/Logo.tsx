import Image from 'next/image'

/** Màu logo C "Chữ E chấm" (spec blue retheme §4.4, bảng Main): thanh navy, ba chấm xanh, ngọc, hồng cam. */
export const BRAND_COLORS = { navy: '#141736', blue: '#0177FB', teal: '#01D7DF', coral: '#FE6470', white: '#FFFFFF' } as const

/** Tỷ lệ tệp public/brand/eduflow-wordmark*.svg (viewBox 414 × 104), do scripts/brand/build_wordmark.py dựng. */
export const WORDMARK_VIEWBOX = { width: 414, height: 104 } as const

/**
 * Logo C trên lưới 64: thanh dọc bo tròn và ba chấm xếp dọc. `tone="white"` cho nền đậm: thanh trắng, chấm trên trắng mờ 75%.
 * Không dùng Fragment trong <svg>: ogImage() render component này bằng satori, vốn chỉ nhận phần tử gốc của SVG.
 */
export function LogoMark({ size = 32, title, tone = 'color' }: { size?: number; title?: string; tone?: 'color' | 'white' }) {
  const white = tone === 'white'
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" {...(title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': true })}>
      {title ? <title>{title}</title> : null}
      <rect x="8" y="5" width="15" height="54" rx="7.5" fill={white ? BRAND_COLORS.white : BRAND_COLORS.navy} />
      <circle cx="40" cy="13" r="8" fill={white ? BRAND_COLORS.white : BRAND_COLORS.blue} fillOpacity={white ? 0.75 : 1} />
      <circle cx="35" cy="32" r="8" fill={BRAND_COLORS.teal} />
      <circle cx="40" cy="51" r="8" fill={BRAND_COLORS.coral} />
    </svg>
  )
}

/** Logo đủ (logo C và chữ EduFlow đậm 600 dạng path, không cần nạp font). */
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
