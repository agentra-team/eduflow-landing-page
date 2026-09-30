import { cn } from '@/lib/cn'

/** Logo EduFlow như trong app: ô vuông xanh bo góc với nét chữ E trắng (canvas app, khung 34 px, icon 17 px trên lưới 24). */
export function LogoMark({ size = 30, title }: { size?: number; title?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" fill="none" {...(title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': true })}>
      {title ? <title>{title}</title> : null}
      <rect width="34" height="34" rx="9" fill="#237A31" />
      <g transform="translate(8.5 8.5) scale(0.7083)" stroke="#FFFFFF" strokeWidth="3.1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19V5h10" />
        <path d="M4 12h8" />
        <path d="M4 19h12" />
      </g>
    </svg>
  )
}

/** Chữ EduFlow bằng Fraunces với gạch lime bên dưới. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex flex-col', className)}>
      <span className="font-display text-[19px] leading-none font-bold text-ink">EduFlow</span>
      <span className="mt-1.5 block h-0.5 w-9 bg-brand-light" aria-hidden="true" />
    </span>
  )
}
