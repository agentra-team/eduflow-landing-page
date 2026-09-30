import type { ComponentProps } from 'react'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/cn'
import { Icon } from './Icon'
import type { IconName } from './icons'

type Variant = 'primary' | 'secondary' | 'white' | 'ghost-white'
type Size = 'sm' | 'md' | 'lg'

const VARIANT: Record<Variant, string> = {
  primary: 'border-accent bg-accent text-white hover:bg-accent-strong hover:border-accent-strong',
  secondary: 'border-line bg-card text-ink hover:border-muted',
  white: 'border-white bg-white text-brand-deep hover:bg-page',
  'ghost-white': 'border-white/45 bg-transparent text-white hover:bg-white/10',
}
const SIZE: Record<Size, string> = {
  sm: 'h-10 px-4 text-sm',
  md: 'h-[46px] px-5 text-[15px]',
  lg: 'h-13 px-6 text-base',
}

export function buttonClasses(variant: Variant = 'primary', size: Size = 'md', full = false, className?: string) {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded-control border font-semibold leading-none whitespace-nowrap transition-colors',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
    VARIANT[variant],
    SIZE[size],
    full && 'w-full',
    className,
  )
}

type Common = {
  variant?: Variant
  size?: Size
  icon?: IconName
  iconAfter?: boolean
  full?: boolean
  className?: string
  children: React.ReactNode
}

function Inner({ icon, iconAfter, children }: Pick<Common, 'icon' | 'iconAfter' | 'children'>) {
  const ico = icon ? <Icon name={icon} size={20} /> : null
  return (
    <>
      {!iconAfter && ico}
      <span>{children}</span>
      {iconAfter && ico}
    </>
  )
}

/** Nút dẫn tới trang nội bộ (slug dịch theo locale). */
export function ButtonLink({
  href,
  variant,
  size,
  icon,
  iconAfter,
  full,
  className,
  children,
  ...rest
}: Common & { href: ComponentProps<typeof Link>['href'] } & Omit<ComponentProps<typeof Link>, 'href' | 'className' | 'children'>) {
  return (
    <Link href={href} className={buttonClasses(variant, size, full, className)} {...rest}>
      <Inner icon={icon} iconAfter={iconAfter}>
        {children}
      </Inner>
    </Link>
  )
}

/** Nút dẫn ra ngoài (tệp tải về, mailto, bản đồ). */
export function ButtonAnchor({
  variant,
  size,
  icon,
  iconAfter,
  full,
  className,
  children,
  ...rest
}: Common & Omit<ComponentProps<'a'>, 'className' | 'children'>) {
  return (
    <a className={buttonClasses(variant, size, full, className)} {...rest}>
      <Inner icon={icon} iconAfter={iconAfter}>
        {children}
      </Inner>
    </a>
  )
}

export function Button({
  variant,
  size,
  icon,
  iconAfter,
  full,
  className,
  children,
  ...rest
}: Common & Omit<ComponentProps<'button'>, 'className' | 'children'>) {
  return (
    <button type="button" className={buttonClasses(variant, size, full, className)} {...rest}>
      <Inner icon={icon} iconAfter={iconAfter}>
        {children}
      </Inner>
    </button>
  )
}
