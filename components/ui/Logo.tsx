import Image from 'next/image'

/** Màu logo (Lockups.dc.html, AS-R1). Kế hoạch 2 đưa hai màu này vào token của site. */
export const BRAND_COLORS = { olive: '#567F2E', orange: '#F2A541' } as const

/**
 * Dấu hiệu EduFlow: mũ tốt nghiệp ghép chữ E, lưới 120 của Lockups.dc.html. `small` (mặc định khi ≤ 32 px) là bản rút gọn
 * của lockup: bỏ dây tua, hai thanh dày hơn, để còn đọc được ở cỡ nhỏ. `tone="white"` cho nền đậm (tua vẫn cam).
 * Không dùng Fragment trong <svg>: ogImage() render component này bằng satori, vốn chỉ nhận phần tử gốc của SVG.
 */
export function LogoMark({ size = 32, title, tone = 'color', small = size <= 32 }: { size?: number; title?: string; tone?: 'color' | 'white'; small?: boolean }) {
  const body = tone === 'white' ? '#FFFFFF' : BRAND_COLORS.olive
  const tassel = BRAND_COLORS.orange
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" {...(title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': true })}>
      {title ? <title>{title}</title> : null}
      <g fill={body}>
        <polygon points="60,12 112,34 60,56 8,34" />
        <polygon points="22,45 36,51 36,108 22,108" />
        {small ? <rect x="22" y="70" width="54" height="16" rx="2" /> : <rect x="22" y="72" width="52" height="13" rx="2" />}
        {small ? <rect x="22" y="92" width="72" height="16" rx="2" /> : <rect x="22" y="95" width="70" height="13" rx="2" />}
      </g>
      {!small && <path d="M60 34 L98 40 V64" fill="none" stroke={tassel} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}
      {!small && <circle cx="60" cy="34" r="4.5" fill={tassel} />}
      {small ? <rect x="93" y="58" width="12" height="20" rx="3" fill={tassel} /> : <rect x="93" y="62" width="10" height="17" rx="3" fill={tassel} />}
    </svg>
  )
}

/** Logo đủ (dấu hiệu và chữ EduFlow dạng path, không nạp font Sora). Tỷ lệ theo viewBox của tệp SVG (421 × 104). */
export function Logo({ height = 30, tone = 'color', priority = false }: { height?: number; tone?: 'color' | 'white'; priority?: boolean }) {
  const src = tone === 'white' ? '/brand/eduflow-wordmark-white.svg' : '/brand/eduflow-wordmark.svg'
  return <Image src={src} alt="EduFlow" width={Math.round((height * 421) / 104)} height={height} priority={priority} unoptimized />
}
