import { FILLED_ICONS, ICONS, type IconName } from './icons'

type IconProps = {
  name: IconName
  size?: number
  className?: string
  strokeWidth?: number
  /** Có tên đọc được thì icon mang nghĩa; không có thì chỉ trang trí (aria-hidden). */
  title?: string
}

export function Icon({ name, size = 24, className, strokeWidth = 1.6, title }: IconProps) {
  const filled = FILLED_ICONS.has(name)
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke={filled ? 'none' : 'currentColor'}
      strokeWidth={filled ? undefined : strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...(title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': true })}
      dangerouslySetInnerHTML={{ __html: (title ? `<title>${title}</title>` : '') + ICONS[name] }}
    />
  )
}
