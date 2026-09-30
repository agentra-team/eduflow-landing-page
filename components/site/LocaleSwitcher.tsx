'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import type { ComponentProps } from 'react'
import { Link, usePathname } from '@/i18n/navigation'
import { routing, type Locale } from '@/i18n/routing'
import { track } from '@/lib/analytics'
import { cn } from '@/lib/cn'

type Href = ComponentProps<typeof Link>['href']

/** Chuyển VI/EN bằng link thật (bot theo được), giữ nguyên trang hiện tại (slug dịch theo locale). */
export function LocaleSwitcher({ className }: { className?: string }) {
  const locale = useLocale() as Locale
  const t = useTranslations('common')
  const pathname = usePathname()
  const params = useParams()
  const href = { pathname, params } as Href
  return (
    <div
      role="group"
      aria-label={t('language')}
      className={cn('inline-flex items-center gap-0.5 rounded-full border border-line bg-sidebar p-[3px]', className)}
    >
      {routing.locales.map((code) => {
        const on = code === locale
        return (
          <Link
            key={code}
            href={href}
            locale={code}
            hrefLang={code}
            aria-current={on ? 'true' : undefined}
            onClick={() => !on && track({ name: 'locale_switch', from: locale, to: code })}
            className={cn(
              'inline-flex h-11 items-center rounded-full px-3.5 md:h-[30px] md:px-2.5 text-[12.5px] font-bold tracking-[0.4px] transition-colors',
              on ? 'bg-card2 text-ink shadow-[0_1px_2px_rgba(0,0,0,0.08)]' : 'text-muted hover:text-ink',
            )}
          >
            {code.toUpperCase()}
          </Link>
        )
      })}
    </div>
  )
}
