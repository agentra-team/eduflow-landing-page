'use client'

import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { cn } from '@/lib/cn'

export const NAV_ITEMS = [
  { href: '/k12', key: 'k12' },
  { href: '/university', key: 'university' },
  { href: '/program', key: 'program' },
  { href: '/assistant', key: 'assistant' },
  { href: '/pricing', key: 'pricing' },
] as const

export function NavLinks({ onNavigate, className }: { onNavigate?: () => void; className?: string }) {
  const t = useTranslations('nav')
  const pathname = usePathname()
  return (
    <>
      {NAV_ITEMS.map(({ href, key }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'border-b-2 py-1.5 text-[15px] transition-colors',
              active ? 'border-accent font-semibold text-ink' : 'border-transparent font-normal text-ink2 hover:text-ink',
              className,
            )}
          >
            {t(key)}
          </Link>
        )
      })}
    </>
  )
}
